export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  ssr: true,

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    storage: 'cookie',
    preference: 'system',
    fallback: 'light'
  },

  runtimeConfig: {
    backendUrl: 'http://127.0.0.1:8080',
    appOrigin: ''
  },

  routeRules: {
    '/': { headers: { 'cache-control': 'private, no-store' } },
    '/login': { headers: { 'cache-control': 'private, no-store' } },
    '/register': { headers: { 'cache-control': 'private, no-store' } },
    '/equipment': { headers: { 'cache-control': 'private, no-store' } },
    '/bookings': { headers: { 'cache-control': 'private, no-store' } },
    '/api/**': { headers: { 'cache-control': 'private, no-store' } }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
