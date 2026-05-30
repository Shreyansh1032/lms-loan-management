'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface NavItem { label: string; href: string; icon: string; roles: UserRole[]; }

const NAV: NavItem[] = [
  { label: 'Overview',     href: '/dashboard/admin',        icon: '📊', roles: ['admin'] },
  { label: 'Sales',        href: '/dashboard/sales',        icon: '📋', roles: ['sales', 'admin'] },
  { label: 'Sanction',     href: '/dashboard/sanction',     icon: '✅', roles: ['sanction', 'admin'] },
  { label: 'Disbursement', href: '/dashboard/disbursement', icon: '💸', roles: ['disbursement', 'admin'] },
  { label: 'Collection',   href: '/dashboard/collection',   icon: '💰', roles: ['collection', 'admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const visible = NAV.filter(n => user && n.roles.includes(user.role));

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside className="w-60 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
          <div>
            <p className="font-bold text-white text-sm">LMS Portal</p>
            <p className="text-gray-400 text-xs">Operations</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
        <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
        <button onClick={handleLogout}
          className="mt-3 w-full text-left text-xs text-red-400 hover:text-red-300 transition font-medium">
          → Logout
        </button>
      </div>
    </aside>
  );
}
