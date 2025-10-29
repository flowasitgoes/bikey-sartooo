const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

class SupportPagesDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.outputDir = './public/en';
        
        // Support 菜单页面列表
        this.pages = [
            {
                url: '/en/a-sarto-is-forever',
                filename: 'a-sarto-is-forever.html',
                name: 'Lifetime assistance'
            },
            {
                url: '/en/faq-and-warranty',
                filename: 'faq-and-warranty.html',
                name: 'Faq & Warranty'
            },
            {
                url: '/en/register-your-sarto',
                filename: 'register-your-sarto.html',
                name: 'Register the bike frame'
            },
            {
                url: '/en/contacts',
                filename: 'contacts.html',
                name: 'Contacts'
            },
            {
                url: '/en/dealers',
                filename: 'dealers.html',
                name: 'Dealers'
            }
        ];
        
        this.stats = {
            total: this.pages.length,
            downloaded: 0,
            skipped: 0,
            failed: 0
        };
    }

    async downloadPage(url, filename, pageName) {
        try {
            const outputPath = path.join(this.outputDir, filename);

            // 检查文件是否已存在
            if (await fs.pathExists(outputPath)) {
                console.log(`⏭️  跳过已存在: ${filename}`);
                this.stats.skipped++;
                return true;
            }

            console.log(`📥 下载中: ${pageName}...`);

            // 下载页面
            const response = await axios.get(`${this.baseUrl}${url}`, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            let html = response.data;

            // 使用 cheerio 解析和修改 HTML
            const $ = cheerio.load(html);

            // 修复资源路径（相对于 /en/ 目录）
            $('link[href^="/"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.startsWith('/') && !href.startsWith('//')) {
                    $(elem).attr('href', '..' + href);
                }
            });

            $('script[src^="/"]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('/') && !src.startsWith('//')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            $('img[src^="/"]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.startsWith('/') && !src.startsWith('//')) {
                    $(elem).attr('src', '..' + src);
                }
            });

            $('a[href^="/en/"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    // 将 /en/xxx 转换为 ./xxx.html 或相对路径
                    const newHref = href.replace(/^\/en\//, './').replace(/\/$/, '.html');
                    $(elem).attr('href', newHref);
                }
            });

            $('a[href^="/it"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href) {
                    $(elem).attr('href', '../it');
                }
            });

            // 修复 source 标签
            $('source[data-srcset^="/"]').each((i, elem) => {
                const srcset = $(elem).attr('data-srcset');
                if (srcset && srcset.startsWith('/') && !srcset.startsWith('//')) {
                    $(elem).attr('data-srcset', '..' + srcset);
                }
            });

            $('source[srcset^="/"]').each((i, elem) => {
                const srcset = $(elem).attr('srcset');
                if (srcset && srcset.startsWith('/') && !srcset.startsWith('//')) {
                    $(elem).attr('srcset', '..' + srcset);
                }
            });

            // 保存修改后的 HTML
            html = $.html();

            // 确保目录存在
            await fs.ensureDir(this.outputDir);

            // 写入文件
            await fs.writeFile(outputPath, html, 'utf8');

            console.log(`✅ 已下载: ${filename}`);
            this.stats.downloaded++;
            return true;

        } catch (error) {
            console.log(`❌ 下载失败: ${filename} - ${error.message}`);
            this.stats.failed++;
            return false;
        }
    }

    async start() {
        console.log('🚀 开始下载 Support 菜单页面...\n');
        console.log(`📁 输出目录: ${path.resolve(this.outputDir)}\n`);

        for (const page of this.pages) {
            await this.downloadPage(page.url, page.filename, page.name);
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 显示统计
        console.log('\n' + '='.repeat(50));
        console.log('📊 下载统计:');
        console.log(`   总页面数: ${this.stats.total}`);
        console.log(`   ✅ 已下载: ${this.stats.downloaded}`);
        console.log(`   ⏭️  已跳过: ${this.stats.skipped}`);
        console.log(`   ❌ 失败: ${this.stats.failed}`);
        console.log('='.repeat(50));

        if (this.stats.failed > 0) {
            console.log('\n⚠️  部分页面下载失败，请检查日志');
        } else {
            console.log('\n✨ 所有页面下载完成！');
        }
    }
}

// 主函数
async function main() {
    const downloader = new SupportPagesDownloader();
    await downloader.start();
}

// 运行脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    });
}

module.exports = SupportPagesDownloader;

