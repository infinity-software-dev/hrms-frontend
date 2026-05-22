// EmployeeAttendance.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Search, MapPin, Eye, Loader2, X,
  Calendar, Users, FileText, BarChart2,
  AlertCircle, CheckCircle, ChevronRight, ChevronLeft,
  ChevronsLeft, ChevronsRight, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '../../components/layout/AppShell';

// ─────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  P: 'Present', A: 'Absent', WO: 'Week Off', L: 'Leave',
  Coff: 'Comp Off', AUTO: 'Partial', H: 'Holiday', Half: 'Half Day',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'P', label: 'Present' },
  { value: 'A', label: 'Absent' },
  { value: 'WO', label: 'Week Off' },
  { value: 'L', label: 'Leave' },
  { value: 'Coff', label: 'Comp Off' },
  { value: 'H', label: 'Holiday' },
  { value: 'Half', label: 'Half Day' },
];

const StatusBadge = ({ status }) => {
  const getIcon = () => {
    if (status === 'P') return <CheckCircle size={12} />;
    if (status === 'A') return <AlertCircle size={12} />;
    return null;
  };
  if (!status) return <span className="badge">--</span>;
  return (
    <span className={`badge status-${status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {getIcon()}
      {STATUS_LABELS[status] || status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────
// Map Modal Component (unchanged from original – production‑ready)
// ─────────────────────────────────────────────────────────────────

const MapModal = ({ isOpen, onClose, latitude, longitude, checkOutLatitude, checkOutLongitude, locationHistory = [], workMode, employeeName }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [libReady, setLibReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!isOpen) { setLibReady(false); setMapError(false); return; }
    const loadAssets = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        setLibReady(true);
      } catch (err) {
        console.error('Leaflet load error:', err);
        setMapError(true);
        toast.error('Failed to load map library');
      }
    };
    loadAssets();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !libReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const initMap = () => {
      try {
        const L = window.L;
        if (!L || latitude == null || longitude == null) return;
        const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([latitude, longitude], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
        const createDivIcon = (color) => L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7]
        });
        L.marker([latitude, longitude], { icon: createDivIcon('#059669') }).addTo(map)
          .bindPopup(`<strong>Check-in</strong><br>${employeeName}<br>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        if (checkOutLatitude && checkOutLongitude) {
          L.marker([checkOutLatitude, checkOutLongitude], { icon: createDivIcon('#DC2626') }).addTo(map)
            .bindPopup(`<strong>Check-out</strong><br>${checkOutLatitude.toFixed(5)}, ${checkOutLongitude.toFixed(5)}`);
        }
        const bounds = L.latLngBounds([[latitude, longitude]]);
        if (checkOutLatitude) bounds.extend([checkOutLatitude, checkOutLongitude]);
        const trailPoints = [[latitude, longitude]];
        if (Array.isArray(locationHistory)) {
          locationHistory.forEach(loc => {
            if (loc.latitude && loc.longitude) {
              trailPoints.push([loc.latitude, loc.longitude]);
              bounds.extend([loc.latitude, loc.longitude]);
            }
          });
        }
        if (checkOutLatitude) trailPoints.push([checkOutLatitude, checkOutLongitude]);
        if (trailPoints.length > 1) {
          L.polyline(trailPoints, { color: '#2076C7', weight: 3, opacity: 0.6, dashArray: '5, 10' }).addTo(map);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
        }
        setTimeout(() => map.invalidateSize(), 500);
        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Map init error:', err);
        setMapError(true);
      }
    };
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, libReady, latitude, longitude, checkOutLatitude, checkOutLongitude, locationHistory, employeeName]);

  if (!isOpen) return null;
  return (
    <div className="modal-backdrop">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        style={{ position: 'relative', background: 'var(--color-surface)', borderRadius: 'var(--radius-2xl)', width: 'calc(100% - 32px)', maxWidth: '800px', maxHeight: '95dvh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-2xl)', overflow: 'hidden', zIndex: 100 }}>
        <div style={{ height: '4px', background: 'var(--gradient-primary)', flexShrink: 0 }} />
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{employeeName} · Movement</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>Mode: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{workMode || 'Office'}</span></p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: 'var(--color-surface-hover)' }}><X size={20} /></button>
        </div>
        <div style={{ padding: 16, flex: 1, background: '#f8fafc', position: 'relative', minHeight: 450 }}>
          {!libReady && !mapError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>Loading map assets...</p>
            </div>
          )}
          {mapError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#FEF2F2' }}>
              <AlertCircle size={32} color="#DC2626" />
              <p style={{ color: '#DC2626', fontWeight: 600 }}>Failed to load map</p>
              <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          <div ref={mapContainerRef} style={{ height: 450, width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#e5e7eb', opacity: libReady && !mapError ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 1 }} />
        </div>
        <div style={{ padding: '16px 24px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#059669', border: '2px solid #fff', boxShadow: '0 0 4px rgba(0,0,0,0.2)' }} />
            <span style={{ fontWeight: 600 }}>Check-in</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#DC2626', border: '2px solid #fff', boxShadow: '0 0 4px rgba(0,0,0,0.2)' }} />
            <span style={{ fontWeight: 600 }}>Check-out</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ width: 20, height: 3, background: '#2076C7', opacity: 0.6, borderBottom: '1.5px dashed #fff' }} />
            <span style={{ fontWeight: 600 }}>Path Trail</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 24px' }}>Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 5, columns = 8 }) => (
  <div className="card" style={{ overflow: 'auto' }}>
    <table className="data-table">
      <thead><tr>{Array(columns).fill().map((_, i) => (<th key={i}><div style={{ height: 20, background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', width: '80%' }} /></th>))}</tr></thead>
      <tbody>
        {Array(rows).fill().map((_, i) => (
          <tr key={i}>
            {Array(columns).fill().map((_, j) => (<td key={j}><div style={{ height: 20, background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', width: j === 1 ? '60%' : '80%' }} /></td>))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
const EmployeeAttendance = () => {
  // ── State ────────────────────────────────────────────────────────
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showMobile, setShowMobile] = useState(window.innerWidth < 768);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // ── Pagination state ────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ── Debounce search ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Responsive listener ─────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setShowMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Fetch attendance records ────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/employee-attendance', {
        params: {
          fromDate,
          toDate,
          search: debouncedSearch,
          status: statusFilter || undefined,   // omit if empty
          page: currentPage,
          limit,
        },
      });

      if (data.success) {
        setRecords(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      } else {
        toast.error(data.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch attendance records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, debouncedSearch, statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Reset page when date range or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, statusFilter]);

  // ── Helper formatters ───────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return '--';
    return hours.toFixed(2);
  };

  // ── Location viewer ─────────────────────────────────────────────
  const handleViewLocation = (record) => {
    if (record.location?.latitude && record.location?.longitude) {
      setSelectedLocation({
        lat: record.location.latitude,
        lng: record.location.longitude,
        outLat: record.location.checkOutLatitude,
        outLng: record.location.checkOutLongitude,
        name: record.employeeName,
        workMode: record.workMode,
        locationHistory: record.locationHistory || [],
      });
    } else {
      toast.error('Location data not available');
    }
  };

  // ── Pagination handlers ─────────────────────────────────────────
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handleLimitChange = (e) => { setLimit(Number(e.target.value)); setCurrentPage(1); };

  // ── Quick links ─────────────────────────────────────────────────
  const quickActions = [
    { label: 'Admin', path: '/attendance/admin', icon: Users },
    { label: 'Corrections', path: '/attendance/corrections', icon: FileText },
    { label: 'Corrections History', path: '/attendance/correction-history', icon: FileText },
    { label: 'Reports', path: '/attendance/reports', icon: BarChart2 },
  ];

  // ── Pagination UI ───────────────────────────────────────────────
  const Pagination = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 24, padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Showing {records.length} of {totalRecords} entries</span>
        <select value={limit} onChange={handleLimitChange} className="input-field" style={{ width: 'auto', padding: '6px 24px 6px 12px' }}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronsLeft size={16} /></button>
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronLeft size={16} /></button>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 80, textAlign: 'center' }}>Page {currentPage} of {totalPages}</span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronRight size={16} /></button>
        <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronsRight size={16} /></button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="page-wrapper fade-in">
        {/* Header Section */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ height: 4, background: 'var(--gradient-primary)' }} />
          <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(32,118,199,0.3)' }}>
                <Calendar size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>Employee Attendance</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.88rem' }}>Filter by date range, employee & status</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {quickActions.map((action) => (
                  <Link key={action.path} to={action.path} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <action.icon size={16} /> {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input type="text" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: 40 }} />
              </div>

              {/* From Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field" style={{ width: 150 }} />
              </div>

              {/* To Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field" style={{ width: 150 }} />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field" style={{ width: 150 }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <TableSkeleton rows={limit} columns={8} />
        ) : records.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No attendance records found</p>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting the filters or date range.</p>
          </div>
        ) : showMobile ? (
          /* Mobile Card Layout */
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence>
                {records.map((r, idx) => (
                  <motion.div key={`${r.employeeCode}-${r.date}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#fff', boxShadow: '0 4px 12px rgba(32,118,199,0.3)' }}>
                        {r.employeeName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{r.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{r.employeeCode} · {formatDate(r.date)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4, fontWeight: 600 }}>CHECK IN</p><p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-success)' }}>{formatTime(r.checkInTime)}</p></div>
                      <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4, fontWeight: 600 }}>CHECK OUT</p><p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{formatTime(r.checkOutTime)}</p></div>
                      <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4, fontWeight: 600 }}>TOTAL HOURS</p><p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatHours(r.totalHours)}</p></div>
                      <div><p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: 4, fontWeight: 600 }}>STATUS</p><StatusBadge status={r.status} /></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                        <MapPin size={14} />
                        {r.location?.latitude && r.location?.longitude ? 'Location available' : 'No location'}
                      </div>
                      <button onClick={() => handleViewLocation(r)} disabled={!r.location?.latitude || !r.location?.longitude} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', opacity: r.location?.latitude ? 1 : 0.5 }}>
                        <Eye size={14} style={{ marginRight: 4 }} /> View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Pagination />
          </>
        ) : (
          /* Desktop Table Layout */
          <>
            <div className="card" style={{ overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Code</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Work Mode</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {records.map((r, idx) => (
                      <motion.tr key={`${r.employeeCode}-${r.date}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} whileHover={{ backgroundColor: 'var(--color-surface-hover)' }} style={{ transition: 'background 0.2s' }}>
                        <td style={{ fontWeight: 600 }}>{r.employeeCode}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>{r.employeeName?.[0]?.toUpperCase()}</div>
                            {r.employeeName}
                          </div>
                        </td>
                        <td>{formatDate(r.date)}</td>
                        <td><span className={`badge ${r.workMode === 'Field' ? 'status-Coff' : r.workMode === 'WFH' ? 'status-WO' : 'status-AUTO'}`} style={{ fontSize: '0.7rem' }}>{r.workMode || 'Office'}</span></td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatTime(r.checkInTime)}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{formatTime(r.checkOutTime)}</td>
                        <td style={{ fontWeight: 600 }}>{formatHours(r.totalHours)}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                          {r.location?.latitude && r.location?.longitude ? (
                            <button onClick={() => handleViewLocation(r)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={14} /> View
                            </button>
                          ) : (
                            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> N/A</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <Pagination />
          </>
        )}

        {/* Map Modal */}
        <AnimatePresence>
          {selectedLocation && (
            <MapModal
              isOpen={!!selectedLocation}
              onClose={() => setSelectedLocation(null)}
              latitude={selectedLocation.lat}
              longitude={selectedLocation.lng}
              checkOutLatitude={selectedLocation.outLat}
              checkOutLongitude={selectedLocation.outLng}
              locationHistory={selectedLocation.locationHistory}
              workMode={selectedLocation.workMode}
              employeeName={selectedLocation.name}
            />
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
};

export default EmployeeAttendance;