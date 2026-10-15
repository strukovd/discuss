<template>
	<section class="discussion-decision" :class="{ recorded: discussion.decision }" aria-label="Итог обсуждения">
		<template v-if="discussion.decision">
			<span class="dd-eyebrow">ИТОГ ОБСУЖДЕНИЯ</span>
			<h2 class="dd-title">{{ discussion.decision.summary }}</h2>
			<h3 class="dd-reason-label">Почему так решили</h3>
			<p class="dd-reason">{{ discussion.decision.reason }}</p>
			<p class="dd-meta">Зафиксировал(а) {{ discussion.decision.author }} · <time :datetime="discussion.decision.createdAt">{{ new Date(discussion.decision.createdAt).toLocaleDateString('ru-RU') }}</time></p>
		</template>
		<template v-else>
			<h2 class="dd-title">{{ discussion.status === 'active' ? 'К какому решению пришли?' : 'Итог пока не записан' }}</h2>
			<p class="dd-description">{{ discussion.status === 'active' ? 'Когда доводы разобраны, сохраните решение и причины, чтобы к ним можно было вернуться.' : 'Это обсуждение завершено без записанного итога. Существующие аргументы и реплики сохранены.' }}</p>
		</template>
		<form v-if="editing" class="decision-form" @submit.prevent="resolveDiscussion">
			<BaseMemo v-model="summary" label="Что решили" placeholder="Сформулируйте итог и договорённости" required :maxlength="1000" :rows="3" :disabled="busy" />
			<BaseMemo v-model="reason" label="Почему приняли это решение" placeholder="Какие доводы оказались определяющими? Какие риски учли?" required :maxlength="5000" :rows="4" :disabled="busy" />
			<p class="dd-form-note">После сохранения обсуждение завершится: добавление аргументов и реплик станет недоступно. Итог останется частью истории.</p>
			<div class="decision-actions"><BaseButton type="submit" :loading="busy">Сохранить итог и завершить</BaseButton><BaseButton variant="secondary" :disabled="busy" @click="editing = false">Отмена</BaseButton></div>
		</form>
		<div v-else class="decision-actions">
			<BaseButton v-if="!discussion.decision && discussion.status !== 'archived'" variant="secondary" @click="editing = true">{{ discussion.status === 'active' ? 'Зафиксировать решение' : 'Записать итог' }}</BaseButton>
			<BaseButton v-if="discussion.status === 'resolved' && discussion.decision" variant="secondary" :loading="busy" @click="changeArchive('archive')">Отправить в архив</BaseButton>
			<BaseButton v-if="discussion.status === 'archived'" variant="secondary" :loading="busy" @click="changeArchive('restore')">Вернуть в решённые</BaseButton>
		</div>
		<p v-if="discussion.status === 'archived'" class="dd-archive-note">В архиве. Решение, аргументы и реплики сохранены по прежней ссылке.</p>
		<p v-if="error" class="dd-error" role="alert">{{ error }}</p>
		<p v-if="feedback" class="dd-feedback" role="status">{{ feedback }}</p>
	</section>
</template>

<script setup lang="ts">
import BaseButton from '~/components/common/base/BaseButton.vue';
import BaseMemo from '~/components/common/base/BaseMemo.vue';
import { discussions } from '~/services/discussions';
import type { Discussion } from '~/types/room';

const props = defineProps<{ discussion: Discussion }>();
const emit = defineEmits<{ updated: [discussion: Discussion] }>();
const editing = ref(false);
const busy = ref(false);
const summary = ref('');
const reason = ref('');
const error = ref('');
const feedback = ref('');

async function resolveDiscussion() {
	if (busy.value) return;
	busy.value = true;
	error.value = '';
	feedback.value = '';
	try {
		const updated = await discussions.resolve(props.discussion.roomKey, props.discussion.key, { summary: summary.value, reason: reason.value });
		emit('updated', updated);
		editing.value = false;
		feedback.value = 'Решение сохранено. Обсуждение завершено.';
	} catch (cause) {
		error.value = cause instanceof Error ? cause.message : 'Не удалось сохранить итог. Текст остался в форме.';
	} finally {
		busy.value = false;
	}
}

async function changeArchive(action: 'archive' | 'restore') {
	if (busy.value) return;
	busy.value = true;
	error.value = '';
	feedback.value = '';
	try {
		const updated = await discussions[action](props.discussion.roomKey, props.discussion.key);
		emit('updated', updated);
		feedback.value = action === 'archive' ? 'Обсуждение перенесено в архив.' : 'Обсуждение возвращено в решённые.';
	} catch (cause) {
		error.value = cause instanceof Error ? cause.message : 'Не удалось изменить статус. Попробуйте ещё раз.';
	} finally {
		busy.value = false;
	}
}
</script>

<style lang="scss">
.discussion-decision {
	margin-top: 28px;
	padding: 24px;
	border: 1px solid var(--color-border);
	border-radius: 16px;
	background: white;
	&.recorded { background: #f1f8f5; border-color: #c7dfd2; }
	.dd-eyebrow { color: #36765a; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
	.dd-title { margin: 12px 0; font-size: 21px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
	.dd-description, .dd-reason { max-width: 800px; font-size: 14px; line-height: 1.7; color: var(--color-muted); white-space: pre-wrap; overflow-wrap: anywhere; }
	.dd-reason-label { font-size: 13px; margin: 20px 0 8px; }
	.dd-reason { margin: 0; }
	.dd-meta { font-size: 11px; color: var(--color-muted); line-height: 1.7; margin: 20px 0; overflow-wrap: anywhere; }
	.decision-form {
		display: grid; gap: 18px; margin-top: 24px; max-width: 700px;
		.dd-form-note { margin: 0; color: var(--color-muted); font-size: 12px; line-height: 1.7; }
		.decision-actions { display: flex; flex-wrap: wrap; gap: 12px; }
	}
	.decision-actions { display: flex; flex-wrap: wrap; gap: 12px; }
	.dd-archive-note { font-size: 12px; line-height: 1.7; color: var(--color-muted); }
	.dd-error { color: #b63d3d; font-size: 13px; line-height: 1.6; }
	.dd-feedback { color: #36765a; font-size: 13px; line-height: 1.6; }
	@media (max-width: 480px) {
		padding: 20px;
		.decision-form { .decision-actions { .base-button { width: 100%; } } }
	}
}
</style>
