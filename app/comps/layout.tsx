import { Navigation } from './navigation'
import React from 'react'

export function Layout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div data-c-layout>
      <header>
        <Navigation />
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
