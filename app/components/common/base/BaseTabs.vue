<template>
	<div class="base-tabs" :class="variant">
		<div class="bt-items" role="group" :aria-label="label">
			<button v-for="item in items" :key="item.key" type="button" class="bt-button" :class="{ selected: value === item.key }" :aria-pressed="value === item.key" @click="value = item.key">
				<BaseIcon v-if="item.icon" :name="item.icon" />
				<span class="bt-text">{{ item.value }}</span>
				<span v-if="item.badge !== undefined" class="bt-badge">{{ item.badge }}</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts" generic="K extends string | number">
import BaseIcon from './BaseIcon.vue';

withDefaults(defineProps<{
	items: { key: K; value: string; icon?: string; badge?: string | number }[];
	label: string;
	variant?: 'line' | 'segmented';
}>(), { variant: 'line' });
const value = defineModel<K>({ required: true });
</script>

<style lang="scss">
.base-tabs {
	min-width: 0;
	.bt-items {
		display: flex;
		overflow-x: auto;
		border-bottom: 1px solid var(--color-border);
		.bt-button {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			min-height: 46px;
			padding: 12px 8px;
			border: 0;
			border-bottom: 2px solid transparent;
			background: transparent;
			font-size: 12px;
			color: var(--color-muted);
			white-space: nowrap;
			cursor: pointer;
			&:hover { color: var(--color-primary); }
			&:focus-visible { outline-offset: -3px; }
			&.selected { color: var(--color-primary); border-bottom-color: var(--color-primary); }
			.bt-badge { font-size: 10px; }
		}
	}
	&.segmented {
		.bt-items {
			padding: 4px;
			border: 0;
			border-radius: 11px;
			background: #eef2f7;
			.bt-button {
				min-height: 40px;
				padding: 8px 12px;
				border: 0;
				border-radius: 8px;
				&.selected { background: white; box-shadow: 0 2px 5px #243d6810; }
			}
		}
	}
}
</style>
