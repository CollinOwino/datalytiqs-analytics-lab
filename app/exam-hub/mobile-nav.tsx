'use client'

import { useRef } from 'react'

export function MobileExamNav({ isReviewer, signedIn }: { isReviewer: boolean; signedIn: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null)
  const closeMenu = () => { if (menu.current) menu.current.open = false }

  return <details className="exam-mobile-nav" ref={menu}>
    <summary>Menu</summary>
    <nav aria-label="Mobile Exam Hub navigation" onClick={(event) => {
      if ((event.target as HTMLElement).closest('a')) closeMenu()
    }}>
      <a href="#overview">Overview</a>
      <a href="#syllabus">Syllabus</a>
      <a href="#assessments">Assessments</a>
      <a href="#competencies">Competencies</a>
      {isReviewer && <a href="/exam-hub/review">Review queue</a>}
      {!signedIn && <a href="/login?next=/exam-hub">Sign in</a>}
      <a href="/">Analytics Lab</a>
    </nav>
  </details>
}
