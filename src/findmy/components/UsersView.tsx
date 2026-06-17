import React, { useEffect, useState } from 'react';
import { dbService } from '../lib/db';
import { useAuth } from '../lib/AuthContext';
import { Plus, User, Building, Loader2 } from 'lucide-react';
import { UserProfile } from '../lib/AuthContext';

interface Profile {
  id: string;
  name: string;
}

export function UsersView() {
  const { refreshProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersList = await dbService.getUsers();
      setUsers(usersList);

      const profilesList = await dbService.getProfiles();
      setProfiles(profilesList);
    } catch (e) {
      console.error("Error fetching users/profiles:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    
    // Convert to simple ID
    const profileId = newProfileName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    
    try {
      await dbService.createProfile(profileId, newProfileName.trim());
      setNewProfileName('');
      setIsAddingProfile(false);
      await fetchData();
    } catch (error) {
      console.error("Error creating profile", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    try {
      const email = newUserEmail.trim().toLowerCase();
      await dbService.createUser(email, 'client', []);
      setNewUserEmail('');
      setIsAddingUser(false);
      await fetchData();
    } catch (error) {
      console.error("Error adding user", error);
    }
  };

  const handleAssignProfile = async (userEmail: string, profileId: string) => {
    try {
      const userObj = users.find(u => u.email === userEmail);
      if (!userObj) return;
      
      const newProfileIds = userObj.profileIds.includes(profileId) 
        ? userObj.profileIds.filter(id => id !== profileId) 
        : [...userObj.profileIds, profileId];
        
      await dbService.updateUser(userEmail, { profileIds: newProfileIds });
      
      await fetchData();
      await refreshProfile(); // Refresh context profile just in case we edited ourselves
    } catch (error) {
      console.error("Error updating assignment", error);
    }
  };

  const handleToggleRole = async (userEmail: string, currentRole: 'admin' | 'client') => {
    try {
      const newRole = currentRole === 'admin' ? 'client' : 'admin';
      await dbService.updateUser(userEmail, { role: newRole });
      await fetchData();
      await refreshProfile();
    } catch (error) {
      console.error("Error updating user role", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#86868b]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      
      {/* Profiles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#86868b]" /> Profile (Klienci Agencji)
          </h3>
          <button 
            onClick={() => setIsAddingProfile(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d2d2d7] rounded-full text-[13px] font-medium hover:bg-[#f5f5f7] transition"
          >
            <Plus className="w-4 h-4" /> Nowy Dashboard
          </button>
        </div>

        {isAddingProfile && (
          <form onSubmit={handleCreateProfile} className="bg-white p-5 rounded-[20px] shadow-sm border border-[#e8e8ed] mb-6 flex gap-3">
            <input 
              autoFocus
              type="text" 
              placeholder="Nazwa klienta (np. Zenith Clean)" 
              className="flex-1 bg-[#f5f5f7] border-transparent rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-colors border"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <button type="submit" className="bg-[#1d1d1f] text-white px-5 rounded-xl text-[14px] font-medium">Zapisz</button>
            <button type="button" onClick={() => setIsAddingProfile(false)} className="px-5 text-[#86868b] text-[14px] font-medium">Anuluj</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map(p => (
             <div key={p.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-[#e8e8ed] flex flex-col justify-center">
               <span className="text-[15px] font-semibold text-[#1d1d1f]">{p.name}</span>
               <span className="text-[12px] font-medium text-[#86868b] mt-0.5">ID: {p.id}</span>
             </div>
          ))}
          {profiles.length === 0 && !isAddingProfile && (
            <p className="text-[14px] text-[#86868b] col-span-3">Brak utworzonych profili.</p>
          )}
        </div>
      </section>

      <hr className="border-[#e8e8ed]" />

      {/* Users */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <User className="w-5 h-5 text-[#86868b]" /> Użytkownicy Dostępów
          </h3>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d2d2d7] rounded-full text-[13px] font-medium hover:bg-[#f5f5f7] transition"
          >
            <Plus className="w-4 h-4" /> Dodaj Użytkownika
          </button>
        </div>

        {isAddingUser && (
          <form onSubmit={handleCreateUser} className="bg-white p-5 rounded-[20px] shadow-sm border border-[#e8e8ed] mb-6 flex gap-3">
            <input 
              autoFocus
              type="email" 
              placeholder="Adres email klienta (np. klient@gmail.com)" 
              className="flex-1 bg-[#f5f5f7] border-transparent rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-colors border"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
            <button type="submit" className="bg-[#1d1d1f] text-white px-5 rounded-xl text-[14px] font-medium">Utwórz Dostęp</button>
            <button type="button" onClick={() => setIsAddingUser(false)} className="px-5 text-[#86868b] text-[14px] font-medium">Anuluj</button>
          </form>
        )}

        <div className="bg-white rounded-[24px] shadow-sm border border-[#e8e8ed] overflow-hidden">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed]">
                 <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase">Email</th>
                 <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase w-[120px]">Rola</th>
                 <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase">Dostęp do profili (Kliknij aby nadać/cofnąć)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#f5f5f7]">
               {users.map(u => (
                  <tr key={u.email} className="hover:bg-[#fafafa]">
                     <td className="py-4 px-6">
                       <span className="text-[14px] font-medium text-[#1d1d1f]">{u.email}</span>
                     </td>
                     <td className="py-4 px-6">
                       <button
                         onClick={() => handleToggleRole(u.email, u.role)}
                         className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide transition-colors ${u.role === 'admin' ? 'bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20' : 'bg-[#e8e8ed] text-[#86868b] hover:bg-[#d2d2d7]'}`}
                       >
                         {u.role}
                       </button>
                     </td>
                     <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          {profiles.map(p => {
                            const hasAccess = u.profileIds.includes(p.id);
                            const disabled = u.role === 'admin'; // Admins have access to all implicitly
                            return (
                              <button
                                key={p.id}
                                disabled={disabled}
                                onClick={() => handleAssignProfile(u.email, p.id)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${disabled ? 'bg-[#0071e3]/5 text-[#0071e3] border-[#0071e3]/20 cursor-not-allowed' : ''} ${!disabled && hasAccess ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : !disabled ? 'bg-white text-[#86868b] border-[#d2d2d7] hover:border-[#1d1d1f]' : ''}`}
                              >
                                {p.name} {disabled && "(Wszystkie)"}
                              </button>
                            );
                          })}
                          {profiles.length === 0 && <span className="text-[12px] text-[#86868b]">Brak profili</span>}
                        </div>
                     </td>
                  </tr>
               ))}
               {users.length === 0 && (
                 <tr>
                   <td colSpan={3} className="py-8 text-center text-[14px] text-[#86868b]">Brak użytkowników</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </section>

    </div>
  );
}
