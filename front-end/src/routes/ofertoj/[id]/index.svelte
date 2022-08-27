<script>
	import { session } from '$app/stores';
	import { getDate, changeObservationCreator } from '$lib/utils';

	const changeObservation = changeObservationCreator();

	export let offer;

	let title = offer.title;
</script>

<svelte:head>
	<title>{title} | Laborperejo</title>
	<meta name="description" content="Oferto {title} ĉe laborperejo." />
</svelte:head>

<div class="offer__container">
	<div class="offer">
		<div class="offer__left">
			<div class="offer__left-top">
				<div class="offer__image-container">
					<a href={'/firmaoj/' + offer.company_ID}>
						<img
							src={offer.company.logo}
							alt={'Emblemo de ' + offer.company.name}
							class="offer__image"
						/>
					</a>
				</div>
				<div class="offer__left-top-text">
					<span class="offer__title">
						<span class="offer__title-text">{offer.title}</span>
						{#if $session?.ID}
							<button on:click={() => changeObservation(offer.ID, offer)} class="offer__star"
								>{#if $session.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
									<span class="offer__star-text">Malobservi</span>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
										><path fill="none" d="M0 0h24v24H0z" /><path
											d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
										/></svg
									>{:else}<span class="offer__star-text">Observi</span>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
										><path fill="none" d="M0 0h24v24H0z" /><path
											d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
										/></svg
									>{/if}</button
							>
						{/if}
					</span>
					<span class="offer__left-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path d="M10 10.111V1l11 6v14H3V7z" /></svg
						>
						<a href={'/firmaoj/' + offer.company_ID}>
							{offer.company.name}
						</a>
					</span>
					<span class="offer__left-element"
						><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
							/></svg
						>
						{offer.place}, {offer.country}</span
					>
					{#if offer.isOwner}
						<a href={`/ofertoj/${offer.ID}/redakti`} class="offer__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0L24 0 24 24 0 24z" /><path
									d="M20 2c.552 0 1 .448 1 1v3.757l-2 2V4H5v16h14v-2.758l2-2V21c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V3c0-.552.448-1 1-1h16zm1.778 6.808l1.414 1.414L15.414 18l-1.416-.002.002-1.412 7.778-7.778zM13 12v2H8v-2h5zm3-4v2H8V8h8z"
								/></svg
							>
							Redakti</a
						>
					{/if}
				</div>
			</div>
			<div class="offer__left-bottom">
				{@html offer.description}
			</div>
		</div>
		<div class="offer__ad">
			Saluton, Jano ĉi-flanke, la kreinto de la retejo. Vivteni servilon ne estas senpage, <b
				>160€ jare</b
			>
			sufiĉus por tiu ĉi celo. Kiel lernejano al kiu ĉiam mankas mono, mi petas vin subteni la projekton
			per <a href="https://www.paypal.com/paypalme/janomichalako">Paypal</a> aŭ
			<a href="https://www.patreon.com/janomichalako">Patreon</a>. Grandan antaŭdankon al ĉiu
			donacanto!
		</div>
		<div class="offer__right">
			<div class="offer__right-element">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M12 15.968l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275v10.693zm0 2.292l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26z"
					/></svg
				>
				Dungeco:
				{offer.employment}
			</div>
			<div class="offer__right-element">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M21 21H3a1 1 0 0 1-1-1v-7.513a1 1 0 0 1 .343-.754L6 8.544V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1zM9 19h3v-6.058L8 9.454l-4 3.488V19h3v-4h2v4zm5 0h6V5H8v2.127c.234 0 .469.082.657.247l5 4.359a1 1 0 0 1 .343.754V19zm2-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V7zm-4 0h2v2h-2V7z"
					/></svg
				>
				Maniero:
				{offer.arrangement}
			</div>
			<div class="offer__right-element">
				{#if offer.salary}<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M23 12v2c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-2c0 3.314 4.925 6 11 6s11-2.686 11-6zM12 4c6.075 0 11 2.686 11 6s-4.925 6-11 6-11-2.686-11-6 4.925-6 11-6z"
						/></svg
					>Salajro:
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 9h2v4h2V9h2l-3-3.5L7 9zm10 6h-2v-4h-2v4h-2l3 3.5 3-3.5z"
						/></svg
					>Rekompenco:
				{/if}
				{offer.reward}
			</div>
			<div class="offer__right-element">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M22 14h-2V7.238l-7.928 7.1L4 7.216V19h11v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10zM4.511 5l7.55 6.662L19.502 5H4.511zm16.903 14l2.122 2.121-1.415 1.415L20 20.414l-2.121 2.122-1.415-1.415L18.586 19l-2.122-2.121 1.415-1.415L20 17.586l2.121-2.122 1.415 1.415L21.414 19z"
					/></svg
				>
				{#if offer.closed}
					<span class="offer__closed">La oferto jam fermiĝis</span>
				{:else}
					Fermiĝo: {getDate(offer.close_at)}
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="sass">
@use '../../../styles/components' 
@use '../../../styles/abstracts/typography' 
@use '../../../styles/abstracts/colors'
@use '../../../styles/abstracts/functions'

.offer
	@include components.profile
	grid-template-rows: 198px auto
	grid-template-areas: 'left ad' 'left right'

	@media (max-width: 1000px)
		grid-template-rows: auto 
		grid-template-areas: 'ad' 'left' 'right'

	&__ad
		padding: 10px
		border: functions.generateBorder(1, colors.$szarszy)
		font-family: typography.$open-sans
		background: colors.$bialy
		border-radius: 10px
		grid-area: ad

	&__left
		grid-area: left

	&__right
		grid-area: right

	&__closed
		color: colors.$crimson

	&__star
		display: inline-flex
		align-items: center
		font-family: typography.$open-sans
		font-size: 1rem
		color: colors.$navy
		column-gap: 5px
		cursor: pointer
		background: transparent
		border: 0

		&-text
			overflow-wrap: normal

			@media (max-width: 700px)
				display: none

</style>
