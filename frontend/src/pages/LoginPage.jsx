import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Stub — will integrate with auth when backend arrives
    onNavigate?.('home');
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
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to your Workflow Designer account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border-default)',
              backdropFilter: 'blur(20px)',
            }}>
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: 'white',
              }}
            >
              Sign In
              <ArrowRight size={15} />
            </motion.button>
          </div>
        </form>

        <p className="text-center mt-6 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <button className="cursor-pointer font-medium" style={{ color: '#8b5cf6' }}>
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
