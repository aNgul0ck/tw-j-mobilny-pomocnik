export type PostStatus = 'Szkic' | 'Do akceptacji' | 'Zaakceptowane' | 'Opublikowane';

export interface Post {
  id: string;
  profileId: string;
  publishDate: string;
  category: string;
  images: string[];
  description: string;
  status: PostStatus;
  clientComments?: string;
  goal?: string;
  ideas?: string;
}

export interface NoteActionItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  profileId: string;
  date: string;
  title: string;
  source: string;
  duration: string;
  summary: string;
  actionItems: NoteActionItem[];
}

export interface BillingItem {
  id: string;
  profileId: string;
  task: string;
  hours: number | null;
  cost: number;
}
