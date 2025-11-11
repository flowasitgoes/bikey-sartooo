const express = require('express');
const path = require('path');
const fs = require('fs-extra');

class LocalServer {
    constructor(port = 3000, publicDir = './public') {
        this.port = port;
        this.publicDir = publicDir;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // 静态文件服务
        this.app.use(express.static(this.publicDir, {
            setHeaders: (res, path) => {
                // 设置字体文件的正确MIME类型
                if (path.endsWith('.woff2')) {
                    res.setHeader('Content-Type', 'font/woff2');
                } else if (path.endsWith('.woff')) {
                    res.setHeader('Content-Type', 'font/woff');
                } else if (path.endsWith('.ttf')) {
                    res.setHeader('Content-Type', 'font/ttf');
                } else if (path.endsWith('.eot')) {
                    res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
                }
            }
        }));
        
        // 处理HTML文件扩展名
        this.app.use((req, res, next) => {
            if (req.path.endsWith('/')) {
                const indexPath = path.join(this.publicDir, req.path, 'index.html');
                if (fs.existsSync(indexPath)) {
                    return res.sendFile(path.resolve(indexPath));
                }
            }
            next();
        });

        // 处理没有扩展名的请求
        this.app.use((req, res, next) => {
            const ext = path.extname(req.path);
            if (!ext) {
                const htmlPath = path.join(this.publicDir, req.path + '.html');
                if (fs.existsSync(htmlPath)) {
                    return res.sendFile(path.resolve(htmlPath));
                }
            }
            next();
        });
    }

    setupRoutes() {
        // 根路径重定向到index.html
        this.app.get('/', (req, res) => {
            const indexPath = path.join(this.publicDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(path.resolve(indexPath));
            } else {
                res.status(404).send('Index file not found');
            }
        });

        // Support 页面重定向到 /en/ 目录
        const supportPages = [
            'a-sarto-is-forever',
            'faq-and-warranty',
            'register-your-sarto',
            'contacts',
            'dealers'
        ];
        
        supportPages.forEach(page => {
            this.app.get(`/${page}`, (req, res) => {
                const pagePath = path.join(this.publicDir, 'en', `${page}.html`);
                if (fs.existsSync(pagePath)) {
                    res.sendFile(path.resolve(pagePath));
                } else {
                    res.status(404).send('Page not found');
                }
            });
        });

        // 義大利語單車頁面路由
        const italianBikePages = {
            'raso-tri-composite': 'raso-tri-composite.html',
            'seta-plus-tri-composite': 'seta-plus-tri-composite.html',
            'seta-gravel-plus-tri-composite': 'seta-gravel-plus-tri-composite.html',
            'raso': 'raso.html',
            'raso-gravel-wide': 'raso-gravel-wide.html',
            'raso-gravel': 'raso-gravel.html',
            'seta-plus': 'seta-plus.html',
            'lampo-plus': 'lampo-plus.html',
            'asola-plus': 'asola-plus.html',
            'gravel-ta-plus': 'gravel-ta-plus.html',
            'doppio': 'doppio.html',
            'seta-rim': 'seta-rim.html',
            'asola': 'asola.html',
            'veneto-sl': 'veneto-sl.html'
        };

        this.app.get(['/bikes/:slug', '/bikes/:slug/'], (req, res, next) => {
            const { slug } = req.params;
            const targetFile = italianBikePages[slug];

            if (!targetFile) {
                return next();
            }

            const filePath = path.join(this.publicDir, 'it', 'biciclette', targetFile);
            if (fs.existsSync(filePath)) {
                return res.sendFile(path.resolve(filePath));
            }

            res.status(404).send('Page not found');
        });

        // 404处理
        this.app.use((req, res) => {
            res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Page Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #333; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested page could not be found.</p>
                    <a href="/">Go back to home</a>
                </body>
                </html>
            `);
        });
    }

    async start() {
        try {
            // 检查public目录是否存在
            if (!await fs.pathExists(this.publicDir)) {
                console.error(`❌ 错误: 目录 ${this.publicDir} 不存在`);
                console.log('请先运行下载脚本: npm start');
                process.exit(1);
            }

            this.app.listen(this.port, () => {
                console.log(`🚀 本地服务器已启动!`);
                console.log(`📱 访问地址: http://localhost:${this.port}`);
                console.log(`📁 服务目录: ${path.resolve(this.publicDir)}`);
                console.log(`\n按 Ctrl+C 停止服务器`);
            });

        } catch (error) {
            console.error('❌ 启动服务器失败:', error.message);
            process.exit(1);
        }
    }
}

// 主函数
async function main() {
    const port = process.env.PORT || 3000;
    const publicDir = './public';
    
    const server = new LocalServer(port, publicDir);
    await server.start();
}

// 导出类和启动函数
module.exports = LocalServer;
module.exports.LocalServer = LocalServer;
module.exports.start = main;

// 运行服务器
if (require.main === module) {
    main().catch(console.error);
}
