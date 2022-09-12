<script>
	export let show;
	import { cubicInOut } from 'svelte/easing';

	const customTransition = () => {
		return {
			css: (t) => {
				return `
        transform: scale(${t});
        opacity: ${t};
        `;
			},
			easing: cubicInOut,
			duration: 500
		};
	};
</script>

{#if show}
	<div class="popup__wrapper">
		<form transition:customTransition class="popup" on:submit|preventDefault>
			<slot />
		</form>
	</div>
{/if}

<style lang="sass">
@use '../styles/abstracts/colors' 
@use "sass:map"
@use '../styles/abstracts/misc'
@use '../styles/abstracts/typography'
@use '../styles/components'

:global

	.popup
		display: flex
		flex-direction: column
		row-gap: 10px
		z-index: 2
		box-shadow: 0 0 10px colors.$najszarszy
		position: absolute
		left: 0
		right: 0
		top: 0
		bottom: 0
		margin: auto
		height: max-content
		width: 300px
		background: colors.$szary
		padding: 10px

		&__wrapper
			top: 50px
			left: 0
			z-index: 2
			position: fixed
			height: map.get(misc.$heights, "but-header")
			width: 100vw

		&__title
			margin: 0
			font-size: typography.$large
			font-family: typography.$raleway

			&--red
				color: colors.$crimson

			&--blue
				color: colors.$niebieski-link

		&__text
			margin: 0
			font-family: typography.$open-sans

		&__buttons
			flex-direction: column
			display: flex
			row-gap: 10px

		&__button
			@include components.button

		&__input
			max-width: 100% !important
</style>
