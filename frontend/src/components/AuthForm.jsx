"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./AuthForm.module.css";

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M20 6.5v27M6.5 20h27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2" opacity=".22" />
      </svg>
    </span>
  );
}

export default function AuthForm({ mode }) {
  const isRegistering = mode === "register";
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegistering
          ? { userName: userName.trim(), email: email.trim(), password }
          : { email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message || "We couldn't complete that request. Please try again.");
      } else {
        setSuccess(isRegistering
          ? "Your account is ready. You're signed in."
          : "You're signed in. Your session is ready.");
      }
    } catch {
      setError("Unable to reach HealthMate. Check that the backend is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <Link className={styles.backLink} href="/">
        <span aria-hidden="true">←</span> Back to HealthMate
      </Link>
      <section className={styles.authCard} aria-labelledby="auth-title">
        <Link className={styles.brand} href="/">
          <BrandMark />
          <span>healthmate<span className={styles.brandDot}>.</span></span>
        </Link>
        <p className={styles.eyebrow}>{isRegistering ? "A LITTLE MORE CLARITY" : "WELCOME BACK"}</p>
        <h1 id="auth-title">{isRegistering ? "Create your account" : "Sign in to your vault"}</h1>
        <p className={styles.intro}>
          {isRegistering
            ? "Start bringing your health records together in one private place."
            : "Your reports and health timeline are right where you left them."}
        </p>

        <div className={styles.modeSwitch} aria-label="Account options">
          <Link className={!isRegistering ? styles.activeMode : ""} href="/login">Sign in</Link>
          <Link className={isRegistering ? styles.activeMode : ""} href="/signup">Create account</Link>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {success && (
          <div className={styles.success} role="status">
            <p>{success}</p>
            <Link href="/dashboard">Continue to your dashboard <span aria-hidden="true">→</span></Link>
          </div>
        )}

        {!success && (
          <form className={styles.form} onSubmit={handleSubmit}>
            {isRegistering && (
              <label>
                <span>Your name</span>
                <input
                  autoComplete="name"
                  maxLength={40}
                  minLength={2}
                  name="userName"
                  onChange={(event) => setUserName(event.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  value={userName}
                />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                autoComplete={isRegistering ? "new-password" : "current-password"}
                maxLength={128}
                minLength={isRegistering ? 8 : undefined}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegistering ? "At least 8 characters" : "Your password"}
                required
                type="password"
                value={password}
              />
            </label>
            <button className={styles.submitButton} disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "One moment…"
                : isRegistering ? "Create my account" : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}

        <p className={styles.privacyNote}>
          <span aria-hidden="true">⌑</span>
          Your health records are personal. Keep your sign-in details private.
        </p>
      </section>
      <p className={styles.disclaimer}>For information only. HealthMate does not replace professional medical care.</p>
    </main>
  );
}
