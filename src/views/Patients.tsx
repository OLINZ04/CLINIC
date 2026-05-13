import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Eye, Filter, UserPlus, Clock, ArrowRight, User } from 'lucide-react';
import { useClinicData, Patient } from '../hooks/useClinicData';
import { Card, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient, loading } = useClinicData();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  useEffect(() => {
    const addParam = searchParams.get('add');
    const searchParam = searchParams.get('search');
    if (addParam === 'true') setIsModalOpen(true);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    fullname: '',
    age: '' as any,
    gender: 'Male',
    department: '',
    complaint: '',
    diagnosis: '',
    dateVisit: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  const filteredPatients = patients.filter(p => 
    p.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      age: parseInt(formData.age as string) || 0
    };
    
    if (isEditMode && currentId) {
      await updatePatient(currentId, finalData as any);
    } else {
      await addPatient(finalData as any);
    }

    setFormData({ 
      fullname: '', 
      age: '' as any, 
      gender: 'Male', 
      department: '', 
      complaint: '', 
      diagnosis: '',
      dateVisit: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentId(null);
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      fullname: patient.fullname,
      age: patient.age.toString(),
      gender: patient.gender,
      department: patient.department,
      complaint: patient.complaint || '',
      diagnosis: patient.diagnosis || '',
      dateVisit: patient.dateVisit?.toDate ? format(patient.dateVisit.toDate(), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });
    setCurrentId(patient.id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setSelectedPatient(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      await deletePatient(id);
      setSelectedPatient(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search patients by name or department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 gap-2">
          <UserPlus className="w-5 h-5" />
          Log New Visit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
          ))
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div key={patient.id}>
              <Card className="p-0 border border-slate-200 shadow-sm hover:border-blue-300 transition-all group overflow-hidden bg-white rounded-xl">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="flex-1 p-3 flex items-center gap-4">
                   <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Users className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 truncate tracking-tight">{patient.fullname}</h3>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-tighter">
                          {patient.department}
                        </span>
                     </div>
                     <div className="flex items-center gap-3 mt-0.5 text-slate-400 text-[10px] font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {patient.dateVisit?.toDate ? format(patient.dateVisit.toDate(), 'MMM dd • HH:mm') : '--:--'}
                        </span>
                        <span className="text-slate-200">|</span>
                        <span>{patient.age}Y • {patient.gender.charAt(0)}</span>
                     </div>
                   </div>
                   <div className="hidden lg:block w-px h-8 bg-slate-100" />
                   <div className="hidden lg:block flex-1 max-w-xs">
                     <p className="text-[11px] text-slate-600 line-clamp-1 italic">"{patient.complaint || 'No complaint'}"</p>
                   </div>
                </div>
                <div className="bg-slate-50 px-4 flex items-center border-t md:border-t-0 md:border-l border-slate-100">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold text-slate-500 hover:text-blue-600"
                    onClick={() => setSelectedPatient(patient)}
                   >
                      RECORDS
                      <ArrowRight className="w-3 h-3 ml-1" />
                   </Button>
                </div>
              </div>
            </Card>
          </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">No records found</h4>
            <p className="text-slate-400 text-xs mt-1">Check search terms or log a new visit.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{isEditMode ? 'Edit Patient Entry' : 'New Patient Entry'}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{isEditMode ? 'Update patient visit details' : 'Record vital signs and clinic visit details'}</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setCurrentId(null);
                }} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Full Patient Name" 
                  required 
                  value={formData.fullname} 
                  onChange={e => setFormData({...formData, fullname: e.target.value})}
                  placeholder="e.g. John Student Doe"
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Department / Course</label>
                  <select 
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    <option value="Engineering Department">Engineering Department</option>
                    <option value="Information Technology Department">Information Technology Department</option>
                    <option value="Hospitality Management Department">Hospitality Management Department</option>
                    <option value="Education Department">Education Department</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Input 
                  label="Age" 
                  type="text"
                  inputMode="numeric"
                  value={formData.age} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setFormData({...formData, age: val});
                    }
                  }}
                  placeholder="Enter age"
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Gender</label>
                  <select 
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <Input 
                  label="Date & Time of Visit" 
                  type="datetime-local" 
                  value={formData.dateVisit} 
                  onChange={e => setFormData({...formData, dateVisit: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Chief Complaint</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all"
                    placeholder="Describe patient symptoms..."
                    value={formData.complaint}
                    onChange={e => setFormData({...formData, complaint: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Initial Diagnosis</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all"
                    placeholder="Findings and assessment..."
                    value={formData.diagnosis}
                    onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setCurrentId(null);
                  }} 
                  className="flex-1 h-12 font-bold"
                >
                  Discard
                </Button>
                <Button type="submit" className="flex-1 h-12 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                  {isEditMode ? 'Update Patient Record' : 'Save Patient Record'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{selectedPatient.fullname}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical History File</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                   <p className="text-sm font-semibold text-slate-700">{selectedPatient.department}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Basic Info</p>
                   <p className="text-sm font-semibold text-slate-700">{selectedPatient.age}Y • {selectedPatient.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-2">Chief Complaint</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 italic">"{selectedPatient.complaint || 'No complaint recorded.'}"</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-2">Diagnosis & Findings</h4>
                  <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    <p className="text-sm text-slate-600">{selectedPatient.diagnosis || 'No diagnosis recorded.'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 px-4 text-blue-600 border-blue-100" onClick={() => handleEdit(selectedPatient)}>Edit</Button>
                  <Button size="sm" variant="outline" className="h-8 px-4 text-red-600 border-red-100" onClick={() => handleDelete(selectedPatient.id)}>Delete</Button>
                </div>
                <Button size="sm" variant="outline" className="h-8 px-4" onClick={() => setSelectedPatient(null)}>Close File</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
