import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AuthProvider, useAuth } from '@/findmy/lib/AuthContext';
import FindMyApp from '@/findmy/App';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Bubble Auto — Panel zarządzania treściami' },
      {
        name: 'description',
        content:
          'Panel agencji do planowania publikacji na Instagramie: harmonogram, podgląd profilu, notatki i rozliczenia.',
      },
    ],
  }),
  component: Index,
});

function Gate() {
  const { userProfile, loading, loginWithEmail } = useAuth();

  // Tymczasowo bez logowania — automatyczne wejście jako admin
  useEffect(() => {
    if (!loading && !userProfile) {
      loginWithEmail('antek.golik@gmail.com', '');
    }
  }, [loading, userProfile, loginWithEmail]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#86868b] font-sans">
        Wczytywanie...
      </div>
    );
  }

  return <FindMyApp />;
}

function Index() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
