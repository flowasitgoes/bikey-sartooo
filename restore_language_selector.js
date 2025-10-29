const fs = require('fs-extra');
const path = require('path');

async function restoreLanguageSelector() {
    const enDir = './public/en';
    const allFiles = await fs.readdir(enDir);
    const files = allFiles
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(enDir, f));
    
    console.log(`🔧 恢复 ${files.length} 个文件的语言选择器（隐藏 it 选项）...\n`);
    
    let fixed = 0;
    
    for (const file of files) {
        try {
            let content = await fs.readFile(file, 'utf8');
            
            // 查找被注释的语言选择器
            const commentPattern = /<!--\s*语言选择器暂时隐藏\s*([\s\S]*?)-->/;
            
            if (commentPattern.test(content)) {
                // 移除外层注释
                content = content.replace(commentPattern, '$1');
                
                // 只注释掉 it 选项
                content = content.replace(
                    /<li><a href="[^"]*\/it"><span class="nome">Italiano<\/span><span class="sigla">it<\/span><\/a><\/li>/g,
                    '<!-- <li><a href="/it"><span class="nome">Italiano</span><span class="sigla">it</span></a></li> -->'
                );
                
                await fs.writeFile(file, content, 'utf8');
                console.log(`✅ 已恢复: ${path.basename(file)}`);
                fixed++;
            } else {
                // 如果没有外层注释，直接隐藏 it 选项
                const itPattern = /<li><a href="[^"]*\/it"><span class="nome">Italiano<\/span><span class="sigla">it<\/span><\/a><\/li>/;
                
                if (itPattern.test(content)) {
                    content = content.replace(
                        itPattern,
                        '<!-- <li><a href="/it"><span class="nome">Italiano</span><span class="sigla">it</span></a></li> -->'
                    );
                    
                    await fs.writeFile(file, content, 'utf8');
                    console.log(`✅ 已隐藏 it: ${path.basename(file)}`);
                    fixed++;
                } else {
                    console.log(`⏭️  无需处理: ${path.basename(file)}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ 错误: ${path.basename(file)} - ${error.message}`);
        }
    }
    
    console.log(`\n✨ 完成！共处理 ${fixed} 个文件`);
}

restoreLanguageSelector().catch(console.error);

