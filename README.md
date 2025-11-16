# Cosmos 本地链交互工具

这是一个基于 React + TypeScript 开发的 Cosmos 区块链交互界面。

## 功能特性

- 🔐 钱包管理（创建/导入钱包）
- 💸 代币转账
- 🔍 区块浏览器
- ⛏️ 矿工信息查看

## 技术栈

- React 19
- TypeScript 4.9
- CosmJS
- Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

## 配置说明

- RPC 端点: http://localhost:26657
- REST API: http://localhost:1317
- 链 ID: onlyzuochain
- 地址前缀: cosmos
- 代币单位: stake

## 项目结构

```
cosmos-ui/
├── public/          # 静态资源
├── src/
│   ├── components/  # React 组件
│   │   ├── WalletConnect.tsx     # 钱包管理
│   │   ├── TokenTransfer.tsx     # 代币转账
│   │   ├── BlockExplorer.tsx     # 区块浏览
│   │   └── ValidatorInfo.tsx     # 矿工信息
│   ├── App.tsx      # 主应用组件
│   └── index.tsx    # 入口文件
├── craco.config.js  # Webpack 配置
├── package.json     # 依赖配置
└── tsconfig.json    # TypeScript 配置
```

## 许可证

MIT
