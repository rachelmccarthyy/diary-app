'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getUser, onAuthStateChange } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

// Ensure a profile row exists for the user
async function ensureProfile(user: User) {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!data) {
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    });
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => {
      if (u) ensureProfile(u);
      setUser(u);
      setLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((u) => {
      if (u) ensureProfile(u);
      setUser(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
