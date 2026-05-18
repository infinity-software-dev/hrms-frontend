import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { Loader2, Upload, User, ArrowLeft, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';

import { Eye, EyeOff, XCircle, Info, File } from 'lucide-react';

const ROLES = ['SuperUser', 'HR', 'Manager', 'Director', 'VP', 'GM', 'Employee', 'Intern', 'fresher'];
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Accounting', 'Operations', 'General Manager', 'Accountant'];
const POSITIONS = ['Software Developer', 'Senior Developer', 'Android Developer', 'iOS Developer', 'Data Analyst', 'UI/UX Designer', 'HR Executive', 'Accountant', 'Manager', 'Team Lead', 'Project Manager', 'Director'];
const GRADUATION_COURSES = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BCA', 'Other'];
const PG_COURSES = ['M.Tech', 'M.E.', 'M.Sc', 'M.Com', 'M.A.', 'MCA', 'MBA', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];
const EXPERIENCE_TYPES = ['Fresher', 'Experienced'];

const FormSection = ({ title, defaultOpen = true, children, hasError }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (hasError) setIsOpen(true);
  }, [hasError]);

  return (
    <div style={{ marginBottom: '24px', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', cursor: 'pointer', background: 'var(--color-surface-alt)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '4px', width: '20px', background: 'linear-gradient(135deg, #2076C7, #1CADA3)', borderRadius: '2px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{title}</h3>
        </div>
        {isOpen ? <ChevronUp size={20} color="var(--color-text-tertiary)" /> : <ChevronDown size={20} color="var(--color-text-tertiary)" />}
      </div>
      
      {isOpen && (
        <div style={{ padding: '24px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, required, children, fullWidth, error, info }) => (
  <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto', marginBottom: '16px' }}>
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
      {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      {info && <div title={info} style={{ color: 'var(--color-text-tertiary)', cursor: 'help' }}><Info size={14} /></div>}
    </label>
    {children}
    {error && (
      <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
        <XCircle size={12} /> {error}
      </div>
    )}
  </div>
);

const FileUploadField = ({ label, onChange, file, existingUrl, accept = ".pdf,.jpg,.jpeg,.png", required, error, onRemove, name }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [file]);

  const showExisting = existingUrl && !file;
  const isExistingImage = existingUrl && (existingUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) || existingUrl.includes('cloudinary'));

  return (
    <div id={name} style={{ 
      border: `1.5px dashed ${error ? '#EF4444' : 'var(--color-border)'}`, 
      borderRadius: '14px', 
      padding: '16px', 
      textAlign: 'center', 
      background: error ? 'rgba(239,68,68,0.02)' : (file || existingUrl) ? 'rgba(32,118,199,0.03)' : 'var(--color-surface-alt)', 
      transition: 'all 0.2s', 
      position: 'relative' 
    }}>
      {(file || existingUrl) && (
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
        >
          <XCircle size={14} />
        </button>
      )}

      <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        ) : showExisting && isExistingImage ? (
           <img src={existingUrl} alt="Existing" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        ) : (file || existingUrl) ? (
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2076C7', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <File size={22} />
          </div>
        ) : (
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}>
            <Upload size={20} />
          </div>
        )}

        <div style={{ maxWidth: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: (file || existingUrl) ? '#2076C7' : 'var(--color-text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file ? file.name : existingUrl ? `Current ${label}` : `Upload ${label}`}
          </div>
          {existingUrl && !file && (
             <a href={existingUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.7rem', color: '#2076C7', fontWeight: 600, marginTop: '4px', display: 'block' }}>View Document</a>
          )}
        </div>
        <input type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} style={{ display: 'none' }} />
      </label>
      {error && <div style={{ color: '#EF4444', fontSize: '0.7rem', marginTop: '8px', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [employeeCode, setEmployeeCode] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [managementEmployees, setManagementEmployees] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [customDepts, setCustomDepts] = useState([]);
  const [customPositions, setCustomPositions] = useState([]);
  
  const [form, setForm] = useState({
    name: '', email: '', mobileNumber: '', alternateMobileNumber: '',
    password: '', confirmPassword: '',
    gender: '', fatherName: '', motherName: '', dateOfBirth: '', maritalStatus: '',
    currentAddress: '', permanentAddress: '', sameAsCurrent: false,
    district: '', state: '', pincode: '',
    experienceType: 'Fresher', totalExperienceYears: '', lastCompanyName: '',
    hasDisease: 'No', diseaseName: '',
    joiningDate: '', department: '', position: '', reportingManagers: [], managerIds: [], role: 'Employee', salary: '',
    hscPercent: '', graduationCourse: '', graduationPercent: '', postGraduationCourse: '', postGraduationPercent: '',
    aadhaarNumber: '', panNumber: '',
    accountHolderName: '', bankName: '', accountNumber: '', ifsc: '', branch: '',
    emergencyContactName: '', emergencyContactRelationship: '', emergencyContactMobile: '', emergencyContactAddress: '',
  });

  const [existingUrls, setExistingUrls] = useState({});

  const [files, setFiles] = useState({
    profileImage: null, twelfthMarksheet: null, graduationMarksheet: null, postGraduationMarksheet: null,
    experienceCertificate: null, aadhaarFile: null, panFile: null, passbookFile: null
  });

  useEffect(() => {
    fetchEmployee();
    fetchManagement();
    
    // Fetch unique depts/positions
    api.get('/employees/departments').then(({ data }) => {
      const newDepts = data.data.filter(d => !DEPARTMENTS.includes(d));
      setCustomDepts(newDepts);
    });
    api.get('/employees/positions').then(({ data }) => {
      const newPos = data.data.filter(p => !POSITIONS.includes(p));
      setCustomPositions(newPos);
    });
  }, [id]);

  const fetchManagement = async () => {
    try {
      const { data } = await api.get('/employees/management');
      setManagementEmployees(data.data);
    } catch (err) {
      toast.error('Failed to load management employees');
    }
  };

  const fetchEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      const emp = data.data;
      setEmployeeCode(emp.employeeCode);
      setImagePreview(emp.profileImageUrl);
      
      setForm({
        name: emp.name || '', email: emp.email || '', mobileNumber: emp.mobileNumber || '', alternateMobileNumber: emp.alternateMobileNumber || '',
        password: '', confirmPassword: '',
        gender: emp.gender || '', fatherName: emp.fatherName || '', motherName: emp.motherName || '', 
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '', 
        maritalStatus: emp.maritalStatus || '',
        currentAddress: emp.currentAddress || '', permanentAddress: emp.permanentAddress || '', sameAsCurrent: false,
        district: emp.district || '', state: emp.state || '', pincode: emp.pincode || '',
        experienceType: emp.experienceType || 'Fresher', totalExperienceYears: emp.totalExperienceYears || '', lastCompanyName: emp.lastCompanyName || '',
        hasDisease: emp.hasDisease || 'No', diseaseName: emp.diseaseName || '',
        joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '', 
        department: emp.department || '', position: emp.position || '', 
        reportingManagers: emp.reportingManagers || [], 
        managerIds: emp.managerIds || [], 
        role: emp.role || 'Employee', salary: emp.salary || '',
        hscPercent: emp.hscPercent || '', graduationCourse: emp.graduationCourse || '', graduationPercent: emp.graduationPercent || '', postGraduationCourse: emp.postGraduationCourse || '', postGraduationPercent: emp.postGraduationPercent || '',
        aadhaarNumber: emp.aadhaarNumber || '', panNumber: emp.panNumber || '',
        accountHolderName: emp.accountHolderName || '', bankName: emp.bankName || '', accountNumber: emp.accountNumber || '', ifsc: emp.ifsc || '', branch: emp.branch || '',
        emergencyContactName: emp.emergencyContactName || '', emergencyContactRelationship: emp.emergencyContactRelationship || '', emergencyContactMobile: emp.emergencyContactMobile || '', emergencyContactAddress: emp.emergencyContactAddress || '',
      });

      setExistingUrls({
        twelfthMarksheet: emp.twelfthMarksheetUrl,
        graduationMarksheet: emp.graduationMarksheetUrl,
        postGraduationMarksheet: emp.postGraduationMarksheetUrl,
        experienceCertificate: emp.experienceCertificateUrl,
        aadhaarFile: emp.aadhaarFileUrl,
        panFile: emp.panFileUrl,
        passbookFile: emp.passbookFileUrl,
      });

      setInitLoading(false);
    } catch (err) {
      toast.error('Failed to load employee details');
      navigate('/employees');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let val = type === 'checkbox' ? checked : value;
    if (typeof val === 'string') {
      if (name === 'email') val = val.toLowerCase().trim();
      if (name === 'mobileNumber' || name === 'alternateMobileNumber') val = val.replace(/[^\d+]/g, '');
    }

    if (name === 'sameAsCurrent') {
      setForm(f => ({
        ...f, sameAsCurrent: checked,
        permanentAddress: checked ? f.currentAddress : f.permanentAddress
      }));
    } else {
      setForm(f => {
        const newForm = { ...f, [name]: val };
        if (name === 'currentAddress' && f.sameAsCurrent) {
          newForm.permanentAddress = val;
        }
        return newForm;
      });
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleFileChange = (name, file) => {
    if (name === 'profileImage') {
      if (file) {
        setImagePreview(URL.createObjectURL(file));
        setFiles(f => ({ ...f, profileImage: file }));
      } else {
        setImagePreview(null);
        setFiles(f => ({ ...f, profileImage: null }));
      }
    } else {
      setFiles(f => ({ ...f, [name]: file }));
      if (!file) setExistingUrls(prev => ({ ...prev, [name]: null }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleManagerChange = (manager) => {
    setForm(f => {
      const isSelected = f.managerIds.includes(manager._id);
      let newIds, newNames;
      if (isSelected) {
        newIds = f.managerIds.filter(id => id !== manager._id);
        newNames = f.reportingManagers.filter(name => name !== manager.name);
      } else {
        newIds = [...f.managerIds, manager._id];
        newNames = [...f.reportingManagers, manager.name];
      }
      return { ...f, managerIds: newIds, reportingManagers: newNames };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name?.trim()) newErrors.name = 'Full name is required';
    if (!form.email?.trim()) newErrors.email = 'Email address is required';
    if (!form.mobileNumber?.trim()) newErrors.mobileNumber = 'Mobile number is required';

    if (form.password) {
      if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.maritalStatus) newErrors.maritalStatus = 'Marital status is required';

    if (!form.currentAddress?.trim()) newErrors.currentAddress = 'Current address is required';
    if (!form.permanentAddress?.trim()) newErrors.permanentAddress = 'Permanent address is required';

    if (!form.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.position) newErrors.position = 'Position is required';
    if (!form.role) newErrors.role = 'Role is required';
    if (!form.salary) newErrors.salary = 'Monthly salary is required';

    if (!form.aadhaarNumber?.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
    else if (!/^\d{12}$/.test(form.aadhaarNumber)) newErrors.aadhaarNumber = 'Invalid Aadhaar (12 digits)';

    if (!form.panNumber?.trim()) newErrors.panNumber = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) newErrors.panNumber = 'Invalid PAN format';

    if (!form.accountHolderName?.trim()) newErrors.accountHolderName = 'Account holder is required';
    if (!form.bankName?.trim()) newErrors.bankName = 'Bank name is required';
    if (!form.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required';
    if (!form.ifsc?.trim()) newErrors.ifsc = 'IFSC is required';

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please correct the highlighted validation errors');
      setTimeout(() => {
        const firstError = Object.keys(validationErrors)[0];
        if (firstError) {
          const el = document.getElementsByName(firstError)[0] || document.getElementById(firstError);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { 
        // Skip certain fields or empty password fields
        if (k === 'sameAsCurrent') return;
        if ((k === 'password' || k === 'confirmPassword') && !v) return;

        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) {
            fd.append(k, JSON.stringify(v));
          } else {
            fd.append(k, String(v)); 
          }
        }
      });
      
      Object.entries(files).forEach(([k, file]) => {
        if (file) fd.append(k, file);
      });

      await api.put(`/employees/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`✅ Employee ${employeeCode} updated successfully!`);
      navigate('/employees');
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (err.response?.status === 409) {
        toast.error(`Duplicate Data: ${apiMsg || 'Email or Mobile already registered'}`);
      } else if (err.response?.status === 400 && err.response?.data?.errors) {
        const validationErrs = err.response.data.errors;
        setErrors(prev => ({ ...prev, ...validationErrs }));
        toast.error('Validation failed. Please check the highlighted fields.');
      } else {
        toast.error(apiMsg || 'Failed to update employee');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <AppShell><div style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={32} className="spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="page-wrapper fade-in" style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/employees')} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', padding: '10px', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <ArrowLeft size={20} color="var(--color-text)" />
            </button>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Edit Employee</h1>
              <p style={{ color: 'var(--color-text-tertiary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Update information for employee {form.name}.</p>
            </div>
          </div>
          <div style={{ background: 'rgba(32, 118, 199, 0.1)', border: '1px solid rgba(32, 118, 199, 0.2)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#2076C7', fontWeight: 600 }}>Employee Code</span>
            <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>{employeeCode}</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          
          {/* Section 1: Basic Details */}
          <FormSection title="1. Basic Details" defaultOpen={true} hasError={!!(errors.name || errors.email || errors.mobileNumber || errors.password || errors.confirmPassword)}>
            <Field label="Full Name" required={true} fullWidth={true} error={errors.name}>
              <input className={`input-field ${errors.name ? 'error' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="John Doe" maxLength={50} />
            </Field>
            <Field label="Email Address" required={true} error={errors.email}>
              <input className={`input-field ${errors.email ? 'error' : ''}`} type="email" name="email" value={form.email} onChange={handleChange} placeholder="john.doe@company.com" disabled style={{ opacity: 0.7 }} />
            </Field>
            <Field label="Mobile Number" required={true} error={errors.mobileNumber}>
              <input className={`input-field ${errors.mobileNumber ? 'error' : ''}`} name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="9876543210" maxLength={15} disabled style={{ opacity: 0.7 }} />
            </Field>
            <Field label="Alternate Mobile Number">
              <input className="input-field" name="alternateMobileNumber" value={form.alternateMobileNumber} onChange={handleChange} placeholder="Optional" maxLength={15} />
            </Field>
            <Field label="New Password" error={errors.password}>
              <div style={{ position: 'relative' }}>
                <input 
                  className={`input-field ${errors.password ? 'error' : ''}`} 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  placeholder="Leave blank to keep current" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm New Password" error={errors.confirmPassword}>
              <input 
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`} 
                type={showPassword ? "text" : "password"} 
                name="confirmPassword" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                placeholder="Match new password" 
              />
            </Field>
          </FormSection>

          {/* Section 2: Personal Details */}
          <FormSection title="2. Personal Details" hasError={!!(errors.profileImage || errors.gender || errors.dateOfBirth || errors.maritalStatus || errors.currentAddress || errors.permanentAddress)}>
             <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '10px' }}>
                {/* Profile Photo Upload */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Profile Photo</label>
                  <label id="profileImage" style={{ 
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    width: '130px', height: '130px', borderRadius: '24px', border: `2px dashed ${errors.profileImage ? '#EF4444' : 'var(--color-border)'}`, 
                    background: imagePreview ? 'transparent' : 'var(--color-surface-alt)', overflow: 'hidden', position: 'relative',
                    transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <div style={{ background: 'var(--color-surface)', padding: '10px', borderRadius: '12px', marginBottom: '8px' }}>
                          <User size={28} color="var(--color-text-tertiary)" />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Select Photo</span>
                      </>
                    )}
                    <input id="profileImage-input" name="profileImage" type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => handleFileChange('profileImage', e.target.files[0])} style={{ display: 'none' }} />
                  </label>
                </div>
                
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  <Field label="Gender" required={true} error={errors.gender}>
                    <select className={`input-field select-field ${errors.gender ? 'error' : ''}`} name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Date of Birth" required={true} error={errors.dateOfBirth}>
                    <input className={`input-field ${errors.dateOfBirth ? 'error' : ''}`} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                  </Field>
                  <Field label="Marital Status" required={true} error={errors.maritalStatus}>
                    <select className={`input-field select-field ${errors.maritalStatus ? 'error' : ''}`} name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                      <option value="">Select Status</option>
                      {MARITAL_STATUS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Father's Name">
                    <input className="input-field" name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Enter name" />
                  </Field>
                  <Field label="Mother's Name">
                    <input className="input-field" name="motherName" value={form.motherName} onChange={handleChange} placeholder="Enter name" />
                  </Field>
                </div>
            </div>

            <Field label="Current Address *" fullWidth={true} error={errors.currentAddress}>
              <textarea className={`input-field ${errors.currentAddress ? 'error' : ''}`} name="currentAddress" value={form.currentAddress} onChange={handleChange} rows={2} placeholder="Full current address" />
            </Field>

            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px' }}>
              <input type="checkbox" id="sameAsCurrent" name="sameAsCurrent" checked={form.sameAsCurrent} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="sameAsCurrent" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Permanent address same as current</label>
            </div>

             {!form.sameAsCurrent && (
              <Field label="Permanent Address *" fullWidth={true} error={errors.permanentAddress}>
                <textarea className={`input-field ${errors.permanentAddress ? 'error' : ''}`} name="permanentAddress" value={form.permanentAddress} onChange={handleChange} rows={2} placeholder="Full permanent address" />
              </Field>
            )}

            <Field label="District">
              <input className="input-field" name="district" value={form.district} onChange={handleChange} />
            </Field>
            <Field label="State">
              <input className="input-field" name="state" value={form.state} onChange={handleChange} />
            </Field>
            <Field label="Pincode">
              <input className="input-field" name="pincode" value={form.pincode} onChange={handleChange} />
            </Field>
          </FormSection>

          {/* Section 3: Experience Details */}
          <FormSection title="3. Experience Details" defaultOpen={false} hasError={!!(errors.experienceType || errors.totalExperienceYears || errors.experienceCertificate)}>
            <Field label="Experience Type *" error={errors.experienceType}>
              <select className={`input-field select-field ${errors.experienceType ? 'error' : ''}`} name="experienceType" value={form.experienceType} onChange={handleChange}>
                {EXPERIENCE_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            
            {form.experienceType === 'Experienced' && (
              <>
                <Field label="Total Experience (Years)" required={true} error={errors.totalExperienceYears}>
                  <input className={`input-field ${errors.totalExperienceYears ? 'error' : ''}`} type="number" step="0.1" name="totalExperienceYears" value={form.totalExperienceYears} onChange={handleChange} placeholder="e.g. 2.5" />
                </Field>
                <Field label="Last Company Name">
                  <input className="input-field" name="lastCompanyName" value={form.lastCompanyName} onChange={handleChange} placeholder="Company name" />
                </Field>
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <FileUploadField 
                    name="experienceCertificate"
                    label="Experience Certificate" 
                    onChange={(f) => handleFileChange('experienceCertificate', f)} 
                    file={files.experienceCertificate} 
                    existingUrl={existingUrls.experienceCertificate} 
                    onRemove={() => { setFiles(f => ({ ...f, experienceCertificate: null })); setExistingUrls(u => ({ ...u, experienceCertificate: null })); }}
                    error={errors.experienceCertificate}
                  />
                </div>
              </>
            )}
          </FormSection>

          {/* Section 4: Health Information */}
          <FormSection title="4. Health Information" defaultOpen={false} hasError={!!(errors.hasDisease || errors.diseaseName)}>
            <Field label="Has any pre-existing disease? *">
              <select className="input-field select-field" name="hasDisease" value={form.hasDisease} onChange={handleChange}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </Field>
            {form.hasDisease === 'Yes' && (
              <Field label="Disease Name / Details">
                <input className="input-field" name="diseaseName" value={form.diseaseName} onChange={handleChange} placeholder="Provide details" />
              </Field>
            )}
          </FormSection>

          {/* Section 5: Job Details */}
          <FormSection title="5. Job Details" defaultOpen={false} hasError={!!(errors.joiningDate || errors.department || errors.position || errors.role || errors.salary)}>
            <Field label="Joining Date" required={true} error={errors.joiningDate}>
              <input className={`input-field ${errors.joiningDate ? 'error' : ''}`} type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
            </Field>
            <Field label="Department" required={true} error={errors.department}>
              <div style={{ position: 'relative' }}>
                <input 
                  className={`input-field ${errors.department ? 'error' : ''}`} 
                  name="department" 
                  list="dept-options" 
                  value={form.department} 
                  onChange={handleChange} 
                  placeholder="Select or type new"
                />
                <datalist id="dept-options">
                  {[...DEPARTMENTS, ...customDepts].map(d => <option key={d} value={d}>{d}</option>)}
                </datalist>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-tertiary)' }}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </Field>
            <Field label="Position" required={true} error={errors.position}>
              <div style={{ position: 'relative' }}>
                <input 
                  className={`input-field ${errors.position ? 'error' : ''}`} 
                  name="position" 
                  list="pos-options" 
                  value={form.position} 
                  onChange={handleChange} 
                  placeholder="Select or type new"
                />
                <datalist id="pos-options">
                  {[...POSITIONS, ...customPositions].map(p => <option key={p} value={p}>{p}</option>)}
                </datalist>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-tertiary)' }}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </Field>
            <Field label="Role" required={true} error={errors.role}>
              <select className={`input-field select-field ${errors.role ? 'error' : ''}`} name="role" value={form.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Reporting Manager(s)" fullWidth={true}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '12px', 
                maxHeight: '200px', 
                overflowY: 'auto', 
                padding: '16px', 
                background: 'var(--color-surface-alt)', 
                borderRadius: '12px', 
                border: '1px solid var(--color-border)' 
              }}>
                {managementEmployees.map(m => (
                  <label key={m._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    background: form.managerIds.includes(m._id) ? 'rgba(32, 118, 199, 0.1)' : 'var(--color-surface)', 
                    border: '1px solid', 
                    borderColor: form.managerIds.includes(m._id) ? '#2076C7' : 'var(--color-border)', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s' 
                  }}>
                    <input 
                      type="checkbox" 
                      checked={form.managerIds.includes(m._id)} 
                      onChange={() => handleManagerChange(m)} 
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{m.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{m.role} • {m.employeeCode}</span>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Salary (Monthly) *" error={errors.salary}>
              <input className={`input-field ${errors.salary ? 'error' : ''}`} type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="₹" />
            </Field>
          </FormSection>

          {/* Section 6: Education Details */}
          <FormSection title="6. Education Details" defaultOpen={false} hasError={!!(errors.hscPercent || errors.twelfthMarksheet || errors.graduationCourse || errors.graduationPercent || errors.graduationMarksheet || errors.postGraduationCourse || errors.postGraduationPercent || errors.postGraduationMarksheet)}>
            {/* 12th details */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--color-text)' }}>12th / Diploma</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Percentage *" error={errors.hscPercent}>
                  <input className={`input-field ${errors.hscPercent ? 'error' : ''}`} type="number" step="0.01" name="hscPercent" value={form.hscPercent} onChange={handleChange} placeholder="e.g. 85.50" />
                </Field>
                <FileUploadField name="twelfthMarksheet" label="12th/Diploma Marksheet" onChange={(f) => handleFileChange('twelfthMarksheet', f)} file={files.twelfthMarksheet} existingUrl={existingUrls.twelfthMarksheet} required={false} />
              </div>
            </div>

            {/* Graduation */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--color-text)' }}>Graduation</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Course *" error={errors.graduationCourse}>
                  <select className={`input-field select-field ${errors.graduationCourse ? 'error' : ''}`} name="graduationCourse" value={form.graduationCourse} onChange={handleChange}>
                    <option value="">Select Course</option>
                    {GRADUATION_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Percentage *" error={errors.graduationPercent}>
                  <input className={`input-field ${errors.graduationPercent ? 'error' : ''}`} type="number" step="0.01" name="graduationPercent" value={form.graduationPercent} onChange={handleChange} placeholder="e.g. 75.00" />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FileUploadField name="graduationMarksheet" label="Graduation Marksheet" onChange={(f) => handleFileChange('graduationMarksheet', f)} file={files.graduationMarksheet} existingUrl={existingUrls.graduationMarksheet} required={false} />
                </div>
              </div>
            </div>

            {/* Post Graduation */}
            <div style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--color-text)' }}>Post Graduation (Optional)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Course">
                  <select className="input-field select-field" name="postGraduationCourse" value={form.postGraduationCourse} onChange={handleChange}>
                    <option value="">Select Course</option>
                    {PG_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Percentage">
                  <input className="input-field" type="number" step="0.01" name="postGraduationPercent" value={form.postGraduationPercent} onChange={handleChange} placeholder="e.g. 80.00" />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FileUploadField name="postGraduationMarksheet" label="PG Marksheet" onChange={(f) => handleFileChange('postGraduationMarksheet', f)} file={files.postGraduationMarksheet} existingUrl={existingUrls.postGraduationMarksheet} required={false} />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 7: ID Proofs */}
          <FormSection title="7. Identity Proofs" defaultOpen={false} hasError={!!(errors.aadhaarNumber || errors.aadhaarFile || errors.panNumber || errors.panFile)}>
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Aadhaar */}
              <div style={{ background: 'var(--color-surface-alt)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem' }}>Aadhaar Card</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="Aadhaar Number *" error={errors.aadhaarNumber}>
                    <input className={`input-field ${errors.aadhaarNumber ? 'error' : ''}`} name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                  </Field>
                  <FileUploadField name="aadhaarFile" label="Aadhaar Card File" onChange={(f) => handleFileChange('aadhaarFile', f)} file={files.aadhaarFile} existingUrl={existingUrls.aadhaarFile} required={false} />
                </div>
              </div>

              {/* PAN */}
              <div style={{ background: 'var(--color-surface-alt)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem' }}>PAN Card</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="PAN Number *" error={errors.panNumber}>
                    <input className={`input-field ${errors.panNumber ? 'error' : ''}`} name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
                  </Field>
                  <FileUploadField name="panFile" label="PAN Card File" onChange={(f) => handleFileChange('panFile', f)} file={files.panFile} existingUrl={existingUrls.panFile} required={false} />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 8: Bank Details */}
          <FormSection title="8. Bank Details" defaultOpen={false} hasError={!!(errors.accountHolderName || errors.bankName || errors.accountNumber || errors.ifsc || errors.branch || errors.passbookFile)}>
            <Field label="Account Holder Name *" error={errors.accountHolderName}>
              <input className={`input-field ${errors.accountHolderName ? 'error' : ''}`} name="accountHolderName" value={form.accountHolderName} onChange={handleChange} placeholder="As per bank records" />
            </Field>
            <Field label="Bank Name *" error={errors.bankName}>
              <input className={`input-field ${errors.bankName ? 'error' : ''}`} name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" />
            </Field>
            <Field label="Account Number *" error={errors.accountNumber}>
              <input className={`input-field ${errors.accountNumber ? 'error' : ''}`} name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" />
            </Field>
            <Field label="IFSC Code *" error={errors.ifsc}>
              <input className={`input-field ${errors.ifsc ? 'error' : ''}`} name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. SBIN0001234" style={{ textTransform: 'uppercase' }} />
            </Field>
            <Field label="Branch *" error={errors.branch}>
              <input className={`input-field ${errors.branch ? 'error' : ''}`} name="branch" value={form.branch} onChange={handleChange} placeholder="Branch Location" />
            </Field>
            <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
              <FileUploadField 
                name="passbookFile"
                label="Bank Passbook / Cancelled Cheque" 
                onChange={(f) => handleFileChange('passbookFile', f)} 
                file={files.passbookFile} 
                existingUrl={existingUrls.passbookFile} 
                onRemove={() => handleFileChange('passbookFile', null)}
                error={errors.passbookFile}
              />
            </div>
          </FormSection>

          {/* Section 9: Emergency Contact */}
          <FormSection title="9. Emergency Contact" defaultOpen={false} hasError={!!(errors.emergencyContactName || errors.emergencyContactRelationship || errors.emergencyContactMobile || errors.emergencyContactAddress)}>
            <Field label="Contact Person Name *" error={errors.emergencyContactName}>
              <input className={`input-field ${errors.emergencyContactName ? 'error' : ''}`} name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Full Name" />
            </Field>
            <Field label="Relationship *" error={errors.emergencyContactRelationship}>
              <input className={`input-field ${errors.emergencyContactRelationship ? 'error' : ''}`} name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleChange} placeholder="e.g. Father, Spouse" />
            </Field>
            <Field label="Mobile Number *" error={errors.emergencyContactMobile}>
              <input className={`input-field ${errors.emergencyContactMobile ? 'error' : ''}`} name="emergencyContactMobile" value={form.emergencyContactMobile} onChange={handleChange} placeholder="Emergency Contact No." maxLength={15} />
            </Field>
            <Field label="Address" fullWidth={true}>
              <textarea className="input-field" name="emergencyContactAddress" value={form.emergencyContactAddress} onChange={handleChange} rows={2} placeholder="Contact person's address" />
            </Field>
          </FormSection>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'flex-end', padding: '24px', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.03)' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/employees')} style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 32px', fontSize: '1rem', minWidth: '200px' }}>
              {loading ? <><Loader2 size={20} className="spin" /> Processing...</> : <><Check size={20} /> Save Updates</>}
            </button>
          </div>
        </form>
        <style>{`
          .spin { animation: spin 1s linear infinite; } 
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .input-field.error { border-color: #EF4444; background: rgba(239,68,68,0.01); }
          .input-field.error:focus { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
        `}</style>
      </div>
    </AppShell>
  );
};

export default EditEmployee;
