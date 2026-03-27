import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Layers, User, Shield, ChevronDown, X, Check } from "lucide-react";

export default function Login({ onLogin, users }) {
  const [showStudents, setShowStudents] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");

  const DEMO_ADMIN_CODE = "admin123";

  const handleAdminAccess = () => {
    if (adminCode.trim() === DEMO_ADMIN_CODE) {
      setAdminCode("");
      setAdminError("");
      setShowAdminPrompt(false);
      onLogin("admin");
      return;
    }

    setAdminError("Invalid passcode. Please try again.");
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-transparent flex flex-col items-center justify-center p-3 sm:p-4 py-10 sm:py-12 overflow-x-hidden relative font-outfit text-white">
      <div className="relative z-10 w-full max-w-2xl px-1 sm:px-0 flex flex-col items-center animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8 relative z-20">
          <div className="bg-primary/20 p-4 rounded-3xl inline-block mb-4 border border-primary/30 shadow-glow-sm">
            <Layers
              className="w-10 h-10 md:w-12 md:h-12 text-primary"
              strokeWidth={2.5}
            />
          </div>
        </div>

        <div className="glass-panel text-center p-4 sm:p-6 md:p-12 rounded-2xl w-full shadow-2xl backdrop-blur-xl border-white/10 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-white relative z-10 break-words">
            Welcome back
          </h1>
          <p className="text-textMuted mb-8 text-sm md:text-base relative z-10">
            Select your role to continue to the dashboard.
          </p>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 relative z-10">
            {/* Student Logic */}
            <div className="flex">
              <button
                className="appearance-none group glass-panel-light p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow flex flex-col items-center gap-4 w-full h-full"
                onClick={() => setShowStudents(true)}
              >
                <User className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                <span className="font-semibold text-white flex items-center gap-1">
                  Student{" "}
                  <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-hover:translate-y-1" />
                </span>
              </button>

              {showStudents &&
                createPortal(
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex justify-center items-center p-4 animate-fadeIn">
                    <div className="glass-panel w-full max-w-sm max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl p-6 sm:p-8 relative animate-modalIn shadow-4xl border-white/10">
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
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Select Student
                        </h2>
                        <p className="text-textMuted text-sm">
                          Choose an identity to access your individual
                          dashboard.
                        </p>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto overscroll-contain custom-scrollbar px-1">
                        {users.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => onLogin("student", s.id)}
                            className="w-full group/student flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 rounded-2xl transition-all text-left"
                          >
                            <span className="font-semibold text-white/80 group-hover/student:text-white transition-colors">
                              {s.name}
                            </span>
                            <Check className="w-5 h-5 text-primary opacity-0 group-hover/student:opacity-100 transition-all transform scale-50 group-hover/student:scale-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>,
                  document.body,
                )}
            </div>

            <button
              className="appearance-none group glass-panel-light p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-warning/50 hover:shadow-cardHover flex flex-col items-center gap-4 border border-white/5"
              onClick={() => {
                setAdminError("");
                setAdminCode("");
                setShowAdminPrompt(true);
              }}
            >
              <Shield className="w-8 h-8 text-warning group-hover:text-amber-400 transition-colors" />
              <span className="block font-semibold text-white">Admin</span>
            </button>
          </div>
        </div>

        {showAdminPrompt &&
          createPortal(
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex justify-center items-center p-4 animate-fadeIn">
              <div className="glass-panel w-full max-w-sm rounded-3xl p-6 sm:p-8 relative animate-modalIn shadow-4xl border-white/10">
                <button
                  onClick={() => {
                    setShowAdminPrompt(false);
                    setAdminCode("");
                    setAdminError("");
                  }}
                  className="absolute right-6 top-6 text-textMuted hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-warning/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-warning/30">
                    <Shield className="text-warning w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Admin Access
                  </h2>
                  <p className="text-textMuted text-sm">
                    Enter the admin passcode to continue.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs text-textMuted text-left font-medium">
                    Passcode
                  </label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      if (adminError) setAdminError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdminAccess();
                    }}
                    placeholder="Enter passcode"
                    className="input-field"
                  />

                  {adminError && (
                    <p className="text-danger text-xs text-left">
                      {adminError}
                    </p>
                  )}

                  <p className="text-[11px] text-textMuted text-left">
                    Demo code:{" "}
                    <span className="text-warning font-semibold">admin123</span>
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    className="btn flex-1 hover:bg-white/10"
                    onClick={() => {
                      setShowAdminPrompt(false);
                      setAdminCode("");
                      setAdminError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleAdminAccess}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* Recruiter Cheesy Line */}
        <div className="animate-fadeIn delay-700 mt-4 w-full max-w-full px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2 sm:gap-3 group cursor-default hover:bg-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-primaryPulse"></div>
          <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors tracking-wide text-center sm:text-left break-words">
            This site uses mock data. For a custom enterprise solution,{" "}
            <strong className="text-primary font-bold">hire me!</strong>
          </span>
          <span className="text-lg group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 transform-gpu">
            🚀
          </span>
        </div>
      </div>
    </div>
  );
}
