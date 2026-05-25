'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Users, FileQuestion, Settings, LogOut, Home, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin') {
      router.push('/admin');
    } else if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (loading) return null;

  if (pathname === '/admin' && !isLoggedIn) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-white font-bold text-lg">Pro English BD</h1>
          <p className="text-gray-400 text-xs">Admin Panel</p>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition ${
                pathname === item.href
                  ? 'bg-white/10 text-white border-r-4 border-brand-red'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mt-3">
            <Home className="w-4 h-4" /> View Site
          </a>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-brand-navy text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-40"></div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
