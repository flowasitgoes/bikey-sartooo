# Sarto Bikes 网站下载器

这个Node.js脚本可以下载Sarto Bikes网站（https://www.sartobikes.com/en）并允许您在本地托管它。

## 功能特性

- 🚀 使用Puppeteer进行完整的页面渲染
- 📦 自动下载所有资源文件（CSS、JS、图片等）
- 🔗 处理相对和绝对链接
- 🎨 支持背景图片和动态内容
- 🌐 本地Express服务器托管
- 📱 响应式设计保持

## 安装依赖

```bash
npm install
```

## 使用方法

### 1. 下载网站

```bash
npm start
```

这将：
- 启动无头浏览器
- 访问Sarto Bikes网站
- 下载所有页面和资源
- 保存到 `./public` 目录

### 2. 启动本地服务器

```bash
npm run serve
```

这将启动一个本地服务器，您可以在浏览器中访问 `http://localhost:3000` 查看下载的网站。

## 项目结构

```
Sartooo/
├── package.json          # 项目配置
├── download.js           # 主下载脚本
├── serve.js             # 本地服务器
├── README.md            # 说明文档
└── public/              # 下载的网站文件
    ├── index.html       # 主页
    ├── css/            # CSS文件
    ├── js/             # JavaScript文件
    ├── images/         # 图片文件
    └── assets/         # 其他资源文件
```

## 技术栈

- **Puppeteer**: 无头浏览器自动化
- **Cheerio**: 服务器端jQuery实现
- **Axios**: HTTP客户端
- **Express**: 本地Web服务器
- **fs-extra**: 文件系统操作

## 注意事项

- 确保网络连接稳定
- 下载过程可能需要几分钟时间
- 某些动态内容可能需要JavaScript才能正常显示
- 建议在下载完成后检查所有资源是否正确加载

## 故障排除

如果遇到问题：

1. 确保所有依赖都已正确安装
2. 检查网络连接
3. 查看控制台输出的错误信息
4. 确保有足够的磁盘空间

## 许可证

MIT License
# bikey-sartooo
