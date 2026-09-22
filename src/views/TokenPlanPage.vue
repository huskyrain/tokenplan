<!-- src/views/TokenPlanPage.vue -->
<template>
  <div class="token-plan-page">
    <HeroSection />
    <TokenKeySection @buy="planSectionRef?.handleTokenKeyPurchase()" />
    <PlanSelectionSection ref="planSectionRef" />
    <ToolIntegrationSection />
    <ModelAccessSection />
    <QuickStartSection />
    <FaqSection />
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeroSection from '@/views/sections/HeroSection.vue';
import TokenKeySection from '@/views/sections/TokenKeySection.vue';
import PlanSelectionSection from '@/views/sections/PlanSelectionSection.vue';
import ToolIntegrationSection from '@/views/sections/ToolIntegrationSection.vue';
import ModelAccessSection from '@/views/sections/ModelAccessSection.vue';
import QuickStartSection from '@/views/sections/QuickStartSection.vue';
import FaqSection from '@/views/sections/FaqSection.vue';
import FooterSection from '@/views/sections/FooterSection.vue';

const planSectionRef = ref<InstanceType<typeof PlanSelectionSection> | null>(null);
</script>

<style scoped>
.token-plan-page {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-x: hidden;
}
</style>
