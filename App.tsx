
import React, { useState, useEffect } from 'react';
import { AppData, Pig, FeedRecord, SaleRecord, MiscRecord, PigStatus } from './types';
import Dashboard from './components/Dashboard';
import PigList from './components/PigList';
import FeedLogs from './components/FeedLogs';
import SalesTracker from './components/SalesTracker';
import MiscExpenses from './components/MiscExpenses';
import DebugMenu from './components/DebugMenu';
import RadialMenu from './components/RadialMenu';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pigs' | 'feed' | 'sales' | 'misc' | 'debug'>('dashboard');
  const [brandClicks, setBrandClicks] = useState(0);
  const [isDebugUnlocked, setIsDebugUnlocked] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIframe, setIsIframe] = useState(false);
  
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('piggery_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
            pigs: parsed.pigs || [],
            feedRecords: parsed.feedRecords || [],
            saleRecords: parsed.saleRecords || [],
            miscRecords: parsed.miscRecords || []
        };
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return { pigs: [], feedRecords: [], saleRecords: [], miscRecords: [] };
  });

  useEffect(() => {
    localStorage.setItem('piggery_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
    const checkStandalone = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches 
                    || (window.navigator as any).standalone;
      setIsStandalone(!!isPWA);
    };
    checkStandalone();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallApp = async () => {
    if (isIframe) {
      alert("Installation is blocked inside the previewer. Please click 'Open in Browser' first.");
      return;
    }
    if (!deferredPrompt) {
      alert("To install:\n\n1. iPhone/iPad: Tap Share -> 'Add to Home Screen'.\n2. Android: Tap menu -> 'Install App'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleBrandClick = () => {
    const nextCount = brandClicks + 1;
    setBrandClicks(nextCount);
    if (nextCount >= 4 && !isDebugUnlocked) {
      setIsDebugUnlocked(true);
      alert("System Menu Unlocked! (⚙️ icon added)");
    }
  };

  const handleAddPigs = (newPigs: Pig[]) => {
    setData(prev => ({ ...prev, pigs: [...prev.pigs, ...newPigs] }));
  };
  const handleUpdatePig = (updatedPig: Pig) => {
    setData(prev => ({
      ...prev,
      pigs: prev.pigs.map(p => p.id === updatedPig.id ? updatedPig : p)
    }));
  };
  const handleDeletePig = (id: string) => {
    setData(prev => ({
      ...prev,
      pigs: prev.pigs.filter(p => p.id !== id),
      saleRecords: prev.saleRecords.filter(s => s.pigId !== id)
    }));
  };
  const handleAddFeed = (record: FeedRecord) => {
    setData(prev => ({ ...prev, feedRecords: [...prev.feedRecords, record] }));
  };
  const handleUpdateFeed = (updatedRecord: FeedRecord) => {
    setData(prev => ({
      ...prev,
      feedRecords: prev.feedRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r)
    }));
  };
  const handleDeleteFeed = (id: string) => {
    setData(prev => ({ ...prev, feedRecords: prev.feedRecords.filter(r => r.id !== id) }));
  };
  const handleAddSale = (sale: SaleRecord) => {
    setData(prev => {
      const updatedPigs = prev.pigs.map(p => 
        p.id === sale.pigId ? { ...p, status: PigStatus.SOLD } : p
      );
      return {
        ...prev,
        pigs: updatedPigs,
        saleRecords: [...prev.saleRecords, sale]
      };
    });
  };
  const handleUpdateSale = (updatedSale: SaleRecord) => {
    setData(prev => ({
      ...prev,
      saleRecords: prev.saleRecords.map(s => s.id === updatedSale.id ? updatedSale : s)
    }));
  };
  const handleDeleteSale = (id: string, pigId: string) => {
    setData(prev => ({
      ...prev,
      pigs: prev.pigs.map(p => p.id === pigId ? { ...p, status: PigStatus.RAISING } : p),
      saleRecords: prev.saleRecords.filter(s => s.id !== id)
    }));
  };
  const handleAddMisc = (record: MiscRecord) => {
    setData(prev => ({ ...prev, miscRecords: [...prev.miscRecords, record] }));
  };
  const handleUpdateMisc = (record: MiscRecord) => {
    setData(prev => ({
      ...prev,
      miscRecords: prev.miscRecords.map(r => r.id === record.id ? record : r)
    }));
  };
  const handleDeleteMisc = (id: string) => {
    setData(prev => ({ ...prev, miscRecords: prev.miscRecords.filter(r => r.id !== id) }));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `piggery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm("This will replace all current data. Proceed?")) {
          setData({
            pigs: json.pigs || [],
            feedRecords: json.feedRecords || [],
            saleRecords: json.saleRecords || [],
            miscRecords: json.miscRecords || []
          });
          alert("Data imported successfully!");
        }
      } catch (error) {
        alert("Invalid file format. Please upload a valid PiggeryPro JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-slate-50 ${isStandalone ? 'pb-24' : 'pb-28'} lg:pb-0`}>
      <RadialMenu activeTab={activeTab} onTabChange={setActiveTab} showDebug={isDebugUnlocked} />

      <nav className="hidden lg:flex w-72 bg-white border-r border-slate-200 min-h-screen p-8 flex-col shrink-0">
        <div className="mb-12 cursor-pointer select-none" onClick={handleBrandClick}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-100">🐖</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">PiggeryPro</h1>
              <p className="text-[10px] text-emerald-600 mt-1 uppercase tracking-widest font-black">Enterprise Manager</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-1.5">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" icon="📊" />
          <NavItem active={activeTab === 'pigs'} onClick={() => setActiveTab('pigs')} label="Swine Registry" icon="🐖" />
          <NavItem active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label="Feed Inventory" icon="🌾" />
          <NavItem active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} label="Market Records" icon="💰" />
          <NavItem active={activeTab === 'misc'} onClick={() => setActiveTab('misc')} label="Expenses" icon="📦" />
          {isDebugUnlocked && <div className="pt-4 mt-4 border-t border-slate-100"><NavItem active={activeTab === 'debug'} onClick={() => setActiveTab('debug')} label="System Tools" icon="⚙️" /></div>}
        </div>

        <div className="mt-auto pt-8 text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
          <span>v1.5.0 Release</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
      </nav>

      {/* Ionic-style Header for Mobile */}
      <div className={`lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200 p-6 flex justify-between items-end sticky top-0 z-40 ${isStandalone ? 'pt-14' : ''}`}>
        <div>
          <h1 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-0.5" onClick={handleBrandClick}>PiggeryPro</h1>
          <h2 className="text-3xl font-black text-slate-900 capitalize">
            {activeTab === 'debug' ? 'System' : activeTab === 'misc' ? 'Expenses' : activeTab}
          </h2>
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'pigs' && <PigList pigs={data.pigs} onAdd={handleAddPigs} onDelete={handleDeletePig} onUpdate={handleUpdatePig} />}
          {activeTab === 'feed' && <FeedLogs records={data.feedRecords} onAdd={handleAddFeed} onUpdate={handleUpdateFeed} onDelete={handleDeleteFeed} />}
          {activeTab === 'sales' && <SalesTracker pigs={data.pigs} sales={data.saleRecords} onAddSale={handleAddSale} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} />}
          {activeTab === 'misc' && <MiscExpenses records={data.miscRecords} onAdd={handleAddMisc} onUpdate={handleUpdateMisc} onDelete={handleDeleteMisc} />}
          {activeTab === 'debug' && isDebugUnlocked && (
            <DebugMenu 
              data={data} 
              onDataLoaded={(d) => setData(d)} 
              onExport={handleExport}
              onImport={handleImport}
              onInstall={handleInstallApp}
              isIframe={isIframe}
              isStandalone={isStandalone}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; label: string; onClick: () => void; icon: string }> = ({ active, label, onClick, icon }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
      active 
      ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm shadow-emerald-100/50' 
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
