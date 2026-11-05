'use client'

import { createFirebaseApp } from '@/utils/firebase'
import { useEffect } from 'react'

export default function AnalyticsTrigger() {
  useEffect(() => {
    void createFirebaseApp()
  }, [])

  return <div className="hidden"></div>
}
