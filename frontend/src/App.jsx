import { Routes, Route, Link } from 'react-router-dom'
import ApplyPage from './pages/ApplyPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div>
      <nav style={styles.nav}>
        <span style={styles.brand}>🏦 Vitto Portal</span>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Apply</Link>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ApplyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#1a1a2e',
    color: 'white',
  },
  brand: {
    fontSize: '20px',
    fontWeight: '600',
  },
  links: {
    display: 'flex',
    gap: '24px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
  }
}