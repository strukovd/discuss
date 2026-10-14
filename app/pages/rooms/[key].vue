<template>
	<section id="room-page">
		<NuxtLink class="rp-back" to="/">← На главную</NuxtLink>
		<p v-if="loading" class="rp-message" role="status">Открываем комнату…</p>
		<div v-else-if="loadError" class="rp-empty">
			<h1 class="rp-empty-title">Не удалось открыть комнату</h1>
			<p class="rp-empty-description" role="alert">{{ loadError }}</p>
			<BaseButton @click="loadRoom">Попробовать ещё раз</BaseButton>
		</div>
		<template v-else-if="room">
			<header class="room-heading">
				<div class="room-info">
					<span class="rp-eyebrow">КОМНАТА · {{ room.key }}</span>
					<h1 class="rp-title">{{ room.name }}</h1>
					<p class="rp-description">Место, где идеи становятся общими решениями.</p>
				</div>
				<BaseButton variant="secondary" prepend-icon="copy" @click="copyInvitation">Пригласить команду</BaseButton>
			</header>
			<div class="room-context">
				<span class="guest-badge"><span class="guest-avatar" aria-hidden="true">{{ guestName.slice(0, 1) }}</span>{{ guestName }}</span>
				<span class="rp-storage-note">Локальный прототип · данные в этом браузере</span>
			</div>
			<p v-if="invitationMessage" class="rp-feedback" role="status">{{ invitationMessage }}</p>
			<div v-if="invitationUrl" class="invitation-fallback"><BaseTextBox v-model="invitationUrl" label="Ссылка на комнату" readonly hint="Пароль комнаты передайте отдельно. В прототипе ссылка работает только в этом браузере." /></div>
			<div class="discussion-toolbar">
				<div class="filter-list" role="group" aria-label="Статус обсуждений">
					<button v-for="item in filters" :key="item.value" class="filter-button" :class="{ active: filter === item.value }" :aria-pressed="filter === item.value" type="button" @click="filter = item.value">{{ item.label }} <span class="filter-count">{{ items.filter(discussion => discussion.status === item.value).length }}</span></button>
				</div>
				<BaseButton prepend-icon="plus" @click="creating = !creating">{{ creating ? 'Закрыть форму' : 'Новое обсуждение' }}</BaseButton>
			</div>
			<form v-if="creating" class="create-form" @submit.prevent="createDiscussion">
				<h2 class="rp-form-title">Что обсудим?</h2>
				<BaseTextBox v-model="title" label="Тема обсуждения" placeholder="Например, перейти на четырёхдневную неделю" required :maxlength="160" />
				<BaseTextBox v-model="description" label="Краткое описание · необязательно" placeholder="Контекст, который поможет вашей команде" :maxlength="1000" />
				<p v-if="createError" class="rp-form-error" role="alert">{{ createError }}</p>
				<div class="form-actions"><BaseButton type="submit" :loading="saving">Добавить обсуждение</BaseButton><BaseButton variant="secondary" @click="creating = false">Отмена</BaseButton></div>
			</form>
			<div v-if="visibleItems.length" class="discussion-list">
				<article v-for="discussion in visibleItems" :key="discussion.key" class="discussion-card">
					<span class="discussion-status" :class="discussion.status">{{ statusLabels[discussion.status] }}</span>
					<h2 class="discussion-title">{{ discussion.title }}</h2>
					<p class="discussion-description">{{ discussion.description || 'Контекст пока не добавлен.' }}</p>
					<div class="argument-summary"><span class="argument-for">+ {{ discussion.argumentsFor }} за</span><span class="argument-against">− {{ discussion.argumentsAgainst }} против</span></div>
				</article>
			</div>
			<div v-else class="rp-empty">
				<img class="rp-empty-illustration" src="/illustrations/discussion.svg" width="480" height="240" alt="">
				<h2 class="rp-empty-title">{{ filter === 'active' ? 'Большие решения начинаются с идеи' : filter === 'resolved' ? 'Решения ещё впереди' : 'В архиве пока пусто' }}</h2>
				<p class="rp-empty-description">{{ filter === 'active' ? 'Предложите первую тему — пусть у команды будет с чего начать.' : filter === 'resolved' ? 'Здесь будут обсуждения, в которых вы пришли к общему решению.' : 'Здесь останутся завершённые обсуждения и история ваших решений.' }}</p>
				<BaseButton v-if="filter === 'active' && !creating" prepend-icon="plus" @click="creating = true">Предложить тему</BaseButton>
			</div>
			<p v-if="visibleItems.length" class="rp-next-note">Сейчас можно собрать темы. Аргументы и страница обсуждения — на следующем этапе.</p>
		</template>
	</section>
</template>

<script setup lang="ts">
import BaseButton from '~/components/common/base/BaseButton.vue';
import BaseTextBox from '~/components/common/base/BaseTextBox.vue';
import { rooms } from '~/services/rooms';
import { discussions } from '~/services/discussions';
import type { Room, Discussion } from '~/types/room';

const route = useRoute();
const room = ref<Room | null>(null);
const items = ref<Discussion[]>([]);
const guestName = ref('');
const loading = ref(true);
const loadError = ref('');
const filter = ref<Discussion['status']>('active');
const creating = ref(false);
const title = ref('');
const description = ref('');
const saving = ref(false);
const createError = ref('');
const invitationMessage = ref('');
const invitationUrl = ref('');
const statusLabels = { active: 'Обсуждаем', resolved: 'Решение принято', archived: 'В архиве' };
const filters = [
	{ value: 'active', label: 'Обсуждаем' },
	{ value: 'resolved', label: 'Решено' },
	{ value: 'archived', label: 'Архив' },
] as const;
const visibleItems = computed(() => items.value.filter(item => item.status === filter.value));
useSeoMeta({ title: () => room.value ? `${room.value.name} — Discuss` : 'Комната — Discuss' });

async function loadRoom() {
	loading.value = true;
	loadError.value = '';
	try {
		const key = String(route.params.key);
		const data = await rooms.fetch(key);
		room.value = data.room;
		guestName.value = data.session.guestName;
		items.value = await discussions.fetch(key);
	} catch (error) {
		if (error instanceof Error && error.message === 'Войдите в комнату с её паролем.') {
			await navigateTo({ path: '/', query: { room: String(route.params.key) } }, { replace: true });
		} else {
			loadError.value = 'Не удалось прочитать данные. Проверьте, доступно ли хранилище браузера.';
		}
	} finally {
		loading.value = false;
	}
}

async function createDiscussion() {
	if (!room.value || saving.value) return;
	saving.value = true;
	createError.value = '';
	try {
		const discussion = await discussions.create(room.value.key, { title: title.value, description: description.value });
		items.value.unshift(discussion);
		filter.value = 'active';
		creating.value = false;
		title.value = '';
		description.value = '';
	} catch (error) {
		createError.value = error instanceof Error ? error.message : 'Не удалось добавить обсуждение.';
	} finally {
		saving.value = false;
	}
}

async function copyInvitation() {
	if (!room.value) return;
	const url = `${window.location.origin}/rooms/${encodeURIComponent(room.value.key)}`;
	try {
		await navigator.clipboard.writeText(url);
		invitationUrl.value = '';
		invitationMessage.value = 'Ссылка скопирована. Передайте пароль отдельно. В прототипе комната доступна только в этом браузере.';
	} catch {
		invitationUrl.value = url;
		invitationMessage.value = 'Скопируйте ссылку из поля ниже.';
	}
}

onMounted(loadRoom);
watch(() => route.params.key, () => {
	room.value = null;
	items.value = [];
	creating.value = false;
	invitationUrl.value = '';
	invitationMessage.value = '';
	loadRoom();
});
</script>

<style lang="scss">
#room-page {
	max-width: 1120px;
	margin: 0 auto;
	padding: 16px 24px 40px;
	.rp-back { display: inline-block; margin-bottom: 28px; text-decoration: none; color: var(--color-muted); font-size: 13px; &:hover { color: var(--color-primary); } }
	.rp-message { color: var(--color-muted); }
	.room-heading {
		display: flex; flex-direction: column; align-items: flex-start; gap: 20px;
		.room-info {
			min-width: 0;
			.rp-eyebrow { color: var(--color-primary); font-size: 11px; font-weight: 700; letter-spacing: 1px; overflow-wrap: anywhere; }
			.rp-title { margin: 12px 0; font-size: clamp(28px, 4vw, 38px); letter-spacing: -1px; overflow-wrap: anywhere; }
			.rp-description { color: var(--color-muted); font-size: 14px; line-height: 1.6; margin: 0; }
		}
	}
	.room-context {
		display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin: 24px 0 32px;
		.guest-badge { display: inline-flex; align-items: center; gap: 9px; font-size: 12px; overflow-wrap: anywhere; .guest-avatar { display: grid; place-items: center; width: 30px; height: 30px; flex-shrink: 0; background: #e5edfb; color: var(--color-primary); border-radius: 50%; font-weight: 700; } }
		.rp-storage-note { color: var(--color-muted); font-size: 11px; }
	}
	.rp-feedback { padding: 12px; border-radius: 10px; background: #edf3ff; color: #31558a; font-size: 13px; line-height: 1.6; }
	.invitation-fallback { margin-bottom: 24px; }
	.discussion-toolbar {
		display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;
		.filter-list {
			display: flex; border-bottom: 1px solid var(--color-border);
			.filter-button { flex: 1; white-space: nowrap; padding: 12px 4px; background: transparent; border: 0; border-bottom: 2px solid transparent; font-size: 12px; color: var(--color-muted); cursor: pointer; &.active { border-bottom-color: var(--color-primary); color: var(--color-primary); } .filter-count { margin-left: 4px; font-size: 10px; } }
		}
	}
	.create-form {
		display: grid; gap: 18px; background: white; padding: 24px; border: 1px solid var(--color-border); border-radius: 16px; margin-bottom: 24px;
		.rp-form-title { margin: 0; font-size: 20px; }
		.rp-form-error { margin: 0; color: #b63d3d; font-size: 13px; }
		.form-actions { display: flex; flex-wrap: wrap; gap: 12px; }
	}
	.discussion-list {
		display: grid; gap: 16px;
		.discussion-card {
			min-width: 0; padding: 24px; background: white; border: 1px solid var(--color-border); border-radius: 16px;
			.discussion-status { display: inline-block; padding: 5px 8px; border-radius: 6px; background: #edf3ff; color: #3263b1; font-size: 10px; font-weight: 650; &.resolved { background: #e9f5ee; color: #36765a; } &.archived { background: #f0f2f5; color: #64748b; } }
			.discussion-title { font-size: 18px; line-height: 1.45; margin: 16px 0 10px; overflow-wrap: anywhere; }
			.discussion-description { color: var(--color-muted); font-size: 13px; line-height: 1.65; margin: 0; overflow-wrap: anywhere; }
			.argument-summary { display: flex; gap: 16px; padding-top: 20px; margin-top: 20px; border-top: 1px solid #edf0f5; font-size: 12px; .argument-for { color: #36765a; } .argument-against { color: #a66b43; } }
		}
	}
	.rp-empty {
		text-align: center; padding: 32px 16px; background: white; border: 1px dashed var(--color-border); border-radius: 16px;
		.rp-empty-illustration { width: min(280px, 100%); height: auto; }
		.rp-empty-title { font-size: 21px; margin: 16px 0 12px; }
		.rp-empty-description { max-width: 380px; margin: 0 auto 24px; font-size: 14px; color: var(--color-muted); line-height: 1.7; }
	}
	.rp-next-note { font-size: 12px; color: var(--color-muted); text-align: center; line-height: 1.6; margin-top: 24px; }
	@media (min-width: 768px) {
		.room-heading { flex-direction: row; justify-content: space-between; align-items: center; }
		.discussion-toolbar { flex-direction: row; align-items: center; justify-content: space-between; .filter-list { gap: 20px; .filter-button { padding: 14px 8px; } } }
		.discussion-list { grid-template-columns: repeat(2, 1fr); }
		.rp-empty { padding: 48px; }
	}
}
</style>
