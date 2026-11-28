import { useEffect, useState } from 'react'
import './App.css'
import { adminApi, type ReviewItem, type ServiceCategory, type UnmatchedRequest } from './services/api/admin'

const metrics = [
  ['Pending reviews', 'AI decisions waiting for you', 'pendingReviews', '✦'],
  ['Unmatched requests', 'Customers waiting for a category', 'pendingUnmatchedRequests', '⌁'],
  ['Approved', 'Reviewed and ready to match', 'approvedReviews', '✓'],
  ['Category proposals', 'New categories to consider', 'pendingCategoryProposals', '◇'],
] as const

export default function App() {
  const [queue, setQueue] = useState<ReviewItem[]>([])
  const [unmatched, setUnmatched] = useState<UnmatchedRequest[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({})
  const [stats, setStats] = useState({ pendingReviews: 0, approvedReviews: 0, rejectedReviews: 0, pendingCategoryProposals: 0, pendingUnmatchedRequests: 0 })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [items, summary, requests, activeCategories] = await Promise.all([adminApi.queue(), adminApi.stats(), adminApi.unmatched(), adminApi.categories()])
      setQueue(items); setStats(summary); setUnmatched(requests); setCategories(activeCategories); setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load the review center') }
  }
  useEffect(() => {
    let active = true
    Promise.all([adminApi.queue(), adminApi.stats(), adminApi.unmatched(), adminApi.categories()])
      .then(([items, summary, requests, activeCategories]) => {
        if (!active) return
        setQueue(items); setStats(summary); setUnmatched(requests); setCategories(activeCategories); setError('')
      })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : 'Unable to load the review center') })
    return () => { active = false }
  }, [])

  const decide = async (item: ReviewItem, decision: 'approve' | 'reject') => {
    const category = decision === 'approve' ? window.prompt('Confirm or correct category:', item.suggestedCategory) ?? item.suggestedCategory : undefined
    try { await adminApi.decide(item.id, decision, category); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Action failed') }
  }
  const reviewUnmatched = async (item: UnmatchedRequest, decision: 'assign' | 'close') => {
    const categoryId = Number(selectedCategories[item.id])
    if (decision === 'assign' && !categoryId) { setError('Choose a category before assigning this request.'); return }
    try { await adminApi.reviewUnmatched(item.id, decision, decision === 'assign' ? categoryId : undefined); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Unable to review this request') }
  }

  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">W</span><span>WedaLink</span></div>
      <div className="workspace"><span className="workspace-dot" />Operations workspace</div>
      <p className="eyebrow">WORKSPACE</p>
      <nav aria-label="Admin sections">
        <a className="active" href="#review-queue"><span className="nav-icon">✦</span><span>Review queue</span><b>{stats.pendingReviews}</b></a>
        <a href="#unmatched"><span className="nav-icon">⌁</span><span>Unmatched requests</span><b>{stats.pendingUnmatchedRequests}</b></a>
        <a href="#overview"><span className="nav-icon">▦</span><span>Overview</span></a>
      </nav>
      <div className="sidebar-help"><span className="help-icon">?</span><div><strong>Need a hand?</strong><small>Review the guide for each decision.</small></div></div>
      <div className="sidebar-footer"><span className="avatar">A</span><div><strong>Admin workspace</strong><small>Signed in securely</small></div></div>
    </aside>
    <main className="content">
      <header className="topbar"><div><p className="eyebrow">AI GOVERNANCE · SATURDAY, NOVEMBER 28</p><h1>Review center</h1></div><div className="top-actions"><span className="live-chip"><span />Live data</span><button className="avatar avatar-button" aria-label="Admin account">A</button></div></header>
      <section className="welcome" id="overview"><div><p className="eyebrow accent-label">GOOD MORNING, ADMIN</p><h2>Keep WedaLink helpful.</h2><p className="muted">A quick review keeps recommendations accurate for customers and providers.</p></div><button className="primary" onClick={() => void load()}><span>↻</span> Refresh data</button></section>
      <section className="metric-grid" aria-label="Review summary">{metrics.map(([label, hint, key, icon]) => <article className="metric-card" key={label}><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span></div><strong>{stats[key]}</strong><p>{hint}</p></article>)}</section>
      {error && <div className="error" role="alert"><span>!</span>{error}</div>}
      <section className="panel" id="unmatched"><div className="panel-heading"><div><p className="eyebrow">CUSTOMER SUPPORT</p><h3>Requests needing a category</h3><p className="muted">Help these customers move forward by choosing the closest service type.</p></div><span className="count-chip">{unmatched.length} open</span></div>{unmatched.length === 0 ? <div className="empty"><span className="empty-icon">✓</span><strong>All requests are matched</strong><span>Nothing needs your attention here.</span></div> : <div className="activity-list">{unmatched.map(item => <div className="activity unmatched-activity" key={item.id}><div className="activity-icon orange">⌁</div><div className="activity-copy"><b>Request #{item.requestId}</b><span>{item.text}</span><small>{item.reason}</small><select aria-label={`Category for request ${item.requestId}`} value={selectedCategories[item.id] ?? ''} onChange={event => setSelectedCategories({ ...selectedCategories, [item.id]: event.target.value })}><option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><button className="secondary-button" onClick={() => void reviewUnmatched(item, 'assign')}>Assign</button><button className="quiet-button" onClick={() => void reviewUnmatched(item, 'close')}>Close</button></div>)}</div>}</section>
      <section className="panel" id="review-queue"><div className="panel-heading"><div><p className="eyebrow">PENDING AI DECISIONS</p><h3>Classification review queue</h3><p className="muted">Approve confident suggestions or reject them when they need a closer look.</p></div><span className="count-chip blue-chip">{queue.length} to review</span></div>{queue.length === 0 ? <div className="empty"><span className="empty-icon">✓</span><strong>Your queue is clear</strong><span>New uncertain classifications will appear here.</span></div> : <div className="activity-list">{queue.map(item => <div className="activity" key={item.id}><div className="activity-icon cyan">✦</div><div className="activity-copy"><div className="decision-line"><b>{item.suggestedCategory}</b><span className="confidence">{Math.round(item.confidence * 100)}% confidence</span></div><span>{item.text}</span><small>Request #{item.requestId ?? '—'}</small></div><button className="secondary-button" onClick={() => void decide(item, 'approve')}>Approve</button><button className="quiet-button danger-button" onClick={() => void decide(item, 'reject')}>Reject</button></div>)}</div>}</section>
    </main>
  </div>
}
