// سكريبت للتحقق من الصور في Firebase
// تشغيل: npx ts-node src/scripts/checkImages.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDWGxOTqKHNEBGdqgLNvqFLhSi_6Wnkts",
  authDomain: "devora-tools.firebaseapp.com",
  projectId: "devora-tools",
  storageBucket: "devora-tools.firebasestorage.app",
  messagingSenderId: "1043234966796",
  appId: "1:1043234966796:web:e0b6c4c9e8b4f3c7e8b4f3",
  measurementId: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkImages() {
  console.log('🔍 Checking images in Firebase...\n');
  
  try {
    const toolsRef = collection(db, 'tools');
    const snapshot = await getDocs(toolsRef);
    
    let totalTools = 0;
    let toolsWithImages = 0;
    let toolsWithoutImages = 0;
    const missingImages: string[] = [];
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalTools++;
      
      // Check different possible field names
      const imageUrl = data.imageUrl || data.image || data.logo || data.icon || data.img;
      
      if (imageUrl) {
        toolsWithImages++;
        console.log(`✅ ${data.name}: ${imageUrl}`);
      } else {
        toolsWithoutImages++;
        missingImages.push(data.name);
        console.log(`❌ ${data.name}: No image`);
      }
      
      // Log all fields to see what's available
      if (!imageUrl) {
        console.log('   Available fields:', Object.keys(data).join(', '));
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total tools: ${totalTools}`);
    console.log(`Tools with images: ${toolsWithImages}`);
    console.log(`Tools without images: ${toolsWithoutImages}`);
    
    if (missingImages.length > 0) {
      console.log('\n⚠️ Tools missing images:');
      missingImages.forEach(name => console.log(`  - ${name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkImages();
