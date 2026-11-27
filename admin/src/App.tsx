import { useEffect, useState } from 'react'
import './App.css'
import { adminApi, type ReviewItem, type ServiceCategory, type UnmatchedRequest } from './services/api/admin'

export default function App() {
  const [queue, setQueue] = useState<ReviewItem[]>([])
  const [unmatched, setUnmatched] = useState<UnmatchedRequest[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({})
  const [stats, setStats] = useState({ pendingReviews: 0, approvedReviews: 0, rejectedReviews: 0, pendingCategoryProposals: 0, pendingUnmatchedRequests: 0 })
  const [error, setError] = useState('')
  const load = async () => { try { const [items, summary, requests, activeCategories] = await Promise.all([adminApi.queue(), adminApi.stats(), adminApi.unmatched(), adminApi.categories()]); setQueue(items); setStats(summary); setUnmatched(requests); setCategories(activeCategories); setError('') } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load AI review queue') } }
  useEffect(() => {
    let active = true
    void Promise.all([adminApi.queue(), adminApi.stats(), adminApi.unmatched(), adminApi.categories()])
      .then(([items, summary, requests, activeCategories]) => {
        if (!active) return
        setQueue(items)
        setStats(summary)
        setUnmatched(requests)
        setCategories(activeCategories)
        setError('')
      })
      .catch(e => {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load AI review queue')
      })
    return () => { active = false }
  }, [])
  const decide = async (item: ReviewItem, decision: 'approve' | 'reject') => { const category = decision === 'approve' ? window.prompt('Confirm or correct category:', item.suggestedCategory) ?? item.suggestedCategory : undefined; try { await adminApi.decide(item.id, decision, category); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Action failed') } }
  const reviewUnmatched = async (item: UnmatchedRequest, decision: 'assign' | 'close') => {
    const categoryId = Number(selectedCategories[item.id])
    if (decision === 'assign' && !categoryId) {
      setError('Select a category before assigning this request.')
      return
    }
    try {
      await adminApi.reviewUnmatched(item.id, decision, decision === 'assign' ? categoryId : undefined)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to review unmatched request')
    }
  }
  return <div className="admin-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">W</span><span>WedaLink</span></div><p className="eyebrow">ADMINISTRATION</p><nav><a className="active" href="#ai-review">✦ <span>AI review queue</span><b>{stats.pendingReviews}</b></a><a href="#categories">◇ <span>Category proposals</span><b>{stats.pendingCategoryProposals}</b></a><a href="#dashboard">▦ <span>Dashboard</span></a></nav></aside><main className="content"><header className="topbar"><div><p className="eyebrow">AI GOVERNANCE</p><h1>AI review center</h1></div><div className="avatar">A</div></header><section className="welcome"><div><p className="eyebrow">MODEL FEEDBACK</p><h2>Review uncertain classifications</h2><p className="muted">Confirm a category for unsupported requests before provider matching.</p></div><button className="primary" onClick={() => void load()}>Refresh queue</button></section><section className="metric-grid">{[['Pending reviews', stats.pendingReviews], ['Unmatched requests', stats.pendingUnmatchedRequests], ['Approved', stats.approvedReviews], ['Category proposals', stats.pendingCategoryProposals]].map(([label, value]) => <article className="metric-card blue" key={label}><p>{label}</p><strong>{value}</strong></article>)}</section>{error && <p className="error">{error}</p>}<section className="panel"><div className="panel-heading"><div><p className="eyebrow">CUSTOMER REQUESTS</p><h3>Unmatched service requests</h3></div></div>{unmatched.length === 0 ? <p className="muted">No requests need category review.</p> : <div className="activity-list">{unmatched.map(item => <div className="activity unmatched-activity" key={item.id}><div className="activity-dot"/><div className="activity-copy"><b>Request #{item.requestId}</b><span>{item.text}</span><small>{item.reason}</small><select aria-label={`Category for request ${item.requestId}`} value={selectedCategories[item.id] ?? ''} onChange={event => setSelectedCategories({ ...selectedCategories, [item.id]: event.target.value })}><option value="">Choose an active category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><button className="text-button" onClick={() => void reviewUnmatched(item, 'assign')}>Assign</button>  <button className="text-button" onClick={() => void reviewUnmatched(item, 'close')}>Close request</button></div>)}</div>}</section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">PENDING AI DECISIONS</p><h3>Classification review queue</h3></div></div>{queue.length === 0 ? <p className="muted">No pending AI reviews.</p> : <div className="activity-list">{queue.map(item => <div className="activity" key={item.id}><div className="activity-dot"/><div className="activity-copy"><b>{item.suggestedCategory} · {Math.round(item.confidence * 100)}% confidence</b><span>{item.text}</span><small>Request #{item.requestId ?? '—'}</small></div><button className="text-button" onClick={() => void decide(item, 'approve')}>Approve →</button><button className="text-button" onClick={() => void decide(item, 'reject')}>Reject</button></div>)}</div>}</section></main></div>
}
