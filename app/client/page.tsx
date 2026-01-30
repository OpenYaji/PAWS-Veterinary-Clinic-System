'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
}

interface Appointment {
  id: string;
  pet_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function ClientDashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        setUser(sessionData.session.user);

        // Load pets
        const { data: petsData } = await supabase.from('pets').select('*').eq('owner_id', sessionData.session.user.id);

        setPets(petsData || []);

        // Load upcoming appointments
        if (petsData && petsData.length > 0) {
          const petIds = petsData.map((p) => p.id);
          const { data: appointmentsData } = await supabase
            .from('appointments')
            .select('*')
            .in('pet_id', petIds)
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date', { ascending: true })
            .limit(5);

          setAppointments(appointmentsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.email}!</h1>
        <p className="text-muted-foreground">Manage your pets and appointments in one place.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
            <p className="text-xs text-muted-foreground">Your registered pets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Clinic Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Open</div>
            <p className="text-xs text-muted-foreground">Ready to serve</p>
          </CardContent>
        </Card>
      </div>

      {/* My Pets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Pets</h2>
          <Button asChild>
            <Link href="/client/pets/new">Add New Pet</Link>
          </Button>
        </div>

        {pets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No pets registered yet. Add your first pet to get started.</p>
              <Button asChild>
                <Link href="/client/pets/new">Add Your First Pet</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{pet.name}</CardTitle>
                  <CardDescription>
                    {pet.species} • {pet.breed}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Age: {pet.age} years</p>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href={`/client/pets/${pet.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments Section */}
      {appointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upcoming Appointments</h2>

          <div className="space-y-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">Status: {appointment.status}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/client/appointments/${appointment.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/client/appointments">View All Appointments</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
