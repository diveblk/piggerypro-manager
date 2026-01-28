
import React, { useState, useMemo } from 'react';
import { Pig, PigStatus } from '../types';
import { CURRENCY } from '../constants';

interface Props {
  pigs: Pig[];
  onAdd: (pigs: Pig[]) => void;
  onUpdate: (pig: Pig) => void;
  onDelete: (id: string) => void;
}

const PigList: React.FC<Props> = ({ pigs, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Filtering and Sorting State
  const [statusFilter, setStatusFilter] = useState<PigStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [newPig, setNewPig] = useState<Partial<Pig>>({
    tagId: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    initialWeight: 0,
    purchaseCost: 0,
    status: PigStatus.RAISING,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPig.tagId) return;
    
    if (editingId) {
      onUpdate({ ...newPig, id: editingId } as Pig);
      setEditingId(null);
    } else {
      const batch: Pig[] = [];
      for (let i = 0; i < quantity; i++) {
        const finalTagId = quantity > 1 ? `${newPig.tagId}-${i + 1}` : newPig.tagId;
        batch.push({
          ...newPig,
          tagId: finalTagId,
          id: crypto.randomUUID(),
        } as Pig);
      }
      onAdd(batch);
    }
    
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setQuantity(1);
    setNewPig({
      tagId: '',
      dateOfBirth: new Date().toISOString().split('T')[0],
      initialWeight: 0,
      purchaseCost: 0,
      status: PigStatus.RAISING,
    });
  };

  const startEdit = (pig: Pig) => {
    setEditingId(pig.id);
    setNewPig(pig);
    setIsAdding(true);
    setConfirmDeleteId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  // Memoized Filtered and Sorted Pigs
  const displayPigs = useMemo(() => {
    let result = [...pigs];

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Sort by birth date
    result.sort((a, b) => {
      const dateA = new Date(a.dateOfBirth).getTime();
      const dateB = new Date(b.dateOfBirth).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [pigs, statusFilter, sortOrder]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="hidden lg:block text-2xl font-black text-slate-800">Swine Registry</h2>
        <button 
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
            setEditingId(null);
            setConfirmDeleteId(null);
          }}
          className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 font-bold active:scale-95"
        >
          {isAdding ? 'Close Form' : (
            <><span className="text-xl">➕</span> Add New Swine</>
          )}
        </button>
      </div>

      {/* Filter and Sort Bar */}
      {!isAdding && (
        <div className="bg-white p-4 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {(['ALL', PigStatus.RAISING, PigStatus.SOLD, PigStatus.DECEASED] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  statusFilter === status 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-0 pt-4 md:pt-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-700 uppercase tracking-widest"
            >
              {sortOrder === 'newest' ? 'Newest First 📉' : 'Oldest First 📈'}
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-50 rounded-2xl text-2xl">📝</div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{editingId ? 'Edit Pig Details' : 'Registration Form'}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Physical & Financial Profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormGroup label="Tag ID / Name" required>
              <input 
                required type="text" placeholder="e.g. S-101"
                value={newPig.tagId}
                onChange={e => setNewPig({...newPig, tagId: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
              />
            </FormGroup>

            <FormGroup label="Purchase Cost (PHP)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{CURRENCY}</span>
                <input 
                  type="number" step="any" inputMode="decimal" onFocus={handleFocus}
                  value={newPig.purchaseCost || ''}
                  onChange={e => setNewPig({...newPig, purchaseCost: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-slate-800 outline-none"
                />
              </div>
            </FormGroup>

            <FormGroup label="Birth Date" required>
              <input 
                required type="date"
                value={newPig.dateOfBirth}
                onChange={e => setNewPig({...newPig, dateOfBirth: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 outline-none"
              />
            </FormGroup>

            <FormGroup label="Initial Weight (kg)" required>
              <input 
                required type="number" step="any" inputMode="decimal" onFocus={handleFocus}
                value={newPig.initialWeight}
                onChange={e => setNewPig({...newPig, initialWeight: Number(e.target.value)})}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 outline-none"
              />
            </FormGroup>

            <FormGroup label="Health Status">
              <select 
                value={newPig.status}
                onChange={e => setNewPig({...newPig, status: e.target.value as PigStatus})}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 outline-none appearance-none"
              >
                <option value={PigStatus.RAISING}>RAISING</option>
                <option value={PigStatus.SOLD}>SOLD</option>
                <option value={PigStatus.DECEASED}>DECEASED</option>
              </select>
            </FormGroup>

            {!editingId && (
              <FormGroup label="Batch Quantity">
                <input 
                  type="number" min="1" max="50" inputMode="numeric"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3.5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-emerald-700 outline-none"
                />
              </FormGroup>
            )}
          </div>

          <div className="mt-10 flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-[1.5rem] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest text-sm">
              {editingId ? 'Update Swine' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      )}

      {/* List display */}
      <div className="space-y-3">
        {displayPigs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="text-5xl mb-4 opacity-30">🐖</div>
            <p className="text-slate-400 font-bold tracking-tight">
              {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} swine found.` : 'Your herd is currently empty.'}
            </p>
          </div>
        ) : (
          displayPigs.map(pig => (
            <div key={pig.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between group transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-100 animate-in fade-in duration-300">
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:bg-emerald-50 transition-colors">🐷</div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 leading-none mb-1">{pig.tagId}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Born: {new Date(pig.dateOfBirth).toLocaleDateString()} • {pig.initialWeight}kg
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                      pig.status === PigStatus.RAISING ? 'bg-emerald-100 text-emerald-700' : 
                      pig.status === PigStatus.SOLD ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {pig.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Initial Cost</p>
                  <p className="text-lg font-black text-slate-800">{CURRENCY}{pig.purchaseCost?.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(pig)} className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, pig.id)}
                    className={`p-3 rounded-xl transition-all ${
                      confirmDeleteId === pig.id ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {confirmDeleteId === pig.id ? (
                      <span className="text-[10px] font-black tracking-widest uppercase">CONFIRM</span>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

export default PigList;
