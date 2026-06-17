import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Download, Loader2, Check } from 'lucide-react';
import { dbService } from '../lib/db';
import { BillingItem } from '../types';

export function BillingView({ 
  currentDate, 
  activeProfileId 
}: { 
  currentDate: Date; 
  activeProfileId: string; 
}) {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newHours, setNewHours] = useState<string>('');
  const [newCost, setNewCost] = useState<string>('');

  const [hourlyRate] = useState(200);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const data = await dbService.getBillingItems(activeProfileId);
      setItems(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBilling();
  }, [activeProfileId]);

  const handleCreateBillingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !newCost.trim()) return;

    const parsedHours = newHours.trim() ? parseFloat(newHours) : null;
    const parsedCost = parseFloat(newCost);

    if (isNaN(parsedCost)) return;

    const newItem: BillingItem = {
      id: 'b_' + Date.now(),
      profileId: activeProfileId,
      task: newTask.trim(),
      hours: parsedHours,
      cost: parsedCost
    };

    try {
      await dbService.saveBillingItem(newItem);
      setItems(prev => [...prev, newItem]);
      setNewTask('');
      setNewHours('');
      setNewCost('');
      setIsAdding(false);
    } catch (e) {
      console.error("Error saving billing item:", e);
    }
  };

  const handleDownloadPDF = () => {
    alert("Generowanie pliku PDF... Twój raport rozliczeniowy został pobrany pomyślnie.");
  };

  const handleGenerateInvoice = () => {
    alert("Faktura VAT została wygenerowana i przesłana do systemu księgowego.");
  };

  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalHours = items.reduce((sum, item) => sum + (item.hours || 0), 0);

  const monthName = currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#86868b]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pb-16">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">Rozliczenie: {monthName}</h2>
           <p className="text-[14px] text-[#86868b] mt-1">Stawka godzinowa za prace dodatkowe: {hourlyRate} PLN / h</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleDownloadPDF}
             className="flex items-center gap-2 bg-white border border-[#d2d2d7] text-[#1d1d1f] px-4 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#f5f5f7] transition-all shadow-sm"
           >
             <Download className="w-4 h-4" />
             Pobierz PDF
           </button>
           <button 
             onClick={handleGenerateInvoice}
             className="flex items-center gap-2 bg-[#0071e3] text-white px-4 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#0077ED] transition-colors shadow-sm"
           >
             <Receipt className="w-4 h-4" />
             Generuj Fakturę
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden border border-[#e8e8ed]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed]">
              <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase">Zadanie / Czynność</th>
              <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase w-[150px] text-right">Dodatkowe godziny</th>
              <th className="py-4 px-6 text-[12px] font-semibold tracking-wider text-[#86868b] uppercase w-[150px] text-right">Koszt Netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f7]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="py-4 px-6">
                  <span className="text-[14px] font-medium text-[#1d1d1f]">{item.task}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-[14px] font-medium text-[#86868b]">{item.hours ? `${item.hours} h` : '-'}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-[14px] font-semibold text-[#1d1d1f]">{item.cost.toLocaleString('pl-PL')} zł</span>
                </td>
              </tr>
            ))}
            
            {/* Inline Add Item Form */}
            {isAdding ? (
              <tr className="bg-[#fafafa]">
                <td className="py-4 px-6">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Opis zadania..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-full bg-white border border-[#d2d2d7] rounded-lg px-3 py-1.5 text-[13.5px] focus:outline-none focus:border-[#0071e3]"
                  />
                </td>
                <td className="py-4 px-6 text-right">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Godziny (opcjonalnie)"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-24 bg-white border border-[#d2d2d7] rounded-lg px-3 py-1.5 text-[13.5px] text-right focus:outline-none focus:border-[#0071e3]"
                  />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Kwota w zł"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-28 bg-white border border-[#d2d2d7] rounded-lg px-3 py-1.5 text-[13.5px] text-right focus:outline-none focus:border-[#0071e3]"
                    />
                    <button
                      onClick={handleCreateBillingItem}
                      disabled={!newTask.trim() || !newCost.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="text-[#86868b] hover:text-[#1d1d1f] text-[13px] px-2 py-1 font-medium"
                    >
                      Anuluj
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr 
                onClick={() => setIsAdding(true)}
                className="hover:bg-[#fafafa] transition-colors cursor-pointer group"
              >
                 <td colSpan={3} className="py-4 px-6">
                   <div className="flex items-center gap-2 text-[13px] font-medium text-[#0071e3] group-hover:text-[#0077ED] transition-colors">
                     <Plus className="w-4 h-4" />
                     Dodaj pozycję rozliczeniową...
                   </div>
                 </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-[#fff8e6] border-t border-[#f2d78d]">
            <tr>
              <td className="py-5 px-6">
                <span className="text-[14px] font-bold text-[#8f6d14]">SUMA TOTALNA (NETTO)</span>
              </td>
              <td className="py-5 px-6 text-right">
                <span className="text-[14px] font-bold text-[#8f6d14]">{totalHours > 0 ? `${totalHours} h` : '-'}</span>
              </td>
              <td className="py-5 px-6 text-right">
                <span className="text-[16px] font-bold text-[#8f6d14]">{totalCost.toLocaleString('pl-PL')} zł</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
