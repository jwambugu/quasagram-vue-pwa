require("dotenv").config();

const admin = require("firebase-admin");

// const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  storageBucket: "quasagram-e0c85.appspot.com",
});

console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"));

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
