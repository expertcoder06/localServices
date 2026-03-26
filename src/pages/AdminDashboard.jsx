import React from 'react';
import UserActivityDistribution from '../components/UserActivityDistribution';

export default function AdminDashboard() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed w-full min-h-screen">


      <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-950 flex flex-col h-full p-6 gap-4 shadow-none z-50">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg">
            <span className="material-symbols-outlined" data-icon="settings_suggest">settings_suggest</span>
          </div>
          <div>
            <h2 className="font-headline text-sm font-bold tracking-tight text-primary">Admin Panel</h2>
            <p className="text-[10px] text-secondary font-label uppercase tracking-widest">Management Suite</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">

          <a className="flex items-center gap-3 px-4 py-3 text-orange-600 dark:text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl shadow-[0_0_15px_rgba(221,107,32,0.15)] font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="text-xl">📊</span>
            <span>Overview</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="text-xl">👷</span>
            <span>Service Providers</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="text-xl">👥</span>
            <span>All Users</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="text-xl">📜</span>
            <span>Live Log Activity</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-error transition-colors font-inter text-sm font-semibold uppercase tracking-widest" href="#">
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main className="ml-64 min-h-screen relative pb-12">

        <header className="sticky top-0 w-full flex justify-between items-center px-8 py-4 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-xl z-40">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter text-blue-900 dark:text-blue-100 font-headline">LOCAL-SERVICES</span>
            <div className="hidden md:flex gap-6">
              <a className="font-space-grotesk text-sm font-medium tracking-tight text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 pb-1" href="#">Dashboard</a>
              <a className="font-space-grotesk text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400 hover:text-blue-700 transition-colors" href="#">Reports</a>
              <a className="font-space-grotesk text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400 hover:text-blue-700 transition-colors" href="#">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined text-slate-500 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all" data-icon="notifications">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
            </div>
            <span className="material-symbols-outlined text-slate-500 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all" data-icon="settings">settings</span>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img alt="Admin Profile Avatar" className="w-full h-full object-cover" data-alt="minimalist 3d character avatar with glasses and professional attire for an administrative dashboard profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8emlxSvHwyJG7l_3agofUahSEtjMahXYdOu6tNhLddh5gthmsz4zsyfySCzGrJDu3rjaIVh6oe4BCPbhRj1N8mm-iPHzN8bq3M2sfr7E9r_2d-uublypyciEjJBWsdLYBjYVU-LIM--Qf86FqJYNVShdSkpXjIkDyyCvsbi2SPqJ9yZkNZrj9nizYsriG2_9gyWPcEG9oLVD2WzNLlY9z2KVdQmhS1VVpkIm9l3XPpM-yPBqbGWaSLxr_YdVe96UUs4f6mBuyp-Q" />
            </div>
          </div>
        </header>
        <div className="px-8 mt-8">
          <div className="mb-10">
            <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">System Overview</h1>
            <div className="h-0.5 w-16 bg-on-tertiary-container mt-2"></div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

            <div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
                  📅
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Total Bookings</p>
              <h3 className="text-3xl font-headline font-bold text-primary">1,284</h3>
              <p className="text-[10px] text-secondary mt-2">vs last 7 days</p>
            </div>

            <div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Active Clients</p>
              <h3 className="text-3xl font-headline font-bold text-primary">320</h3>
              <p className="text-[10px] text-secondary mt-2">Currently browsing services</p>
            </div>

            <div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                  🙋‍♂️
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Active Providers</p>
              <h3 className="text-3xl font-headline font-bold text-primary">145</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden flex">
                <div className="h-full bg-blue-600 w-3/4"></div>
                <div className="h-full bg-orange-400 w-1/4"></div>
              </div>
            </div>
          </section>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            <section className="xl:col-span-2 space-y-6">
              <UserActivityDistribution />

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-headline font-bold text-primary">Live Activity Logs</h2>
                  <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    View Full Audit <span className="material-symbols-outlined text-sm" data-icon="arrow_outward">arrow_outward</span>
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-4">

                    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border-l-4 border-green-500 bg-white shadow-sm">
                      <span className="text-[10px] font-bold text-secondary w-12 pt-1 uppercase">14:02</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">Lina Brooks <span className="font-normal text-secondary">completed</span> Home Deep Clean</p>
                        <p className="text-[10px] text-secondary mt-1 tracking-tight">Booking ID: #LCS-9921 • Payment Processed</p>
                      </div>
                      <span className="material-symbols-outlined text-green-500" data-icon="check_circle">check_circle</span>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border-l-4 border-orange-400 bg-white shadow-sm">
                      <span className="text-[10px] font-bold text-secondary w-12 pt-1 uppercase">13:58</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">Derrick Mason <span className="font-normal text-secondary">placed bid</span> for Pipe Repair</p>
                        <p className="text-[10px] text-secondary mt-1 tracking-tight">Awaiting client response • 3 competitive bids</p>
                      </div>
                      <span className="material-symbols-outlined text-orange-400" data-icon="pending">pending</span>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border-l-4 border-error bg-white shadow-sm">
                      <span className="text-[10px] font-bold text-secondary w-12 pt-1 uppercase">13:45</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">System Alert <span className="font-normal text-secondary">failed login</span> attempt</p>
                        <p className="text-[10px] text-secondary mt-1 tracking-tight">IP: 192.168.1.104 • Suspicious pattern detected</p>
                      </div>
                      <span className="material-symbols-outlined text-error" data-icon="warning">warning</span>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border-l-4 border-green-500 bg-white shadow-sm">
                      <span className="text-[10px] font-bold text-secondary w-12 pt-1 uppercase">13:30</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">Kevin Hart <span className="font-normal text-secondary">verified</span> as Master Plumber</p>
                        <p className="text-[10px] text-secondary mt-1 tracking-tight">Credentials checked • Account upgraded</p>
                      </div>
                      <span className="material-symbols-outlined text-green-500" data-icon="verified">verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">


              <div className="bg-surface-container-low p-6 rounded-xl">
                <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-4">Recent Feedback</p>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0">
                    <img alt="User" className="w-full h-full object-cover rounded-full" data-alt="close-up of person face for feedback avatar, blurred background, friendly and authentic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2JdH_oJBj4eZneoh3GAqMlC8PJ14MUjImRBOMMMo3wwYpNOwALloBLyn7cChRRuFS_b69rOEetnX1geqM5yF2jX5NntwhOLxfIq6sfFMKMup-yq9sI1kewNDiHLZL64Zj8UN4r1SIu2goQQSvEwXo7AcnG9A19WRVzSP9aw3YH4g36dm7uBUjDl6fR-uGXWI7UUv25IOcRIJ40LB783MI8c0LimFq6XBQLoZQjQOX3LJXfLn8KXFshghWjFKzN5t0PIZmWWvXY0s" />
                  </div>
                  <div>
                    <p className="text-xs italic text-primary">"The response time from providers has improved significantly this month. Loving the new bidding UI!"</p>
                    <p className="text-[10px] font-bold text-secondary mt-2">— Alex Rivera, Platinum Client</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}
