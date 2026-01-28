
import React, { useState } from 'react';
import { MiscRecord } from '../types';
import { CURRENCY } from '../constants';

interface Props {
  records: MiscRecord[];
  onAdd: (record: MiscRecord) => void;
  onUpdate: (record: MiscRecord) => void;
  onDelete: (id: string) => void;
}

const MiscExpenses: React.FC<Props> = ({ records, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<MiscRecord>>({
    date: new Date().toISOString().split('T')[0],
    item: '',
    cost: 0,
    category: 'Equipment',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.item) return;

    if (editingId) {
      onUpdate({ ...newRecord, id: editingId } as MiscRecord);
      setEditingId(null);
    } else {
      onAdd({ ...newRecord, id: crypto.randomUUID() } as MiscRecord);
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      item: '',
      cost: 0,
      category: 'Equipment',
    });
  };

  const startEdit = (record: MiscRecord) => {
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
        <h2 className="text-xl font-bold text-slate-800">Miscellaneous Expenses</h2>
        <button 
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
            setEditingId(null);
            setConfirmDeleteId(null);
          }}
          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-transform active:scale-95 shadow-sm"
        >
          {isAdding ? 'Cancel' : 'Add Other Expense'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Misc Item' : 'New Miscellaneous Expense'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                required type="date" value={newRecord.date}
                onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Description</label>
              <input 
                required type="text" placeholder="e.g. Repairs, Water bill"
                value={newRecord.item}
                onChange={e => setNewRecord({...newRecord, item: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
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
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={newRecord.category}
                onChange={e => setNewRecord({...newRecord, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option>Equipment</option>
                <option>Utilities</option>
                <option>Medicine</option>
                <option>Maintenance</option>
                <option>Labor</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-slate-800 text-white px-8 py-2 rounded-lg font-bold active:scale-95 transition-transform shadow-md">
            {editingId ? 'Update Record' : 'Save Expense'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Item</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Cost</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No miscellaneous expenses recorded.</td></tr>
              ) : (
                [...records].reverse().map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{record.item}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{CURRENCY}{record.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button onClick={() => startEdit(record)} className="text-slate-500 hover:text-slate-800 font-bold text-sm underline underline-offset-2">Edit</button>
                        <button 
                          onClick={(e) => handleDelete(e, record.id)} 
                          className={`text-sm font-bold min-w-[80px] px-2 py-1 rounded-lg transition-all ${
                            confirmDeleteId === record.id ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-red-400 hover:text-red-600'
                          }`}
                        >
                          {confirmDeleteId === record.id ? 'CONFIRM' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MiscExpenses;
