const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
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

        // 啟動瀏覽器
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            console.log('📄 正在載入頁面...');
            await page.goto(this.pageUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // 等待頁面完全載入
            await page.waitForTimeout(3000);

            // 獲取頁面HTML
            const html = await page.content();

            // 使用 Cheerio 解析 HTML
            const $ = cheerio.load(html);

            console.log('🔧 處理HTML內容...');

            // 移除 Cookie 相關代碼
            $('[data-region="g0"]').remove();
            $('script[data-cookiehub]').remove();
            $('style[data-ch2inline]').remove();

            // 修改資源路徑為相對路徑
            $('link[rel="stylesheet"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.startsWith('https://www.sartobikes.com/')) {
                    const newHref = href.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('href', newHref);
                }
            });

            $('script[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('https://www.sartobikes.com/')) {
                    const newSrc = src.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('src', newSrc);
                }
            });

            // 修改圖片路徑
            $('img[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('https://www.sartobikes.com/')) {
                    const newSrc = src.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            // 修改導航連結
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    if (href === '/en' || href === 'https://www.sartobikes.com/en') {
                        $(elem).attr('href', '../index.html');
                    } else if (href === '/en/bikes' || href === 'https://www.sartobikes.com/en/bikes') {
                        $(elem).attr('href', './bikes.html');
                    } else if (href.startsWith('/en/')) {
                        // 保留其他連結，但轉換為相對路徑
                        const newHref = href.replace('/en/', '../');
                        $(elem).attr('href', newHref);
                    } else if (href.startsWith('https://www.sartobikes.com/en/')) {
                        const newHref = href.replace('https://www.sartobikes.com/en/', '../');
                        $(elem).attr('href', newHref);
                    }
                }
            });

            // 修改 video 和 source 標籤
            $('video[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('https://www.sartobikes.com/')) {
                    const newSrc = src.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            $('source[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('https://www.sartobikes.com/')) {
                    const newSrc = src.replace('https://www.sartobikes.com/', '../');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            // 保存 HTML 文件
            const bikesDir = path.join(this.publicDir, 'en');
            await fs.ensureDir(bikesDir);
            const htmlPath = path.join(bikesDir, 'bikes.html');
            await fs.writeFile(htmlPath, $.html());
            console.log(`✅ HTML文件已保存: ${htmlPath}`);

            // 收集需要下載的圖片
            const imagesToDownload = [];
            $('img[src], source[srcset], source[data-srcset]').each((i, elem) => {
                const $elem = $(elem);
                const src = $elem.attr('src');
                const srcset = $elem.attr('srcset') || $elem.attr('data-srcset');

                if (src && src.startsWith('../storage/')) {
                    const url = this.baseUrl + src.replace('..', '');
                    const localPath = path.join(this.publicDir, src.replace('../', ''));
                    imagesToDownload.push({ url, localPath });
                }

                if (srcset) {
                    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
                    urls.forEach(url => {
                        if (url.startsWith('../storage/')) {
                            const fullUrl = this.baseUrl + url.replace('..', '');
                            const localPath = path.join(this.publicDir, url.replace('../', ''));
                            imagesToDownload.push({ url: fullUrl, localPath });
                        }
                    });
                }
            });

            console.log(`\n🖼️ 找到 ${imagesToDownload.length} 個圖片需要下載`);

            // 下載圖片
            for (const { url, localPath } of imagesToDownload) {
                await this.downloadFile(url, localPath);
            }

            console.log('\n✅ Bikes 頁面下載完成！');

        } catch (error) {
            console.error('❌ 錯誤:', error.message);
            throw error;
        } finally {
            await browser.close();
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
                timeout: 30000
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
