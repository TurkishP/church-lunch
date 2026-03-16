"use client";

import { useEffect, useState } from "react";
import CreateGroupModal from "@/components/CreateGroupModal";
import GroupDetailModal from "@/components/GroupDetailModal";
import GroupList, { type GroupListItem } from "@/components/GroupList";
import NameGate from "@/components/NameGate";
import ShareQrModal from "@/components/ShareQrModal";
import { useAnonAuth } from "@/hooks/useAnonAuth";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useLanguage } from "@/hooks/useLanguage";
import { getCopy } from "@/lib/i18n";
import {
  createGroup,
  subscribeGroups,
  type LunchGroup
} from "@/lib/groups";
import {
  leaveGroup,
  subscribeMemberships,
  upsertMembership,
  type Membership
} from "@/lib/memberships";
import {
  saveParticipantDisplayName,
  subscribeParticipants,
  type Participant
} from "@/lib/participants";

type DetailedGroup = LunchGroup & {
  creatorName: string;
  memberCount: number;
  members: Participant[];
};

function QrIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
      <path d="M14 14h3v3h-3zM18 14h3v7h-7v-3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage("ko");
  const copy = getCopy(language);
  const { user, loading: authLoading, error: authError } = useAnonAuth();
  const {
    sessionId,
    loading: sessionLoading,
    error: sessionError
  } = useCurrentSession();

  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {}
  );
  const [groups, setGroups] = useState<Record<string, LunchGroup>>({});
  const [memberships, setMemberships] = useState<Record<string, Membership>>({});
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const canCreateGroup = Boolean(sessionId) && !authError && !sessionError;

  useEffect(() => {
    if (!sessionId) {
      setParticipants({});
      setGroups({});
      setMemberships({});
      setParticipantsLoaded(false);
      setGroupsLoaded(false);
      setMembershipsLoaded(false);
      return;
    }

    setParticipantsLoaded(false);
    setGroupsLoaded(false);
    setMembershipsLoaded(false);

    const unsubscribeParticipants = subscribeParticipants(
      sessionId,
      (nextParticipants) => {
        setParticipants(nextParticipants);
        setParticipantsLoaded(true);
      },
      (message) => {
        setActionError(message);
        setParticipantsLoaded(true);
      }
    );

    const unsubscribeGroups = subscribeGroups(
      sessionId,
      (nextGroups) => {
        setGroups(nextGroups);
        setGroupsLoaded(true);
      },
      (message) => {
        setActionError(message);
        setGroupsLoaded(true);
      }
    );

    const unsubscribeMemberships = subscribeMemberships(
      sessionId,
      (nextMemberships) => {
        setMemberships(nextMemberships);
        setMembershipsLoaded(true);
      },
      (message) => {
        setActionError(message);
        setMembershipsLoaded(true);
      }
    );

    return () => {
      unsubscribeParticipants();
      unsubscribeGroups();
      unsubscribeMemberships();
    };
  }, [sessionId]);

  const currentParticipant = user ? participants[user.uid] ?? null : null;
  const currentMembership = user ? memberships[user.uid] ?? null : null;
  const membershipGroupId = currentMembership?.groupId ?? null;

  const detailedGroups: DetailedGroup[] = Object.values(groups)
    .filter((group) => group.status !== "archived")
    .map((group) => {
      const members = Object.values(memberships)
        .filter((membership) => membership.groupId === group.id)
        .map((membership) => participants[membership.participantId])
        .filter((participant): participant is Participant => Boolean(participant))
        .sort((left, right) =>
          left.displayName.localeCompare(right.displayName, undefined, {
            sensitivity: "base"
          })
        );

      return {
        ...group,
        creatorName: participants[group.creatorId]?.displayName ?? "Unknown",
        memberCount: members.length,
        members
      };
    })
    .sort((left, right) => {
      if (membershipGroupId === left.id && membershipGroupId !== right.id) {
        return -1;
      }

      if (membershipGroupId === right.id && membershipGroupId !== left.id) {
        return 1;
      }

      if (right.memberCount !== left.memberCount) {
        return right.memberCount - left.memberCount;
      }

      const leftTime = left.createdAt?.getTime() ?? 0;
      const rightTime = right.createdAt?.getTime() ?? 0;
      return leftTime - rightTime;
    });

  const groupListItems: GroupListItem[] = detailedGroups.map((group) => ({
    id: group.id,
    name: group.name,
    menu: group.menu,
    creatorName: group.creatorName,
    memberCount: group.memberCount,
    hasLink: Boolean(group.linkUrl),
    hasImage: Boolean(group.imageUrl),
    isJoined: membershipGroupId === group.id
  }));

  const selectedGroup =
    detailedGroups.find((group) => group.id === selectedGroupId) ?? null;

  async function runAction(actionName: string, action: () => Promise<void>) {
    setPendingAction(actionName);
    setActionError(null);

    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSaveDisplayName(displayName: string) {
    if (!user || !sessionId) {
      return;
    }

    await runAction("save-name", async () => {
      await saveParticipantDisplayName(sessionId, user.uid, displayName);
    });
  }

  async function handleJoinGroup(groupId: string) {
    if (!user || !sessionId) {
      return;
    }

    await runAction("join-group", async () => {
      await upsertMembership(sessionId, user.uid, groupId);
    });
  }

  async function handleLeaveGroup() {
    if (!user || !sessionId) {
      return;
    }

    await runAction("leave-group", async () => {
      await leaveGroup(sessionId, user.uid);
      setSelectedGroupId(null);
    });
  }

  async function handleCreateGroup(values: {
    name: string;
    menu: string;
    linkUrl: string;
    imageFile: File | null;
  }) {
    if (!user || !sessionId) {
      return;
    }

    await runAction("create-group", async () => {
      const newGroupId = await createGroup({
        sessionId,
        creatorId: user.uid,
        name: values.name,
        menu: values.menu,
        linkUrl: values.linkUrl,
        imageFile: values.imageFile
      });

      setCreateOpen(false);
      setSelectedGroupId(newGroupId);
    });
  }

  const isInitialLoading =
    authLoading ||
    sessionLoading ||
    (Boolean(sessionId) &&
      (!participantsLoaded || !groupsLoaded || !membershipsLoaded));

  if (isInitialLoading) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-6">
        <div className="panel rounded-[2rem] px-6 py-8 text-center">
          <p className="display-font text-3xl font-semibold text-pine">
            {copy.loadingTitle}
          </p>
          <p className="mt-3 text-sm text-slate-600">{copy.loadingSubtitle}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell safe-bottom min-h-screen px-4 pb-32 pt-5">
      <div className="mx-auto max-w-xl space-y-4">
        <section className="panel-strong rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pine/75">
                {copy.communityLabel}
              </p>
              <h1 className="display-font mt-2 text-4xl font-semibold leading-none text-pine">
                {copy.appTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label={copy.languageToggle}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-pine/15 bg-white/80 px-3 py-3 text-sm font-semibold text-pine transition hover:bg-pine/5"
                onClick={() =>
                  setLanguage((currentLanguage) =>
                    currentLanguage === "ko" ? "en" : "ko"
                  )
                }
                type="button"
              >
                <GlobeIcon />
                {language.toUpperCase()}
              </button>
              <button
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-pine/15 bg-white/80 px-4 py-3 text-sm font-semibold text-pine transition hover:bg-pine/5"
                onClick={() => setShareOpen(true)}
                type="button"
              >
                <ShareIcon />
                {copy.share}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.yourName}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                {currentParticipant?.displayName || copy.setDisplayName}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.currentSession}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                {sessionId ?? copy.notConfigured}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-gradient-to-r from-ember/15 to-moss/15 px-4 py-4 text-sm text-slate-700">
            {membershipGroupId
              ? copy.joinedHint
              : copy.noMembershipHint}
          </div>
        </section>

        {authError || sessionError || actionError || !sessionId ? (
          <section className="rounded-[1.75rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {authError ||
              sessionError ||
              actionError ||
              copy.noActiveSession}
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="display-font text-2xl font-semibold text-ink">
              {copy.openGroups}
            </h2>
            <span className="rounded-full bg-white/75 px-3 py-1 text-sm font-semibold text-pine">
              {detailedGroups.length}
            </span>
          </div>

          <GroupList copy={copy.groupList} groups={groupListItems} onSelect={setSelectedGroupId} />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 rounded-[2rem] border border-pine/10 bg-white/92 p-3 shadow-soft backdrop-blur">
          <button
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.35rem] border border-pine/15 bg-white px-4 py-4 text-base font-semibold text-pine transition hover:bg-pine/5"
            onClick={() => setShareOpen(true)}
            type="button"
          >
            <QrIcon />
            {copy.qr}
          </button>
          <button
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.35rem] bg-ember px-4 py-4 text-base font-semibold text-white transition hover:bg-ember/90 disabled:cursor-not-allowed disabled:bg-ember/50"
            disabled={!canCreateGroup}
            title={!canCreateGroup ? copy.createGroupDisabled : undefined}
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <PlusIcon />
            {copy.createGroup}
          </button>
        </div>
      </div>

      <NameGate
        copy={copy.nameGate}
        initialValue={currentParticipant?.displayName ?? ""}
        isOpen={Boolean(user && sessionId && !currentParticipant?.displayName)}
        isSaving={pendingAction === "save-name"}
        modalCopy={copy.modal}
        onSubmit={handleSaveDisplayName}
      />

      <CreateGroupModal
        copy={copy.createModal}
        isOpen={createOpen}
        isSubmitting={pendingAction === "create-group"}
        modalCopy={copy.modal}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <GroupDetailModal
        copy={{ ...copy.detailModal, fallbackName: copy.groupList.fallbackName }}
        group={
          selectedGroup
            ? {
                id: selectedGroup.id,
                name: selectedGroup.name,
                menu: selectedGroup.menu,
                linkUrl: selectedGroup.linkUrl,
                imageUrl: selectedGroup.imageUrl,
                creatorName: selectedGroup.creatorName,
                members: selectedGroup.members
              }
            : null
        }
        isBusy={pendingAction === "join-group" || pendingAction === "leave-group"}
        membershipGroupId={membershipGroupId}
        modalCopy={copy.modal}
        onClose={() => setSelectedGroupId(null)}
        onJoin={handleJoinGroup}
        onLeave={handleLeaveGroup}
      />

      <ShareQrModal
        copy={copy.shareModal}
        isOpen={shareOpen}
        modalCopy={copy.modal}
        onClose={() => setShareOpen(false)}
      />
    </main>
  );
}
