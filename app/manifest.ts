import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: 'Bisca Assistant - Assistente Inteligente para Bisca',
    short_name: 'Bisca Assistant',
    description:
      'Assistente inteligente para o jogo de cartas Bisca. Rastreia cartas jogadas, recomenda jogadas e analisa estilos de jogo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'pt-BR',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['games', 'entertainment', 'utilities'],
  };
};

export default manifest;
