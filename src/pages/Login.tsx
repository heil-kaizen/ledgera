import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage({ type: 'error', text: "Supabase keys are missing. Please configure them in the project settings." });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      setMessage({ type: 'success', text: "Check your email for the login link!" });
    } catch (err: any) {
      console.error("Login Error:", err);
      setMessage({ type: 'error', text: err.message || "Failed to send magic link. Check your connection or Supabase URL." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-charity-muted max-w-md w-full">
        <h1 className="text-3xl font-serif text-charity-darker mb-6 text-center">Admin Login</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-charity-dark focus:border-transparent outline-none transition-all"
              placeholder="you@charity.org"
            />
          </div>
          <Button type="submit" disabled={loading} variant="dark" className="w-full mt-2">
            {loading ? "Sending link..." : "Send Magic Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
