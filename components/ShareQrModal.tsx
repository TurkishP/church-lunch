"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Modal from "@/components/Modal";

type ShareQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  copy: {
    title: string;
    description: string;
    generating: string;
    qrAlt: string;
    copyLink: string;
    copied: string;
    generateError: string;
  };
  modalCopy: {
    close: string;
    closeBackdrop: string;
  };
};

export default function ShareQrModal({
  isOpen,
  onClose,
  copy,
  modalCopy
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
          qrError instanceof Error ? qrError.message : copy.generateError
        );
      });
  }, [copy.generateError, isOpen]);

  async function handleCopy() {
    if (!pageUrl) {
      return;
    }

    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
  }

  return (
    <Modal
      backdropLabel={modalCopy.closeBackdrop}
      closeLabel={modalCopy.close}
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
    >
      <div className="space-y-4 text-center">
        <p className="text-sm leading-6 text-slate-600">{copy.description}</p>

        <div className="flex justify-center">
          <div className="rounded-[1.75rem] bg-[#fffaf2] p-4 shadow-soft">
            {qrDataUrl ? (
              <img
                alt={copy.qrAlt}
                className="h-64 w-64 rounded-2xl"
                src={qrDataUrl}
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white text-sm text-slate-500">
                {copy.generating}
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
          {copied ? copy.copied : copy.copyLink}
        </button>
      </div>
    </Modal>
  );
}
