const fs = require('fs-extra');
const path = require('path');

async function hideLanguageSelector() {
    const enDir = './public/en';
    const allFiles = await fs.readdir(enDir);
    const files = allFiles
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(enDir, f));
    
    console.log(`🔧 隐藏 ${files.length} 个文件中的语言选择器...\n`);
    
    let fixed = 0;
    
    for (const file of files) {
        try {
            let content = await fs.readFile(file, 'utf8');
            
            // 查找语言选择器的开始和结束
            const languageStart = '<li class="languages">';
            const languageEndPattern = /<\/li>[\s\n]*<\/ul>/;
            
            if (content.includes(languageStart)) {
                // 使用正则表达式找到完整的语言选择器块
                const regex = /(\s*)<li class="languages">[\s\S]*?<\/li>(\s*)<\/ul>/;
                
                if (regex.test(content)) {
                    content = content.replace(
                        regex,
                        (match, before, after) => {
                            return `${before}<!-- 语言选择器暂时隐藏\n${match.trim()}\n                    -->${after}</ul>`;
                        }
                    );
                    
                    await fs.writeFile(file, content, 'utf8');
                    console.log(`✅ 已隐藏: ${path.basename(file)}`);
                    fixed++;
                } else {
                    console.log(`⏭️  未找到完整块: ${path.basename(file)}`);
                }
            } else {
                console.log(`⏭️  无需处理: ${path.basename(file)}`);
            }
            
        } catch (error) {
            console.log(`❌ 错误: ${path.basename(file)} - ${error.message}`);
        }
    }
    
    console.log(`\n✨ 完成！共隐藏 ${fixed} 个文件的语言选择器`);
}

hideLanguageSelector().catch(console.error);

