'use client'

import { createFirebaseApp } from '@/utils/firebase'
import { useEffect } from 'react'

export default function AnalyticsTrigger() {
  useEffect(() => {
    createFirebaseApp()
  }, [])

  return <div className="hidden"></div>
}
