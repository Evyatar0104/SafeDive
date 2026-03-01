const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const articlesDir = path.join(__dirname, '../src/data/articles');
const imagesDir = path.join(__dirname, '../public/images/articles');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Ensure Node 18+ global fetch handles the image downloading better than https.get
const downloadImage = async (url, filepath) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(filepath);
    await finished(Readable.fromWeb(response.body).pipe(fileStream));
};

const processArticles = async () => {
    console.log("Starting offline image generation engine...");

    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(articlesDir, file);
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        let articles = JSON.parse(fileContent);

        console.log(`\nProcessing Category: ${file}`);
        let updated = false;

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const imageFilename = `${article.id}.jpg`;
            const imagePath = path.join(imagesDir, imageFilename);
            const relativeImageUrl = `/images/articles/${imageFilename}`;

            if (!fs.existsSync(imagePath)) {
                console.log(`  -> Fetching image for: ${article.title}...`);

                // Keep the prompt short to avoid Pollinations/Cloudflare 530 limits. 
                // Alternatively, fall back to picsum if it fails.
                const prompt = encodeURIComponent(article.header_image_prompt.substring(0, 100)); // Truncating prompt to ensure URL isn't too long
                const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?nologo=true&width=800&height=400&model=flux`;

                try {
                    await downloadImage(imageUrl, imagePath);
                    console.log(`     ✅ Saved to ${relativeImageUrl}`);
                } catch (error) {
                    console.error(`     ❌ Failed with pollinations: ${error.message}. Attempting fallback to Unsplash...`);
                    try {
                        // Fallback to picsum or unsplash Source if Pollinations rejects it
                        const fallbackUrl = `https://picsum.photos/seed/${article.id}/800/400.jpg`;
                        await downloadImage(fallbackUrl, imagePath);
                        console.log(`     ✅ Saved FALLBACK to ${relativeImageUrl}`);
                    } catch (err2) {
                        console.error(`     ❌ Fallback also failed: ${err2.message}`);
                    }
                }
            } else {
                console.log(`  -> Image already exists for: ${article.title}`);
            }

            if (article.image_url !== relativeImageUrl) {
                article.image_url = relativeImageUrl;
                updated = true;
            }

            // Wait 1.5 seconds between requests to avoid rate limits
            await new Promise(r => setTimeout(r, 1500));
        }

        if (updated) {
            fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8');
            console.log(`Updated JSON file: ${file}`);
        }
    }

    console.log("\nImage Engine Complete!");
};

processArticles().catch(console.error);
