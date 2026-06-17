import { Post, PostStatus } from '../types';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface CalendarViewProps {
  posts: Post[];
  currentDate: Date;
  onEdit: (post: Post) => void;
  onPreview: (post: Post) => void;
}

export function CalendarView({ posts, currentDate, onEdit, onPreview }: CalendarViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startingDay }, (_, i) => i);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Opublikowane': return 'bg-[#34c759]';
      case 'Zaakceptowane': return 'bg-[#0071e3]';
      case 'Do akceptacji': return 'bg-[#ff9500]';
      default: return 'bg-[#86868b]';
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col max-w-5xl mx-auto">
      <div className="grid grid-cols-7 border-b border-[#f5f5f7]">
        {['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'].map(day => (
          <div key={day} className="py-4 text-center text-[12px] font-semibold tracking-wider uppercase text-[#86868b]">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] h-full">
          {padding.map(i => (
            <div key={`pad-${i}`} className="border-b border-r border-[#f5f5f7] bg-[#fafafa]/50" />
          ))}
          {days.map(day => {
            const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            const dayPosts = posts.filter(p => p.publishDate.startsWith(dateStr));
            return (
              <div key={day} className="border-b border-r border-[#f5f5f7] p-2 hover:bg-[#f5f5f7]/50 transition-colors">
                <div className="text-[13px] font-medium text-[#1d1d1f] mb-2 px-1">{day}</div>
                <div className="space-y-1.5">
                  {dayPosts.map(post => (
                    <div 
                      key={post.id}
                      onClick={() => onPreview(post)}
                      className="group cursor-pointer flex items-center gap-2 p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-[#e8e8ed]"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#f5f5f7] overflow-hidden shrink-0 relative">
                        {post.images.length > 0 ? (
                          <img src={post.images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="flex w-full h-full text-[#86868b] items-center justify-center">
                            <ImageIcon className="w-3.5 h-3.5 opacity-40" />
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-tl-sm ${getStatusColor(post.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-[#86868b] mb-0.5 truncate">
                          {new Date(post.publishDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] font-medium text-[#1d1d1f] truncate leading-tight">
                          {post.category || 'Post'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Fill remaining cells to complete the grid */}
          {Array.from({ length: (7 - ((padding.length + days.length) % 7)) % 7 }).map((_, i) => (
             <div key={`pad-end-${i}`} className="border-b border-r border-[#f5f5f7] bg-[#fafafa]/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
