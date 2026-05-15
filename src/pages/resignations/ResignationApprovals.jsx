import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Clock, User, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import AppShell from '../../components/layout/AppShell';
import { getPendingApprovals, takeResignationAction } from '../../api/resignation.api';

const ResignationApprovals = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResig, setSelectedResig] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Approve', 'Reject', 'Put on Hold', 'Send Back'
  const [comments, setComments] = useState('');

  const fetchApprovals = async () => {
    try {
      const res = await getPendingApprovals();
      setResignations(res.data);
    } catch (err) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const openActionModal = (resig, action) => {
    setSelectedResig(resig);
    setActionType(action);
    setComments('');
    setModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResig || !actionType) return;
    
    // Comments optional for Approve/Hold, but good for Reject/Send Back. We'll leave it optional overall.
    if (['Reject', 'Send Back'].includes(actionType) && !comments.trim()) {
      toast.error(`Comments are required to ${actionType}`);
      return;
    }

    setActionLoading(true);
    try {
      await takeResignationAction(selectedResig._id, { action: actionType, comments });
      toast.success(`Resignation ${actionType}d successfully`);
      setModalOpen(false);
      fetchApprovals(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionType}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getActionBtnClass = (action) => {
    switch(action) {
      case 'Approve': return 'ra-btn-approve';
      case 'Reject': return 'ra-btn-reject';
      case 'Put on Hold': return 'ra-btn-hold';
      case 'Send Back': return 'ra-btn-sendback';
      default: return 'ra-btn-default';
    }
  };

  return (
    <AppShell>
      <div className="ra-container fade-in">
        <div className="ra-header">
          <h1 className="ra-title">Resignation Approvals</h1>
          <p className="ra-subtitle">Review and manage employee resignation requests</p>
        </div>

        {loading ? (
          <div className="ra-loading">
            <Loader2 size={32} className="animate-spin" />
            <p>Loading pending requests...</p>
          </div>
        ) : resignations.length === 0 ? (
          <div className="ra-empty">
            <CheckCircle size={48} className="ra-empty-icon" />
            <h3>All Caught Up!</h3>
            <p>You have no pending resignation requests to review.</p>
          </div>
        ) : (
          <div className="ra-grid">
            {resignations.map((resig) => (
              <div key={resig._id} className="ra-card">
                <div className="ra-card-header">
                  <div className="ra-employee-info">
                    <div className="ra-avatar">
                      {resig.employee?.profileImageUrl ? (
                        <img src={resig.employee.profileImageUrl} alt="User" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="ra-emp-name">{resig.employee?.name}</h3>
                      <p className="ra-emp-detail">
                        {resig.employee?.employeeCode} • {resig.employee?.position || 'Employee'}
                      </p>
                    </div>
                  </div>
                  <div className="ra-status-badge">
                    {resig.status}
                  </div>
                </div>

                <div className="ra-card-body">
                  <div className="ra-info-row">
                    <span className="ra-info-label">Resignation Date</span>
                    <span className="ra-info-value">{format(new Date(resig.resignationDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="ra-info-row">
                    <span className="ra-info-label">Last Working Day</span>
                    <span className="ra-info-value">{format(new Date(resig.lastWorkingDay), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="ra-info-row">
                    <span className="ra-info-label">Reason</span>
                    <span className="ra-info-value font-semibold">{resig.reason}</span>
                  </div>
                  {resig.remarks && (
                    <div className="ra-remarks-box">
                      <strong>Remarks:</strong> {resig.remarks}
                    </div>
                  )}

                  {/* Previous comments/history summary if any */}
                  {resig.timeline?.length > 1 && (
                    <div className="ra-timeline-summary">
                      <Clock size={14} />
                      <span>{resig.timeline.length - 1} previous actions recorded</span>
                    </div>
                  )}
                </div>

                <div className="ra-card-actions">
                  <button className="ra-btn ra-btn-approve" onClick={() => openActionModal(resig, 'Approve')}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="ra-btn ra-btn-reject" onClick={() => openActionModal(resig, 'Reject')}>
                    <XCircle size={16} /> Reject
                  </button>
                  <button className="ra-btn ra-btn-hold" onClick={() => openActionModal(resig, 'Put on Hold')}>
                    <AlertCircle size={16} /> Hold
                  </button>
                  <button className="ra-btn ra-btn-sendback" onClick={() => openActionModal(resig, 'Send Back')}>
                    <RefreshCw size={16} /> Send Back
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {modalOpen && (
          <div className="ra-modal-overlay">
            <div className="ra-modal fade-in">
              <h2 className="ra-modal-title">Confirm {actionType}</h2>
              <p className="ra-modal-subtitle">
                You are about to <strong>{actionType.toLowerCase()}</strong> the resignation for {selectedResig?.employee?.name}.
              </p>

              <form onSubmit={handleActionSubmit}>
                <div className="ra-input-group">
                  <label>
                    Comments {['Reject', 'Send Back'].includes(actionType) && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add your remarks/comments here..."
                    required={['Reject', 'Send Back'].includes(actionType)}
                  />
                </div>

                <div className="ra-modal-actions">
                  <button type="button" className="ra-btn-cancel" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className={`ra-btn ${getActionBtnClass(actionType)}`}>
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ra-container { max-width: 1200px; margin: 0 auto; padding: 20px 0; }
        .ra-header { margin-bottom: 30px; }
        .ra-title { font-size: 1.8rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px 0; }
        .ra-subtitle { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
        
        .ra-loading, .ra-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; color: var(--color-text-secondary); }
        .ra-empty h3 { color: var(--color-text); margin: 16px 0 8px 0; }
        .ra-empty-icon { color: #10B981; }

        .ra-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        .ra-card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--color-border); padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
        
        .ra-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border-light); }
        .ra-employee-info { display: flex; gap: 12px; align-items: center; }
        .ra-avatar { width: 44px; height: 44px; border-radius: 12px; background: #E0E7FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .ra-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ra-emp-name { margin: 0 0 2px 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
        .ra-emp-detail { margin: 0; font-size: 0.8rem; color: var(--color-text-tertiary); }
        .ra-status-badge { background: #FEF3C7; color: #D97706; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.75rem; }

        .ra-card-body { flex: 1; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .ra-info-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
        .ra-info-label { color: var(--color-text-tertiary); font-weight: 600; }
        .ra-info-value { color: var(--color-text); }
        .font-semibold { font-weight: 600; }
        
        .ra-remarks-box { background: var(--color-surface-alt); padding: 10px; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--color-text-secondary); border-left: 3px solid var(--color-border-dark); }
        .ra-timeline-summary { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #8B5CF6; background: #F5F3FF; padding: 6px 10px; border-radius: 6px; width: fit-content; }

        .ra-card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ra-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; }
        
        .ra-btn-approve { background: #D1FAE5; color: #059669; border-color: #A7F3D0; }
        .ra-btn-approve:hover { background: #10B981; color: white; }
        
        .ra-btn-reject { background: #FEE2E2; color: #DC2626; border-color: #FECACA; }
        .ra-btn-reject:hover { background: #EF4444; color: white; }
        
        .ra-btn-hold { background: #FEF3C7; color: #D97706; border-color: #FDE68A; }
        .ra-btn-hold:hover { background: #F59E0B; color: white; }
        
        .ra-btn-sendback { background: #E0F2FE; color: #0284C7; border-color: #BAE6FD; }
        .ra-btn-sendback:hover { background: #0EA5E9; color: white; }

        .ra-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .ra-modal { background: white; padding: 30px; border-radius: var(--radius-2xl); width: 100%; max-width: 450px; box-shadow: var(--shadow-xl); }
        .ra-modal-title { font-size: 1.4rem; font-weight: 800; margin: 0 0 8px 0; color: var(--color-text); }
        .ra-modal-subtitle { font-size: 0.95rem; color: var(--color-text-secondary); margin: 0 0 24px 0; line-height: 1.5; }
        
        .ra-input-group { margin-bottom: 24px; }
        .ra-input-group label { display: block; font-weight: 700; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 8px; text-transform: uppercase; }
        .ra-input-group textarea { width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-family: inherit; font-size: 0.95rem; outline: none; transition: all 0.2s; resize: vertical; }
        .ra-input-group textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-ring); }
        
        .ra-modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
        .ra-btn-cancel { background: transparent; border: 1px solid var(--color-border); padding: 10px 20px; border-radius: 10px; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; }
        .ra-btn-cancel:hover { background: var(--color-surface-hover); color: var(--color-text); }
        
        .ra-modal .ra-btn { padding: 10px 24px; font-size: 0.95rem; border-radius: 10px; }
      `}</style>
    </AppShell>
  );
};

export default ResignationApprovals;
