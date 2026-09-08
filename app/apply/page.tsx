'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ApplyCandidatePage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Initialize form state from logged-in session
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const regNum = parsed.registrationNumber || parsed.id || '';
          const trailingDigits = regNum.slice(-2) || '01';

          return {
            fullName: parsed.name || `Student ${trailingDigits}`,
            registrationNumber: regNum,
            phoneNumber: parsed.phone || '',
            position: 'President',
            manifesto: '',
            photoUrl: '',
          };
        } catch (err) {
          console.error('Failed to parse student session:', err);
        }
      }
    }
    return {
      fullName: '',
      registrationNumber: '',
      phoneNumber: '',
      position: 'President',
      manifesto: '',
      photoUrl: '',
    };
  });

  // Convert uploaded image file to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setFormData((prev) => ({ ...prev, photoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const positionMap: Record<string, string> = {
      'President': 'pos_1',
      'Vice President': 'pos_2',
      'College Representative (CoICT)': 'pos_3',
      'Sports & Culture Minister': 'pos_4',
    };

    const payload = {
      name: formData.fullName,
      registrationNumber: formData.registrationNumber,
      phoneNumber: formData.phoneNumber,
      positionId: positionMap[formData.position.trim()] || 'pos_1',
      positionName: formData.position.trim(),
      manifesto: formData.manifesto,
      photoUrl: formData.photoUrl,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Submit application to backend API for admin visibility
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. Persist local backup application queue
      const existingApps = JSON.parse(localStorage.getItem('candidateApplications') || '[]');
      localStorage.setItem('candidateApplications', JSON.stringify([...existingApps, { ...payload, id: `app_${Date.now()}` }]));

      if (res.ok) {
        setSubmitted(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to submit candidacy request. Saved locally.');
        setSubmitted(true);
      }
    } catch (err) {
      console.error('API submission error:', err);
      // Fallback local persistence if server endpoint is offline
      const existingApps = JSON.parse(localStorage.getItem('candidateApplications') || '[]');
      localStorage.setItem('candidateApplications', JSON.stringify([...existingApps, { ...payload, id: `app_${Date.now()}` }]));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Application Form</h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete your profile and upload an official portrait for admin ballot verification.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-10 rounded-2xl text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-xl font-bold text-emerald-800">Application Submitted for Review</h2>
            <p className="text-sm text-emerald-700 max-w-lg mx-auto leading-relaxed">
              Your candidate profile, manifesto, and photo have been logged. Once approved by the election commission, your name and photo will appear on the official student ballot.
            </p>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              Back to Student Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Photo Upload Sidebar */}
              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-4">
                <div className="relative w-36 h-36 rounded-full overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Candidate Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-2">
                      <span className="text-2xl block mb-1">📷</span>
                      <span className="text-[10px] text-slate-400 font-medium">No Photo Selected</span>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition inline-block shadow-sm"
                  >
                    {photoPreview ? 'Change Photo' : 'Upload Portrait Photo'}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">Recommended: Passport size image (PNG/JPG)</p>
                </div>
              </div>

              {/* Input Form Controls */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Therapist Jomah"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. 25100529140067"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. +255 700 000 000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Position to Run For</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 transition text-xs"
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="College Representative (CoICT)">College Representative (CoICT)</option>
                      <option value="Sports & Culture Minister">Sports & Culture Minister</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manifesto Goals & Policy Summary</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.manifesto}
                    onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                    placeholder="Outline your primary goals, changes, or student welfare initiatives..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition shadow-md text-xs tracking-wide uppercase mt-4"
            >
              {submitting ? 'Submitting Application...' : 'Submit Candidacy to Admin'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}