
import React, { useState, useEffect, useRef } from 'react';
import { initGoogleApi, signIn, saveToDrive, loadFromDrive, isPlaceholderId, getActiveClientId } from '../services/googleDriveService';

interface Props {
  data: any;
  onDataLoaded: (data: any) => void;
}

const GoogleSync: React.FC<Props> = ({ data, onDataLoaded }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-30));
  };

  useEffect(() => {
    if (!isPlaceholderId()) {
      addLog('Initializing Google API...');
      initGoogleApi()
        .then(() => {
          addLog('API Readiness: Ready.');
        })
        .catch(err => {
          addLog(`Init Error: ${err.message}`);
        });
    } else {
      addLog('Ready: Please set Client ID above to enable Cloud Sync.');
    }
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debugLogs]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      addLog('Opening Google Sign-in...');
      await signIn();
      setIsAuthenticated(true);
      addLog('Authentication Successful.');
    } catch (err: any) {
      const errorMsg = err.error || err.message || 'Authentication failed';
      addLog(`Error: ${errorMsg}`);
      
      if (isPlaceholderId()) {
        alert('Configuration Required: Please paste your Google Client ID into the "Configuration" card above.');
      } else {
        alert(`Failed to connect: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      addLog('Syncing to Drive...');
      await saveToDrive(data);
      setLastSynced(new Date().toLocaleTimeString());
      addLog('Cloud Sync Complete.');
      alert('Data successfully synced to Google Drive!');
    } catch (err: any) {
      addLog(`Save Error: ${err.message || 'Upload failed'}`);
      alert('Sync failed. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!window.confirm('WARNING: This will replace your local data with the cloud backup. Continue?')) return;
    try {
      setLoading(true);
      addLog('Downloading Backup...');
      const cloudData = await loadFromDrive();
      if (cloudData) {
        onDataLoaded(cloudData);
        addLog('Restore Complete.');
        alert('Data successfully restored from cloud!');
      } else {
        addLog('No backup file found in your Drive.');
        alert('No PiggeryPro backup was found on your Google Drive.');
      }
    } catch (err: any) {
      addLog(`Restore Error: ${err.message || 'Download failed'}`);
      alert('Failed to load from Drive.');
    } finally {
      setLoading(false);
    }
  };

  const placeholder = isPlaceholderId();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${placeholder ? 'bg-slate-700' : isAuthenticated ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drive Connection Status</h4>
        </div>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-tighter"
        >
          {showDebug ? 'Hide Logs' : 'Show Logs'}
        </button>
      </div>

      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-sm font-black transition-all active:scale-95 disabled:opacity-50 ${
            placeholder 
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
            : 'bg-white text-slate-900 shadow-xl'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill={placeholder ? "#4b5563" : "#4285F4"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill={placeholder ? "#4b5563" : "#34A853"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill={placeholder ? "#4b5563" : "#FBBC05"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill={placeholder ? "#4b5563" : "#EA4335"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'CONNECTING...' : 'AUTHORIZE CLOUD ACCESS'}
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
          >
            {loading ? 'SYNCING...' : 'BACKUP TO CLOUD'}
          </button>
          <button
            onClick={handleLoad}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-600 text-white py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-lg active:scale-95"
          >
            {loading ? 'RESTORING...' : 'LOAD FROM CLOUD'}
          </button>
          {lastSynced && (
            <div className="md:col-span-2 text-[10px] text-center text-slate-500 font-black uppercase tracking-widest bg-slate-800/50 p-2 rounded-lg">
              SYNC STATUS: SUCCESSFUL @ {lastSynced}
            </div>
          )}
        </div>
      )}

      {showDebug && (
        <div className="mt-4 p-5 bg-black/40 rounded-2xl border border-slate-700 font-mono text-[10px] text-emerald-400 overflow-y-auto max-h-48 shadow-inner backdrop-blur-md">
          <div className="mb-3 text-slate-500 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="font-black">ENGINE LOGS</span>
            <button onClick={() => setDebugLogs([])} className="bg-slate-800 px-2 py-0.5 rounded hover:text-white transition-colors">CLEAR</button>
          </div>
          <div className="space-y-1.5">
            {debugLogs.length === 0 && <div className="text-slate-700 italic">Listening for events...</div>}
            {debugLogs.map((log, i) => (
              <div key={i} className="leading-tight flex gap-3">
                <span className="text-emerald-900">•</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};

export default GoogleSync;
