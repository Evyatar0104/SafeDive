const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const imagesDir = path.join(__dirname, '../public/images/articles');

const missing = [
    { id: 'ft-web3', term: 'Blockchain' },
    { id: 'ft-brain-computer', term: 'Brain%E2%80%93computer_interface' },
    { id: 'hiw-battery', term: 'Lithium-ion_battery' },
    { id: 'eb-space-tourism', term: 'Space_tourism' },
    { id: 'eb-astrobiology', term: 'Astrobiology' },
    { id: 'eb-artificial-islands', term: 'Artificial_island' },
    { id: 'eb-carbon-capture', term: 'Carbon_capture_and_storage' },
    { id: 'eb-dyson-sphere', term: 'Dyson_sphere' },
];

const downloadImage = async (url, filepath) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'SafeZoneApp/1.0 (Contact: local@dev.com)'
        }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const fileStream = fs.createWriteStream(filepath);
    await finished(Readable.fromWeb(response.body).pipe(fileStream));
};

const fetchWikiImage = async (title) => {
    // 1. Get the page info and main image filename
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=800`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SafeZoneApp/1.0' } });
    const data = await res.json();

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1' || !pages[pageId].thumbnail) {
        throw new Error("No image found for " + title);
    }

    return pages[pageId].thumbnail.source;
};

const run = async () => {
    for (const item of missing) {
        try {
            console.log(`Fetching wiki image for ${item.id} (${item.term})...`);
            const imgUrl = await fetchWikiImage(item.term);
            const filepath = path.join(imagesDir, `${item.id}.jpg`);
            await downloadImage(imgUrl, filepath);
            console.log(`✅ Saved ${item.id}.jpg`);
        } catch (err) {
            console.error(`❌ Failed for ${item.id}:`, err.message);
        }
    }
};

run();
