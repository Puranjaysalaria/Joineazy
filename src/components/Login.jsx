import React, { useState } from 'react';
import { Layers, User, Shield, ChevronDown } from 'lucide-react';

export default function Login({ onLogin }) {
  const [showStudents, setShowStudents] = useState(false);

  // Hardcoded list from the mock DB for easy login selection
  const students = [
    { id: 1, name: 'Alex Carter' },
    { id: 2, name: 'Jordan Smith' },
    { id: 3, name: 'Taylor Doe' }
  ];

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden animate-fadeIn">
      <div className="glass-panel text-center p-8 md:p-12 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-xl relative z-10 border-white/10">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-primary/20 rounded-xl shadow-glow">
            <Layers className="text-primary w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">Welcome back</h1>
        <p className="text-textMuted mb-8 text-sm md:text-base">Select your role to continue to the dashboard.</p>
        
        <div className="grid gap-4 grid-cols-2">
          {/* Student Logic */}
          <div className="relative">
            <button 
              className="appearance-none group glass-panel-light p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow flex flex-col items-center gap-4 w-full h-full"
              onClick={() => setShowStudents(!showStudents)}
            >
              <User className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
              <span className="block font-semibold text-white flex items-center gap-1">Student <ChevronDown className="w-4 h-4" /></span>
            </button>
            
            {showStudents && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 glass-panel rounded-xl shadow-2xl z-20 flex flex-col gap-1 border-white/20 animate-fadeIn">
                {students.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => onLogin('student', s.id)}
                    className="w-full text-left px-4 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
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
    </div>
  );
}
