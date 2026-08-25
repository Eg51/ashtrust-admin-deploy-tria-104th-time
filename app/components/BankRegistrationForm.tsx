



"use client";

import { useState, useEffect, type FormEvent, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserPlus,
  X,
  AlertCircle,
} from "lucide-react";

// ---- Types ----------------------------------------------------------------

interface PersonalFormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof PersonalFormState | "terms" | "form", string>>;

interface DraftData {
  [key: string]: unknown;
}

interface SuccessCardProps {
  email: string;
  username: string;
  onClose: () => void;
  onLogin: () => void;
  onDashboard: () => void;
}

interface CheckUserResponse {
  exists: boolean;
  isLocked?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// ---- Constants ------------------------------------------------------------

const PERSONAL_INITIAL_STATE: PersonalFormState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const DRAFT_STORAGE_KEY = "bank_signup_draft";
const ACCOUNT_FLAG_KEY = "bank_account_created";
const REDIRECT_DELAY = 7000;

// ---- Animation variants ----------------------------------------------------

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

const successOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const successCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.3 }
  }
};

const successIconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      delay: 0.2
    }
  }
};

const successTextVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.3 }
  }
};

const successButtonVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.4 }
  }
};

const redirectBannerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

// ---- Local storage helpers ------------------------------------------------

function readAccountFlag(): { email?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_FLAG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { email?: string };
  } catch {
    return null;
  }
}

function writeAccountFlag(email: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ACCOUNT_FLAG_KEY,
      JSON.stringify({ email, createdAt: Date.now() })
    );
  } catch {
    // Ignore storage failures
  }
}

function readDraft(): DraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function writeDraft(draft: DraftData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage failures
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // no-op
  }
}

// ---- Success Card Component ------------------------------------------------

function SuccessCard({ email, username, onClose, onLogin, onDashboard }: SuccessCardProps) {
  return (
    <motion.div
      variants={successOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        variants={successCardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-300 p-8 shadow-xl border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-600 hover:bg-white/20 hover:text-slate-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            variants={successIconVariants}
            initial="hidden"
            animate="visible"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>

          <motion.h2
            variants={successTextVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 text-2xl font-bold text-slate-800"
          >
            Account Created! 🎉
          </motion.h2>

          <motion.p
            variants={successTextVariants}
            initial="hidden"
            animate="visible"
            className="mt-2 text-sm text-slate-600"
          >
            Your account has been successfully created!
          </motion.p>

          <motion.div
            variants={successTextVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 w-full rounded-xl bg-white/50 p-4 backdrop-blur-sm border border-white/30"
          >
            <p className="text-xs text-slate-700">
              <span className="font-semibold">Email:</span> {email}
            </p>
            <p className="text-xs text-slate-700 mt-1">
              <span className="font-semibold">Username:</span> @{username}
            </p>
          </motion.div>

          {/* <motion.div
            variants={successButtonVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Go to Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDashboard}
              className="flex-1 rounded-lg bg-white/50 px-6 py-2.5 text-sm font-bold text-slate-700 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all"
            >
              Go to Dashboard
            </motion.button>
          </motion.div> */}

          <motion.div
            variants={successTextVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 w-full"
          >
            <p className="text-xs text-slate-500 mb-2">
              logging in...
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/50">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Existing Account Banner Component -------------------------------------

interface ExistingAccountBannerProps {
  email: string;
  onClose: () => void;
  onStayHere: () => void;
}

function ExistingAccountBanner({ email, onClose, onStayHere }: ExistingAccountBannerProps) {
  const router = useRouter();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    redirectTimerRef.current = setTimeout(() => {
      router.push("/log-in");
    }, REDIRECT_DELAY);

    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / REDIRECT_DELAY) * 100);
      setProgress(remaining);
      
      if (remaining > 0) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };
    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [router]);

  const handleStayHere = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    onStayHere();
  };

  const handleGoToLogin = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    router.push("/log-in");
  };

  const handleClose = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    onClose();
  };

  return (
    <motion.div
      variants={redirectBannerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-amber-50 p-8 shadow-xl border border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-amber-600 hover:bg-amber-200/50 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-lg shadow-amber-500/20">
            <AlertCircle size={40} className="text-amber-600" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-amber-800">
            Account Already Exists
          </h2>

          <p className="mt-2 text-sm text-amber-700">
            An account with <strong>{email}</strong> already exists.
          </p>

          <div className="mt-4 w-full rounded-xl bg-white/60 p-4 backdrop-blur-sm border border-amber-200/50">
            <p className="text-xs text-amber-700">
              Please log in to continue or register with a different email.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToLogin}
              className="flex-1 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-all"
            >
              log in
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStayHere}
              className="flex-1 rounded-lg bg-white/50 px-6 py-2.5 text-sm font-bold text-amber-700 
              backdrop-blur-sm border border-amber-200 hover:bg-white/70 transition-all"
            >
              Stay
            </motion.button>
          </div>

          <div className="mt-4 w-full">
            <p className="text-xs text-white mb-2">
              Redirecting to login in {(progress / 100 * (REDIRECT_DELAY / 1000)).toFixed(1)} seconds...
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-amber-200">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Main Component --------------------------------------------------------------

export default function BankRegistrationForm() {
  const router = useRouter();

  const [personalForm, setPersonalForm] = useState<PersonalFormState>(PERSONAL_INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isCheckingDevice, setIsCheckingDevice] = useState<boolean>(true);
  const [verificationError, setVerificationError] = useState<string>("");
  const [showSuccessCard, setShowSuccessCard] = useState<boolean>(false);
  const [showExistingBanner, setShowExistingBanner] = useState<boolean>(false);
  const [createdUserEmail, setCreatedUserEmail] = useState<string>("");
  const [createdUsername, setCreatedUsername] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  
  // ---- Email availability states ----
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [emailChecked, setEmailChecked] = useState<boolean>(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean>(true);

  // ---- Username availability states (NEW) ----
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameChecked, setUsernameChecked] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);

  // ---- Effects --------------------------------------------------------------

  useEffect(() => {
    const checkExistingAccount = async (): Promise<void> => {
      try {
        const existing = readAccountFlag();
        if (existing?.email) {
          try {
            const response = await fetch(`/api/auth/check-user?email=${encodeURIComponent(existing.email)}`);
            const data = await response.json() as CheckUserResponse;
            
            if (data.exists) {
              if (data.isLocked) {
                setVerificationError("This account is temporarily locked. Please try again later.");
                return;
              }
              setShowExistingBanner(true);
              return;
            } else {
              clearDraft();
              if (typeof window !== "undefined") {
                localStorage.removeItem(ACCOUNT_FLAG_KEY);
              }
              setVerificationError("Account data not found. Please create a new account.");
            }
          } catch {
            console.error("Error verifying account");
            if (typeof window !== "undefined") {
              localStorage.removeItem(ACCOUNT_FLAG_KEY);
            }
            setVerificationError("Unable to verify account. Please create a new account.");
          }
        }

        const draft = readDraft();
        if (draft) {
          const personalData: Partial<PersonalFormState> = {};
          const fields: (keyof PersonalFormState)[] = ['firstName', 'lastName', 'username', 'email', 'phone', 'password', 'confirmPassword'];
          for (const field of fields) {
            if (draft[field] !== undefined) {
              personalData[field] = draft[field] as string;
            }
          }
          setPersonalForm((prev) => ({ ...prev, ...personalData }));
        }
      } catch (error) {
        console.error("Error in checkExistingAccount:", error);
      } finally {
        setIsCheckingDevice(false);
      }
    };

    checkExistingAccount();
  }, [router]);

  useEffect(() => {
    if (!isCheckingDevice) {
      try {
        const draft: DraftData = { ...personalForm };
        writeDraft(draft);
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }
  }, [personalForm, isCheckingDevice]);

  // ---- Email Availability Check --------------------------------------------

  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailChecked(false);
      setEmailAvailable(true);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch(`/api/auth/check-user?email=${encodeURIComponent(email)}`);
      const data = await response.json() as CheckUserResponse;
      setEmailAvailable(!data.exists);
      setEmailChecked(true);
      
      if (data.exists) {
        setErrors((prev) => ({ ...prev, email: 'Email already registered' }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // ---- Username Availability Check (NEW) ------------------------------------

  const checkUsernameAvailability = useCallback(async (username: string) => {
    // Skip if username is empty or doesn't meet minimum length
    if (!username || username.length < 3) {
      setUsernameChecked(false);
      setUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/auth/check-user?username=${encodeURIComponent(username)}`);
      const data = await response.json() as CheckUserResponse;
      setUsernameAvailable(!data.exists);
      setUsernameChecked(true);
      
      if (data.exists) {
        setErrors((prev) => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setErrors((prev) => ({ ...prev, username: undefined }));
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameChecked(false);
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // ---- Debounced Checks ----------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      if (personalForm.email && personalForm.email.length > 3) {
        checkEmailAvailability(personalForm.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [personalForm.email, checkEmailAvailability]);

  // ---- Debounced Username Check (NEW) --------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      if (personalForm.username && personalForm.username.length >= 3) {
        checkUsernameAvailability(personalForm.username);
      } else {
        setUsernameChecked(false);
        setUsernameAvailable(true);
        setErrors((prev) => ({ ...prev, username: undefined }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [personalForm.username, checkUsernameAvailability]);

  // ---- Handlers --------------------------------------------------------------

  const handlePersonalChange = useCallback((field: keyof PersonalFormState, value: string): void => {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError("");
    
    if (field === 'email') {
      setEmailChecked(false);
      setEmailAvailable(true);
    }
    
    // Reset username availability when username changes
    if (field === 'username') {
      setUsernameChecked(false);
      setUsernameAvailable(true);
      setErrors((prev) => ({ ...prev, username: undefined }));
    }
  }, [errors]);

  const validateUsername = useCallback((username: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }, []);

  const validatePersonal = useCallback((): boolean => {
    const next: FormErrors = {};

    if (!personalForm.firstName.trim()) next.firstName = "First name is required";
    if (!personalForm.lastName.trim()) next.lastName = "Last name is required";

    if (!personalForm.username.trim()) {
      next.username = "Username is required";
    } else if (!validateUsername(personalForm.username)) {
      next.username = "Username must be 3-20 characters (letters, numbers, underscores)";
    } else if (!usernameAvailable && usernameChecked) {
      next.username = "Username is already taken";
    }

    if (!personalForm.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalForm.email)) {
      next.email = "Enter a valid email address";
    } else if (!emailAvailable && emailChecked) {
      next.email = "Email already registered";
    }

    if (!personalForm.phone.trim()) {
      next.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(personalForm.phone)) {
      next.phone = "Enter a valid phone number";
    }

    if (!personalForm.password) {
      next.password = "Password is required";
    } else if (personalForm.password.length < 8) {
      next.password = "Use at least 8 characters";
    }

    if (personalForm.confirmPassword !== personalForm.password) {
      next.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      next.terms = "You must accept the terms to continue";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [personalForm, validateUsername, agreedToTerms, emailAvailable, emailChecked, usernameAvailable, usernameChecked]);

  // ---- Navigation Handlers --------------------------------------------------

  const handleLoginRedirect = useCallback(() => {
    setShowSuccessCard(false);
    router.push("/log-in");
  }, [router]);

  const handleDashboardRedirect = useCallback(() => {
    setShowSuccessCard(false);
    router.push("/Dashboard");
  }, [router]);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccessCard(false);
    router.push("/log-in");
  }, [router]);

  const handleCloseExistingBanner = useCallback(() => {
    setShowExistingBanner(false);
  }, []);

  const handleStayHere = useCallback(() => {
    setShowExistingBanner(false);
    clearDraft();
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCOUNT_FLAG_KEY);
    }
    setPersonalForm(PERSONAL_INITIAL_STATE);
    setErrors({});
    setVerificationError("");
    setSubmitError("");
    setAgreedToTerms(false);
    setEmailChecked(false);
    setEmailAvailable(true);
    setUsernameChecked(false);
    setUsernameAvailable(true);
  }, []);

  // ---- Main Submit Handler --------------------------------------------------

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    console.log('🔄 Form submitted');
    setSubmitError("");
    setVerificationError("");

    try {
      const isValid = validatePersonal();
      if (!isValid) {
        console.log('❌ Form validation failed');
        setSubmitError("Please fix all errors before submitting.");
        return;
      }
      console.log('✅ Form validation passed');

      if (!emailAvailable && emailChecked) {
        setSubmitError("This Email is already registered, log in or sign up with another Email.");
        return;
      }

      if (!usernameAvailable && usernameChecked) {
        setSubmitError("This username is not avalable");
        return;
      }

      const formData = personalForm;
      setIsSubmitting(true);

      // ✅ User data matching the new schema
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.toLowerCase(),
        displayName: formData.username,
        email: formData.email,
        phone: formData.phone || '',
        password: formData.password,
        accountType: "personal",
        isActive: true,
      };

      console.log('📤 Sending user data:', { ...userData, password: '***HIDDEN***' });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok) {
        if (response.status === 409) {
          if (result.error?.includes("email")) {
            console.log('⚠️ Email already exists');
            setShowExistingBanner(true);
            writeAccountFlag(formData.email);
            clearDraft();
            setIsSubmitting(false);
            return;
          }
          if (result.error?.includes("username")) {
            console.log('⚠️ Username already taken');
            setErrors((prev) => ({
              ...prev,
              username: "This username is not avalable",
            }));
            setIsSubmitting(false);
            return;
          }
        }
        throw new Error(result.error || `Registration failed with status ${response.status}`);
      }

      if (result.success) {
        console.log('✅ Registration successful!');
        console.log('👤 User data saved:', result.user);
        
        writeAccountFlag(formData.email);
        clearDraft();

        setCreatedUserEmail(formData.email);
        setCreatedUsername(formData.username);
        setIsSuccess(true);
        setShowSuccessCard(true);
        setIsSubmitting(false);

        console.log('⏳ Redirecting to log in');
        setTimeout(() => {
          setShowSuccessCard(false);
          router.push("/log-in");
        }, 15000);
      } else {
        throw new Error(result.message || "Submission failed");
      }

    } catch (error: unknown) {
      console.error('❌ Registration error:', error);
      setIsSubmitting(false);
      const err = error as { message?: string };
      setSubmitError(err?.message || "An error occurred. Please try again.");
    }
  };

  // ---- Render ----------------------------------------------------------------

  if (isCheckingDevice) {
    return (
      <div className="lg:relative px-7 flex w-full bg-transparent items-center justify-center py-16">
        <Loader2 className="animate-spin text-cyan-600" size={22} />
      </div>
    );
  }

  return (
    <div className="lg:relative px-7 flex w-full bg-transparent items-left justify-center m-0">
      {/* Success Card */}
      <AnimatePresence>
        {showSuccessCard && (
          <SuccessCard
            email={createdUserEmail}
            username={createdUsername}
            onClose={handleCloseSuccess}
            onLogin={handleLoginRedirect}
            onDashboard={handleDashboardRedirect}
          />
        )}
      </AnimatePresence>

      {/* Existing Account Banner */}
      <AnimatePresence>
        {showExistingBanner && (
          <ExistingAccountBanner
            email={personalForm.email}
            onClose={handleCloseExistingBanner}
            onStayHere={handleStayHere}
          />
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md rounded-2xl"
      >
        <AnimatePresence mode="wait">
          {isSuccess && !showSuccessCard ? (
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
                Account created successfully!
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-600">
                Your account has been created and verified.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form">
              {/* Header */}
              <motion.div
                className="bg-transparent from-blue-200 border-none rounded-lg pt-5"
                variants={fieldVariants}
              >
                <h1 className="text-xl font-bold text-cyan-700 text-center sm:text-2xl">
                  Create Your Account
                </h1>
                <p className="mt-1.5 text-sm p-2 text-center text-cyan-700">
                  Don't have an account? We've got you covered, create one in minutes.
                </p>
              </motion.div>

              {/* Submit Error */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-sm font-bold text-red-700">{submitError}</p>
                </motion.div>
              )}

              {/* Verification Error */}
              {verificationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/20 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-sm font-bold text-amber-700">{verificationError}</p>
                </motion.div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.div variants={fieldVariants}>
                  <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-cyan-700">First name</label>
                  <div className="flex items-center gap-2 rounded-md border-none bg-cyan-400/6 px-3 py-2.5 shadow-xl focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                    <User size={15} className="shrink-0 text-cyan-500" />
                    <input
                      id="firstName"
                      type="text"
                      value={personalForm.firstName}
                      onChange={(e) => handlePersonalChange("firstName", e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <FieldError message={errors.firstName} />
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-cyan-700">Last name</label>
                  <div className="flex items-center gap-2 rounded-md border border-none bg-cyan-400/6 px-3 py-2.5 shadow-xl focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                    <User size={15} className="shrink-0 text-cyan-500" />
                    <input
                      id="lastName"
                      type="text"
                      value={personalForm.lastName}
                      onChange={(e) => handlePersonalChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <FieldError message={errors.lastName} />
                </motion.div>
              </div>

              {/* ---- Username Field with Availability Check (UPDATED) ---- */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-cyan-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-md border border-none bg-cyan-400/6 px-3 py-2.5 shadow-xl focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <UserPlus size={15} className="shrink-0 text-cyan-500" />
                  <input
                    id="username"
                    type="text"
                    value={personalForm.username}
                    onChange={(e) => handlePersonalChange("username", e.target.value)}
                    placeholder="jane_doe"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                  )}
                  {!isCheckingUsername && usernameChecked && personalForm.username && (
                    usernameAvailable ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </div>
                <FieldError message={errors.username} />
                {!isCheckingUsername && usernameChecked && !usernameAvailable && personalForm.username && (
                  <p className="mt-1 text-xs text-red-600">
                    Username is already taken
                  </p>
                )}
                {!isCheckingUsername && usernameChecked && usernameAvailable && personalForm.username && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Username available ✓
                  </p>
                )}
                <p className="mt-1 text-xs text-cyan-500/70">3-20 characters (letters, numbers, underscores)</p>
              </motion.div>

              {/* ---- Email Field with Availability Check (unchanged) ---- */}
              <motion.div variants={fieldVariants} className="mt-4">
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-cyan-700">Email address</label>
                <div className="flex items-center gap-2 rounded-md border border-none bg-cyan-400/6 px-3 py-2.5 shadow-xl focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Mail size={15} className="shrink-0 text-cyan-500" />
                  <input
                    id="email"
                    type="email"
                    value={personalForm.email}
                    onChange={(e) => handlePersonalChange("email", e.target.value)}
                    placeholder="jane.doe@email.com"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  {isCheckingEmail && (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                  )}
                  {!isCheckingEmail && emailChecked && personalForm.email && (
                    emailAvailable ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </div>
                <FieldError message={errors.email} />
                {!isCheckingEmail && emailChecked && !emailAvailable && personalForm.email && (
                  <p className="mt-1 text-xs text-red-600">
                    This email is already registered
                  </p>
                )}
                {!isCheckingEmail && emailChecked && emailAvailable && personalForm.email && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Email available ✓
                  </p>
                )}
              </motion.div>

              <motion.div variants={fieldVariants} className="mt-4">
                <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-cyan-700">Phone number</label>
                <div className="flex items-center gap-2 rounded-md border-none bg-cyan-400/6 shadow-xl px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Phone size={15} className="shrink-0 text-cyan-500" />
                  <input
                    id="phone"
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) => handlePersonalChange("phone", e.target.value)}
                    placeholder="+1 555 000 1234"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <FieldError message={errors.phone} />
              </motion.div>

              <motion.div variants={fieldVariants} className="mt-4">
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-cyan-700">Password</label>
                <div className="flex items-center gap-2 rounded-md border-none border-slate-400/60 bg-cyan-400/6 shadow-xl px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Lock size={15} className="shrink-0 text-cyan-700" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={personalForm.password}
                    onChange={(e) => handlePersonalChange("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="text-cyan-700" size={15} /> : <Eye size={15} className="text-cyan-700" />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </motion.div>

              <motion.div variants={fieldVariants} className="mt-4">
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-slate-700">Confirm password</label>
                <div className="flex items-center gap-2 rounded-md border border-none bg-cyan-400/6 shadow-xl px-3 py-2.5 focus-within:border-cyan-600 focus-within:ring-1 focus-within:ring-cyan-600">
                  <Lock size={15} className="shrink-0 text-cyan-700" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={personalForm.confirmPassword}
                    onChange={(e) => handlePersonalChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="text-cyan-700 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                    }}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-cyan-600"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/Policy" className="font-medium text-cyan-700 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/Policy" className="font-medium text-cyan-700 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <FieldError message={errors.terms} />
              </motion.div>

              {errors.form && <FieldError message={errors.form} />}

              <motion.button
                variants={fieldVariants}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting || isCheckingEmail || isCheckingUsername}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="flex">
                    <Loader2 size={16} />
                  </motion.span>
                ) : (
                  "Create Account"
                )}
              </motion.button>

              <motion.p variants={fieldVariants} className="mt-4 text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/log-in" className="font-medium text-cyan-700 hover:underline">
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

// ---- Helpers ----------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}