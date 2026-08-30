// app/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  KeyRound, 
  Loader2, 
  AlertCircle,
  Mail,
  Phone,
  ArrowLeft,
  X,
  MessageCircle
} from 'lucide-react';
import LoginPasswordReset from '@/app/components/LoginPasswordReset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'reset-form'>('input');
  const [userData, setUserData] = useState<{ 
    email: string; 
    username: string; 
    firstName: string; 
    lastName: string;
  } | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Contact info
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@yourapp.com';
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+1-800-555-0199';

  // ---- Handlers ------------------------------------------------------------

  const handleCheckAccount = async () => {
    if (!identifier.trim()) {
      showErrorModal(
        'Input Required',
        'Please enter your username or email address.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/check-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        showErrorModal(
          'Account Not Found',
          data.error || 'No account found with that username or email.'
        );
        return;
      }

      if (data.success) {
        setUserData({
          email: data.data.user.email,
          username: data.data.user.username,
          firstName: data.data.user.firstName || '',
          lastName: data.data.user.lastName || ''
        });

        if (data.data.passwordResetEnabled) {
          setStep('reset-form');
        } else {
          showErrorModal(
            'Password Reset Not Enabled',
            `Password reset has not been enabled for this account. 
            Please contact the administrator to request password reset access.`
          );
        }
      }
    } catch (error) {
      console.error('Error checking account:', error);
      showErrorModal(
        'Error',
        'Network error. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showErrorModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  // ✅ PUT THE FUNCTION HERE - After showErrorModal
  const handleContactSupport = () => {
    setShowModal(false);
    
    // Try to open the chat widget by clicking the floating button
    const chatToggle = document.querySelector('button[aria-label="Open chat"]') as HTMLElement;
    if (chatToggle) {
      chatToggle.click();
      
      // Wait for chat to open, then click "Start a Conversation"
      setTimeout(() => {
        const startChatBtn = document.querySelector('.group.w-full.rounded-2xl') as HTMLElement;
        if (startChatBtn) {
          startChatBtn.click();
        }
      }, 400);
    } else {
      // Fallback: try custom event
      window.dispatchEvent(new CustomEvent('openChatWidget'));
      
      // Fallback: scroll to chat widget
      const chatWidget = document.querySelector('[data-chat-widget]');
      if (chatWidget) {
        chatWidget.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Final fallback: navigate to support page
      setTimeout(() => {
        const userRole = localStorage.getItem('user') ? 
          JSON.parse(localStorage.getItem('user') || '{}').role : 'user';
        const supportPath = userRole === 'admin' ? '/Support/admin' : '/Support/user';
        router.push(supportPath);
      }, 500);
    }
  };

  // ---- Modal Component ----------------------------------------------------
  const ErrorModal = () => (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl relative"
          >
            <button
              onClick={() => {
                setShowModal(false);
                setStep('input');
              }}
              className="absolute right-4 top-4 text-cyan-600 hover:text-cyan-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto rounded-full bg-red-500/20 p-3 w-14 h-14 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              
              <h3 className="mt-4 text-lg font-bold text-cyan-900">
                {modalTitle}
              </h3>
              
              <p className="mt-2 text-sm text-cyan-700 whitespace-pre-line">
                {modalMessage}
              </p>

              <div className="mt-4 space-y-2 text-left bg-white/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-cyan-700">
                  <Mail className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                  <span>Email: {supportEmail}</span>
                </div>
                {supportPhone && (
                  <div className="flex items-center gap-2 text-sm text-cyan-700">
                    <Phone className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                    <span>Phone: {supportPhone}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleContactSupport}
                  className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setStep('input');
                  }}
                  className="w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ---- Render ----------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 px-4 py-6 sm:px-6 md:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-[#C4F8FD] p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto rounded-full bg-purple-500/20 p-3 w-16 h-16 flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-cyan-900">
              {step === 'input' ? 'Reset Password' : 'Set New Password'}
            </h2>
            <p className="mt-1 text-sm text-cyan-600">
              {step === 'input' 
                ? 'Enter your username or email to continue' 
                : `Resetting password for: ${userData?.email || identifier}`}
            </p>
          </div>

          {step === 'input' && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-cyan-600">
                  Username or Email
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckAccount()}
                    className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2.5 pl-9 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-cyan-600/40"
                    placeholder="Enter username or email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                onClick={handleCheckAccount}
                disabled={isLoading || !identifier.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:bg-cyan-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Account'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/log-in"
                  className="inline-flex items-center gap-2 text-sm text-cyan-700 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {step === 'reset-form' && userData && (
            <div className="mt-6">
              <LoginPasswordReset userEmail={userData.email} />
              
              <div className="mt-4 text-center">
                <Link
                  href="/log-in"
                  className="inline-flex items-center gap-2 text-sm text-cyan-700 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <ErrorModal />
    </div>
  );
}