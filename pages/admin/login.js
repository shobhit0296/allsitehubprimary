// pages/admin/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple hardcoded password (for demo)
    if (password === 'admin123') {
      // Set a cookie or session flag; for demo we'll use a simple redirect with a query param
      // In production, use proper authentication.
      router.push('/admin?auth=true');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <AdminLayout title="Login">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="admin-login bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] flex items-center justify-center text-white font-extrabold text-sm">T</div>
            <div>
              <h2 className="text-xl font-bold">Admin Login</h2>
              <p className="text-xs text-[#52525b]">Enter password to continue</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              className="admin-input w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[#f5f5f7] focus:border-[#8b5cf6]/50 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="btn-primary w-full py-2.5 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] transition">
              Login
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}