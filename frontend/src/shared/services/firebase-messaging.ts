import { getApps, initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

export function getFirebaseMessaging() {
  const {
    VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_AUTH_DOMAIN,
  } = import.meta.env;
  if (!VITE_FIREBASE_API_KEY || !VITE_FIREBASE_PROJECT_ID || !VITE_FIREBASE_MESSAGING_SENDER_ID || !VITE_FIREBASE_APP_ID) {
    throw new Error('FIREBASE_WEB_CONFIG_MISSING');
  }

  const config = {
    apiKey: VITE_FIREBASE_API_KEY,
    projectId: VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
    ...(VITE_FIREBASE_AUTH_DOMAIN ? { authDomain: VITE_FIREBASE_AUTH_DOMAIN } : {}),
  };
  const app = getApps().find((candidate) => candidate.name === 'chifa-delivery') ??
    initializeApp(config, 'chifa-delivery');
  return getMessaging(app);
}
