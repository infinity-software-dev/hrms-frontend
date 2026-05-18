import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import { Loader2, Upload, User, ArrowLeft, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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

const FileUploadField = ({ label, onChange, file, accept = ".pdf,.jpg,.jpeg,.png", required, error, onRemove, name }) => {
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

  return (
    <div id={name} style={{ 
      border: `1.5px dashed ${error ? '#EF4444' : 'var(--color-border)'}`, 
      borderRadius: '14px', 
      padding: '16px', 
      textAlign: 'center', 
      background: error ? 'rgba(239,68,68,0.02)' : file ? 'rgba(32,118,199,0.03)' : 'var(--color-surface-alt)', 
      transition: 'all 0.2s', 
      position: 'relative' 
    }}>
      {file && (
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
        ) : file ? (
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2076C7', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <File size={22} />
          </div>
        ) : (
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}>
            <Upload size={20} />
          </div>
        )}

        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: file ? '#2076C7' : 'var(--color-text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file ? file.name : `Upload ${label}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, JPG, PNG (Max 5MB)'}
          </div>
        </div>
        <input type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} style={{ display: 'none' }} />
      </label>
      {error && <div style={{ color: '#EF4444', fontSize: '0.7rem', marginTop: '8px', fontWeight: 600 }}>{error}</div>}
    </div>
  );
};

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nextCode, setNextCode] = useState('Loading...');
  const [imagePreview, setImagePreview] = useState(null);
  const [managementEmployees, setManagementEmployees] = useState([]);
  const [form, setForm] = useState({
    // 1. Basic Details
    name: '', email: '', mobileNumber: '', alternateMobileNumber: '',
    password: '', confirmPassword: '',
    // 2. Personal Details
    gender: '', fatherName: '', motherName: '', dateOfBirth: '', maritalStatus: '',
    currentAddress: '', permanentAddress: '', sameAsCurrent: false,
    district: '', state: '', pincode: '',
    // 3. Experience Details
    experienceType: 'Fresher', totalExperienceYears: '', lastCompanyName: '',
    // 4. Health Info
    hasDisease: 'No', diseaseName: '',
    // 5. Job Details
    joiningDate: '', department: '', position: '', reportingManagers: [], managerIds: [], role: 'Employee', salary: '',
    // 6. Education
    hscPercent: '', graduationCourse: '', graduationPercent: '', postGraduationCourse: '', postGraduationPercent: '',
    // 7. ID Proofs
    aadhaarNumber: '', panNumber: '',
    // 8. Bank Details
    accountHolderName: '', bankName: '', accountNumber: '', ifsc: '', branch: '',
    // 9. Emergency Contact
    emergencyContactName: '', emergencyContactRelationship: '', emergencyContactMobile: '', emergencyContactAddress: '',
  });

  const [files, setFiles] = useState({
    profileImage: null, twelfthMarksheet: null, graduationMarksheet: null, postGraduationMarksheet: null,
    experienceCertificate: null, aadhaarFile: null, panFile: null, passbookFile: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [customDepts, setCustomDepts] = useState([]);
  const [customPositions, setCustomPositions] = useState([]);

  useEffect(() => {
    api.get('/employees/next-code')
      .then(({ data }) => setNextCode(data.data.nextCode))
      .catch(() => setNextCode('IA00001'));
    
    api.get('/employees/management')
      .then(({ data }) => setManagementEmployees(data.data))
      .catch(() => toast.error('Failed to fetch management employees'));

    // Fetch existing unique depts/positions to populate dynamic list
    api.get('/employees/departments')
      .then(({ data }) => {
        const fetchedDepts = data.data;
        const newDepts = fetchedDepts.filter(d => !DEPARTMENTS.includes(d));
        setCustomDepts(newDepts);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Sanitize input
    let val = type === 'checkbox' ? checked : value;
    if (typeof val === 'string') {
      // Basic sanitization
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

    // Real-time validation
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
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

    // Basic Details
    if (!form.name?.trim()) newErrors.name = 'Full name is required';
    else if (form.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
    else if (form.name.length > 50) newErrors.name = 'Name cannot exceed 50 characters';

    if (!form.email?.trim()) newErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Please enter a valid email address';

    if (!form.mobileNumber?.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10,12}$/.test(form.mobileNumber)) newErrors.mobileNumber = 'Mobile number must be 10-12 digits';

    if (form.password) {
      if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    // Personal Details
    if (!form.gender) newErrors.gender = 'Gender selection is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!files.profileImage) newErrors.profileImage = 'Profile photo is mandatory';

    if (!form.currentAddress?.trim()) newErrors.currentAddress = 'Current address is required';
    if (!form.sameAsCurrent && !form.permanentAddress?.trim()) newErrors.permanentAddress = 'Permanent address is required';

    // Job Details
    if (!form.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!form.department) newErrors.department = 'Department selection is required';
    if (!form.position) newErrors.position = 'Position selection is required';
    if (!form.role) newErrors.role = 'Role selection is required';
    if (!form.salary) newErrors.salary = 'Monthly salary is required';
    else if (form.salary < 0) newErrors.salary = 'Salary cannot be negative';

    // Education & Proofs
    if (!form.hscPercent) newErrors.hscPercent = 'HSC percentage is required';
    if (!files.twelfthMarksheet) newErrors.twelfthMarksheet = '12th marksheet is required';
    
    if (!form.graduationCourse) newErrors.graduationCourse = 'Graduation course is required';
    if (!form.graduationPercent) newErrors.graduationPercent = 'Graduation percentage is required';
    if (!files.graduationMarksheet) newErrors.graduationMarksheet = 'Graduation marksheet is required';

    if (!form.aadhaarNumber?.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
    else if (!/^\d{12}$/.test(form.aadhaarNumber)) newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
    if (!files.aadhaarFile) newErrors.aadhaarFile = 'Aadhaar file is required';

    if (!form.panNumber?.trim()) newErrors.panNumber = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) newErrors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)';
    if (!files.panFile) newErrors.panFile = 'PAN file is required';

    // Bank Details
    if (!form.accountHolderName?.trim()) newErrors.accountHolderName = 'Account holder name is required';
    if (!form.bankName?.trim()) newErrors.bankName = 'Bank name is required';
    if (!form.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required';
    if (!form.ifsc?.trim()) newErrors.ifsc = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.toUpperCase())) newErrors.ifsc = 'Invalid IFSC format';
    if (!files.passbookFile) newErrors.passbookFile = 'Passbook/Cheque file is required';

    // Emergency
    if (!form.emergencyContactName?.trim()) newErrors.emergencyContactName = 'Contact name is required';
    if (!form.emergencyContactMobile?.trim()) newErrors.emergencyContactMobile = 'Contact mobile is required';
    else if (!/^\d{10,12}$/.test(form.emergencyContactMobile)) newErrors.emergencyContactMobile = 'Invalid mobile number';

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please correct the highlighted validation errors before submitting.');
      // Scroll to first error
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
        if (v && k !== 'sameAsCurrent' && k !== 'confirmPassword') {
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

      await api.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`✅ Employee ${nextCode} created successfully!`, { duration: 5000 });
      navigate('/employees');
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (err.response?.status === 409) {
        toast.error(`Duplicate Data: ${apiMsg || 'Email or Mobile already registered'}`);
      } else if (err.response?.status === 400 && err.response?.data?.errors) {
        // Detailed API validation errors
        const validationErrs = err.response.data.errors;
        setErrors(prev => ({ ...prev, ...validationErrs }));
        toast.error('Validation failed. Please check the fields.');
      } else {
        toast.error(apiMsg || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Add New Employee</h1>
              <p style={{ color: 'var(--color-text-tertiary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Fill in the details to register a new team member.</p>
            </div>
          </div>
          <div style={{ background: 'rgba(32, 118, 199, 0.1)', border: '1px solid rgba(32, 118, 199, 0.2)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#2076C7', fontWeight: 600 }}>Employee Code</span>
            <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>{nextCode}</code>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          
          {/* Section 1: Basic Details */}
          <FormSection title="1. Basic Details" defaultOpen={true} hasError={!!(errors.name || errors.email || errors.mobileNumber || errors.password || errors.confirmPassword)}>
            <Field label="Full Name" required={true} fullWidth={true} error={errors.name}>
              <input className={`input-field ${errors.name ? 'error' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="John Doe" maxLength={50} />
            </Field>
            <Field label="Email Address" required={true} error={errors.email}>
              <input className={`input-field ${errors.email ? 'error' : ''}`} type="email" name="email" value={form.email} onChange={handleChange} placeholder="john.doe@company.com" />
            </Field>
            <Field label="Mobile Number" required={true} error={errors.mobileNumber}>
              <input className={`input-field ${errors.mobileNumber ? 'error' : ''}`} name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="9876543210" maxLength={15} />
            </Field>
            <Field label="Alternate Mobile Number">
              <input className="input-field" name="alternateMobileNumber" value={form.alternateMobileNumber} onChange={handleChange} placeholder="Optional" maxLength={15} />
            </Field>
            <Field label="Password" error={errors.password}>
              <div style={{ position: 'relative' }}>
                <input 
                  className={`input-field ${errors.password ? 'error' : ''}`} 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  placeholder="Min 6 characters" 
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
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <input 
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`} 
                type={showPassword ? "text" : "password"} 
                name="confirmPassword" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                placeholder="Match password" 
              />
            </Field>
          </FormSection>

          {/* Section 2: Personal Details */}
          <FormSection title="2. Personal Details" hasError={!!(errors.profileImage || errors.gender || errors.dateOfBirth || errors.maritalStatus || errors.currentAddress || errors.permanentAddress)}>
             <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '10px' }}>
                {/* Profile Photo Upload */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Profile Photo {errors.profileImage && <span style={{ color: '#EF4444' }}>*</span>}</label>
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
                  {errors.profileImage && <div style={{ color: '#EF4444', fontSize: '0.7rem', marginTop: '6px', textAlign: 'center', fontWeight: 600 }}>{errors.profileImage}</div>}
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

            <Field label="Current Address" required={true} fullWidth={true} error={errors.currentAddress}>
              <textarea className={`input-field ${errors.currentAddress ? 'error' : ''}`} name="currentAddress" value={form.currentAddress} onChange={handleChange} rows={2} placeholder="Full current address" />
            </Field>

            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '-8px' }}>
              <input type="checkbox" id="sameAsCurrent" name="sameAsCurrent" checked={form.sameAsCurrent} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="sameAsCurrent" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500 }}>Permanent address same as current</label>
            </div>

            {!form.sameAsCurrent && (
              <Field label="Permanent Address" required={true} fullWidth={true} error={errors.permanentAddress}>
                <textarea className={`input-field ${errors.permanentAddress ? 'error' : ''}`} name="permanentAddress" value={form.permanentAddress} onChange={handleChange} rows={2} placeholder="Full permanent address" />
              </Field>
            )}

            <Field label="District">
              <input className="input-field" name="district" value={form.district} onChange={handleChange} placeholder="Enter district" />
            </Field>
            <Field label="State">
              <input className="input-field" name="state" value={form.state} onChange={handleChange} placeholder="Enter state" />
            </Field>
            <Field label="Pincode">
              <input className="input-field" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit code" maxLength={6} />
            </Field>
          </FormSection>

          {/* Section 3: Experience Details */}
          <FormSection title="3. Experience Details" defaultOpen={false} hasError={!!(errors.experienceType || errors.totalExperienceYears || errors.experienceCertificate)}>
            <Field label="Experience Type *">
              <select className="input-field select-field" name="experienceType" value={form.experienceType} onChange={handleChange}>
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
                    onRemove={() => setFiles(f => ({ ...f, experienceCertificate: null }))}
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
            <Field label="Salary (Monthly)" required={true} error={errors.salary}>
              <input className={`input-field ${errors.salary ? 'error' : ''}`} type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="₹ Amount" />
            </Field>
          </FormSection>

          {/* Section 6: Education Details */}
          <FormSection title="6. Education Details" defaultOpen={false} hasError={!!(errors.hscPercent || errors.twelfthMarksheet || errors.graduationCourse || errors.graduationPercent || errors.graduationMarksheet || errors.postGraduationCourse || errors.postGraduationPercent || errors.postGraduationMarksheet)}>
            {/* 12th details */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>12th / Diploma</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Percentage" required={true} error={errors.hscPercent}>
                  <input className={`input-field ${errors.hscPercent ? 'error' : ''}`} type="number" step="0.01" name="hscPercent" value={form.hscPercent} onChange={handleChange} placeholder="e.g. 85.50" />
                </Field>
                <FileUploadField 
                  name="twelfthMarksheet"
                  label="12th/Diploma Marksheet" 
                  onChange={(f) => handleFileChange('twelfthMarksheet', f)} 
                  file={files.twelfthMarksheet} 
                  onRemove={() => handleFileChange('twelfthMarksheet', null)}
                  error={errors.twelfthMarksheet}
                />
              </div>
            </div>

            {/* Graduation */}
            <div style={{ gridColumn: '1 / -1', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>Graduation</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <Field label="Course" required={true} error={errors.graduationCourse}>
                  <select className={`input-field select-field ${errors.graduationCourse ? 'error' : ''}`} name="graduationCourse" value={form.graduationCourse} onChange={handleChange}>
                    <option value="">Select Course</option>
                    {GRADUATION_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Percentage" required={true} error={errors.graduationPercent}>
                  <input className={`input-field ${errors.graduationPercent ? 'error' : ''}`} type="number" step="0.01" name="graduationPercent" value={form.graduationPercent} onChange={handleChange} placeholder="e.g. 75.00" />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FileUploadField 
                    name="graduationMarksheet"
                    label="Graduation Marksheet" 
                    onChange={(f) => handleFileChange('graduationMarksheet', f)} 
                    file={files.graduationMarksheet} 
                    onRemove={() => setFiles(f => ({ ...f, graduationMarksheet: null }))}
                    error={errors.graduationMarksheet}
                  />
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
                  <FileUploadField name="postGraduationMarksheet" label="PG Marksheet" onChange={(f) => handleFileChange('postGraduationMarksheet', f)} file={files.postGraduationMarksheet} required={false} />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 7: ID Proofs */}
          <FormSection title="7. Identity Proofs" defaultOpen={false} hasError={!!(errors.aadhaarNumber || errors.aadhaarFile || errors.panNumber || errors.panFile)}>
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Aadhaar */}
              <div style={{ background: 'var(--color-surface-alt)', padding: '24px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '0.95rem', fontWeight: 800 }}>Aadhaar Card</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="Aadhaar Number" required={true} error={errors.aadhaarNumber}>
                    <input className={`input-field ${errors.aadhaarNumber ? 'error' : ''}`} name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} placeholder="12-digit number" maxLength={12} />
                  </Field>
                  <FileUploadField 
                    name="aadhaarFile"
                    label="Aadhaar Front/Back" 
                    onChange={(f) => handleFileChange('aadhaarFile', f)} 
                    file={files.aadhaarFile} 
                    onRemove={() => setFiles(f => ({ ...f, aadhaarFile: null }))}
                    error={errors.aadhaarFile}
                  />
                </div>
              </div>

              {/* PAN */}
              <div style={{ background: 'var(--color-surface-alt)', padding: '24px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '0.95rem', fontWeight: 800 }}>PAN Card</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="PAN Number" required={true} error={errors.panNumber}>
                    <input className={`input-field ${errors.panNumber ? 'error' : ''}`} name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} maxLength={10} />
                  </Field>
                  <FileUploadField 
                    name="panFile"
                    label="PAN Card Copy" 
                    onChange={(f) => handleFileChange('panFile', f)} 
                    file={files.panFile} 
                    onRemove={() => setFiles(f => ({ ...f, panFile: null }))}
                    error={errors.panFile}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 8: Bank Details */}
          <FormSection title="8. Bank Details" defaultOpen={false} hasError={!!(errors.accountHolderName || errors.bankName || errors.accountNumber || errors.ifsc || errors.branch || errors.passbookFile)}>
            <Field label="Account Holder" required={true} error={errors.accountHolderName}>
              <input className={`input-field ${errors.accountHolderName ? 'error' : ''}`} name="accountHolderName" value={form.accountHolderName} onChange={handleChange} placeholder="As per bank records" />
            </Field>
            <Field label="Bank Name" required={true} error={errors.bankName}>
              <input className={`input-field ${errors.bankName ? 'error' : ''}`} name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" />
            </Field>
            <Field label="Account Number" required={true} error={errors.accountNumber}>
              <input className={`input-field ${errors.accountNumber ? 'error' : ''}`} name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Digits only" />
            </Field>
            <Field label="IFSC Code" required={true} error={errors.ifsc}>
              <input className={`input-field ${errors.ifsc ? 'error' : ''}`} name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. HDFC0001234" style={{ textTransform: 'uppercase' }} maxLength={11} />
            </Field>
            <Field label="Branch" required={true} error={errors.branch}>
              <input className={`input-field ${errors.branch ? 'error' : ''}`} name="branch" value={form.branch} onChange={handleChange} placeholder="City/Branch name" />
            </Field>
            <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
              <FileUploadField 
                name="passbookFile"
                label="Bank Passbook / Cancelled Cheque" 
                onChange={(f) => handleFileChange('passbookFile', f)} 
                file={files.passbookFile} 
                onRemove={() => setFiles(f => ({ ...f, passbookFile: null }))}
                error={errors.passbookFile}
              />
            </div>
          </FormSection>

          {/* Section 9: Emergency Contact */}
          <FormSection title="9. Emergency Contact" defaultOpen={false} hasError={!!(errors.emergencyContactName || errors.emergencyContactRelationship || errors.emergencyContactMobile || errors.emergencyContactAddress)}>
            <Field label="Contact Person" required={true} error={errors.emergencyContactName}>
              <input className={`input-field ${errors.emergencyContactName ? 'error' : ''}`} name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Full Name" />
            </Field>
            <Field label="Relationship" required={true} error={errors.emergencyContactRelationship}>
              <input className={`input-field ${errors.emergencyContactRelationship ? 'error' : ''}`} name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleChange} placeholder="e.g. Father, Spouse" />
            </Field>
            <Field label="Mobile Number" required={true} error={errors.emergencyContactMobile}>
              <input className={`input-field ${errors.emergencyContactMobile ? 'error' : ''}`} name="emergencyContactMobile" value={form.emergencyContactMobile} onChange={handleChange} placeholder="10-digit number" maxLength={15} />
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
              {loading ? <><Loader2 size={20} className="spin" /> Processing...</> : <><Check size={20} /> Save Employee</>}
            </button>
          </div>
        </form>
        <style>{`
          .spin { animation: spin 1s linear infinite; } 
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .input-field.error { border-color: #EF4444; background: rgba(239,68,68,0.01); }
          .input-field.error:focus { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
          .form-label { transition: color 0.2s; }
          .input-field:focus + .form-label { color: var(--color-primary); }
        `}</style>
      </div>
    </AppShell>
  );
};

export default CreateEmployee;
