import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const firebaseConfig = {
  apiKey: "AIzaSyDgTnOb1Wiu-964QaV2Q1oxLYgWLJkqFsQ",
  authDomain: "auth.tolzy.me",
  projectId: "zakerly0",
  storageBucket: "zakerly0.firebasestorage.app",
  messagingSenderId: "718838819739",
  appId: "1:718838819739:web:fb0c10967caeaee59d4f3e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportAllTools() {
  console.log('🔄 Fetching all tools from Firestore...');
  const firestoreTools = [];
  try {
    const snap = await getDocs(collection(db, 'tools'));
    snap.forEach((d) => {
      firestoreTools.push({
        ...d.data(),
        id: d.id
      });
    });
    console.log(`✅ Fetched ${firestoreTools.length} tools from Firestore.`);
  } catch (err) {
    console.warn('⚠️ Could not fetch from Firestore (or network issue):', err.message);
  }

  // Load tools from web-development-tools.json
  const localToolsPath = path.join(rootDir, 'data', 'web-development-tools.json');
  let localTools = [];
  if (fs.existsSync(localToolsPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(localToolsPath, 'utf8'));
      localTools = Array.isArray(raw) ? raw : (raw.tools || []);
      console.log(`✅ Loaded ${localTools.length} tools from local JSON.`);
    } catch (e) {
      console.error('Error reading local JSON:', e.message);
    }
  }

  // Merge and deduplicate
  const seenIds = new Set();
  const seenNames = new Set();
  const mergedTools = [];

  const addTool = (tool) => {
    if (!tool || !tool.name) return;
    const normName = String(tool.name).toLowerCase().trim();
    const id = String(tool.id || normName.replace(/[^a-z0-9]+/g, '-'));

    if (seenNames.has(normName) || (id && seenIds.has(id))) {
      return;
    }

    seenNames.add(normName);
    seenIds.add(id);

    mergedTools.push({
      id: id,
      name: tool.name,
      description: tool.description || '',
      longDescription: tool.longDescription || tool.description || '',
      category: tool.category || 'General',
      subcategory: tool.subcategory || [],
      tags: Array.isArray(tool.tags) ? tool.tags : [],
      url: tool.url || tool.link || '#',
      imageUrl: tool.imageUrl || tool.image || '',
      pricing: tool.pricing || 'Freemium',
      features: Array.isArray(tool.features) ? tool.features : [],
      pros: Array.isArray(tool.pros) ? tool.pros : [],
      cons: Array.isArray(tool.cons) ? tool.cons : [],
      rating: parseFloat(tool.rating) || 4.5,
      reviewCount: parseInt(tool.reviewCount) || 10,
      isNew: Boolean(tool.isNew),
      isFeatured: Boolean(tool.isFeatured),
      isPopular: Boolean(tool.isPopular),
      status: tool.status || 'approved'
    });
  };

  // Add firestore tools first (they are authoritative)
  firestoreTools.forEach(addTool);
  // Then add local tools
  localTools.forEach(addTool);

  console.log(`🎉 Total unique consolidated tools: ${mergedTools.length}`);

  // Sort alphabetically by name
  mergedTools.sort((a, b) => a.name.localeCompare(b.name));

  // Output file 1: data/all-tools.json
  const outPath1 = path.join(rootDir, 'data', 'all-tools.json');
  fs.writeFileSync(outPath1, JSON.stringify({
    total: mergedTools.length,
    exportedAt: new Date().toISOString(),
    tools: mergedTools
  }, null, 2), 'utf8');
  console.log(`📁 Saved to: ${outPath1}`);

  // Output file 2: public/all-tools.json (for easy direct download / admin use)
  const outPath2 = path.join(rootDir, 'public', 'all-tools.json');
  fs.writeFileSync(outPath2, JSON.stringify({
    total: mergedTools.length,
    exportedAt: new Date().toISOString(),
    tools: mergedTools
  }, null, 2), 'utf8');
  console.log(`📁 Saved to: ${outPath2}`);
}

exportAllTools().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
