'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            OV
          </div>
          <span className="font-bold text-lg tracking-tight text-white">GO VOTE</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#hero" className="hover:text-white transition">Home</a>
          <a href="#about" className="hover:text-white transition">About</a>
          <a href="#apply" className="hover:text-white transition">Become Candidate</a>
        </div>

        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/20 border border-blue-400/30"
        >
          Login to Vote
        </Link>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Official University Campus Portal
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            ONLINE VOTING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              SYSTEM
            </span>
          </h1>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-xl">
            Online voting systems are software platforms used to securely conduct votes and elections. As a digital platform, they eliminate the need to cast your votes using paper or having to gather in person.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-xl shadow-blue-600/25 border border-blue-400/30"
            >
              VOTE NOW →
            </Link>
            <a
              href="#about"
              className="px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold text-sm transition border border-slate-700"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Illustration / Preview Card */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Election Status</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live & Active
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">Secure, Real-time & Transparent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Welcome to the official university election portal. Authenticate with your student credentials to participate in active campus elections.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full block text-center py-3 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-600/50"
                >
                  Access Student Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-slate-800/50 border-y border-slate-800 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">About Voting</span>
            <h2 className="text-3xl font-bold text-white">Democracy & Representation</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Voting is a method for a group, such as a meeting or an electorate, in order to make a collective decision or express an opinion usually following discussions, debates or election campaigns. Residents of a place represented by an elected official are called constituents, and those constituents who cast a ballot for their chosen candidate are called voters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="text-2xl">🔒</span>
              <h4 className="font-bold text-white text-sm">Secure Authentication</h4>
              <p className="text-xs text-slate-400">Only verified students with valid registration details can submit official ballots.</p>
            </div>
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="text-2xl">⚡</span>
              <h4 className="font-bold text-white text-sm">Real-time Turnout</h4>
              <p className="text-xs text-slate-400">Live vote standings and percentage tallies updated in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Application Section */}
      <section id="apply" className="max-w-7xl mx-auto px-6 py-16 lg:py-20 w-full">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Electoral Process</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Become a Candidate</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              If you want to become a candidate, click below to log in and request candidate approval. After that, the administrator will review and approve your request so you can run for office.
            </p>
          </div>
          <Link
            href="/login"
            className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition shadow-lg shrink-0"
          >
            Apply as Candidate
          </Link>
        </div>
      </section>

      {/* Footer Bar */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Online Voting System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-slate-300 transition">Home</a>
            <a href="#about" className="hover:text-slate-300 transition">About</a>
            <Link href="/login" className="hover:text-slate-300 transition">Login to Vote</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}