'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardStats {
  totalClients: number;
  totalPets: number;
  todayAppointments: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPets: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        // Get total clients
        const { count: clientsCount } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'pet_owner');

        // Get total pets
        const { count: petsCount } = await supabase.from('pets').select('*', { count: 'exact' });

        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select('*')
          .eq('appointment_date', today);

        // Get all appointments
        const { count: totalAppts } = await supabase.from('appointments').select('*', { count: 'exact' });

        // Get pending appointments
        const { count: pendingAppts } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('status', 'scheduled');

        // Get completed appointments
        const { count: completedAppts } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('status', 'completed');

        // Get recent appointments
        const { data: recent } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalClients: clientsCount || 0,
          totalPets: petsCount || 0,
          todayAppointments: todayAppts?.length || 0,
          totalAppointments: totalAppts || 0,
          pendingAppointments: pendingAppts || 0,
          completedAppointments: completedAppts || 0,
        });

        setRecentAppointments(recent || []);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
        <p className="text-muted-foreground">Overview of your clinic operations and client management.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Pet owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPets}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered pets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">All appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">To be completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Finished appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button asChild className="h-auto flex-col py-4">
            <Link href="/dashboard/appointments">
              <span>📅</span>
              <span>New Appointment</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
            <Link href="/dashboard/pets">
              <span>🐾</span>
              <span>Add Pet</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
            <Link href="/dashboard/clients">
              <span>👥</span>
              <span>Manage Clients</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
            <Link href="/dashboard/inventory">
              <span>📦</span>
              <span>Inventory</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Appointments */}
      {recentAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Appointments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/appointments">View All</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </p>
                      <p className={`text-xs font-medium ${
                        appointment.status === 'completed'
                          ? 'text-green-600'
                          : appointment.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/appointments/${appointment.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
