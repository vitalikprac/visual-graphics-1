import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/visual-graphics-1/',
  plugins: [glsl()]
});

