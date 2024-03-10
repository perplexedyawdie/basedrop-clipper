import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ 
      manifest: {
        "manifest_version": 3,
        "name": "CRXJS React Vite Example",
        "version": "1.0.0",
        "action": {
            "default_title": "Click to open panel!"
        },
        "side_panel": {
            "default_path": "index.html"
        },
        "icons": {
            "16": "icon16.png",
            "32": "icon32.png",
            "48": "icon48.png",
            "128": "icon128.png"
        },
        "content_scripts": [
            {
                "js": [
                    "src/content.tsx"
                ],
                "matches": [
                    "https://*/*",
                    "https://*/",
                    "http://*/*",
                    "http://*/"
                ]
            }
        ],
        "permissions": [
            "activeTab",
            "sidePanel"
        ],
        "background": {
            "service_worker": "src/background.ts",
            "type": "module"
        }
    }
     }),
  ],
  server: {
    port: 3000
  },
})
