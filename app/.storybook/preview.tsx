import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      // Load Noto Sans for Storybook (outside Next.js context)
      if (typeof document !== 'undefined' && !document.getElementById('noto-sans-font')) {
        const link = document.createElement('link')
        link.id = 'noto-sans-font'
        link.rel = 'stylesheet'
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
        document.head.appendChild(link)
      }
      return (
        <div style={{ fontFamily: '"Noto Sans", sans-serif' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
