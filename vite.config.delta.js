export default {
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        delta: 'src/delta.html'
      }
    }
  },
  server: {
    open: true
  }
}
