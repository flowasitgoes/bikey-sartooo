const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class MissingAssetsDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.publicDir = './public';
        
        // 从错误日志中提取的缺失资源列表
        this.assets = [
            // SVG 图标
            { url: '/img/icons/load-black.svg', localPath: 'img/icons/load-black.svg' },
            { url: '/img/icons/share.svg', localPath: 'img/icons/share.svg' },
            { url: '/img/icons/btn-arrow-white.svg', localPath: 'img/icons/btn-arrow-white.svg' },
            { url: '/img/icons/mouse-plus-white.svg', localPath: 'img/icons/mouse-plus-white.svg' },
            { url: '/img/icons/mouse-prev-white.svg', localPath: 'img/icons/mouse-prev-white.svg' },
            { url: '/img/bg-load.svg', localPath: 'img/bg-load.svg' },
            
            // Journal 图片和视频
            { url: '/img/journal/settembre24@2x.jpg', localPath: 'img/journal/settembre24@2x.jpg' },
            { url: '/img/journal/sarto-marble.webp', localPath: 'img/journal/sarto-marble.webp' },
            { url: '/img/journal/sarto-marble.mp4', localPath: 'img/journal/sarto-marble.mp4' },
            
            // Storage/widget 图片 - Skyler and Sarto
            { url: '/storage/widget/303/P_project_20250502-skyler-sarto-0150.jpg', localPath: 'storage/widget/303/P_project_20250502-skyler-sarto-0150.jpg' },
            { url: '/storage/widget/303/M_project_20250502-skyler-sarto-0150.jpg', localPath: 'storage/widget/303/M_project_20250502-skyler-sarto-0150.jpg' },
            { url: '/storage/widget/304/P_project_20250502-skyler-sarto-0663.jpg', localPath: 'storage/widget/304/P_project_20250502-skyler-sarto-0663.jpg' },
            { url: '/storage/widget/304/M_project_20250502-skyler-sarto-0663.jpg', localPath: 'storage/widget/304/M_project_20250502-skyler-sarto-0663.jpg' },
            { url: '/storage/widget/313/P_project_20250502-skyler-sarto-0232.jpg', localPath: 'storage/widget/313/P_project_20250502-skyler-sarto-0232.jpg' },
            { url: '/storage/widget/313/M_project_20250502-skyler-sarto-0232.jpg', localPath: 'storage/widget/313/M_project_20250502-skyler-sarto-0232.jpg' },
            { url: '/storage/widget/307/P_project_20250502-skyler-sarto-0316.jpg', localPath: 'storage/widget/307/P_project_20250502-skyler-sarto-0316.jpg' },
            { url: '/storage/widget/317/P_project_20250502-skyler-sarto-0618.jpg', localPath: 'storage/widget/317/P_project_20250502-skyler-sarto-0618.jpg' },
            { url: '/storage/widget/315/P_project_20250502-skyler-sarto-0729.jpg', localPath: 'storage/widget/315/P_project_20250502-skyler-sarto-0729.jpg' },
            
            // Storage/widget 图片 - North Country Man
            { url: '/storage/widget/287/P_gary-sarto-lampo-14.jpg', localPath: 'storage/widget/287/P_gary-sarto-lampo-14.jpg' },
            { url: '/storage/widget/287/M_gary-sarto-lampo-14.jpg', localPath: 'storage/widget/287/M_gary-sarto-lampo-14.jpg' },
            { url: '/storage/widget/277/P_gary-sarto-lampo-9.jpg', localPath: 'storage/widget/277/P_gary-sarto-lampo-9.jpg' },
            { url: '/storage/widget/277/M_gary-sarto-lampo-9.jpg', localPath: 'storage/widget/277/M_gary-sarto-lampo-9.jpg' },
            { url: '/storage/widget/300/gallery_1/P_gary-sarto-lampo-2.jpg', localPath: 'storage/widget/300/gallery_1/P_gary-sarto-lampo-2.jpg' },
            { url: '/storage/widget/300/gallery_2/P_gary-sarto-lampo-2.jpg', localPath: 'storage/widget/300/gallery_2/P_gary-sarto-lampo-2.jpg' },
            { url: '/storage/widget/296/P_gary-sarto-lampo-1.jpg', localPath: 'storage/widget/296/P_gary-sarto-lampo-1.jpg' },
            { url: '/storage/widget/297/P_gary-sarto-lampo-16.jpg', localPath: 'storage/widget/297/P_gary-sarto-lampo-16.jpg' },
            { url: '/storage/widget/298/gallery_1/P_gary-sarto-lampo-38-3.jpg', localPath: 'storage/widget/298/gallery_1/P_gary-sarto-lampo-38-3.jpg' },
            { url: '/storage/widget/298/gallery_2/P_gary-sarto-lampo-38-3.jpg', localPath: 'storage/widget/298/gallery_2/P_gary-sarto-lampo-38-3.jpg' },
            { url: '/storage/widget/282/P_gary-sarto-lampo-23.jpg', localPath: 'storage/widget/282/P_gary-sarto-lampo-23.jpg' },
            { url: '/storage/widget/284/gallery_1/P_gary-sarto-lampo-13.jpg', localPath: 'storage/widget/284/gallery_1/P_gary-sarto-lampo-13.jpg' },
            { url: '/storage/widget/284/gallery_2/P_gary-sarto-lampo-13.jpg', localPath: 'storage/widget/284/gallery_2/P_gary-sarto-lampo-13.jpg' },
            { url: '/storage/widget/299/P_gary-sarto-lampo-35.jpg', localPath: 'storage/widget/299/P_gary-sarto-lampo-35.jpg' },
            
            // Storage/widget 图片 - AC Invitational Show
            { url: '/storage/widget/272/gallery_1/P_gallery-a.jpg', localPath: 'storage/widget/272/gallery_1/P_gallery-a.jpg' },
            { url: '/storage/widget/272/gallery_1/L_gallery-a.jpg', localPath: 'storage/widget/272/gallery_1/L_gallery-a.jpg' },
            { url: '/storage/widget/272/gallery_1/P_gallery-b.jpg', localPath: 'storage/widget/272/gallery_1/P_gallery-b.jpg' },
            { url: '/storage/widget/272/gallery_1/P_gallery-c.jpg', localPath: 'storage/widget/272/gallery_1/P_gallery-c.jpg' },
            { url: '/storage/widget/272/gallery_1/P_gallery-d.jpg', localPath: 'storage/widget/272/gallery_1/P_gallery-d.jpg' },
            { url: '/storage/widget/272/gallery_1/P_gallery-e.jpg', localPath: 'storage/widget/272/gallery_1/P_gallery-e.jpg' },
            { url: '/storage/widget/272/gallery_2/P_gallery-a-mobile.jpg', localPath: 'storage/widget/272/gallery_2/P_gallery-a-mobile.jpg' },
            { url: '/storage/widget/272/gallery_2/P_gallery-b-mobile.jpg', localPath: 'storage/widget/272/gallery_2/P_gallery-b-mobile.jpg' },
            { url: '/storage/widget/272/gallery_2/P_gallery-c-mobile.jpg', localPath: 'storage/widget/272/gallery_2/P_gallery-c-mobile.jpg' },
            { url: '/storage/widget/272/gallery_2/P_gallery-d-mobile.jpg', localPath: 'storage/widget/272/gallery_2/P_gallery-d-mobile.jpg' },
            { url: '/storage/widget/272/gallery_2/P_gallery-e-mobile.jpg', localPath: 'storage/widget/272/gallery_2/P_gallery-e-mobile.jpg' },
            { url: '/storage/widget/274/P_sarto-all-ac-invitational-show-a.jpg', localPath: 'storage/widget/274/P_sarto-all-ac-invitational-show-a.jpg' },
            { url: '/storage/widget/274/M_sarto-all-ac-invitational-show-a.jpg', localPath: 'storage/widget/274/M_sarto-all-ac-invitational-show-a.jpg' },
            { url: '/storage/widget/274/P_sarto-all-ac-invitational-show-b.jpg', localPath: 'storage/widget/274/P_sarto-all-ac-invitational-show-b.jpg' },
            { url: '/storage/widget/274/S_sarto-all-ac-invitational-show-b.jpg', localPath: 'storage/widget/274/S_sarto-all-ac-invitational-show-b.jpg' },
            
            // Storage/widget 图片 - Introducing RASO Marble
            { url: '/storage/widget/260/gallery_1/P_gallery1-a.jpg', localPath: 'storage/widget/260/gallery_1/P_gallery1-a.jpg' },
            { url: '/storage/widget/260/gallery_1/L_gallery1-a.jpg', localPath: 'storage/widget/260/gallery_1/L_gallery1-a.jpg' },
            { url: '/storage/widget/260/gallery_1/P_gallery1-b.jpg', localPath: 'storage/widget/260/gallery_1/P_gallery1-b.jpg' },
            { url: '/storage/widget/260/gallery_1/P_gallery1-c.jpg', localPath: 'storage/widget/260/gallery_1/P_gallery1-c.jpg' },
            { url: '/storage/widget/260/gallery_1/P_gallery1-d.jpg', localPath: 'storage/widget/260/gallery_1/P_gallery1-d.jpg' },
            { url: '/storage/widget/260/gallery_1/P_gallery1-e.jpg', localPath: 'storage/widget/260/gallery_1/P_gallery1-e.jpg' },
            { url: '/storage/widget/260/gallery_2/P_gallery1-a-mobile.jpg', localPath: 'storage/widget/260/gallery_2/P_gallery1-a-mobile.jpg' },
            { url: '/storage/widget/260/gallery_2/P_gallery1-b-mobile.jpg', localPath: 'storage/widget/260/gallery_2/P_gallery1-b-mobile.jpg' },
            { url: '/storage/widget/260/gallery_2/P_gallery1-c-mobile.jpg', localPath: 'storage/widget/260/gallery_2/P_gallery1-c-mobile.jpg' },
            { url: '/storage/widget/260/gallery_2/P_gallery1-d-mobile.jpg', localPath: 'storage/widget/260/gallery_2/P_gallery1-d-mobile.jpg' },
            { url: '/storage/widget/260/gallery_2/P_gallery1-e-mobile.jpg', localPath: 'storage/widget/260/gallery_2/P_gallery1-e-mobile.jpg' },
            { url: '/storage/widget/262/P_introducing-raso-marble-r2.webp', localPath: 'storage/widget/262/P_introducing-raso-marble-r2.webp' },
            { url: '/storage/widget/262/S_introducing-raso-marble-r2.webp', localPath: 'storage/widget/262/S_introducing-raso-marble-r2.webp' },
            { url: '/storage/widget/262/P_introducing-raso-marble-r2-b.webp', localPath: 'storage/widget/262/P_introducing-raso-marble-r2-b.webp' },
            { url: '/storage/widget/262/S_introducing-raso-marble-r2-b.webp', localPath: 'storage/widget/262/S_introducing-raso-marble-r2-b.webp' },
            { url: '/storage/widget/264/P_introducing-raso-marble-r3.webp', localPath: 'storage/widget/264/P_introducing-raso-marble-r3.webp' },
            { url: '/storage/widget/264/S_introducing-raso-marble-r3.webp', localPath: 'storage/widget/264/S_introducing-raso-marble-r3.webp' },
            { url: '/storage/widget/266/gallery_1/P_gallery2-a.jpg', localPath: 'storage/widget/266/gallery_1/P_gallery2-a.jpg' },
            { url: '/storage/widget/266/gallery_1/L_gallery2-a.jpg', localPath: 'storage/widget/266/gallery_1/L_gallery2-a.jpg' },
            { url: '/storage/widget/266/gallery_1/P_gallery2-b.jpg', localPath: 'storage/widget/266/gallery_1/P_gallery2-b.jpg' },
            { url: '/storage/widget/266/gallery_1/P_gallery2-c.jpg', localPath: 'storage/widget/266/gallery_1/P_gallery2-c.jpg' },
            { url: '/storage/widget/266/gallery_1/P_gallery2-d.jpg', localPath: 'storage/widget/266/gallery_1/P_gallery2-d.jpg' },
            { url: '/storage/widget/266/gallery_2/P_gallery2-a-mobile.jpg', localPath: 'storage/widget/266/gallery_2/P_gallery2-a-mobile.jpg' },
            { url: '/storage/widget/266/gallery_2/P_gallery2-b-mobile.jpg', localPath: 'storage/widget/266/gallery_2/P_gallery2-b-mobile.jpg' },
            { url: '/storage/widget/266/gallery_2/P_gallery2-c-mobile.jpg', localPath: 'storage/widget/266/gallery_2/P_gallery2-c-mobile.jpg' },
            { url: '/storage/widget/266/gallery_2/P_gallery2-d-mobile.jpg', localPath: 'storage/widget/266/gallery_2/P_gallery2-d-mobile.jpg' },
            
            // Storage/widget 图片 - On the Potter's Wheel
            { url: '/storage/widget/241/P_on-the-potter-s-wheel-r1a.jpg', localPath: 'storage/widget/241/P_on-the-potter-s-wheel-r1a.jpg' },
            { url: '/storage/widget/241/M_on-the-potter-s-wheel-r1a.jpg', localPath: 'storage/widget/241/M_on-the-potter-s-wheel-r1a.jpg' },
            { url: '/storage/widget/241/P_on-the-potter-s-wheel-r1b.jpg', localPath: 'storage/widget/241/P_on-the-potter-s-wheel-r1b.jpg' },
            { url: '/storage/widget/241/M_on-the-potter-s-wheel-r1b.jpg', localPath: 'storage/widget/241/M_on-the-potter-s-wheel-r1b.jpg' },
            { url: '/storage/widget/243/P_on-the-potter-s-wheel-r2a.jpg', localPath: 'storage/widget/243/P_on-the-potter-s-wheel-r2a.jpg' },
            { url: '/storage/widget/243/P_on-the-potter-s-wheel-r2b.jpg', localPath: 'storage/widget/243/P_on-the-potter-s-wheel-r2b.jpg' },
            { url: '/storage/widget/245/P_on-the-potter-s-wheel-r3.webp', localPath: 'storage/widget/245/P_on-the-potter-s-wheel-r3.webp' },
            { url: '/storage/widget/247/P_on-the-potter-s-wheel-r4_0.webp', localPath: 'storage/widget/247/P_on-the-potter-s-wheel-r4_0.webp' },
            { url: '/storage/widget/249/P_on-the-potter-s-wheel-r5.webp', localPath: 'storage/widget/249/P_on-the-potter-s-wheel-r5.webp' },
            { url: '/storage/widget/251/P_on-the-potter-s-wheel-r6a.webp', localPath: 'storage/widget/251/P_on-the-potter-s-wheel-r6a.webp' },
            { url: '/storage/widget/251/P_on-the-potter-s-wheel-r6b.webp', localPath: 'storage/widget/251/P_on-the-potter-s-wheel-r6b.webp' },
            { url: '/storage/widget/253/P_on-the-potter-s-wheel-r7a.webp', localPath: 'storage/widget/253/P_on-the-potter-s-wheel-r7a.webp' },
            { url: '/storage/widget/253/P_on-the-potter-s-wheel-r7b.webp', localPath: 'storage/widget/253/P_on-the-potter-s-wheel-r7b.webp' },
            { url: '/storage/widget/255/P_on-the-potter-s-wheel-r8.webp', localPath: 'storage/widget/255/P_on-the-potter-s-wheel-r8.webp' },
        ];
        
        this.stats = {
            total: this.assets.length,
            downloaded: 0,
            skipped: 0,
            failed: 0
        };
    }

    async downloadFile(asset) {
        try {
            const fullUrl = `${this.baseUrl}${asset.url}`;
            const localPath = path.join(this.publicDir, asset.localPath);

            // 检查文件是否已存在
            if (await fs.pathExists(localPath)) {
                console.log(`⏭️  跳过已存在: ${asset.localPath}`);
                this.stats.skipped++;
                return true;
            }

            console.log(`📥 下载中: ${asset.localPath}...`);

            // 确保目录存在
            await fs.ensureDir(path.dirname(localPath));

            // 下载文件
            const response = await axios.get(fullUrl, {
                responseType: 'stream',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': '*/*'
                }
            });

            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ 已下载: ${asset.localPath}`);
                    this.stats.downloaded++;
                    resolve();
                });
                writer.on('error', reject);
            });

            return true;

        } catch (error) {
            console.log(`❌ 下载失败: ${asset.localPath} - ${error.message}`);
            this.stats.failed++;
            return false;
        }
    }

    async start() {
        console.log('🚀 开始下载缺失的资源文件...\n');
        console.log(`📁 输出目录: ${path.resolve(this.publicDir)}\n`);
        console.log(`📊 总共 ${this.assets.length} 个文件需要下载\n`);

        for (const asset of this.assets) {
            await this.downloadFile(asset);
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 显示统计
        console.log('\n' + '='.repeat(50));
        console.log('📊 下载统计:');
        console.log(`   总文件数: ${this.stats.total}`);
        console.log(`   ✅ 已下载: ${this.stats.downloaded}`);
        console.log(`   ⏭️  已跳过: ${this.stats.skipped}`);
        console.log(`   ❌ 失败: ${this.stats.failed}`);
        console.log('='.repeat(50));

        if (this.stats.failed > 0) {
            console.log('\n⚠️  部分文件下载失败，请检查日志');
        } else {
            console.log('\n✨ 所有文件下载完成！');
        }
    }
}

// 主函数
async function main() {
    const downloader = new MissingAssetsDownloader();
    await downloader.start();
}

// 运行脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    });
}

module.exports = MissingAssetsDownloader;

