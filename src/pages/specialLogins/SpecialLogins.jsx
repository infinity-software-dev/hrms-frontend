import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Edit3, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import AppShell from '../../components/layout/AppShell';

// import api from './axios';




const SpecialLogins = () => {
  const { user } = useAuth();   // contains req.user data after login
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ role: 'HR', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchLogins = useCallback(async () => {
    try {
      const { data } = await api.get('/special-logins');
      setLogins(data.data);
    } catch (err) {
      toast.error('Failed to fetch special logins');
    }
  }, []);

  useEffect(() => {
    fetchLogins();
  }, [fetchLogins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.post('/special-logins', form);
      toast.success('Special login created');
      setForm({ role: 'HR', password: '', name: '' });
      fetchLogins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this special login?')) return;
    try {
      await api.delete(`/special-logins/${id}`);
      toast.success('Deleted');
      fetchLogins();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleUpdate = async (id) => {
    const login = logins.find((l) => l._id === id);
    if (!login) return;
    const newPassword = prompt('New password (min 6 chars, leave blank to keep):');
    const newStatus = confirm('Set status to Active? (Cancel = Inactive)') ? 'Active' : 'Inactive';
    try {
      const payload = {};
      if (newPassword && newPassword.length >= 6) payload.password = newPassword;
      payload.status = newStatus;
      await api.patch(`/special-logins/${id}`, payload);
      toast.success('Updated');
      fetchLogins();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
      <AppShell>
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Special Login Management</h1>

      {/* Creation Form */}
      <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 16, padding: 20, marginBottom: 30, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginBottom: 15 }}>Create New Special Login</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}>
              <option value="HR">HR</option>
              <option value="GM">GM</option>
              <option value="VP">VP</option>
              <option value="Director">Director</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 chars"
                style={{ padding: '8px 35px 8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>Name (optional)</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., HR Manager"
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #2076C7, #1CADA3)', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
            Create
          </button>
        </form>
      </div>

      {/* Table */}
      {logins.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Special ID</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px 8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logins.map((login) => (
              <tr key={login._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px' }}>{login.specialId}</td>
                <td style={{ padding: '10px 8px' }}>{login.role}</td>
                <td style={{ padding: '10px 8px' }}>{login.name || '-'}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{ color: login.status === 'Active' ? '#10b981' : '#ef4444', fontWeight: 500 }}>{login.status}</span>
                </td>
                <td style={{ padding: '10px 8px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handleUpdate(login._id)} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                    <Edit3 size={14} style={{ marginRight: 4 }} /> Edit
                  </button>
                  <button onClick={() => handleDelete(login._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                    <Trash2 size={14} style={{ marginRight: 4 }} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No special login accounts yet.</p>
      )}
    </div>

    </AppShell>
  );
};

export default SpecialLogins;