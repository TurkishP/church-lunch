"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Modal from "@/components/Modal";

type ShareQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ShareQrModal({
  isOpen,
  onClose
}: ShareQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      return;
    }

    const currentUrl = window.location.href;
    setPageUrl(currentUrl);

    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: "#1d4d3b",
        light: "#fffaf2"
      }
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
        setError(null);
      })
      .catch((qrError) => {
        setError(
          qrError instanceof Error ? qrError.message : "Could not generate QR code."
        );
      });
  }, [isOpen]);

  async function handleCopy() {
    if (!pageUrl) {
      return;
    }

    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share app">
      <div className="space-y-4 text-center">
        <p className="text-sm leading-6 text-slate-600">
          Let people scan the QR code to open this week&apos;s lunch group page.
        </p>

        <div className="flex justify-center">
          <div className="rounded-[1.75rem] bg-[#fffaf2] p-4 shadow-soft">
            {qrDataUrl ? (
              <img
                alt="QR code for sharing the app"
                className="h-64 w-64 rounded-2xl"
                src={qrDataUrl}
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white text-sm text-slate-500">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {pageUrl ? (
          <p className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600">
            {pageUrl}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <button
          className="w-full rounded-[1.4rem] bg-pine px-4 py-4 text-base font-semibold text-white transition hover:bg-pine/90"
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </Modal>
  );
}
