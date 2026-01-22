# ObjectStack Auth Plugin Implementation

This document provides an overview of the implementation of the ObjectStack Authentication Plugin using Better-Auth.

## 项目概述 (Project Overview)

本项目实现了基于 @objectstack/runtime 规范的登录插件，使用 better-auth 作为认证引擎。
(This project implements a login plugin based on the @objectstack/runtime specification, using better-auth as the authentication engine.)

## 核心特性 (Core Features)

### 1. 存储无关性 (Storage Agnostic)
- 通过 ObjectQL 适配器实现，支持任何 ObjectQL 兼容的存储后端
- 支持 PostgreSQL, Redis, Excel 等多种存储方式
- 无需直接编写 SQL 代码

### 2. 类型安全 (Type Safety)
- 完整的 TypeScript 支持
- Better-Auth 类型推断
- 端到端的类型安全

### 3. RBAC 集成 (RBAC Integration)
- 自动从 ObjectOS 获取用户权限
- 权限注入到用户会话中
- 无需额外 API 调用

### 4. React 支持 (React Support)
- 预构建的 React Hooks
- 可重用的 UI 组件
- 简化的身份验证流程

## 架构组件 (Architecture Components)

### 1. ObjectQL Adapter (`src/adapter/index.ts`)
- 将 Better-Auth 的 CRUD 操作映射到 ObjectQL 实体
- 支持 User, Session, Account, VerificationToken 实体
- 完全符合 ObjectQL 接口规范

### 2. GraphQL Schema (`src/schema/auth.gql`)
定义了以下实体：
- **User**: 用户账户信息
- **Session**: 活动会话
- **Account**: OAuth/社交登录账户
- **VerificationToken**: 邮箱验证和密码重置令牌

### 3. Server Module (`src/server/index.ts`)
- Better-Auth 初始化
- 会话管理配置
- RBAC 权限桥接
- 环境变量验证

### 4. Client Hooks (`src/client/hooks.ts`)
提供以下 React Hooks：
- `useAuth`: 主认证 Hook
- `useIsAuthenticated`: 认证状态检查
- `usePermissions`: 权限管理

### 5. Client Components (`src/client/components/`)
预构建组件：
- `SignInForm`: 登录表单
- `UserButton`: 用户信息和登出按钮

### 6. Plugin Entry Point (`src/index.ts`)
- 实现 ObjectStackPlugin 接口
- onEnable 生命周期钩子
- 插件状态管理

## 配置文件 (Configuration Files)

### package.json
- Better-Auth 作为核心依赖
- TypeScript 5.0+ 支持
- React 18+ peer dependency

### tsconfig.json
- 严格模式 TypeScript
- DOM 库支持
- CommonJS 模块系统

### objectstack.config.ts
- 插件类型定义
- 实体架构引用
- 必需环境变量声明

## 环境变量 (Environment Variables)

必需的环境变量：
- `BETTER_AUTH_SECRET`: 认证密钥（最少32字符）
- `BETTER_AUTH_URL`: 认证服务 URL
- `NODE_ENV`: 运行环境（development/production）

## 使用示例 (Usage Examples)

完整的使用示例请参考 `examples/usage.tsx` 文件，包括：
- 服务器端集成
- React 客户端集成
- 保护的路由
- 基于权限的渲染
- 自定义登录表单

## 安全性 (Security)

### 已实现的安全措施：
- 环境变量配置（避免硬编码密钥）
- 生产环境自动启用安全 Cookie
- 会话过期管理
- CSRF 保护（通过 Better-Auth）
- 速率限制（通过 Better-Auth）

### CodeQL 安全扫描：
✅ 无安全漏洞

## 构建和部署 (Build and Deployment)

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev

# 清理构建
npm run clean
```

## 文件结构 (File Structure)

```
plugin-auth/
├── src/
│   ├── adapter/
│   │   └── index.ts              # ObjectQL 适配器
│   ├── schema/
│   │   └── auth.gql              # GraphQL 架构定义
│   ├── server/
│   │   └── index.ts              # 服务器端初始化
│   ├── client/
│   │   ├── hooks.ts              # React Hooks
│   │   └── components/           # React 组件
│   │       ├── SignInForm.tsx
│   │       ├── UserButton.tsx
│   │       └── index.ts
│   └── index.ts                  # 插件入口点
├── examples/
│   └── usage.tsx                 # 使用示例
├── objectstack.config.ts         # 插件配置
├── package.json                  # 包配置
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 文档
└── .gitignore                    # Git 忽略规则
```

## 测试验证 (Testing & Validation)

### ✅ TypeScript 编译
- 所有文件成功编译
- 无类型错误
- 生成声明文件

### ✅ 代码审查
- 已解决所有审查意见
- 移除不必要的类型断言
- 遵循最佳实践

### ✅ 安全扫描
- CodeQL 扫描通过
- 无安全漏洞
- 遵循安全最佳实践

## 下一步 (Next Steps)

建议的增强功能：
1. 添加单元测试
2. 添加集成测试
3. 实现 OAuth 提供商（GitHub, Google 等）
4. 添加双因素认证 (2FA)
5. 实现邮箱验证
6. 添加密码重置功能
7. 创建更多预构建 UI 组件

## 许可证 (License)

MIT

## 贡献 (Contributing)

欢迎贡献！请遵循 ObjectStack 贡献指南。

## 支持 (Support)

如有问题或建议：
- GitHub Issues: [objectstack-ai/plugin-auth](https://github.com/objectstack-ai/plugin-auth)
- 文档: [objectstack.ai](https://objectstack.ai)
