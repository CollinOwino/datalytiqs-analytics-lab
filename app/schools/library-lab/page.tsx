import type { Metadata } from 'next'
import LibraryChallenge from './library-challenge'
import '../schools.css'

export const metadata: Metadata = { title: 'Library Data Challenge | Young Data Scientists', description: 'A guided statistics challenge using a synthetic school library dataset.' }

export default function Page() { return <main className="school-page"><header className="school-nav"><a className="school-brand" href="/schools"><span>D</span><strong>Young Data Scientists <small>Library data challenge</small></strong></a><nav aria-label="Challenge navigation"><a href="/schools">← Programme</a><a href="/python-for-kids">Python for Kids</a></nav></header><LibraryChallenge /></main> }
