import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, '\n')
  : '';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
}

const db = admin.firestore();

async function inspect() {
  console.log('Fetching changelog collection...');
  const snapshot = await db.collection('changelog').get();
  console.log(`Found ${snapshot.size} documents.`);
  snapshot.docs.forEach(doc => {
    console.log(`ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log('------------------------------------');
  });
}

inspect().catch(console.error);
