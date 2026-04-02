import React, { useState } from "react";
import { Layers, Mail, Lock, User, Shield, AlertCircle, ArrowRight } from "lucide-react";

export default function Login({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // 'student' | 'admin'
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = "Name is required.";
    
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      try {
        if (isLogin) {
          onLogin(formData.email, formData.password);
        } else {
          onRegister(formData.name, formData.email, formData.password, formData.role);
        }
      } catch (err) {
        setAuthError(err.message);
        setLoading(false);
      }
    }, 600);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setAuthError("");
    setFormData({ name: "", email: "", password: "", role: "student" });
  };

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center p-4 py-12 relative font-outfit text-white">
      <div className="relative z-10 w-full max-w-md px-2 flex flex-col items-center animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-6 relative z-20">
          <div className="bg-primary/20 p-4 rounded-3xl inline-block mb-3 border border-primary/30 shadow-glow-sm">
            <Layers className="w-10 h-10 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Eazy<span className="text-primary">Assign</span>
          </h1>
        </div>

        <div className="glass-panel w-full p-6 sm:p-8 rounded-3xl shadow-4xl backdrop-blur-xl border border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-1 text-white">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-textMuted text-sm mb-6">
            {isLogin ? "Enter your credentials to access your dashboard." : "Join to manage assignments effortlessly."}
          </p>

          {authError && (
            <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2 text-danger text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-slideDown">
                <label className="block text-xs font-medium text-textMuted mb-1.5 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    className={`input-field pl-11 bg-black/40 border h-12 transition-all w-full focus:outline-none focus:ring-2 ${errors.name ? 'border-danger/50 focus:ring-danger/20' : 'border-white/10 focus:ring-primary/20'}`}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-danger text-xs mt-1.5 ml-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-textMuted mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  className={`input-field pl-11 bg-black/40 border h-12 transition-all w-full focus:outline-none focus:ring-2 ${errors.email ? 'border-danger/50 focus:ring-danger/20' : 'border-white/10 focus:ring-primary/20'}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-danger text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-textMuted mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  className={`input-field pl-11 bg-black/40 border h-12 transition-all w-full focus:outline-none focus:ring-2 ${errors.password ? 'border-danger/50 focus:ring-danger/20' : 'border-white/10 focus:ring-primary/20'}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && <p className="text-danger text-xs mt-1.5 ml-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="animate-slideDown pt-2">
                <label className="block text-xs font-medium text-textMuted mb-2 ml-1">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "student" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 font-medium ${formData.role === 'student' ? 'bg-primary/20 border-primary text-white shadow-glow-sm' : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10'}`}
                  >
                    <User className="w-4 h-4" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "admin" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 font-medium ${formData.role === 'admin' ? 'bg-warning/20 border-warning text-warning shadow-[0_0_15px_rgba(255,184,0,0.3)]' : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10'}`}
                  >
                    <Shield className="w-4 h-4" /> Professor
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-12 mt-6 flex items-center justify-center gap-2 shadow-glow active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-semibold text-base">{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-textMuted hover:text-white transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-primary font-medium hover:underline">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-primary font-medium hover:underline">Log in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Demo Credentials Helper */}
        {isLogin && (
          <div className="mt-8 animate-fadeIn py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-xs text-textMuted text-center max-w-sm w-full">
            <p className="font-semibold text-white/90 mb-2 uppercase tracking-wide text-[10px]">Demo Credentials</p>
            <div className="flex flex-col gap-1.5">
              <p className="flex justify-between border-b border-white/5 pb-1"><span className="opacity-70">Professor</span><strong className="text-warning font-mono">admin@prof.com <span className="text-white/40 px-1">/</span> admin123</strong></p>
              <p className="flex justify-between pt-1"><span className="opacity-70">Student</span><strong className="text-primary font-mono">alex@student.com <span className="text-white/40 px-1">/</span> password123</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
