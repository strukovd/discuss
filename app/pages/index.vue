<template>
	<section id="index-page">
		<div class="intro">
			<span class="ip-eyebrow">ОБСУЖДАЙТЕ ВМЕСТЕ</span>
			<h1 class="ip-title">От разных мнений<br>к <span class="ip-accent">общему решению.</span></h1>
			<p class="ip-description">Соберите команду, разложите аргументы по полочкам и решите, как двигаться дальше.</p>
			<img class="ip-illustration" src="/illustrations/discussion.svg" alt="Аргументы за и против помогают прийти к общему решению" width="480" height="240">
			<div class="ip-principles">
				<span class="ip-principle">Без регистрации</span>
				<span class="ip-principle">Вход по ссылке</span>
				<span class="ip-principle">Каждый голос важен</span>
			</div>
		</div>
		<div class="entry-card">
			<div class="mode-switch" role="group" aria-label="Действие с комнатой">
				<button class="mode-button" :class="{ active: mode === 'create' }" type="button" :aria-pressed="mode === 'create'" @click="setMode('create')">Создать комнату</button>
				<button class="mode-button" :class="{ active: mode === 'join' }" type="button" :aria-pressed="mode === 'join'" @click="setMode('join')">Присоединиться</button>
			</div>
			<div class="ip-heading">
				<h2 class="ip-card-title">{{ mode === 'create' ? 'Начнём с комнаты' : 'Ваша команда уже здесь?' }}</h2>
				<p class="ip-card-description">{{ mode === 'create' ? 'Одно пространство для всех идей вашей команды.' : 'Введите ключ и пароль, которые вам передали.' }}</p>
			</div>
			<form class="entry-form" @submit.prevent="submitEntry">
				<BaseTextBox v-if="mode === 'create'" v-model="roomName" label="Название комнаты" placeholder="Например, Наша команда" required :maxlength="80" :error="nameError" />
				<BaseTextBox v-model="roomKey" :label="mode === 'create' ? 'Ключ комнаты · необязательно' : 'Ключ комнаты'" placeholder="our-team" :required="mode === 'join'" :maxlength="64" :error="keyError" :hint="mode === 'create' ? 'Для читаемой ссылки: латинские буквы, цифры и дефис.' : undefined" />
				<BaseTextBox v-model="password" label="Пароль комнаты" type="password" placeholder="Код для вашей команды" required :maxlength="128" :autocomplete="mode === 'create' ? 'new-password' : 'current-password'" />
				<BaseTextBox v-model="guestName" label="Как вас называть?" :placeholder="suggestedName" :maxlength="40" hint="Оставьте поле пустым — возьмём предложенное имя.">
					<template #append><button type="button" class="refresh-name" aria-label="Предложить другое имя" @click="nameIndex = (nameIndex + 1) % guestNames.length"><BaseIcon name="refresh" /></button></template>
				</BaseTextBox>
				<BaseButton type="submit" :loading="submitting" append-icon="arrow-right">{{ mode === 'create' ? 'Создать комнату' : 'Войти в комнату' }}</BaseButton>
				<p v-if="result" class="ip-result" role="alert">{{ result }}</p>
			</form>
			<BaseButton class="demo-button" variant="light" :loading="submitting" @click="openDemo">Посмотреть пример комнаты</BaseButton>
			<p class="ip-note">Только имя и пароль комнаты.<br>Никаких аккаунтов и лишних шагов.</p>
		</div>
		<div class="how-it-works">
			<div v-for="(step, index) in steps" :key="step.title" class="step">
				<span class="step-number">0{{ index + 1 }}</span>
				<div class="step-copy"><h3 class="step-title">{{ step.title }}</h3><p class="step-description">{{ step.description }}</p></div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { rooms } from '~/services/rooms';
import BaseIcon from '~/components/common/base/BaseIcon.vue';
import BaseButton from '~/components/common/base/BaseButton.vue';
import BaseTextBox from '~/components/common/base/BaseTextBox.vue';

useSeoMeta({ title: 'Discuss — место для общих решений', description: 'Обсуждайте идеи вместе: аргументы за и против, голосование и общие решения.' });
const route = useRoute();
const invitationKey = typeof route.query.room === 'string' ? route.query.room : '';
const mode = ref<'create' | 'join'>(invitationKey ? 'join' : 'create');
const roomName = ref('');
const roomKey = ref(invitationKey);
const submitting = ref(false);
const password = ref('');
const guestName = ref('');
const guestNames = ['Мятый Барсук', 'Сонный Лис', 'Серьёзный Пингвин', 'Хитрый Енот', 'Мудрая Сова', 'Философствующая Лягушка'];
const nameIndex = ref(0);
const suggestedName = computed(() => guestNames[nameIndex.value] ?? 'Мятый Барсук');
const keyError = ref('');
const nameError = ref('');
const result = ref('');
const steps = [
	{ title: 'Соберите команду', description: 'Создайте комнату и поделитесь ссылкой.' },
	{ title: 'Обсудите идеи', description: 'Сопоставьте аргументы за и против.' },
	{ title: 'Примите решение', description: 'Сохраните итог и его обоснование.' },
];

function setMode(value: 'create' | 'join') {
	mode.value = value;
	keyError.value = '';
	nameError.value = '';
	result.value = '';
}

async function submitEntry() {
	if (submitting.value) return;
	result.value = '';
	keyError.value = '';
	nameError.value = '';
	const key = roomKey.value.trim();
	if (key && !/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(key)) {
		keyError.value = 'Используйте латинские буквы, цифры и дефисы между ними.';
		return;
	}
	if (mode.value === 'create' && !roomName.value.trim()) {
		nameError.value = 'Введите название комнаты.';
		return;
	}
	if (mode.value === 'join' && !key) {
		keyError.value = 'Введите ключ комнаты.';
		return;
	}
	submitting.value = true;
	try {
		const guest = guestName.value.trim() || suggestedName.value;
		const room = mode.value === 'create'
			? await rooms.create({ name: roomName.value, key, password: password.value, guestName: guest })
			: await rooms.join({ key, password: password.value, guestName: guest });
		await navigateTo(`/rooms/${room.key}`);
	} catch (error) {
		result.value = error instanceof Error ? error.message : 'Не удалось войти. Попробуйте ещё раз.';
	} finally {
		submitting.value = false;
	}
}

async function openDemo() {
	if (submitting.value) return;
	submitting.value = true;
	result.value = '';
	try {
		const room = await rooms.join({ key: 'team-demo', password: 'discuss', guestName: guestName.value.trim() || suggestedName.value });
		await navigateTo(`/rooms/${room.key}`);
	} catch (error) {
		result.value = error instanceof Error ? error.message : 'Не удалось открыть пример.';
	} finally {
		submitting.value = false;
	}
}

watch([roomName, roomKey, password, guestName, nameIndex], () => {
	result.value = '';
	keyError.value = '';
	nameError.value = '';
});
</script>

<style lang="scss">
#index-page {
	width: min(1120px, 100%);
	margin: 0 auto;
	padding: 24px;
	display: grid;
	gap: 32px;
	.intro {
		.ip-eyebrow { font-size: 11px; letter-spacing: 2px; font-weight: 750; color: var(--color-primary); }
		.ip-title {
			margin: 18px 0;
			font-size: clamp(32px, 5vw, 48px);
			line-height: 1.15;
			letter-spacing: -1.8px;
			font-weight: 750;
			.ip-accent { color: var(--color-primary); }
		}
		.ip-description { max-width: 410px; color: var(--color-muted); line-height: 1.7; font-size: 15px; margin: 0; }
		.ip-illustration { display: block; width: 100%; max-width: 460px; height: auto; margin: 24px 0 16px; }
		.ip-principles {
			display: flex; flex-wrap: wrap; gap: 10px 16px;
			.ip-principle { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-muted); &::before { content: '✓'; color: #308579; font-weight: 700; } }
		}
	}
	.entry-card {
		padding: 20px;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		box-shadow: 0 12px 36px #243d6810;
		.mode-switch {
			display: flex; padding: 4px; background: #f0f4f9; border-radius: 11px;
			.mode-button { flex: 1; min-height: 40px; padding: 8px 4px; border: 0; background: transparent; border-radius: 8px; font-size: 12px; font-weight: 650; color: var(--color-muted); cursor: pointer; &.active { background: white; color: var(--color-primary); box-shadow: 0 2px 5px #243d6810; } }
		}
		.ip-heading {
			margin: 24px 0;
			.ip-card-title { margin: 0 0 8px; font-size: 22px; letter-spacing: -.5px; }
			.ip-card-description { margin: 0; font-size: 13px; line-height: 1.6; color: var(--color-muted); }
		}
		.entry-form {
			display: grid; gap: 18px;
			.base-text-box { .bt-area { .refresh-name { min-width: 44px; height: 44px; border: 0; border-radius: 8px; background: transparent; color: var(--color-primary); font-size: 25px; cursor: pointer; &:hover { background: #edf3ff; } } } }
			.ip-result { margin: 0; padding: 12px; border-radius: 10px; color: #31558a; background: #edf3ff; font-size: 13px; line-height: 1.6; }
		}
		.demo-button { width: 100%; margin-top: 12px; }
		.ip-note { margin: 20px 0 0; text-align: center; font-size: 11px; line-height: 1.7; color: var(--color-muted); }
	}
	.how-it-works {
		display: grid; gap: 24px; padding-top: 28px; border-top: 1px solid var(--color-border);
		.step {
			display: flex; align-items: flex-start; gap: 14px;
			.step-number { padding-top: 2px; color: var(--color-primary); font-size: 13px; font-weight: 750; }
			.step-copy {
				.step-title { margin: 0 0 6px; font-size: 14px; }
				.step-description { margin: 0; color: var(--color-muted); font-size: 12px; line-height: 1.6; }
			}
		}
	}
	@media (min-width: 900px) {
		padding-top: 40px;
		grid-template-columns: 1fr 400px;
		gap: 56px 72px;
		.intro { padding-top: 30px; }
		.entry-card { padding: 28px; }
		.how-it-works { grid-column: 1 / -1; grid-template-columns: repeat(3, 1fr); padding-top: 32px; }
	}
}
</style>
