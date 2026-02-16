'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConsentModal } from '@/components/auth/ConsentModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, BookOpen, Users, FileText, Award, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, submitConsent } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ identifier, password });

      if (result.requiresConsent && result.userId) {
        setPendingUserId(result.userId);
        setShowConsent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentAccept = async (pdpaConsent: boolean, tosAccepted: boolean) => {
    if (!pendingUserId) return;

    setLoading(true);
    try {
      await submitConsent({
        userId: pendingUserId,
        pdpaConsent,
        tosAccepted,
      });
      setShowConsent(false);
    } catch (err: any) {
      setError(err.message || 'Failed to submit consent');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentCancel = () => {
    setShowConsent(false);
    setPendingUserId(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - System Information */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 lg:p-12 flex flex-col justify-between text-white">
        <div>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-12 w-12" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold">PTMS</h1>
                <p className="text-blue-100 text-lg">Practical Training Management System</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About the System</h2>
              <p className="text-blue-50 leading-relaxed">
                The Practical Training Management System (PTMS) is a comprehensive platform designed to streamline 
                the management of student practical training programs. It facilitates seamless coordination between 
                students, supervisors, and administrators throughout the entire training lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Logbook Management</h3>
                  <p className="text-sm text-blue-100">Track daily activities and progress</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Supervisor Coordination</h3>
                  <p className="text-sm text-blue-100">Connect with academic supervisors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Report Submission</h3>
                  <p className="text-sm text-blue-100">Submit and manage training reports</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Performance Tracking</h3>
                  <p className="text-sm text-blue-100">Monitor and evaluate progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access your training dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="identifier" className="text-gray-700 font-medium">
                  Matric Number or Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="2021123456 or email@student.uitm.edu.my"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="mt-2 h-11"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Students can use their 10-digit matric number
                </p>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConsentModal
        open={showConsent}
        onAccept={handleConsentAccept}
        onCancel={handleConsentCancel}
      />
    </div>
  );
}
