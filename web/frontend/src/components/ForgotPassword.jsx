import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { confirmResetPassword, requestResetPasswordCode, verifyResetPasswordCode } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [expiresInSeconds, setExpiresInSeconds] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('credential');
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestResetPasswordCode({
        email: email.trim(),
        password,
      });

      setVerificationId(response.verificationId || '');
      setDebugCode(response.debugVerificationCode || '');
      setExpiresInSeconds(response.expiresInSeconds || 0);
      setStep('code');
      setSuccess('Kode verifikasi sudah dibuat. Masukkan kode untuk reset password.');
    } catch (apiError) {
      setError(apiError.message || 'Gagal membuat kode verifikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError('Kode verifikasi wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyResetPasswordCode({
        verificationId,
        verificationCode: verificationCode.trim(),
      });

      setStep('new-password');
      setSuccess('Kode valid. Silakan isi password baru.');
    } catch (apiError) {
      setError(apiError.message || 'Verifikasi kode gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmResetPassword({
        verificationId,
        newPassword,
      });

      setSuccess('Password berhasil direset. Silakan login dengan password terbaru.');

      setTimeout(() => {
        navigate('/login');
      }, 1300);
    } catch (apiError) {
      setError(apiError.message || 'Reset password gagal. Cek data akun kamu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-4">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-500/10 dark:bg-primary-500/20 rounded-full">
              <KeyRound className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Forgot Password Verification
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
            {step === 'credential' && 'Isi email dan password lama untuk minta kode verifikasi.'}
            {step === 'code' && 'Masukkan kode verifikasi 6 digit.'}
            {step === 'new-password' && 'Terakhir, masukkan password baru kamu.'}
          </p>

          <form
            onSubmit={step === 'credential' ? handleRequestCode : (step === 'code' ? handleVerifyCode : handleConfirmNewPassword)}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={step !== 'credential'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">
                Password Lama
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  disabled={step !== 'credential'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {step !== 'credential' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="verificationCode">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="verificationCode"
                      type="text"
                      required
                      disabled={step !== 'code'}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                      placeholder="6 digit code"
                    />
                  </div>
                </div>

                {debugCode && (
                  <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-3 text-xs text-primary-700">
                    Kode verifikasi (mode development): <span className="font-bold">{debugCode}</span>
                    {expiresInSeconds > 0 && (
                      <span> • berlaku {Math.floor(expiresInSeconds / 60)} menit</span>
                    )}
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="newPassword">
                Password Baru
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  required={step === 'new-password'}
                  disabled={step !== 'new-password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="confirmPassword">
                Konfirmasi Password Baru
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required={step === 'new-password'}
                  disabled={step !== 'new-password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/30"
            >
              {isSubmitting
                ? 'Memproses...'
                : (step === 'credential'
                  ? 'Kirim Kode Verifikasi'
                  : (step === 'code' ? 'Verifikasi Kode' : 'Simpan Password Baru'))}
              <ArrowRight className="w-4 h-4" />
            </button>

            {step !== 'credential' && (
              <button
                type="button"
                onClick={() => {
                  setStep('credential');
                  setVerificationCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Ubah Email/Password Lama
              </button>
            )}
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
          )}
        </div>
      </div>
    </div>
  );
}
