// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', href: '/favicon.ico' }
      ]
    }
  },
  typescript: {
    strict: false,
    typeCheck: false
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/eslint'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || process.env.APP_URL || '',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    }
  },
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
    externals: {
      inline: [
        '@iconify/utils',
        'consola',
        'vue-bundle-renderer',
        '@vue/shared',
        '@vue/runtime-dom',
        '@vue/runtime-core',
        '@vue/reactivity',
        '@vue/compiler-dom',
        'devalue',
        'unhead',
        'vue',
        'entities',
        'estree-walker',
        'source-map-js'
      ]
    }
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }
  },
  ui: {
    colorMode: false
  }
})
