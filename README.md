# 联想百应智能体 - Token Plan 前端

基于参考页面 https://dawei.lenovo.com/tokenplan 进行产品原型优化的前端实现。

## 功能特性

### 1. UI调整
- 一级页签："标准版"和"团队版"
- 二级页签："连续包月"（原"月包"）、"年包"、"词元宝"
- 保留原有商品卡片展示逻辑

### 2. 连续包月功能
- 实现连续包月购买流程
- 集成微信支付扣费服务（模拟实现）
- 支持自动续费功能

### 3. 订单逻辑变更
- 连续包月订单生效期间，禁止再次购买月包套餐
- 不支持连续包月的排单功能

### 4. 年包限制
- 因微信支付连续订阅金额限制（≤1000元），年包仍使用手动订阅排队逻辑

### 5. 新增加油包功能
- 仅允许有生效服务单的用户购买
- Token随绑定服务单使用并同步失效
- 在"连续包月"和"年包"页签下展示加油包入口

## 技术架构

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **构建工具**: Vite

## 项目结构

```
src/
├── api/                    # API请求封装
│   ├── subscription.ts     # 订阅相关API
│   ├── order.ts           # 订单相关API
│   └── booster.ts         # 加油包API
├── components/            # 通用组件
│   └── PlanCard.vue       # 套餐卡片组件
├── composables/           # 组合式API
│   ├── useSubscription.ts # 订阅流程hook
│   └── useOrderGuard.ts   # 订单前置校验hook
├── mock/                  # 模拟数据
│   └── apiMock.ts         # API模拟实现
├── stores/                # Pinia状态管理
│   ├── planStore.ts       # 套餐数据状态
│   ├── userStore.ts       # 用户状态
│   ├── orderStore.ts      # 订单状态
│   └── boosterStore.ts    # 加油包状态
├── types/                 # TypeScript类型定义
│   ├── plan.ts            # 套餐类型定义
│   └── order.ts           # 订单类型定义
├── views/                 # 页面视图
│   ├── TokenPlanPage.vue  # 主页面
│   └── sections/          # 页面区块组件
│       ├── HeroSection.vue
│       ├── PlanSelectionSection.vue
│       ├── TokenKeySection.vue
│       ├── ToolIntegrationSection.vue
│       ├── FaqSection.vue
│       └── FooterSection.vue
├── router/                # 路由配置
│   └── index.ts
├── assets/                # 静态资源
└── main.ts                # 应用入口
```

## 微信支付集成

### 连续包月支付流程
1. 用户选择套餐并点击"立即订阅"
2. 调用微信支付"支付中签约"接口 (`pay/contractorder`)
3. 用户在微信客户端完成支付并授权自动续费
4. 后续每月到期时自动扣款

### 金额限制
- 连续订阅单次扣款金额 ≤ 1000元
- 年包因金额超限仍使用手动续费

## 后续工作

1. 集成真实后端API
2. 实现完整的微信支付回调处理
3. 添加用户认证和授权
4. 实现后台定时任务处理自动续费
5. 添加更完善的错误处理和用户反馈

## 开发说明

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## API模拟说明

当前项目使用模拟API进行演示，实际部署时需要替换为真实后端API。