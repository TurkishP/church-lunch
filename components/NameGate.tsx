"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";

type NameGateProps = {
  isOpen: boolean;
  initialValue?: string;
  isSaving: boolean;
  onSubmit: (displayName: string) => Promise<void>;
};

export default function NameGate({
  isOpen,
  initialValue = "",
  isSaving,
  onSubmit
}: NameGateProps) {
  const [displayName, setDisplayName] = useState(initialValue);

  useEffect(() => {
    setDisplayName(initialValue);
  }, [initialValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!displayName.trim()) {
      return;
    }

    await onSubmit(displayName.trim());
  }

  return (
    <Modal dismissible={false} isOpen={isOpen} onClose={() => {}} title="Your name">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm leading-6 text-slate-600">
          Enter the name you want everyone to see in this week&apos;s lunch
          groups.
        </p>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Display name
          </span>
          <input
            autoFocus
            className="w-full rounded-2xl border border-pine/15 bg-white/90 px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
            maxLength={40}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="e.g. Grace Kim"
            value={displayName}
          />
        </label>

        <button
          className="w-full rounded-2xl bg-pine px-4 py-4 text-base font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:bg-pine/50"
          disabled={isSaving || !displayName.trim()}
          type="submit"
        >
          {isSaving ? "Saving..." : "Continue"}
        </button>
      </form>
    </Modal>
  );
}
