import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays, FileText, ChevronLeft, Loader2, Info, ChevronDown, Check, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../../components/layout/AppShell';
import { applyResignation } from '../../api/resignation.api';
import { useAuth } from '../../context/AuthContext';

const REASON_TYPES = [
  { value: 'Better Opportunity', label: 'Better Opportunity', color: '#10B981' },
  { value: 'Relocation', label: 'Relocation', color: '#3B82F6' },
  { value: 'Personal Reason', label: 'Personal Reason', color: '#EF4444' },
  { value: 'Higher Studies', label: 'Higher Studies', color: '#8B5CF6' },
  { value: 'Health Issues', label: 'Health Issues', color: '#F59E0B' },
  { value: 'Others', label: 'Others', color: '#64748B' },
];

const today = () => new Date().toISOString().split('T')[0];

function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

const ApplyResignation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    resignationDate: today(),
    reason: '',
    remarks: '',
  });

  useOutsideClick(dropdownRef, () => setDropdownOpen(false));

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const calculateLWD = () => {
    const d = new Date(form.resignationDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason) { toast.error('Please select a reason for leaving'); return; }
    if (!form.resignationDate) { toast.error('Please select resignation date'); return; }

    setLoading(true);
    try {
      await applyResignation(form);
      toast.success('Resignation applied successfully!');
      navigate('/resignations/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply resignation');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = REASON_TYPES.find((t) => t.value === form.reason);

  const approvalFlowMessage = user?.role === 'Director' || user?.role === 'SuperUser'
    ? 'Your resignation will be auto-approved.'
    : user?.role === 'VP'
    ? 'Your resignation requires Director approval.'
    : user?.role === 'GM'
    ? 'Your resignation requires VP → Director approval.'
    : user?.role === 'HR'
    ? 'Your resignation requires GM → VP → Director approval.'
    : user?.role === 'Manager'
    ? 'Your resignation requires HR → GM → VP → Director approval.'
    : 'Your resignation requires Manager → HR → GM → VP → Director approval.';

  return (
    <AppShell>
      <div className="page-wrapper fade-in al-page">
        
        <div className="al-header">
          <button onClick={() => navigate('/resignations/my')} className="al-back-btn" title="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="al-header-text">
            <h1 className="al-title">Apply for Resignation</h1>
            <p className="al-subtitle">Submit your resignation request for review</p>
          </div>
        </div>

        <form className="al-form-layout" onSubmit={handleSubmit}>
          
          <div className="al-card">
            <h3 className="al-card-title">
              <div className="al-icon-wrapper" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <FileText size={18} />
              </div>
              Reason for Leaving
            </h3>
            
            <div className="al-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className={`al-dropdown-trigger ${dropdownOpen ? 'al-dropdown-open' : ''} ${!selectedType ? 'al-unselected' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedType ? (
                  <div className="al-dropdown-selected">
                    <span className="al-dot" style={{ background: selectedType.color }} />
                    <div className="al-selected-info">
                      <span className="al-selected-label">{selectedType.label}</span>
                    </div>
                  </div>
                ) : (
                  <span>Select a valid Reason...</span>
                )}
                <ChevronDown size={18} className="al-dropdown-icon" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="al-dropdown-menu"
                  >
                    {REASON_TYPES.map((type) => {
                      const active = form.reason === type.value;
                      return (
                        <div
                          key={type.value}
                          className={`al-dropdown-item ${active ? 'al-item-active' : ''}`}
                          onClick={() => {
                            set('reason', type.value);
                            setDropdownOpen(false);
                          }}
                        >
                          <div className="al-item-left">
                            <div className="al-dot" style={{ background: type.color }} />
                            <div>
                              <div className="al-item-label">{type.label}</div>
                            </div>
                          </div>
                          <div className="al-item-right">
                            {active && <Check size={16} color={type.color} />}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="al-card">
            <h3 className="al-card-title">
              <div className="al-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <CalendarDays size={18} />
              </div>
              Dates & Notice Period
            </h3>

            <div className="al-dates-grid al-grid-double">
              <div className="al-input-group">
                <label>RESIGNATION DATE</label>
                <div className="al-date-input-wrap">
                  <CalendarDays size={16} className="al-input-icon" />
                  <input
                    type="date"
                    value={form.resignationDate}
                    min={today()}
                    onChange={(e) => set('resignationDate', e.target.value)}
                    className="al-input"
                  />
                </div>
              </div>
              
              <div className="al-input-group">
                <label>LAST WORKING DAY (Auto-Calculated)</label>
                <div className="al-date-input-wrap">
                  <CalendarDays size={16} className="al-input-icon" />
                  <input
                    type="date"
                    value={calculateLWD()}
                    disabled
                    className="al-input"
                    style={{ background: 'var(--color-surface-hover)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            <div className="al-duration-summary">
              <Info size={16} />
              <span>Notice period is fixed to <strong>30 days</strong>.</span>
            </div>
          </div>

          <div className="al-card">
            <div className="al-card-header-spread">
              <h3 className="al-card-title">
                <div className="al-icon-wrapper" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                  <FileText size={18} />
                </div>
                Remarks (Optional)
              </h3>
              <span className="al-char-count">{form.remarks.length}/500</span>
            </div>
            
            <textarea
              className="al-textarea"
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
              placeholder="Provide any additional details..."
              rows={4}
              maxLength={500}
            />
          </div>

          <AnimatePresence>
            {form.reason && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="al-approval-alert"
              >
                <ShieldAlert size={20} className="al-alert-icon" />
                <div className="al-alert-content">
                  <h4>Approval Flow</h4>
                  <p>{approvalFlowMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="al-submit-wrapper">
            <button type="submit" disabled={loading} className="al-submit-btn">
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>Submit Resignation</span>
                  <div className="al-submit-arrow">
                    <Check size={18} />
                  </div>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .al-page { max-width: 860px !important; margin: 0 auto; width: 100%; padding-bottom: 40px; }
        .al-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-top: 10px; }
        .al-back-btn { width: 44px; height: 44px; border-radius: var(--radius-lg); background: var(--color-surface); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-secondary); transition: all 0.2s; box-shadow: var(--shadow-sm); flex-shrink: 0; }
        .al-back-btn:hover { background: var(--color-surface-hover); color: var(--color-primary); transform: translateX(-3px); border-color: var(--color-border-dark); }
        .al-title { font-size: clamp(1.5rem, 4vw, 1.8rem); font-weight: 900; letter-spacing: -0.04em; color: var(--color-text); margin: 0 0 4px 0; }
        .al-subtitle { color: var(--color-text-secondary); font-size: 0.9rem; margin: 0; }
        .al-form-layout { display: flex; flex-direction: column; gap: 24px; }
        .al-card { background: var(--color-surface); border-radius: var(--radius-2xl); padding: 32px; border: 1px solid var(--color-border); box-shadow: 0 4px 24px rgba(0,0,0,0.02); transition: box-shadow 0.3s ease; }
        .al-card:hover { box-shadow: var(--shadow-md); }
        .al-card-title { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; color: var(--color-text); margin: 0 0 24px 0; }
        .al-card-header-spread { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .al-card-header-spread .al-card-title { margin-bottom: 0; }
        .al-icon-wrapper { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .al-dropdown-container { position: relative; width: 100%; }
        .al-dropdown-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--color-surface-alt); border: 1.5px solid var(--color-border); border-radius: var(--radius-xl); font-size: 1rem; font-family: inherit; font-weight: 600; color: var(--color-text); cursor: pointer; transition: all 0.2s; }
        .al-dropdown-trigger:hover, .al-dropdown-open { background: var(--color-surface); border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-ring); outline: none; }
        .al-unselected { color: var(--color-text-secondary); font-weight: 500; }
        .al-dropdown-selected { display: flex; align-items: center; gap: 12px; }
        .al-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .al-selected-info { display: flex; align-items: center; gap: 10px; }
        .al-dropdown-icon { color: var(--color-text-tertiary); transition: transform 0.3s; }
        .al-dropdown-open .al-dropdown-icon { transform: rotate(180deg); }
        .al-dropdown-menu { position: absolute; top: calc(100% + 10px); left: 0; width: 100%; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); z-index: 100; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
        .al-dropdown-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
        .al-dropdown-item:hover { background: var(--color-surface-hover); }
        .al-item-active { background: var(--color-primary-light) !important; }
        .al-item-left { display: flex; align-items: center; gap: 14px; }
        .al-item-label { font-weight: 700; font-size: 0.95rem; color: var(--color-text); }
        .al-item-right { display: flex; align-items: center; gap: 12px; }
        .al-dates-grid { display: grid; gap: 20px; }
        .al-grid-single { grid-template-columns: 1fr; }
        .al-grid-double { grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .al-grid-double { grid-template-columns: 1fr; } }
        .al-input-group label { display: block; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; color: var(--color-text-tertiary); margin-bottom: 8px; text-transform: uppercase; }
        .al-date-input-wrap { position: relative; }
        .al-input-icon { position: absolute; top: 50%; left: 16px; transform: translateY(-50%); color: var(--color-text-tertiary); pointer-events: none; }
        .al-input { width: 100%; background: var(--color-surface-alt); border: 1.5px solid var(--color-border); padding: 16px 16px 16px 44px; border-radius: var(--radius-xl); font-family: inherit; font-size: 0.95rem; font-weight: 600; color: var(--color-text); outline: none; transition: all 0.2s; }
        .al-input:focus { border-color: var(--color-primary); background: var(--color-surface); box-shadow: 0 0 0 4px var(--color-primary-ring); }
        .al-input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
        .al-input::-webkit-calendar-picker-indicator:hover { opacity: 1; }
        .al-duration-summary { margin-top: 24px; background: var(--color-info-light); border: 1px solid #BAE6FD; border-radius: var(--radius-lg); padding: 14px 20px; display: flex; align-items: center; gap: 12px; color: #0369A1; font-size: 0.9rem; }
        .al-char-count { font-size: 0.8rem; font-weight: 600; color: var(--color-text-tertiary); background: var(--color-surface-alt); padding: 4px 10px; border-radius: var(--radius-full); }
        .al-textarea { width: 100%; background: var(--color-surface-alt); border: 1.5px solid var(--color-border); border-radius: var(--radius-xl); padding: 20px; font-family: inherit; font-size: 0.95rem; color: var(--color-text); line-height: 1.6; resize: vertical; outline: none; transition: all 0.2s; }
        .al-textarea:focus { border-color: var(--color-primary); background: var(--color-surface); box-shadow: 0 0 0 4px var(--color-primary-ring); }
        .al-approval-alert { background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 1px solid #A7F3D0; border-radius: var(--radius-2xl); padding: 20px 24px; display: flex; gap: 16px; align-items: flex-start; overflow: hidden; margin-bottom: 20px; }
        .al-alert-icon { color: #059669; flex-shrink: 0; margin-top: 2px; }
        .al-alert-content h4 { color: #065F46; font-size: 0.95rem; font-weight: 800; margin: 0 0 4px 0; }
        .al-alert-content p { color: #047857; font-size: 0.85rem; margin: 0; line-height: 1.5; font-weight: 500; }
        .al-submit-wrapper { display: flex; justify-content: flex-end; margin-top: 10px; }
        .al-submit-btn { background: var(--gradient-primary); color: #fff; border: none; border-radius: var(--radius-xl); padding: 16px 32px; font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 24px rgba(32, 118, 199, 0.25); position: relative; overflow: hidden; }
        .al-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(32, 118, 199, 0.35); }
        .al-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .al-submit-arrow { background: rgba(255,255,255,0.2); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </AppShell>
  );
};

export default ApplyResignation;
