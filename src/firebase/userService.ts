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
): Promise<UserProfile> {
    const ref = doc(db, "users", userId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        await setDoc(ref, {
            email,
            role: "parent",
            familyId: userId,
            createdAt: serverTimestamp(),
        });

        return {
            uid: userId,
            email,
            role: "parent",
            familyId: userId,
        };
    }

    const data = snapshot.data();

    return {
        uid: userId,
        email: data.email ?? email,
        role: data.role ?? "kid",
        familyId: data.familyId ?? userId,
    };
}