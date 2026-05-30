'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuthResponse } from '@/types';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      const res = await API.post<AuthResponse>('/auth/login', data);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'borrower') router.push('/apply/status');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LMS Portal</h1>
          <p className="text-gray-500 mt-1">Loan Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            New borrower?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white/70 backdrop-blur rounded-xl p-4 text-xs text-gray-600">
          <p className="font-semibold mb-2 text-gray-700">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              ['Admin', 'admin@lms.com', 'Admin@123'],
              ['Sales', 'sales@lms.com', 'Sales@123'],
              ['Sanction', 'sanction@lms.com', 'Sanction@123'],
              ['Disburse', 'disburse@lms.com', 'Disburse@123'],
              ['Collection', 'collection@lms.com', 'Collection@123'],
              ['Borrower', 'borrower@lms.com', 'Borrower@123'],
            ].map(([role, email, pass]) => (
              <div key={role} className="bg-white rounded-lg p-2 border border-gray-100">
                <span className="font-medium text-blue-700">{role}</span>
                <br />{email}<br />{pass}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}