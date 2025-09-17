
import * as admin from 'firebase-admin';

// This ensures we initialize the app only once, which is crucial in serverless environments.
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = admin.app();

export { app };
