import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, AlertCircle, Info, ShieldCheck, 
  MessageSquare, FileText, ChevronLeft, Loader2,
  CheckCircle2, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { submitComplaint } from '../../api/complaint.api';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Medium'
  });

  const categories = [
    'Work Environment',
    'Harassment',
    'Discrimination',
    'Management',
    'Policy Violation',
    'Facilities',
    'Compensation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      return toast.error('Please complete all required fields');
    }

    setLoading(true);
    try {
      await submitComplaint(formData);
      setSubmitted(true);
      toast.success('Grievance submitted successfully');
      setTimeout(() => navigate('/complaints/my'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="sc-success-wrapper">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="sc-success-card"
          >
            <div className="sc-success-icon"><CheckCircle2 size={64} /></div>
            <h1>Submission Successful</h1>
            <p>Your grievance has been securely transmitted to the Director's Office. You will be notified of any status updates.</p>
            <div className="sc-success-footer">
              Redirecting to your dashboard...
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="sc-page-wrapper">
        <button onClick={() => navigate(-1)} className="sc-back-btn">
          <ChevronLeft size={18} />
          Back to Tracking
        </button>

        <div className="sc-grid">
          {/* Form Side */}
          <div className="sc-form-container">
            <div className="sc-form-header">
              <div className="sc-form-badge">Confidential Submission</div>
              <h1>Report a Grievance</h1>
              <p>Your voice matters. Describe the issue clearly to help us resolve it effectively.</p>
            </div>

            <form onSubmit={handleSubmit} className="sc-form">
              <div className="sc-input-group">
                <label>COMPLAINT TITLE</label>
                <div className="sc-input-wrap">
                    <FileText size={18} />
                    <input 
                    type="text" 
                    placeholder="Briefly state the core issue..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
              </div>

              <div className="sc-row">
                <div className="sc-input-group flex-1">
                  <label>CATEGORY</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="sc-input-group flex-1">
                  <label>PRIORITY</label>
                  <div className="sc-priority-tabs">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({...formData, priority: p})}
                        className={`sc-priority-tab ${formData.priority === p ? `active ${p.toLowerCase()}` : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sc-input-group">
                <label>DETAILED DESCRIPTION</label>
                <textarea 
                  placeholder="Provide comprehensive details about the incident, including dates, names, and any relevant context..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button type="submit" disabled={loading} className="sc-submit-btn">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                <span>{loading ? 'Transmitting...' : 'Submit to Director'}</span>
              </button>
            </form>
          </div>

          {/* Guidelines Side */}
          <div className="sc-info-container">
            <div className="sc-info-card">
                <h3><ShieldCheck size={20} /> Submission Protocols</h3>
                <ul className="sc-info-list">
                    <li>
                        <strong>Confidentiality:</strong>
                        All submissions are encrypted and accessible only by the Director's Office.
                    </li>
                    <li>
                        <strong>Integrity:</strong>
                        Please ensure all reported information is factual and accurate.
                    </li>
                    <li>
                        <strong>Resolution:</strong>
                        Responses are typically issued within 3-5 business days.
                    </li>
                </ul>
            </div>

            <div className="sc-help-card">
                <HelpCircle size={40} className="sc-help-icon" />
                <h4>Need assistance?</h4>
                <p>If you're unsure how to categorize your grievance, please contact HR for guidance before submitting.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sc-page-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 8px 60px;
        }

        .sc-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #64748B;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 24px;
          padding: 8px 12px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .sc-back-btn:hover { background: #F1F5F9; color: #0F172A; }

        .sc-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .sc-form-container {
          background: #fff;
          border-radius: 32px;
          border: 1px solid #E2E8F0;
          padding: 48px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.03);
        }

        .sc-form-header { margin-bottom: 40px; }
        .sc-form-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #FEF2F2;
          color: #EF4444;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 99px;
          margin-bottom: 16px;
        }

        .sc-form-header h1 {
          font-size: 2.2rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .sc-form-header p { color: #64748B; margin-top: 8px; font-weight: 500; }

        .sc-form { display: flex; flex-direction: column; gap: 28px; }

        .sc-input-group label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }

        .sc-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          padding: 12px 16px;
          border-radius: 16px;
          transition: all 0.2s;
        }

        .sc-input-wrap:focus-within { border-color: #4F46E5; background: #fff; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.08); }
        .sc-input-wrap input { border: none; outline: none; background: transparent; width: 100%; font-weight: 600; color: #1E293B; }
        .sc-input-wrap svg { color: #94A3B8; }

        .sc-row { display: flex; gap: 20px; }
        .flex-1 { flex: 1; }

        select, textarea {
          width: 100%;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          padding: 12px 16px;
          border-radius: 16px;
          font-weight: 600;
          color: #1E293B;
          outline: none;
          transition: all 0.2s;
        }

        select:focus, textarea:focus { border-color: #4F46E5; background: #fff; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.08); }

        .sc-priority-tabs {
          display: flex;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 14px;
          gap: 4px;
        }

        .sc-priority-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sc-priority-tab.active { background: #fff; color: #0F172A; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .sc-priority-tab.active.high { color: #EF4444; }
        .sc-priority-tab.active.medium { color: #F59E0B; }
        .sc-priority-tab.active.low { color: #10B981; }

        .sc-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #0F172A;
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .sc-submit-btn:hover { background: #1E293B; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2); }
        .sc-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Info Container */
        .sc-info-container { display: flex; flex-direction: column; gap: 24px; }
        .sc-info-card { background: #EEF2FF; border-radius: 32px; padding: 40px; border: 1px solid #E0E7FF; }
        .sc-info-card h3 { display: flex; align-items: center; gap: 10px; color: #4F46E5; font-weight: 900; margin: 0 0 24px 0; }
        .sc-info-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
        .sc-info-list li { color: #4338CA; font-size: 0.9rem; line-height: 1.6; }
        .sc-info-list li strong { display: block; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; color: #6366F1; }

        .sc-help-card {
          background: #F8FAFC;
          border-radius: 32px;
          padding: 40px;
          text-align: center;
          border: 1px solid #E2E8F0;
        }
        .sc-help-icon { color: #94A3B8; margin-bottom: 16px; }
        .sc-help-card h4 { color: #1E293B; font-weight: 800; margin-bottom: 8px; }
        .sc-help-card p { color: #64748B; font-size: 0.85rem; line-height: 1.5; }

        /* Success State */
        .sc-success-wrapper { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sc-success-card { background: #fff; border-radius: 40px; padding: 60px; text-align: center; max-width: 500px; box-shadow: 0 40px 100px rgba(0,0,0,0.05); }
        .sc-success-icon { color: #10B981; margin-bottom: 32px; }
        .sc-success-card h1 { font-size: 2rem; font-weight: 900; margin-bottom: 16px; }
        .sc-success-card p { color: #64748B; line-height: 1.6; margin-bottom: 32px; }
        .sc-success-footer { font-size: 0.8rem; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

        @media (max-width: 992px) {
          .sc-grid { grid-template-columns: 1fr; }
          .sc-form-container { padding: 32px; }
        }
      `}</style>
    </AppShell>
  );
};

export default SubmitComplaint;