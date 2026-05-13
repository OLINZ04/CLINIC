import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Pill, 
  Users, 
  FileText, 
  LogOut, 
  Activity,
  Plus,
  Search,
  AlertCircle,
  Menu,
  X,
  ShieldCheck,
  Mail,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { Button, Card, Input } from './components/ui';
import Dashboard from './views/Dashboard';
import Medicines from './views/Medicines';
import Patients from './views/Patients';
import Prescriptions from './views/Prescriptions';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ to, icon: Icon, label, active, onClick, collapsed }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void, collapsed?: boolean }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-2 text-sm transition-all duration-150 group no-underline",
      active 
        ? "bg-blue-600/10 border-r-4 border-blue-500 text-white font-semibold" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white",
      collapsed && "justify-center px-0 border-r-0"
    )}
    title={collapsed ? label : ""}
  >
    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
    {!collapsed && <span>{label}</span>}
    {collapsed && active && <div className="absolute right-0 w-1 h-6 bg-blue-500 rounded-l-full" />}
  </Link>
);

const Navbar = ({ user }: { user: User }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-bold text-slate-900 text-lg tracking-tight">Campus Clinic</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end text-right">
          <p className="text-sm font-semibold text-slate-900">{user.displayName}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <img src={user.photoURL || ''} alt="avatar" className="w-9 h-9 rounded-full border border-slate-200" />
        <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

const ProtectedLayout = ({ children, user }: { children: React.ReactNode, user: User }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="font-bold">Clinic System</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-50 bg-[#0f172a] border-r border-slate-800 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        isSidebarCollapsed ? "md:w-20" : "md:w-64",
        !isMobileMenuOpen && "w-64"
      )}>
        <div className={cn(
          "h-16 hidden md:flex items-center border-b border-slate-800 transition-all duration-300",
          isSidebarCollapsed ? "px-0 justify-center" : "px-6"
        )}>
           <button 
            onClick={() => setIsAboutModalOpen(true)} 
            className="flex items-center gap-3 no-underline hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0"
           >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">C</div>
            {!isSidebarCollapsed && <span className="font-bold text-white tracking-tight">CAMPUS CLINIC</span>}
           </button>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-x-hidden">
          <div className={cn(
            "px-6 py-2 mb-2 flex items-center transition-all duration-300 text-slate-500",
            isSidebarCollapsed ? "px-0 justify-center" : "justify-between"
          )}>
             <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center gap-3 hover:text-white transition-colors group/menu"
             >
               <Menu className="w-5 h-5 group-hover/menu:scale-110 transition-transform" />
               {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Menu</span>}
             </button>
          </div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/medicines" icon={Pill} label="Inventory" active={location.pathname === '/medicines'} onClick={() => setIsMobileMenuOpen(false)} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/patients" icon={Users} label="Patient Records" active={location.pathname === '/patients'} onClick={() => setIsMobileMenuOpen(false)} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/prescriptions" icon={FileText} label="Prescriptions" active={location.pathname === '/prescriptions'} onClick={() => setIsMobileMenuOpen(false)} collapsed={isSidebarCollapsed} />
        </nav>
        <div className={cn(
          "p-4 border-t border-slate-800 bg-[#0f172a] transition-all duration-300",
          isSidebarCollapsed && "p-2"
        )}>
          <div className="flex items-center justify-between group/profile">
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className={cn(
                "flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-all duration-300",
                isSidebarCollapsed && "gap-0"
              )}
            >
               <div className={cn(
                 "rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden shrink-0 border border-slate-700 transition-all duration-300",
                 isSidebarCollapsed ? "w-12 h-12" : "w-10 h-10"
               )}>
                 {user.photoURL ? <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" /> : 'ADMIN'}
               </div>
               {!isSidebarCollapsed && (
                 <div className="min-w-0">
                   <p className="text-xs font-bold text-white truncate" title={user.displayName || ''}>{user.displayName}</p>
                   <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-semibold">Campus Nurse</p>
                 </div>
               )}
            </button>
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* About System Modal */}
        <AnimatePresence>
          {isAboutModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAboutModalOpen(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">C</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">System Information</h3>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-0.5">Version 1.0.4 Stable</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAboutModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The <strong className="text-slate-900">Campus Clinic Inventory and Patient Records System</strong> is a web-based application designed to help school clinics efficiently manage their daily operations. It allows clinic staff to keep track of medicine inventory, including stock levels, expiration dates, and usage, ensuring that essential supplies are always available. At the same time, the system records patient information such as personal details, complaints, diagnoses, and treatments during each clinic visit.
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                      Built using PHP, MySQL, HTML, CSS, JavaScript, and Bootstrap, and run through XAMPP, the system provides a simple and organized interface for easy data entry and retrieval. It improves accuracy in record-keeping, reduces manual paperwork, and helps clinic personnel monitor both patient history and medicine usage more effectively.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Modules</p>
                      <p className="text-xl font-black text-slate-900">4 Core</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Architecture</p>
                      <p className="text-xl font-black text-slate-900 italic">Clinic Hub</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <Button 
                    className="w-full h-12 font-bold shadow-xl shadow-blue-100" 
                    variant="primary"
                    onClick={() => setIsAboutModalOpen(false)}
                  >
                    Return to Workspace
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="h-24 bg-blue-600 flex items-end justify-center pb-0">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center translate-y-10 overflow-hidden shadow-lg">
                    {user.photoURL? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="w-10 h-10 text-slate-300" />}
                  </div>
                </div>
                
                <div className="pt-14 pb-8 px-8 text-center">
                  <h3 className="text-lg font-bold text-slate-900">{user.displayName}</h3>
                  <p className="text-sm text-blue-600 font-semibold">Campus Nurse</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Campus Clinic Staff</p>
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Email Address</p>
                        <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Access Level</p>
                        <p className="text-xs text-slate-600 font-semibold italic">Authorized Medical Personnel</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <Button 
                      className="h-11 font-bold" 
                      variant="ghost"
                      onClick={() => setIsProfileModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      className="h-11 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none" 
                      variant="outline"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
                    >
                      Log Out
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {isLogoutConfirmOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogOut className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">End Session?</h3>
                <p className="text-slate-500 mt-2 font-medium">Are you sure you want to log out from the Campus Clinic System?</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <Button 
                    variant="ghost" 
                    className="h-12 font-bold"
                    onClick={() => setIsLogoutConfirmOpen(false)}
                  >
                    Stay
                  </Button>
                  <Button 
                    variant="primary" 
                    className="h-12 font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
                    onClick={confirmLogout}
                  >
                    Log Out
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        <header className="hidden md:flex h-16 items-center px-8 bg-white border-b border-slate-200 self-stretch shrink-0 shadow-sm z-10">
           <div className="flex-1">
             <h1 className="text-lg font-bold text-slate-800 tracking-tight">
               System Overview 
               <span className="text-slate-400 font-normal ml-2 text-sm">
                 / {location.pathname === '/' ? 'Dashboard' : 
                    location.pathname === '/medicines' ? 'Inventory' :
                    location.pathname === '/patients' ? 'Patient Records' : 'Prescriptions'}
               </span>
             </h1>
           </div>
           <div className="flex items-center gap-4">
             <div className="relative hidden lg:block">
               <input 
                 type="text" 
                 placeholder="Quick search records..." 
                 className="bg-slate-100 border-none rounded-full px-4 py-1.5 text-xs w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
               />
             </div>
             <Button 
               size="sm" 
               variant="primary" 
               className="text-xs h-8 px-4 font-semibold"
               onClick={() => window.location.href = '/patients?add=true'}
             >
               + New Patient
             </Button>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const Login = () => (
  <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
    {/* Background Image with Overlay */}
    <div 
      className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1538108149393-fdfd81895907?auto=format&fit=crop&q=80&w=2028")',
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <Card className="p-10 space-y-8 flex flex-col items-center text-center bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20 rounded-3xl">
        <div className="p-5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <Activity className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Clinic</h1>
          <p className="text-slate-500 mt-2 font-medium">Inventory & Patient Records System</p>
        </div>
        
        <div className="w-full space-y-4">
          <Button 
            onClick={signInWithGoogle} 
            className="w-full h-14 text-base gap-4 font-bold shadow-lg hover:shadow-xl transition-all" 
            variant="primary"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>
          
          <div className="flex items-center gap-2 py-2">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Authorized Access</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed px-4 font-medium">
            Restricted for health personnel and authorized clinic staff only.
          </p>
        </div>
      </Card>
    </motion.div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-blue-600 animate-pulse" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing clinic system...</p>
      </div>
    </div>
  );

  if (!user) return <Login />;

  return (
    <Router>
      <ProtectedLayout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
        </Routes>
      </ProtectedLayout>
    </Router>
  );
}
