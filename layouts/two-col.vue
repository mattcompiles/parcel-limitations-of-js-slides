<template>
  <div class="slidev-layout two-col w-full h-full">
    <div class="col-left">
      <slot />
    </div>
    <div class="col-right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.two-col {
  display: grid;
  grid-template-rows: 50px auto;
  align-items: center;
}

.col-left {
  grid-area: 2 / 1 / 3 / 2;
}
.col-right {
  grid-area: 2 / 2 / 3 / 3;
}
</style>
