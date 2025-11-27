import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Trash2, X, Check } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

const styles = {
  heading: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginBottom: '0.75rem',
  },
  form: {
    marginBottom: '1.25rem',
    display: 'grid',
    gap: '0.6rem',
    gridTemplateColumns: '2fr 1fr',
  },
  fullRow: {
    gridColumn: '1 / -1',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148,163,184,0.6)',
    backgroundColor: 'rgba(15,23,42,0.7)',
    color: '#e5e7eb',
    fontSize: '0.9rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148,163,184,0.6)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    color: '#e5e7eb',
    fontSize: '0.9rem',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '0.65rem 0.75rem',
    borderRadius: '0.75rem',
    border: 'none',
    background:
      'linear-gradient(to right, rgba(96,165,250,0.95), rgba(129,140,248,0.95))',
    color: 'white',
    fontWeight: '600',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 10px 25px rgba(15,23,42,0.55)',
  },
  error: {
    color: '#fca5a5',
    fontSize: '0.85rem',
    marginBottom: '0.4rem',
  },
  loading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.85rem',
    marginBottom: '0.4rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    maxHeight: '220px',
    overflowY: 'auto',
  },
  item: {
    marginBottom: '0.6rem',
    padding: '0.6rem 0.8rem',
    background: 'rgba(15,23,42,0.75)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148,163,184,0.35)',
  },
  itemHeader: {
    color: 'white',
    marginBottom: '0.25rem',
    fontSize: '0.9rem',
  },
  itemMessage: {
    color: 'rgba(226,232,240,0.95)',
    fontSize: '0.85rem',
    marginBottom: '0.15rem',
  },
  itemMeta: {
    color: 'rgba(148,163,184,0.9)',
    fontSize: '0.75rem',
  },
  empty: {
    color: 'rgba(226,232,240,0.7)',
    fontSize: '0.85rem',
  },
  itemActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: '0.4rem 0.6rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.2s ease',
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    color: 'white',
  },
  saveButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.8)',
    color: 'white',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  editInput: {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(148,163,184,0.6)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    color: '#e5e7eb',
    fontSize: '0.85rem',
    outline: 'none',
  },
  editSelect: {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(148,163,184,0.6)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    color: '#e5e7eb',
    fontSize: '0.85rem',
    outline: 'none',
  },
};

const CrowdReports = ({ city, lat, lon }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [condition, setCondition] = useState('rain');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nickname: '', condition: '', message: '' });

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/reports/`, { params: { city } });
      setReports(res.data);
    } catch (e) {
      console.error('Error fetching reports:', e);
      if (e.response) {
        // Server responded with error
        setError(`Failed to load reports: ${e.response.status} ${e.response.statusText}`);
      } else if (e.request) {
        // Request made but no response
        setError(`Cannot connect to backend. Make sure the server is running at ${API_BASE}`);
      } else {
        // Something else happened
        setError(`Failed to load reports: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      // Test backend connection first
      const testConnection = async () => {
        try {
          await axios.get(`${API_BASE}/health/`);
        } catch (e) {
          console.warn('Backend health check failed:', e);
          setError(`Cannot connect to backend at ${API_BASE}. Make sure the Django server is running on port 8000.`);
        }
      };
      testConnection();
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const submitReport = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE}/reports/`, {
        nickname,
        message,
        condition,
        latitude: lat,
        longitude: lon,
        city,
      });
      setMessage('');
      setNickname('');
      fetchReports();
    } catch (e) {
      console.error('Error submitting report:', e);
      setError(e.response?.data?.detail || e.response?.statusText || 'Failed to submit report');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      setError(null);
      await axios.delete(`${API_BASE}/reports/${id}/`);
      fetchReports();
    } catch (e) {
      console.error('Error deleting report:', e);
      setError(e.response?.data?.detail || e.response?.statusText || 'Failed to delete report');
    }
  };

  const handleEdit = (report) => {
    setEditingId(report.id);
    setEditForm({
      nickname: report.nickname || '',
      condition: report.condition,
      message: report.message,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ nickname: '', condition: '', message: '' });
  };

  const handleUpdate = async (id) => {
    try {
      setError(null);
      await axios.put(`${API_BASE}/reports/${id}/`, {
        ...editForm,
        latitude: lat,
        longitude: lon,
        city,
      });
      setEditingId(null);
      setEditForm({ nickname: '', condition: '', message: '' });
      fetchReports();
    } catch (e) {
      console.error('Error updating report:', e);
      setError(e.response?.data?.detail || e.response?.statusText || 'Failed to update report');
    }
  };

  return (
    <div>
      <h3 style={styles.heading}>Hyperlocal Community Weather Reports</h3>

      <form onSubmit={submitReport} style={styles.form}>
        <div style={styles.fullRow}>
          <input
            placeholder="Nickname (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={styles.input}
          />
        </div>

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={styles.select}
        >
          <option value="rain">Rain</option>
          <option value="sunny">Sunny</option>
          <option value="cloudy">Cloudy</option>
          <option value="windy">Windy</option>
          <option value="storm">Storm</option>
          <option value="fog">Fog</option>
          <option value="other">Other</option>
        </select>

        <div>
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, styles.buttonHover);
            }}
            onMouseOut={(e) => {
              Object.assign(e.currentTarget.style, {
                transform: 'none',
                boxShadow: 'none',
              });
            }}
          >
            Submit report
          </button>
        </div>

        <div style={styles.fullRow}>
          <input
            required
            placeholder="What are you seeing now? (e.g., 'Light rain, roads wet')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
          />
        </div>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p style={styles.loading}>Loading reports...</p>}

      <ul style={styles.list}>
        {reports.map((r) => (
          <li key={r.id} style={styles.item}>
            {editingId === r.id ? (
              <div>
                <div style={styles.editForm}>
                  <input
                    type="text"
                    placeholder="Nickname (optional)"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    style={styles.editInput}
                  />
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    style={styles.editSelect}
                  >
                    <option value="rain">Rain</option>
                    <option value="sunny">Sunny</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="windy">Windy</option>
                    <option value="storm">Storm</option>
                    <option value="fog">Fog</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Message"
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    style={styles.editInput}
                    required
                  />
                </div>
                <div style={styles.itemActions}>
                  <button
                    onClick={() => handleUpdate(r.id)}
                    style={{ ...styles.actionButton, ...styles.saveButton }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{ ...styles.actionButton, ...styles.cancelButton }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={styles.itemHeader}>
                  <strong>{r.nickname || 'Anonymous'}</strong> – {r.condition.toUpperCase()}
                </p>
                <p style={styles.itemMessage}>{r.message}</p>
                <p style={styles.itemMeta}>
                  {new Date(r.created_at).toLocaleTimeString()} • {r.city}
                </p>
                <div style={styles.itemActions}>
                  <button
                    onClick={() => handleEdit(r)}
                    style={{ ...styles.actionButton, ...styles.editButton }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {reports.length === 0 && !loading && (
          <p style={styles.empty}>No reports yet for this city. Be the first!</p>
        )}
      </ul>
    </div>
  );
};

export default CrowdReports;


