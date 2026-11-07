import { useCallback, useEffect, useState } from 'react';
import { deleteToken, getToken, isSupported, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
import { api } from '../services/api-client';
import { getFirebaseMessaging } from '../services/firebase-messaging';

export function usePushToken() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  useEffect(() => {
    if (!messaging) return;
    return onMessage(messaging, (payload) => {
      if (Notification.permission !== 'granted') return;
      const title = payload.notification?.title ?? 'Actualización de entrega';
      new Notification(title, {
        body: payload.notification?.body ?? '',
      });
    });
  }, [messaging]);

  const registerToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        throw new Error('PUSH_NOT_SUPPORTED');
      }
      if (!(await isSupported())) throw new Error('PUSH_NOT_SUPPORTED');
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) throw new Error('FIREBASE_VAPID_KEY_MISSING');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('PUSH_PERMISSION_NOT_GRANTED');

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const firebaseMessaging = getFirebaseMessaging();
      const token = await getToken(firebaseMessaging, { vapidKey, serviceWorkerRegistration: registration });
      if (!token) throw new Error('FCM_TOKEN_EMPTY');

      await api.registrarPushToken(token, 'web');
      setMessaging(firebaseMessaging);
      setRegistered(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'PUSH_REGISTER_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  const unregisterToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await isSupported())) throw new Error('PUSH_NOT_SUPPORTED');
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) throw new Error('FIREBASE_VAPID_KEY_MISSING');
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      const firebaseMessaging = getFirebaseMessaging();
      const token = await getToken(firebaseMessaging, {
        vapidKey,
        ...(registration ? { serviceWorkerRegistration: registration } : {}),
      });
      if (token) await api.eliminarPushToken(token);
      await deleteToken(firebaseMessaging);
      setMessaging(null);
      setRegistered(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'PUSH_UNREGISTER_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  return { registered, loading, error, registerToken, unregisterToken };
}
