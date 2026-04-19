export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, body: string) {
  // Always try to send - request permission if not granted yet
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/akatsuki-logo.png",
        badge: "/akatsuki-logo.png",
        tag: "bloody-hell-notification",
      });
    } catch {
      // Fallback for environments that don't support Notification constructor
    }
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/akatsuki-logo.png",
            badge: "/akatsuki-logo.png",
          });
        } catch {
          // silent
        }
      }
    });
  }
}

export function registerServiceWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("ServiceWorker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  }
}
