'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [regNumber, setRegNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationNumber: regNumber,
          fullName: fullName.trim(),
          phone: phoneNumber.trim()
        }),
      });

      // Safely parse JSON response
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      // Merge user response with form inputs to ensure session holds full details
      const userSession = {
        ...data.user,
        name: fullName.trim() || data.user?.name || `Student ${regNumber.slice(-2)}`,
        phone: phoneNumber.trim() || data.user?.phone || '',
      };

      // Store user session in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userSession));

      // Redirect based on role
      if (userSession.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Voter Portal Login</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your student details to access the election portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Number / Admin ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 25100529140028 or ADMIN001"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +255 700 000 000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition font-medium text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-100">
          <p>Demo Student Reg: <span className="font-mono text-slate-700 font-semibold">25100529140028</span></p>
          <p>Demo Admin Reg: <span className="font-mono text-slate-700 font-semibold">ADMIN001</span></p>
        </div>
      </div>
    </main>
  );
}