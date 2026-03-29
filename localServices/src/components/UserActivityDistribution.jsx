import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserActivityDistribution = () => {
  // --- MOCK DATA ---
  const clientsData = { active: 320, inactive: 125, logins: 840, jobs: 412 };
  const providersData = { active: 145, inactive: 34, logins: 310, jobs: 289 };

  const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // --- BAR CHART: Comparison ---
  const barData = {
    labels: ['Active Logins', 'Completed Actions'],
    datasets: [
      {
        label: 'Clients',
        data: [clientsData.logins, clientsData.jobs],
        backgroundColor: '#60a5fa', // Blue
        borderRadius: 8,
      },
      {
        label: 'Providers',
        data: [providersData.logins, providersData.jobs],
        backgroundColor: '#f97316', // Orange
        borderRadius: 8,
      },
    ],
  };

  // --- PIE CHART: Activity States ---
  const pieData = {
    labels: ['Active Clients', 'Inactive Clients', 'Active Providers', 'Inactive Providers'],
    datasets: [
      {
        data: [clientsData.active, clientsData.inactive, providersData.active, providersData.inactive],
        backgroundColor: [
          '#28a745', // Active Clients: Green
          '#6c757d', // Inactive Clients: Gray
          '#007bff', // Active Providers: Blue
          '#fd7e14', // Inactive Providers: Orange / Amber
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  // --- AREA CHART: 7-Day Trend ---
  const lineData = {
    labels: last7Days,
    datasets: [
      {
        fill: true,
        label: 'Active Clients',
        data: [290, 310, 320, 315, 330, 320, 320],
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Active Providers',
        data: [130, 140, 145, 142, 148, 145, 145],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          font: { size: 10, weight: '600' },
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
    },
  };

  const [roleFilter, setRoleFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const users = [
    { id: 1, name: 'Alex Rivera', role: 'Client', status: 'Active', lastActivity: '2h ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2JdH_oJBj4eZneoh3GAqMlC8PJ14MUjImRBOMMMo3wwYpNOwALloBLyn7cChRRuFS_b69rOEetnX1geqM5yF2jX5NntwhOLxfIq6sfFMKMup-yq9sI1kewNDiHLZL64Zj8UN4r1SIu2goQQSvEwXo7AcnG9A19WRVzSP9aw3YH4g36dm7uBUjDl6fR-uGXWI7UUv25IOcRIJ40LB783MI8c0LimFq6XBQLoZQjQOX3LJXfLn8KXFshghWjFKzN5t0PIZmWWvXY0s' },
    { id: 2, name: 'Marco Velasquez', role: 'Provider', status: 'Idle', lastActivity: '45m ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHE1p3aYuxeDKcueQrEsp1IPmKp5Gk4nnyI9ZUNya_G2EPIjnZe9KGPnZtn9RqhtbJl6d3SKefhkg0hK2jREtf2lB97kZfLAA3rUpXxWdo5OJCMImSuT44z-5lDcN6Sor_Gh971hDPM_YXtUGlzXj5Mq8aPj1NTB057ldblptKzvn0YYSp2RI4xrQIeSKucFLM5I3NORBdQwStz8FtEjI3pR7FcsRZCboWEVpEJKmRab0T-lzg0hfYsV3a1Hh4ZR7eK0tDqaYDNZk' },
    { id: 3, name: 'Sarah Jenkins', role: 'Provider', status: 'Inactive', lastActivity: '3d ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkWcQIwdOz3c1A_1X-GSdqT1rr_bQDjAJS_LoR3cWF-_7lSq7akThOOKtAhN2-2mDJk0F11SIk4w4ByN852nQude8PW7CZGWo7gmjtYNfO_-5K7wnUK7Z7kNe-5Glbhmggmkk_kEOo1B-TBhWwou3NYV5kBk2yiP1OYqVlwMZXzsCv8Ciwpwfx-a8e8c_O2EC1NRlQ-52-3qDAIGi49CeBr2BdHgaEOkOKwC8oys6ql5RTkBVJMgw1t1SttMc_rfgneqVOFSvpbs' },
  ];

  const filteredUsers = users.filter(user => {
    const rMatch = roleFilter === 'All' || user.role === roleFilter;
    const sMatch = statusFilter === 'All' || user.status === statusFilter;
    return rMatch && sMatch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return { bg: '#28a745', text: 'Active' };
      case 'Idle': return { bg: '#ffc107', text: 'Idle' };
      case 'Inactive': return { bg: '#dc3545', text: 'Inactive' };
      default: return { bg: '#6c757d', text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Benchmarks */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Engagement Benchmarks</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">Monthly Comparison</span>
          </div>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">System Distribution</h3>
            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold">Live Status</span>
          </div>
          <div className="h-64 flex justify-center">
            <Pie
              data={pieData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9 } } } }
              }}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Trend */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Growth & Peak Trends</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="text-[10px] text-slate-400 font-bold">Clients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="text-[10px] text-slate-400 font-bold">Providers</span>
            </div>
          </div>
        </div>
        <div className="h-48">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>

      {/* Manage Users with Quick Actions */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Manage Recent Activity</h3>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-primary h-8"
            >
              <option>All Roles</option>
              <option value="Client">Clients</option>
              <option value="Provider">Providers</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-primary h-8"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Idle">Idle</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-4 pb-2">User</th>
                <th className="px-4 pb-2">Role</th>
                <th className="px-4 pb-2">Status</th>
                <th className="px-4 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.map(user => {
                const badge = getStatusBadge(user.status);
                return (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all rounded-xl cursor-default">
                    <td className="py-4 px-4 bg-white/50 dark:bg-slate-900/20 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover shadow-sm border border-white/20"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Last login: {user.lastActivity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 bg-white/50 dark:bg-slate-900/20">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${user.role === 'Client' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 bg-white/50 dark:bg-slate-900/20">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.bg }}></span>
                        <span className="text-xs font-bold" style={{ color: badge.bg }}>{badge.text}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 bg-white/50 dark:bg-slate-900/20 rounded-r-xl text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:shadow-md transition-all border border-slate-100 dark:border-white/5">
                          <span>💬</span> Message
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-600 hover:text-error hover:shadow-md transition-all border border-slate-100 dark:border-white/5">
                          <span>🚫</span> Block
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-[10px] font-bold text-white hover:bg-primary-container hover:shadow-md transition-all">
                          <span>👁️</span> View Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-slate-400 italic">No users match your current filter selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityDistribution;
