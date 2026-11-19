import './App.css'

const metrics = [
  { label: 'Open service requests', value: '24', change: '+8.4%', tone: 'blue' },
  { label: 'Pending providers', value: '7', change: 'Needs review', tone: 'amber' },
  { label: 'Active equipment rentals', value: '18', change: '+3 this week', tone: 'green' },
  { label: 'Completed jobs', value: '142', change: '+12.6%', tone: 'purple' },
]

const activities = [
  ['Provider approval', 'Marcus Rodriguez submitted a provider application', '12 min ago', 'Review'],
  ['New request', 'Emergency electrical repair request received', '35 min ago', 'Open'],
  ['Equipment rental', 'FLIR E8-XT Thermal Camera was reserved', '1 hr ago', 'View'],
]

export default function App() {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">W</span><span>WedaLink</span></div>
        <p className="eyebrow">ADMINISTRATION</p>
        <nav>
          <a className="active" href="#dashboard">▦ <span>Dashboard</span></a>
          <a href="#requests">◫ <span>Service requests</span></a>
          <a href="#providers">♙ <span>Provider approvals</span><b>7</b></a>
          <a href="#equipment">▣ <span>Equipment rental</span></a>
          <a href="#users">♧ <span>Users</span></a>
          <a href="#reviews">☆ <span>Reviews</span></a>
        </nav>
        <div className="sidebar-bottom"><a href="#settings">⚙ <span>Settings</span></a><a href="#help">? <span>Help center</span></a></div>
      </aside>
      <main className="content">
        <header className="topbar"><div><p className="eyebrow">WEDALINK PLATFORM</p><h1>Good morning, Admin</h1></div><div className="top-actions"><button className="icon-button">⌕</button><button className="icon-button">♢</button><div className="avatar">A</div><span className="admin-name">Administrator</span></div></header>
        <section className="welcome"><div><p className="eyebrow">OVERVIEW</p><h2>Platform overview</h2><p className="muted">Monitor service activity, providers, and equipment rentals.</p></div><button className="primary">＋ Add announcement</button></section>
        <section className="metric-grid">{metrics.map((metric) => <article className={`metric-card ${metric.tone}`} key={metric.label}><div className="metric-icon">●</div><p>{metric.label}</p><strong>{metric.value}</strong><small>{metric.change}</small></article>)}</section>
        <section className="panel-grid"><article className="panel"><div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h3>Latest platform activity</h3></div><a href="#activity">View all</a></div><div className="activity-list">{activities.map(([type, text, time, action]) => <div className="activity" key={text}><div className="activity-dot"/><div className="activity-copy"><b>{type}</b><span>{text}</span><small>{time}</small></div><button className="text-button">{action} →</button></div>)}</div></article><article className="panel quick-panel"><p className="eyebrow">QUICK ACTIONS</p><h3>Manage WedaLink</h3><button>Review provider applications <span>7</span></button><button>Moderate recent reviews <span>12</span></button><button>View service requests <span>24</span></button><button>Manage equipment listings <span>18</span></button></article></section>
      </main>
    </div>
  )
}
