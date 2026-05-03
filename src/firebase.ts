import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
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

// ── Seed collection only if empty (first launch) ─────────────
export const seedCollection = async (collName: string, items: any[]) => {
  const snapshot = await getDocs(collection(db, collName));
  if (snapshot.empty && items.length > 0) {
    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.set(doc(db, collName, String(item.id)), item);
    });
    await batch.commit();
  }
};
