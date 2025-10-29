import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import ErrorMessage from './ErrorMessage';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Helper Functions ---

type Transcription = { role: 'user' | 'model', text: string };

const LiveChat: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'requesting' | 'connecting' | 'connected' | 'error'>('idle');
    const [transcript, setTranscript] = useState<Transcription[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    
    const stopConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();

        sessionPromiseRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        scriptProcessorRef.current = null;
        outputAudioContextRef.current = null;
        nextStartTimeRef.current = 0;

        setStatus('idle');
    }, []);

    useEffect(() => {
        return () => {
           // Cleanup on component unmount
           stopConversation();
        }
    }, [stopConversation]);

    const startConversation = useCallback(async () => {
        setStatus('requesting');
        setError(null);
        setTranscript([]);

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            setStatus('connecting');

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
                        const source = inputAudioContext.createMediaStreamSource(mediaStreamRef.current!);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                       if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        } else if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscript(prev => [...prev, 
                                { role: 'user', text: currentInputTranscription.trim() },
                                { role: 'model', text: currentOutputTranscription.trim() }
                            ]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64EncodedAudioString && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            let nextStartTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); });
                            source.start(nextStartTime);
                            nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of audioSourcesRef.current.values()) {
                                source.stop();
                                audioSourcesRef.current.delete(source);
                            }
                           nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`An error occurred: ${e.message}`);
                        stopConversation();
                    },
                    onclose: () => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a helpful and friendly assistant specialized in the Democratic Republic of Congo\'s customs and tariffs.',
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

        } catch (err) {
            setError('Could not get microphone access. Please allow microphone permissions.');
            console.error(err);
            setStatus('error');
        }
    }, [stopConversation]);

    const toggleConversation = status === 'connected' || status === 'connecting' ? stopConversation : startConversation;
    const buttonText = status === 'connected' ? 'Stop Conversation' : status === 'connecting' ? 'Connecting...' : 'Start Conversation';

    return (
        <div role="tabpanel" id="live-chat-panel" aria-labelledby="live-chat-tab" className="bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-white/10 p-6">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl font-semibold text-slate-200">Live Voice Chat</h2>
                 <p className="text-slate-400 text-center max-w-2xl">
                    Click "Start Conversation" and speak into your microphone to have a real-time voice conversation with the DRC Tariff Assistant.
                </p>
                <button
                    onClick={toggleConversation}
                    disabled={status === 'connecting' || status === 'requesting'}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center gap-3 disabled:cursor-not-allowed ${
                        status === 'connected' ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'
                    } disabled:opacity-70`}
                >
                    {status === 'connecting' && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    <i className={`fas ${status === 'connected' ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                    {buttonText}
                </button>
                 {error && <ErrorMessage message={error} />}
            </div>

            <div className="mt-6 h-[40vh] bg-slate-900/50 rounded-lg p-4 overflow-y-auto space-y-4">
                {transcript.length === 0 && status !== 'connected' && <p className="text-slate-500 text-center">Conversation transcript will appear here...</p>}
                {transcript.map((t, i) => (
                    <div key={i} className={`p-3 rounded-lg ${t.role === 'user' ? 'bg-slate-700' : 'bg-cyan-900/50'}`}>
                        <p className={`font-bold capitalize ${t.role === 'user' ? 'text-cyan-400' : 'text-amber-400'}`}>{t.role}</p>
                        <p className="text-white mt-1">{t.text}</p>
                    </div>
                ))}
                {status === 'connected' && <div className="text-center text-green-400 font-semibold animate-pulse">Listening...</div>}
            </div>
        </div>
    );
};

export default LiveChat;
