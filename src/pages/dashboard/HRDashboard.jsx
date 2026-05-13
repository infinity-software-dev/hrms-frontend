import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users, Activity, Calendar, Clock, ClipboardList,
  TrendingUp, UserPlus, FileText, Bell, Megaphone,
  Cake, Gift, PartyPopper, User, Sparkles,
  CheckCircle, XCircle, Timer, Zap, MapPin,
  ChevronRight, ArrowUpRight, ArrowDownRight, Briefcase,
  PieChart, LayoutDashboard
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────
    Reusable Components
────────────────────────────────────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, sub, color, trend, trendValue }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
    style={{
      background: '#fff',
      border: '1px solid #EEF0F8',
      borderRadius: '24px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justify味料: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      {trend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: trend === 'up' ? '#ECFDF5' : '#FEF2F2',
          color: trend === 'up' ? '#10B981' : '#EF4444',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>{value}</h3>
        {sub && <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ y: -4, backgroundColor: '#F8FAFC' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      background: '#fff',
      border: '1px solid #EEF0F8',
      borderRadius: '20px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      width: '100%'
    }}
  >
    <div style={{
      width: '56px',
      height: '56px',
      borderRadius: '18px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      boxShadow: `0 8px 16px ${color}33`
    }}>
      <Icon size={28} />
    </div>
    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{label}</span>
  </motion.button>
);

const BirthdayCard = ({ emp, type }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#F8FAFC',
    borderRadius: '16px',
    border: '1px solid #F1F5F9'
  }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', background: '#E2E8F0' }}>
      {emp.profileImageUrl ? (
        <img src={emp.profileImageUrl} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
          <User size={20} />
        </div>
      )}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{emp.name}</p>
      <p style={{ fontSize: '0.7rem', color: '#64748B' }}>{emp.department || 'General'}</p>
    </div>
    <div style={{
      padding: '4px 8px',
      borderRadius: '8px',
      background: type === 'today' ? '#EEF2FF' : '#F1F5F9',
      color: type === 'today' ? '#4F46E5' : '#64748B',
      fontSize: '0.7rem',
      fontWeight: 800
    }}>
      {type === 'today' ? 'TODAY' : 'TOMORROW'}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
    Main HR Dashboard Component
────────────────────────────────────────────────────────────── */

const HRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/hr-stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch HR stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Activity size={40} color="#6366F1" />
        </motion.div>
      </div>
    </AppShell>
  );

  const { employeeStats, attendanceToday, leaveStats, birthdays, trends } = stats || {};

  return (
    <AppShell>
      <div className="hr-dashboard-container fade-in">
        
        {/* Header Section */}
        <div className="header-row">
          <div>
            <h1 className="welcome-text">HR Insights Portal</h1>
            <p className="subtitle-text">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="action-pills">
            <div className="pill pulse">
              <div className="pill-dot" />
              Live Analytics
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard icon={Users} label="Total Employees" value={employeeStats?.total} sub="In system" color="#6366F1" trend="up" trendValue="+12%" />
          <StatCard icon={CheckCircle} label="Active Employees" value={employeeStats?.active} sub="Current staff" color="#10B981" />
          <StatCard icon={XCircle} label="Inactive Employees" value={employeeStats?.inactive} sub="Ex-staff" color="#F43F5E" />
          <StatCard icon={UserPlus} label="New Joiners" value={employeeStats?.newJoiners} sub="This month" color="#8B5CF6" trend="up" trendValue="+5" />
        </div>

        <div className="main-grid">
          
          {/* Left Column: Attendance & Analytics */}
          <div className="left-col">
            
            <section className="dashboard-card">
              <div className="card-header">
                <div className="header-title">
                  <Activity size={20} color="#6366F1" />
                  <h3>Today's Attendance Overview</h3>
                </div>
                <button className="view-all-btn" onClick={() => navigate('/attendance/admin')}>View Detailed <ChevronRight size={14} /></button>
              </div>

              <div className="attendance-mini-stats">
                <div className="mini-stat">
                  <span className="mini-label">PRESENT</span>
                  <span className="mini-value text-green">{attendanceToday?.present}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">ABSENT</span>
                  <span className="mini-value text-red">{attendanceToday?.absent}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">ON LEAVE</span>
                  <span className="mini-value text-indigo">{leaveStats?.onLeaveToday}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">LATE</span>
                  <span className="mini-value text-amber">{attendanceToday?.late}</span>
                </div>
              </div>

              <div className="work-mode-chart">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="progress-row">
                        <div className="row-info">
                          <span>Office</span> 
                          <span>{attendanceToday?.present - attendanceToday?.wfh - attendanceToday?.field || 0}</span>
                        </div>
                        <div className="progress-bg">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${((attendanceToday?.present - attendanceToday?.wfh - attendanceToday?.field) / (attendanceToday?.present || 1)) * 100}%`, 
                              background: '#6366F1' 
                            }} 
                          />
                        </div>
                      </div>
                      <div className="progress-row">
                        <div className="row-info">
                          <span>WFH</span> 
                          <span>{attendanceToday?.wfh || 0}</span>
                        </div>
                        <div className="progress-bg">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${(attendanceToday?.wfh / (attendanceToday?.present || 1)) * 100}%`, 
                              background: '#10B981' 
                            }} 
                          />
                        </div>
                      </div>
                      <div className="progress-row">
                        <div className="row-info">
                          <span>Field</span> 
                          <span>{attendanceToday?.field || 0}</span>
                        </div>
                        <div className="progress-bg">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${(attendanceToday?.field / (attendanceToday?.present || 1)) * 100}%`, 
                              background: '#F59E0B' 
                            }} 
                          />
                        </div>
                      </div>
                   </div>
                   <div className="donut-placeholder">
                      <PieChart size={48} color="#E2E8F0" />
                   </div>
                </div>
              </div>

              <div className="present-list-container">
                <h4 className="list-title">Recently Checked In</h4>
                <div className="present-scroll-list">
                  {attendanceToday?.presentEmployeesList?.map(att => (
                    <div key={att._id} className="present-item">
                      <div className="present-avatar">
                        {att.employeeId?.profileImageUrl ? (
                          <img src={att.employeeId?.profileImageUrl} alt="" />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div className="present-info">
                        <p className="present-name">{att.employeeId?.name}</p>
                        <p className="present-time">
                          <Clock size={10} /> 
                          {new Date(att.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`mode-badge ${att.workMode?.toLowerCase()}`}>
                        {att.workMode || 'Office'}
                      </div>
                    </div>
                  ))}
                  {(!attendanceToday?.presentEmployeesList?.length) && (
                    <div className="empty-state">No check-ins yet today</div>
                  )}
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div className="header-title">
                  <TrendingUp size={20} color="#8B5CF6" />
                  <h3>Attendance Trends (Last 7 Days)</h3>
                </div>
              </div>
              <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0', gap: '12px' }}>
                {trends?.attendance?.map((item, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', background: '#F8FAFC', borderRadius: '8px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${(item.presentCount / (employeeStats?.active || 1)) * 100}%` }}
                        style={{ width: '100%', background: 'linear-gradient(180deg, #6366F1, #8B5CF6)', borderRadius: '4px' }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>{new Date(item._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div className="header-title">
                  <PieChart size={20} color="#06B6D4" />
                  <h3>Gender Distribution</h3>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', padding: '10px 0' }}>
                {stats?.genderDistribution?.map((g, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      border: `4px solid ${g._id === 'Male' ? '#6366F1' : '#F43F5E'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#1E293B'
                    }}>
                      {g.count}
                    </div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginTop: '8px' }}>{g._id}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div className="header-title">
                  <Briefcase size={20} color="#10B981" />
                  <h3>Recent Hires</h3>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats?.recentActivities?.map(emp => (
                  <div key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', background: '#F1F5F9' }}>
                      {emp.profileImageUrl ? <img src={emp.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} style={{ margin: '9px', color: '#94A3B8' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>{emp.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#64748B' }}>Joined {new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366F1', background: '#EEF2FF', padding: '4px 8px', borderRadius: '6px' }}>{emp.department}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Actions, Birthdays, Pending */}
          <div className="right-col">
            
            <section className="dashboard-card no-padding">
              <div className="card-header" style={{ padding: '24px 24px 12px' }}>
                <h3 className="section-title">Quick Access</h3>
              </div>
              <div className="quick-actions-grid">
                <QuickAction icon={UserPlus} label="Add Employee" color="#6366F1" onClick={() => navigate('/employees/create')} />
                <QuickAction icon={Clock} label="Attendance" color="#10B981" onClick={() => navigate('/attendance/admin')} />
                <QuickAction icon={Calendar} label="Manage Leaves" color="#F59E0B" onClick={() => navigate('/leave-approvals')} />
                <QuickAction icon={FileText} label="Payroll" color="#8B5CF6" onClick={() => navigate('/payroll')} />
                <QuickAction icon={Megaphone} label="Announcements" color="#F43F5E" onClick={() => navigate('/manage-announcements')} />
                <QuickAction icon={ClipboardList} label="Holoidays" color="#06B6D4" onClick={() => navigate('/holidays')} />
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div className="header-title">
                  <Cake size={20} color="#F43F5E" />
                  <h3>Celebrations</h3>
                </div>
              </div>
              <div className="birthday-list">
                {birthdays?.today?.map(emp => <BirthdayCard key={emp._id} emp={emp} type="today" />)}
                {birthdays?.tomorrow?.map(emp => <BirthdayCard key={emp._id} emp={emp} type="tomorrow" />)}
                {(!birthdays?.today?.length && !birthdays?.tomorrow?.length) && (
                  <div className="empty-state">No birthdays today or tomorrow</div>
                )}
              </div>
            </section>

            <section className="dashboard-card accent-card">
              <div className="card-header">
                <div className="header-title">
                  <Zap size={20} color="#F59E0B" />
                  <h3>Action Required</h3>
                </div>
              </div>
              <div className="pending-list">
                <div className="pending-item" onClick={() => navigate('/leave-approvals')}>
                  <div className="pending-info">
                    <span className="pending-label">Leave Applications</span>
                    <span className="pending-count">{leaveStats?.pendingLeaves} pending</span>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
                <div className="pending-item" onClick={() => navigate('/attendance/corrections')}>
                  <div className="pending-info">
                    <span className="pending-label">Attendance Corrections</span>
                    <span className="pending-count">{leaveStats?.pendingCorrections} pending</span>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              </div>
            </section>

          </div>

        </div>

      </div>

      <style>{`
        .hr-dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 0;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .welcome-text {
          font-size: 2rem;
          font-weight: 900;
          color: #1E293B;
          letter-spacing: -0.04em;
        }

        .subtitle-text {
          font-size: 1rem;
          color: #64748B;
          font-weight: 500;
          margin-top: 4px;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #EEF2FF;
          color: #4F46E5;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .pill-dot {
          width: 8px;
          height: 8px;
          background: #4F46E5;
          border-radius: 50%;
        }

        .pulse {
          animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
        }

        .left-col, .right-col {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-card {
          background: #fff;
          border: 1px solid #EEF0F8;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .dashboard-card.no-padding { padding: 0; }
        
        .dashboard-card.accent-card {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 1px solid #FDE68A;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1E293B;
          letter-spacing: -0.01em;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1E293B;
        }

        .view-all-btn {
          background: transparent;
          border: none;
          color: #6366F1;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .attendance-mini-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .mini-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px;
          background: #F8FAFC;
          border-radius: 16px;
        }

        .mini-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 0.05em;
        }

        .mini-value {
          font-size: 1.5rem;
          font-weight: 900;
        }

        .text-green { color: #10B981; }
        .text-red { color: #F43F5E; }
        .text-indigo { color: #6366F1; }
        .text-amber { color: #F59E0B; }

        .progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .row-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
        }

        .progress-bg {
          height: 8px;
          background: #F1F5F9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 4px;
        }

        .present-list-container {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #F1F5F9;
        }

        .list-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .present-scroll-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .present-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #F8FAFC;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .present-item:hover {
          background: #F1F5F9;
        }

        .present-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #E2E8F0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
        }

        .present-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .present-info {
          flex: 1;
        }

        .present-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 2px;
        }

        .present-time {
          font-size: 0.7rem;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mode-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .mode-badge.office { background: #EEF2FF; color: #6366F1; }
        .mode-badge.wfh { background: #ECFDF5; color: #10B981; }
        .mode-badge.field { background: #FFFBEB; color: #F59E0B; }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #EEF0F8;
          border-radius: 0 0 24px 24px;
          overflow: hidden;
          border-top: 1px solid #EEF0F8;
        }

        .quick-actions-grid > button {
          border-radius: 0;
          border: none;
        }

        .birthday-list, .pending-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pending-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #FDE68A;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pending-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
        }

        .pending-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pending-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1E293B;
        }

        .pending-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #D97706;
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          color: #94A3B8;
          font-size: 0.85rem;
          font-style: italic;
        }

        @media (max-width: 1200px) {
          .main-grid { grid-template-columns: 1fr; }
          .right-col { order: -1; }
        }

        @media (max-width: 640px) {
          .header-row { flex-direction: column; gap: 16px; }
          .attendance-mini-stats { grid-template-columns: repeat(2, 1fr); }
          .quick-actions-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </AppShell>
  );
};

export default HRDashboard;
