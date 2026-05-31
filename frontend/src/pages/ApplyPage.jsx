import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English']

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    amount: '',
    purpose: '',
    language: ''
  })

  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const errs = []
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.push('Name must be at least 2 characters.')
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      errs.push('Enter a valid 10-digit Indian mobile number.')
    if (!form.amount || Number(form.amount) <= 0)
      errs.push('Loan amount must be a positive number.')
    if (!form.purpose.trim() || form.purpose.trim().length < 5)
      errs.push('Purpose must be at least 5 characters.')
    if (!form.language)
      errs.push('Please select a preferred language.')
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    setSuccess(null)

    const clientErrors = validate()
    if (clientErrors.length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API}/applications`, {
        ...form,
        amount: Number(form.amount)
      })
      setSuccess(res.data.application)
      setForm({ name: '', mobile: '', amount: '', purpose: '', language: '' })
    } catch (err) {
      const serverErrors = err.response?.data?.errors || ['Something went wrong. Please try again.']
      setErrors(serverErrors)
    } finally {
      setLoading(false)
    }
  }

  // ── Success confirmation screen ──
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Application Submitted!</h2>
          <p style={styles.successSub}>Your reference number</p>
          <div style={styles.refBox}>
            VTT-{success.id.slice(0, 8).toUpperCase()}
          </div>
          <div style={styles.successDetails}>
            <p><strong>Name:</strong> {success.name}</p>
            <p><strong>Amount:</strong> ₹{Number(success.amount).toLocaleString('en-IN')}</p>
            <p><strong>Purpose:</strong> {success.purpose}</p>
            <p><strong>Language:</strong> {success.language}</p>
            <p><strong>Status:</strong> <span style={styles.pendingBadge}>Pending</span></p>
          </div>
          <button style={styles.newBtn} onClick={() => setSuccess(null)}>
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  // ── Application form ──
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Loan Application</h2>
        <p style={styles.subtitle}>Fill in the details below to apply</p>

        {errors.length > 0 && (
          <div style={styles.errorBox}>
            {errors.map((e, i) => <p key={i}>• {e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Kumar"
          />

          <label style={styles.label}>Mobile Number</label>
          <input
            style={styles.input}
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="10-digit number"
            maxLength={10}
          />

          <label style={styles.label}>Loan Amount (₹)</label>
          <input
            style={styles.input}
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 50000"
            min="1"
          />

          <label style={styles.label}>Loan Purpose</label>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="e.g. Small business expansion"
          />

          <label style={styles.label}>Preferred Language</label>
          <select
            style={styles.input}
            name="language"
            value={form.language}
            onChange={handleChange}
          >
            <option value="">Select language</option>
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
    background: '#f5f5f5',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '36px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#1a1a2e',
  },
  subtitle: {
    color: '#666',
    marginBottom: '24px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#444',
    marginBottom: '2px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
  },
  btn: {
    marginTop: '8px',
    padding: '12px',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  errorBox: {
    background: '#fff3f3',
    border: '1px solid #f5c6c6',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#c0392b',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  successCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  successTitle: { fontSize: '22px', fontWeight: '600', marginBottom: '8px', color: '#1a1a2e' },
  successSub: { color: '#666', fontSize: '14px', marginBottom: '8px' },
  refBox: {
    background: '#f0f4ff',
    border: '1px solid #c7d4f8',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: '1px',
    marginBottom: '24px',
    display: 'inline-block',
  },
  successDetails: {
    textAlign: 'left',
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    fontSize: '14px',
    lineHeight: '2',
  },
  pendingBadge: {
    background: '#fff3cd',
    color: '#856404',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  newBtn: {
    padding: '10px 24px',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
  }
}