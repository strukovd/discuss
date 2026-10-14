<template>
	<button class="base-button" :class="variant" :type="type" :disabled="disabled"><slot /></button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	variant?: 'primary' | 'secondary' | 'light';
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
}>(), { variant: 'primary', type: 'button', disabled: false });
</script>

<style lang="scss">
.base-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	min-height: 46px;
	padding: 12px 18px;
	border: 1px solid transparent;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 650;
	cursor: pointer;
	transition: background 150ms;
	&.primary { background: var(--color-primary); color: white; &:hover { background: #1c50b8; } }
	&.secondary { background: white; border-color: var(--color-border); color: #344563; &:hover { background: #f1f5fa; } }
	&.light { background: #edf3ff; color: var(--color-primary); &:hover { background: #dfeaff; } }
	&:disabled { opacity: .5; cursor: default; }
}
</style>
