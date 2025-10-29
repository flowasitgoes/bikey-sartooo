// Vercel Serverless Function
// 这个文件仅用于 Vercel 部署，不影响本地开发

module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 简单的健康检查端点
    if (req.url === '/api' || req.url === '/api/') {
        res.status(200).json({
            status: 'ok',
            message: 'Sarto API is running on Vercel',
            timestamp: new Date().toISOString()
        });
        return;
    }

    // 其他请求返回 404
    res.status(404).json({
        error: 'Not Found',
        message: 'This endpoint does not exist'
    });
};

