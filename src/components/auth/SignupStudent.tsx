import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../services/api';
import { UserCheck, ShieldCheck } from 'lucide-react';

interface SignupStudentProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Industrial & Production Engineering',
  'Business Administration',
  'English',
  'Basic Sciences'
];

export const SignupStudent: React.FC<SignupStudentProps> = ({ onSuccess, onGoToLogin }) => {
  const { registerStudent } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    department: 'Computer Science & Engineering',
    batch: '21st',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time inline field validation
  const validateField = (field: string, value: string) => {
    let error = '';
    if (field === 'name') {
      if (!value.trim()) error = 'Full name is required';
      else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
    } else if (field === 'studentId') {
      if (!value.trim()) error = 'Student ID is required';
      else if (!/^\d{6,10}$/.test(value.trim())) error = 'Enter a valid BAUST Student ID (e.g. 210101045)';
    } else if (field === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Enter a valid email address';
    } else if (field === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 8) error = 'Password must be at least 8 characters';
      else if (!/\d/.test(value)) error = 'Password must include at least one number';
    } else if (field === 'confirmPassword') {
      if (value !== formData.password) error = 'Passwords do not match';
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    if (name === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/\d/.test(formData.password)) newErrors.password = 'Password must include at least one number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStudent(formData);
      success('Student account registered successfully! You can now log in.', 'Registration Complete');
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.field) {
          setErrors((prev) => ({ ...prev, [err.field!]: err.message }));
        } else {
          setErrors((prev) => ({ ...prev, form: err.message }));
        }
      } else {
        setErrors((prev) => ({ ...prev, form: 'Failed to create student account' }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Student Account</h2>
        <p className="text-xs text-slate-500 mt-1">Join the BAUST University Club Ecosystem</p>
      </div>

      {errors.form && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Fahim Shahriar"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
              errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="e.g. 210101045"
              value={formData.studentId}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors font-mono ${
                errors.studentId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
              }`}
            />
            {errors.studentId && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.studentId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
            <input
              type="text"
              name="batch"
              placeholder="e.g. 21st"
              value={formData.batch}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">University Email</label>
          <input
            type="email"
            name="email"
            placeholder="student@baust.edu.bd"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
              errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
            }`}
          />
          {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+880 1712-000000"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
              }`}
            />
            {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium leading-tight">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                errors.confirmPassword ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium leading-tight">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Min 8 characters with at least one number
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already registered?{' '}
        <button
          onClick={onGoToLogin}
          className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
};
