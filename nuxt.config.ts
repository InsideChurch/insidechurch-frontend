import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      {
        code: 'en',
        name: 'English',
        iso: 'en-US',
        file: 'en-US.json'
      },
      {
        code: 'pt', 
        name: 'Português (Brasil)',
        iso: 'pt-BR',
        file: 'pt-BR.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'pt', 
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', 
      alwaysRedirect: false, 
    },
    compilation: {
      strictMessage: false, 
    },
    vueI18n: './i18n.config.ts',
  },
  tailwindcss: {
    configPath: './tailwind.config.ts',
  },
});