import { useEffect, useState } from 'react';
import { Post, PostStatus } from './types';
import { MonthView } from './components/MonthView';
import { CalendarView } from './components/CalendarView';
import { PostEditor } from './components/PostEditor';
import { InstagramPreview } from './components/InstagramPreview';
import { NotesView } from './components/NotesView';
import { BillingView } from './components/BillingView';
import { UsersView } from './components/UsersView';
import { useAuth } from './lib/AuthContext';
import { dbService } from './lib/db';
import { 
  Plus, 
  LayoutGrid, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  FileText, 
  Receipt,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { userProfile, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState<'schedule' | 'notes' | 'billing' | 'users'>('schedule');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Profile selection state
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Load profiles based on role and assignments
  useEffect(() => {
    const loadProfiles = async () => {
      if (!userProfile) return;
      setLoadingProfiles(true);
      try {
        let list: { id: string; name: string }[] = [];
        if (userProfile.role === 'admin') {
          list = await dbService.getProfiles();
        } else {
          const allProfiles = await dbService.getProfiles();
          list = allProfiles.filter(p => userProfile.profileIds.includes(p.id));
        }
        setProfiles(list);

        // Determine which profile is active
        const savedActiveId = localStorage.getItem('active_profile_id');
        if (savedActiveId && list.some(p => p.id === savedActiveId)) {
          setActiveProfileId(savedActiveId);
        } else if (list.length > 0) {
          setActiveProfileId(list[0].id);
          localStorage.setItem('active_profile_id', list[0].id);
        }
      } catch (e) {
        console.error("Error loading profiles:", e);
      }
      setLoadingProfiles(false);
    };
    loadProfiles();
  }, [userProfile]);

  // Load posts whenever active profile changes
  useEffect(() => {
    if (!activeProfileId) return;
    const loadPosts = async () => {
      try {
        const data = await dbService.getPosts(activeProfileId);
        setPosts(data);
      } catch (e) {
        console.error("Error loading posts:", e);
      }
    };
    loadPosts();
  }, [activeProfileId]);

  const handleProfileChange = (profileId: string) => {
    setActiveProfileId(profileId);
    localStorage.setItem('active_profile_id', profileId);
    setIsDropdownOpen(false);
  };

  const handleSavePost = async (updatedPost: Post) => {
    const postWithProfile = { ...updatedPost, profileId: activeProfileId };
    
    // Optimistic UI update
    setPosts(currentPosts => {
      const exists = currentPosts.find(p => p.id === postWithProfile.id);
      if (exists) {
        return currentPosts.map(p => p.id === postWithProfile.id ? postWithProfile : p);
      }
      return [...currentPosts, postWithProfile];
    });
    
    setIsEditorOpen(false);
    setEditingPost(null);

    try {
      await dbService.savePost(postWithProfile);
    } catch (e) {
      console.error("Error saving post to DB:", e);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    // Pass default template values
    setEditingPost({
      id: 'p_' + Date.now(),
      profileId: activeProfileId,
      publishDate: new Date(2026, 5, currentDate.getDate(), 12, 0).toISOString(),
      category: 'Nowa publikacja',
      images: [],
      description: '',
      status: 'Szkic'
    });
    setIsEditorOpen(true);
  };

  const handleStatusChange = async (post: Post, newStatus: PostStatus) => {
    const updatedPost: Post = { ...post, status: newStatus };
    
    // Optimistic UI update
    setPosts(currentPosts => currentPosts.map(p => p.id === post.id ? updatedPost : p));
    
    try {
      await dbService.savePost(updatedPost);
    } catch (e) {
      console.error("Error updating post status:", e);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const activeProfileName = activeProfile ? activeProfile.name : "Wczytywanie...";

  const currentMonthPosts = posts.filter(post => {
    const postDate = new Date(post.publishDate);
    return postDate.getFullYear() === currentDate.getFullYear() && postDate.getMonth() === currentDate.getMonth();
  });

  // Loading Screen
  if (loadingProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#86868b] font-sans">
        Wczytywanie ustawień i profili...
      </div>
    );
  }

  // Pending Screen for clients without assigned profiles
  if (userProfile && userProfile.role !== 'admin' && profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#1d1d1f] p-6 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.1)] flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight mb-3">Oczekiwanie na dostęp</h1>
          <p className="text-[14px] text-[#86868b] leading-relaxed mb-8 px-2">
            Twój adres e-mail <strong className="text-[#1d1d1f]">{userProfile.email}</strong> nie został jeszcze przypisany do żadnego dashboardu. Skontaktuj się z administratorem, aby nadać uprawnienia.
          </p>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] text-white px-6 py-3.5 rounded-2xl text-[14.5px] font-semibold hover:bg-[#333336] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
          >
            Wyloguj się
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans antialiased text-[#1d1d1f] overflow-hidden">
      
      {/* Left Sidebar */}
      <nav className="w-[260px] bg-[#f5f5f7] border-r border-[#e8e8ed] flex flex-col shrink-0 h-full relative z-20">
        
        {/* Profile Switcher Section */}
        <div className="p-6 relative">
          <div 
            onClick={() => profiles.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between px-3 py-2 -mx-2 rounded-xl transition-all ${profiles.length > 1 ? 'cursor-pointer hover:bg-[#e8e8ed] bg-white shadow-sm border border-[#e8e8ed]' : 'bg-[#e8e8ed]/50 border border-transparent'}`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LayoutDashboard className="w-4 h-4 text-[#86868b] shrink-0" />
              <div className="overflow-hidden">
                <h1 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] truncate max-w-[150px]">{activeProfileName}</h1>
                <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mt-0.5">
                  {userProfile?.role === 'admin' ? 'Admin' : 'Klient'}
                </p>
              </div>
            </div>
            {profiles.length > 1 && <ChevronDown className="w-4 h-4 text-[#86868b] shrink-0" />}
          </div>

          {/* Switcher Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[80px] left-4 right-4 bg-white border border-[#e8e8ed] rounded-2xl shadow-lg p-2 z-50 flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider px-3 py-1.5 border-b border-[#f5f5f7] mb-1">
                Wybierz Dashboard:
              </span>
              <div className="max-h-[220px] overflow-y-auto space-y-0.5">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileChange(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[13.5px] font-medium transition-all ${p.id === activeProfileId ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Menu Options */}
        <div className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]'}`}
          >
            <CalendarDays className="w-4 h-4" />
            Harmonogram
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${activeTab === 'notes' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]'}`}
          >
            <FileText className="w-4 h-4" />
            Ustalenia z Calli
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${activeTab === 'billing' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]'}`}
          >
            <Receipt className="w-4 h-4" />
            Rozliczenia
          </button>

          {userProfile?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${activeTab === 'users' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]'}`}
            >
              <Users className="w-4 h-4" />
              Klienci i Profile
            </button>
          )}
        </div>
        
        {/* Footer Sidebar buttons */}
        <div className="p-4 space-y-1">
           <button 
             onClick={() => {
               if (userProfile?.role === 'admin') {
                 setActiveTab('users');
               } else {
                 alert("Brak uprawnień. Przejdź do Ustawień u swojego administratora.");
               }
             }}
             className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition-all"
           >
             <Settings className="w-4 h-4" />
             Ustawienia
           </button>
           <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#e30000] focus:text-[#e30000] transition-all">
             <LogOut className="w-4 h-4" />
             Wyloguj się
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7]">
        {/* Top Header Workspace */}
        <header className="flex-none bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              
              <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
                {activeTab === 'schedule' && 'Harmonogram Publikacji'}
                {activeTab === 'notes' && 'Ustalenia i Notatki'}
                {activeTab === 'billing' && 'Zarządzanie Budżetem'}
                {activeTab === 'users' && 'Zarządzanie Klientami'}
                <span className="text-[13px] text-[#86868b] font-normal ml-2">
                  ({activeProfileName})
                </span>
              </h2>

              {(activeTab === 'schedule' || activeTab === 'billing') && (
                <>
                  <div className="h-6 w-px bg-[#e8e8ed]" />
                  {/* Month Switcher */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="p-1.5 hover:bg-[#f5f5f7] rounded-md transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#1d1d1f]" />
                    </button>
                    <div className="w-[120px] text-center capitalize">
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">
                        {currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="p-1.5 hover:bg-[#f5f5f7] rounded-md transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[#1d1d1f]" />
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {activeTab === 'schedule' && (
                <>
                  {/* View Toggle */}
                  <div className="flex bg-[#f5f5f7] p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Kalendarz
                    </button>
                  </div>

                  <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#0077ED] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nowy Post
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Pages */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1200px] mx-auto px-8 py-10 h-full">
            {activeTab === 'schedule' && (
               viewMode === 'grid' ? (
                 <MonthView 
                   posts={currentMonthPosts} 
                   onEdit={handleEdit} 
                   onPreview={setPreviewPost}
                   onStatusChange={handleStatusChange}
                 />
               ) : (
                 <CalendarView
                   posts={currentMonthPosts}
                   currentDate={currentDate}
                   onEdit={handleEdit}
                   onPreview={setPreviewPost}
                 />
               )
             )}
             
             {activeTab === 'notes' && (
               <NotesView activeProfileId={activeProfileId} />
             )}
             
             {activeTab === 'billing' && (
               <BillingView currentDate={currentDate} activeProfileId={activeProfileId} />
             )}
             
             {activeTab === 'users' && (
               <UsersView />
             )}
          </div>
        </main>
      </div>

      {/* Overlays / Modals */}
      <AnimatePresence>
        {isEditorOpen && (
          <PostEditor 
            post={editingPost} 
            onSave={handleSavePost}
            onClose={() => setIsEditorOpen(false)}
            onPreview={setPreviewPost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewPost && (
          <InstagramPreview 
            post={previewPost}
            onClose={() => setPreviewPost(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
