import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Trash2, Edit3, Filter, AlertTriangle } from 'lucide-react';
import { useClinicData, Medicine } from '../hooks/useClinicData';
import { Card, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

export default function Medicines() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, loading } = useClinicData();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    expirationDate: ''
  });

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      await updateMedicine(editingMed.id, formData);
    } else {
      await addMedicine(formData as any);
    }
    setFormData({ name: '', category: '', stock: 0, expirationDate: '' });
    setEditingMed(null);
    setIsModalOpen(false);
  };

  const startEdit = (med: Medicine) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      category: med.category || '',
      stock: med.stock,
      expirationDate: med.expirationDate || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      await deleteMedicine(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search medicines by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 shadow-sm"
          />
        </div>
        <Button onClick={() => { setEditingMed(null); setFormData({ name: '', category: '', stock: 0, expirationDate: '' }); setIsModalOpen(true); }} className="h-12 px-6 gap-2">
          <Plus className="w-5 h-5" />
          Add Medicine
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Medicine Name</th>
                <th className="px-6 py-3 text-center">Category</th>
                <th className="px-6 py-3 text-center">In Stock</th>
                <th className="px-6 py-3 text-center">Expiration</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-3"><div className="h-10 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredMedicines.length > 0 ? (
                filteredMedicines.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          med.stock < 10 ? "bg-rose-100/50 text-rose-600" : "bg-blue-50 text-blue-600"
                        )}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{med.name}</p>
                          {med.stock < 10 && (
                            <span className="text-[9px] text-rose-500 font-bold uppercase">Critical Level</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold tracking-tighter uppercase text-[9px]">
                        {med.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <p className={cn(
                        "font-black text-sm",
                        med.stock < 10 ? "text-rose-600" : "text-slate-900"
                      )}>
                        {med.stock}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-400 tabular-nums font-medium">
                      {med.expirationDate ? format(new Date(med.expirationDate), 'MMM dd, yyyy') : '--'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(med)} className="h-7 w-7 p-0 rounded-md bg-slate-50 md:bg-transparent hover:bg-white border md:border-transparent hover:border-slate-200">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(med.id)} className="h-7 w-7 p-0 rounded-md bg-slate-50 md:bg-transparent hover:bg-white border md:border-transparent hover:border-slate-200 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-400 italic text-xs">No medicines found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tooltip placeholder replacement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">{editingMed ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Inventory Management</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <Trash2 className="w-5 h-5 rotate-45" /> {/* Close icon trick */}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <Input 
                label="Medicine Name" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Paracetamol 500mg"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Category" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Painkiller"
                />
                <Input 
                  label="Initial Stock" 
                  type="number" 
                  required 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
              <Input 
                label="Expiration Date" 
                type="date" 
                value={formData.expirationDate} 
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
              />
              
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-12">
                  {editingMed ? 'Save Changes' : 'Create Medicine'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
