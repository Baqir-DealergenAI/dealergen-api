import admin from "firebase-admin";

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = require("@/config/bidbot-385f2-7237546c1cc7.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

    return admin;
};

export const adminSDK = initializeFirebase();
