import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  minify: false,
  // Keep the same directory structure
  outExtension() {
    return {
      js: '.js'
    }
  },
  // Don't bundle any dependencies - this fixes the import issues
  external: [/node_modules/]
})