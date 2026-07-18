'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { useModalStore } from '../../store/modal-store';
import { useAuthStore } from '../../store/auth-store';
import { useToastStore } from '../../store/toast-store';
import { Eye, EyeOff } from 'lucide-react';
import apiClient from '../../services/api-client';

export default function AuthModals() {
  const { isLoginOpen, isSignupOpen, closeLogin, closeSignup, openLogin, openSignup } = useModalStore();
  const loginUserStore = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      loginUserStore(res.data.user, res.data.access_token);
      addToast(`Welcome back, ${res.data.user.first_name}!`);
      
      // Reset form
      setEmail('');
      setPassword('');
      closeLogin();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect email or password.');
      addToast('Failed to log in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/signup', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        bio: bio || null,
        profile_image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=200`, // Random nice avatar
      });
      addToast('Account created successfully! Please sign in.', 'success');
      
      // Reset signup-only form states (keep email populated for ease of sign-in)
      setPassword('');
      setFirstName('');
      setLastName('');
      setBio('');
      closeSignup();
      openLogin();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign up. Check your details.');
      addToast('Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={closeLogin} title="Log in" size="sm">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-white mb-3 font-sans">Welcome to Airbnb</div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col border border-neutral-350 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border-b border-neutral-350 dark:border-neutral-700 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
            />
            <div className="flex items-center relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
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
            className="w-full py-3 text-white font-bold rounded-lg airbnb-gradient active:scale-98 transition-transform disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>

          <div className="text-center text-xs text-neutral-500 mt-2">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={openSignup}
              className="font-bold underline text-neutral-800 dark:text-white hover:text-black cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </form>
      </Modal>

      {/* Signup Modal */}
      <Modal isOpen={isSignupOpen} onClose={closeSignup} title="Sign up" size="sm">
        <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
          <div className="text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-white mb-3 font-sans">Create an account</div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col border border-neutral-350 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
            <div className="grid grid-cols-2 border-b border-neutral-350 dark:border-neutral-700">
              <input
                type="text"
                placeholder="First name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-3 border-r border-neutral-350 dark:border-neutral-700 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
              />
              <input
                type="text"
                placeholder="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-3 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border-b border-neutral-350 dark:border-neutral-700 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
            />
            <div className="flex items-center relative border-b border-neutral-350 dark:border-neutral-700">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type="text"
              placeholder="Bio (tell us about yourself)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="px-4 py-3 focus:outline-none bg-transparent text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-bold rounded-lg airbnb-gradient active:scale-98 transition-transform disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Agree & Register'}
          </button>

          <div className="text-center text-xs text-neutral-500 mt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={openLogin}
              className="font-bold underline text-neutral-800 dark:text-white hover:text-black cursor-pointer"
            >
              Log in
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
