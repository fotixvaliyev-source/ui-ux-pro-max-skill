import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { ForbiddenError, UserError, assertAccess, membershipOrThrow } from "@/server/access";
import { createCircle, deleteCircle, joinCircleByCode, leaveCircle, previewInvite, regenerateInviteCode, removeMember, setInviteOpen, setMemberRole, updateCircle } from "@/server/services/circles";
import { INVITE_ALPHABET, generateInviteCode } from "@/server/services/invites";
import { inviteCodeSchema } from "@/server/validation/circle";
import { makeUser } from "./helpers";

const input = { name: "Tuesday Founders", purpose: "Help each other hit one goal per quarter.", cadence: "weekly" as const, accent: "indigo" as const };

describe("invite codes", () => {
  it("are 8 characters from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(8);
      for (const ch of code) expect(INVITE_ALPHABET).toContain(ch);
    }
    expect(INVITE_ALPHABET).not.toMatch(/[01OIL]/);
  });
  it("normalizes user input", () => {
    expect(inviteCodeSchema.parse(" k7m2-qxp9 ")).toBe("K7M2QXP9");
    expect(inviteCodeSchema.safeParse("short").success).toBe(false);
  });
});

describe("authorization", () => {
  it("assertAccess rejects missing memberships and non-founders", () => {
    expect(() => assertAccess(null)).toThrow(ForbiddenError);
    const member = { id: "m", circleId: "c", userId: "u", role: "MEMBER", workingOn: null, canHelpWith: null, lookingFor: null, joinedAt: new Date() };
    expect(() => assertAccess(member, { founder: true })).toThrow("Only a Founder");
    expect(assertAccess({ ...member, role: "FOUNDER" }, { founder: true }).role).toBe("FOUNDER");
  });

  it("non-members cannot read or change a circle", async () => {
    const founder = await makeUser();
    const outsider = await makeUser();
    const circle = await createCircle(founder.id, input);
    await expect(membershipOrThrow(outsider.id, circle.id)).rejects.toThrow(ForbiddenError);
    await expect(updateCircle(outsider.id, circle.id, input)).rejects.toThrow(ForbiddenError);
    await expect(deleteCircle(outsider.id, circle.id, input.name)).rejects.toThrow(ForbiddenError);
    await expect(regenerateInviteCode(outsider.id, circle.id)).rejects.toThrow(ForbiddenError);
  });

  it("members cannot do Founder-only things", async () => {
    const founder = await makeUser();
    const member = await makeUser();
    const other = await makeUser();
    const circle = await createCircle(founder.id, input);
    const code = (await db.circle.findUniqueOrThrow({ where: { id: circle.id } })).inviteCode;
    await joinCircleByCode(member.id, code);
    await joinCircleByCode(other.id, code);
    await expect(updateCircle(member.id, circle.id, input)).rejects.toThrow("Only a Founder");
    await expect(removeMember(member.id, circle.id, other.id)).rejects.toThrow("Only a Founder");
    await expect(setMemberRole(member.id, circle.id, other.id, "FOUNDER")).rejects.toThrow("Only a Founder");
    await expect(setInviteOpen(member.id, circle.id, false)).rejects.toThrow("Only a Founder");
    await expect(deleteCircle(member.id, circle.id, input.name)).rejects.toThrow("Only a Founder");
  });
});

describe("circle lifecycle", () => {
  it("creating a circle makes a Founder, a code and the default board", async () => {
    const user = await makeUser();
    const { id } = await createCircle(user.id, input);
    const circle = await db.circle.findUniqueOrThrow({ where: { id }, include: { members: true, board: { include: { columns: { orderBy: { position: "asc" } } } } } });
    expect(circle.members).toHaveLength(1);
    expect(circle.members[0]?.role).toBe("FOUNDER");
    expect(circle.inviteCode).toHaveLength(8);
    expect(circle.board?.columns.map((c) => c.name)).toEqual(["Backlog", "In progress", "Review", "Done"]);
  });

  it("joining works once, is idempotent, and respects paused invites", async () => {
    const founder = await makeUser();
    const joiner = await makeUser();
    const late = await makeUser();
    const { id } = await createCircle(founder.id, input);
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id } });
    await joinCircleByCode(joiner.id, inviteCode.toLowerCase());
    await joinCircleByCode(joiner.id, inviteCode);
    expect(await db.membership.count({ where: { circleId: id } })).toBe(2);
    await setInviteOpen(founder.id, id, false);
    await expect(joinCircleByCode(late.id, inviteCode)).rejects.toThrow(UserError);
    await expect(joinCircleByCode(late.id, "ZZZZZZZZ")).rejects.toThrow("did not match");
  });

  it("previewInvite shows only the basics and returns null for bad codes", async () => {
    const founder = await makeUser();
    const { id } = await createCircle(founder.id, input);
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id } });
    const p = await previewInvite(inviteCode);
    expect(p?.name).toBe(input.name);
    expect(p?.memberCount).toBe(1);
    expect(await previewInvite("nope")).toBeNull();
  });

  it("regenerating the code invalidates the old one", async () => {
    const founder = await makeUser();
    const joiner = await makeUser();
    const { id } = await createCircle(founder.id, input);
    const { inviteCode: oldCode } = await db.circle.findUniqueOrThrow({ where: { id } });
    const fresh = await regenerateInviteCode(founder.id, id);
    expect(fresh).not.toBe(oldCode);
    await expect(joinCircleByCode(joiner.id, oldCode)).rejects.toThrow("did not match");
    await joinCircleByCode(joiner.id, fresh);
  });

  it("always keeps at least one Founder", async () => {
    const founder = await makeUser();
    const member = await makeUser();
    const { id } = await createCircle(founder.id, input);
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id } });
    await joinCircleByCode(member.id, inviteCode);
    await expect(setMemberRole(founder.id, id, founder.id, "MEMBER")).rejects.toThrow("at least one Founder");
    await expect(leaveCircle(founder.id, id)).rejects.toThrow("someone else a Founder");
    await setMemberRole(founder.id, id, member.id, "FOUNDER");
    await leaveCircle(founder.id, id);
    expect(await db.membership.count({ where: { circleId: id } })).toBe(1);
  });

  it("a Founder can remove a member but not themselves", async () => {
    const founder = await makeUser();
    const member = await makeUser();
    const { id } = await createCircle(founder.id, input);
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id } });
    await joinCircleByCode(member.id, inviteCode);
    await expect(removeMember(founder.id, id, founder.id)).rejects.toThrow("Leave circle");
    await removeMember(founder.id, id, member.id);
    await expect(membershipOrThrow(member.id, id)).rejects.toThrow(ForbiddenError);
  });

  it("deleting requires the exact name and removes everything", async () => {
    const founder = await makeUser();
    const { id } = await createCircle(founder.id, input);
    await expect(deleteCircle(founder.id, id, "wrong")).rejects.toThrow("exactly");
    await deleteCircle(founder.id, id, input.name);
    expect(await db.circle.findUnique({ where: { id } })).toBeNull();
    expect(await db.board.count({ where: { circleId: id } })).toBe(0);
  });
});
