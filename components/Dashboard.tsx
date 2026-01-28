
import React, { useMemo } from 'react';
import { AppData, PigStatus } from '../types';
import { CURRENCY } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: AppData;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const stats = useMemo(() => {
    const totalPigs = data.pigs.length;
    const activePigs = data.pigs.filter(p => p.status === PigStatus.RAISING).length;
    const soldPigs = data.pigs.filter(p => p.status === PigStatus.SOLD).length;
    
    const totalFeedCost = data.feedRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalPurchaseCost = data.pigs.reduce((sum, p) => sum + (p.purchaseCost || 0), 0);
    const totalMiscCost = data.miscRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalRevenue = data.saleRecords.reduce((sum, r) => sum + r.totalRevenue, 0);
    
    const totalExpenses = totalFeedCost + totalPurchaseCost + totalMiscCost;
    const netProfit = totalRevenue - totalExpenses;

    const sortedFeed = [...data.feedRecords].sort((a, b) => new Date(a.datePurchased).getTime() - new Date(b.datePurchased).getTime());
    let avgDailyCost = 0;
    if (sortedFeed.length > 1) {
      const firstDate = new Date(sortedFeed[0].datePurchased);
      const lastDate = new Date(sortedFeed[sortedFeed.length - 1].datePurchased);
      const diffDays = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      avgDailyCost = totalFeedCost / diffDays;
    }

    return { totalPigs, activePigs, soldPigs, totalFeedCost, totalPurchaseCost, totalMiscCost, totalRevenue, netProfit, avgDailyCost, totalExpenses };
  }, [data]);

  const chartData = [
    { name: 'Expenses', value: stats.totalExpenses, fill: '#f43f5e' },
    { name: 'Revenue', value: stats.totalRevenue, fill: '#10b981' },
    { name: 'Net Profit', value: stats.netProfit, fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-8">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Herd" value={stats.activePigs.toString()} color="text-slate-900" bg="bg-white" />
        <StatCard title="Expenses" value={`${CURRENCY}${stats.totalExpenses.toLocaleString()}`} color="text-rose-600" bg="bg-white" />
        <StatCard title="Revenue" value={`${CURRENCY}${stats.totalRevenue.toLocaleString()}`} color="text-emerald-600" bg="bg-white" />
        <StatCard 
          title="Net Position" 
          value={`${CURRENCY}${stats.netProfit.toLocaleString()}`} 
          color={stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'} 
          bg="bg-white"
          highlight={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Financial Performance</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle P&L Tracking</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-xl">💸</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[14, 14, 14, 14]} barSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Efficiency KPIs</h3>
            <div className="space-y-6">
              <MetricItem icon="🌾" label="Avg Daily Feed" value={`${CURRENCY}${stats.avgDailyCost.toFixed(0)}`} color="text-emerald-400" />
              <MetricItem icon="📦" label="Misc Burn" value={`${CURRENCY}${stats.totalMiscCost.toLocaleString()}`} color="text-indigo-400" />
              <MetricItem icon="📈" label="Sell Through" value={`${stats.totalPigs > 0 ? ((stats.soldPigs / stats.totalPigs) * 100).toFixed(0) : 0}%`} color="text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">📊</div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Herd Size</p>
                <p className="text-xl font-black text-slate-800">{stats.totalPigs} Total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Profit Margin</p>
              <p className="text-xl font-black text-emerald-600">
                {stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricItem: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between group cursor-default">
    <div className="flex items-center gap-4">
      <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-lg font-black ${color}`}>{value}</span>
  </div>
);

const StatCard: React.FC<{ title: string; value: string; color: string; bg: string; highlight?: boolean }> = ({ title, value, color, bg, highlight }) => (
  <div className={`${bg} p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between h-32 ${highlight ? 'ring-2 ring-blue-100 ring-offset-4 ring-offset-slate-50' : ''}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
    <p className={`text-2xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

export default Dashboard;
