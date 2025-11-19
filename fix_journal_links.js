const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

class JournalLinksFixer {
    constructor() {
        this.baseUrl = 'https://demo-sartooo.vercel.app';
        this.journalPages = [
            'skyler-and-sarto',
            'north-country-man',
            'sarto-at-the-ac-invitational-show',
            'introducing-raso-marble',
            'on-the-potter-s-wheel',
            'inside-out',
            'a-french-education'
        ];
    }

    async fixJournalListPage() {
        const filePath = path.join(__dirname, 'public', 'en', 'journal.html');
        console.log(`📝 修复: ${filePath}`);
        
        const html = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(html);

        // 修复所有 journal 文章链接
        this.journalPages.forEach(page => {
            $(`a[href="./journal/${page}.html"]`).each((i, elem) => {
                $(elem).attr('href', `${this.baseUrl}/en/journal/${page}.html`);
            });
        });

        const newHtml = $.html();
        await fs.writeFile(filePath, newHtml, 'utf8');
        console.log(`✅ 已修复 journal.html`);
    }

    async fixJournalDetailPage(filename) {
        const filePath = path.join(__dirname, 'public', 'en', 'journal', filename);
        if (!await fs.pathExists(filePath)) {
            console.log(`⏭️  文件不存在: ${filename}`);
            return;
        }

        console.log(`📝 修复: ${filename}`);
        const html = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(html);

        const pageSlug = filename.replace('.html', '');

        // 修复分享链接
        $(`a[href="./${filename}"]`).each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && (href.includes('whatsapp') || href.includes('Facebook') || href.includes('Twitter'))) {
                $(elem).attr('href', `${this.baseUrl}/en/journal/${filename}`);
            }
        });

        // 修复其他 journal 页面的链接
        this.journalPages.forEach(page => {
            $(`a[href="./${page}.html"]`).each((i, elem) => {
                $(elem).attr('href', `${this.baseUrl}/en/journal/${page}.html`);
            });
        });

        const newHtml = $.html();
        await fs.writeFile(filePath, newHtml, 'utf8');
        console.log(`✅ 已修复 ${filename}`);
    }

    async start() {
        console.log('🚀 开始修复 journal 链接...\n');

        // 修复 journal 列表页
        await this.fixJournalListPage();

        // 修复各个 journal 详情页
        for (const page of this.journalPages) {
            await this.fixJournalDetailPage(`${page}.html`);
        }

        console.log('\n✨ 所有链接修复完成！');
    }
}

// 主函数
async function main() {
    const fixer = new JournalLinksFixer();
    await fixer.start();
}

// 运行脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    });
}

module.exports = JournalLinksFixer;

