import React from 'react';

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
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Overview</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
<span className="material-symbols-outlined" data-icon="store">store</span>
<span>Providers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span>Users</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
<span>Logs</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-transform duration-200 hover:translate-x-1" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span>Settings</span>
</a>
</nav>
<button className="mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-primary-container transition-all active:scale-95">
            New Report
        </button>
<div className="mt-auto pt-6 border-t border-slate-200">
<a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-error transition-colors font-inter text-sm font-semibold uppercase tracking-widest" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
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
<img alt="Admin Profile Avatar" className="w-full h-full object-cover" data-alt="minimalist 3d character avatar with glasses and professional attire for an administrative dashboard profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8emlxSvHwyJG7l_3agofUahSEtjMahXYdOu6tNhLddh5gthmsz4zsyfySCzGrJDu3rjaIVh6oe4BCPbhRj1N8mm-iPHzN8bq3M2sfr7E9r_2d-uublypyciEjJBWsdLYBjYVU-LIM--Qf86FqJYNVShdSkpXjIkDyyCvsbi2SPqJ9yZkNZrj9nizYsriG2_9gyWPcEG9oLVD2WzNLlY9z2KVdQmhS1VVpkIm9l3XPpM-yPBqbGWaSLxr_YdVe96UUs4f6mBuyp-Q"/>
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
<div className="p-3 rounded-xl bg-primary/5 text-primary">
<span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
</div>
<span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
<span className="material-symbols-outlined text-sm mr-1" data-icon="trending_up">trending_up</span> 12%
                        </span>
</div>
<p className="text-secondary text-xs font-label uppercase tracking-widest mb-1">Total Bookings</p>
<h3 className="text-3xl font-headline font-bold text-primary">1,284</h3>
<p className="text-[10px] text-secondary mt-2">vs last 7 days</p>
</div>

<div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-3 rounded-xl bg-orange-50 text-on-tertiary-container">
<span className="material-symbols-outlined" data-icon="person">person</span>
</div>
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
<span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Live</span>
</div>
</div>
<p className="text-secondary text-xs font-label uppercase tracking-widest mb-1">Active Clients</p>
<h3 className="text-3xl font-headline font-bold text-primary">320</h3>
<p className="text-[10px] text-secondary mt-2">Currently browsing services</p>
</div>

<div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-3 rounded-xl bg-blue-50 text-blue-700">
<span className="material-symbols-outlined" data-icon="hail">hail</span>
</div>
<span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">94% Capacity</span>
</div>
<p className="text-secondary text-xs font-label uppercase tracking-widest mb-1">Active Providers</p>
<h3 className="text-3xl font-headline font-bold text-primary">145</h3>
<div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden flex">
<div className="h-full bg-blue-600 w-3/4"></div>
<div className="h-full bg-orange-400 w-1/4"></div>
</div>
</div>
</section>
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

<section className="xl:col-span-2 space-y-6">
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
<div>
<h2 className="text-xl font-headline font-bold text-primary">Provider Performance</h2>
<p className="text-sm text-secondary">Efficiency and rating metrics for top partners</p>
</div>
<div className="flex gap-2">
<select className="text-xs font-semibold rounded-lg border-none bg-surface-container-low text-secondary focus:ring-1 focus:ring-primary">
<option>All Services</option>
<option>Plumbing</option>
<option>Cleaning</option>
</select>
<button className="p-2 rounded-lg bg-surface-container-low text-secondary hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
</button>
</div>
</div>

<div className="w-full h-32 mb-8 bg-slate-50/50 rounded-xl relative overflow-hidden group">
<div className="absolute inset-x-0 bottom-0 h-16 flex items-end">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
<path d="M0 80 Q 50 20 100 60 T 200 40 T 300 70 T 400 30" fill="none" stroke="#DD6B20" strokeWidth="2"></path>
<path d="M0 80 Q 50 20 100 60 T 200 40 T 300 70 T 400 30 L 400 100 L 0 100 Z" fill="url(#grad1)" opacity="0.1"></path>
<defs>
<linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{stopColor: `#DD6B20`, stopOpacity: `1`}}></stop>
<stop offset="100%" style={{stopColor: `#DD6B20`, stopOpacity: `0`}}></stop>
</linearGradient>
</defs>
</svg>
</div>
<div className="absolute top-4 left-6 flex items-center gap-2">
<span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest">Jobs Completed Over Time</span>
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="text-[10px] uppercase tracking-widest text-secondary border-b border-surface-container">
<th className="pb-4 font-semibold">Provider Name</th>
<th className="pb-4 font-semibold">Rating</th>
<th className="pb-4 font-semibold">Jobs</th>
<th className="pb-4 font-semibold">Avg Response</th>
<th className="pb-4 font-semibold">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="group hover:bg-slate-50/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
<img alt="Provider" data-alt="professional headshot of a service provider smiling, clean background, friendly tech-professional vibe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHE1p3aYuxeDKcueQrEsp1IPmKp5Gk4nnyI9ZUNya_G2EPIjnZe9KGPnZtn9RqhtbJl6d3SKefhkg0hK2jREtf2lB97kZfLAA3rUpXxWdo5OJCMImSuT44z-5lDcN6Sor_Gh971hDPM_YXtUGlzXj5Mq8aPj1NTB057ldblptKzvn0YYSp2RI4xrQIeSKucFLM5I3NORBdQwStz8FtEjI3pR7FcsRZCboWEVpEJKmRab0T-lzg0hfYsV3a1Hh4ZR7eK0tDqaYDNZk"/>
</div>
<span className="text-sm font-semibold text-primary">Marco Velasquez</span>
</div>
</td>
<td className="py-4">
<div className="flex text-orange-400">
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
</div>
</td>
<td className="py-4 text-sm font-medium text-secondary">412</td>
<td className="py-4 text-sm font-medium text-secondary">4m 20s</td>
<td className="py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 uppercase ring-1 ring-green-100 shadow-[0_0_10px_rgba(34,197,94,0.1)]">Active</span>
</td>
</tr>
<tr className="group hover:bg-slate-50/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
<img alt="Provider" data-alt="modern professional woman portrait, corporate soft lighting, blurred office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMkWcQIwdOz3c1A_1X-GSdqT1rr_bQDjAJS_LoR3cWF-_7lSq7akThOOKtAhN2-2mDJk0F11SIk4w4ByN852nQude8PW7CZGWo7gmjtYNfO_-5K7wnUK7Z7kNe-5Glbhmggmkk_kEOo1B-TBhWwou3NYV5kBk2yiP1OYqVlwMZXzsCv8Ciwpwfx-a8e8c_O2EC1NRlQ-52-3qDAIGi49CeBr2BdHgaEOkOKwC8oys6ql5RTkBVJMgw1t1SttMc_rfgneqVOFSvpbs"/>
</div>
<span className="text-sm font-semibold text-primary">Sarah Jenkins</span>
</div>
</td>
<td className="py-4">
<div className="flex text-orange-400">
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm">star</span>
</div>
</td>
<td className="py-4 text-sm font-medium text-secondary">289</td>
<td className="py-4 text-sm font-medium text-secondary">12m 45s</td>
<td className="py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-500 uppercase ring-1 ring-slate-100">Average</span>
</td>
</tr>
<tr className="group hover:bg-slate-50/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
<img alt="Provider" data-alt="professional male portrait with high contrast, tech startup profile photo style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALUNaLyY21baVVKfMOD2Z1KsY3X_7UMj33MGFHg5rOKLC7YTyaSrAik-ISIXiMbUJdeXJyDzPeZZc-WsWMNxHUYyVo4k1MNYB7YByGg_WvepuuPl2VJl3vatZhfY9DgYF7Dx8SW_I89IxCzfn9ac4-ALalvI-1aTqu1UTSpTJCKeBfvdClMge3RSK7LPAfZDxJhyubNmaSI2Py5jofmjaMD4CSfDHHo4cFmfv2sPVdka4zKHu2t69pRE7gtijgoaBmpC_wSAwh2Wk"/>
</div>
<span className="text-sm font-semibold text-primary">Thomas Wayne</span>
</div>
</td>
<td className="py-4">
<div className="flex text-orange-400">
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm" style={{fontVariationSettings: `'FILL' 1`}}>star</span>
<span className="material-symbols-outlined text-sm">star</span>
<span className="material-symbols-outlined text-sm">star</span>
<span className="material-symbols-outlined text-sm">star</span>
</div>
</td>
<td className="py-4 text-sm font-medium text-secondary">54</td>
<td className="py-4 text-sm font-medium text-secondary">48m 12s</td>
<td className="py-4">
<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-700 uppercase ring-1 ring-orange-100 shadow-[0_0_10px_rgba(221,107,32,0.1)]">Low</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>

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
<div className="bg-primary text-on-primary p-8 rounded-xl shadow-[0_20px_50px_rgba(0,32,69,0.3)] relative overflow-hidden">

<div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
<h2 className="text-xl font-headline font-bold mb-8 relative z-10">User Distribution</h2>
<div className="flex justify-center mb-8 relative z-10">

<div className="w-48 h-48 rounded-full border-[16px] border-primary-container relative flex items-center justify-center">
<div className="absolute inset-0 w-full h-full rounded-full border-[16px] border-on-tertiary-container border-t-transparent border-l-transparent -rotate-45"></div>
<div className="text-center">
<span className="text-4xl font-headline font-bold">82%</span>
<p className="text-[10px] uppercase tracking-widest text-on-primary-container font-semibold">Retention</p>
</div>
</div>
</div>
<div className="space-y-4 relative z-10">
<div className="flex items-center justify-between p-3 bg-primary-container/40 rounded-xl">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-sm bg-on-tertiary-container"></span>
<span className="text-sm font-medium">Active Providers</span>
</div>
<span className="font-bold">145</span>
</div>
<div className="flex items-center justify-between p-3 bg-primary-container/40 rounded-xl">
<div className="flex items-center gap-3">
<span className="w-3 h-3 rounded-sm bg-blue-300"></span>
<span className="text-sm font-medium">Active Clients</span>
</div>
<span className="font-bold">320</span>
</div>
<div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2">
<span className="text-green-400 font-bold text-sm">+25</span>
<span className="text-xs text-on-primary-container">new users joined today</span>
</div>
</div>
</div>

<div className="glass-card p-8 rounded-xl border border-white/60 shadow-sm group cursor-pointer overflow-hidden relative">
<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="relative z-10">
<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-primary" data-icon="cloud_download">cloud_download</span>
</div>
<h3 className="font-headline font-bold text-primary mb-2">Export Data</h3>
<p className="text-xs text-secondary leading-relaxed mb-4">Generate comprehensive CSV reports for accounting and compliance.</p>
<span className="text-xs font-bold text-on-tertiary-container flex items-center gap-1">
                                Download Latest <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</span>
</div>
</div>

<div className="bg-surface-container-low p-6 rounded-xl">
<p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-4">Recent Feedback</p>
<div className="flex gap-3">
<div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0">
<img alt="User" className="w-full h-full object-cover rounded-full" data-alt="close-up of person face for feedback avatar, blurred background, friendly and authentic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2JdH_oJBj4eZneoh3GAqMlC8PJ14MUjImRBOMMMo3wwYpNOwALloBLyn7cChRRuFS_b69rOEetnX1geqM5yF2jX5NntwhOLxfIq6sfFMKMup-yq9sI1kewNDiHLZL64Zj8UN4r1SIu2goQQSvEwXo7AcnG9A19WRVzSP9aw3YH4g36dm7uBUjDl6fR-uGXWI7UUv25IOcRIJ40LB783MI8c0LimFq6XBQLoZQjQOX3LJXfLn8KXFshghWjFKzN5t0PIZmWWvXY0s"/>
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
