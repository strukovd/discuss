<template>
	<div class="base-memo" :class="{ invalid: error, disabled }">
		<label :for="id" class="bm-label">{{ label }}</label>
		<textarea :id="id" ref="input" v-model="value" class="bm-input" :rows="rows" :placeholder="placeholder" :required="required" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined" />
		<p v-if="error" :id="`${id}-error`" class="bm-error">{{ error }}</p>
		<p v-else-if="hint" :id="`${id}-hint`" class="bm-hint">{{ hint }}</p>
	</div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	label: string;
	placeholder?: string;
	hint?: string;
	error?: string;
	rows?: number;
	maxlength?: number;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
}>(), { placeholder: '', hint: '', error: '', rows: 4, maxlength: undefined, required: false, disabled: false, readonly: false });
const value = defineModel<string>({ default: '' });
const id = useId();
const input = ref<HTMLTextAreaElement | null>(null);
defineExpose({ focus: () => input.value?.focus() });
</script>

<style lang="scss">
.base-memo {
	.bm-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 650; }
	.bm-input {
		display: block;
		width: 100%;
		padding: 12px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		font: inherit;
		font-size: 16px;
		line-height: 1.6;
		color: inherit;
		background: white;
		resize: vertical;
		&:focus { border-color: var(--color-primary); outline: 3px solid #2463db15; }
		&::placeholder { color: #8492a6; }
	}
	.bm-hint, .bm-error { margin: 7px 0 0; font-size: 12px; line-height: 1.5; }
	.bm-hint { color: var(--color-muted); }
	.bm-error { color: #b63d3d; }
	&.invalid { .bm-input { border-color: #b63d3d; } }
	&.disabled { opacity: .6; }
}
</style>
