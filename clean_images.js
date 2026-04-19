
import fs from 'fs';

const filePath = String.raw`c:\Users\Mahmoud.M.Moussa\Desktop\Tolzy_Team\src\scripts\rag-manager\data\web-development-tools.json`;

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    if (json.tools && Array.isArray(json.tools)) {
        json.tools.forEach(tool => {
            tool.imageUrl = "";
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log('Successfully cleaned imageUrls in web-development-tools.json');
} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
