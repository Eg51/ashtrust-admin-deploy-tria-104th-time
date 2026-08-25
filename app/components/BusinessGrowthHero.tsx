"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// ---- Types ------------------------------------------------------------

type AccountType = "personal" | "business";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState | "terms", string>>;

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

// ---- Animation variants ------------------------------------------------

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ---- Component -----------------------------------------------------------

export default function BankRegistrationForm() {
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      next.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(form.phone)) {
      next.phone = "Enter a valid phone number";
    }

    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 8) {
      next.password = "Use at least 8 characters";
    }

    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      next.terms = "You must accept the terms to continue";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate an async account-creation request
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setIsSuccess(true);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient from-blue-100 to-cyan-100 px-3 py-8 sm:px-4 sm:py-16">
      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md rounded-2xl bg-slate-100 p-5 shadow-xl sm:p-8"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"
              >
                <CheckCircle2 size={30} />
              </motion.div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Account request submitted
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-600">
                We&apos;ve received your details. Check your email to verify
                your account and finish setup.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form">
              {/* Header */}
              <motion.div variants={fieldVariants}>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Open Your Account
                </h1>
                <p className="mt-1.5 text-sm text-slate-600">
                  Institutional-grade banking, set up in minutes.
                </p>
              </motion.div>

              {/* Account type toggle */}
              <motion.div
                variants={fieldVariants}
                className="relative mt-6 grid grid-cols-2 rounded-lg bg-slate-300/40 p-1"
              >
                {(["personal", "business"] as AccountType[]).map((type) => {
                  const isActive = accountType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className="relative z-10 rounded-md py-2 text-sm font-medium capitalize transition-colors"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="account-type-pill"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-md bg-white shadow-sm"
                        />
                      )}
                      <span
                        className={`relative ${
                          isActive ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {type}
                      </span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Name row */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.div variants={fieldVariants}>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    First name
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 
                  focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                    <User size={15} className="shrink-0 text-slate-500" />
                    <input
                      id="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <FieldError message={errors.firstName} />
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Last name
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                    <User size={15} className="shrink-0 text-slate-500" />
                    <input
                      id="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <FieldError message={errors.lastName} />
                </motion.div>
              </div>

              {/* Email */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Mail size={15} className="shrink-0 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="jane.doe@email.com"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <FieldError message={errors.email} />
              </motion.div>

              {/* Phone */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Phone number
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Phone size={15} className="shrink-0 text-slate-500" />
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 555 000 1234"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <FieldError message={errors.phone} />
              </motion.div>

              {/* Password */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Lock size={15} className="shrink-0 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </motion.div>

              {/* Confirm password */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Lock size={15} className="shrink-0 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword} />
              </motion.div>

              {/* Terms */}
              <motion.div variants={fieldVariants} className="mt-5">
                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms)
                        setErrors((prev) => ({ ...prev, terms: undefined }));
                    }}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-cyan-600"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="#" className="font-medium text-cyan-700 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="font-medium text-cyan-700 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <FieldError message={errors.terms} />
              </motion.div>

              {/* Submit */}
              <motion.button
                variants={fieldVariants}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex"
                    >
                      <Loader2 size={16} />
                    </motion.span>
                    Creating your account...
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>

              <motion.p
                variants={fieldVariants}
                className="mt-4 text-center text-xs text-slate-600"
              >
                Already have an account?{" "}
                <Link href="/Dashboard" className="font-medium text-cyan-700 hover:underline">
                  Log in
                </Link>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}

// ---- Subcomponents ---------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] text-red-600"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
