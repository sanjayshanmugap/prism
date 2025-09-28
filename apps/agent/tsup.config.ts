import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['better-sqlite3'],
});