<template>
	<div class="default-layout">
		<header class="dl-header">
			<NuxtLink to="/" class="dl-brand" aria-label="Discuss — главная">
				<svg class="dl-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
					<path d="M5 5h17a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H12l-7 5V5Z" fill="currentColor" />
					<path d="M11 12h10M11 17h6" stroke="white" stroke-width="2" stroke-linecap="round" />
				</svg>
				<span class="dl-name">Discuss<span class="dl-dot">.</span></span>
			</NuxtLink>
			<span class="dl-caption">Место для общих решений</span>
		</header>
		<main class="dl-main"><slot /></main>
		<footer class="dl-footer">Разные мнения. Общее понимание.</footer>
	</div>
</template>

<style lang="scss">
.default-layout {
	min-height: 100dvh;
	display: flex;
	flex-direction: column;
	.dl-header {
		width: min(1120px, 100%);
		margin: 0 auto;
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		.dl-brand {
			display: flex;
			align-items: center;
			gap: 10px;
			text-decoration: none;
			.dl-mark { width: 32px; height: 32px; color: var(--color-primary); }
			.dl-name {
				font-size: 25px;
				font-weight: 750;
				letter-spacing: -1px;
				.dl-dot { color: var(--color-primary); }
			}
		}
		.dl-caption { display: none; color: var(--color-muted); font-size: 13px; }
	}
	.dl-main { flex: 1; width: 100%; }
	.dl-footer { padding: 28px 24px; text-align: center; font-size: 12px; color: var(--color-muted); }
	@media (min-width: 768px) {
		.dl-header { padding: 32px 24px; .dl-caption { display: block; } }
	}
}
</style>
