import React, { useEffect, useState } from 'react';
import { Mic, FileText, CheckCircle2, Circle, Clock, Loader2, Plus } from 'lucide-react';
import { dbService } from '../lib/db';
import { Note } from '../types';

export function NotesView({ activeProfileId }: { activeProfileId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await dbService.getNotes(activeProfileId);
      setNotes(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [activeProfileId]);

  const handleToggleActionItem = async (noteId: string, itemId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const updatedNote = {
      ...note,
      actionItems: note.actionItems.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    };

    // Optimistic UI update
    setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));

    try {
      await dbService.saveNote(updatedNote);
    } catch (e) {
      console.error("Error saving note check state:", e);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNote: Note = {
      id: 'n_' + Date.now(),
      profileId: activeProfileId,
      date: new Date().toISOString(),
      title: newTitle.trim(),
      source: 'Ręczna notatka',
      duration: '5 min',
      summary: newSummary.trim() || 'Brak podsumowania.',
      actionItems: []
    };

    try {
      await dbService.saveNote(newNote);
      setNotes(prev => [newNote, ...prev]);
      setNewTitle('');
      setNewSummary('');
      setIsAddingNote(false);
    } catch (e) {
      console.error("Error saving new note:", e);
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
    <div className="max-w-4xl mx-auto h-full space-y-6 pb-16">
      
      {/* Header bar with Add Note button */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Notatki z rozmów i ustaleń</h2>
        <button
          onClick={() => setIsAddingNote(true)}
          className="flex items-center gap-2 bg-[#1d1d1f] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#333336] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Dodaj Notatkę
        </button>
      </div>

      {isAddingNote && (
        <form onSubmit={handleCreateNote} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e8e8ed] space-y-4">
          <h3 className="text-[16px] font-semibold">Nowa notatka</h3>
          <input
            type="text"
            required
            placeholder="Tytuł spotkania (np. Status tygodniowy)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-colors border"
          />
          <textarea
            placeholder="Podsumowanie AI lub ręczne ustalenia..."
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            rows={3}
            className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white focus:border-[#0071e3] transition-colors border resize-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-4 py-2 rounded-xl text-[13.5px] text-[#86868b] font-medium hover:bg-[#f5f5f7] transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0071e3] text-white text-[13.5px] font-medium hover:bg-[#0077ED] transition"
            >
              Dodaj
            </button>
          </div>
        </form>
      )}

      {notes.map(note => (
        <div key={note.id} className="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex flex-col gap-6 border border-[#e8e8ed]">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#f5f5f7] pb-6">
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">{note.title}</h2>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">
                  <Mic className="w-3.5 h-3.5" />
                  {note.source}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868b]">
                  <Clock className="w-3.5 h-3.5" />
                  {note.duration}
                </div>
                <div className="text-[13px] font-medium text-[#86868b]">
                  {new Date(note.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-[#f5f5f7] text-[#1d1d1f] rounded-full transition-colors">
              <FileText className="w-5 h-5" />
            </button>
          </div>

          {/* Summary */}
          <div>
             <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-2">Podsumowanie</h3>
             <p className="text-[14px] leading-relaxed text-[#1d1d1f]/80 whitespace-pre-wrap">
               {note.summary}
             </p>
          </div>

          {/* Action Items */}
          {note.actionItems && note.actionItems.length > 0 && (
            <div>
               <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-3">Zadania (Action Items)</h3>
               <div className="space-y-2">
                 {note.actionItems.map(item => (
                   <div 
                     key={item.id} 
                     onClick={() => handleToggleActionItem(note.id, item.id)}
                     className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] transition-colors group cursor-pointer border border-transparent hover:border-[#e8e8ed]"
                   >
                     <div className="mt-0.5 shrink-0">
                       {item.completed ? (
                         <CheckCircle2 className="w-5 h-5 text-[#34c759]" />
                       ) : (
                         <Circle className="w-5 h-5 text-[#d2d2d7] group-hover:text-[#86868b] transition-colors" />
                       )}
                     </div>
                     <span className={`text-[14px] font-medium leading-normal ${item.completed ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'}`}>
                       {item.text}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      ))}
      
      {notes.length === 0 && !isAddingNote && (
        <div className="text-center p-12 bg-white rounded-[24px] border border-[#e8e8ed] text-[#86868b]">
          Brak notatek dla tego profilu. Kliknij "Dodaj Notatkę" powyżej, aby utworzyć pierwszą.
        </div>
      )}

    </div>
  );
}
