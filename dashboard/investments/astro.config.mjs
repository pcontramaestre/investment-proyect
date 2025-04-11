// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixerPlugin from 'autoprefixer';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    css: {
      postcss: {
        plugins: [
          tailwindcssPostcss,
          autoprefixerPlugin,
        ],
      },
    },
  }
});