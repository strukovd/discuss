<template>
	<section id="discussion-page">
		<NuxtLink class="dp-back" :to="`/rooms/${roomKey}`">← {{ room?.name || 'К обсуждениям комнаты' }}</NuxtLink>
		<p v-if="loading" class="dp-message" role="status">Открываем обсуждение…</p>
		<div v-else-if="loadError" class="dp-empty">
			<h1 class="dp-empty-title">Не удалось открыть обсуждение</h1>
			<p class="dp-empty-description" role="alert">{{ loadError }}</p>
			<BaseButton variant="secondary" @click="loadDiscussion">Попробовать ещё раз</BaseButton>
		</div>
		<template v-else-if="discussion">
			<header class="discussion-heading">
				<span class="dp-status" :class="discussion.status">{{ statusLabels[discussion.status] }}</span>
				<h1 class="dp-title">{{ discussion.title }}</h1>
				<p class="dp-description">{{ discussion.description || 'Описание пока не добавлено.' }}</p>
				<span class="dp-guest">Вы участвуете как {{ guestName }}</span>
			</header>
			<div class="argument-toolbar">
				<div class="dp-heading-copy"><h2 class="dp-section-title">Аргументы</h2><p class="dp-section-description">Один довод — одна мысль. Добавьте контекст и источник, если он есть.</p></div>
				<BaseButton v-if="discussion.status === 'active'" prepend-icon="plus" @click="openArgumentForm('for')">Добавить аргумент</BaseButton>
			</div>
			<p v-if="discussion.status !== 'active'" class="dp-readonly-note">Обсуждение завершено. Аргументы доступны для просмотра.</p>
			<form v-if="creating" class="argument-form" @submit.prevent="createArgument">
				<h3 class="dp-form-title">Новый аргумент</h3>
				<BaseTabs v-model="formSide" :items="sideItems" variant="segmented" label="Сторона нового аргумента" />
				<BaseTextBox ref="titleInput" v-model="title" label="Коротко сформулируйте довод" placeholder="Одна мысль, которую можно обсудить" required :maxlength="160" />
				<BaseMemo v-model="description" label="Обоснование · необязательно" placeholder="Почему это важно? Приведите пример или объяснение." :maxlength="3000" />
				<BaseTextBox v-model="source" label="Источник · необязательно" placeholder="https://…" :maxlength="2000" hint="Ссылка на материал, который подтверждает ваш довод." />
				<p v-if="formError" class="dp-form-error" role="alert">{{ formError }}</p>
				<div class="form-actions"><BaseButton type="submit" :loading="saving">Добавить довод</BaseButton><BaseButton variant="secondary" :disabled="saving" @click="creating = false">Отмена</BaseButton></div>
			</form>
			<p v-if="feedback" class="dp-feedback" role="status">{{ feedback }}</p>
			<BaseTabs v-model="mobileSide" class="mobile-side-tabs" :items="argumentTabs" label="Сторона аргументов" />
			<div class="argument-columns">
				<section v-for="side in sideItems" :key="side.key" class="argument-column" :class="[side.key, { selected: mobileSide === side.key }]" :aria-label="`Аргументы ${side.value.toLowerCase()}`">
					<div class="column-heading"><h3 class="column-title">{{ side.key === 'for' ? 'За идею' : 'Против идеи' }}</h3><span class="column-count">{{ items.filter(item => item.side === side.key).length }}</span></div>
					<div class="argument-list">
						<article v-for="argument in items.filter(item => item.side === side.key)" :key="argument.key" class="argument-card">
							<div class="argument-meta"><span class="argument-avatar" aria-hidden="true">{{ argument.author.slice(0, 1) }}</span><span class="argument-author">{{ argument.author }}</span></div>
							<h4 class="argument-title">{{ argument.title }}</h4>
							<p v-if="argument.description" class="argument-description">{{ argument.description }}</p>
							<a v-if="argument.source" class="argument-source" :href="argument.source" target="_blank" rel="noopener noreferrer">Источник <BaseIcon name="arrow-right" /></a>
						</article>
						<div v-if="!items.some(item => item.side === side.key)" class="column-empty"><span class="empty-symbol" aria-hidden="true">{{ side.key === 'for' ? '+' : '−' }}</span><h4 class="empty-title">{{ side.key === 'for' ? 'Что поддерживает идею?' : 'Какие есть сомнения?' }}</h4><p class="empty-description">{{ side.key === 'for' ? 'Здесь будут доводы в пользу предложения.' : 'Здесь будут риски и доводы против предложения.' }}</p></div>
					</div>
					<BaseButton v-if="discussion.status === 'active'" class="column-add" variant="secondary" prepend-icon="plus" @click="openArgumentForm(side.key)">Добавить {{ side.key === 'for' ? 'довод за' : 'довод против' }}</BaseButton>
				</section>
			</div>
		</template>
	</section>
</template>

<script setup lang="ts">
import BaseButton from '~/components/common/base/BaseButton.vue';
import BaseIcon from '~/components/common/base/BaseIcon.vue';
import BaseTabs from '~/components/common/base/BaseTabs.vue';
import BaseMemo from '~/components/common/base/BaseMemo.vue';
import BaseTextBox from '~/components/common/base/BaseTextBox.vue';
import { rooms } from '~/services/rooms';
import { discussions } from '~/services/discussions';
import { discussionArguments } from '~/services/arguments';
import type { Discussion, Room } from '~/types/room';
import type { ArgumentSide, DiscussionArgument } from '~/types/argument';

const route = useRoute();
const roomKey = computed(() => String(route.params.key));
const discussionKey = computed(() => String(route.params.discussionKey));
const room = ref<Room | null>(null);
const discussion = ref<Discussion | null>(null);
const items = ref<DiscussionArgument[]>([]);
const guestName = ref('');
const loading = ref(true);
const loadError = ref('');
const creating = ref(false);
const saving = ref(false);
const formSide = ref<ArgumentSide>('for');
const mobileSide = ref<ArgumentSide>('for');
const title = ref('');
const description = ref('');
const source = ref('');
const formError = ref('');
const feedback = ref('');
const titleInput = ref<InstanceType<typeof BaseTextBox> | null>(null);
const statusLabels = { active: 'Обсуждаем', resolved: 'Решение принято', archived: 'В архиве' };
const sideItems: { key: ArgumentSide; value: string }[] = [{ key: 'for', value: 'За' }, { key: 'against', value: 'Против' }];
const argumentTabs = computed(() => sideItems.map(side => ({ ...side, badge: items.value.filter(item => item.side === side.key).length })));
useSeoMeta({ title: () => discussion.value ? `${discussion.value.title} — Discuss` : 'Обсуждение — Discuss' });

async function loadDiscussion() {
	loading.value = true;
	loadError.value = '';
	try {
		const data = await rooms.fetch(roomKey.value);
		room.value = data.room;
		guestName.value = data.session.guestName;
		discussion.value = await discussions.fetchOne(roomKey.value, discussionKey.value);
		items.value = await discussionArguments.fetch(roomKey.value, discussionKey.value);
	} catch (error) {
		if (error instanceof Error && error.message === 'Войдите в комнату с её паролем.') {
			await navigateTo({ path: '/', query: { room: roomKey.value, discussion: discussionKey.value } }, { replace: true });
		} else {
			loadError.value = error instanceof Error ? error.message : 'Попробуйте открыть страницу ещё раз.';
		}
	} finally {
		loading.value = false;
	}
}

async function openArgumentForm(side: ArgumentSide) {
	formSide.value = side;
	creating.value = true;
	formError.value = '';
	feedback.value = '';
	await nextTick();
	titleInput.value?.focus();
}

async function createArgument() {
	if (saving.value) return;
	saving.value = true;
	formError.value = '';
	try {
		const argument = await discussionArguments.create(roomKey.value, discussionKey.value, { side: formSide.value, title: title.value, description: description.value, source: source.value });
		items.value.push(argument);
		mobileSide.value = argument.side;
		creating.value = false;
		title.value = '';
		description.value = '';
		source.value = '';
		feedback.value = 'Аргумент добавлен.';
	} catch (error) {
		formError.value = error instanceof Error ? error.message : 'Не удалось добавить довод.';
	} finally {
		saving.value = false;
	}
}

onMounted(loadDiscussion);
watch([roomKey, discussionKey], () => {
	room.value = null;
	discussion.value = null;
	items.value = [];
	creating.value = false;
	title.value = '';
	description.value = '';
	source.value = '';
	feedback.value = '';
	mobileSide.value = 'for';
	loadDiscussion();
});
</script>

<style lang="scss">
#discussion-page {
	max-width: 1120px;
	margin: 0 auto;
	padding: 16px 24px 40px;
	.dp-back { display: inline-block; margin-bottom: 28px; font-size: 13px; color: var(--color-muted); text-decoration: none; overflow-wrap: anywhere; &:hover { color: var(--color-primary); } }
	.dp-message { color: var(--color-muted); }
	.discussion-heading {
		padding-bottom: 28px;
		border-bottom: 1px solid var(--color-border);
		.dp-status { display: inline-block; background: #edf3ff; color: #3263b1; font-size: 11px; padding: 6px 10px; border-radius: 6px; &.resolved { background: #e9f5ee; color: #36765a; } &.archived { background: #f0f2f5; color: #64748b; } }
		.dp-title { max-width: 820px; font-size: clamp(28px, 4vw, 38px); letter-spacing: -.8px; line-height: 1.25; margin: 18px 0; overflow-wrap: anywhere; }
		.dp-description { max-width: 780px; color: var(--color-muted); line-height: 1.7; font-size: 15px; white-space: pre-wrap; overflow-wrap: anywhere; }
		.dp-guest { display: block; margin-top: 20px; color: var(--color-muted); font-size: 12px; overflow-wrap: anywhere; }
	}
	.argument-toolbar {
		display: flex; flex-direction: column; gap: 20px; margin: 28px 0 24px;
		.dp-heading-copy { .dp-section-title { margin: 0 0 8px; font-size: 22px; } .dp-section-description { margin: 0; max-width: 430px; color: var(--color-muted); font-size: 13px; line-height: 1.6; } }
	}
	.dp-readonly-note { padding: 12px; border-radius: 10px; background: #edf3ff; color: #31558a; font-size: 13px; }
	.argument-form {
		padding: 24px; margin-bottom: 24px; display: grid; gap: 18px; border: 1px solid var(--color-border); border-radius: 16px; background: white;
		.dp-form-title { font-size: 20px; margin: 0; }
		.dp-form-error { font-size: 13px; color: #b63d3d; margin: 0; }
		.form-actions { display: flex; flex-wrap: wrap; gap: 12px; }
	}
	.dp-feedback { font-size: 13px; color: #36765a; }
	.mobile-side-tabs { margin-bottom: 24px; }
	.argument-columns {
		display: grid; gap: 24px;
		.argument-column {
			min-width: 0; display: none;
			&.selected { display: block; }
			.column-heading { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; .column-title { margin: 0; font-size: 16px; } .column-count { font-size: 12px; padding: 4px 8px; background: #e9f5ee; border-radius: 6px; color: #36765a; } }
			.argument-list {
				display: grid; gap: 16px;
				.argument-card {
					padding: 22px; background: white; border: 1px solid var(--color-border); border-top: 3px solid #aad5c1; border-radius: 14px;
					.argument-meta { display: flex; align-items: center; gap: 8px; .argument-avatar { flex-shrink: 0; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #edf3ff; color: #3263b1; font-size: 10px; } .argument-author { font-size: 11px; color: var(--color-muted); overflow-wrap: anywhere; } }
					.argument-title { margin: 16px 0 10px; font-size: 16px; line-height: 1.5; overflow-wrap: anywhere; }
					.argument-description { margin: 0; color: var(--color-muted); font-size: 13px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
					.argument-source { display: inline-flex; gap: 6px; align-items: center; margin-top: 16px; font-size: 12px; color: var(--color-primary); text-decoration: none; &:hover { text-decoration: underline; } }
				}
				.column-empty { padding: 36px 24px; border: 1px dashed var(--color-border); border-radius: 14px; text-align: center; .empty-symbol { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #e9f5ee; color: #36765a; font-size: 26px; } .empty-title { font-size: 16px; margin: 16px 0 8px; } .empty-description { font-size: 13px; color: var(--color-muted); line-height: 1.6; margin: 0; } }
			}
			.column-add { width: 100%; margin-top: 16px; }
			&.against {
				.column-heading { .column-count { background: #fff0e1; color: #a66b43; } }
				.argument-list { .argument-card { border-top-color: #e4c4a4; } .column-empty { .empty-symbol { background: #fff0e1; color: #a66b43; } } }
			}
		}
	}
	.dp-empty { padding: 32px; text-align: center; border: 1px dashed var(--color-border); border-radius: 16px; .dp-empty-title { font-size: 22px; } .dp-empty-description { color: var(--color-muted); font-size: 14px; } }
	@media (min-width: 900px) {
		.argument-toolbar { flex-direction: row; align-items: center; justify-content: space-between; }
		.argument-form { max-width: 700px; }
		.mobile-side-tabs { display: none; }
		.argument-columns { grid-template-columns: repeat(2, 1fr); .argument-column { display: block; } }
	}
}
</style>
