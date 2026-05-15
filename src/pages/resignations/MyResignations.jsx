import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText, Plus, Loader2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, X, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import AppShell from '../../components/layout/AppShell';
import { getMyResignations, takeResignationAction } from '../../api/resignation.api';

const statusConfig = {
  'Pending': { icon: Clock, color: '#F59E0B', bg: '#FEF3C7' },
  'Approved': { icon: CheckCircle, color: '#10B981', bg: '#D1FAE5' },
  'Rejected': { icon: XCircle, color: '#EF4444', bg: '#FEE2E2' },
  'On Hold': { icon: AlertCircle, color: '#8B5CF6', bg: '#EDE9FE' },
  'Sent Back': { icon: RefreshCw, color: '#3B82F6', bg: '#DBEAFE' },
  'Withdrawn': { icon: X, color: '#6B7280', bg: '#F3F4F6' }
};

const MyResignations = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const navigate = useNavigate();

  const fetchResignations = async () => {
    try {
      const res = await getMyResignations();
      setResignations(res.data);
    } catch (err) {
      toast.error('Failed to load resignations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw your resignation?')) return;
    setWithdrawingId(id);
    try {
      await takeResignationAction(id, { action: 'Withdraw' });
      toast.success('Resignation withdrawn successfully');
      fetchResignations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <AppShell>
      <div className="mr-container fade-in">
        <div className="mr-header">
          <div>
            <h1 className="mr-title">My Resignations</h1>
            <p className="mr-subtitle">Track your resignation requests and approval status</p>
          </div>
          <button onClick={() => navigate('/resignations/apply')} className="mr-apply-btn">
            <Plus size={18} /> Apply Resignation
          </button>
        </div>

        {loading ? (
          <div className="mr-loading">
            <Loader2 size={32} className="animate-spin" />
            <p>Loading resignations...</p>
          </div>
        ) : resignations.length === 0 ? (
          <div className="mr-empty">
            <FileText size={48} className="mr-empty-icon" />
            <h3>No Resignations Found</h3>
            <p>You have not applied for any resignations yet.</p>
          </div>
        ) : (
          <div className="mr-list">
            {resignations.map((resig) => {
              const StatusIcon = statusConfig[resig.status]?.icon || Clock;
              const statusColor = statusConfig[resig.status]?.color || '#000';
              const statusBg = statusConfig[resig.status]?.bg || '#f3f4f6';

              return (
                <div key={resig._id} className="mr-card">
                  <div className="mr-card-header">
                    <div className="mr-card-title-group">
                      <div className="mr-icon-box" style={{ background: statusBg, color: statusColor }}>
                        <StatusIcon size={24} />
                      </div>
                      <div>
                        <h3>{resig.reason}</h3>
                        <p>Applied on: {format(new Date(resig.resignationDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="mr-status-badge" style={{ background: statusBg, color: statusColor }}>
                      {resig.status}
                    </div>
                  </div>

                  <div className="mr-card-body">
                    <div className="mr-info-grid">
                      <div className="mr-info-item">
                        <span className="mr-info-label">Notice Period</span>
                        <span className="mr-info-value">{resig.noticePeriodDays} Days</span>
                      </div>
                      <div className="mr-info-item">
                        <span className="mr-info-label">Last Working Day</span>
                        <span className="mr-info-value">{format(new Date(resig.lastWorkingDay), 'MMM dd, yyyy')}</span>
                      </div>
                      {resig.status === 'Pending' && (
                        <div className="mr-info-item">
                          <span className="mr-info-label">Pending With</span>
                          <span className="mr-info-value">{resig.currentApproverRole || 'Processing...'}</span>
                        </div>
                      )}
                    </div>

                    {resig.remarks && (
                      <div className="mr-remarks">
                        <span className="mr-info-label">Remarks:</span>
                        <p>{resig.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="mr-timeline-container">
                    <h4 className="mr-timeline-title">Approval Timeline</h4>
                    <div className="mr-timeline">
                      {resig.timeline.map((event, idx) => (
                        <div key={event._id || idx} className="mr-timeline-item">
                          <div className="mr-timeline-dot"></div>
                          <div className="mr-timeline-content">
                            <div className="mr-timeline-header">
                              <span className="mr-timeline-action">{event.action}</span>
                              <span className="mr-timeline-date">
                                {format(new Date(event.timestamp), 'MMM dd, hh:mm a')}
                              </span>
                            </div>
                            <div className="mr-timeline-by">
                              By {event.actionBy?.name || 'System'} ({event.role})
                            </div>
                            {event.comments && (
                              <div className="mr-timeline-comments">
                                "{event.comments}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mr-card-footer">
                    {['Pending', 'On Hold', 'Sent Back'].includes(resig.status) && (
                      <button
                        className="mr-btn-danger"
                        onClick={() => handleWithdraw(resig._id)}
                        disabled={withdrawingId === resig._id}
                      >
                        {withdrawingId === resig._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .mr-container { max-width: 900px; margin: 0 auto; padding: 20px 0; }
        .mr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .mr-title { font-size: 1.8rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px 0; }
        .mr-subtitle { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
        .mr-apply-btn { background: var(--gradient-primary); color: white; border: none; padding: 12px 20px; border-radius: var(--radius-lg); font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .mr-apply-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(32, 118, 199, 0.3); }
        
        .mr-loading, .mr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--color-text-secondary); }
        .mr-empty h3 { color: var(--color-text); margin: 16px 0 8px 0; }
        .mr-empty-icon { color: #CBD5E1; }

        .mr-list { display: flex; flex-direction: column; gap: 24px; }
        .mr-card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--color-border); padding: 24px; box-shadow: var(--shadow-sm); }
        
        .mr-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border-light); }
        .mr-card-title-group { display: flex; gap: 16px; align-items: center; }
        .mr-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .mr-card-title-group h3 { margin: 0 0 4px 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text); }
        .mr-card-title-group p { margin: 0; font-size: 0.85rem; color: var(--color-text-tertiary); }
        .mr-status-badge { padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }

        .mr-card-body { margin-bottom: 24px; }
        .mr-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .mr-info-item { display: flex; flex-direction: column; gap: 4px; }
        .mr-info-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--color-text-tertiary); }
        .mr-info-value { font-size: 0.95rem; font-weight: 600; color: var(--color-text); }
        .mr-remarks { background: var(--color-surface-alt); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.9rem; color: var(--color-text-secondary); }

        .mr-timeline-container { background: #F8FAFC; border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px; border: 1px solid #E2E8F0; }
        .mr-timeline-title { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 16px 0; }
        .mr-timeline { display: flex; flex-direction: column; gap: 16px; position: relative; }
        .mr-timeline::before { content: ''; position: absolute; top: 8px; bottom: 8px; left: 6px; width: 2px; background: #E2E8F0; }
        .mr-timeline-item { position: relative; padding-left: 24px; }
        .mr-timeline-dot { position: absolute; left: 0; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: white; border: 3px solid var(--color-primary); z-index: 1; }
        .mr-timeline-content { background: white; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .mr-timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .mr-timeline-action { font-weight: 700; font-size: 0.9rem; color: var(--color-text); }
        .mr-timeline-date { font-size: 0.75rem; color: var(--color-text-tertiary); font-weight: 600; }
        .mr-timeline-by { font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 500; }
        .mr-timeline-comments { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #E2E8F0; font-size: 0.85rem; color: var(--color-text); font-style: italic; }

        .mr-card-footer { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--color-border-light); padding-top: 16px; }
        .mr-btn-danger { background: white; color: #EF4444; border: 1px solid #FCA5A5; padding: 8px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
        .mr-btn-danger:hover:not(:disabled) { background: #FEF2F2; border-color: #EF4444; }
        .mr-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </AppShell>
  );
};

export default MyResignations;
