<script context="module">
	export const load = ({ session }) => {
		const ID = session?.ID;
		return ID
			? {
					redirect: '/uzantoj/' + ID,
					status: 303
			  }
			: {};
	};
</script>

<script>
	const scrollDown = () => {
		window.scroll({
			top: window.innerHeight - 50,
			left: 0,
			behavior: 'smooth'
		});
	};
</script>

<svelte:head>
	<title>Hejmo | Laborperejo</title>
	<meta
		name="description"
		content="Laborperejo estas loko, kie Esperantistaj entreprenistoj renkontiĝas kun Verdaj
  profesiuloj, internacie!"
	/>
</svelte:head>
<section class="hero">
	<img src="/hero.jpeg" alt="Suprsekcia bildo" class="hero__image" />
	<div class="hero__content">
		<div class="hero__background" />
		<div class="hero__text">
			<h1 class="hero__title">Bonvenon al Laborperejo!</h1>
			<h2 class="hero__sub-title">
				La loko, kie Esperantistaj entreprenistoj renkontiĝas kun Verdaj profesiuloj,
				<span class="hero__standing-out">internacie</span>!
			</h2>
			<div class="hero__buttons-container">
				<a class="hero__button hero__button--green hero__button--round" href="/registrigxi"
					>Registriĝi</a
				>
				<!-- svelte-ignore a11y-invalid-attribute -->
				<a class="hero__button hero__button--round" href="javascript:void(0)" on:click={scrollDown}
					>Ekscii pli</a
				>
			</div>
		</div>
		<div class="hero__wave">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
				<path
					fill="#19629C"
					fill-opacity="1"
					d="M0,160L48,149.3C96,139,192,117,288,112C384,107,480,117,576,138.7C672,160,768,192,864,181.3C960,171,1056,117,1152,106.7C1248,96,1344,128,1392,144L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
				/>
			</svg>
		</div>
	</div>
</section>
<section class="learn-more">
	<div class="learn-more__left">
		<h1 class="learn-more__title">Kio estas Laborperejo?</h1>
		<p class="learn-more__paragraph">
			Laborperejo estas senpaga, sekura kaj nespionada servo por serĉi kaj afiŝi ofertojn, krei
			profilojn de firmaoj kaj prezenti vivresumojn sur uzantprofiloj. Kompreneble tio ne estas ĉio!
			Vi ekscios pri pliaj funkcioj post registriĝado, simple alklaku la suban butonon.
		</p>
		<a
			class="learn-more__button learn-more__button--green learn-more__button--round"
			href="/registrigxi">Registriĝi</a
		>
	</div>
	<div class="learn-more__right">
		<h1 class="learn-more__title">Por kiu estas Laborperejo?</h1>
		<ul class="learn-more__list">
			<li class="learn-more__list-item">
				<b>Por Esperanto-asocioj</b>, kiuj serĉas fervorajn volontulojn.
			</li>
			<li class="learn-more__list-item">
				<b>Por tiuj</b>, kiuj revas labori en Esperantujo.
			</li>
			<li class="learn-more__list-item">
				<b>Por labordonantoj</b>, kiuj volas aldoni iomete da internacieco al siaj firmaoj.
			</li>
			<li class="learn-more__list-item">
				<b>Por rekrutistoj</b>, kiuj serĉas spertulojn pri diversaj fakoj.
			</li>
			<li class="learn-more__list-item">
				<b>Por studentoj</b>, kiuj volas gajni sperton per eksterlandaj praktikoj.
			</li>
		</ul>
	</div>
	<svg viewBox="0 128 178 200" preserveAspectRatio="none"
		><path
			xmlns="http://www.w3.org/2000/svg"
			d="M98 0L96.5 14.3C95 28.7 92 57.3 93.7 85.8C95.3 114.3 101.7 142.7 99.2 171.2C96.7 199.7 85.3 228.3 80.7 257C76 285.7 78 314.3 82 343C86 371.7 92 400.3 92.3 428.8C92.7 457.3 87.3 485.7 83.2 514.2C79 542.7 76 571.3 74.5 585.7L73 600L0 600L0 585.7C0 571.3 0 542.7 0 514.2C0 485.7 0 457.3 0 428.8C0 400.3 0 371.7 0 343C0 314.3 0 285.7 0 257C0 228.3 0 199.7 0 171.2C0 142.7 0 114.3 0 85.8C0 57.3 0 28.7 0 14.3L0 0Z"
			fill="#1A67A3"
			stroke-linecap="round"
			stroke-linejoin="miter"
		/></svg
	>
</section>

<!-- <a
  href="https://unsplash.com/@wocintechchat?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
  >Christina @ wocintechchat.com</a
>
on
<a
  href="https://unsplash.com/s/photos/interview?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
  >Unsplash</a
> -->
<style lang="sass">
@use "sass:map"
@use '../styles/abstracts/colors'
@use '../styles/abstracts/misc'
@use '../styles/abstracts/typography'
@use '../styles/abstracts/mixins'
@use '../styles/components'

.hero
	height: map.get(misc.$heights, "but-header")

	&__wave
		display: none
	
	&__image
		height: map.get(misc.$heights, "but-header")
		width: 100%
		object-fit: cover

	&__background
		background: colors.$navy
		opacity: 0.8
		@include mixins.square(100%)

	&__content
		clip-path: polygon(0 100%, 0 0, 40% 0, 55% 100%)
		position: absolute
		width: 100%
		top: 50px
		height: map.get(misc.$heights, "but-header")

	&__text
		gap: 30px
		padding-left: 70px
		box-sizing: border-box
		display: flex
		flex-direction: column
		justify-content: center
		top: 0
		height: 90%
		width: 100%
		position: absolute

	&__title
		margin: 0
		color: colors.$szary
		width: 43%
		font-weight: typography.$bold
		font-size: min(typography.$huge, 5vw)
		font-family: typography.$raleway

	&__sub-title
		margin: 0
		width: 43%
		font-family: typography.$raleway
		color: colors.$szary
		font-size: min(typography.$large, 3vw)
		font-weight: typography.$medium

	&__standing-out
		color: colors.$zielony
		font-weight: typography.$large

	&__button
		width: 200px
		@include components.button

	&__buttons-container
		display: flex
		column-gap: 20px

.learn-more
	background: colors.$szary
	position: relative
	display: flex
	height: map.get(misc.$heights, "but-header")

	svg
		position: absolute
		left:0
		top:0
		@include mixins.square(100%)

	&__left, &__right
		margin: calc(100vh - 50px - 65vh) 40px 40px 40px
		z-index: 2
		flex: 1
		margin-bottom: 100px
		display: flex
		align-items: center
		flex-direction: column
		font-family: typography.$raleway
		font-size: typography.$normal

	&__left
		margin-right: 70px
		color: colors.$szary
		
	&__title
		text-align: center
		margin: 0
		font-family: typography.$raleway
		font-size: typography.$large

	&__button
		width: 200px
		@include components.button

@media (max-width: 1050px)
	.hero
		height: 100vh

		&__wave
			position: relative
			display: block
			color: colors.$navy
			svg
				width: 100%
				height: 80px

		&__text
			z-index: 1
			height: 100%
			align-items: center
			padding: 20px

		&__title
			width: 100%
			max-width: 800px
			text-align: center
			font-size: min(typography.$huge, 13vw)
			// font-size: typography.$huge

		&__sub-title
			width: 100%
			max-width: 800px
			text-align: center
			font-size: min(typography.$large, 7vw)
			// font-size: typography.$large

		&__content
			clip-path: none

		&__buttons-container
			align-items: center
			row-gap: 20px
			flex-direction: column

		&__button
			width: 300px

	.learn-more
		height: max-content
		flex-direction: column-reverse
		align-items: center
		padding: 40px
		gap: 40px

		&__button
			width: 300px

		&__left, &__right
			margin: 0
			color: colors.$czarny
			max-width: 800px

		svg
			display: none

@media (max-width: 500px)

	.learn-more
		gap: 30px
		padding: 30px
</style>
