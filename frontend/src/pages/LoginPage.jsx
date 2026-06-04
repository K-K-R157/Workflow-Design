import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { login, register, selectAuthLoading, selectAuthError, clearError } from '../stores/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    let result;
    if (isRegister) {
      result = await dispatch(register({ email, password, name }));
    } else {
      result = await dispatch(login({ email, password }));
    }

    if (!result.error) {
      navigate('/home');
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    dispatch(clearError());
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{
        background: 'var(--color-surface-0)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
            }}>
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isRegister
              ? 'Sign up to start building workflows'
              : 'Sign in to your Workflow Designer account'}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-[12px] font-medium"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
            }}
          >
            {authError}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border-default)',
              backdropFilter: 'blur(20px)',
            }}>

            {/* Name (register only) */}
            {isRegister && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[11px] font-semibold uppercase tracking-wider block"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Name
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <User size={15} style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-gray-600"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider block"
                style={{ color: 'var(--color-text-muted)' }}>
                Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <Mail size={15} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider block"
                style={{ color: 'var(--color-text-muted)' }}>
                Password
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <Lock size={15} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                >
                  {showPassword
                    ? <EyeOff size={15} style={{ color: 'var(--color-text-muted)' }} />
                    : <Eye size={15} style={{ color: 'var(--color-text-muted)' }} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: 'white',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </div>
        </form>

        <p className="text-center mt-6 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={toggleMode} className="cursor-pointer font-medium" style={{ color: '#8b5cf6' }}>
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
