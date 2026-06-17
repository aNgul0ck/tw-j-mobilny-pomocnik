import { Post, Note, BillingItem } from '../types';
import { UserProfile } from './AuthContext';

// --- LOCAL (FRONTEND-ONLY) DATABASE IN LOCALSTORAGE ---
// Backend (Firestore/Supabase) is intentionally not wired up here.
// A teammate will replace this service with a real backend implementation.

const hasWindow = (): boolean => typeof window !== 'undefined';

const getLocalData = <T = any>(key: string): T[] => {
  if (!hasWindow()) return [];
  const data = localStorage.getItem(`dash_${key}`);
  return data ? (JSON.parse(data) as T[]) : [];
};

const saveLocalData = (key: string, data: any[]) => {
  if (!hasWindow()) return;
  localStorage.setItem(`dash_${key}`, JSON.stringify(data));
};

// Default template data
const defaultPosts = (profileId: string): Post[] => [
  {
    id: 'p1_' + profileId,
    profileId,
    publishDate: '2026-06-02T14:00:00Z',
    category: 'Wygrana konkursu',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop'],
    description: '1000 osób. Konkurs rozstrzygnięty.\nSpośród wszystkich którzy obserwowali profil, zostawili komentarz i udostępnili post wylosowaliśmy zwycięzcę.\nDarmowe mycie detailingowe jedzie do @mmmichal_26.\nNapisz do nas w wiadomości prywatnej, umówimy termin!\nDzięki wszystkim za udział.',
    status: 'Opublikowane',
    goal: 'Ogłoszenie wyników, zamknięcie konkursu, budowanie wiarygodności',
  },
  {
    id: 'p2_' + profileId,
    profileId,
    publishDate: '2026-06-03T18:30:00Z',
    category: 'Mycie detailingowe',
    images: [
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600539755490-b18413a2dbbb?q=80&w=1000&auto=format&fit=crop',
    ],
    description: 'Niebieskie BMW M2. Mycie detailingowe od początku do końca.\nPianka aktywna, dwuwiaderkowa metoda, ręczne suszenie. Każdy panel osobno, żeby lakier nie zbierał mikrorysek przy kontakcie z gąbką.\nTak wygląda mycie u nas. Termin przez link w bio.',
    status: 'Opublikowane',
    goal: 'Pokazać proces i jakość. CTA na rezerwację wplecione naturalnie.',
  },
  {
    id: 'p3_' + profileId,
    profileId,
    publishDate: '2026-06-05T15:30:00Z',
    category: 'Powłoka ceramiczna',
    images: ['https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?q=80&w=1000&auto=format&fit=crop'],
    description: 'Ceramika nie zmienia wyglądu lakieru. Zmienia to, co się z nim dzieje przez kolejne lata.\nOdpycha wodę, blokuje UV, ułatwia każde kolejne mycie. Samochód wygląda jak nowy dłużej, bo ma czym się bronić.\nNapisz do nas. Powiemy Ci czy Twój samochód się kwalifikuje i ile to kosztuje.',
    status: 'Opublikowane',
    goal: 'Edukacja, ekspercka pozycja, generowanie zapytań',
  },
  {
    id: 'p4_' + profileId,
    profileId,
    publishDate: '2026-06-09T12:00:00Z',
    category: 'Realizacja bieżąca',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop',
    ],
    description: 'Porsche 911. Właśnie wyjechało od nas.\nWpadło brudne. A wyjechało o tak.',
    status: 'Do akceptacji',
    goal: 'Pokazać codzienną pracę studia. Budować wiarygodność przez konkretne zlecenie.',
    clientComments: 'TRZEBA WYBRAĆ DOBRY MATERIAŁ OD CHŁOPAKÓW !!!',
  },
  {
    id: 'p5_' + profileId,
    profileId,
    publishDate: '2026-06-11T10:00:00Z',
    category: 'Tapicerka / skóry',
    images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop'],
    description: 'Skóra w samochodzie starzeje się po cichu. Traci kolor, twardnieje, zaczyna pękać. Zanim to nastąpi, oceniamy stan, dobieramy chemię do rodzaju skóry i czyścimy warstwa po warstwie. Na koniec Gtechniq Leather Guard. Blokuje UV, ścieranie i przenoszenie koloru z ubrań. Napisz do nas po wycenę.',
    status: 'Szkic',
    goal: 'Edukacja o procesie czyszczenia i impregnacji skór. Trigger ekspertyzy.',
  },
];

const defaultNotes = (profileId: string): Note[] => [
  {
    id: 'n1_' + profileId,
    profileId,
    date: '2026-06-05T10:00:00Z',
    title: 'Call Statusowy - czerwiec',
    source: 'Fireflies.ai',
    duration: '45 min',
    summary: 'Omówienie planu na czerwiec. Skupiamy się na usługach PPF i powłokach ceramicznych przed wakacjami. Główne przesłanie: ochrona auta na wyjazdy wakacyjne.',
    actionItems: [
      { id: 1, text: 'Przygotować rolki z aplikacji PPF na maskę', completed: true },
      { id: 2, text: 'Zrobić zdjęcia przed/po mocno zabrudzonego wnętrza', completed: false },
      { id: 3, text: 'Wypuścić kampanię "Zabezpiecz auto przed urlopem"', completed: false },
    ],
  },
  {
    id: 'n2_' + profileId,
    profileId,
    date: '2026-05-20T14:30:00Z',
    title: 'Podsumowanie kampanii majowej',
    source: 'Fireflies.ai',
    duration: '30 min',
    summary: 'Rolka o myciu premium zebrała bardzo dobre zasięgi. Klienci pytali głównie o czas realizacji. W kolejnym miesiącu warto dodać Q&A na stories odnośnie czasu mycia.',
    actionItems: [{ id: 4, text: 'Przygotować grafikę Q&A na Instastories', completed: true }],
  },
];

const defaultBillingItems = (profileId: string): BillingItem[] => [
  { id: 'b1_' + profileId, profileId, task: 'Miesięczna obsługa Instagrama (rolka + statyczne)', hours: null, cost: 3500 },
  { id: 'b2_' + profileId, profileId, task: 'Dodatkowa kampania płatna - Meta Ads (konfiguracja)', hours: 4, cost: 800 },
  { id: 'b3_' + profileId, profileId, task: 'Poprawki na stronie www (cennik)', hours: 2.5, cost: 500 },
];

// Initialize local DB if empty
const initLocalDb = () => {
  if (!hasWindow()) return;
  if (getLocalData('profiles').length === 0) {
    saveLocalData('profiles', [
      { id: 'bubble-auto', name: 'Bubble Auto' },
      { id: 'zenith-clean', name: 'Zenith Clean' },
    ]);
  }
  if (getLocalData('users').length === 0) {
    saveLocalData('users', [
      { email: 'antek.golik@gmail.com', role: 'admin', profileIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { email: 'client@bubbleauto.com', role: 'client', profileIds: ['bubble-auto'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);
  }
  if (getLocalData('posts').length === 0) {
    saveLocalData('posts', [...defaultPosts('bubble-auto'), ...defaultPosts('zenith-clean')]);
  }
  if (getLocalData('notes').length === 0) {
    saveLocalData('notes', [...defaultNotes('bubble-auto'), ...defaultNotes('zenith-clean')]);
  }
  if (getLocalData('billing').length === 0) {
    saveLocalData('billing', [...defaultBillingItems('bubble-auto'), ...defaultBillingItems('zenith-clean')]);
  }
};

if (hasWindow()) {
  initLocalDb();
}

// --- DATABASE SERVICE API (frontend-only, swap with real backend later) ---

export const dbService = {
  async getProfiles(): Promise<{ id: string; name: string }[]> {
    return getLocalData('profiles');
  },

  async createProfile(profileId: string, name: string): Promise<void> {
    const profiles = getLocalData<{ id: string; name: string }>('profiles');
    if (!profiles.some((p) => p.id === profileId)) {
      profiles.push({ id: profileId, name });
      saveLocalData('profiles', profiles);
      saveLocalData('posts', [...getLocalData('posts'), ...defaultPosts(profileId)]);
      saveLocalData('notes', [...getLocalData('notes'), ...defaultNotes(profileId)]);
      saveLocalData('billing', [...getLocalData('billing'), ...defaultBillingItems(profileId)]);
    }
  },

  async getUsers(): Promise<UserProfile[]> {
    return getLocalData<UserProfile>('users');
  },

  async createUser(email: string, role: 'admin' | 'client' = 'client', profileIds: string[] = []): Promise<void> {
    const users = getLocalData<UserProfile>('users');
    if (!users.some((u) => u.email === email)) {
      users.push({ email, role, profileIds });
      saveLocalData('users', users);
    }
  },

  async updateUser(email: string, data: Partial<UserProfile>): Promise<void> {
    const users = getLocalData<UserProfile>('users');
    const index = users.findIndex((u) => u.email === email);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveLocalData('users', users);
    }
  },

  async getPosts(profileId: string): Promise<Post[]> {
    return getLocalData<Post>('posts').filter((p) => p.profileId === profileId);
  },

  async savePost(post: Post): Promise<void> {
    const posts = getLocalData<Post>('posts');
    const index = posts.findIndex((p) => p.id === post.id);
    if (index !== -1) posts[index] = post;
    else posts.push(post);
    saveLocalData('posts', posts);
  },

  async deletePost(postId: string): Promise<void> {
    saveLocalData('posts', getLocalData<Post>('posts').filter((p) => p.id !== postId));
  },

  async getNotes(profileId: string): Promise<Note[]> {
    return getLocalData<Note>('notes').filter((n) => n.profileId === profileId);
  },

  async saveNote(note: Note): Promise<void> {
    const notes = getLocalData<Note>('notes');
    const index = notes.findIndex((n) => n.id === note.id);
    if (index !== -1) notes[index] = note;
    else notes.push(note);
    saveLocalData('notes', notes);
  },

  async getBillingItems(profileId: string): Promise<BillingItem[]> {
    return getLocalData<BillingItem>('billing').filter((b) => b.profileId === profileId);
  },

  async saveBillingItem(item: BillingItem): Promise<void> {
    const billing = getLocalData<BillingItem>('billing');
    const index = billing.findIndex((b) => b.id === item.id);
    if (index !== -1) billing[index] = item;
    else billing.push(item);
    saveLocalData('billing', billing);
  },
};
