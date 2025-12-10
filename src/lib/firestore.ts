// Firestore database utilities
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    WhereFilterOp,
    QueryConstraint,
    DocumentData,
    onSnapshot,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Generic type for database documents
export interface DbDocument extends DocumentData {
    id?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Add a document to a collection
export const addDocument = async <T extends DocumentData>(
    collectionName: string,
    data: T
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to add document');
    }
};

// Set a document with a specific ID
export const setDocument = async <T extends DocumentData>(
    collectionName: string,
    documentId: string,
    data: T,
    merge = true
): Promise<void> => {
    try {
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
            ...(merge ? {} : { createdAt: serverTimestamp() })
        }, { merge });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to set document');
    }
};

// Get a single document
export const getDocument = async <T extends DbDocument>(
    collectionName: string,
    documentId: string
): Promise<T | null> => {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to get document');
    }
};

// Get all documents from a collection
export const getDocuments = async <T extends DbDocument>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> => {
    try {
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    } catch (error: any) {
        throw new Error(error.message || 'Failed to get documents');
    }
};

// Update a document
export const updateDocument = async <T extends Partial<DocumentData>>(
    collectionName: string,
    documentId: string,
    data: T
): Promise<void> => {
    try {
        const docRef = doc(db, collectionName, documentId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update document');
    }
};

// Delete a document
export const deleteDocument = async (
    collectionName: string,
    documentId: string
): Promise<void> => {
    try {
        const docRef = doc(db, collectionName, documentId);
        await deleteDoc(docRef);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete document');
    }
};

// Subscribe to real-time updates for a document
export const subscribeToDocument = <T extends DbDocument>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
) => {
    const docRef = doc(db, collectionName, documentId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
            callback(null);
        }
    });
};

// Subscribe to real-time updates for a collection
export const subscribeToCollection = <T extends DbDocument>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
) => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
        callback(documents);
    });
};

// Query helpers
export { where, orderBy, limit };
export type { WhereFilterOp, QueryConstraint };
