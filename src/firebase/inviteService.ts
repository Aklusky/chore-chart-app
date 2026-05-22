import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

export type InviteRole = "kid" | "parent";

export type Invite = {
    code: string;
    familyId: string;
    role: InviteRole;
    status: "pending" | "accepted";
    createdAt?: unknown;
    acceptedBy?: string;
};

function createInviteCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createInvite(familyId: string, role: InviteRole) {
    const code = createInviteCode();

    await setDoc(doc(db, "invites", code), {
        code,
        familyId,
        role,
        status: "pending",
        createdAt: serverTimestamp(),
    });

    return code;
}

export async function acceptInvite(
    code: string,
    userId: string,
    email: string
) {
    const inviteRef = doc(db, "invites", code.trim().toUpperCase());
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
        throw new Error("Invite not found.");
    }

    const invite = inviteSnap.data() as Invite;

    if (invite.status !== "pending") {
        throw new Error("Invite has already been used.");
    }

    await setDoc(doc(db, "users", userId), {
        email,
        role: invite.role,
        familyId: invite.familyId,
        joinedAt: serverTimestamp(),
    });

    await updateDoc(inviteRef, {
        status: "accepted",
        acceptedBy: userId,
        acceptedAt: serverTimestamp(),
    });

    return invite.familyId;
}