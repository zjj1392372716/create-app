// ----------
// 全局变量
// -----------
global.__TEST__     = process.env.NODE_ENV === 'test';        // 测试环境
global.__DEV__      = process.env.NODE_ENV === 'development'; // 开发环境
global.__PROD__     = process.env.NODE_ENV === 'production';  // 生产环境
global.__NODE_ENV__ = process.env.NODE_ENV;                   // 环境变量
global.__PORT__     = process.env.PORT;                       // 端口