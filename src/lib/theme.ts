export type ThemeChoice = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

/** Inline, blocking script: applies the saved theme class before first paint. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.classList.add(t)}catch(e){}`
