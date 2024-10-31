// app/layout.tsx

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext';
export const metadata = {
  title: 'Quizify',
  description: 'Quiz Practice Platform for IITM BS Students',}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
