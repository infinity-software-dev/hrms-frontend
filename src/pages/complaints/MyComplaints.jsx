import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Plus, Loader2, XCircle, Clock, 
  CheckCircle, ShieldCheck, History, TrendingUp, Info, 
  ChevronRight, Calendar, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../../components/layout/AppShell';
import { getMyComplaints } from '../../api/complaint.api';
import ComplaintDetailsModal from './components/ComplaintDetailsModal';

const STATUS_CONFIG = {
  Pending: { color: '#D97706', bg: '#FEF3C7', icon: Clock },
  Acknowledged: { color: '#2563EB', bg: '#DBEAFE', icon: ShieldCheck },
  'In Review': { color: '#7C3AED', bg: '#F5F3FF', icon: MessageSquare },
  Resolved: { color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  Rejected: { color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = conf.icon;
  return (
    <div className="mc-status-badge" style={{ background: conf.bg, color: conf.color }}>
      <Icon size={14} strokeWidth={2.5} />
      <span>{status}</span>
    </div>
  );
};

const SummaryCard = ({ title, count, color, icon: Icon, subtitle }) => (
  <div className="mc-summary-card">
    <div className="mc-summary-accent" style={{ background: color }} />
    <div className="mc-summary-content">
      <div className="mc-summary-header">
        <span>{title}</span>
        <div className="mc-summary-icon" style={{ color: color, background: `${color}15` }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mc-summary-main">
        <div className="mc-summary-count">{count}</div>
        {subtitle && <div className="mc-summary-subtitle">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const MyComplaints = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, resolved: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyComplaints();
      const complaintsData = res.data?.data || [];
      setComplaints(complaintsData);
      
      // Calculate summary locally
      const stats = complaintsData.reduce((acc, curr) => {
        acc.total++;
        if (curr.status === 'Resolved') acc.resolved++;
        else if (curr.status === 'Pending') acc.pending++;
        return acc;
      }, { total: 0, pending: 0, resolved: 0 });
      setSummary(stats);

    } catch (err) {
      toast.error('Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <AppShell>
      <div className="mc-page-wrapper fade-in">
        
        {/* Header */}
        <div className="mc-header">
          <div className="mc-header-text">
            <div className="mc-header-badge">
                <ShieldCheck size={12} />
                Confidential Reporting
            </div>
            <h1>My Complaints</h1>
            <p>Track your reported grievances and resolution progress</p>
          </div>
          <div className="mc-header-actions">
            <button onClick={() => navigate('/complaints/apply')} className="mc-btn-primary">
              <Plus size={18} strokeWidth={2.5} />
              <span>Report Grievance</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mc-stats-grid">
          <SummaryCard title="Total Reported" count={summary.total} color="#3B82F6" icon={MessageSquare} />
          <SummaryCard title="Pending Review" count={summary.pending} color="#F59E0B" icon={Clock} subtitle="In progress" />
          <SummaryCard title="Resolved" count={summary.resolved} color="#10B981" icon={CheckCircle} subtitle="Successfully closed" />
          <SummaryCard title="Company Policy" count="Secure" color="#8B5CF6" icon={ShieldCheck} subtitle="100% Confidential" />
        </div>

        {/* List Section */}
        <div className="mc-list-container">
          {loading ? (
            <div className="mc-loading-state">
              <Loader2 size={36} className="animate-spin" />
              <p>Fetching your records...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="mc-empty-state">
              <div className="mc-empty-icon"><MessageSquare size={40} /></div>
              <h3>No complaints found</h3>
              <p>You haven't submitted any complaints yet. Your submissions are handled with strict confidentiality.</p>
              <button onClick={() => navigate('/complaints/apply')} className="mc-btn-primary-outline">Submit First Complaint</button>
            </div>
          ) : (
            <div className="mc-complaints-list">
              <AnimatePresence>
                {complaints.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="mc-complaint-card"
                    onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}
                  >
                    <div className="mc-card-main">
                      <div className="mc-card-icon-wrap">
                        <Calendar size={22} />
                      </div>
                      <div className="mc-card-info">
                        <div className="mc-card-title-row">
                          <span className="mc-complaint-title">{c?.title}</span>
                          <span className="mc-category-badge">{c?.category}</span>
                        </div>
                        <div className="mc-complaint-meta">
                          <span>
                            {c?.createdAt ? (
                              (() => {
                                try {
                                  return format(new Date(c.createdAt), 'MMM dd, yyyy');
                                } catch (e) {
                                  return 'Invalid Date';
                                }
                              })()
                            ) : '—'}
                          </span>
                          <span className="mc-bullet">•</span> 
                          ID: <span className="mc-id-code">{c?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mc-card-preview">
                      <span className="mc-label">Description Preview</span>
                      <p>{(c.description || '').length > 80 ? `${c.description.substring(0, 80)}...` : (c.description || 'No description provided')}</p>
                    </div>

                    <div className="mc-card-actions">
                      <div className="mc-status-col">
                        <span className="mc-label">Current Status</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <ChevronRight size={20} className="mc-arrow-icon" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ComplaintDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        complaint={selectedComplaint}
      />

      <style>{`
        .mc-page-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 0 4px 40px;
        }

        /* Header */
        .mc-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
        }

        .mc-header-badge {
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

        .mc-header-text h1 {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0F172A;
          margin: 0;
        }

        .mc-header-text p {
          color: #64748B;
          font-size: 0.95rem;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .mc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 16px;
          border: none;
          background: #4F46E5;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
          transition: all 0.2s;
        }

        .mc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.35);
          background: #4338CA;
        }

        /* Stats */
        .mc-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .mc-summary-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .mc-summary-accent {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 4px;
        }

        .mc-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #94A3B8;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .mc-summary-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mc-summary-count {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
        }

        .mc-summary-subtitle {
          font-size: 0.75rem;
          color: #94A3B8;
          margin-top: 4px;
          font-weight: 500;
        }

        /* List Layout */
        .mc-complaints-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mc-complaint-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px 24px;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .mc-complaint-card:hover {
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
          border-color: #2076C7;
          transform: translateY(-2px);
        }

        .mc-card-main {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1.5;
          min-width: 280px;
        }

        .mc-card-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #F1F5F9;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mc-complaint-card:hover .mc-card-icon-wrap {
          background: #EEF2FF;
          color: #4F46E5;
        }

        .mc-card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .mc-complaint-title {
          font-weight: 800;
          font-size: 1.05rem;
          color: #0F172A;
        }

        .mc-category-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          background: #F1F5F9;
          color: #64748B;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .mc-complaint-meta {
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .mc-bullet { margin: 0 6px; opacity: 0.5; }
        .mc-id-code { font-family: monospace; color: #4F46E5; font-weight: 700; }

        .mc-card-preview {
          flex: 2;
          color: #64748B;
          font-size: 0.85rem;
          line-height: 1.5;
          min-width: 200px;
        }

        .mc-label {
          display: block;
          font-weight: 800;
          font-size: 0.65rem;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .mc-card-preview p { margin: 0; font-style: italic; }

        .mc-card-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }

        .mc-status-col { text-align: right; }

        .mc-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .mc-arrow-icon { color: #CBD5E1; transition: transform 0.2s; }
        .mc-complaint-card:hover .mc-arrow-icon { transform: translateX(4px); color: #2076C7; }

        /* Empty & Loading */
        .mc-loading-state, .mc-empty-state {
          padding: 80px 24px;
          text-align: center;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mc-empty-icon {
          width: 72px;
          height: 72px;
          background: #F8FAFC;
          color: #CBD5E1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .mc-empty-state h3 { margin: 0 0 8px; font-size: 1.25rem; color: #1E293B; }
        .mc-empty-state p { margin: 0 0 24px; color: #64748B; max-width: 400px; }

        .mc-btn-primary-outline {
          padding: 12px 24px;
          border-radius: 12px;
          border: 2px solid #4F46E5;
          background: transparent;
          color: #4F46E5;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mc-btn-primary-outline:hover {
          background: #4F46E5;
          color: #fff;
        }

        @media (max-width: 768px) {
          .mc-complaint-card { flex-direction: column; align-items: flex-start; gap: 16px; }
          .mc-card-actions { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </AppShell>
  );
};

export default MyComplaints;