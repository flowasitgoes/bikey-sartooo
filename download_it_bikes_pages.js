const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

class ItalianBikePagesDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.relativeRoot = '../../';
        this.outputDir = path.join(__dirname, 'public', 'it', 'biciclette');

        this.pages = [
            {
                category: 'Tri-composite',
                name: 'Raso TC',
                url: '/it/biciclette/raso-tri-composite',
                filename: 'raso-tri-composite.html'
            },
            {
                category: 'Tri-composite',
                name: 'Seta Plus TC',
                url: '/it/biciclette/seta-plus-tri-composite',
                filename: 'seta-plus-tri-composite.html'
            },
            {
                category: 'Tri-composite',
                name: 'Seta Gravel TC',
                url: '/it/biciclette/seta-gravel-plus-tri-composite',
                filename: 'seta-gravel-plus-tri-composite.html'
            },
            {
                category: 'Disc Brake',
                name: 'Raso',
                url: '/it/biciclette/raso',
                filename: 'raso.html'
            },
            {
                category: 'Disc Brake',
                name: 'Raso Gravel Wide',
                url: '/it/biciclette/raso-gravel-wide',
                filename: 'raso-gravel-wide.html'
            },
            {
                category: 'Disc Brake',
                name: 'Raso Gravel',
                url: '/it/biciclette/raso-gravel',
                filename: 'raso-gravel.html'
            },
            {
                category: 'Disc Brake',
                name: 'Seta Plus',
                url: '/it/biciclette/seta-plus',
                filename: 'seta-plus.html'
            },
            {
                category: 'Disc Brake',
                name: 'Lampo Plus',
                url: '/it/biciclette/lampo-plus',
                filename: 'lampo-plus.html'
            },
            {
                category: 'Disc Brake',
                name: 'Asola Plus',
                url: '/it/biciclette/asola-plus',
                filename: 'asola-plus.html'
            },
            {
                category: 'Disc Brake',
                name: 'Gravel TA Plus',
                url: '/it/biciclette/gravel-ta-plus',
                filename: 'gravel-ta-plus.html'
            },
            {
                category: 'Disc Brake',
                name: 'Doppio',
                url: '/it/biciclette/doppio',
                filename: 'doppio.html'
            },
            {
                category: 'Rim Brake',
                name: 'Seta (Rim)',
                url: '/it/biciclette/seta-rim',
                filename: 'seta-rim.html'
            },
            {
                category: 'Rim Brake',
                name: 'Asola (Rim)',
                url: '/it/biciclette/asola',
                filename: 'asola.html'
            },
            {
                category: 'Rim Brake',
                name: 'Veneto SL',
                url: '/it/biciclette/veneto-sl',
                filename: 'veneto-sl.html'
            }
        ];

        this.stats = {
            total: this.pages.length,
            downloaded: 0,
            skipped: 0,
            failed: 0
        };
    }

    async start() {
        console.log('🚴‍♂️ 開始下載義大利語單車頁面...\n');
        console.log(`📁 輸出目錄: ${path.resolve(this.outputDir)}\n`);

        await fs.ensureDir(this.outputDir);

        for (const pageConfig of this.pages) {
            await this.downloadSinglePage(pageConfig);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.printStats();
    }

    async downloadSinglePage({ url, filename, name }) {
        const outputPath = path.join(this.outputDir, filename);

        try {
            if (await fs.pathExists(outputPath)) {
                console.log(`⏭️  跳過已存在: ${filename}`);
                this.stats.skipped++;
                return;
            }

            console.log(`📥 下載中: ${name} (${url})`);

            const response = await axios.get(`${this.baseUrl}${url}`, {
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'it-IT,it;q=0.9'
                }
            });

            const { html, assets } = await this.processHtml(response.data);

            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, html, 'utf8');
            console.log(`✅ 已儲存 HTML: ${filename}`);

            await this.downloadAssets(assets);
            this.stats.downloaded++;

        } catch (error) {
            console.error(`❌ 下載失敗: ${filename} - ${error.message}`);
            this.stats.failed++;
        }
    }

    async processHtml(htmlContent) {
        const $ = cheerio.load(htmlContent);
        const assetsToDownload = new Map();

        // 移除 Cookie 相關元件
        $('[data-region="g0"]').remove();
        $('[class*="cookie"]').remove();
        $('script[data-cookiehub]').remove();
        $('style[data-ch2inline]').remove();
        $('script:contains("cookiehub")').remove();

        const collectAsset = (originalPath) => {
            if (!originalPath || originalPath.startsWith('data:')) {
                return;
            }

            const cleanPath = originalPath.split('?')[0];
            if (!cleanPath.startsWith('/')) {
                return;
            }

            const localPath = path.join(this.outputDir, '..', '..', cleanPath.replace(/^\//, ''));
            const key = `${this.baseUrl}${cleanPath}`;

            if (!assetsToDownload.has(key)) {
                assetsToDownload.set(key, localPath);
            }
        };

        const toRelativeFromRoot = (targetPath) => {
            if (!targetPath) {
                return targetPath;
            }

            let clean = targetPath.split('?')[0];
            if (clean.startsWith(this.baseUrl)) {
                clean = clean.replace(this.baseUrl, '');
            }

            if (!clean.startsWith('/')) {
                return targetPath;
            }

            if (clean === '/') {
                return `${this.relativeRoot}index.html`;
            }

            return `${this.relativeRoot}${clean.slice(1)}`;
        };

        const handleAttribute = (selector, attr, options = {}) => {
            $(selector).each((_, elem) => {
                const $elem = $(elem);
                const value = $elem.attr(attr);
                if (!value) {
                    return;
                }

                if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:')) {
                    return;
                }

                let newValue = value;
                let assetPath = value;

                if (options.processSrcset) {
                    const sources = value.split(',').map(item => item.trim());
                    const converted = sources.map(item => {
                        const [urlPart, descriptor] = item.split(' ');
                        const relative = toRelativeFromRoot(urlPart);
                        collectAsset(urlPart.startsWith('http') ? urlPart.replace(this.baseUrl, '') : urlPart);
                        return descriptor ? `${relative} ${descriptor}` : relative;
                    });
                    newValue = converted.join(', ');
                } else {
                    newValue = toRelativeFromRoot(value);

                    if (options.sameDirectory && value.startsWith('/it/biciclette/')) {
                        const slug = value.replace('/it/biciclette/', '').replace(/\/$/, '');
                        if (slug.length > 0) {
                            newValue = `./${slug}.html`;
                        }
                    }

                    if (newValue !== value) {
                        const normalized = value.startsWith(this.baseUrl)
                            ? value.replace(this.baseUrl, '')
                            : value;
                        collectAsset(normalized);
                    } else if (value.startsWith('/')) {
                        collectAsset(value);
                    }
                }

                $elem.attr(attr, newValue);
            });
        };

        handleAttribute('link[rel="stylesheet"]', 'href');
        handleAttribute('link[rel="preload"][as="style"]', 'href');
        handleAttribute('link[rel="preload"][as="font"]', 'href');
        handleAttribute('script[src]', 'src');
        handleAttribute('img[src]', 'src');
        handleAttribute('img[data-src]', 'data-src');
        handleAttribute('source[srcset]', 'srcset', { processSrcset: true });
        handleAttribute('source[data-srcset]', 'data-srcset', { processSrcset: true });
        handleAttribute('video[src]', 'src');
        handleAttribute('video[data-src]', 'data-src');
        handleAttribute('a[href^="/"]', 'href', { sameDirectory: true });
        handleAttribute('a[href^="https://www.sartobikes.com/"]', 'href', { sameDirectory: true });

        const html = $.html();
        return { html, assets: Array.from(assetsToDownload.entries()) };
    }

    async downloadAssets(assets) {
        for (const [remoteUrl, localPath] of assets) {
            try {
                if (await fs.pathExists(localPath)) {
                    continue;
                }

                await fs.ensureDir(path.dirname(localPath));

                console.log(`  📦 下載資源: ${remoteUrl}`);
                const response = await axios.get(remoteUrl, {
                    responseType: 'arraybuffer',
                    timeout: 45000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': '*/*'
                    }
                });

                await fs.writeFile(localPath, response.data);
                console.log(`  ✅ 完成: ${path.relative(path.join(this.outputDir, '..', '..'), localPath)}`);

            } catch (error) {
                console.error(`  ⚠️ 資源下載失敗: ${remoteUrl} - ${error.message}`);
            }
        }
    }

    printStats() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 下載統計:');
        console.log(`   總頁面數: ${this.stats.total}`);
        console.log(`   ✅ 已下載: ${this.stats.downloaded}`);
        console.log(`   ⏭️  已跳過: ${this.stats.skipped}`);
        console.log(`   ❌  失敗: ${this.stats.failed}`);
        console.log('='.repeat(50));
    }
}

async function main() {
    const downloader = new ItalianBikePagesDownloader();
    await downloader.start();
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ 執行失敗:', error.message);
        process.exit(1);
    });
}

module.exports = ItalianBikePagesDownloader;

