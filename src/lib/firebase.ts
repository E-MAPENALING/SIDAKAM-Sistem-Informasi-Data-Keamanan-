import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  SecurityStats, 
  IncidentReport, 
  DailyJournalEntry, 
  WBPRecord, 
  ViolationRecord, 
  RupamShift,
  SecurityOfficer 
} from '../types';
import { 
  INITIAL_SECURITY_STATS, 
  INITIAL_INCIDENTS, 
  INITIAL_DAILY_JOURNAL, 
  INITIAL_WBP_DATA, 
  INITIAL_VIOLATIONS, 
  INITIAL_RUPAM_SHIFTS,
  INITIAL_OFFICERS 
} from '../data/mockData';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection Names
export const COLLECTIONS = {
  STATS: 'security_stats',
  JOURNAL: 'journal_entries',
  INCIDENTS: 'incidents',
  WBP: 'wbp_records',
  VIOLATIONS: 'violations',
  SHIFTS: 'rupam_shifts',
  OFFICERS: 'security_officers',
  SETTINGS: 'app_settings',
};

// --- Seed Initial Data if Collections are Empty ---
export async function seedInitialDataIfEmpty() {
  try {
    // Check Stats
    const statsDocRef = doc(db, COLLECTIONS.STATS, 'current');
    
    // Check Incidents
    const incSnapshot = await getDocs(collection(db, COLLECTIONS.INCIDENTS));
    if (incSnapshot.empty) {
      const batch = writeBatch(db);
      // Set Stats
      batch.set(statsDocRef, INITIAL_SECURITY_STATS);
      // Seed Incidents
      INITIAL_INCIDENTS.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.INCIDENTS, item.id), item);
      });
      // Seed Journal
      INITIAL_DAILY_JOURNAL.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.JOURNAL, item.id), item);
      });
      // Seed WBP
      INITIAL_WBP_DATA.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.WBP, item.id), item);
      });
      // Seed Violations
      INITIAL_VIOLATIONS.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.VIOLATIONS, item.id), item);
      });
      // Seed Shifts
      INITIAL_RUPAM_SHIFTS.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.SHIFTS, item.id), item);
      });
      // Seed Officers
      INITIAL_OFFICERS.forEach((item) => {
        batch.set(doc(db, COLLECTIONS.OFFICERS, item.id), item);
      });

      await batch.commit();
      console.log('✅ Firebase initialized with seed data successfully!');
    }
  } catch (err) {
    console.error('Error seeding Firebase initial data:', err);
  }
}

// --- Realtime Listeners ---

export function subscribeToStats(onUpdate: (stats: SecurityStats) => void) {
  const docRef = doc(db, COLLECTIONS.STATS, 'current');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as SecurityStats);
    } else {
      // Create if missing
      setDoc(docRef, INITIAL_SECURITY_STATS);
      onUpdate(INITIAL_SECURITY_STATS);
    }
  }, (error) => {
    console.error('Error subscribing to stats:', error);
  });
}

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string, 
  onUpdate: (data: T[]) => void,
  fallbackInitial: T[]
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty && fallbackInitial.length > 0) {
      // Automatically seed initial data to Firestore so all connected clients sync
      const batch = writeBatch(db);
      fallbackInitial.forEach((item) => {
        batch.set(doc(db, collectionName, item.id), item);
      });
      batch.commit().catch((err) => console.error(`Error auto seeding ${collectionName}:`, err));
      onUpdate(fallbackInitial);
    } else {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as T[];
      onUpdate(list);
    }
  }, (error) => {
    console.error(`Error subscribing to ${collectionName}:`, error);
  });
}

// --- Sync Helpers to Write to Cloud Firestore ---

export async function saveStatsToCloud(stats: SecurityStats) {
  try {
    await setDoc(doc(db, COLLECTIONS.STATS, 'current'), stats, { merge: true });
  } catch (err) {
    console.error('Failed to save stats to cloud:', err);
  }
}

export async function saveDocumentToCloud<T extends { id: string }>(collectionName: string, data: T) {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, collectionName, cleanData.id), cleanData, { merge: true });
  } catch (err) {
    console.error(`Failed to save document in ${collectionName}:`, err);
  }
}

export async function deleteDocumentFromCloud(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Failed to delete document ${id} from ${collectionName}:`, err);
  }
}

export async function batchSaveWbpListToCloud(wbpList: WBPRecord[]) {
  try {
    const batch = writeBatch(db);
    wbpList.forEach((wbp) => {
      batch.set(doc(db, COLLECTIONS.WBP, wbp.id), wbp, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch save WBP list:', err);
  }
}
