importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCyrZ6cY1R0sp-5a6Aoz9Mg5XTDBqXQQ5w",
  authDomain: "jodohmu-production.firebaseapp.com",
  projectId: "jodohmu-production",
  storageBucket: "jodohmu-production.appspot.com",
  messagingSenderId: "460634545907",
  appId: "1:460634545907:web:fac58c25cb1b352448e186",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title ?? 'Jodohmu';
  const body  = payload.notification?.body  ?? '';
  self.registration.showNotification(title, {
    body,
    icon:  '/jodohmu-logo.png',
    badge: '/jodohmu-logo.png',
  });
});
