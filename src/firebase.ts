import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  onSnapshot,
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

// ── User helpers ──────────────────────────────────────────────
export const saveUserToDB = async (user: any) => {
  await setDoc(doc(db, "users", user.id), user);
};

export const deleteUserFromDB = async (id: string) => {
  await deleteDoc(doc(db, "users", id));
};

export const getAllUsersFromDB = async (): Promise<any[]> => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => d.data());
};

export const subscribeToUsers = (callback: (users: any[]) => void) => {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const users = snapshot.docs.map((d) => d.data());
    callback(users);
  });
};
