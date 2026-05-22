import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export type UserRole = "parent" | "kid";

export type UserProfile = {
    uid: string;
    email: string;
    role: UserRole;
    familyId: string;
};

export async function getUserProfile(
    userId: string,
    email: string
): Promise<UserProfile | null> {
    const ref = doc(db, "users", userId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return null;
    }

    const data = snapshot.data();

    return {
        uid: userId,
        email: data.email ?? email,
        role: data.role ?? "kid",
        familyId: data.familyId,
    };
}

export async function createParentProfile(userId: string, email: string) {
    await setDoc(doc(db, "users", userId), {
        email,
        role: "parent",
        familyId: userId,
        createdAt: serverTimestamp(),
    });

    return {
        uid: userId,
        email,
        role: "parent" as const,
        familyId: userId,
    };
}