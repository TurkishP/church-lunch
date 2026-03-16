"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";

type CreateGroupValues = {
  name: string;
  menu: string;
  linkUrl: string;
  imageFile: File | null;
};

type CreateGroupModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupValues) => Promise<void>;
};

export default function CreateGroupModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [menu, setMenu] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setName("");
    setMenu("");
    setLinkUrl("");
    setImageFile(null);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!menu.trim()) {
      return;
    }

    await onSubmit({
      name,
      menu,
      linkUrl,
      imageFile
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create group">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Group name
          </span>
          <input
            className="w-full rounded-2xl border border-pine/15 bg-white/90 px-4 py-3 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
            onChange={(event) => setName(event.target.value)}
            placeholder="Optional name"
            value={name}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Menu</span>
          <input
            className="w-full rounded-2xl border border-pine/15 bg-white/90 px-4 py-3 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
            onChange={(event) => setMenu(event.target.value)}
            placeholder="Required menu"
            required
            value={menu}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Link URL
          </span>
          <input
            className="w-full rounded-2xl border border-pine/15 bg-white/90 px-4 py-3 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="Optional restaurant link"
            type="url"
            value={linkUrl}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Image</span>
          <input
            accept="image/*"
            className="w-full rounded-2xl border border-dashed border-pine/20 bg-white/70 px-4 py-3 text-sm"
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null);
            }}
            type="file"
          />
          <span className="block text-xs text-slate-500">
            Stored in Firebase Storage for the current session.
          </span>
        </label>

        <div className="rounded-[1.4rem] bg-sand/70 px-4 py-3 text-sm leading-6 text-slate-600">
          You automatically join the group after creating it. Creating a new
          group also replaces your current group membership.
        </div>

        <button
          className="w-full rounded-[1.4rem] bg-ember px-4 py-4 text-base font-semibold text-white transition hover:bg-ember/90 disabled:cursor-not-allowed disabled:bg-ember/50"
          disabled={isSubmitting || !menu.trim()}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create group"}
        </button>
      </form>
    </Modal>
  );
}
