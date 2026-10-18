import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, uid?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleLoginSuccess = (userEmail: string, userUid?: string) => {
    const cleanEmail = userEmail.trim().toLowerCase();
    onSuccess(cleanEmail, userUid);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google auth error:', err);
      setErrorMsg(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSent(false);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          handleLoginSuccess(data.user.email || cleanEmail, data.user.id);
        } else {
          setErrorMsg('Account created. Please check your email to confirm registration.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;

        if (data.user) {
          handleLoginSuccess(data.user.email || cleanEmail, data.user.id);
        }
      }
    } catch (err: any) {
      console.error('Supabase auth error:', err);
      let friendly = 'Authentication failed. Please check your credentials.';

      if (err.message) {
        friendly = err.message;
      }
      setErrorMsg(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to reset password.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetSent(true);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A1810]/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border-2 border-[#D4A017] rounded-sm shadow-2xl p-5 sm:p-8 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm bg-white border border-[#EFE1C8] text-[#2A1810] hover:text-[#9B1C2F] cursor-pointer font-bold"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-[#9B1C2F] text-[#D4A017] border-2 border-[#D4A017] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810]">
            {isSignUp ? 'Create Account' : 'Sign In to Ash Jewellery'}
          </h2>
          <p className="text-xs font-medium text-[#7A6A5C] mt-1">
            {isSignUp
              ? 'Save shipping details & track your jewellery orders'
              : 'Enter your credentials to manage your account & orders'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Reset Notice */}
        {resetSent && (
          <div className="mb-4 p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password reset email sent! Check your inbox.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7A6A5C] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="e.g. Ananya Roy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7A6A5C] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 82088 10579"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A6A5C] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1810]">
                Password *
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-[#9B1C2F] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A6A5C] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 min-h-[44px] rounded-sm border-2 border-[#EFE1C8] bg-white focus:outline-hidden focus:border-[#D4A017] text-xs font-medium text-[#2A1810]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-sm bg-[#9B1C2F] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#D4A017] shadow-md hover:bg-[#7D1626] transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] mt-2"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create My Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EFE1C8]"></div>
          </div>
          <span className="relative px-3 bg-white text-[11px] font-bold uppercase tracking-wider text-[#7A6A5C]">
            Or continue with
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-sm border-2 border-[#EFE1C8] bg-white text-[#2A1810] font-bold text-xs uppercase tracking-wider hover:bg-[#FFF8EC] hover:border-[#D4A017] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle sign in / sign up */}
        <div className="mt-5 text-center text-xs text-[#7A6A5C] font-medium border-t border-[#EFE1C8] pt-4">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                }}
                className="font-bold text-[#9B1C2F] hover:underline cursor-pointer ml-1"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                }}
                className="font-bold text-[#9B1C2F] hover:underline cursor-pointer ml-1"
              >
                Create one now
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
