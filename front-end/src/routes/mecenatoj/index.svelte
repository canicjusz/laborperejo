<script>
	export let patrons;
	const patronsExist = patrons.length !== 0;
</script>

<svelte:head>
	<title>Mecenatoj | Laborperejo</title>
	<meta name="description" content="Privateca politiko de laborperejo." />
</svelte:head>
<div class="patrons__container">
	<div class="patrons">
		<h1 class="patrons__title">Mecenatoj</h1>
		<p class="patrons__paragraph">
			Ĉi tie listiĝas homoj kaj firmaoj, kiuj malavare subtenadas nian laboron kaj helpas al ni pagi
			elspezojn rilatajn al servilo, retpoŝtado, ktp.
		</p>
		{#if patronsExist}
			<ul class="patrons__list">
				{#each patrons as { name, link, message }}
					<li><a href={link}>{name}</a> - {message}</li>
				{/each}
			</ul>
			<p class="patrons__paragraph">
				Se vi ankaŭ pensas ke ĉi tiu servo estas utila kaj volas iĝi nia mecenato, alklaku <a
					href="https://www.patreon.com/janoeo">ĉi tie</a
				> kaj elektu rangon "Mecenato".
			</p>
		{:else}
			<p class="patrons__paragraph">
				Se vi pensas ke ĉi tiu servo estas utila kaj volas iĝi nia unua mecenato, alklaku <a
					href="https://www.patreon.com/janoeo">ĉi tie</a
				> kaj elektu rangon "Mecenato".
			</p>
		{/if}
	</div>
</div>

<style lang="sass">
@use '../../styles/components'

.patrons
	@include components.info-page
</style>
