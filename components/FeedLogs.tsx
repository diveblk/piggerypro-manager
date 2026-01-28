
import React, { useState } from 'react';
import { FeedRecord } from '../types';
import { CURRENCY } from '../constants';

interface Props {
  records: FeedRecord[];
  onAdd: (record: FeedRecord) => void;
  onUpdate: (record: FeedRecord) => void;
  onDelete: (id: string) => void;
}

const FeedLogs: React.FC<Props> = ({ records, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<FeedRecord>>({
    datePurchased: new Date().toISOString().split('T')[0],
    cost: 0,
    amountKg: 0,
    feedType: 'Starter',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...newRecord, id: editingId } as FeedRecord);
      setEditingId(null);
    } else {
      onAdd({ ...newRecord, id: crypto.randomUUID() } as FeedRecord);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setNewRecord({
      datePurchased: new Date().toISOString().split('T')[0],
      cost: 0,
      amountKg: 0,
      feedType: 'Starter',
    });
  };

  const startEdit = (record: FeedRecord) => {
    setEditingId(record.id);
    setNewRecord(record);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Feed Expenses</h2>
        <button 
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
            setEditingId(null);
            setConfirmDeleteId(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform"
        >
          {isAdding ? 'Cancel' : 'Log Feed Purchase'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Feed Record' : 'Log New Purchase'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Purchased</label>
              <input 
                required type="date" value={newRecord.datePurchased}
                onChange={e => setNewRecord({...newRecord, datePurchased: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost (PHP)</label>
              <input 
                required 
                type="number" 
                step="any"
                inputMode="decimal"
                onFocus={handleFocus} 
                value={newRecord.cost}
                onChange={e => setNewRecord({...newRecord, cost: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (kg)</label>
              <input 
                required 
                type="number" 
                step="any"
                inputMode="decimal"
                onFocus={handleFocus} 
                value={newRecord.amountKg}
                onChange={e => setNewRecord({...newRecord, amountKg: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Feed Type</label>
              <select 
                value={newRecord.feedType}
                onChange={e => setNewRecord({...newRecord, feedType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              >
                <option>Pre-starter</option>
                <option>Starter</option>
                <option>Grower</option>
                <option>Finisher</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold active:scale-95 transition-transform">
            {editingId ? 'Update Record' : 'Save Expense'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.length === 0 ? (
          <div className="col-span-full text-center p-10 text-slate-400">No feed logs recorded.</div>
        ) : (
          [...records].reverse().map(record => (
            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">{record.feedType}</span>
                <span className="text-xs text-slate-400">{new Date(record.datePurchased).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-lg font-bold text-slate-800">{CURRENCY}{record.cost.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{record.amountKg} kg ({CURRENCY}{(record.cost / record.amountKg).toFixed(2)}/kg)</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => startEdit(record)} className="text-emerald-600 text-xs font-bold underline decoration-2 underline-offset-2">Edit</button>
                  <button 
                    onClick={(e) => handleDelete(e, record.id)} 
                    className={`text-xs font-bold transition-all min-w-[60px] ${confirmDeleteId === record.id ? 'text-white bg-red-500 px-2 py-0.5 rounded animate-pulse' : 'text-red-400 underline decoration-2 underline-offset-2'}`}
                  >
                    {confirmDeleteId === record.id ? 'CONFIRM' : 'Delete'}
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

export default FeedLogs;
