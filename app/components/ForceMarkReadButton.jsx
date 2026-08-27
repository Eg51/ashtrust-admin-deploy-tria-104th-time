"use client";

import { useState } from "react";
import { CheckCheck, Loader2, AlertCircle } from "lucide-react";

export function ForceMarkReadButton({ roomId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleForceMarkRead = async () => {
    if (!roomId) {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
      return;
    }
    
    setIsLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/force-mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        if (onSuccess) onSuccess();
        
        // ✅ Auto-hide success after 3 seconds
        setTimeout(() => {
          setStatus(null);
        }, 3000);
        
        console.log('✅ Force marked all messages as read');
      } else {
        console.error('❌ Failed:', data.error);
        setStatus('error');
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleForceMarkRead}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${status === 'success' 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : status === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>marking as read...</span>
        </>
      ) : status === 'success' ? (
        <>
          <CheckCheck className="h-4 w-4" />
          <span>✓ marked all messages as read!</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>Failed! Please try again</span>
        </>
      ) : (
        <>
          <CheckCheck className="h-4 w-4" />
          <span>Force Mark All as Read</span>
        </>
      )}
    </button>
  );
}