const fs = require('fs');
const https = require('https');
const { ZstdCodec } = require('zstd-codec');
const path = require('path');

const downloadSize = 10 * 1024 * 1024; // Download 10MB of the DB

ZstdCodec.run(zstd => {
    const streamingObj = new zstd.Streaming();
    console.log("Starting download...");

    https.get('https://database.lichess.org/lichess_db_puzzle.csv.zst', (res) => {
        let decompressedStr = '';
        let totalReceived = 0;

        res.on('data', chunk => {
            totalReceived += chunk.length;
            try {
                const dec = streamingObj.decompressChunk(chunk);
                if (dec) {
                    decompressedStr += new TextDecoder().decode(dec);
                }
            } catch (e) {
                // Ignore errors from truncated chunks
            }

            if (totalReceived > downloadSize) {
                res.destroy(); // stop downloading
            }
        });

        res.on('close', () => {
            console.log("Processing lines...");
            const lines = decompressedStr.split('\n');
            const puzzles = [];

            // PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
            for (let i = 1; i < lines.length - 1; i++) {
                const parts = lines[i].split(',');
                if (parts.length >= 8) {
                    puzzles.push({
                        id: parts[0],
                        fen: parts[1],
                        moves: parts[2].split(' '),
                        rating: parseInt(parts[3], 10),
                        ratingDeviation: parseInt(parts[4], 10),
                        popularity: parseInt(parts[5], 10),
                        nbPlays: parseInt(parts[6], 10),
                        themes: parts[7].split(' ')
                    });
                }
            }

            // Distribute and pick ~200 puzzles
            const buckets = {
                easy: puzzles.filter(p => p.rating < 1200),
                medium: puzzles.filter(p => p.rating >= 1200 && p.rating < 1600),
                hard: puzzles.filter(p => p.rating >= 1600 && p.rating < 2000),
                extreme: puzzles.filter(p => p.rating >= 2000)
            };

            const pickRandom = (arr, count) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

            const finalPuzzles = [
                ...pickRandom(buckets.easy, 50),
                ...pickRandom(buckets.medium, 50),
                ...pickRandom(buckets.hard, 50),
                ...pickRandom(buckets.extreme, 50)
            ];

            const destFile = path.join(__dirname, 'src/lib/chess-puzzles.json');
            fs.writeFileSync(destFile, JSON.stringify(finalPuzzles, null, 2));
            console.log(`Saved ${finalPuzzles.length} puzzles directly to ${destFile}`);
        });
    });
});
