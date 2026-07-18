'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { useToastStore } from '../../store/toast-store';
import apiClient from '../../services/api-client';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthGate() {
  const { login } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  // Auth Form State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Form Signin/Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await apiClient.post('/auth/login', { email, password });
        login(res.data.user, res.data.access_token);
        addToast(`Welcome back, ${res.data.user.first_name}!`);
      } else {
        await apiClient.post('/auth/signup', {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          profile_image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=200`,
        });
        addToast('Account created successfully! Please sign in.', 'success');
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Check details.');
      addToast('Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />

      {/* Auth Box Container */}
      <div className="relative max-w-md w-full mx-4 p-8 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-2xl flex flex-col gap-6 z-10 border border-white/10 dark:border-neutral-850">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <svg className="h-10 w-auto fill-[#FF385C]" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.708-3.386l-.257-.26-.172-.178a31.061 31.061 0 0 1-.366-.396l-.265-.3c-.004-.004-.008-.007-.012-.011L16 26.31l-.283.332-.266.3c-.12.13-.243.262-.367.396l-.171.177-.257.262c-2.152 2.128-4.484 3.386-6.708 3.386-3.48 0-6.357-2.416-6.357-6.478l.002-.228.009-.415c.05-.924.293-1.805.96-3.396l.146-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.298 0-2.275.688-3.23 2.395l-.534 1.024c-1.926 3.774-6.07 12.457-7.051 14.747l-.119.288c-.53 1.263-.73 1.956-.777 2.604l-.008.293-.001.121c0 2.693 1.8 4.25 4.157 4.25 1.542 0 3.364-.99 5.342-2.946l.28-.282.16-.168c.112-.12.227-.246.345-.375l.248-.28.136-.16a10.375 10.375 0 0 0 .61-.832l.065-.102.046-.08.016-.032.008-.018L16 21.31l.07.135.008.018.016.032.046.08.065.102c.162.268.368.547.61.832l.136.16.248.28c.118.13.233.255.345.375l.16.168.28.282c1.978 1.956 3.8 2.946 5.342 2.946 2.358 0 4.157-1.557 4.157-4.25l-.001-.121-.008-.293c-.047-.648-.247-1.341-.777-2.604l-.119-.288c-.98-2.29-5.125-10.973-7.05-14.747l-.535-1.024C18.275 3.688 17.298 3 16 3zm0 9c2.197 0 3.992 1.835 3.992 4.086 0 2.19-1.77 3.974-3.946 4.08l-.228.006c-2.197 0-3.992-1.835-3.992-4.086 0-2.19 1.77-3.974 3.946-4.08l.228-.006zm0 2c-1.1 0-1.992.934-1.992 2.086 0 1.112.853 2.018 1.923 2.08l.069.006c1.1 0 1.992-.934 1.992-2.086 0-1.112-.853-2.018-1.923-2.08L16 14z" />
          </svg>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-white mt-4 font-sans">
            Welcome to Airbnb
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {!isLoginMode && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">Email Address</label>
            <div className="flex items-center border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 bg-white dark:bg-neutral-900 gap-2 focus-within:border-neutral-800 dark:focus-within:border-white transition-colors">
              <Mail size={14} className="text-neutral-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-550 font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">Password</label>
            <div className="flex items-center border border-neutral-350 dark:border-neutral-700 rounded-lg p-2.5 bg-white dark:bg-neutral-900 gap-2 focus-within:border-neutral-800 dark:focus-within:border-white transition-colors relative">
              <Lock size={14} className="text-neutral-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-550 font-semibold pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-bold rounded-xl airbnb-gradient shadow-md active:scale-98 transition-transform disabled:opacity-70 cursor-pointer text-xs uppercase tracking-wide mt-2"
          >
            {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Register Account'}
          </button>

          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-center font-bold underline text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer mt-1"
          >
            {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
