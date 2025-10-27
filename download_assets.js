const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class AssetDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.publicDir = path.join(__dirname, 'public');
    }

    async downloadFile(url, localPath) {
        try {
            console.log(`📥 下載: ${url}`);
            const response = await axios.get(url, {
                responseType: 'stream',
                timeout: 30000
            });
            
            await fs.ensureDir(path.dirname(localPath));
            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ 完成: ${localPath}`);
                    resolve(localPath);
                });
                writer.on('error', reject);
            });
        } catch (error) {
            console.error(`❌ 下載失敗 ${url}:`, error.message);
            return null;
        }
    }

    async downloadAssets() {
        console.log('🚀 開始下載資源文件...');

        // 下載影片
        const videos = [
            {
                url: 'https://www.sartobikes.com/video/rasoGravelWide.mp4',
                localPath: path.join(this.publicDir, 'video', 'rasoGravelWide.mp4')
            },
            {
                url: 'https://www.sartobikes.com/img/menuMobile.webm',
                localPath: path.join(this.publicDir, 'img', 'menuMobile.webm')
            }
        ];

        // 下載圖片
        const images = [
            // Home section images
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/S_hm-fasciatura-04h.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'S_hm-fasciatura-04h.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/M_hm-fasciatura-04h.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'M_hm-fasciatura-04h.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/L_hm-fasciatura-04h.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'L_hm-fasciatura-04h.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/P_hm-fasciatura-04h.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'P_hm-fasciatura-04h.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/S_hm-fasciatura-04.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'S_hm-fasciatura-04.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/M_hm-fasciatura-04.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'M_hm-fasciatura-04.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/2/P_hm-fasciatura-04.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '2', 'P_hm-fasciatura-04.jpg')
            },
            // Section 3 images
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/S_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'S_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/M_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'M_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/L_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'L_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/P_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'P_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/S_sarto-x-marc-moves-332.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'S_sarto-x-marc-moves-332.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/M_sarto-x-marc-moves-332.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'M_sarto-x-marc-moves-332.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/3/P_sarto-x-marc-moves-332.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '3', 'P_sarto-x-marc-moves-332.jpg')
            },
            // Section 4 images
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/S_telaio-raso-tc-blu-forgiato-17.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'S_telaio-raso-tc-blu-forgiato-17.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/M_telaio-raso-tc-blu-forgiato-17.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'M_telaio-raso-tc-blu-forgiato-17.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/L_telaio-raso-tc-blu-forgiato-17.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'L_telaio-raso-tc-blu-forgiato-17.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/P_telaio-raso-tc-blu-forgiato-17.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'P_telaio-raso-tc-blu-forgiato-17.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/S_telaio-raso-tc-blu-forgiato-16.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'S_telaio-raso-tc-blu-forgiato-16.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/M_telaio-raso-tc-blu-forgiato-16.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'M_telaio-raso-tc-blu-forgiato-16.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homesection/4/P_telaio-raso-tc-blu-forgiato-16.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homesection', '4', 'P_telaio-raso-tc-blu-forgiato-16.jpg')
            },
            // Home banner gallery images
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/S_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'S_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/M_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'M_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/L_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'L_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/P_sarto-x-marc-moves-33.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'P_sarto-x-marc-moves-33.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/S_gallery-raso2-at-2x.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'S_gallery-raso2-at-2x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/M_gallery-raso2-at-2x.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'M_gallery-raso2-at-2x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/L_gallery-raso2-at-2x.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'L_gallery-raso2-at-2x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/P_gallery-raso2-at-2x.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'P_gallery-raso2-at-2x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/S_gallery3_0.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'S_gallery3_0.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/M_gallery3_0.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'M_gallery3_0.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/L_gallery3_0.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'L_gallery3_0.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/P_gallery3_0.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'P_gallery3_0.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/S_gallery4.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'S_gallery4.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/M_gallery4.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'M_gallery4.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/L_gallery4.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'L_gallery4.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/P_gallery4.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'P_gallery4.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/S_raso_5.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'S_raso_5.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/M_raso_5.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'M_raso_5.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/L_raso_5.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'L_raso_5.jpg')
            },
            {
                url: 'https://www.sartobikes.com/storage/homebanner/4/gallery/P_raso_5.jpg',
                localPath: path.join(this.publicDir, 'storage', 'homebanner', '4', 'gallery', 'P_raso_5.jpg')
            },
            // Newsletter images
            {
                url: 'https://www.sartobikes.com/img/newsletter@1x.jpg',
                localPath: path.join(this.publicDir, 'img', 'newsletter@1x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/img/newsletter@2x.jpg',
                localPath: path.join(this.publicDir, 'img', 'newsletter@2x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/img/newsletter-small.jpg',
                localPath: path.join(this.publicDir, 'img', 'newsletter-small.jpg')
            },
            // Home images
            {
                url: 'https://www.sartobikes.com/img/home/perfomance-road-bike@1x.webp',
                localPath: path.join(this.publicDir, 'img', 'home', 'perfomance-road-bike@1x.webp')
            },
            {
                url: 'https://www.sartobikes.com/img/home/perfomance-road-bike@2x.webp',
                localPath: path.join(this.publicDir, 'img', 'home', 'perfomance-road-bike@2x.webp')
            },
            {
                url: 'https://www.sartobikes.com/img/home/perfomance-road-bike@3x.webp',
                localPath: path.join(this.publicDir, 'img', 'home', 'perfomance-road-bike@3x.webp')
            },
            {
                url: 'https://www.sartobikes.com/img/home/perfomance-road-bike-p.webp',
                localPath: path.join(this.publicDir, 'img', 'home', 'perfomance-road-bike-p.webp')
            },
            {
                url: 'https://www.sartobikes.com/img/home/carbon-fiber-road-bike@1x.jpg',
                localPath: path.join(this.publicDir, 'img', 'home', 'carbon-fiber-road-bike@1x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/img/home/carbon-fiber-road-bike@2x.jpg',
                localPath: path.join(this.publicDir, 'img', 'home', 'carbon-fiber-road-bike@3x.jpg')
            },
            {
                url: 'https://www.sartobikes.com/img/home/carbon-fiber-road-bike@3x.jpg',
                localPath: path.join(this.publicDir, 'img', 'home', 'carbon-fiber-road-bike@3x.jpg')
            },
            // Favicon
            {
                url: 'https://www.sartobikes.com/img/favicon.png',
                localPath: path.join(this.publicDir, 'img', 'favicon.png')
            },
            {
                url: 'https://www.sartobikes.com/img/fb-home.jpg',
                localPath: path.join(this.publicDir, 'img', 'fb-home.jpg')
            }
        ];

        // 下載所有影片
        console.log('\n📹 下載影片文件...');
        for (const video of videos) {
            await this.downloadFile(video.url, video.localPath);
        }

        // 下載所有圖片
        console.log('\n🖼️ 下載圖片文件...');
        for (const image of images) {
            await this.downloadFile(image.url, image.localPath);
        }

        console.log('\n✅ 所有資源下載完成！');
    }
}

// 執行下載
const downloader = new AssetDownloader();
downloader.downloadAssets().catch(console.error);
