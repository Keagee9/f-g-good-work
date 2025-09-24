
import * as admin from 'firebase-admin';

// This is a "singleton" pattern. It ensures that we only initialize
// the Firebase Admin SDK once, preventing errors from trying to
// re-initialize it on every server-side render in Next.js.
function getAdminApp(): admin.app.App {
  // If the app is already initialized, return the existing instance.
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  
  // If the app is not initialized, create a new instance and return it.
  // The SDK will automatically infer credentials from the environment.
  admin.initializeApp({
    projectId: 'studio-2472646169-beca8',
  });
  return admin.apps[0]!;
}

// A helper function to get the Firestore database instance.
export function getDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}
