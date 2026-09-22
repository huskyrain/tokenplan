// src/constants/tokenKey.ts
// 词元宝 Token Key 共享数据（Token Key 区 & 套餐区·词元宝页签 复用）
export interface TokenKeyFeature {
  title: string;
  desc: string;
  icon: string; // SVG path
}

export const TOKEN_KEY_FEATURES: TokenKeyFeature[] = [
  {
    title: '安全可靠',
    desc: 'AES-256 加密防护，物理隔离，密钥本地存储，保障团队资产安全',
    icon: 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4zM9 12l2 2 4-4'
  },
  {
    title: '即插即用',
    desc: '无需复杂操作，自动配置主流智能体及AI工具',
    icon: 'M9 2v6M15 2v6M7 8h10v6a5 5 0 01-10 0V8zM12 19v3'
  },
  {
    title: '灵活管理',
    desc: '支持团队管理、额度分配、权限控制',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'
  },
  {
    title: '设备绑定',
    desc: '硬件管控服务启停，确保资产安全，防止未授权使用',
    icon: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L19 3m-5 2l4 4'
  },
  {
    title: '主流模型接入',
    desc: '一站式接入主流大模型，统一入口、满足不同场景的模型调用需求',
    icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 4V6zM12 8v3M10.5 9h3'
  }
];

export const MODEL_BRANDS = ['Qwen', 'DeepSeek', 'Doubao', 'Kimi', 'MiniMax', 'GLM', 'Hy'];

/** 团队版 · 灵活定制：版本能力清单（8 条，与设计基准逐字一致） */
export const TEAM_CAPABILITIES: string[] = [
  '30 亿 Token 起售，有效期 1 年',
  'Token 资源包独立购买，词元宝按需组合',
  '不限席位，支持多人团队协作',
  '绑定词元宝 Token Key 设备联动使用，安全可靠，加密防护，保障企业资产安全',
  '支持团队设置成员使用 Token 限额，成本管控灵活便捷',
  '用量仪表台，团队成员用量一览无余，管理尽在掌握',
  '一键配置百应 Claw、Hermes Agent、OpenClaw、Claude Code 等智能体及编程工具',
  '10 余款主流大模型一站聚合，Auto 模式智能选型，省心更省钱'
];

/** 团队卡底部模型徽标小圆标配色（按品牌名索引） */
export const MODEL_BADGE_COLORS: Record<string, string> = {
  Qwen: 'linear-gradient(135deg, #8f6bff 0%, #5b5bd6 100%)',
  DeepSeek: 'linear-gradient(135deg, #4f7dff 0%, #2b4fd8 100%)',
  Doubao: 'linear-gradient(135deg, #35d0e0 0%, #4f6ef7 100%)',
  Kimi: 'linear-gradient(135deg, #2b2f36 0%, #0a0c0f 100%)',
  MiniMax: 'linear-gradient(135deg, #ff7a90 0%, #ff4141 100%)',
  GLM: 'linear-gradient(135deg, #4d9fff 0%, #2563eb 100%)',
  Hy: 'linear-gradient(135deg, #33c6f0 0%, #2f7ef7 100%)'
};
