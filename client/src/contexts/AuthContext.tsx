import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  async function signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
    setIsNewUser(isNewUser);
    if (isNewUser) {
      // Add user to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: userCredential.user.metadata.creationTime,
      });
    }
    return isNewUser;
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
      setIsNewUser(isNewUser);
      return isNewUser;
    });
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
    setIsNewUser(isNewUser);
    if (isNewUser) {
      // Add user to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: userCredential.user.metadata.creationTime,
      });
    }
    return isNewUser;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      // Reset isNewUser when user logs out
      if (!user) {
        setIsNewUser(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading,
    isNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
