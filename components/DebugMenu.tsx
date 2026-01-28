
import React, { useRef, useState, useEffect } from 'react';
import GoogleSync from './GoogleSync';
import { getActiveClientId, isPlaceholderId } from '../services/googleDriveService';

interface Props {
  data: any;
  onDataLoaded: (data: any) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInstall: () => void;
  isIframe: boolean;
  isStandalone: boolean;
}

const DebugMenu: React.FC<Props> = ({ data, onDataLoaded, onExport, onImport, onInstall, isIframe, isStandalone }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientId, setClientId] = useState(getActiveClientId());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClientId = () => {
    localStorage.setItem('piggery_google_client_id', clientId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    // Force a reload of the app or state might be needed, but we'll let GoogleSync handle it
    window.location.reload(); 
  };

  const isCurrentIdPlaceholder = isPlaceholderId();

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Local Backup Section */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Disk Operations</h3>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center text-2xl text-indigo-600 shadow-inner">📁</div>
              <div>
                <h4 className="font-black text-slate-800 text-lg">Local Storage</h4>
                <p className="text-sm text-slate-500 font-medium">Manage data on this device.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={onExport}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>📥</span> Export Backup
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>📤</span> Import Backup
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={onImport} 
              />
            </div>
          </div>
        </section>

        {/* Configuration Section */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Configuration</h3>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner ${isCurrentIdPlaceholder ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {isCurrentIdPlaceholder ? '⚠️' : '🔑'}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-lg">Google Client ID</h4>
                <p className="text-sm text-slate-500 font-medium">Required for Cloud Sync.</p>
              </div>
            </div>

            <div className="space-y-3">
              <input 
                type="text"
                placeholder="Paste your OAuth Client ID here..."
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-xs"
              />
              <button 
                onClick={handleSaveClientId}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                  isSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                }`}
              >
                {isSaved ? 'CLIENT ID SAVED ✓' : 'SAVE CLIENT ID'}
              </button>
              {isCurrentIdPlaceholder && (
                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100">
                  Notice: You are using the default placeholder. Cloud sync will fail until you provide a real ID from Google Cloud Console.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Cloud Section */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cloud Synchronization</h3>
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-300">
          <GoogleSync data={data} onDataLoaded={onDataLoaded} />
        </div>
      </section>

      {/* Platform Info */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Environment</h3>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-4">
          {!isStandalone && (
             <button 
                onClick={onInstall}
                className="col-span-2 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl group hover:bg-emerald-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <span className="text-sm font-black text-emerald-900">Install as Native App</span>
                </div>
                <span className="text-[10px] font-black bg-white px-3 py-1 rounded-lg">INSTALL</span>
             </button>
          )}
          <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Environment</p>
            <p className="text-xs font-bold text-slate-700">{isStandalone ? 'NATIVE' : 'WEB'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Runtime</p>
            <p className="text-xs font-bold text-slate-700">{isIframe ? 'EMBEDDED' : 'STANDALONE'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DebugMenu;
