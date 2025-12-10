// Authentication utilities for Firebase
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User,
    UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Sign up with email and password
export const signUp = async (
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
    }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in');
    }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in with Google');
    }
};

// Sign out
export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign out');
    }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send password reset email');
    }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};
