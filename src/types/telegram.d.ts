declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        setBackgroundColor: (color: string) => void
        setHeaderColor: (color: string) => void
        enableClosingConfirmation?: () => void
        setVerticalPadding?: (padding: number) => void
        onEvent?: (event: string, callback: () => void) => void
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
      }
    }
  }
}

export {}

