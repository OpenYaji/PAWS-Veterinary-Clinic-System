'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Appointments', href: '/dashboard/appointments' },
  { label: 'Pets', href: '/dashboard/pets' },
  { label: 'Clients', href: '/dashboard/clients' },
  { label: 'Medical Records', href: '/dashboard/records' },
  { label: 'Inventory', href: '/dashboard/inventory' },
  { label: 'Billing', href: '/dashboard/billing' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();

      if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'veterinarian')) {
        router.push('/client');
        return;
      }

      setUser({
        ...data.session.user,
        profile: profileData,
      });
      setIsLoading(false);
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-border bg-card transition-all duration-300 hidden md:flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
              <Image src="/images/image.png" alt="PAWS Logo" width={28} height={28} className="rounded-full" />
              <span className="font-bold">PAWS</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md transition-colors text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                } ${!sidebarOpen && 'text-center'}`}
              >
                {sidebarOpen ? item.label : item.label.charAt(0)}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 space-y-3">
          <div className={sidebarOpen ? 'text-xs' : 'hidden'}>
            <p className="text-muted-foreground">Logged in as</p>
            <p className="font-medium truncate">{user.profile?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full bg-transparent">
            {sidebarOpen ? 'Logout' : '↪'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Clinic Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.profile?.role}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
