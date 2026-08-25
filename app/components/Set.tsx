"use client";
import Analytic from "@/app/components/Analytic";
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { compressImage } from '@/lib/compressImage';

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  username: string;
  email: string;
  phone: string;
  address: string;
  firstName: string;
  lastName: string;
  displayName: string; // ✅ New field
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ============================================================================
// API CALLS
// ============================================================================

const fetchUserProfile = async () => {
  const response = await fetch('/api/user/profile', {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch profile');
  }
  const result = await response.json();
  return result.data;
};

const fetchUserAvatar = async (userId: string) => {
  const response = await fetch(`/api/user/avatar?userId=${userId}`, {
    credentials: 'include',
  });
  if (!response.ok) return null;
  const result = await response.json();
  return result.data?.avatar || null;
};

const updateUserProfile = async (data: any) => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update profile');
  }
  return response.json();
};

const removeAvatar = async (userId: string) => {
  const response = await fetch(`/api/user/avatar?userId=${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to remove avatar');
  }
  return response.json();
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    phone: "",
    address: "",
    firstName: "",
    lastName: "",
    displayName: "", // ✅ Initialize
  });
  const [userId, setUserId] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAvatar, setHasAvatar] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // LOAD USER DATA
  // ============================================================================

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const profile = await fetchUserProfile();
        setFormData({
          username: profile.username || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          displayName: profile.displayName || "", // ✅ Load displayName
        });
        setHasAvatar(profile.hasAvatar || false);
        setUserId(profile.id);

        if (profile.hasAvatar) {
          const avatarData = await fetchUserAvatar(profile.id);
          if (avatarData) setPhotoURL(avatarData);
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        setErrorMessage(error.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!formData.username.trim()) {
      setErrorMessage("Username is required");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateUserProfile({
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        displayName: formData.displayName.trim(), // ✅ Include displayName
        hasAvatar: hasAvatar,
      });
      setSuccessMessage("Profile updated successfully!");

      setTimeout(() => {
        router.push('/Dashboard');
      }, 1000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setErrorMessage(error.message || "Failed to save profile");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasAvatar, router]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setErrorMessage("No file selected");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const compressedImage = await compressImage(file, 100, 400);
      setPhotoURL(compressedImage);
      setHasAvatar(true);

      await updateUserProfile({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        displayName: formData.displayName, // ✅ Preserve displayName
        hasAvatar: true,
        avatar: compressedImage,
      });

      setSuccessMessage("Avatar updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setErrorMessage(error.message || "Failed to upload avatar");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }, [formData]);

  const handleRemoveAvatar = useCallback(async () => {
    if (!photoURL) {
      setErrorMessage("No avatar to remove");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await removeAvatar(userId);
      setPhotoURL(null);
      setHasAvatar(false);
      setSuccessMessage("Avatar removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      setErrorMessage(error.message || "Failed to remove avatar");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsUploading(false);
    }
  }, [photoURL, userId]);

  // ============================================================================
  // MEMOIZED RENDER
  // ============================================================================

  const userInitials = useMemo(() => {
    if (!formData.firstName && !formData.lastName) return "U";
    return `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();
  }, [formData.firstName, formData.lastName]);

  // ✅ Display name uses displayName, falls back to first+last, then username
  const displayName = useMemo(() => {
    if (formData.displayName) return formData.displayName;
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`;
    }
    return formData.username || "User";
  }, [formData.displayName, formData.firstName, formData.lastName, formData.username]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#C4F8FD] pb-19 pt-3 px-3 sm:px-4 sm:pb-19 sm:pt-3 sm:px-3 lg:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl"
      >
        {/* Header */}
        <motion.div
          custom={0}
          variants={cardVariants}
          className="mb-4 sm:mb-6"
        >
          <h2 className="text-md font-bold text-cyan-900 sm:text-2xl lg:text-3xl">
            {/* Manage your account information */}
          </h2>
          {/* <p className="text-xs font-bold text-cyan-900/70 sm:text-sm">
            
          </p> */}
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 backdrop-blur-sm"
            >
              <CheckCircle size={16} className="text-emerald-600" />
              <span className="text-sm font-bold text-cyan-900">{successMessage}</span>
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-3 backdrop-blur-sm"
            >
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm font-bold text-cyan-900">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            custom={1}
            variants={cardVariants}
            className="lg:col-span-1"
          >
            <div className="rounded-xl border border-cyan-200/30 bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6">
              <div className="flex flex-col items-center">
                <div
                  className="group relative cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    {photoURL ? (
                      <Image
                        src={photoURL}
                        alt="Profile"
                        fill
                        className="rounded-full shadow-xl object-cover ring-2 ring-cyan-500/50"
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full shadow-xl bg-none text-2xl
                       font-bold text-white shadow-lg sm:text-3xl">
                        {userInitials}
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    {/* Camera icon removed */}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAvatarClick}
                    className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-900 transition hover:bg-cyan-500/30"
                  >
                    <Upload size={14} className="mr-1 inline" />
                    Upload
                  </motion.button>
                  {photoURL && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveAvatar}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-500/30"
                    >
                      <Trash2 size={14} className="mr-1 inline" />
                      Remove
                    </motion.button>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-cyan-900 sm:text-base">
                    {displayName}
                  </p>
                  <p className="text-xs font-bold text-cyan-900/70 sm:text-sm">
                    @{formData.username}
                  </p>
                  {photoURL && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {/* ✓ Avatar saved to database */}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Settings */}
          <div className="space-y-4 lg:col-span-2">
            <motion.div
              custom={2}
              variants={cardVariants}
              className="rounded-xl border border-cyan-200/30  shadow-xl bg-[#C4F8FD] p-4 shadow-xl backdrop-blur-sm sm:p-6"
            >
              <h2 className="text-sm font-bold text-cyan-900 sm:text-base">
                Personal Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {/* ✅ Display Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-900/70">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleFormChange("displayName", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none px-3 py-2 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Your public display name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-900/70">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleFormChange("username", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none px-3 py-2 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-900/70">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none px-3 py-2 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-900/70">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-tra border-cyan-200/50 shadow-xl bg-none px-3 py-2 text-sm font-bold
                     text-cyan-900 placeholder:text-cyan-900/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-cyan-900/70">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none px-3 py-2 text-sm font-bold text-cyan-900 placeholder:text-cyan-900/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C4F8FD] px-4 py-2.5 shadow-xl
                 text-sm font-bold text-cyan-900 shadow-lg shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </motion.button>
             
            </motion.div>
            <div className="flex w-60 items-center justify-center md:justify-around h-auto mx-0 my-4 p-0 ">
              <Analytic/>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}