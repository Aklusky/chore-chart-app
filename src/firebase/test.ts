import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function testFirestore() {
    console.log("testFirestore started");
    console.log("Firebase project:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

    try {
        await setDoc(doc(db, "kids", "test-kid"), {
            name: "Test Kid",
            createdAt: Date.now(),
        });

        console.log("Saved test-kid");
        alert("Saved to Firestore!");
    } catch (error) {
        console.error("Firestore save failed:", error);
        alert("Firestore failed. Check console.");
    }
}