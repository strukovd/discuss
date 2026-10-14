<template>
	<button class="base-button" :class="[variant, { loading }]" :type="type" :disabled="disabled || loading" :aria-busy="loading">
		<BaseIcon v-if="loading" class="bb-spinner" name="refresh" />
		<BaseIcon v-else-if="prependIcon" :name="prependIcon" />
		<slot />
		<BaseIcon v-if="appendIcon" :name="appendIcon" />
	</button>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';

withDefaults(defineProps<{
	variant?: 'primary' | 'secondary' | 'light';
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	loading?: boolean;
	prependIcon?: string;
	appendIcon?: string;
}>(), { variant: 'primary', type: 'button', disabled: false, loading: false, prependIcon: '', appendIcon: '' });
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
	.bb-spinner { animation: button-spin 1s linear infinite; }
	@media (prefers-reduced-motion: reduce) { .bb-spinner { animation: none; } }
	&:disabled { opacity: .5; cursor: default; }
}
@keyframes button-spin { to { transform: rotate(360deg); } }
</style>
