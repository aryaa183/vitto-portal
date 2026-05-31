import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const LANGUAGE_COLORS = {
  Hindi:   { bg: '#fff0f0', color: '#c0392b', border: '#f5c6c6' },
  Tamil:   { bg: '#f0fff4', color: '#1e8449', border: '#a9dfbf' },
  Telugu:  { bg: '#f0f4ff', color: '#1a5276', border: '#aed6f1' },
  Marathi: { bg: '#fff8f0', color: '#935116', border: '#f5cba7' },
  English: { bg: '#f8f0ff', color: '#6c3483', border: '#d2b4de' },
}

const STATUS_COLORS = {
  pending:  { bg: '#fff3cd', color: '#856404' },
  approved: { bg: '#d1f2eb', color: '#1e8449' },
  rejected: { bg: '#fde8e8', color: '#c0392b' },
}

export default function Dashboard() {
  const [applications, setApplications] = useState([])
  const [summary, setSummary] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  async function fetchData() {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const [appsRes, summaryRes] = await Promise.all([
        axios.get(`${API}/applications${params}`),
        axios.get(`${API}/summary`)
      ])
      setApplications(appsRes.data.applications)
      setSummary(summaryRes.data.summary)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, newStatus) {
    setUpdating(id)
    try {
      const res = await axios.patch(`${API}/applications/${id}/status`, {
        status: newStatus
      })
      setApplications(prev =>
        prev.map(app => app.id === id ? res.data.application : app)
      )
      fetchSummary()
    } catch (err) {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  async function fetchSummary() {
    const res = await axios.get(`${API}/summary`)
    setSummary(res.data.summary)
  }

  const filtered = applications.filter(app => {
    const q = search.toLowerCase()
    return (
      app.name.toLowerCase().includes(q) ||
      app.mobile.includes(q)
    )
  })

  return (
    <div style={styles.page}>

      {/* Stats Bar */}
      {summary && (
        <div style={styles.statsBar}>
          <StatCard label="Total Applications" value={summary.total} color="#1a1a2e" />
          <StatCard label="Total Amount" value={`₹${Number(summary.total_amount).toLocaleString('en-IN')}`} color="#1a1a2e" />
          <StatCard label="Pending" value={summary.pending} color="#856404" />
          <StatCard label="Approved" value={summary.approved} color="#1e8449" />
          <StatCard label="Rejected" value={summary.rejected} color="#c0392b" />
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <input
          style={styles.searchInput}
          placeholder="Search by name or mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.center}>Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.center}>No applications found.</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Applicant</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Language</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} style={styles.tr}>
                  <td style={styles.td}>{app.name}</td>
                  <td style={styles.td}>{app.mobile}</td>
                  <td style={styles.td}>₹{Number(app.amount).toLocaleString('en-IN')}</td>
                  <td style={styles.td}>{app.purpose}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: LANGUAGE_COLORS[app.language]?.bg,
                      color: LANGUAGE_COLORS[app.language]?.color,
                      border: `1px solid ${LANGUAGE_COLORS[app.language]?.border}`,
                    }}>
                      {app.language}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: STATUS_COLORS[app.status]?.bg,
                      color: STATUS_COLORS[app.status]?.color,
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(app.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={styles.td}>
                    {app.status === 'pending' ? (
                      <div style={styles.actionBtns}>
                        <button
                          style={styles.approveBtn}
                          disabled={updating === app.id}
                          onClick={() => updateStatus(app.id, 'approved')}
                        >
                          {updating === app.id ? '...' : 'Approve'}
                        </button>
                        <button
                          style={styles.rejectBtn}
                          disabled={updating === app.id}
                          onClick={() => updateStatus(app.id, 'rejected')}
                        >
                          {updating === app.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles = {
  page: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statsBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px 24px',
    flex: '1',
    minWidth: '140px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    flex: '1',
    minWidth: '200px',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
  },
  tableWrapper: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  thead: {
    background: '#f8f8f8',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '500',
    color: '#555',
    borderBottom: '1px solid #eee',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
  },
  approveBtn: {
    padding: '5px 12px',
    background: '#d1f2eb',
    color: '#1e8449',
    border: '1px solid #a9dfbf',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  rejectBtn: {
    padding: '5px 12px',
    background: '#fde8e8',
    color: '#c0392b',
    border: '1px solid #f5c6c6',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  center: {
    textAlign: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '15px',
  },
}