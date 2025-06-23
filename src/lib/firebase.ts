import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import type { Student, StudentSearchFilters, Department, Course } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (!getApps().length) initializeApp(firebaseConfig);

const db = getFirestore();

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const studentsService = {
  async createStudent(student: Omit<Student, "id" | "avatarUrl">, avatarFile?: File): Promise<Student> {
    let avatarUrl = "";
    if (avatarFile) {
      avatarUrl = await fileToBase64(avatarFile);
    }
    const docRef = await addDoc(collection(db, "students"), { ...student, avatarUrl });
    return {
      id: docRef.id,
      name: student.name,
      admissionYear: student.admissionYear,
      department: student.department,
      courses: student.courses,
      avatarUrl,
    };
  },
  async searchStudents(filters: StudentSearchFilters = {}): Promise<Student[]> {
    let q = collection(db, "students");
    let qRef: any = q;
    if (filters.name) {
      qRef = query(qRef, where("name", "==", filters.name));
    }
    if (filters.admissionYear) {
      qRef = query(qRef, where("admissionYear", "==", filters.admissionYear));
    }
    if (filters.department) {
      qRef = query(qRef, where("department", "==", filters.department));
    }
    if (filters.courses && filters.courses.length > 0) {
      qRef = query(qRef, where("courses", "array-contains-any", filters.courses));
    }
    const snapshot = await getDocs(qRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Student;
      return {
        ...data,
        id: doc.id,
        name: data.name,
        admissionYear: data.admissionYear,
        department: data.department,
        courses: data.courses,
        avatarUrl: data.avatarUrl,
      };
    });
  },
  async getStudentById(id: string): Promise<Student | null> {
    const q = query(collection(db, "students"), where("id", "==", id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data() as Student;
    return {
      ...data,
      id: doc.id,
      name: data.name,
      admissionYear: data.admissionYear,
      department: data.department,
      courses: data.courses,
      avatarUrl: data.avatarUrl,
    };
  },
  async getStudentByDocId(docId: string): Promise<Student | null> {
    const docRef = doc(db, "students", docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as Student;
    return {
      ...data,
      id: snap.id,
      name: data.name,
      admissionYear: data.admissionYear,
      department: data.department,
      courses: data.courses,
      avatarUrl: data.avatarUrl,
    };
  },
}; 