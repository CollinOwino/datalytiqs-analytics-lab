import { login, signup } from '../auth/actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const q = await searchParams
  return <main style={{maxWidth:960,margin:'64px auto',padding:'24px'}}>
    <p className="eyebrow">DATALYTIQS ACADEMY</p>
    <h1>Analytics Lab</h1>
    <p>Sign in to continue your analytical projects, or create a learner account.</p>
    {q.error && <p role="alert">{q.error}</p>}
    {q.message && <p>{q.message}</p>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:32,marginTop:32}}>
      <form action={login} style={{display:'grid',gap:14}}>
        <h2>Sign in</h2>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        <button className="button primary" type="submit">Sign in</button>
      </form>
      <form action={signup} style={{display:'grid',gap:14}}>
        <h2>Create learner account</h2>
        <label>Full name<input name="full_name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        <button className="button primary" type="submit">Create account</button>
      </form>
    </div>
  </main>
}
