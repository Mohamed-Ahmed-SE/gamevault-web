"use client";

import { useEffect, useState } from "react";
import { loadProfileSettings, saveProfileSettings } from "@/lib/profile-settings";

type LoadState = "loading" | "ready" | "error";

export function SettingsForm() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    setMessage("");
    loadProfileSettings()
      .then((profile) => {
        if (!active) return;
        setName(profile.displayName);
        setBio(profile.bio);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "Could not load profile settings.");
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loadState !== "ready" || isSaving) return;

    setIsSaving(true);
    setMessage("");
    try {
      await saveProfileSettings({ displayName: name, bio });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="auth-card settings-card" aria-busy={loadState === "loading" || isSaving}>
        <p className="settings-load-status" role="status">
          {loadState === "loading" ? "Loading profile settings…" : ""}
        </p>
        {loadState === "error" && (
          <div role="alert">
            <p>{message}</p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            >
              Try again
            </button>
          </div>
        )}
        <label className="field" htmlFor="settings-display-name">
          Display name
          <input
            id="settings-display-name"
            value={name}
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={loadState !== "ready" || isSaving}
          />
        </label>
        <label className="field" htmlFor="settings-bio">
          Short bio
          <textarea
            id="settings-bio"
            value={bio}
            maxLength={240}
            onChange={(event) => setBio(event.target.value)}
            disabled={loadState !== "ready" || isSaving}
          />
        </label>
        <button className="button button-primary" disabled={loadState !== "ready" || isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <p role="status" aria-live="polite">{loadState === "error" ? "" : message}</p>
      </form>
      <form method="post" action="/api/auth/signout">
        <button className="button button-outline" type="submit">Sign out</button>
      </form>
    </>
  );
}
