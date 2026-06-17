import { createFileRoute } from '@tanstack/react-router';
import { AuthProvider, useAuth } from '@/findmy/lib/AuthContext';
import { LoginView } from '@/findmy/components/LoginView';
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
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#86868b] font-sans">
        Wczytywanie...
      </div>
    );
  }

  if (!user || !userProfile) {
    return <LoginView />;
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
