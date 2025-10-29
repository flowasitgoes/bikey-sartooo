# Vercel 部署指南

## 🚀 部署步骤

### 方法 1: 通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel
```

第一次部署时会询问一些问题：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账户
- Link to existing project? → **N**
- What's your project's name? → **sarto-bikes**（或其他名称）
- In which directory is your code located? → **.**
- Want to override the settings? → **N**

4. **部署到生产环境**
```bash
vercel --prod
```

### 方法 2: 通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 登录或注册账户
3. 点击 "Import Project"
4. 导入你的 Git 仓库（GitHub/GitLab/Bitbucket）
5. Vercel 会自动检测配置并部署

## 📝 配置说明

### vercel.json
此文件配置了：
- 静态文件路由
- URL 重写规则
- 缓存策略
- 支持页面重定向

### api/index.js
提供一个简单的 API 健康检查端点：
- `GET /api` - 返回服务状态

## 🔧 本地开发

继续使用原有的本地服务器：

```bash
npm run serve
```

或

```bash
npm run dev
```

访问: http://localhost:3000

## ⚠️ 注意事项

1. **public 目录**: 确保所有静态资源都在 `public/` 目录中
2. **路由配置**: 如需添加新页面，记得更新 `vercel.json` 的 routes
3. **环境变量**: 如有敏感信息，在 Vercel Dashboard 中配置环境变量
4. **域名**: 部署后可以在 Vercel Dashboard 中配置自定义域名

## 🐛 故障排查

### 500 错误
- 检查 `vercel.json` 配置是否正确
- 确保文件路径大小写一致

### 404 错误
- 检查 `public/` 目录中是否有对应文件
- 查看 `vercel.json` 中的路由规则

### 查看日志
```bash
vercel logs <deployment-url>
```

## 📚 更多信息

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

