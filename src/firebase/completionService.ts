import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function getCompletedChores(
    familyId: string,
    date: string
): Promise<string[]> {
    const docRef = doc(db, "families", familyId, "completedChores", date);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return [];

    return snapshot.data().choreIds ?? [];
}

export async function saveCompletedChores(
    familyId: string,
    date: string,
    choreIds: string[]
): Promise<void> {
    await setDoc(doc(db, "families", familyId, "completedChores", date), {
        choreIds,
        updatedAt: Date.now(),
    });
}