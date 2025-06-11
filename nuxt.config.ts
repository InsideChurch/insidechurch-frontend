// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    ['@nuxtjs/i18n', {
      vueI18n: '~/i18n.config.ts', 
      locales: [
        { code: 'en', name: 'English', iso: 'en-US', file: 'en-US.json' },
        { code: 'pt-BR', name: 'Português (Brasil)', iso: 'pt-BR', file: 'pt-BR.json' },
      ],
      lazy: true,
      langDir: 'locales', 
      defaultLocale: 'pt-BR',
      strategy: 'no_prefix',
      compilation: {
        strictMessage: false,
      },
      bundle: { 
        optimizeTranslationDirective: false
      }
    }],
  ],
});