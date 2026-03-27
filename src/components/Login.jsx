import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Layers, User, Shield, ChevronDown, X, Check } from 'lucide-react';

export default function Login({ onLogin, users }) {
  const [showStudents, setShowStudents] = useState(false);

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden animate-fadeIn text-white">
      <div className="flex flex-col items-center gap-6 relative z-10 w-full max-w-md px-4">
        <div className="glass-panel text-center p-8 md:p-12 rounded-2xl w-full shadow-2xl backdrop-blur-xl border-white/10 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="mb-6 flex justify-center relative z-10">
            <div className="p-4 bg-primary/20 rounded-xl shadow-glow">
              <Layers className="text-primary w-12 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-white relative z-10">Welcome back</h1>
          <p className="text-textMuted mb-8 text-sm md:text-base relative z-10">Select your role to continue to the dashboard.</p>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 relative z-10">
            {/* Student Logic */}
            <div className="flex">
              <button 
                className="appearance-none group glass-panel-light p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow flex flex-col items-center gap-4 w-full h-full"
                onClick={() => setShowStudents(true)}
              >
                <User className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                <span className="block font-semibold text-white flex items-center gap-1">Student <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:translate-y-1" /></span>
              </button>
              
              {showStudents && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex justify-center items-center p-4 animate-fadeIn">
                  <div className="glass-panel w-full max-w-sm rounded-3xl p-8 relative animate-modalIn shadow-4xl border-white/10">
                    <button 
                      onClick={() => setShowStudents(false)}
                      className="absolute right-6 top-6 text-textMuted hover:text-white transition-colors p-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <User className="text-primary w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Select Student</h2>
                      <p className="text-textMuted text-sm">Choose an identity to access your individual dashboard.</p>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
                      {users.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => onLogin('student', s.id)}
                          className="w-full group/student flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 rounded-2xl transition-all text-left"
                        >
                          <span className="font-semibold text-white/80 group-hover/student:text-white transition-colors">{s.name}</span>
                          <Check className="w-5 h-5 text-primary opacity-0 group-hover/student:opacity-100 transition-all transform scale-50 group-hover/student:scale-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
            
            <button 
              className="appearance-none group glass-panel-light p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-warning/50 hover:shadow-cardHover flex flex-col items-center gap-4 border border-white/5"
              onClick={() => onLogin('admin')}
            >
              <Shield className="w-8 h-8 text-warning group-hover:text-amber-400 transition-colors" />
              <span className="block font-semibold text-white">Admin</span>
            </button>
          </div>
        </div>
        
        {/* Recruiter Cheesy Line */}
        <div className="animate-fadeIn delay-700 mt-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex items-center gap-3 group cursor-default hover:bg-white/10 hover:border-primary/50 transition-all duration-500">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"></div>
          <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors tracking-wide">
            This site uses mock data. For a custom enterprise solution, <strong className="text-primary font-bold">hire me!</strong>
          </span>
          <span className="text-lg group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 transform-gpu">🚀</span>
        </div>
      </div>
    </div>
  );
}
