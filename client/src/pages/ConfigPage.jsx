// pages/ConfigPage.jsx
// Where users connect their Canvas and Notion accounts.
// Shown on first login and accessible from the dashboard.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function ConfigPage() {
  const [form, setForm] = useState({
    canvasBaseUrl: '',
    canvasToken: '',
    notionToken: '',
    notionDbId: '',
  })
  const [status, setStatus] = useState(null)  // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const navigate = useNavigate()

  // Load existing config on mount
  useEffect(() => {
    api.config.get().then(data => {
      if (data.configured) {
        setIsConfigured(true)
        setForm(f => ({ ...f, canvasBaseUrl: data.canvasBaseUrl || '' }))
      }
    })
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const result = await api.config.save(form)
      setStatus('success')
      setMessage(result.message)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
          <h1 style={styles.title}>Connect your accounts</h1>
          <p style={styles.subtitle}>
            Your credentials are stored securely and only used to sync your assignments.
          </p>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          {/* Canvas section */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Canvas LMS</h2>
              <p style={styles.sectionDesc}>
                Get your token: Canvas → Account → Settings → New Access Token
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Canvas URL</label>
              <input
                name="canvasBaseUrl"
                value={form.canvasBaseUrl}
                onChange={handleChange}
                style={styles.input}
                placeholder="https://canvas.university.edu"
                required
              />
              <span style={styles.hint}>Your school's Canvas base URL</span>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Access Token</label>
              <input
                name="canvasToken"
                value={form.canvasToken}
                onChange={handleChange}
                style={styles.input}
                type="password"
                placeholder={isConfigured ? '(saved — enter new token to update)' : 'Paste your Canvas token'}
                required={!isConfigured}
              />
            </div>
          </section>

          {/* Notion section */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Notion</h2>
              <p style={styles.sectionDesc}>
                Create an integration at notion.so/my-integrations, then share your database with it.
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Integration Token</label>
              <input
                name="notionToken"
                value={form.notionToken}
                onChange={handleChange}
                style={styles.input}
                type="password"
                placeholder={isConfigured ? '(saved — enter new token to update)' : 'secret_...'}
                required={!isConfigured}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Database ID</label>
              <input
                name="notionDbId"
                value={form.notionDbId}
                onChange={handleChange}
                style={styles.input}
                placeholder="32-character ID from your database URL"
                required
              />
              <span style={styles.hint}>
                Open your Notion database → copy the ID from the URL (the part after the last /)
              </span>
            </div>
          </section>

          {/* Required columns reminder */}
          <div style={styles.reminder}>
            <p style={styles.reminderTitle}>Your Notion database needs these columns:</p>
            <div style={styles.columns}>
              {[
                ['Name', 'Title'],
                ['Course', 'Select'],
                ['Due Date', 'Date'],
                ['Status', 'Select'],
                ['Assignment Type', 'Select'],
                ['Points', 'Number'],
                ['Canvas ID', 'Text'],
                ['Canvas URL', 'URL'],
                ['Description', 'Text'],
                ['Last Synced', 'Date'],
              ].map(([name, type]) => (
                <div key={name} style={styles.column}>
                  <span style={styles.columnName}>{name}</span>
                  <span style={styles.columnType}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status message */}
          {message && (
            <div style={{ ...styles.message, ...(status === 'error' ? styles.messageError : styles.messageSuccess) }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            style={{ ...styles.button, opacity: status === 'loading' ? 0.6 : 1 }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Verifying connections...' : 'Save and verify'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f0f10',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: '#f0f0f0',
    padding: '40px 20px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 0 16px',
    display: 'block',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#1a1a1d',
    border: '1px solid #2a2a2d',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px',
    color: '#f0f0f0',
  },
  sectionDesc: {
    color: '#666',
    fontSize: '13px',
    margin: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#aaa',
    fontSize: '13px',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#f0f0f0',
    fontSize: '14px',
    padding: '10px 14px',
    outline: 'none',
  },
  hint: {
    color: '#555',
    fontSize: '12px',
  },
  reminder: {
    backgroundColor: '#111820',
    border: '1px solid #1e3048',
    borderRadius: '12px',
    padding: '20px',
  },
  reminderTitle: {
    color: '#7ab3e0',
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 12px',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  column: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1520',
    borderRadius: '6px',
    padding: '6px 10px',
  },
  columnName: {
    color: '#ddd',
    fontSize: '12px',
  },
  columnType: {
    color: '#556',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  message: {
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 16px',
  },
  messageSuccess: {
    backgroundColor: '#0d2010',
    border: '1px solid #1a4020',
    color: '#4ade80',
  },
  messageError: {
    backgroundColor: '#2a1515',
    border: '1px solid #5a2020',
    color: '#f87171',
  },
  button: {
    backgroundColor: '#5865f2',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    padding: '13px',
    transition: 'opacity 0.15s',
  },
}
