import { useState, useEffect } from 'react';
import { Post, PostStatus } from '../types';
import { motion } from 'motion/react';
import { X, Save, ImagePlus, Trash2, Eye } from 'lucide-react';

interface PostEditorProps {
  post: Post | null;
  onSave: (post: Post) => void;
  onClose: () => void;
  onPreview: (post: Post) => void;
}

export function PostEditor({ post, onSave, onClose, onPreview }: PostEditorProps) {
  const [editedPost, setEditedPost] = useState<Post | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (post) {
      setEditedPost({ ...post });
    } else {
      // Setup a new empty post
      setEditedPost({
        id: Math.random().toString(36).substr(2, 9),
        publishDate: new Date().toISOString().slice(0, 16),
        category: '',
        images: [],
        description: '',
        status: 'Szkic',
        goal: '',
      });
    }
  }, [post]);

  if (!editedPost) return null;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setEditedPost(prev => prev ? { ...prev, images: [...prev.images, newImageUrl] } : null);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditedPost(prev => {
      if (!prev) return null;
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setEditedPost(prev => {
      if (!prev) return null;
      const newImages = [...prev.images];
      if (direction === 'up' && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return { ...prev, images: newImages };
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-[32px] border border-black/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5 bg-white/80 backdrop-blur shrink-0">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
              {post ? 'Edytuj Post' : 'Nowy Post'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPreview(editedPost)}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#0071e3] transition-colors bg-[#0071e3]/10 border border-transparent rounded-full hover:bg-[#0071e3]/20"
            >
              <Eye className="w-4 h-4" />
              Podgląd IG
            </button>
             <button
              onClick={onClose}
              className="p-1.5 text-[#86868b] transition-colors rounded-full hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-[#fbfbfb]">
          
          {/* Status & Date Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#1d1d1f] block">Status publikacji</label>
              <select
                value={editedPost.status}
                onChange={e => setEditedPost(prev => prev ? { ...prev, status: e.target.value as PostStatus } : null)}
                className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm"
              >
                <option value="Szkic">Szkic</option>
                <option value="Do akceptacji">Do akceptacji</option>
                <option value="Zaakceptowane">Zaakceptowane</option>
                <option value="Opublikowane">Opublikowane</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#1d1d1f] block">Data planowana</label>
              <input
                type="datetime-local"
                value={editedPost.publishDate.slice(0, 16)}
                onChange={e => setEditedPost(prev => prev ? { ...prev, publishDate: e.target.value } : null)}
                 className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#1d1d1f] block">Kategoria / Temat</label>
              <input
                type="text"
                placeholder="np. Mycie detailingowe"
                value={editedPost.category}
                onChange={e => setEditedPost(prev => prev ? { ...prev, category: e.target.value } : null)}
                className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#1d1d1f] block">Cel posta</label>
              <input
                type="text"
                placeholder="np. Budowanie świadomości"
                value={editedPost.goal || ''}
                onChange={e => setEditedPost(prev => prev ? { ...prev, goal: e.target.value } : null)}
                 className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Images / Carousel Editor */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#1d1d1f] block">Karuzela zdjęć</label>
                <span className="text-[11px] font-medium text-[#86868b] bg-[#e8e8ed] px-2 py-0.5 rounded-full">{editedPost.images.length} slajdów</span>
             </div>
             
             {/* Thumbnail list */}
             <div className="grid gap-2">
               {editedPost.images.map((imgUrl, idx) => (
                 <div key={idx} className="flex items-center gap-4 p-2 bg-white border border-[#d2d2d7] rounded-2xl group transition-all hover:border-[#86868b] shadow-sm">
                    <div className="relative w-16 h-16 overflow-hidden rounded-[12px] bg-[#f5f5f7] shrink-0 border border-black/5">
                      <img src={imgUrl} alt={`Slide ${idx + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                        {idx + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#86868b] truncate px-1">{imgUrl}</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                       <div className="flex flex-col mr-1">
                         <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-1 text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30">▲</button>
                         <button onClick={() => moveImage(idx, 'down')} disabled={idx === editedPost.images.length - 1} className="p-1 text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30">▼</button>
                       </div>
                       <button onClick={() => handleRemoveImage(idx)} className="p-2 text-[#86868b] hover:text-red-500 bg-[#f5f5f7] hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
             </div>

             {/* Add image */}
             <div className="flex gap-2 mt-3">
                <input 
                  type="text" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Wklej adres URL obrazu..."
                  className="flex-1 px-4 py-2 bg-white border border-[#d2d2d7] rounded-xl text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm"
                  onKeyDown={e => e.key === 'Enter' && handleAddImage()}
                />
                <button 
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim()}
                  className="px-5 py-2 text-[13px] font-medium text-white bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-[#d2d2d7] disabled:cursor-not-allowed flex items-center gap-2 transition-colors rounded-xl shadow-sm"
                >
                  <ImagePlus className="w-4 h-4" />
                  Dodaj
                </button>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#1d1d1f] flex justify-between items-center">
              Opis posta
              <span className="text-[11px] font-normal text-[#86868b]">Podgląd na żywo w IG Preview</span>
            </label>
            <textarea
              rows={6}
              value={editedPost.description}
              onChange={e => setEditedPost(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Treść posta..."
              className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm resize-y leading-relaxed"
            />
          </div>

          {/* Client Feedback */}
          <div className="space-y-2">
             <label className="text-[13px] font-medium text-[#1d1d1f] block">Uwagi dla agencji</label>
             <textarea
               rows={3}
               value={editedPost.clientComments || ''}
               onChange={e => setEditedPost(prev => prev ? { ...prev, clientComments: e.target.value } : null)}
               placeholder="Wpisz poprawki lub sugestie..."
               className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-sm resize-y leading-relaxed"
             />
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-black/5 bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-[#1d1d1f] transition-colors rounded-full hover:bg-[#f5f5f7] text-[13px]"
          >
            Anuluj
          </button>
          <button
            onClick={() => onSave(editedPost)}
            className="flex items-center gap-2 px-6 py-2.5 font-medium text-white transition-all bg-[#0071e3] rounded-full hover:bg-[#0077ED] text-[13px] shadow-sm"
          >
            <Save className="w-4 h-4" />
            Zapisz zmiany
          </button>
        </div>
      </motion.div>
    </div>
  );
}
