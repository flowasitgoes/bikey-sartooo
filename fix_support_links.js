const fs = require('fs-extra');
const path = require('path');

async function fixSupportLinks() {
    const enDir = './public/en';
    const allFiles = await fs.readdir(enDir);
    const files = allFiles
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(enDir, f));
    
    console.log(`🔧 修复 ${files.length} 个文件中的 Support 链接...\n`);
    
    let fixed = 0;
    
    for (const file of files) {
        try {
            let content = await fs.readFile(file, 'utf8');
            let modified = false;
            
            // 修复 Support 菜单链接
            const replacements = [
                { from: 'href="../a-sarto-is-forever"', to: 'href="./a-sarto-is-forever.html"' },
                { from: 'href="../faq-and-warranty"', to: 'href="./faq-and-warranty.html"' },
                { from: 'href="../register-your-sarto"', to: 'href="./register-your-sarto.html"' },
                { from: 'href="../contacts"', to: 'href="./contacts.html"' },
                { from: 'href="../dealers"', to: 'href="./dealers.html"' }
            ];
            
            for (const { from, to } of replacements) {
                if (content.includes(from)) {
                    content = content.replace(new RegExp(from, 'g'), to);
                    modified = true;
                }
            }
            
            if (modified) {
                await fs.writeFile(file, content, 'utf8');
                console.log(`✅ 已修复: ${path.basename(file)}`);
                fixed++;
            } else {
                console.log(`⏭️  无需修复: ${path.basename(file)}`);
            }
            
        } catch (error) {
            console.log(`❌ 错误: ${path.basename(file)} - ${error.message}`);
        }
    }
    
    console.log(`\n✨ 完成！共修复 ${fixed} 个文件`);
}

fixSupportLinks().catch(console.error);

