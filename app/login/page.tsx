import { login, signup } from '../auth/actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const q = await searchParams
  const next = q.next?.startsWith('/') && !q.next.startsWith('//') ? q.next : '/'
  return <main style={{maxWidth:960,margin:'64px auto',padding:'24px'}}>
    <p className="eyebrow">DATALYTIQS INSTITUTE</p>
    <h1>Analytics Lab</h1>
    <p>Sign in to retain project checkpoints, notebook work and evidence progress—or create a learner account to begin.</p>
    {q.error && <p role="alert">{q.error}</p>}
    {q.message && <p>{q.message}</p>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:32,marginTop:32}}>
      <form action={login} style={{display:'grid',gap:14}}>
        <input type="hidden" name="next" value={next} />
        <h2>Sign in</h2>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        <button className="button primary" type="submit">Sign in</button>
      </form>
      <form action={signup} style={{display:'grid',gap:14}}>
        <input type="hidden" name="next" value={next} />
        <h2>Create learner account</h2>
        <label>Full name<input name="full_name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        <button className="button primary" type="submit">Create account</button>
      </form>
    </div>
    <p style={{marginTop:32,color:'#667085',fontSize:13,lineHeight:1.6}}>Your analytical work is private to your account. Practical execution is bounded, and teaching datasets are clearly identified as illustrative where applicable.</p>
  </main>
}
