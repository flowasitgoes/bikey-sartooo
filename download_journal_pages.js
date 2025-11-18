const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

class JournalPagesDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.outputDir = './public/en/journal';
        
        // 从HTML中提取的journal页面列表
        this.pages = [
            {
                url: '/en/journal/skyler-and-sarto',
                filename: 'skyler-and-sarto.html',
                name: 'Racing Ahead: Skyler and Sarto Hit the Dirt at High Speed'
            },
            {
                url: '/en/journal/north-country-man',
                filename: 'north-country-man.html',
                name: 'North Country Man'
            },
            {
                url: '/en/journal/sarto-at-the-ac-invitational-show',
                filename: 'sarto-at-the-ac-invitational-show.html',
                name: 'Sarto at the AC Invitational Show'
            },
            {
                url: '/en/journal/introducing-raso-marble',
                filename: 'introducing-raso-marble.html',
                name: 'Introducing RASO Marble'
            },
            {
                url: '/en/journal/on-the-potter-s-wheel',
                filename: 'on-the-potter-s-wheel.html',
                name: 'On the Potter\'s Wheel'
            },
            {
                url: '/en/journal/inside-out',
                filename: 'inside-out.html',
                name: 'Inside Out'
            },
            {
                url: '/en/journal/a-french-education',
                filename: 'a-french-education.html',
                name: 'A French Education'
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

            // 移除 Cookie 相關代碼
            $('[data-region="g0"]').remove();
            $('script[data-cookiehub]').remove();
            $('style[data-ch2inline]').remove();

            // 修复所有 https://www.sartobikes.com 的绝对路径
            const baseUrlPattern = /https:\/\/www\.sartobikes\.com/g;
            
            // 修复 link 标签（CSS等）
            $('link[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.includes('www.sartobikes.com')) {
                    const newHref = href.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('href', newHref);
                } else if (href && href.startsWith('/') && !href.startsWith('//')) {
                    $(elem).attr('href', '../..' + href);
                }
            });

            // 修复 script 标签
            $('script[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('www.sartobikes.com')) {
                    const newSrc = src.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/') && !src.startsWith('//')) {
                    $(elem).attr('src', '../..' + src);
                }
            });

            // 修复 img 标签
            $('img[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('www.sartobikes.com')) {
                    const newSrc = src.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/') && !src.startsWith('//')) {
                    $(elem).attr('src', '../..' + src);
                }
            });

            // 修复 data-img 属性
            $('[data-img]').each((i, elem) => {
                const dataImg = $(elem).attr('data-img');
                if (dataImg && dataImg.includes('www.sartobikes.com')) {
                    const newDataImg = dataImg.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('data-img', newDataImg);
                } else if (dataImg && dataImg.startsWith('/') && !dataImg.startsWith('//')) {
                    $(elem).attr('data-img', '../..' + dataImg);
                }
            });

            // 修复 meta 标签中的图片路径
            $('meta[content]').each((i, elem) => {
                const content = $(elem).attr('content');
                if (content && content.includes('www.sartobikes.com')) {
                    const newContent = content.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('content', newContent);
                }
            });

            // 修复链接
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && href.includes('www.sartobikes.com')) {
                    if (href.includes('/en/journal/')) {
                        // journal 内部链接
                        const journalSlug = href.match(/\/en\/journal\/([^\/\?]+)/)?.[1];
                        if (journalSlug) {
                            $(elem).attr('href', `./${journalSlug}.html`);
                        }
                    } else if (href.includes('/en/')) {
                        // 其他 /en/ 链接
                        let pagePath = href.replace('https://www.sartobikes.com/en/', '../../');
                        // 确保添加 .html 扩展名（如果还没有）
                        if (!pagePath.endsWith('.html') && !pagePath.includes('#')) {
                            pagePath = pagePath.replace(/\/$/, '') + '.html';
                        }
                        $(elem).attr('href', pagePath);
                    } else if (href.includes('/it')) {
                        $(elem).attr('href', '../../it');
                    } else {
                        // 其他链接转换为相对路径
                        const newHref = href.replace('https://www.sartobikes.com', '../..');
                        $(elem).attr('href', newHref);
                    }
                } else if (href && href.startsWith('/en/')) {
                    if (href.startsWith('/en/journal/')) {
                        // journal 内部链接转换为相对路径
                        const journalSlug = href.match(/\/en\/journal\/([^\/\?]+)/)?.[1];
                        if (journalSlug) {
                            $(elem).attr('href', `./${journalSlug}.html`);
                        }
                    } else {
                        // 其他 /en/ 链接转换为相对路径
                        let newHref = href.replace(/^\/en\//, '../../');
                        // 确保添加 .html 扩展名（如果还没有）
                        if (!newHref.endsWith('.html') && !newHref.includes('#')) {
                            newHref = newHref.replace(/\/$/, '') + '.html';
                        }
                        $(elem).attr('href', newHref);
                    }
                } else if (href && href.startsWith('/it')) {
                    $(elem).attr('href', '../../it');
                } else if (href && (href === '/en' || href === '/en/')) {
                    $(elem).attr('href', '../../index.html');
                } else if (href && href.startsWith('/') && !href.startsWith('//')) {
                    // 其他根路径链接，转换为相对路径
                    let newHref = '../..' + href;
                    // 如果是 /en/ 下的页面，确保添加 .html
                    if (href.startsWith('/en/') && !newHref.endsWith('.html') && !newHref.includes('#')) {
                        newHref = newHref.replace(/\/$/, '') + '.html';
                    }
                    $(elem).attr('href', newHref);
                }
            });

            // 修复 source 标签
            $('source[data-srcset]').each((i, elem) => {
                const srcset = $(elem).attr('data-srcset');
                if (srcset && srcset.includes('www.sartobikes.com')) {
                    const newSrcset = srcset.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('data-srcset', newSrcset);
                } else if (srcset && srcset.startsWith('/') && !srcset.startsWith('//')) {
                    $(elem).attr('data-srcset', '../..' + srcset);
                }
            });

            $('source[srcset]').each((i, elem) => {
                const srcset = $(elem).attr('srcset');
                if (srcset && srcset.includes('www.sartobikes.com')) {
                    const newSrcset = srcset.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('srcset', newSrcset);
                } else if (srcset && srcset.startsWith('/') && !srcset.startsWith('//')) {
                    $(elem).attr('srcset', '../..' + srcset);
                }
            });

            // 修复 video 标签
            $('video[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('www.sartobikes.com')) {
                    const newSrc = src.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('src', newSrc);
                } else if (src && src.startsWith('/') && !src.startsWith('//')) {
                    $(elem).attr('src', '../..' + src);
                }
            });

            $('video[data-src]').each((i, elem) => {
                const dataSrc = $(elem).attr('data-src');
                if (dataSrc && dataSrc.includes('www.sartobikes.com')) {
                    const newDataSrc = dataSrc.replace('https://www.sartobikes.com', '../..');
                    $(elem).attr('data-src', newDataSrc);
                } else if (dataSrc && dataSrc.startsWith('/') && !dataSrc.startsWith('//')) {
                    $(elem).attr('data-src', '../..' + dataSrc);
                }
            });

            // 后处理：修复一些特殊情况
            // 修复 ../../en 链接
            $('a[href="../../en"]').attr('href', '../../index.html');
            $('a[href="../..en"]').attr('href', '../../index.html');

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
        console.log('🚀 开始下载 Journal 页面...\n');
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
    const downloader = new JournalPagesDownloader();
    await downloader.start();
}

// 运行脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    });
}

module.exports = JournalPagesDownloader;

