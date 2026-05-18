import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Clock, CheckCircle, XCircle, 
  AlertCircle, MessageSquare, ShieldCheck, 
  Calendar, Loader2, Users, TrendingUp, Info, ChevronRight, X, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { getDirectorComplaints, directorAction } from '../../api/complaint.api';
import { ComplaintGridSkeleton } from './components/ComplaintSkeleton';
import ComplaintEmptyState from './components/ComplaintEmptyState';
import DirectorActionModal from './components/DirectorActionModal';
import ComplaintDetailsModal from './components/ComplaintDetailsModal';

const STATUS_CONFIG = {
  Pending: { color: '#D97706', bg: '#FEF3C7', icon: Clock },
  Acknowledged: { color: '#2563EB', bg: '#DBEAFE', icon: ShieldCheck },
  'In Review': { color: '#7C3AED', bg: '#F5F3FF', icon: MessageSquare },
  Resolved: { color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  Rejected: { color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
};

const PRIORITY_CONFIG = {
  High: { color: '#EF4444', bg: '#FEE2E2' },
  Medium: { color: '#F59E0B', bg: '#FEF3C7' },
  Low: { color: '#10B981', bg: '#D1FAE5' },
};

const StatusBadge = ({ status }) => {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = conf.icon;
  return (
    <div className="cb-status-badge" style={{ background: conf.bg, color: conf.color }}>
      <Icon size={14} strokeWidth={2.5} />
      <span>{status}</span>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const conf = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <div className="cb-priority-badge" style={{ borderColor: `${conf.color}40`, color: conf.color, background: `${conf.color}08` }}>
      <span style={{ background: conf.color }} className="cb-priority-dot" />
      {priority}
    </div>
  );
};

const StatCard = ({ title, count, subtitle, color, icon: Icon }) => (
  <div className="cb-stat-card">
    <div className="cb-stat-accent" style={{ background: color }} />
    <div className="cb-stat-content">
      <div className="cb-stat-header">
        <span>{title}</span>
        <div className="cb-stat-icon" style={{ color: color, background: `${color}15` }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="cb-stat-main">
        <div className="cb-stat-count">{count || 0}</div>
        {subtitle && <div className="cb-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const DirectorComplaints = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, highPriority: 0 });
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, action: '' });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDirectorComplaints(filters);
      const payload = res.data?.data;
      if (payload) {
        setComplaints(payload.complaints || []);
        setStats(payload.stats || { total: 0, Pending: 0, Resolved: 0, highPriority: 0 });
      }
    } catch (err) {
      toast.error('Failed to fetch complaints repository');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchComplaints();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleAction = async (id, action, comments, priority) => {
    try {
      await directorAction(id, { action, comments, priority });
      toast.success(`Complaint updated: ${action}`);
      fetchComplaints();
      setActionModal({ open: false, action: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openActionModal = (complaint, action) => {
    setSelectedComplaint(complaint);
    setActionModal({ open: true, action });
  };

  return (
    <AppShell>
      <div className="cb-page-wrapper fade-in">
        
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-text">
            <div className="cb-header-badge">
              <BarChart3 size={12} />
              Director Command Center
            </div>
            <h1>Complaint Management</h1>
            <p>Enterprise Grievance Management Command Center</p>
          </div>
          <div className="cb-header-actions">
             <div className="cb-search-wrap">
               <Search size={18} className="cb-search-icon" />
               <input 
                 type="text" 
                 placeholder="Search complaints..." 
                 value={filters.search}
                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
               />
             </div>
          </div>
        </div>

        {/* Stats */}
        <div className="cb-stats-grid">
          <StatCard title="Total Applied" count={stats.total} color="#3B82F6" icon={MessageSquare} />
          <StatCard title="Pending" count={stats.Pending} color="#F59E0B" icon={Clock} subtitle="Awaiting action" />
          <StatCard title="Resolved" count={stats.Resolved} color="#10B981" icon={CheckCircle} subtitle="Successfully closed" />
          <StatCard title="High Priority" count={stats.highPriority} color="#EF4444" icon={AlertCircle} subtitle="Critical focus" />
        </div>

        {/* Main Content Area */}
        <div className="cb-main-card">
          {/* Filters Bar */}
          <div className="cb-filters-bar">
            <div className="cb-filter-tabs-scroll">
                <div className="cb-filter-tabs">
                {['All', 'Pending', 'Acknowledged', 'In Review', 'Resolved', 'Rejected'].map((s) => (
                    <button
                    key={s}
                    onClick={() => setFilters(prev => ({ ...prev, status: s }))}
                    className={`cb-filter-tab ${filters.status === s ? 'active' : ''}`}
                    >
                    {s}
                    </button>
                ))}
                </div>
            </div>

            <div className="cb-filter-dropdowns">
              <div className="cb-select-wrap">
                <Filter size={14} />
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="All">All Categories</option>
                  <option value="Work Environment">Work Environment</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Discrimination">Discrimination</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="cb-select-wrap">
                <TrendingUp size={14} />
                <select 
                  value={filters.priority} 
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Low">Low Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="cb-list-container">
            {loading ? (
              <div className="cb-loading-wrap">
                <Loader2 size={40} className="animate-spin" />
                <p>Syncing records...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="cb-empty-wrap">
                <ComplaintEmptyState 
                  title="Clear Repository" 
                  description="No complaints match your current search or filters." 
                />
              </div>
            ) : (
              <div className="cb-table-overflow">
                <table className="cb-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Complaint Detail</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Applied On</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {complaints.map((c, i) => (
                        <motion.tr 
                          key={c._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <td>
                            <div className="cb-emp-cell">
                              {c.employee?.profileImageUrl ? (
                                <img src={c.employee.profileImageUrl} alt="" />
                              ) : (
                                <div className="cb-emp-avatar-placeholder">
                                  {c.employee?.name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <div className="cb-emp-name">{c.employee?.name || 'Unknown'}</div>
                                <div className="cb-emp-code">{c.employee?.employeeCode || 'N/A'} • {c.employee?.department || 'General'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cb-detail-cell" onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}>
                              <div className="cb-complaint-title">{c.title}</div>
                              <div className="cb-complaint-cat">{c.category}</div>
                            </div>
                          </td>
                          <td><PriorityBadge priority={c.priority} /></td>
                          <td><StatusBadge status={c.status} /></td>
                          <td className="cb-date-cell-td">
                            <span className="cb-date-text">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</span>
                          </td>
                          <td className="cb-actions-td">
                            <div className="cb-action-cell">
                               <button 
                                 className="cb-icon-btn cb-view-btn" 
                                 onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}
                                 title="View Full Case"
                               >
                                 <Info size={16} />
                                 <span>View</span>
                               </button>

                               <div className="cb-action-divider" />

                               <button 
                                 className="cb-icon-btn cb-update-btn"
                                 onClick={() => { setSelectedComplaint(c); setActionModal({ open: true, action: 'Update' }); }}
                                 title="Update Status/Priority"
                               >
                                 <TrendingUp size={16} />
                                 <span>Manage</span>
                               </button>

                               {c.status !== 'Resolved' && (
                                 <button 
                                   className="cb-icon-btn cb-resolve-btn"
                                   onClick={() => openActionModal(c, 'Resolve')}
                                   title="Mark as Resolved"
                                 >
                                   <CheckCircle size={16} />
                                   <span>Resolve</span>
                                 </button>
                               )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DirectorActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, action: '' })}
        action={actionModal.action}
        complaint={selectedComplaint}
        onConfirm={handleAction}
      />

      <ComplaintDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        complaint={selectedComplaint}
      />

      <style>{`
        .cb-page-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 8px 40px;
        }

        /* Header */
        .cb-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cb-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #EEF2FF;
          color: #4F46E5;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .cb-header-text h1 {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .cb-header-text p {
          color: #64748B;
          margin-top: 4px;
          font-weight: 500;
        }

        .cb-search-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          padding: 10px 16px;
          border-radius: 16px;
          width: 320px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .cb-search-wrap:focus-within {
          border-color: #2076C7;
          box-shadow: 0 8px 20px rgba(32,118,199,0.1);
        }

        .cb-search-wrap input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.9rem;
          width: 100%;
          font-weight: 500;
        }

        /* Stats */
        .cb-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .cb-stat-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .cb-stat-accent {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 5px;
        }

        .cb-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748B;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .cb-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cb-stat-count {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
          margin-bottom: 6px;
        }

        .cb-stat-subtitle {
          font-size: 0.8rem;
          color: #94A3B8;
          font-weight: 500;
        }

        /* Main Card */
        .cb-main-card {
          background: #fff;
          border-radius: 28px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        .cb-filters-bar {
          padding: 20px 24px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          background: #F8FAFC;
        }

        .cb-filter-tabs-scroll {
            overflow-x: auto;
            scrollbar-width: none;
        }
        .cb-filter-tabs-scroll::-webkit-scrollbar { display: none; }

        .cb-filter-tabs {
          display: flex;
          gap: 4px;
          background: #E2E8F0;
          padding: 4px;
          border-radius: 14px;
          min-width: max-content;
        }

        .cb-filter-tab {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cb-filter-tab.active {
          background: #fff;
          color: #0F172A;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .cb-filter-dropdowns {
          display: flex;
          gap: 12px;
        }

        .cb-select-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          padding: 8px 14px;
          border-radius: 12px;
          color: #64748B;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .cb-select-wrap select {
          border: none;
          outline: none;
          background: transparent;
          color: #0F172A;
          font-weight: 700;
          cursor: pointer;
        }

        /* Table */
        .cb-table-overflow {
          overflow-x: auto;
        }

        .cb-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .cb-table th {
          text-align: left;
          padding: 22px 24px;
          font-size: 0.75rem;
          font-weight: 900;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 2px solid #F1F5F9;
          background: #F8FAFC;
        }

        .cb-table td {
          padding: 24px;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
        }

        .cb-table tr:hover {
          background: #FDFDFD;
          box-shadow: inset 4px 0 0 #4F46E5;
        }

        .cb-emp-cell {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cb-emp-cell img {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .cb-emp-avatar-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #4F46E5;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
        }

        .cb-emp-name {
          font-weight: 800;
          color: #0F172A;
          font-size: 0.95rem;
        }

        .cb-emp-code {
          font-size: 0.75rem;
          color: #94A3B8;
          font-weight: 600;
        }

        .cb-detail-cell {
          cursor: pointer;
        }

        .cb-complaint-title {
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .cb-complaint-cat {
          font-size: 0.7rem;
          font-weight: 800;
          color: #2076C7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cb-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .cb-priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .cb-priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .cb-date-cell {
          font-size: 0.85rem;
          color: #64748B;
          font-weight: 600;
        }

        .cb-action-cell {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .cb-view-btn, .cb-manage-btn, .cb-more-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cb-view-btn { background: #F1F5F9; color: #64748B; }
        .cb-manage-btn { background: #ECFDF5; color: #10B981; }
        .cb-more-btn { background: #fff; color: #94A3B8; border: 1.5px solid #E2E8F0; }

        .cb-action-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-end;
        }

        .cb-icon-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748B;
        }

        .cb-icon-btn span {
          display: inline-block;
        }

        .cb-action-divider {
          width: 1px;
          height: 20px;
          background: #E2E8F0;
          margin: 0 4px;
        }

        .cb-view-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          color: #0F172A;
        }

        .cb-update-btn:hover {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: #4F46E5;
        }

        .cb-resolve-btn {
          background: #ECFDF5;
          border-color: #D1FAE5;
          color: #059669;
        }

        .cb-resolve-btn:hover {
          background: #D1FAE5;
          border-color: #A7F3D0;
          transform: scale(1.02);
        }

        .cb-more-btn:hover { border-color: #2076C7; color: #2076C7; }

        .cb-loading-wrap {
          padding: 80px;
          text-align: center;
          color: #94A3B8;
        }

        .cb-loading-wrap p { margin-top: 16px; font-weight: 600; }

        .cb-empty-wrap {
          padding: 40px;
        }

        @media (max-width: 1024px) {
          .cb-filters-bar { flex-direction: column; align-items: stretch; }
          .cb-header { flex-direction: column; align-items: stretch; }
          .cb-search-wrap { width: 100%; }
        }
      `}</style>
    </AppShell>
  );
};

export default DirectorComplaints;