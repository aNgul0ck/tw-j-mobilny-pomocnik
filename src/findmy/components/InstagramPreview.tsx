import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface InstagramPreviewProps {
  post: Post;
  onClose: () => void;
}

export function InstagramPreview({ post, onClose }: InstagramPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset slide when post changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [post]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide < post.images.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        className="relative flex w-full max-w-[360px] h-[640px] flex-col overflow-hidden bg-white rounded-[44px] shadow-[0_0_0_6px_#f5f5f7,0_20px_40px_-8px_rgba(0,0,0,0.2)] border border-[#e5e5ea]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f5f7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[2px]">
              <div className="w-full h-full p-[2px] bg-white rounded-full">
                <div className="w-full h-full bg-[#1d1d1f] rounded-full" />
              </div>
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1f]">bubble_auto</span>
          </div>
          <button className="text-[#1d1d1f] hover:text-[#86868b] transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel/Image Area */}
        <div className="relative bg-[#f5f5f7] flex-1 flex items-center justify-center group overflow-hidden">
          {post.images.length > 0 ? (
            <AnimatePresence initial={false} custom={currentSlide}>
              <motion.img
                key={currentSlide}
                src={post.images[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="absolute inset-0 object-cover w-full h-full"
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </AnimatePresence>
          ) : (
            <div className="text-[13px] font-medium text-[#86868b]">Brak obrazów</div>
          )}

          {/* Navigation Arrows */}
          {post.images.length > 1 && (
            <>
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronLeft className="w-4 h-4 ml-[-1px]" />
                </button>
              )}
              {currentSlide < post.images.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronRight className="w-4 h-4 mr-[-1px]" />
                </button>
              )}
            </>
          )}

          {/* Top Right Counter Indicator */}
          {post.images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/40 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              {currentSlide + 1}/{post.images.length}
            </div>
          )}
        </div>

        {/* Actions & Description */}
        <div className="p-3.5 shrink-0 bg-white">
          {/* Action Icons */}
          <div className="flex items-center gap-4 mb-2.5">
            <button className="text-[#1d1d1f] hover:text-[#86868b] transition-transform hover:scale-105 active:scale-95"><Heart className="w-6 h-6" /></button>
            <button className="text-[#1d1d1f] hover:text-[#86868b] transition-transform hover:scale-105 active:scale-95"><MessageCircle className="w-6 h-6" /></button>
            <button className="text-[#1d1d1f] hover:text-[#86868b] transition-transform hover:scale-105 active:scale-95"><Send className="w-6 h-6" /></button>
            
            {post.images.length > 1 && (
              <div className="ml-auto absolute left-1/2 -translate-x-1/2 flex gap-1 items-center">
                {post.images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentSlide ? 'w-1.5 bg-[#0071e3]' : 'w-1.5 bg-[#d2d2d7]'
                    }`}
                  />
                ))}
              </div>
            )}
            <button className="text-[#1d1d1f] hover:text-[#86868b] transition-transform hover:scale-105 active:scale-95 ml-auto"><Bookmark className="w-6 h-6" /></button>
          </div>

          {/* Caption */}
          <div className="text-[13px] leading-snug">
            <p><span className="font-semibold mr-1.5">bubble_auto</span> <span className="text-[#1d1d1f]/90 whitespace-pre-wrap">{post.description?.length > 100 ? `${post.description.substring(0, 100)}...` : post.description}</span></p>
          </div>

          {/* Date */}
          <div className="mt-2 text-[11px] font-medium text-[#86868b] uppercase">
            {new Date(post.publishDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      </motion.div>
      
      {/* Close Button overlay */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white bg-white/10 hover:bg-white/20 transition-colors rounded-full backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
