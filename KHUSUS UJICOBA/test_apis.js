const axios = require('axios');
const fs = require('fs');

const BASE_API = 'https://api.terasdracin.my.id';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testApi(name, url) {
    try {
        console.log(`\n=== ${name} ===`);
        console.log(`URL: ${url}`);
        const res = await axios.get(url, { timeout: 30000 });
        console.log(JSON.stringify(res.data, null, 2) || 'OK - Empty response');
        return res.data;
    } catch (err) {
        if (err.response?.data) {
            console.log(JSON.stringify(err.response.data, null, 2));
        } else {
            console.log(`Error: ${err.message}`);
        }
        return err.response?.data || null;
    }
}

async function main() {
    const outputDir = './api_responses';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    console.log('TESTING ALL APIs - tekan Ctrl+C untuk stop\n');
    console.log('==========================================');
    console.log(`BASE API: ${BASE_API}`);
    console.log('==========================================');

    const apis = [
        // DRAMABOX
        { name: 'dramabox_vip', url: `${BASE_API}/dramabox/vip` },
        { name: 'dramabox_foryou', url: `${BASE_API}/dramabox/foryou` },
        { name: 'dramabox_latest', url: `${BASE_API}/dramabox/latest` },
        { name: 'dramabox_trending', url: `${BASE_API}/dramabox/trending` },
        { name: 'dramabox_detail', url: `${BASE_API}/dramabox/detail?bookId=41000116666` },
        { name: 'dramabox_allepisodes', url: `${BASE_API}/dramabox/allepisode?bookId=41000116666` },

        // REELSHORT
        { name: 'reelshort_homepage', url: `${BASE_API}/reelshort/homepage` },
        { name: 'reelshort_foryou', url: `${BASE_API}/reelshort/foryou` },
        { name: 'reelshort_detail', url: `${BASE_API}/reelshort/detail?bookId=42000006096` },

        // NETSHORT
        { name: 'netshort_foryou', url: `${BASE_API}/netshort/foryou?page=1` },
        { name: 'netshort_theatres', url: `${BASE_API}/netshort/theaters` },
        { name: 'netshort_allepisodes', url: `${BASE_API}/netshort/allepisode?shortPlayId=2026472128836009986` },

        // MELOLO
        { name: 'melolo_latest', url: `${BASE_API}/melolo/latest` },
        { name: 'melolo_trending', url: `${BASE_API}/melolo/trending` },
        { name: 'melolo_detail', url: `${BASE_API}/melolo/detail?bookId=7583531888644459525` },

        // FLICKREELS
        { name: 'flickreels_foryou', url: `${BASE_API}/flickreels/foryou` },
        { name: 'flickreels_latest', url: `${BASE_API}/flickreels/latest` },
        { name: 'flickreels_hotrank', url: `${BASE_API}/flickreels/hotrank` },
        { name: 'flickreels_detail', url: `${BASE_API}/flickreels/detail?id=123` },

        // FREEREELS
        { name: 'freereels_home', url: `${BASE_API}/freereels/home` },
        { name: 'freereels_anime', url: `${BASE_API}/freereels/anime` },
        { name: 'freereels_foryou', url: `${BASE_API}/freereels/foryou` },
        { name: 'freereels_detail', url: `${BASE_API}/freereels/detail?id=123` },

        // MOVIEBOX
        { name: 'moviebox_homepage', url: `${BASE_API}/moviebox/homepage` },
        { name: 'moviebox_trending', url: `${BASE_API}/moviebox/trending?page=0` },
        { name: 'moviebox_detail', url: `${BASE_API}/moviebox/detail?subjectId=123` },
        { name: 'moviebox_sources', url: `${BASE_API}/moviebox/sources?subjectId=123&season=1&episode=1` },
        { name: 'moviebox_generate_link', url: `${BASE_API}/moviebox/generate-link-stream-video?url=https://example.com` },

        // PROXY
        { name: 'proxy_warmup', url: `${BASE_API}/proxy/warmup?url=https://example.com/test.mp4` },
        { name: 'proxy_video', url: `${BASE_API}/proxy/video?url=https://example.com/test.mp4&referer=https://example.com` },
    ];

    for (const api of apis) {
        const data = await testApi(api.name, api.url);
        
        // Simpan ke file
        const filename = `${outputDir}/${api.name}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\n[Saved: ${filename}]`);
        
        await delay(2000);
    }

    console.log('\n==========================================');
    console.log('SEMUA API TELAH DIUJI');
    console.log('==========================================');
}

main().catch(console.error);
