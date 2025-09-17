
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = admin.app();

export { app };
