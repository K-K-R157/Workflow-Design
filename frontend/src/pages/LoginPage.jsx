import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Loader2,
  Check,
} from "lucide-react";
import {
  login,
  register,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from "../stores/authSlice";

const AUTH_CONTENT = {
  login: {
    title: "Welcome back",
    subtitle: "Continue building workflows with clarity and speed.",
    button: "Sign In",
    footer: "Secure authentication with industry-standard encryption.",
  },
  register: {
    title: "Create your account",
    subtitle: "Start designing reliable workflows in minutes.",
    button: "Create Account",
    footer:
      "By signing up, you agree to the Terms of Service and Privacy Policy.",
  },
};

const AuthShell = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-hidden">
    <div className="absolute inset-0" style={{ background: "#0b0b12" }} />
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-300/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_45%)]" />
    </div>
    <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
      {children}
    </div>
  </div>
);

const AuthCard = ({ children }) => (
  <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-9 shadow-[0_24px_80px_rgba(5,7,20,0.55)] backdrop-blur-xl">
    {children}
  </div>
);

const FieldShell = ({ label, icon: Icon, error, children }) => (
  <div className="space-y-2">
    <label className="text-[12px] font-semibold uppercase tracking-wider text-white/60">
      {label}
    </label>
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
        error
          ? "border-red-500/50 bg-red-500/5"
          : "border-white/10 bg-white/5 focus-within:border-white/30"
      }`}
    >
      <Icon size={18} style={{ color: error ? "#ef4444" : "#a3a3b5" }} />
      {children}
    </div>
    {error && <p className="text-[12px] text-red-400">{error}</p>}
  </div>
);

const TextField = ({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <FieldShell label={label} icon={icon} error={error}>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/30"
    />
  </FieldShell>
);

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  isVisible,
  onToggle,
}) => (
  <FieldShell label={label} icon={Lock} error={error}>
    <input
      type={isVisible ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/30"
    />
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full p-1 text-white/60 transition hover:text-white"
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </FieldShell>
);

const StrengthMeter = ({ value }) => {
  if (!value) return null;
  let strength = 0;
  if (value.length >= 8) strength++;
  if (value.length >= 12) strength++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
  if (/\d/.test(value)) strength++;
  if (/[^a-zA-Z\d]/.test(value)) strength++;

  const levels = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#10b981" },
    { label: "Very Strong", color: "#10b981" },
  ];
  const active = Math.min(strength, levels.length);
  const { label, color } = levels[Math.max(active - 1, 0)];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[12px] text-white/60">
        <span>Strength</span>
        <span style={{ color }}>{label}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background: index < active ? color : "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const mode = isRegister ? "register" : "login";
  const content = AUTH_CONTENT[mode];

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Use at least 6 characters";
    }

    if (isRegister) {
      if (!name.trim()) {
        errors.name = "Name is required";
      }
      if (!confirmPassword) {
        errors.confirmPassword = "Confirm your password";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) return;

    let result;
    if (isRegister) {
      result = await dispatch(register({ email, password, name }));
    } else {
      result = await dispatch(login({ email, password }));
    }

    if (!result.error) {
      navigate("/home");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFieldErrors({});
    dispatch(clearError());
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-2xl"
      >
        <AuthCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Zap size={22} className="text-emerald-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {content.title}
                </h1>
                <p className="text-sm text-white/60">{content.subtitle}</p>
              </div>
            </div>

            {authError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] text-red-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <TextField
                    label="Full name"
                    icon={User}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name)
                        setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    placeholder="Jane Doe"
                    error={fieldErrors.name}
                  />
                </motion.div>
              )}

              <TextField
                label="Email address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors({ ...fieldErrors, email: "" });
                }}
                placeholder="you@example.com"
                error={fieldErrors.email}
              />

              <div className="space-y-3">
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  placeholder="••••••••"
                  error={fieldErrors.password}
                  isVisible={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                {isRegister && <StrengthMeter value={password} />}
              </div>

              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <PasswordField
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword)
                        setFieldErrors({
                          ...fieldErrors,
                          confirmPassword: "",
                        });
                    }}
                    placeholder="••••••••"
                    error={fieldErrors.confirmPassword}
                    isVisible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                  {confirmPassword &&
                    password === confirmPassword &&
                    !fieldErrors.confirmPassword && (
                      <p className="mt-2 flex items-center gap-2 text-[12px] text-emerald-300">
                        <Check size={12} /> Passwords match
                      </p>
                    )}
                </motion.div>
              )}

              {!isRegister && (
                <div className="flex items-center justify-between text-[12px] text-white/60">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "#34d399" }}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-emerald-300 transition hover:text-emerald-200"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || Object.keys(fieldErrors).length > 0}
                whileHover={{
                  scale:
                    isLoading || Object.keys(fieldErrors).length > 0 ? 1 : 1.02,
                }}
                whileTap={{
                  scale:
                    isLoading || Object.keys(fieldErrors).length > 0 ? 1 : 0.98,
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #10b981, #22c55e)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isRegister ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {content.button}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="text-center text-[12px] text-white/60">
              {isRegister
                ? "Already have an account?"
                : "New to Workflow Studio?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-emerald-300 transition hover:text-emerald-200"
              >
                {isRegister ? "Sign in" : "Create account"}
              </button>
            </div>

            <p className="text-center text-[11px] text-white/40">
              {content.footer}
            </p>
          </div>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
