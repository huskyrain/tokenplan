<!-- src/views/sections/FooterSection.vue -->
<!-- Footer：Slogan + 产品/协议/公司三列 + 备案 -->
<template>
  <footer class="footer-section">
    <div class="container">
      <!-- Slogan -->
      <div class="footer-slogan">
        <span class="slogan-text">联想百应智能体 企业AI落地 一步到位</span>
      </div>

      <!-- 三列链接 -->
      <div class="footer-grid">
        <div class="footer-col">
          <h4 class="col-title">产品</h4>
          <ul class="col-list">
            <li><a href="#" @click.prevent>联想百应Token Plan</a></li>
            <li><a href="#" @click.prevent>联想百应智能体</a></li>
            <li><a href="#" @click.prevent>百应 Claw 技能广场</a></li>
            <li><a href="#" @click.prevent>百应服务</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="col-title">协议</h4>
          <ul class="col-list">
            <li><a href="#" @click.prevent>Token Plan 服务条款</a></li>
            <li><a href="#" @click.prevent>法律公告</a></li>
            <li><a href="#" @click.prevent>隐私政策</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="col-title">公司</h4>
          <ul class="col-list">
            <li class="col-plain">400-100-3000 转 3</li>
            <li class="col-plain">北京市海淀区西北旺东路10号院</li>
            <li class="col-plain">联想（北京）有限公司</li>
          </ul>
        </div>
      </div>

      <!-- 底部备案 -->
      <div class="footer-bottom">
        <a href="#" class="bottom-link" @click.prevent>京ICP备11035381-2</a>
        <span class="bottom-divider"></span>
        <a href="#" class="bottom-link" @click.prevent>营业执照</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer Section 组件
</script>

<style scoped>
.footer-section {
  background: #1a1a1a;
  padding: 64px 0 28px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Slogan */
.footer-slogan {
  padding-bottom: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 36px;
}

.slogan-text {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #fff;
}

/* 三列 */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 48px;
}

.col-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.col-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-list a {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: color 0.2s;
}

.col-list a:hover {
  color: var(--brand-red);
}

.col-plain {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
}

/* 底部备案 */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-link {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.2s;
}

.bottom-link:hover {
  color: rgba(255, 255, 255, 0.7);
}

.bottom-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 700px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
