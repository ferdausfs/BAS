import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify('AIzaSyDFOsDEAVjtd-RC9UJI9rndz31B29ThVUo'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify('bas-cake.firebaseapp.com'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('bas-cake'),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify('bas-cake.firebasestorage.app'),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('898898558784'),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify('1:898898558784:web:dae1f820633f0fb07084a5'),
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify('dghx4irfr'),
    'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify('bas_upload'),
  }
})
