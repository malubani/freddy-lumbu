import React from 'react';

type Tab = 'tariff' | 'bivac' | 'vehicle' | 'chatbot' | 'live-chat';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabButton: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  ariaControls: string;
}> = ({ label, icon, isActive, onClick, ariaControls }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-300 ${
        isActive
          ? 'bg-slate-800/50 border-cyan-400 text-cyan-400'
          : 'border-transparent text-slate-400 hover:bg-slate-800/25 hover:text-white'
      }`}
      role="tab"
      aria-selected={isActive}
      aria-controls={ariaControls}
    >
      <i className={`fas ${icon}`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-slate-700 flex flex-wrap" role="tablist">
      <TabButton
        label="Tariff Search"
        icon="fa-search"
        isActive={activeTab === 'tariff'}
        onClick={() => setActiveTab('tariff')}
        ariaControls="tariff-panel"
      />
      <TabButton
        label="BIVAC Check"
        icon="fa-file-shield"
        isActive={activeTab === 'bivac'}
        onClick={() => setActiveTab('bivac')}
        ariaControls="bivac-panel"
      />
      <TabButton
        label="Chassis Number Check"
        icon="fa-car"
        isActive={activeTab === 'vehicle'}
        onClick={() => setActiveTab('vehicle')}
        ariaControls="vehicle-panel"
      />
      <TabButton
        label="Chatbot"
        icon="fa-robot"
        isActive={activeTab === 'chatbot'}
        onClick={() => setActiveTab('chatbot')}
        ariaControls="chatbot-panel"
      />
       <TabButton
        label="Live Chat"
        icon="fa-microphone-alt"
        isActive={activeTab === 'live-chat'}
        onClick={() => setActiveTab('live-chat')}
        ariaControls="live-chat-panel"
      />
    </div>
  );
};

export default Tabs;