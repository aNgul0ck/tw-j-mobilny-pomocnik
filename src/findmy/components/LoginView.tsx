import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowRight, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginView() {
  const { loginWithEmail, registerWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Hasła nie są identyczne.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await registerWithEmail(cleanEmail, password);
      } else {
        await loginWithEmail(cleanEmail, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.1)] text-center flex flex-col items-center border border-[#e8e8ed]"
      >
        {/* Logo Icon */}
        <div className="w-16 h-16 bg-[#1d1d1f] rounded-2xl flex items-center justify-center mb-6 shadow-md shrink-0">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-[#1d1d1f] mb-1">Agencja Bubble Auto</h1>
        <p className="text-[14px] text-[#86868b] leading-relaxed mb-6">
          {isSignUp ? 'Utwórz nowe konto, aby dołączyć do platformy.' : 'Zaloguj się do panelu klienta, aby uzyskać dostęp.'}
        </p>

        {errorMsg && (
          <div className="w-full mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[13px] text-left flex gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3.5 mb-5">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="email"
              required
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl pl-11 pr-4 py-3 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-all"
            />
          </div>

          <div className="relative w-full">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl pl-11 pr-11 py-3 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative w-full overflow-hidden"
              >
                <Lock className="absolute left-4 top-[18px] w-4 h-4 text-[#86868b]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Potwierdź hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl pl-11 pr-4 py-3 text-[14px] mt-1.5 focus:outline-none focus:bg-white focus:border-[#0071e3] transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] text-white px-6 py-3.5 rounded-2xl text-[14.5px] font-semibold hover:bg-[#333336] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Zarejestruj się' : 'Zaloguj się'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-[13.5px] text-[#86868b]">
          {isSignUp ? (
            <span>
              Masz już konto?{' '}
              <button onClick={() => { setIsSignUp(false); setErrorMsg(''); }} className="text-[#0071e3] hover:underline font-medium">
                Zaloguj się
              </button>
            </span>
          ) : (
            <span>
              Nie masz konta?{' '}
              <button onClick={() => { setIsSignUp(true); setErrorMsg(''); }} className="text-[#0071e3] hover:underline font-medium">
                Utwórz konto
              </button>
            </span>
          )}
        </div>

        <div className="w-full mt-6 pt-5 border-t border-[#e8e8ed] text-[12px] text-[#86868b] leading-relaxed">
          Tryb demonstracyjny (frontend). Dane przechowywane lokalnie w przeglądarce.
          <br />
          Zaloguj jako <strong className="text-[#1d1d1f]">antek.golik@gmail.com</strong> aby zobaczyć widok admina.
        </div>
      </motion.div>
    </div>
  );
}
