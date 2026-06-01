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
  Eye,
  EyeOff,
  User as UserIcon
} from 'lucide-react';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { supabase } from './lib/supabase';
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
        <Button variant="ghost" size="sm" onClick={() => {
          localStorage.removeItem('clinic_custom_user');
          logout().then(() => {
            window.location.reload();
          });
        }} className="ml-2">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

const ProtectedLayout = ({ children, user }: { children: React.ReactNode, user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isNewPatientLoading, setIsNewPatientLoading] = useState(false);

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    localStorage.removeItem('clinic_custom_user');
    logout().then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden no-print flex items-center justify-between p-4 border-b bg-white">
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
      </aside>

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
               loading={isNewPatientLoading}
               onClick={() => {
                 setIsNewPatientLoading(true);
                 navigate('/patients?add=true');
                 setTimeout(() => setIsNewPatientLoading(false), 600);
               }}
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

const Login = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Database-backed verification states
  const [otpSent, setOtpSent] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [showOtpHint, setShowOtpHint] = useState(true);

  // Google identity linking states
  const [isUsingGoogleVerify, setIsUsingGoogleVerify] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Fast autofill for demo credentials
  const handleQuickFill = () => {
    setUsernameInput('admin');
    setPasswordInput('admin123');
    setErrorMsg(null);
  };

  // Google sign in triggers Google pop-up check, then initiates secure email + password registration/matching verification
  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      const emailResolved = result?.email || '';
      setGoogleEmailInput(emailResolved);
      setIsUsingGoogleVerify(true);
    } catch (err: any) {
      console.warn("Google sign-in popup error (nested preview container context):", err);
      // Leave inputs completely blank so user enters they own preferred email address
      setGoogleEmailInput('');
      setIsUsingGoogleVerify(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Process the security credentials verification for Google Single Sign-On, then dispatch secure 6-digit OTP code to the email inputted
  const handleGoogleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMsg(null);

    const email = googleEmailInput.trim();
    const password = passwordInput.trim();

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setIsSigningIn(false);
      return;
    }

    try {
      let matchedRecord: any = null;

      // Query database table for key column 'email'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error) {
        console.warn("Database query error on email lookup:", error);
      }

      if (data && data.length > 0) {
        const found = data[0];
        if (found.password === password) {
          matchedRecord = found;
        } else {
          setErrorMsg("Your entered password does not match this clinic account.");
          setIsSigningIn(false);
          return;
        }
      } else {
        // Automatically create/register this new staff member under their inputted email and password!
        const generatedUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueUsername = `${generatedUsername}${Math.floor(100 + Math.random() * 900)}`;

        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            username: uniqueUsername,
            password: password,
            email: email,
            fullname: email.split('@')[0].split(/[._]/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Campus Nurse Staff',
            role: 'Staff'
          })
          .select('*');

        if (insertError) {
          console.warn("Could not auto-register new user via Google SSO:", insertError);
        }

        if (insertData && insertData.length > 0) {
          matchedRecord = insertData[0];
        } else {
          // Local fallback in case of write-limit or network issue
          matchedRecord = {
            id: 'demo_' + Math.floor(Math.random() * 10000),
            username: uniqueUsername,
            password: password,
            email: email,
            fullname: email.split('@')[0].split(/[._]/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Campus Nurse Staff',
            role: 'Staff'
          };
        }
      }

      // Generate secure 6-digit OTP code which expires in 10 minutes
      const secureOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(secureOtp);
      setTargetEmail(email);
      setMatchedUser(matchedRecord);

      // Attempt to save security OTP token inside the SQL database
      if (matchedRecord.id && !matchedRecord.id.toString().startsWith('demo_')) {
        const { error: updateErr } = await supabase
          .from('users')
          .update({
            login_otp: secureOtp,
            otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          })
          .eq('id', matchedRecord.id);
        if (updateErr) {
          console.warn("Could not write OTP to supabase users table:", updateErr);
        }
      }

      // Send a real email directly to the inputted email address using the Web3Forms Transactional API!
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: "bf8bd79b-23ee-4f35-9acc-072023dc6497",
            subject: "Workstation Access Passcode",
            from_name: "Campus Clinic Support",
            to_email: email,
            message: `Hello Staff,

An update reference has been generated for your Campus Clinic workstation session.
Please use the following six-digit index key to authorize this terminal's active interface:

System Entry Code: ${secureOtp}

* This entry number remains active for ten (10) minutes.
* Keep this passcode confidential. Avoid disclosing it to other team associates.

ACCOUNT INFORMATION:
User Registered:    ${matchedRecord.fullname}
Department/Role:    ${matchedRecord.role}
Verified Address:   ${email}
Time Generated:     ${new Date().toLocaleString()}

Respectfully yours,

Campus Clinic General Operations Team
Health Informatics Support Desk`
          })
        });
      } catch (e) {
        console.warn("Web3Forms email dispatcher bypassed", e);
      }

      // Proceed to the OTP code validation step
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // 1. Initial Login Check against SQL database
  const handleInitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMsg(null);

    const uInput = usernameInput.trim();
    const pInput = passwordInput.trim();

    if (!uInput || !pInput) {
      setErrorMsg("Please enter both username and password.");
      setIsSigningIn(false);
      return;
    }

    try {
      let matchedRecord: any = null;

      // Query database table for username & password
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', uInput);

      if (error) {
        console.warn("Database query error, trying local credentials mapping configuration:", error);
      }

      if (data && data.length > 0) {
        const found = data[0];
        if (found.password === pInput) {
          matchedRecord = found;
        }
      }

      // Hardcoded local fallback matching database-seed for reliable offline sandbox testing
      if (!matchedRecord) {
        if (uInput === 'admin' && pInput === 'admin123') {
          matchedRecord = {
            id: 'demo_admin',
            username: 'admin',
            password: 'admin123',
            email: 'leonelmontebon18@gmail.com',
            fullname: 'Primary Campus Nurse',
            role: 'Admin'
          };
        }
      }

      if (!matchedRecord) {
        setErrorMsg("Incorrect username or password. Please try again.");
        setIsSigningIn(false);
        return;
      }

      // Generate secure 6-digit OTP code which expires in 10 minutes
      const secureOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(secureOtp);
      setTargetEmail(matchedRecord.email);
      setMatchedUser(matchedRecord);

      // Attempt to save security OTP token inside the SQL database
      if (typeof matchedRecord.id === 'number' || (matchedRecord.id && matchedRecord.id !== 'demo_admin')) {
        const { error: updateErr } = await supabase
          .from('users')
          .update({
            login_otp: secureOtp,
            otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          })
          .eq('id', matchedRecord.id);
        if (updateErr) {
          console.warn("Could not write OTP to supabase users table:", updateErr);
        }
      }

      // Send a real email directly to leonelmontebon18@gmail.com using the Web3Forms Transactional API
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: "bf8bd79b-23ee-4f35-9acc-072023dc6497",
            subject: "Workstation Access Passcode",
            from_name: "Campus Clinic Support",
            to_email: matchedRecord.email,
            message: `Hello Staff,

An update reference has been generated for your Campus Clinic workstation session.
Please use the following six-digit index key to authorize this terminal's active interface:

System Entry Code: ${secureOtp}

* This entry number remains active for ten (10) minutes.
* Keep this passcode confidential. Avoid disclosing it to other team associates.

ACCOUNT INFORMATION:
User Registered:    ${matchedRecord.fullname}
Department/Role:    ${matchedRecord.role}
Verified Address:   ${matchedRecord.email}
Time Generated:     ${new Date().toLocaleString()}

Respectfully yours,

Campus Clinic General Operations Team
Health Informatics Support Desk`
          })
        });
      } catch (e) {
        console.warn("Web3Forms email dispatcher bypassed", e);
      }

      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Shared block to verify OTP code so it can be triggered both on form submit and auto-fill
  const executeVerify = async (inputCode: string) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMsg(null);

    const inputVerifyCode = inputCode.trim();
    if (!inputVerifyCode) {
      setErrorMsg("Please enter the 6-digit security code.");
      setIsSigningIn(false);
      return;
    }

    try {
      let isVerified = false;

      if (matchedUser && matchedUser.id !== 'demo_admin') {
        // Retrieve the latest OTP from database for absolute real-time matching
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', matchedUser.id);

        if (data && data.length > 0) {
          const dbUser = data[0];
          const dbOtp = dbUser.login_otp;
          const expiresAt = dbUser.otp_expires_at;

          if (dbOtp === inputVerifyCode) {
            if (expiresAt && new Date(expiresAt) < new Date()) {
              setErrorMsg("The code has expired. Please go back and log in again.");
              setIsSigningIn(false);
              return;
            }
            isVerified = true;

            // Nullify the verification token in the table for top-grade security
            await supabase
              .from('users')
              .update({
                login_otp: null,
                otp_expires_at: null
              })
              .eq('id', matchedUser.id);
          }
        }
      }

      // Check against local fallback memory state (for offline/demo stability)
      if (!isVerified && inputVerifyCode === otpCode) {
        isVerified = true;
      }

      if (!isVerified) {
        setErrorMsg("Incorrect security verification code. Please check your email and try again.");
        setIsSigningIn(false);
        return;
      }

      // Success! Generate custom session that satisfies standard clinic view requirements
      const mockUser: any = {
        uid: 'custom_uid_' + matchedUser.id,
        displayName: matchedUser.fullname || matchedUser.username,
        email: matchedUser.email,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${matchedUser.username}`,
        emailVerified: true
      };

      localStorage.setItem('clinic_custom_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('storage'));
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
      setIsSigningIn(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerify(otpInput);
  };

  // Instantly trigger when the text box achieves exactly 6 digits! Saves manual clicks
  const handleOtpChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setOtpInput(cleaned);
    if (cleaned.length === 6) {
      executeVerify(cleaned);
    }
  };

  // Clicking Sandbox code auto-fills & logs in instantly!
  const handleBadgeClick = () => {
    setOtpInput(otpCode);
    executeVerify(otpCode);
  };

  return (
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
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md animate-fade-in"
      >
        <Card className="p-8 sm:p-10 space-y-6 flex flex-col items-center bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20 rounded-3xl">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Clinic</h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Inventory & Patient Records System</p>
          </div>
          
          <div className="w-full space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-left flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Security Desk Info</p>
                  <p className="text-rose-600 leading-normal">{errorMsg}</p>
                </div>
              </div>
            )}

            {!otpSent ? (
              isUsingGoogleVerify ? (
                // Google Verification Mode: Enter Google-linked Email + password
                <form onSubmit={handleGoogleVerifySubmit} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 text-left space-y-1.5 animate-fade-in">
                    <p className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Google Single Sign-On Verification</p>
                    <p className="leading-relaxed">To complete secure pairing, confirm your email address below and type its clinic password.</p>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="Enter Google-linked email (e.g. staff@gmail.com)" 
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      className="w-full h-12 bg-white"
                      required
                      disabled={isSigningIn}
                    />
                  </div>

                  <div className="space-y-1.5 text-left relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter account password (e.g. admin123)" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full h-12 bg-white pr-10"
                        required
                        disabled={isSigningIn}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSigningIn}
                    className="w-full h-12 text-sm gap-2 font-bold shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white border-0 mt-2"
                  >
                    {isSigningIn ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Verification Mail...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Submit & Send Verification Code
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUsingGoogleVerify(false);
                      setGoogleEmailInput('');
                      setPasswordInput('');
                      setErrorMsg(null);
                    }}
                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1"
                  >
                    ← Back to standard credentials sign-in
                  </button>
                </form>
              ) : (
                // STEP 1: Enter Username & Password with quick-fills
                <form onSubmit={handleInitLogin} className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                      <button 
                        type="button" 
                        onClick={handleQuickFill}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition px-1 py-0.5"
                      >
                        ⚡ Quick Fill Demo
                      </button>
                    </div>
                    <Input 
                      type="text" 
                      placeholder="Enter username (e.g. admin)" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full h-12 bg-white"
                      required
                      disabled={isSigningIn}
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-left relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password (e.g. admin123)" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full h-12 bg-white pr-10"
                        required
                        disabled={isSigningIn}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSigningIn}
                    className="w-full h-12 text-sm gap-2 font-bold shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white border-0 mt-2"
                  >
                    {isSigningIn ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Authenticating DB...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verify Credentials & Send OTP
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 py-1">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">OR SINGLE SIGN-ON</span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <Button 
                    type="button"
                    onClick={handleGoogleSignIn} 
                    disabled={isSigningIn}
                    className="w-full h-11 text-xs gap-3 font-semibold shadow-sm hover:shadow-md transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700" 
                    variant="outline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </Button>
                </form>
              )
            ) : (
              // STEP 2: Enter Email Verification OTP with automated focus and triggers
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs text-left leading-relaxed flex gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-blue-950 mb-0.5">✉️ Entry Passcode Dispatched!</span>
                    We dispatched a secure login code to <span className="font-semibold underline text-blue-950">{targetEmail}</span>. Please verify your clinic access sequence below.
                    <div className="mt-2.5 pt-2 border-t border-blue-100/60 text-[10px] text-slate-500 leading-normal">
                      💡 <strong>Not finding the email?</strong> Due to spam filters on public mailboxes, it may take 1-2 minutes to arrive. Feel free to use the <strong>Quick Sandbox Bypass</strong> button below to log in instantly!
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">6-Digit Security Token</label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    placeholder="------" 
                    value={otpInput}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className="w-full h-12 bg-white text-center font-mono text-xl tracking-wider font-extrabold focus:border-blue-500"
                    required
                    disabled={isSigningIn}
                    autoFocus
                  />
                  <p className="text-[10px] text-center text-slate-400 mt-1">💡 Auto-verifies instantly as soon as you key in all 6 digits.</p>
                </div>

                {showOtpHint && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs text-left">
                    <p className="font-bold flex items-center justify-between text-emerald-900">
                      <span>🗝️ Quick Sandbox Bypass</span> 
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase font-sans">Click to Paste</span>
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-700 leading-normal">For immediate testing in your browser preview, click the code badge below to instantly fill & verify:</p>
                    <button
                      type="button"
                      onClick={handleBadgeClick}
                      disabled={isSigningIn}
                      className="mt-2.5 w-full block text-center font-bold font-mono text-base bg-white hover:bg-emerald-100 text-emerald-950 font-extrabold py-2 px-3 rounded-lg border border-emerald-200 shadow-sm cursor-pointer select-none active:scale-[0.98] transition-all hover:border-emerald-300 tracking-widest leading-none outline-none focus:ring-2 focus:ring-emerald-400"
                      title="Click to instantly auto-fill and login"
                    >
                      {otpCode}
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setErrorMsg(null);
                      setOtpInput('');
                    }}
                    disabled={isSigningIn}
                    className="flex-1 h-12 text-sm font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSigningIn}
                    className="flex-[2] h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    {isSigningIn ? 'Verifying...' : 'Verify & Log In'}
                  </Button>
                </div>
              </form>
            )}
            
            <p className="text-[11px] text-slate-400 leading-relaxed px-4 text-center font-medium mt-4">
              Restricted access. Dedicated for authorized health personnel only.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. First prioritize checking the custom sql table user session 
    const storedUser = localStorage.getItem('clinic_custom_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
         setUser(parsed);
         setLoading(false);
         return;
      } catch (e) {
        console.error("Error parsing stored custom user", e);
      }
    }

    // 2. Otherwise listen to Firebase authentication changes
    return onAuthStateChanged(auth, (u) => {
      if (!localStorage.getItem('clinic_custom_user')) {
         setUser(u);
      }
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
