const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class BikeProductDownloader {
    constructor() {
        this.baseUrl = 'https://www.sartobikes.com';
        this.outputDir = './public/storage/bikeprod';
        
        // 需要下载的文件列表（从bikes.html中提取）
        this.files = [
            // ID 22 - Raso TC
            { id: 22, files: ['L_raso-verde_1-min.jpg'] },
            
            // ID 2 - Seta Plus TC
            { id: 2, files: ['L_hero-desktop_0.jpg', 'setatricomposite.mp4'] },
            
            // ID 16 - Seta Gravel TC
            { id: 16, files: ['L_gravel-tc_header.jpg', 'gravelta.mp4'] },
            
            // ID 21 - Raso
            { id: 21, files: ['L_r_flavoured2_er3380.jpg'] },
            
            // ID 26 - Raso Gravel Wide
            { id: 26, files: ['L_sarto-raso-gravel-wide.jpg', 'gravel.mp4'] },
            
            // ID 24 - Raso Gravel
            { id: 24, files: ['L_sarto-raso-gravel-su-misura.jpg'] },
            
            // ID 6 - Seta Plus
            { id: 6, files: ['L_hero-desktop-at-2x.jpg', 'setaplus.mp4'] },
            
            // ID 14 - Lampo Plus
            { id: 14, files: ['L_hero-desktop_0.jpg', 'lampo.mp4'] },
            
            // ID 7 - Asola plus
            { id: 7, files: ['L_hero-desktop_0.jpg', 'asola.mp4'] },
            
            // ID 15 - Gravel TA plus
            { id: 15, files: ['L_gravel-ta_header.jpg', 'gravelta.mp4'] },
            
            // ID 23 - Doppio
            { id: 23, files: ['L_header.jpg'] },
            
            // ID 20 - Seta
            { id: 20, files: ['L_hero-desktop.jpg', 'setaplus.mp4'] },
            
            // ID 19 - Asola
            { id: 19, files: ['L_hero-desktop.jpg', 'asola.mp4'] },
            
            // ID 17 - Veneto SL
            { id: 17, files: ['L_hero-desktop.jpg', 'veneto.mp4'] }
        ];
        
        this.stats = {
            total: 0,
            downloaded: 0,
            skipped: 0,
            failed: 0
        };
    }

    async downloadFile(url, outputPath) {
        try {
            // 检查文件是否已存在
            if (await fs.pathExists(outputPath)) {
                console.log(`⏭️  跳过已存在: ${path.basename(outputPath)}`);
                this.stats.skipped++;
                return true;
            }

            // 确保目录存在
            await fs.ensureDir(path.dirname(outputPath));

            // 下载文件
            const response = await axios.get(url, {
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            // 保存文件
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ 已下载: ${path.basename(outputPath)}`);
                    this.stats.downloaded++;
                    resolve(true);
                });
                writer.on('error', reject);
            });

        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`❌ 404未找到: ${path.basename(outputPath)}`);
            } else {
                console.log(`❌ 下载失败: ${path.basename(outputPath)} - ${error.message}`);
            }
            this.stats.failed++;
            return false;
        }
    }

    async downloadBikeProduct(productId, files) {
        console.log(`\n📦 处理产品 ID ${productId}...`);
        
        for (const filename of files) {
            const url = `${this.baseUrl}/storage/bikeprod/${productId}/${filename}`;
            const outputPath = path.join(this.outputDir, productId.toString(), filename);
            
            await this.downloadFile(url, outputPath);
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async start() {
        console.log('🚀 开始下载自行车产品图片和视频...\n');
        console.log(`📁 输出目录: ${path.resolve(this.outputDir)}\n`);

        // 计算总文件数
        this.stats.total = this.files.reduce((sum, item) => sum + item.files.length, 0);

        // 下载所有产品
        for (const product of this.files) {
            await this.downloadBikeProduct(product.id, product.files);
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
    const downloader = new BikeProductDownloader();
    await downloader.start();
}

// 运行脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    });
}

module.exports = BikeProductDownloader;

