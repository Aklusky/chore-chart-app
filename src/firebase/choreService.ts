import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";
import type { Chore } from "@/types/chore";
import type { Kid } from "@/types/kids";

function kidsCollection(familyId: string) {
    return collection(db, "families", familyId, "kids");
}

function choresCollection(familyId: string) {
    return collection(db, "families", familyId, "chores");
}

export async function getKids(familyId: string): Promise<Kid[]> {
    const snapshot = await getDocs(
        query(kidsCollection(familyId), orderBy("name"))
    );

    return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: docSnap.data().name,
    }));
}

export async function addKid(
    familyId: string,
    name: string
): Promise<Kid> {
    const docRef = await addDoc(kidsCollection(familyId), {
        name,
        createdAt: serverTimestamp(),
    });

    return {
        id: docRef.id,
        name,
    };
}

export async function deleteKid(
    familyId: string,
    kidId: string
): Promise<void> {
    await deleteDoc(doc(db, "families", familyId, "kids", kidId));
}

export async function getChores(familyId: string): Promise<Chore[]> {
    const snapshot = await getDocs(
        query(choresCollection(familyId), orderBy("title"))
    );

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
            id: docSnap.id,
            title: data.title,
            frequency: data.frequency,
            scheduledDay: data.scheduledDay,
            rotationOffset: data.rotationOffset ?? 0,
        };
    });
}

export async function addChore(
    familyId: string,
    chore: Omit<Chore, "id">
): Promise<Chore> {
    const docRef = await addDoc(choresCollection(familyId), {
        ...chore,
        createdAt: serverTimestamp(),
    });

    return {
        id: docRef.id,
        ...chore,
    };
}

export async function deleteChore(
    familyId: string,
    choreId: string
): Promise<void> {
    await deleteDoc(doc(db, "families", familyId, "chores", choreId));
}