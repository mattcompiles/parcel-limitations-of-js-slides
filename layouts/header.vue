<script setup lang="ts">
const props = defineProps({
  contentClass: {
    type: String,
  },
});
</script>

<template>
  <div class="slidev-layout header-root w-full h-full">
    <div class="header">
      <slot />
    </div>
    <div :class="contentClass">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
.header-root {
  display: grid;
  gap: 20px;
  grid-template-rows: 50px auto;
  align-items: center;
}
</style>
