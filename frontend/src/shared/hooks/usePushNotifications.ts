import { useEffect, useState } from 'react';
import { isSupported, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../services/firebase-messaging';

export interface PushNotificationOptions {
  onNewAssignment?: (deliveryId: number) => void;
  onEnRuta?: (deliveryId: number) => void;
  onSupervisorMessage?: (message: string) => void;
}

export function usePushNotifications(options: PushNotificationOptions = {}) {
  const { onNewAssignment, onEnRuta, onSupervisorMessage } = options;
  const [tokenRegistrado, setTokenRegistrado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const listen = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }
      if (!(await isSupported()) || !active) return;
      const messaging = getFirebaseMessaging();
      unsubscribe = onMessage(messaging, (payload) => {
        if (!active) return;
        const type = payload.data?.type;
        const deliveryId = Number(payload.data?.deliveryId);
        if (type === 'NUEVA_ASIGNACION' && Number.isInteger(deliveryId)) onNewAssignment?.(deliveryId);
        if (type === 'EN_RUTA' && Number.isInteger(deliveryId)) onEnRuta?.(deliveryId);
        if (type === 'MENSAJE_SUPERVISOR' && payload.data?.message) {
          onSupervisorMessage?.(payload.data.message);
        }
      });
      if (active) {
        setTokenRegistrado(true);
        setError(null);
      }
    };

    void listen().catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : 'PUSH_LISTENER_FAILED');
      setTokenRegistrado(false);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [onEnRuta, onNewAssignment, onSupervisorMessage]);

  return { tokenRegistrado, error };
}
