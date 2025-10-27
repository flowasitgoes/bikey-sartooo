const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

class SartoWorldDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.publicDir = path.join(__dirname, 'public');
        this.pages = [
            { url: '/en/antonio-enrico', filename: 'antonio-enrico.html', name: 'Antonio & Enrico' },
            { url: '/en/handmade-in-italy', filename: 'handmade-in-italy.html', name: 'Handmade' },
            { url: '/en/sarto-experience', filename: 'sarto-experience.html', name: 'Sarto Experience' },
            { url: '/en/sustainability', filename: 'sustainability.html', name: 'Sustainability' },
            { url: '/en/collaborations', filename: 'collaborations.html', name: 'Partnerships' }
        ];
    }

    async downloadAllPages() {
        console.log('🚀 開始下載 Sarto World 所有頁面...\n');

        for (const page of this.pages) {
            await this.downloadPage(page);
        }

        console.log('\n✅ 所有 Sarto World 頁面下載完成！');
    }

    async downloadPage(pageInfo) {
        const { url, filename, name } = pageInfo;
        const fullUrl = this.baseUrl + url;

        try {
            console.log(`\n📄 正在下載: ${name} (${url})`);
            const response = await axios.get(fullUrl, {
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

            // 修改資源路徑
            this.fixResourcePaths($);
            
            // 修改導航連結
            this.fixNavigationLinks($);

            // 保存 HTML 文件
            const enDir = path.join(this.publicDir, 'en');
            await fs.ensureDir(enDir);
            const htmlPath = path.join(enDir, filename);
            await fs.writeFile(htmlPath, $.html());
            console.log(`✅ HTML文件已保存: ${htmlPath}`);

            // 收集並下載圖片
            await this.downloadImages($);

        } catch (error) {
            console.error(`❌ 下載 ${name} 失敗:`, error.message);
        }
    }

    fixResourcePaths($) {
        // 修改 favicon
        $('link[rel="icon"]').attr('href', '../img/favicon.png');

        // 修改 meta 圖片
        $('meta[property="og:image"]').attr('content', '../img/fb-home.jpg');
        $('meta[property="og:image:secure_url"]').attr('content', '../img/fb-home.jpg');
        $('meta[name="twitter:image"]').attr('content', '../img/fb-home.jpg');

        // 修改 CSS 連結
        $('link[rel="stylesheet"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.includes('/css/build/')) {
                const newHref = href.replace('/css/build/', '../css/').replace('https://www.sartobikes.com/', '../');
                $(elem).attr('href', newHref);
            } else if (href && href.startsWith('https://www.sartobikes.com/')) {
                const newHref = href.replace('https://www.sartobikes.com/', '../');
                $(elem).attr('href', newHref);
            } else if (href && href.startsWith('/')) {
                $(elem).attr('href', '..' + href);
            }
        });

        // 修改 JS 連結
        $('script[src]').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && src.includes('/js/build/')) {
                const newSrc = src.replace('/js/build/', '../js/').replace('https://www.sartobikes.com/', '../');
                $(elem).attr('src', newSrc);
            } else if (src && src.startsWith('https://www.sartobikes.com/')) {
                const newSrc = src.replace('https://www.sartobikes.com/', '../');
                $(elem).attr('src', newSrc);
            } else if (src && src.startsWith('/js/')) {
                $(elem).attr('src', '..' + src);
            }
        });

        // 修改 livewire 路徑
        $('script[src*="livewire"]').each((i, elem) => {
            $(elem).attr('src', '../js/livewire.js?id=90730a3b0e7144480175');
        });

        // 修改圖片路徑
        $('img').each((i, elem) => {
            ['src', 'data-src'].forEach(attr => {
                const src = $(elem).attr(attr);
                if (src) {
                    if (src.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr(attr, src.replace('https://www.sartobikes.com/', '../'));
                    } else if (src.startsWith('/')) {
                        $(elem).attr(attr, '..' + src);
                    }
                }
            });
        });

        // 修改 source 標籤
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
            ['src', 'data-src'].forEach(attr => {
                const src = $(elem).attr(attr);
                if (src) {
                    if (src.startsWith('https://www.sartobikes.com/')) {
                        $(elem).attr(attr, src.replace('https://www.sartobikes.com/', '../'));
                    } else if (src.startsWith('/')) {
                        $(elem).attr(attr, '..' + src);
                    }
                }
            });
        });
    }

    fixNavigationLinks($) {
        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href) {
                if (href === '/en' || href === 'https://www.sartobikes.com/en') {
                    $(elem).attr('href', '../index.html');
                } else if (href === '/en/bikes' || href === 'https://www.sartobikes.com/en/bikes') {
                    $(elem).attr('href', './bikes.html');
                } else if (href === '/en/journal' || href === 'https://www.sartobikes.com/en/journal') {
                    $(elem).attr('href', './journal.html');
                } else if (href === '/en/antonio-enrico' || href === 'https://www.sartobikes.com/en/antonio-enrico') {
                    $(elem).attr('href', './antonio-enrico.html');
                } else if (href === '/en/handmade-in-italy' || href === 'https://www.sartobikes.com/en/handmade-in-italy') {
                    $(elem).attr('href', './handmade-in-italy.html');
                } else if (href === '/en/sarto-experience' || href === 'https://www.sartobikes.com/en/sarto-experience') {
                    $(elem).attr('href', './sarto-experience.html');
                } else if (href === '/en/sustainability' || href === 'https://www.sartobikes.com/en/sustainability') {
                    $(elem).attr('href', './sustainability.html');
                } else if (href === '/en/collaborations' || href === 'https://www.sartobikes.com/en/collaborations') {
                    $(elem).attr('href', './collaborations.html');
                } else if (href.startsWith('/en/')) {
                    const pageName = href.replace('/en/', '');
                    $(elem).attr('href', `./${pageName}`);
                } else if (href.startsWith('https://www.sartobikes.com/en/')) {
                    const pageName = href.replace('https://www.sartobikes.com/en/', '');
                    $(elem).attr('href', `./${pageName}`);
                }
            }
        });
    }

    async downloadImages($) {
        const imagesToDownload = new Set();

        $('img, source').each((i, elem) => {
            const $elem = $(elem);
            const src = $elem.attr('src') || $elem.attr('data-src');
            const srcset = $elem.attr('srcset') || $elem.attr('data-srcset');

            if (src && (src.startsWith('../storage/') || src.startsWith('../img/'))) {
                const url = this.baseUrl + src.replace('..', '');
                const localPath = path.join(this.publicDir, src.replace('../', ''));
                imagesToDownload.add(JSON.stringify({ url, localPath }));
            }

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
        if (images.length > 0) {
            console.log(`🖼️ 找到 ${images.length} 個圖片需要下載`);
            for (const { url, localPath } of images) {
                await this.downloadFile(url, localPath);
            }
        }
    }

    async downloadFile(url, localPath) {
        try {
            if (await fs.pathExists(localPath)) {
                console.log(`⏭️ 跳過（已存在）: ${path.basename(localPath)}`);
                return;
            }

            console.log(`📥 下載: ${path.basename(localPath)}`);
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
const downloader = new SartoWorldDownloader();
downloader.downloadAllPages().catch(console.error);
