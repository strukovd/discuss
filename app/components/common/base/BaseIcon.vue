<template>
	<!-- SVG берутся только из локальных файлов сборки. -->
	<!-- eslint-disable-next-line vue/no-v-html -->
	<span class="base-icon" :style="{ width: size, height: size, color: fill }" aria-hidden="true" v-html="content" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; size?: string; fill?: string }>(), { size: '1.2em', fill: 'currentColor' });
// Только локальные SVG, без загрузки и вставки внешнего содержимого.
const icons = import.meta.glob('../../../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true });
const content = computed(() => icons[`../../../assets/icons/${props.name}.svg`] as string || '');
</script>

<style lang="scss">
.base-icon {
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	svg { width: 100%; height: 100%; }
}
</style>
