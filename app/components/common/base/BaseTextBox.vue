<template>
	<div class="base-text-box" :class="{ invalid: error }">
		<label :for="id" class="bt-label">{{ label }}</label>
		<div class="bt-area">
			<BaseIcon v-if="prependIcon" :name="prependIcon" class="bt-prepend" />
			<input :id="id" ref="input" v-model="value" :disabled="disabled" :readonly="readonly" class="bt-input" :type="type === 'password' && visible ? 'text' : type" :placeholder="placeholder" :required="required" :maxlength="maxlength" :autocomplete="autocomplete" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined">
			<button v-if="type === 'password'" type="button" class="bt-toggle" :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'" :aria-pressed="visible" @click="visible = !visible">{{ visible ? 'Скрыть' : 'Показать' }}</button>
			<BaseIcon v-if="appendIcon" :name="appendIcon" class="bt-append" />
			<slot name="append" />
		</div>
		<p v-if="error" :id="`${id}-error`" class="bt-error">{{ error }}</p>
		<p v-else-if="hint" :id="`${id}-hint`" class="bt-hint">{{ hint }}</p>
	</div>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';

withDefaults(defineProps<{
	label: string;
	disabled?: boolean;
	readonly?: boolean;
	prependIcon?: string;
	appendIcon?: string;
	type?: 'text' | 'password';
	placeholder?: string;
	hint?: string;
	error?: string;
	required?: boolean;
	maxlength?: number;
	autocomplete?: string;
}>(), { type: 'text', autocomplete: 'off', placeholder: '', hint: '', error: '', maxlength: undefined, disabled: false, readonly: false, prependIcon: '', appendIcon: '' });
const value = defineModel<string>({ default: '' });
const id = useId();
const visible = ref(false);
const input = ref<HTMLInputElement | null>(null);
defineExpose({ focus: () => input.value?.focus(), blur: () => input.value?.blur() });
</script>

<style lang="scss">
.base-text-box {
	.bt-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 650; }
	.bt-area {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background: white;
		&:focus-within { border-color: var(--color-primary); outline: 3px solid #2463db15; }
		.bt-prepend { margin-left: 12px; color: var(--color-muted); }
		.bt-append { margin-right: 12px; color: var(--color-muted); }
		.bt-input { width: 100%; min-width: 0; min-height: 46px; padding: 12px; border: 0; outline: none; background: transparent; color: inherit; font-size: 16px; &::placeholder { color: #8492a6; } }
		.bt-toggle { padding: 12px 10px; border: 0; border-radius: 8px; background: transparent; color: var(--color-muted); cursor: pointer; font-size: 11px; }
	}
	.bt-hint, .bt-error { margin: 7px 0 0; font-size: 12px; line-height: 1.5; }
	.bt-hint { color: var(--color-muted); }
	.bt-error { color: #b63d3d; }
	&.invalid { .bt-area { border-color: #b63d3d; } }
}
</style>
