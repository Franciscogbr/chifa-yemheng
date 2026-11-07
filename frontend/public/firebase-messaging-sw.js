self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (error) {
    console.error('No se pudo interpretar la notificación push.', error);
    return;
  }
  const notification = payload.notification ?? payload.data ?? {};
  const title = notification.title ?? 'Actualización de delivery';
  const options = {
    body: notification.body ?? '',
    data: payload.data ?? {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/repartidor/mis-entregas'));
});
