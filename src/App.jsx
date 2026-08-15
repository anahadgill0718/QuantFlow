import React, { useEffect, useState } from "react";
import FinanceDashboard from "./FinanceDashboard";
import AuthGate from "./AuthGate";
import LandingPage from "./LandingPage";
import { supabase } from "./supabaseClient";
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  return (
    <>
      {session ? (
        <FinanceDashboard userId={session.user.id} onSignOut={() => supabase.auth.signOut()} />
      ) : showAuth ? (
        <AuthGate />
      ) : (
        <LandingPage onSignIn={() => setShowAuth(true)} />
      )}
      <Analytics />
    </>
  );
}