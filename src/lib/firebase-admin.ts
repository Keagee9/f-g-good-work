import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// This function ensures we initialize the app only once, which is crucial in serverless environments.
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  admin.initializeApp();
  return admin.apps[0]!;
}

export function getDb() {
  return getFirestore(getAdminApp());
}
