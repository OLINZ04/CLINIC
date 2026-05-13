import React from 'react';
import { Pill, Users, AlertCircle, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
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

  const lowStock = medicines.filter(m => m.stock < 10);
  const recentPatients = patients.slice(0, 7);

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
    </div>
    <div className="h-64 bg-slate-200 rounded-xl" />
  </div>;

  return (
    <div className="space-y-6">
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
