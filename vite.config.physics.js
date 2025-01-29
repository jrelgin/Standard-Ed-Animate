export default {
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        physics: 'src/physics.html'
      }
    }
  },
  server: {
    open: true
  }
}
