import { createFileRoute } from '@tanstack/react-router';
import RundaApp from '@/runda/RundaApp';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Runda — bądź widoczny dla znajomych' },
      {
        name: 'description',
        content:
          'Runda pokazuje, którzy znajomi są w pobliżu i co robią. Zamelduj się, dołącz do aktywności i spotkajcie się na żywo.',
      },
    ],
  }),
  component: RundaApp,
});
