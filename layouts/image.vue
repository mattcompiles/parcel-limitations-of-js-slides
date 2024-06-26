<script setup lang="ts">
import { computed } from "vue";
/**
 * Resolve urls from frontmatter and append with the base url
 */
function resolveAssetUrl(url: string) {
  if (url.startsWith("/")) return import.meta.env.BASE_URL + url.slice(1);
  return url;
}

function handleBackground(
  background?: string,
  dim = false,
  backgroundSize = "cover",
  backgroundPosition,
): CSSProperties {
  const isColor =
    background && (background[0] === "#" || background.startsWith("rgb"));

  const style = {
    background: isColor ? background : undefined,
    color: background && !isColor ? "white" : undefined,
    backgroundImage: isColor
      ? undefined
      : background
        ? dim
          ? `linear-gradient(#0005, #0008), url(${resolveAssetUrl(background)})`
          : `url("${resolveAssetUrl(background)}")`
        : undefined,
    backgroundRepeat: "no-repeat",
    backgroundPosition,
    backgroundSize,
  };

  if (!style.background) delete style.background;

  return style;
}

const props = defineProps({
  image: {
    type: String,
  },
  class: {
    type: String,
  },
  backgroundSize: {
    type: String,
    default: "cover",
  },
  backgroundPosition: {
    type: String,
    default: "center",
  },
});

const style = computed(() =>
  handleBackground(
    props.image,
    false,
    props.backgroundSize,
    props.backgroundPosition,
  ),
);
</script>

<template>
  <div class="grid grid-cols-2 w-full h-full auto-rows-fr">
    <div class="slidev-layout default" :class="props.class">
      <slot />
    </div>
    <div class="w-full h-full" :style="style" />
  </div>
</template>
