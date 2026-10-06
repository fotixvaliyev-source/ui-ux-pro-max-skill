"use client";

import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Tag } from "@/components/ui/tag";
import { initialState, type ActionState } from "@/lib/action-state";
import {
  deleteCircleAction, leaveCircleAction, regenerateInviteAction, removeMemberAction, setInviteOpenAction, setMemberRoleAction,
} from "@/server/actions/circles";
import { FormMessage, SubmitButton, fieldError, ActionForm } from "./form-parts";

/** Runs a server action from a button and surfaces its error message. */
function useRun() {
  const [error, setError] = useState<string>("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      const r = await fn();
      setError(r.ok ? "" : (r.error ?? "Something went wrong."));
      const to = r.ok ? r.data?.redirectTo : undefined;
      if (to) {
        if (r.data?.hard) window.location.assign(to);
        else router.push(to);
      } else if (r.ok) refreshSoon(router);
    });
  return { error, pending, run };
}

function ErrorLine({ error }: { error: string }) {
  return error ? <p role="alert" className="rounded-xl bg-danger-tint px-4 py-2.5 text-sm font-semibold text-danger">{error}</p> : null;
}

export function InvitePanel({ circleId, code, open }: { circleId: string; code: string; open: boolean }) {
  const { error, pending, run } = useRun();
  const [copied, setCopied] = useState<"" | "link" | "code">("");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/join/${code}`;

  async function copy(kind: "link" | "code") {
    try {
      await navigator.clipboard.writeText(kind === "link" ? link : code);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border-2 border-ink bg-decisions-tint p-5 text-center text-decisions-text">
        <p className="text-xs font-bold uppercase tracking-widest">Invite code</p>
        <p className="my-2 font-display text-4xl font-extrabold tracking-[0.25em] sm:text-5xl" aria-label={code.split("").join(" ")}>{code}</p>
        <p className="break-all text-sm">{link}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => copy("link")}>{copied === "link" ? "Link copied" : "Copy link"}</Button>
        <Button size="sm" variant="secondary" onClick={() => copy("code")}>{copied === "code" ? "Code copied" : "Copy code"}</Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setInviteOpenAction(circleId, !open))}>
          {open ? "Pause invitations" : "Resume invitations"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Make a new code? The old link and code will stop working.")) run(() => regenerateInviteAction(circleId));
          }}
        >
          New code
        </Button>
      </div>
      <p className="text-sm text-ink-soft">{open ? "Anyone with the link or code can join." : "Invitations are paused. Nobody new can join."}</p>
      <ErrorLine error={error} />
    </div>
  );
}

export interface AdminMember {
  userId: string;
  name: string;
  role: string;
  isSelf: boolean;
}

export function MemberAdminList({ circleId, members }: { circleId: string; members: AdminMember[] }) {
  const { error, pending, run } = useRun();
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-line rounded-card border-2 border-line">
        {members.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center gap-3 p-3">
            <Avatar name={m.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.name} {m.isSelf ? <Tag className="ml-1">You</Tag> : null}</p>
            </div>
            <label className="sr-only" htmlFor={`role-${m.userId}`}>Role for {m.name}</label>
            <Select
              id={`role-${m.userId}`}
              value={m.role}
              disabled={pending}
              onChange={(e) => run(() => setMemberRoleAction(circleId, m.userId, e.target.value))}
              className="h-9 w-auto py-1 text-sm"
            >
              <option value="FOUNDER">Founder</option>
              <option value="MEMBER">Member</option>
            </Select>
            {!m.isSelf ? (
              <Button
                size="sm"
                variant="danger"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(`Remove ${m.name} from this circle?`)) run(() => removeMemberAction(circleId, m.userId));
                }}
              >
                Remove
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <ErrorLine error={error} />
    </div>
  );
}

export function LeaveCircleButton({ circleId }: { circleId: string }) {
  const { error, pending, run } = useRun();
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Leave this circle? You can rejoin with an invite.")) run(() => leaveCircleAction(circleId));
          }}
        >
          Leave circle
        </Button>
      </div>
      <ErrorLine error={error} />
    </div>
  );
}

export function DeleteCircleForm({ circleId, circleName }: { circleId: string; circleName: string }) {
  const [state, action] = useActionState(deleteCircleAction.bind(null, circleId), initialState);
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-4">
      <Field label={`Type "${circleName}" to confirm`} htmlFor="confirmName" error={fieldError(state, "confirmName")}>
        <Input id="confirmName" name="confirmName" autoComplete="off" required />
      </Field>
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="danger" pending="Deleting...">Delete circle for everyone</SubmitButton>
      </div>
    </ActionForm>
  );
}
