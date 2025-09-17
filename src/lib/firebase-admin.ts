
import * as admin from 'firebase-admin';

// This prevents us from initializing the app more than once
const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

export { app };
