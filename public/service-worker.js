self.addEventListener("push", function (event) {
  let data = { title: "𝐁𝐑𝐄𝐀𝐊𝐈𝐍𝐆 𝐍𝐄𝐖𝐒", body: "Check the dashboard for an urgent update!" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/akatsuki-logo.png",
    badge: "/akatsuki-logo.png",
    data: { url: self.location.origin },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    }),
  );
});
