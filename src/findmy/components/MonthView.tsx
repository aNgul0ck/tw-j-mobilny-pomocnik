import { useState } from 'react';
import { Post, PostStatus } from '../types';
import { Image as ImageIcon, Edit2, MessageSquare, Clock, Check, ChevronLeft, Bell, MoreHorizontal, Grid3X3, PlaySquare, FileWarning, UserSquare, Moon, Sun, Link } from 'lucide-react';

interface MonthViewProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onPreview: (post: Post) => void;
  onStatusChange: (post: Post, status: PostStatus) => void;
}

export function MonthView({ posts, onEdit, onPreview, onStatusChange }: MonthViewProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'published'>('upcoming');
  
  // Sort posts by date, descending for the Grid (newest first)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  const gridPosts = sortedPosts.slice(0, 9); // Domyślnie do 9 postów w widoku
  
  // Sort posts by date, ascending for the List (chronological)
  const listPosts = [...posts].sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  
  const upcomingPosts = listPosts.filter(p => p.status !== 'Opublikowane');
  const publishedPosts = listPosts.filter(p => p.status === 'Opublikowane').sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  
  const displayedPosts = activeTab === 'upcoming' ? upcomingPosts : publishedPosts;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Opublikowane': return 'bg-[#e3f5eb] text-[#117b34]';
      case 'Zaakceptowane': return 'bg-[#e9f3ff] text-[#0071e3]';
      case 'Do akceptacji': return 'bg-[#fff5cc] text-[#996c00]';
      default: return 'bg-[#f5f5f7] text-[#86868b]';
    }
  };

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-[#000000]' : 'bg-white';
  const textMain = isDark ? 'text-[#f5f5f5]' : 'text-black';
  const textSecondary = isDark ? 'text-[#a8a8a8]' : 'text-[#8e8e8e]';
  const borderMain = isDark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const btnBg = isDark ? 'bg-[#262626]' : 'bg-[#efefef]';

  return (
    <div className="flex gap-16 h-full max-w-6xl mx-auto">
      {/* IG Profile Preview */}
      <div className="w-[380px] shrink-0 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Podgląd Profilu</h3>
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1.5 rounded-full hover:bg-[#e8e8ed] text-[#86868b] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Phone Frame */}
        <div className={`relative w-full rounded-[44px] shadow-[0_0_0_6px_#f5f5f7,0_20px_40px_-8px_rgba(0,0,0,0.15)] overflow-hidden border border-[#e5e5ea] flex flex-col h-[780px] ${bgMain} ${textMain} font-sans`}>
          {/* Status Bar Mock */}
          <div className="h-12 shrink-0 flex items-center justify-between px-6 text-[13px] font-semibold">
            <span>12:42</span>
            <div className="flex gap-1.5 items-center">
              <div className={`w-4 h-3 rounded-sm border ${borderMain}`} />
              <div className={`w-4 h-3 rounded-sm border ${borderMain}`} />
              <div className={`w-5 h-2.5 rounded-sm border ${borderMain} bg-current`} />
            </div>
          </div>

          {/* Top Nav */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <button className={`${textMain}`}><ChevronLeft className="w-7 h-7" /></button>
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
              bubble.auto
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <Bell className="w-6 h-6" />
              <MoreHorizontal className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {/* Header Info */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-6">
              <div className="relative shrink-0">
                <div className={`w-[86px] h-[86px] rounded-full p-[2px] bg-gradient-to-tr from-gray-300 to-gray-400`}>
                  <div className={`w-full h-full rounded-full ${bgMain} p-[2px]`}>
                    <div className="w-full h-full bg-[#f4fdf4] rounded-full flex items-center justify-center border border-green-100">
                      <ImageIcon className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-between px-2 text-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px]">{posts.length}</span>
                  <span className={`text-[13px] ${textMain}`}>posty</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px]">1082</span>
                  <span className={`text-[13px] ${textMain}`}>obserwatorzy</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px]">882</span>
                  <span className={`text-[13px] ${textMain}`}>obserwowani</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="px-4 py-1 text-[13px] leading-tight">
              <p className="font-semibold">Bubble Auto</p>
              <p className="mt-0.5">Pielęgnacja samochodu w trakcie spotkania, zakupów lub lunchu 🫧</p>
              <p className="text-[#a8a8a8]">DETAILING | CERAMIKA | PPF</p>
              <p>Certified by <span className="text-[#e0f8f0]">@gtechiqpolska</span> .. więcej</p>
              <p className="text-blue-200">ul. Burakowska 14, Warsaw, Poland</p>
              <div className="flex items-center gap-1.5 mt-1 font-semibold">
                <Link className="w-3.5 h-3.5" />
                bubbleauto.booksy.com
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 flex gap-1.5">
              <button className={`flex-[4] ${btnBg} rounded-lg py-1.5 text-[13px] font-semibold flex items-center justify-center gap-1`}>
                Obserwuje <ChevronLeft className="w-4 h-4 -rotate-90" />
              </button>
              <button className={`flex-[4] ${btnBg} rounded-lg py-1.5 text-[13px] font-semibold`}>Wiadomość</button>
              <button className={`flex-[4] ${btnBg} rounded-lg py-1.5 text-[13px] font-semibold`}>Zadzwoń</button>
              <button className={`flex-[1] ${btnBg} rounded-lg py-1.5 flex items-center justify-center`}><UserSquare className="w-4 h-4" /></button>
            </div>

            {/* Highlights Mock */}
            <div className="px-4 py-2 flex gap-4 overflow-hidden mb-2">
              {[
                { name: 'PRZED/PO', color: 'border-yellow-400', icon: '👍' },
                { name: 'CARS', color: 'border-orange-400', icon: '🚙' },
                { name: 'DETAILING', color: 'border-green-400', icon: '✨' },
                { name: 'JAK DOJECH...', color: 'border-blue-400', icon: '📍' },
              ].map((hl, i) => (
                <div key={i} className="flex gap-1 flex-col items-center">
                  <div className={`w-16 h-16 rounded-full border-2 p-[2px] ${borderMain} ${bgMain}`}>
                     <div className={`w-full h-full rounded-full border-2 ${hl.color} flex items-center justify-center text-2xl`}>{hl.icon}</div>
                  </div>
                  <span className={`text-[10px] ${textMain}`}>{hl.name}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className={`flex items-center border-t ${borderMain} shrink-0`}>
              <button className={`flex-1 flex justify-center py-2.5 border-b-2 ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
                <Grid3X3 className="w-6 h-6" />
              </button>
              <button className={`flex-1 flex justify-center py-2.5 text-[#8e8e8e]`}>
                <PlaySquare className="w-6 h-6" />
              </button>
              <button className={`flex-1 flex justify-center py-2.5 text-[#8e8e8e]`}>
                <FileWarning className="w-6 h-6" />
              </button>
              <button className={`flex-1 flex justify-center py-2.5 text-[#8e8e8e]`}>
                <UserSquare className="w-6 h-6" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-[1px]">
              {gridPosts.map((post) => (
                <div 
                  key={post.id} 
                  className={`aspect-square ${isDark ? 'bg-[#262626]' : 'bg-gray-100'} relative group cursor-pointer overflow-hidden`}
                  onClick={() => onPreview(post)}
                >
                  {post.images.length > 0 ? (
                    <img src={post.images[0]} className="w-full h-full object-cover transition-transform duration-700" alt="" />
                  ) : (
                    <div className={`flex w-full h-full ${textSecondary} items-center justify-center`}>
                      <ImageIcon className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  {post.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 drop-shadow text-white p-0.5 rounded shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="14" height="14" rx="2" />
                        <path d="M7 21h14a2 2 0 002-2V7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Fill empty slots up to 9 */}
              {gridPosts.length < 9 && Array.from({ length: 9 - gridPosts.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className={`aspect-square ${isDark ? 'bg-[#121212]' : 'bg-gray-50'} border border-dashed ${borderMain} flex items-center justify-center m-[1px]`}>
                   <span className={`text-[10px] uppercase font-bold tracking-widest ${textSecondary} opacity-50`}>Wolne R.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List / Descriptions */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-6 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Harmonogram i Opisy</h3>
          <div className="flex bg-[#e8e8ed] p-1 rounded-full items-center">
             <button
               onClick={() => setActiveTab('upcoming')}
               className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
             >
               Do publikacji
             </button>
             <button
               onClick={() => setActiveTab('published')}
               className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTab === 'published' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
             >
               Opublikowane
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-4 pb-20">
          {displayedPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-[#86868b]">
               <FileWarning className="w-8 h-8 mb-3 opacity-40" />
               <p className="text-[13px] font-medium">Brak postów w tej zakładce.</p>
            </div>
          )}
          {displayedPosts.map((post) => (
             <div key={post.id} className="bg-white rounded-[24px] p-5 flex gap-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all group">
                
                {/* Thumbnail col */}
                <div 
                  onClick={() => onPreview(post)}
                  className="w-[110px] shrink-0 aspect-[4/3] bg-[#f5f5f7] rounded-[12px] overflow-hidden cursor-pointer relative group/thumb border border-[#dbdbdb]/50"
                >
                  {post.images.length > 0 ? (
                    <img src={post.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105" alt="" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#86868b]/40">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Brak</span>
                    </div>
                  )}
                  {post.images.length > 1 && (
                    <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-md text-white p-1 rounded-md shadow-sm">
                      <ImageIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Content col */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2.5">
                     <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(post.status)}`}>
                           {post.status}
                         </span>
                         <span className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">{post.category || 'Brak kategorii'}</span>
                       </div>
                       
                       <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868b]">
                         <Clock className="w-3.5 h-3.5" />
                         <span className="capitalize">{new Date(post.publishDate).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                         <span>•</span>
                         <span>{new Date(post.publishDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                     </div>
                     <button 
                       onClick={() => onEdit(post)}
                       className="text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/20 transition-colors p-2 rounded-full opacity-0 group-hover:opacity-100"
                     >
                       <Edit2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                  
                  <div className="text-[13px] text-[#1d1d1f]/80 whitespace-pre-wrap leading-relaxed font-normal">
                    {post.description || <span className="text-[#86868b]">Brak opisu...</span>}
                  </div>

                  {post.clientComments && (
                    <div className="mt-4 bg-[#fff8e6] text-[#8f6d14] p-3.5 rounded-[16px] text-[13px] font-medium flex gap-3 items-start">
                      <MessageSquare className="w-4 h-4 shrink-0 relative top-0.5" />
                      <p className="leading-relaxed">{post.clientComments}</p>
                    </div>
                  )}

                  {post.status === 'Do akceptacji' ? (
                    <div className="mt-5 flex items-center gap-3">
                      <button 
                        onClick={() => onStatusChange(post, 'Zaakceptowane')}
                        className="flex-1 bg-[#34c759] hover:bg-[#32b353] text-white py-2.5 rounded-xl text-[13px] font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Zatwierdź
                      </button>
                      <button 
                        onClick={() => onEdit(post)}
                        className="flex-1 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Zgłoś poprawki
                      </button>
                    </div>
                  ) : post.status === 'Szkic' ? (
                    <div className="mt-5 flex items-center gap-3">
                      <button 
                        onClick={() => onStatusChange(post, 'Do akceptacji')}
                        className="flex-1 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center gap-2"
                      >
                        Wyślij do akceptacji
                      </button>
                    </div>
                  ) : null}
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
