
import React, { useState } from 'react';
import { Pig, SaleRecord, PigStatus } from '../types';
import { CURRENCY } from '../constants';

interface Props {
  pigs: Pig[];
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onUpdateSale: (sale: SaleRecord) => void;
  onDeleteSale: (id: string, pigId: string) => void;
}

const SalesTracker: React.FC<Props> = ({ pigs, sales, onAddSale, onUpdateSale, onDeleteSale }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [saleMode, setSaleMode] = useState<'individual' | 'bulk'>('individual');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Single Sale State
  const [newSale, setNewSale] = useState<Partial<SaleRecord>>({
    pigId: '',
    saleDate: new Date().toISOString().split('T')[0],
    saleWeight: 0,
    salePricePerKg: 0,
    totalRevenue: 0
  });

  // Bulk Sale State
  const [selectedPigIds, setSelectedPigIds] = useState<string[]>([]);
  const [bulkTotalRevenue, setBulkTotalRevenue] = useState<number>(0);
  const [bulkTotalWeight, setBulkTotalWeight] = useState<number>(0);
  const [bulkSaleDate, setBulkSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handlePriceChange = (weight: number, pricePerKg: number) => {
    setNewSale({
      ...newSale,
      saleWeight: weight,
      salePricePerKg: pricePerKg,
      totalRevenue: weight * pricePerKg
    });
  };

  const togglePigSelection = (id: string) => {
    setSelectedPigIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleMode === 'individual') {
      if (!newSale.pigId) return;
      if (editingId) {
        onUpdateSale({ ...newSale, id: editingId } as SaleRecord);
        setEditingId(null);
      } else {
        onAddSale({ ...newSale, id: crypto.randomUUID() } as SaleRecord);
      }
    } else {
      // Bulk Sale Submission
      if (selectedPigIds.length === 0 || bulkTotalRevenue <= 0) return;
      
      const avgRevenue = bulkTotalRevenue / selectedPigIds.length;
      const avgWeight = bulkTotalWeight / selectedPigIds.length;
      const avgPricePerKg = bulkTotalWeight > 0 ? bulkTotalRevenue / bulkTotalWeight : 0;

      selectedPigIds.forEach(id => {
        onAddSale({
          id: crypto.randomUUID(),
          pigId: id,
          saleDate: bulkSaleDate,
          saleWeight: avgWeight,
          salePricePerKg: avgPricePerKg,
          totalRevenue: avgRevenue
        });
      });
    }
    
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setNewSale({
      pigId: '',
      saleDate: new Date().toISOString().split('T')[0],
      saleWeight: 0,
      salePricePerKg: 0,
      totalRevenue: 0
    });
    setSelectedPigIds([]);
    setBulkTotalRevenue(0);
    setBulkTotalWeight(0);
    setBulkSaleDate(new Date().toISOString().split('T')[0]);
    setSaleMode('individual');
  };

  const startEdit = (sale: SaleRecord) => {
    setSaleMode('individual');
    setEditingId(sale.id);
    setNewSale(sale);
    setIsAdding(true);
    setConfirmDeleteId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string, pigId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteSale(id, pigId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  const raisingPigs = pigs.filter(p => p.status === PigStatus.RAISING);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="hidden lg:block text-2xl font-black text-slate-800">Market Records</h2>
        <button 
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
            setEditingId(null);
            setConfirmDeleteId(null);
          }}
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 font-bold active:scale-95"
        >
          {isAdding ? 'Close Form' : (
            <><span className="text-xl">💰</span> Record New Sale</>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-2xl">🤝</div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{editingId ? 'Edit Sale' : 'Transaction Details'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Market Settlement Form</p>
              </div>
            </div>

            {!editingId && (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setSaleMode('individual')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${saleMode === 'individual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Individual
                </button>
                <button 
                  type="button"
                  onClick={() => setSaleMode('bulk')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${saleMode === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Bulk Sale
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {saleMode === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Pig</label>
                  <select 
                    required disabled={!!editingId}
                    className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 outline-none appearance-none disabled:opacity-50"
                    value={newSale.pigId}
                    onChange={e => setNewSale({...newSale, pigId: e.target.value})}
                  >
                    <option value="">Select a pig...</option>
                    {pigs.filter(p => p.status === PigStatus.RAISING || p.id === newSale.pigId).map(p => (
                      <option key={p.id} value={p.id}>{p.tagId} {p.status === PigStatus.SOLD ? '(Already Sold)' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Date</label>
                  <input required type="date" value={newSale.saleDate} onChange={e => setNewSale({...newSale, saleDate: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 outline-none" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Weight (kg)</label>
                  <input 
                    required type="number" step="any" inputMode="decimal" onFocus={handleFocus} 
                    value={newSale.saleWeight} 
                    onChange={e => handlePriceChange(Number(e.target.value), newSale.salePricePerKg || 0)} 
                    className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 outline-none" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Price per kg</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{CURRENCY}</span>
                    <input 
                      required type="number" step="any" inputMode="decimal" onFocus={handleFocus} 
                      value={newSale.salePricePerKg} 
                      onChange={e => handlePriceChange(newSale.saleWeight || 0, Number(e.target.value))} 
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-slate-800 outline-none" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Total Revenue</label>
                  <div className="px-6 py-3.5 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-700 text-xl shadow-inner">
                    {CURRENCY}{newSale.totalRevenue?.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              // Bulk Sale Layout
              <div className="space-y-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Group for Sale ({selectedPigIds.length} selected)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                    {raisingPigs.length === 0 ? (
                      <p className="col-span-full text-center text-slate-400 font-bold text-sm py-4">No active swine available for sale.</p>
                    ) : (
                      raisingPigs.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePigSelection(p.id)}
                          className={`px-4 py-3 rounded-xl font-black text-xs transition-all border-2 ${
                            selectedPigIds.includes(p.id) 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-95' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                          }`}
                        >
                          {p.tagId}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Group Revenue</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{CURRENCY}</span>
                      <input 
                        required type="number" step="any" inputMode="decimal" onFocus={handleFocus}
                        value={bulkTotalRevenue || ''}
                        onChange={e => setBulkTotalRevenue(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3.5 bg-blue-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-blue-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Group Weight (kg)</label>
                    <input 
                      type="number" step="any" inputMode="decimal" onFocus={handleFocus}
                      value={bulkTotalWeight || ''}
                      onChange={e => setBulkTotalWeight(Number(e.target.value))}
                      className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
                    <input required type="date" value={bulkSaleDate} onChange={e => setBulkSaleDate(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 outline-none" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm">
              {editingId ? 'Update Record' : saleMode === 'bulk' ? `Confirm Bulk Sale of ${selectedPigIds.length} Swine` : 'Confirm & Mark as Sold'}
            </button>
          </div>
        </form>
      )}

      {/* Sales Record List */}
      <div className="space-y-3">
        {sales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="text-5xl mb-4 opacity-30">💰</div>
            <p className="text-slate-400 font-bold tracking-tight">No market transactions recorded yet.</p>
          </div>
        ) : (
          [...sales].reverse().map(sale => {
            const pig = pigs.find(p => p.id === sale.pigId);
            return (
              <div key={sale.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between group transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-3xl">💹</div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 leading-none mb-1">{pig?.tagId || 'Unknown Swine'}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Sold on {new Date(sale.saleDate).toLocaleDateString()} • {sale.saleWeight.toFixed(1)}kg
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Net Revenue</p>
                    <p className="text-lg font-black text-emerald-600">{CURRENCY}{sale.totalRevenue.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(sale)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, sale.id, sale.pigId)} 
                      className={`p-3 rounded-xl transition-all ${
                        confirmDeleteId === sale.id ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      {confirmDeleteId === sale.id ? (
                        <span className="text-[10px] font-black tracking-widest uppercase">CONFIRM</span>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SalesTracker;
