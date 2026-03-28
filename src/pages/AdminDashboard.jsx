import React, { useEffect, useState } from 'react';
import UserActivityDistribution from '../components/UserActivityDistribution';
import { supabase } from '../utils/supabaseClient';

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [complaints, setComplaints] = useState([]);
  
  useEffect(() => {
    const fetchAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminData({ email: user.email });
      }
    };
    const fetchPendingProviders = async () => {
      const { data } = await supabase.from('service_providers').select('*').eq('status', 'pending');
      if (data) setPendingProviders(data);
    };
    const fetchAllUsers = async () => {
      const { data: consumers } = await supabase.from('consumers').select('*');
      const { data: providers } = await supabase.from('service_providers').select('*');
      
      const combined = [
        ...(consumers || []).map(c => ({ ...c, userType: 'Consumer' })),
        ...(providers || []).map(p => ({ ...p, userType: 'Provider' }))
      ];
      // sort by created_at descending
      combined.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      setAllUsers(combined);
    };

    const fetchComplaints = async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*, jobs(title), consumers:user_id(name)')
        .order('created_at', { ascending: false });
      if (data) setComplaints(data);
    };

    fetchAdmin();
    fetchPendingProviders();
    fetchAllUsers();
    fetchComplaints();
  }, [activeTab]); // Refetch when tabs change to keep data fresh

  const handleApprove = async (id) => {
    await supabase.from('service_providers').update({ status: 'approved', rejection_reason: null }).eq('id', id);
    setPendingProviders(prev => prev.filter(p => p.id !== id));
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (reason) {
      await supabase.from('service_providers').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
      setPendingProviders(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">System Overview</h1>
              <div className="h-0.5 w-16 bg-on-tertiary-container mt-2"></div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card p-6 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] border border-white/40 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">📅</div>
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
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">👤</div>
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
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🙋‍♂️</div>
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

            <div className="grid grid-cols-1 gap-8">
              <aside className="space-y-6">
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-4">Recent Feedback</p>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0">
                      <img alt="User" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2JdH_oJBj4eZneoh3GAqMlC8PJ14MUjImRBOMMMo3wwYpNOwALloBLyn7cChRRuFS_b69rOEetnX1geqM5yF2jX5NntwhOLxfIq6sfFMKMup-yq9sI1kewNDiHLZL64Zj8UN4r1SIu2goQQSvEwXo7AcnG9A19WRVzSP9aw3YH4g36dm7uBUjDl6fR-uGXWI7UUv25IOcRIJ40LB783MI8c0LimFq6XBQLoZQjQOX3LJXfLn8KXFshghWjFKzN5t0PIZmWWvXY0s" />
                    </div>
                    <div>
                      <p className="text-xs italic text-primary">"The response time from providers has improved significantly this month. Loving the new bidding UI!"</p>
                      <p className="text-[10px] font-bold text-secondary mt-2">— Alex Rivera, Platinum Client</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        );
      
      case 'providers':
        return (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Service Providers</h1>
              <div className="h-0.5 w-16 bg-on-tertiary-container mt-2"></div>
            </div>
            
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold text-primary">Pending Approvals</h2>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{pendingProviders.length} Pending</span>
              </div>
              
              {pendingProviders.length === 0 ? (
                <p className="text-sm text-secondary italic">No pending providers at the moment.</p>
              ) : (
                <div className="space-y-6">
                  {pendingProviders.map(provider => (
                    <div key={provider.id} className="flex flex-col p-6 rounded-xl border border-slate-100 bg-slate-50 gap-4 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary">{provider.name || 'Unnamed Provider'}</h3>
                          <p className="text-sm text-secondary mt-1">{provider.email} • {provider.phone}</p>
                          <p className="text-sm text-slate-500 mt-1">Location: {provider.city}, {provider.state}</p>
                          <p className="text-sm text-slate-500 mt-1">Profession: {provider.profession}</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button onClick={() => handleApprove(provider.id)} className="flex-1 sm:flex-none px-6 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-green-600 transition-colors">Approve Application</button>
                          <button onClick={() => handleReject(provider.id)} className="flex-1 sm:flex-none px-6 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">Reject Application</button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-primary mb-3">Uploaded Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-2 aspect-video overflow-hidden">
                             {provider.photo_url ? <img src={provider.photo_url} alt="Profile" className="object-cover w-full h-full rounded" /> : <span className="text-xs text-slate-400">No Photo</span>}
                             <span className="text-xs font-semibold text-slate-600">Profile Photo</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-2 aspect-video overflow-hidden">
                             {provider.aadhar_url ? <img src={provider.aadhar_url} alt="Aadhar" className="object-cover w-full h-full rounded" /> : <span className="text-xs text-slate-400">No Aadhar</span>}
                             <span className="text-xs font-semibold text-slate-600">Aadhar Card</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-2 aspect-video overflow-hidden">
                             {provider.pan_url ? <img src={provider.pan_url} alt="PAN" className="object-cover w-full h-full rounded" /> : <span className="text-xs text-slate-400">No PAN</span>}
                             <span className="text-xs font-semibold text-slate-600">PAN Card</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )

      case 'users':
        const filteredUsers = allUsers.filter(u => u.id.toLowerCase().includes(searchUserId.toLowerCase()) || (u.name && u.name.toLowerCase().includes(searchUserId.toLowerCase())));
        return (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">All Users Database</h1>
              <div className="h-0.5 w-16 bg-on-tertiary-container mt-2"></div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)] mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-headline font-bold text-primary">User Directory</h2>
                  <p className="text-sm text-secondary">View and manage all consumers and providers.</p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                  <input 
                    type="text" 
                    placeholder="Search by Unique ID or Name..." 
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Unique ID</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">{user.id.substring(0, 13)}...</td>
                        <td className="py-3 px-4 text-sm font-semibold text-primary">{user.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-secondary">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${user.userType === 'Consumer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.userType === 'Provider' ? (
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${user.status === 'approved' ? 'bg-green-50 text-green-600' : user.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                              {user.status}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-50 text-green-600">active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-secondary text-sm">No users found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )

      case 'reports':
        return (
          <>
             <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Reported Users & Spam</h1>
              <div className="h-0.5 w-16 bg-red-400 mt-2"></div>
            </div>
            
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xl flex-shrink-0">⚠️</div>
                  <div>
                    <h3 className="font-bold text-red-800">Action Required</h3>
                    <p className="text-sm text-red-600 max-w-2xl mt-1">These users have been flagged by the system or reported by other users for terms of service violations, spamly behavior, or unprofessional conduct.</p>
                  </div>
              </div>

              {/* Placeholder table for Reports */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Report ID</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Job / User</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Description</th>
                      <th className="py-3 px-4 text-xs font-bold text-secondary uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(rpt => (
                      <tr key={rpt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-xs font-mono text-slate-500">#{rpt.id.substring(0,8)}</td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-primary">{rpt.jobs?.title || 'Unknown Job'}</p>
                          <p className="text-xs text-slate-400">By: {rpt.consumers?.name || 'User'} ({rpt.user_type})</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                            rpt.issue_type === 'no_show' ? 'bg-red-50 text-red-700 border-red-100' : 
                            rpt.issue_type === 'delay' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {rpt.issue_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-secondary max-w-xs truncate">{rpt.description}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                             <button 
                              onClick={async () => {
                                if (window.confirm("Approve this report and mark as resolved?")) {
                                  await supabase.from('complaints').update({ status: 'resolved' }).eq('id', rpt.id);
                                  setComplaints(prev => prev.filter(c => c.id !== rpt.id));
                                }
                              }}
                              className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-wide"
                             >Resolve</button>
                             {rpt.photo_proof && <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide" onClick={() => window.open(rpt.photo_proof, '_blank')}>View Proof</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {complaints.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-secondary text-sm italic">No active reports found. Clean slate!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )

      case 'analytics':
        return (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Platform Analytics</h1>
              <div className="h-0.5 w-16 bg-blue-400 mt-2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
                <h3 className="text-lg font-bold text-primary mb-4">Engagement Benchmarks</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-secondary">Average Session Duration</span><span className="font-bold text-primary">4m 12s</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '65%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-secondary">Booking Conversion Rate</span><span className="font-bold text-primary">28.4%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: '28%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-secondary">Provider Response Time</span><span className="font-bold text-primary">15m avg</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full" style={{width: '85%'}}></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
                <h3 className="text-lg font-bold text-primary mb-4">Growth & Peak Trends</h3>
                <div className="h-32 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
                   {[40, 55, 30, 70, 90, 60, 100].map((h, i) => (
                     <div key={i} className="w-full bg-orange-100 rounded-t-sm hover:bg-orange-200 transition-colors relative group">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">+{h}%</div>
                        <div className="bg-orange-400 w-full rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            <UserActivityDistribution />
          </>
        )

      case 'activity':
        return (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Manage Recent Activity</h1>
              <div className="h-0.5 w-16 bg-on-tertiary-container mt-2"></div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_0_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold text-primary">Live Activity Logs</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Listening</span>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-4">
                  {[
                    { id: 1, time: "14:02", user: "Lina Brooks", action: "completed Home Deep Clean", details: "Booking ID: #LCS-9921 • Payment Processed", icon: "✅", statusColor: "text-green-500", borderColor: "border-green-500" },
                    { id: 2, time: "13:58", user: "Derrick Mason", action: "placed bid for Pipe Repair", details: "Awaiting client response • 3 bids", icon: "⏳", statusColor: "text-yellow-500", borderColor: "border-yellow-500" },
                    { id: 3, time: "13:45", user: "System Alert", action: "failed login attempt", details: "IP: 192.168.1.104 • Suspicious pattern detected", icon: "⚠️", statusColor: "text-red-500", borderColor: "border-red-500" },
                    { id: 4, time: "13:30", user: "Kevin Hart", action: "verified as Master Plumber", details: "Credentials checked • Account upgraded", icon: "🛡️", statusColor: "text-blue-500", borderColor: "border-blue-500" },
                    { id: 5, time: "12:15", user: "Amanda Jones", action: "requested Salon Service", details: "Category: Beauty • Priority: Standard", icon: "💅", statusColor: "text-purple-500", borderColor: "border-purple-500" },
                    { id: 6, time: "11:50", user: "John Doe", action: "left a 5-star review", details: "Review for Provider #928", icon: "⭐", statusColor: "text-orange-400", borderColor: "border-orange-400" },
                  ].map((log) => (
                    <div key={log.id} className={`flex gap-4 p-5 rounded-xl hover:bg-slate-50 transition-all border-l-4 ${log.borderColor} bg-white shadow-sm group/log`}>
                      <div className="w-16 flex-shrink-0">
                        <span className="text-xs font-headline font-bold text-slate-500 uppercase tracking-tight">{log.time}</span>
                        <span className="block text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">Today</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">
                          <span className="text-blue-600 dark:text-blue-400">{log.user}</span>
                          <span className="font-normal text-secondary ml-2">{log.action}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">{log.details}</p>
                      </div>
                      <span className={`text-2xl flex items-center justify-center transition-transform group-hover/log:scale-125 ${log.statusColor}`}>
                        {log.icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed w-full min-h-screen">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-950 flex flex-col h-full p-6 gap-4 shadow-[12px_0_32px_0_rgba(0,0,0,0.02)] z-50">
        <nav className="flex-1 space-y-2">
          <a onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === 'overview' ? 'text-orange-600 dark:text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-[0_4px_15px_rgba(221,107,32,0.15)] translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800'}`}>
            <span className="text-xl">📊</span>
            <span>Overview</span>
          </a>
          <a onClick={() => setActiveTab('providers')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === 'providers' ? 'text-orange-600 dark:text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-[0_4px_15px_rgba(221,107,32,0.15)] translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800'}`}>
            <span className="text-xl">👷</span>
            <span>Service Providers</span>
          </a>
          <a onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === 'users' ? 'text-orange-600 dark:text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-[0_4px_15px_rgba(221,107,32,0.15)] translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800'}`}>
            <span className="text-xl">👥</span>
            <span>All Users</span>
          </a>
          <a onClick={() => setActiveTab('activity')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-sm font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === 'activity' ? 'text-orange-600 dark:text-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-[0_4px_15px_rgba(221,107,32,0.15)] translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800'}`}>
            <span className="text-xl">📜</span>
            <span>Live Activity</span>
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200">
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin-login'; }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-inter text-sm font-semibold uppercase tracking-widest text-left">
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen relative pb-12 bg-surface">
        <header className="sticky top-0 w-full flex justify-between items-center px-8 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter text-blue-900 dark:text-blue-100 font-headline">LOCAL-SERVICES</span>
            <div className="hidden md:flex gap-6">
              <a onClick={() => setActiveTab('overview')} className={`font-space-grotesk text-sm font-bold tracking-wide cursor-pointer transition-all ${activeTab === 'overview' ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700 hover:border-b-2 hover:border-blue-700 hover:pb-1'}`}>Dashboard</a>
              <a onClick={() => setActiveTab('reports')} className={`font-space-grotesk text-sm font-bold tracking-wide cursor-pointer transition-all ${activeTab === 'reports' ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700 hover:border-b-2 hover:border-blue-700 hover:pb-1'}`}>Reports</a>
              <a onClick={() => setActiveTab('analytics')} className={`font-space-grotesk text-sm font-bold tracking-wide cursor-pointer transition-all ${activeTab === 'analytics' ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700 hover:border-b-2 hover:border-blue-700 hover:pb-1'}`}>Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined text-slate-500 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all" data-icon="notifications">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white shadow-sm"></span>
            </div>
            <span className="material-symbols-outlined text-slate-500 cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all" data-icon="settings">settings</span>
            
            <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="font-headline text-sm font-bold tracking-tight text-primary">Administrator</p>
                <p className="text-[10px] text-secondary font-label">{adminData?.email || 'Loading...'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden ring-2 ring-transparent hover:ring-orange-200 transition-all cursor-pointer">
                <img alt="Admin Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8emlxSvHwyJG7l_3agofUahSEtjMahXYdOu6tNhLddh5gthmsz4zsyfySCzGrJDu3rjaIVh6oe4BCPbhRj1N8mm-iPHzN8bq3M2sfr7E9r_2d-uublypyciEjJBWsdLYBjYVU-LIM--Qf86FqJYNVShdSkpXjIkDyyCvsbi2SPqJ9yZkNZrj9nizYsriG2_9gyWPcEG9oLVD2WzNLlY9z2KVdQmhS1VVpkIm9l3XPpM-yPBqbGWaSLxr_YdVe96UUs4f6mBuyp-Q" />
              </div>
            </div>
          </div>
        </header>

        <div className="px-10 mt-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
