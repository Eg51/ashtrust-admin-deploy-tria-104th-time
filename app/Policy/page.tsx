"use client";

import { motion, type Variants } from "framer-motion";
import { X, ShieldCheck, FileText, Lock, Eye, Database, UserCheck } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ---- Animation variants ---------------------------------------------------
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 } },
};

export default function PrivacySecurityPage() {
  const router = useRouter();

  // Prevent background scrolling while this page is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    // Reroute the user directly to the home page
    router.push('/');
  };

  return (
    // Page Wrapper
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 text-[#0a0e17] flex items-center justify-center">
      
      {/* Modal Component */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={backdropVariants}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0a0e17]/60 backdrop-blur-sm px-4 py-8 sm:p-6"
        onClick={handleClose} // Clicking backdrop also routes to home
      >
        <motion.div
          variants={modalVariants}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/90 via-blue-100/90 to-cyan-100/90 shadow-2xl border border-white/30"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-200/30 p-5 sm:p-6">
            <motion.div variants={contentVariants} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-600">
                <ShieldCheck size={22} strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#0a0e17]">Privacy & Security</h2>
                <p className="text-[11px] text-[#0a0e17]/60">Ash Trust Bank plc. Standards</p>
              </div>
            </motion.div>

            <motion.button
              variants={contentVariants}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose} // Routes to home page on X click
              className="rounded-full p-1.5 text-[#0a0e17]/60 transition hover:bg-cyan-500/20 hover:text-[#0a0e17]"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Scrollable Content Body */}
          <motion.div
            variants={contentVariants}
            className="overflow-y-auto p-5 sm:p-6"
            style={{ maxHeight: "calc(90vh - 80px)" }}
          >
            <div className="space-y-6 text-[#0a0e17]/80 text-sm leading-relaxed">
              
              {/* PRIVACY POLICY SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-cyan-200/30 pb-2">
                  <FileText size={18} className="text-cyan-600" />
                  <h3 className="text-base font-semibold text-[#0a0e17]">Privacy Policy</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Eye size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Data Collection & Usage</p>
                      <p className="text-xs">We collect minimal necessary data including transaction history, account identifiers, and device information solely to provide secure banking services. Your data is never sold to third parties.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <UserCheck size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Your Rights (GDPR & CCPA)</p>
                      <p className="text-xs">You retain full control over your personal information. You have the right to access, rectify, delete, or request the export of your data at any time via your dashboard.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Database size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Data Retention & Deletion</p>
                      <p className="text-xs">Financial records are retained for 7 years to comply with global regulatory standards. Non-essential logs are automatically purged every 90 days.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY POLICY SECTION */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-cyan-200/30 pb-2">
                  <Lock size={18} className="text-cyan-600" />
                  <h3 className="text-base font-semibold text-[#0a0e17]">Security Architecture</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Military-Grade Encryption</p>
                      <p className="text-xs">All data in transit and at rest is protected using AES-256 encryption. Communication channels leverage TLS 1.3 protocols to prevent interception.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <UserCheck size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Multi-Factor Authentication (MFA)</p>
                      <p className="text-xs">We mandate biometric verification, authenticator apps, or hardware keys for all sensitive actions, including high-value transfers and account changes.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Database size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <div>
                      <p className="font-semibold text-[#0a0e17]">Fraud Prevention & Monitoring</p>
                      <p className="text-xs">Our AI-driven risk engine continuously analyzes transaction patterns 24/7. Suspicious activities trigger immediate alerts and temporary freezes to protect your assets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Legal Disclaimer */}
            <motion.div
              variants={contentVariants}
              className="mt-8 rounded-xl bg-cyan-400/10 p-4 text-center text-[10px] text-[#0a0e17]/60 sm:text-[11px]"
            >
              <p>Last Updated: August 2026. For full legal documentation, please refer to our official Terms of Service.</p>
              <p className="mt-1">If you have specific questions, contact our Data Protection Officer at <span className="text-cyan-600">privacy@ashtrustbank.com</span></p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}