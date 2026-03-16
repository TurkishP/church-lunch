"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
};

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  dismissible = true
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [dismissible, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center">
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0"
        disabled={!dismissible}
        onClick={dismissible ? onClose : undefined}
        type="button"
      />

      <div className="panel-strong relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-pine/10 px-5 py-4">
          <h2 className="display-font text-2xl font-semibold text-pine">
            {title}
          </h2>

          {dismissible ? (
            <button
              className="rounded-full border border-pine/15 px-3 py-2 text-sm font-semibold text-pine transition hover:bg-pine/5"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          ) : null}
        </div>

        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
