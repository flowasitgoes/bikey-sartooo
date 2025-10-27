const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { URL } = require('url');

class WebsiteDownloader {
    constructor(baseUrl, outputDir = './public') {
        this.baseUrl = baseUrl;
        this.outputDir = outputDir;
        this.downloadedUrls = new Set();
        this.baseDomain = new URL(baseUrl).origin;
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 启动浏览器...');
        this.browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // 设置用户代理
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 确保输出目录存在
        await fs.ensureDir(this.outputDir);
        await fs.ensureDir(path.join(this.outputDir, 'assets'));
        await fs.ensureDir(path.join(this.outputDir, 'css'));
        await fs.ensureDir(path.join(this.outputDir, 'js'));
        await fs.ensureDir(path.join(this.outputDir, 'images'));
        await fs.ensureDir(path.join(this.outputDir, 'fonts'));
    }

    async downloadPage(url) {
        if (this.downloadedUrls.has(url)) {
            return;
        }

        console.log(`📄 下载页面: ${url}`);
        this.downloadedUrls.add(url);

        try {
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // 等待页面完全加载
            await this.page.waitForTimeout(2000);

            // 获取页面内容
            const content = await this.page.content();
            const $ = cheerio.load(content);

            // 处理所有资源链接
            await this.processResources($, url);

            // 保存HTML文件
            const relativePath = this.getRelativePath(url);
            const filePath = path.join(this.outputDir, relativePath);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content);

            console.log(`✅ 页面已保存: ${filePath}`);

        } catch (error) {
            console.error(`❌ 下载页面失败 ${url}:`, error.message);
        }
    }

    async processResources($, currentUrl) {
        const baseUrl = new URL(currentUrl);
        
        // 处理CSS文件
        await this.processResourceType($, 'link[rel="stylesheet"]', 'href', baseUrl, 'css');
        
        // 处理JavaScript文件
        await this.processResourceType($, 'script[src]', 'src', baseUrl, 'js');
        
        // 处理图片
        await this.processResourceType($, 'img[src]', 'src', baseUrl, 'images');
        await this.processResourceType($, 'img[data-src]', 'data-src', baseUrl, 'images');
        
        // 处理背景图片（在CSS中）
        await this.processBackgroundImages($, baseUrl);
        
        // 处理CSS中的字体URL
        await this.processFontUrls($, baseUrl);
        
        // 处理字体文件
        await this.processResourceType($, 'link[href*=".woff2"]', 'href', baseUrl, 'fonts');
        await this.processResourceType($, 'link[href*=".woff"]', 'href', baseUrl, 'fonts');
        await this.processResourceType($, 'link[href*=".ttf"]', 'href', baseUrl, 'fonts');
        await this.processResourceType($, 'link[href*=".eot"]', 'href', baseUrl, 'fonts');
        
        // 处理其他资源
        await this.processResourceType($, 'link[href*=".ico"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".png"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".jpg"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".jpeg"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".gif"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".svg"]', 'href', baseUrl, 'assets');
        await this.processResourceType($, 'link[href*=".webp"]', 'href', baseUrl, 'assets');
    }

    async processResourceType($, selector, attr, baseUrl, assetType) {
        const elements = $(selector);
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements.eq(i);
            const resourceUrl = element.attr(attr);
            
            if (resourceUrl) {
                try {
                    const absoluteUrl = new URL(resourceUrl, baseUrl).href;
                    const localPath = await this.downloadAsset(absoluteUrl, assetType);
                    
                    if (localPath) {
                        // 更新HTML中的链接
                        const relativePath = path.relative(this.outputDir, localPath);
                        element.attr(attr, `./${relativePath.replace(/\\/g, '/')}`);
                    }
                } catch (error) {
                    console.error(`❌ 处理资源失败 ${resourceUrl}:`, error.message);
                }
            }
        }
    }

    async processBackgroundImages($, baseUrl) {
        // 查找内联样式中的背景图片
        $('*').each((i, element) => {
            const $el = $(element);
            const style = $el.attr('style');
            
            if (style && style.includes('background-image')) {
                const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
                if (match) {
                    const imageUrl = match[1];
                    try {
                        const absoluteUrl = new URL(imageUrl, baseUrl).href;
                        this.downloadAsset(absoluteUrl, 'images').then(localPath => {
                            if (localPath) {
                                const relativePath = path.relative(this.outputDir, localPath);
                                const newStyle = style.replace(
                                    /background-image:\s*url\(['"]?[^'"]+['"]?\)/,
                                    `background-image: url('./${relativePath.replace(/\\/g, '/')}')`
                                );
                                $el.attr('style', newStyle);
                            }
                        });
                    } catch (error) {
                        console.error(`❌ 处理背景图片失败 ${imageUrl}:`, error.message);
                    }
                }
            }
        });
    }

    async processFontUrls($, baseUrl) {
        // 处理CSS文件中的字体URL
        $('link[rel="stylesheet"]').each(async (i, element) => {
            const $el = $(element);
            const href = $el.attr('href');
            
            if (href && href.startsWith('http')) {
                try {
                    const absoluteUrl = new URL(href, baseUrl).href;
                    const response = await axios.get(absoluteUrl);
                    let cssContent = response.data;
                    
                    // 查找并下载字体文件
                    const fontUrlRegex = /url\(['"]?([^'"]*\.(woff2?|ttf|eot|otf))['"]?\)/gi;
                    const fontUrls = cssContent.match(fontUrlRegex);
                    
                    if (fontUrls) {
                        for (const fontUrlMatch of fontUrls) {
                            const fontUrl = fontUrlMatch.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
                            try {
                                const absoluteFontUrl = new URL(fontUrl, absoluteUrl).href;
                                const localPath = await this.downloadAsset(absoluteFontUrl, 'fonts');
                                
                                if (localPath) {
                                    const relativePath = path.relative(this.outputDir, localPath);
                                    cssContent = cssContent.replace(fontUrl, `./${relativePath.replace(/\\/g, '/')}`);
                                }
                            } catch (error) {
                                console.error(`❌ 处理字体URL失败 ${fontUrl}:`, error.message);
                            }
                        }
                        
                        // 保存修改后的CSS文件
                        const fileName = path.basename(new URL(absoluteUrl).pathname);
                        const cssPath = path.join(this.outputDir, 'css', fileName);
                        await fs.writeFile(cssPath, cssContent);
                        console.log(`✅ CSS文件已更新: ${cssPath}`);
                    }
                } catch (error) {
                    console.error(`❌ 处理CSS文件失败 ${href}:`, error.message);
                }
            }
        });
    }

    async downloadAsset(url, assetType) {
        if (this.downloadedUrls.has(url)) {
            return this.getLocalPath(url, assetType);
        }

        try {
            console.log(`📦 下载资源: ${url}`);
            this.downloadedUrls.add(url);

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const urlObj = new URL(url);
            const fileName = path.basename(urlObj.pathname) || 'asset';
            const filePath = path.join(this.outputDir, assetType, fileName);

            await fs.writeFile(filePath, response.data);
            console.log(`✅ 资源已保存: ${filePath}`);

            return filePath;

        } catch (error) {
            console.error(`❌ 下载资源失败 ${url}:`, error.message);
            return null;
        }
    }

    getLocalPath(url, assetType) {
        const urlObj = new URL(url);
        const fileName = path.basename(urlObj.pathname) || 'asset';
        return path.join(this.outputDir, assetType, fileName);
    }

    getRelativePath(url) {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;
        
        if (pathname === '/' || pathname === '') {
            return 'index.html';
        }
        
        if (!pathname.endsWith('.html') && !pathname.endsWith('/')) {
            pathname += '.html';
        }
        
        return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    }

    async download() {
        try {
            await this.init();
            console.log(`🌐 开始下载网站: ${this.baseUrl}`);
            
            // 下载主页面
            await this.downloadPage(this.baseUrl);
            
            // 查找并下载其他页面链接
            const links = await this.page.$$eval('a[href]', links => 
                links.map(link => link.href).filter(href => 
                    href.startsWith(this.baseUrl) && !href.includes('#')
                )
            );

            console.log(`🔗 发现 ${links.length} 个内部链接`);
            
            for (const link of links) {
                if (!this.downloadedUrls.has(link)) {
                    await this.downloadPage(link);
                }
            }

            console.log('🎉 下载完成！');
            console.log(`📁 文件保存在: ${path.resolve(this.outputDir)}`);

        } catch (error) {
            console.error('❌ 下载过程中出现错误:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// 主函数
async function main() {
    const baseUrl = 'https://www.sartobikes.com/en';
    const outputDir = './public';
    
    const downloader = new WebsiteDownloader(baseUrl, outputDir);
    await downloader.download();
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = WebsiteDownloader;
