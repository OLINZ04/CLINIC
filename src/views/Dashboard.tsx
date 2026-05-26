import React from 'react';
import { Pill, Users, AlertCircle, ShoppingBag, TrendingUp, Clock, X, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useClinicData } from '../hooks/useClinicData';
import { Card, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, trend, onClick }: { title: string, value: number | string, icon: any, color: string, trend?: { label: string, color: string }, onClick?: () => void }) => (
  <Card className="p-4 border border-slate-200 shadow-sm">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
    <div className="flex items-end gap-2">
      <span className={cn("text-2xl font-black tracking-tight", color)}>{value}</span>
      {trend && <span onClick={onClick} className={cn("text-[10px] font-bold mb-1 underline cursor-pointer", trend.color)}>{trend.label}</span>}
    </div>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { medicines, patients, prescriptions, loading } = useClinicData();

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Configurable alert threshold (default 5)
  const [threshold, setThreshold] = React.useState<number>(() => {
    const saved = localStorage.getItem('low_stock_threshold');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [isAlertDismissed, setIsAlertDismissed] = React.useState(false);
  const [toast, setToast] = React.useState<{ id: string; message: string } | null>(null);

  const belowThresholdMeds = medicines.filter(m => m.stock < threshold);
  const lowMedsCount = belowThresholdMeds.length;

  // Auto-trigger dynamic toast notification when threshold changes or low stock is detected
  React.useEffect(() => {
    if (lowMedsCount > 0 && !loading) {
      setToast({
        id: Math.random().toString(),
        message: `Alert: ${lowMedsCount} medicine(s) are running below your threshold of ${threshold} units.`
      });
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [threshold, lowMedsCount, loading]);

  const handleThresholdChange = (val: number) => {
    const newVal = Math.max(0, val);
    setThreshold(newVal);
    localStorage.setItem('low_stock_threshold', newVal.toString());
    setIsAlertDismissed(false); // Reset dismissal on config change
  };

  const lowStock = medicines.filter(m => m.stock < 10);
  const recentPatients = patients.slice(0, 7);

  // Parse inventory category data
  const categoryDataMap: Record<string, number> = {};
  medicines.forEach(m => {
    const cat = m.category || 'Other';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + m.stock;
  });

  const totalStock = Object.values(categoryDataMap).reduce((a, b) => a + b, 0);

  const colors = [
    '#0d9488', // Core Teal
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Medical Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899'  // Pink
  ];

  const chartData = Object.entries(categoryDataMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalStock > 0 ? (value / totalStock) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  // Pre-calculate modern donut segments:
  let accumulatedPercent = 0;
  const slices = chartData.map((slice, idx) => {
    const startX = Math.cos(2 * Math.PI * accumulatedPercent - Math.PI / 2);
    const startY = Math.sin(2 * Math.PI * accumulatedPercent - Math.PI / 2);
    accumulatedPercent += slice.percentage / 100;
    const endX = Math.cos(2 * Math.PI * accumulatedPercent - Math.PI / 2);
    const endY = Math.sin(2 * Math.PI * accumulatedPercent - Math.PI / 2);

    const largeArcFlag = slice.percentage > 50 ? 1 : 0;

    // Standard high precision path from center (0,0) to start, then arc, back to center
    const pathData = slice.percentage >= 99.9
      ? `M 0 -0.999 A 0.999 0.999 0 1 1 -0.001 -0.999 Z`
      : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return {
      ...slice,
      pathData,
      color: colors[idx % colors.length]
    };
  });

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
    </div>
    <div className="h-64 bg-slate-200 rounded-xl" />
  </div>;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification overlay */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex gap-3 items-center animate-[slide-up_0.2s_ease-out]">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase leading-none">Critical Stock Alert</p>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug font-medium">{toast.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subtle Low Stock Alert Banner & Configurator */}
      {belowThresholdMeds.length > 0 && !isAlertDismissed && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-amber-950 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    Low Stock Alert Threshold Reached
                  </h4>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                    {belowThresholdMeds.length} items low
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  The following inventories are below your threshold of{' '}
                  <span className="font-bold underline text-amber-800 font-mono">{threshold} units</span>:{' '}
                  {belowThresholdMeds.slice(0, 4).map((m, i) => (
                    <span key={m.id}>
                      <span className="font-bold text-slate-900 hover:underline cursor-pointer" onClick={() => navigate(`/medicines?search=${m.name}`)}>
                        {m.name}
                      </span>
                      <span className="text-red-600 font-extrabold font-mono text-[10px]"> ({m.stock})</span>
                      {i < Math.min(4, belowThresholdMeds.length) - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {belowThresholdMeds.length > 4 && (
                    <span className="text-slate-500 font-medium whitespace-nowrap"> and {belowThresholdMeds.length - 4} more...</span>
                  )}
                </p>
              </div>
            </div>

            {/* Threshold Configurator */}
            <div className="flex items-center gap-3 self-end md:self-center bg-white border border-slate-200/50 p-1 rounded-xl shadow-sm shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                Alert Limit:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleThresholdChange(threshold - 1)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center transition-colors active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 0)}
                  className="w-9 h-6 border border-slate-100 rounded text-center text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => handleThresholdChange(threshold + 1)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertDismissed(true)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors mr-1"
                title="Dismiss Alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Medicine Stock" 
          value={medicines.reduce((acc, m) => acc + m.stock, 0).toLocaleString()} 
          icon={Pill} 
          color="text-slate-900" 
          trend={{ label: "+12 Today", color: "text-green-500" }}
          onClick={() => navigate('/medicines')}
        />
        <StatCard 
          title="Registered Patients" 
          value={patients.length} 
          icon={Users} 
          color="text-slate-900" 
          trend={{ label: "Active", color: "text-slate-400" }}
          onClick={() => navigate('/patients')}
        />
        <StatCard 
          title="Visits Today" 
          value={patients.filter(p => p.dateVisit?.toDate && format(p.dateVisit.toDate(), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length} 
          icon={Clock} 
          color="text-blue-600" 
          trend={{ label: "Peak Hour", color: "text-orange-500" }}
          onClick={() => navigate('/patients')}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStock.length} 
          icon={AlertCircle} 
          color="text-red-700" 
          trend={{ label: "Restock Now", color: "text-red-600" }}
          onClick={() => navigate('/medicines')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table */}
        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Recent Patient Visits</h2>
            <Link to="/patients" className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold hover:bg-slate-300 no-underline text-slate-800">VIEW ALL</Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 py-2.5">Patient Name</th>
                  <th className="px-5 py-2.5">Dept</th>
                  <th className="px-5 py-2.5">Complaint</th>
                  <th className="px-5 py-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-slate-50">
                {recentPatients.length > 0 ? recentPatients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/patients?search=${p.fullname}`)}>
                    <td className="px-5 py-3 font-semibold text-slate-800">{p.fullname}</td>
                    <td className="px-5 py-3 text-slate-500">{p.department}</td>
                    <td className="px-5 py-3 italic text-slate-600 truncate max-w-[150px]">{p.complaint}</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-400">
                      {p.dateVisit?.toDate ? format(p.dateVisit.toDate(), 'HH:mm a') : '--:--'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-400">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Inventory Distribution Pie Chart */}
          <Card className="flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Inventory Analytics</h2>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-5 flex flex-col items-center">
              {chartData.length > 0 ? (
                <>
                  {/* Donut Container */}
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                      {slices.map((slice, idx) => (
                        <path
                          key={slice.name}
                          d={slice.pathData}
                          fill={slice.color}
                          className="transition-all duration-300 cursor-pointer origin-center"
                          style={{
                            transform: hoveredIndex === idx ? 'scale(1.06)' : 'scale(1)',
                            opacity: hoveredIndex !== null && hoveredIndex !== idx ? 0.6 : 1
                          }}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      ))}
                      {/* Donut Hole */}
                      <circle cx="0" cy="0" r="0.65" fill="#ffffff" />
                    </svg>

                    {/* Centered text in internal hole */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                      {hoveredIndex !== null ? (
                        <>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                            {chartData[hoveredIndex].name}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {chartData[hoveredIndex].value.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-semibold text-teal-600 bg-teal-50 px-1 py-0.5 rounded-md mt-0.5">
                            {chartData[hoveredIndex].percentage.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Total Stock
                          </span>
                          <span className="text-xl font-black text-slate-950 leading-none">
                            {totalStock.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1.5 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            {chartData.length} Categories
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* List/Legend */}
                  <div className="mt-5 w-full space-y-2 max-h-40 overflow-y-auto pr-1">
                    {slices.map((slice, idx) => (
                      <div 
                        key={slice.name}
                        onClick={() => navigate(`/medicines?search=${slice.name}`)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all duration-150",
                          hoveredIndex === idx 
                            ? "bg-slate-50 border-teal-500/20 shadow-sm" 
                            : "bg-white border-transparent hover:bg-slate-50/60"
                        )}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                          <span className="font-semibold text-slate-800 truncate">{slice.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-400 font-bold">{slice.percentage.toFixed(1)}%</span>
                          <span className="text-slate-900 font-bold bg-slate-100 rounded px-1.5 py-0.5">{slice.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No medicine stock data available.
                </div>
              )}
            </div>
          </Card>

          {/* Inventory Alerts */}
          <Card className="flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Inventory Alerts</h2>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="p-0 flex flex-col divide-y divide-slate-100">
              {lowStock.slice(0, 3).map(m => (
                <div key={m.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{m.name}</p>
                    <p className="text-[10px] text-red-500 font-medium italic">Only {m.stock} units left</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] h-6 px-2 font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100"
                    onClick={() => navigate(`/medicines?search=${m.name}`)}
                  >
                    RESTOCK
                  </Button>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs italic">All stock levels healthy</div>
              )}
            </div>
          </Card>

          {/* Quick Action */}
          <Card className="bg-blue-600 p-5 text-white shadow-lg shadow-blue-100 border-none">
            <h3 className="text-sm font-bold mb-3">Medication Issuance</h3>
            <p className="text-[11px] text-blue-100 mb-4 leading-relaxed">Select a patient and the medicine to auto-deduct stock levels from the central inventory.</p>
            <div className="space-y-3">
              <Link 
                to="/prescriptions" 
                className="w-full py-2 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center no-underline hover:bg-slate-50 transition-colors"
              >
                Open Dispenser Module
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
