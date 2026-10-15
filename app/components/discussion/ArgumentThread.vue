<template>
	<section v-if="open" :id="id" class="argument-thread" :aria-labelledby="`${id}-title`">
		<h5 :id="`${id}-title`" class="at-title">Обсуждение довода</h5>
		<p class="at-hint">Уточняйте, задавайте вопросы и проверяйте довод вместе.</p>
		<p v-if="loading" class="at-message" role="status">Загружаем реплики…</p>
		<div v-else-if="loadError" class="at-load-error"><p class="at-error" role="alert">{{ loadError }}</p><BaseButton variant="secondary" @click="loadComments">Повторить</BaseButton></div>
		<template v-else>
			<ol v-if="comments.length" class="comment-list">
				<li v-for="comment in comments" :key="comment.key" class="comment-item">
					<div class="comment-meta"><span class="comment-author">{{ comment.author }}</span><time class="comment-date" :datetime="comment.createdAt">{{ new Date(comment.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</time></div>
					<p class="comment-text">{{ comment.text }}</p>
				</li>
			</ol>
			<p v-else class="at-empty">Пока без реплик. Начните с вопроса или уточнения.</p>
			<form v-if="!readonly" class="comment-form" @submit.prevent="sendComment">
				<BaseMemo v-model="text" label="Ваша реплика" placeholder="Что стоит уточнить в этом доводе?" :rows="3" :maxlength="2000" required :disabled="saving" :error="sendError" />
				<BaseButton type="submit" :loading="saving">Отправить реплику</BaseButton>
				<p v-if="feedback" class="at-feedback" role="status">{{ feedback }}</p>
			</form>
			<p v-else class="at-message">Обсуждение завершено. Реплики доступны для просмотра.</p>
		</template>
	</section>
</template>

<script setup lang="ts">
import BaseButton from '~/components/common/base/BaseButton.vue';
import BaseMemo from '~/components/common/base/BaseMemo.vue';
import { argumentComments } from '~/services/comments';
import type { ArgumentComment } from '~/types/comment';

const props = defineProps<{ id: string; roomKey: string; discussionKey: string; argumentKey: string; open: boolean; readonly: boolean }>();
const emit = defineEmits<{ count: [value: number] }>();
const comments = ref<ArgumentComment[]>([]);
const text = ref('');
const loading = ref(false);
const saving = ref(false);
const loadError = ref('');
const sendError = ref('');
const feedback = ref('');

async function loadComments() {
	loading.value = true;
	loadError.value = '';
	try {
		comments.value = await argumentComments.fetch(props.roomKey, props.discussionKey, props.argumentKey);
		emit('count', comments.value.length);
	} catch (error) {
		loadError.value = error instanceof Error ? error.message : 'Не удалось загрузить реплики.';
	} finally {
		loading.value = false;
	}
}

async function sendComment() {
	if (saving.value || props.readonly) return;
	saving.value = true;
	sendError.value = '';
	feedback.value = '';
	try {
		const comment = await argumentComments.create(props.roomKey, props.discussionKey, props.argumentKey, { text: text.value });
		comments.value.push(comment);
		text.value = '';
		emit('count', comments.value.length);
		feedback.value = 'Реплика добавлена.';
	} catch (error) {
		sendError.value = error instanceof Error ? error.message : 'Не удалось отправить реплику. Текст сохранён в форме.';
	} finally {
		saving.value = false;
	}
}

watch(() => props.open, (open) => { if (open) loadComments(); }, { immediate: true });
watch(text, () => { sendError.value = ''; feedback.value = ''; }, { flush: 'sync' });
</script>

<style lang="scss">
.argument-thread {
	border-top: 1px solid var(--color-border);
	margin-top: 18px;
	padding-top: 18px;
	.at-title { margin: 0 0 8px; font-size: 14px; }
	.at-hint, .at-message, .at-empty { font-size: 12px; color: var(--color-muted); line-height: 1.6; }
	.at-hint { margin: 0 0 20px; }
	.at-load-error { .at-error { color: #b63d3d; font-size: 12px; } }
	.comment-list {
		list-style: none; margin: 0; padding: 0; display: grid; gap: 16px;
		.comment-item {
			padding: 14px; background: #f5f8fc; border-radius: 10px;
			.comment-meta { display: flex; flex-wrap: wrap; gap: 6px 12px; .comment-author { font-size: 11px; font-weight: 650; overflow-wrap: anywhere; } .comment-date { font-size: 10px; color: var(--color-muted); } }
			.comment-text { margin: 10px 0 0; font-size: 13px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
		}
	}
	.comment-form {
		display: grid; gap: 12px; margin-top: 20px;
		.at-feedback { margin: 0; color: #36765a; font-size: 12px; }
	}
}
</style>
