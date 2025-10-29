import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Chatbot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a helpful and friendly assistant specializing in the Democratic Republic of Congo\'s customs, tariffs, and import/export procedures. Answer questions concisely and accurately based on the provided tariff schedule context.',
                },
            });
            setChat(newChat);
            setMessages([{
                role: 'model',
                content: 'Hello! How can I help you with DRC customs and tariffs today?'
            }]);
        };
        initChat();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of response) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = modelResponse;
                    return newMessages;
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div role="tabpanel" id="chatbot-panel" aria-labelledby="chatbot-tab" className="flex flex-col h-[70vh] bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-white/10">
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                            <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-lg bg-slate-700">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                    disabled={isLoading || !input.trim()}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
