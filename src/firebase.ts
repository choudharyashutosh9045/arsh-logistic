import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOzfp6TmdbYny1WpEoN0vlXVx1QFQcNRU",
  authDomain: "arsh-logistic.firebaseapp.com",
  projectId: "arsh-logistic",
  storageBucket: "arsh-logistic.firebasestorage.app",
  messagingSenderId: "518042851582",
  appId: "1:518042851582:web:0aefbc658d9d6512bf2daf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Generic save / delete ─────────────────────────────────────
export const saveDoc = async (collName: string, item: any) => {
  await setDoc(doc(db, collName, String(item.id)), item);
};

export const deleteDocById = async (collName: string, id: string) => {
  await deleteDoc(doc(db, collName, id));
};

// ── Real-time listener ────────────────────────────────────────
export const subscribeToCollection = (
  collName: string,
  callback: (items: any[]) => void
) => {
  return onSnapshot(collection(db, collName), (snapshot) => {
    callback(snapshot.docs.map((d) => d.data()));
  });
};

// ── Seed collection only ONCE ever (uses a flag doc in Firestore) ────
export const seedCollection = async (collName: string, items: any[]) => {
  const flagRef = doc(db, '_seeded', collName);
  try {
    const flagSnap = await getDoc(flagRef);
    if (flagSnap.exists()) return; // Already seeded — never seed again
  } catch {
    return;
  }
  // First time only — seed the data
  if (items.length > 0) {
    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.set(doc(db, collName, String(item.id)), item);
    });
    // Mark as seeded
    batch.set(flagRef, { seededAt: new Date().toISOString() });
    await batch.commit();
  }
};
