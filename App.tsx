import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, CreditCard, LogOut, 
  Bot, User as UserIcon, Sparkles
} from 'lucide-react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TranscriptTool } from './components/TranscriptTool';
import { Pricing } from './components/Pricing';
import { User, ViewState, Transcript } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [transcripts, setTranscripts] = useState<Transcript[]>(() => {
    const saved = localStorage.getItem('transcriptPRO_data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transcriptPRO_data', JSON.stringify(transcripts));
  }, [transcripts]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleTranscriptGenerated = (t: Transcript) => {
    setTranscripts(prev => [t, ...prev]);
  };
  
  const handleUpgrade = (plan: 'PRO' | 'ENTERPRISE') => {
      if(user) {
          setUser({ ...user, plan });
      }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-slate-100 font-sans selection:bg-white/20 relative">
      
      {/* 
        GRID BACKGROUND IMPLEMENTATION 
        - Stronger in middle, fades to edges via radial mask
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* The Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]"></div>
        
        {/* The Mask to make it stronger in center and fade out */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] mask-radial-faded"></div>
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* 
        NAVBAR IMPLEMENTATION 
        - Layout: Logo (Left) | Links (Center) | Profile/Action (Right)
      */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-5xl p-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
          
          {/* LEFT: Logo */}
          <div className="flex items-center gap-3 pl-4">
             <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white fill-white" />
             </div>
             <span className="font-bold text-white tracking-wide text-sm hidden sm:block">TranscriptPRO</span>
          </div>
          
          {/* CENTER: Links */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            <button
              onClick={() => setCurrentView(ViewState.DASHBOARD)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${currentView === ViewState.DASHBOARD ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView(ViewState.TOOL)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${currentView === ViewState.TOOL ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Generate
            </button>
            <button
              onClick={() => setCurrentView(ViewState.PRICING)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${currentView === ViewState.PRICING ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              Plans
            </button>
          </div>
          
          {/* RIGHT: Profile / Logout */}
          <div className="flex items-center gap-3 pr-2">
            <div className="hidden md:block text-right">
              <p className="text-xs font-medium text-white">{user.email.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.plan} PLAN</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 pt-24">
        <div className="container mx-auto px-4">
           {currentView === ViewState.DASHBOARD && <Dashboard transcripts={transcripts} />}
           {currentView === ViewState.TOOL && <TranscriptTool onTranscriptGenerated={handleTranscriptGenerated} />}
           {currentView === ViewState.PRICING && <Pricing user={user} onUpgrade={handleUpgrade} />}
        </div>
      </main>

    </div>
  );
};

export default App;