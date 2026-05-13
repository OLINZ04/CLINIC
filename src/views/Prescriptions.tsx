import React, { useState } from 'react';
import { FileText, Plus, Search, Send, Pill, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useClinicData } from '../hooks/useClinicData';
import { Card, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function Prescriptions() {
  const { prescriptions, medicines, patients, issuePrescription, updatePrescription, deletePrescription, loading } = useClinicData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPres, setEditingPres] = useState<any | null>(null);
  
  // Selection State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPrescriptions = prescriptions.map(pres => {
    const patient = patients.find(p => p.id === pres.patientId);
    const medicine = medicines.find(m => m.id === pres.medicineId);
    return {
      ...pres,
      patientName: patient?.fullname || 'Unknown Patient',
      medicineName: medicine?.name || 'Unknown Medicine'
    };
  }).filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedMedicineId) {
      setError("Please select both patient and medicine");
      return;
    }
    
    if (editingPres) {
      try {
        setIssuing(true);
        await updatePrescription(editingPres.id, {
          patientId: selectedPatientId,
          medicineId: selectedMedicineId,
          quantity: quantity
        });
        setIsModalOpen(false);
        setEditingPres(null);
      } catch (err: any) {
        setError(err.message || "Failed to update prescription");
      } finally {
        setIssuing(false);
      }
      return;
    }

    const med = medicines.find(m => m.id === selectedMedicineId);
    if (med && med.stock < quantity) {
      setError("Insufficient stock for the requested quantity.");
      return;
    }

    setIssuing(true);
    setError(null);
    try {
      await issuePrescription(selectedPatientId, selectedMedicineId, quantity);
      setIsModalOpen(false);
      setSelectedMedicineId('');
      setSelectedPatientId('');
      setQuantity(1);
    } catch (err: any) {
      setError(err.message || "Failed to issue prescription");
    } finally {
      setIssuing(false);
    }
  };

  const handleEdit = (pres: any) => {
    setEditingPres(pres);
    setSelectedPatientId(pres.patientId);
    setSelectedMedicineId(pres.medicineId);
    setQuantity(pres.quantity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this prescription record?")) {
      await deletePrescription(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search prescriptions history..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 gap-2 bg-slate-900 hover:bg-black text-white">
          <Plus className="w-5 h-5" />
          Issue Medicine
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3 text-center">Medicine</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-center">Timestamp</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-3"><div className="h-10 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map(pres => (
                  <tr key={pres.id} className="hover:bg-slate-50/80 transition-colors text-xs group">
                    <td className="px-6 py-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-bold text-slate-800">{pres.patientName}</p>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold text-[9px] uppercase tracking-tighter border border-blue-100">
                         <Pill className="w-2.5 h-2.5" />
                         {pres.medicineName}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-center font-black text-slate-900">
                      {pres.quantity}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-400 tabular-nums font-medium">
                      {pres.issuedAt?.toDate ? format(pres.issuedAt.toDate(), 'MM/dd HH:mm') : '--:--'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => handleEdit(pres)}
                          className="p-1.5 bg-slate-50 md:bg-transparent hover:bg-blue-100 text-blue-600 rounded transition-colors"
                         >
                            <FileText className="w-3.5 h-3.5" />
                         </button>
                         <button 
                          onClick={() => handleDelete(pres.id)}
                          className="p-1.5 bg-slate-50 md:bg-transparent hover:bg-rose-100 text-rose-600 rounded transition-colors"
                         >
                            <AlertCircle className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-400 italic text-xs">No issuance records yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <Send className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingPres ? 'Edit Prescription' : 'Issue Medicine'}</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{editingPres ? 'Update issuance details' : 'Digital Prescription'}</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                 <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                   <Users className="w-3.5 h-3.5 text-blue-500" />
                   Select Patient
                </label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullname} ({p.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                   <Pill className="w-3.5 h-3.5 text-emerald-500" />
                   Select Medicine
                </label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={selectedMedicineId}
                  onChange={e => setSelectedMedicineId(e.target.value)}
                  required
                >
                  <option value="">-- Select Medicine --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id} disabled={m.stock === 0}>
                      {m.name} {m.stock === 0 ? '(OUT OF STOCK)' : `(${m.stock} available)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-tighter">Enter Quantity</label>
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-2 py-1">
                       <button 
                        type="button" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 font-bold text-xl"
                       >-</button>
                       <span className="w-8 text-center font-black text-lg">{quantity}</span>
                       <button 
                        type="button" 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 font-bold text-xl"
                       >+</button>
                    </div>
                 </div>
                 {selectedMedicineId && (
                   <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                     Stock will be updated automatically upon issuance
                   </p>
                 )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 font-black uppercase tracking-widest text-base bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50"
                disabled={issuing}
              >
                {issuing ? 'Processing...' : (editingPres ? 'Update Record' : 'Confirm Issuance')}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
