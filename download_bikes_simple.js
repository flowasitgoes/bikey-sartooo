const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

class BikesPageDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.pageUrl = 'https://www.sartobikes.com/en/bikes';
        this.publicDir = path.join(__dirname, 'public');
    }

    async downloadPage() {
        console.log('🚀 開始下載 Bikes 頁面...');

        try {
            console.log('📄 正在下載頁面HTML...');
            const response = await axios.get(this.pageUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const html = response.data;
            const $ = cheerio.load(html);

            console.log('🔧 處理HTML內容...');

            // 移除 Cookie 相關代碼
            $('[data-region="g0"]').remove();
            $('[class*="ch2"]').remove();
            $('script[data-cookiehub]').remove();
            $('style[data-ch2inline]').remove();
            $('script:contains("cookiehub")').remove();

            // 修改 favicon
            $('link[rel="icon"]').attr('href', '../img/favicon.png');

            // 修改 meta 圖片
            $('meta[property="og:image"]').attr('content', '../img/fb-home.jpg');
            $('meta[property="og:image:secure_url"]').attr('content', '../img/fb-home.jpg');
            $('meta[name="twitter:image"]').attr('content', '../img/fb-home.jpg');

            // 修改 CSS 連結
            $('link[rel="stylesheet"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.startsWith('https://www.sartobikes.com/')) {
                    const newHref = href.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('href', newHref);
                } else if (href && href.startsWith('/')) {
                    $(elem).attr('href', '..' + href);
                }
            });

            // 修改 JS 連結
            $('script[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('https://www.sartobikes.com/')) {
                    const newSrc = src.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/js/')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            // 修改圖片路徑
            $('img').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src) {
                    if (src.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr('src', src.replace('https://www.sartobikes.com/', '../'));
                    } else if (src.startsWith('/')) {
                        $(elem).attr('src', '..' + src);
                    }
                }

                // 處理 data-src
                const dataSrc = $(elem).attr('data-src');
                if (dataSrc) {
                    if (dataSrc.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr('data-src', dataSrc.replace('https://www.sartobikes.com/', '../'));
                    } else if (dataSrc.startsWith('/')) {
                        $(elem).attr('data-src', '..' + dataSrc);
                    }
                }
            });

            // 修改 source 標籤的 srcset
            $('source').each((i, elem) => {
                ['srcset', 'data-srcset'].forEach(attr => {
                    const srcset = $(elem).attr(attr);
                    if (srcset) {
                        const newSrcset = srcset
                            .replace(/https:\/\/www\.sartobikes\.com\//g, '../')
                            .replace(/\/storage\//g, '../storage/')
                            .replace(/\/img\//g, '../img/');
                        $(elem).attr(attr, newSrcset);
                    }
                });
            });

            // 修改 video 標籤
            $('video').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src) {
                    if (src.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr('src', src.replace('https://www.sartobikes.com/', '../'));
                    } else if (src.startsWith('/')) {
                        $(elem).attr('src', '..' + src);
                    }
                }

                const dataSrc = $(elem).attr('data-src');
                if (dataSrc) {
                    if (dataSrc.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr('data-src', dataSrc.replace('https://www.sartobikes.com/', '../'));
                    } else if (dataSrc.startsWith('/')) {
                        $(elem).attr('data-src', '..' + dataSrc);
                    }
                }
            });

            // 修改導航連結
            $('a').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    if (href === '/en' || href === 'https://www.sartobikes.com/en') {
                        $(elem).attr('href', '../index.html');
                    } else if (href === '/en/bikes' || href === 'https://www.sartobikes.com/en/bikes') {
                        $(elem).attr('href', './bikes.html');
                    } else if (href.startsWith('/en/bikes/')) {
                        // bikes 子頁面，暫時保留原連結或指向首頁
                        const bikeName = href.replace('/en/bikes/', '');
                        $(elem).attr('href', `./bikes/${bikeName}.html`);
                    } else if (href.startsWith('/en/')) {
                        // 其他 en 頁面
                        const pageName = href.replace('/en/', '');
                        $(elem).attr('href', `../${pageName}`);
                    } else if (href.startsWith('https://www.sartobikes.com/en/')) {
                        const pageName = href.replace('https://www.sartobikes.com/en/', '');
                        $(elem).attr('href', `../${pageName}`);
                    }
                }
            });

            // 保存 HTML 文件
            const bikesDir = path.join(this.publicDir, 'en');
            await fs.ensureDir(bikesDir);
            const htmlPath = path.join(bikesDir, 'bikes.html');
            await fs.writeFile(htmlPath, $.html());
            console.log(`✅ HTML文件已保存: ${htmlPath}`);

            // 收集需要下載的圖片
            const imagesToDownload = new Set();
            
            $('img, source').each((i, elem) => {
                const $elem = $(elem);
                const src = $elem.attr('src') || $elem.attr('data-src');
                const srcset = $elem.attr('srcset') || $elem.attr('data-srcset');

                // 處理單個 src
                if (src && (src.startsWith('../storage/') || src.startsWith('../img/'))) {
                    const url = this.baseUrl + src.replace('..', '');
                    const localPath = path.join(this.publicDir, src.replace('../', ''));
                    imagesToDownload.add(JSON.stringify({ url, localPath }));
                }

                // 處理 srcset
                if (srcset) {
                    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
                    urls.forEach(url => {
                        if (url.startsWith('../storage/') || url.startsWith('../img/')) {
                            const fullUrl = this.baseUrl + url.replace('..', '');
                            const localPath = path.join(this.publicDir, url.replace('../', ''));
                            imagesToDownload.add(JSON.stringify({ url: fullUrl, localPath }));
                        }
                    });
                }
            });

            const images = Array.from(imagesToDownload).map(s => JSON.parse(s));
            console.log(`\n🖼️ 找到 ${images.length} 個圖片需要下載`);

            // 下載圖片
            for (const { url, localPath } of images) {
                await this.downloadFile(url, localPath);
            }

            console.log('\n✅ Bikes 頁面下載完成！');

        } catch (error) {
            console.error('❌ 錯誤:', error.message);
            throw error;
        }
    }

    async downloadFile(url, localPath) {
        try {
            // 檢查文件是否已存在
            if (await fs.pathExists(localPath)) {
                console.log(`⏭️ 跳過（已存在）: ${path.basename(localPath)}`);
                return;
            }

            console.log(`📥 下載: ${url}`);
            const response = await axios.get(url, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            await fs.ensureDir(path.dirname(localPath));
            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ 完成: ${path.basename(localPath)}`);
                    resolve();
                });
                writer.on('error', reject);
            });
        } catch (error) {
            console.error(`❌ 下載失敗 ${url}:`, error.message);
        }
    }
}

// 執行下載
const downloader = new BikesPageDownloader();
downloader.downloadPage().catch(console.error);
