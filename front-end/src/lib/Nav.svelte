<script>
	import { error } from './stores';
	import { getDate, changeObservationCreator, deleteData } from '$lib/utils';
	import { navigating, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { variables } from '$lib/variables';

	const changeObservation = changeObservationCreator();

	// export let user;

	let hide = {
		search: true,
		profile: true,
		panels: true,
		watched: true
	};

	let hamburgerClicked = false;
	const hideKeys = Object.keys(hide);
	const hideExpandedBut = (openedKey) => {
		hideKeys.forEach((key) => {
			hide[key] = key === openedKey ? !hide[key] : true;
		});
	};
	const hideIfOutside = (e) => {
		const element = e.target;
		if (
			!element.classList.contains('navbar__expander') &&
			!element.classList.contains('star__svg') &&
			!element.classList.contains('window__star-svg')
		) {
			hideKeys.forEach((key) => {
				hide[key] = true;
			});
		}
	};
	const deleteSession = () =>
		deleteData(variables.base + '/api/session', true)
			.then((res) => {
				goto('/');
				session.set(null);
			})
			.catch(error.change);
	$: if ($navigating) {
		hamburgerClicked = false;
	}
</script>

<svelte:window on:click={hideIfOutside} />

<nav class="navbar navbar--full">
	<ul class="navbar__list">
		<li>
			<a href="/" class="navbar__logo-container"
				><img src="/logo.png" alt="Laborperejo-emblemo" class="navbar__logo" /></a
			>
		</li>
		<li class="navbar__element">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<span
				on:click={() => hideExpandedBut('search')}
				class="navbar__expander"
				class:navbar__expander--active={!hide.search}>Serĉi</span
			>
			<ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.search}>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/ofertoj?p=1">Ofertojn</a>
				</li>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/firmaoj?p=1">Firmaojn</a>
				</li>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/uzantoj?p=1">Uzantojn</a>
				</li>
			</ul>
		</li>
		{#if $session}
			<li class="navbar__element">
				<!-- svelte-ignore a11y-invalid-attribute -->
				<span
					on:click={() => hideExpandedBut('panels')}
					class="navbar__expander"
					class:navbar__expander--active={!hide.panels}>Paneloj</span
				>
				<ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.panels}>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/firmapanelo">Firmopanelo</a>
					</li>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/ofertpanelo">Ofertpanelo</a>
					</li>
				</ul>
			</li>{/if}
		<li class="navbar__element">
			<a class="navbar__link" href="/mecenatoj">Mecenatoj</a>
		</li>
		<!-- <li class="navbar__element">
      <a href="/" class="navbar__link">Helpo</a>
    </li>
    <li class="navbar__element">
      <a href="/" class="navbar__link">Pri ni</a>
    </li> -->
	</ul>
	{#if $session}
		<ul class="navbar__list navbar__list-left">
			<li class="navbar__star star">
				<svg
					class="star__svg"
					on:click={() => hideExpandedBut('watched')}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
					/></svg
				>
				<span class="star__number">{$session.watchlist.length}</span>
				<div class="navbar__window window" class:window--hidden={hide.watched}>
					<ul class="window__list">
						{#if $session.watchlist.length > 0}
							{#each $session.watchlist as offer}
								<li class="window__element">
									<img
										src={offer.company.logo}
										alt={'Emblemo de ' + offer.company.name}
										class="window__image"
									/>
									<div class="window__text">
										<span class="window__text-top">
											<a href={'/ofertoj/' + offer.ID} class="window__link">{offer.title}</a>
											<button
												on:click={() => changeObservation(offer.ID, offer)}
												class="window__star"
												>{#if $session.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
													<svg
														class="window__star-svg"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														width="24"
														height="24"
														><path fill="none" d="M0 0h24v24H0z" /><path
															d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
														/></svg
													>{:else}
													<svg
														class="window__star-svg"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														width="24"
														height="24"
														><path fill="none" d="M0 0h24v24H0z" /><path
															d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
														/></svg
													>{/if}</button
											>
										</span>
										{#if offer.closed}
											<small class="window__red">La oferto jam fermiĝis</small>
										{:else}
											<small>Fermonta {getDate(offer.close_at)}</small>
										{/if}
									</div>
								</li>
							{/each}
						{:else}
							<li class="window__element window__red">Vi observas neniun oferton</li>
						{/if}
					</ul>
				</div>
			</li>
			<li class="navbar__expander-container">
				<span
					class="navbar__expander"
					on:click={() => hideExpandedBut('profile')}
					class:navbar__expander--active={!hide.profile}
					><img src={$session.profile.avatar} alt="Via profilbildo" class="navbar__avatar" />
					<span class="navbar__name">
						{$session.name}
					</span></span
				>
				<ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.profile}>
					<li class="navbar__sub-element">
						<a class="navbar__link" href={`/uzantoj/${$session.ID}`}>Mia profilo</a>
					</li>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/firmapanelo">Firmopanelo</a>
					</li>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/ofertpanelo">Ofertpanelo</a>
					</li>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/restarigi-pasvorton">Restarigi pasvorton</a>
					</li>
					<li on:click={deleteSession} class="navbar__sub-element">
						<a class="navbar__link" href="javascript:void()">Elsaluti</a>
					</li>
				</ul>
			</li>
		</ul>
	{:else}
		<div>
			<ul class="navbar__list">
				<li class="navbar__element">
					<a class="navbar__link" href="/registrigxi">Registriĝi</a>
				</li>
				<li class="navbar__element">
					<a class="navbar__link" href="/ensaluti">Ensaluti</a>
				</li>
			</ul>
		</div>
	{/if}
</nav>

<nav class="navbar navbar--mobile">
	<div class="navbar__inner-container">
		<a href="/" class="navbar__logo-container"
			><img src="/logo.png" alt="Laborperejo-emblemo" class="navbar__logo" /></a
		>
		<div class="navbar__right-side">
			{#if $session}
				<div class="star">
					<svg
						class="star__svg"
						on:click={() => hideExpandedBut('watched')}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
						/></svg
					>
					<span class="star__number">{$session.watchlist.length}</span>
					<div class="navbar__window window" class:window--hidden={hide.watched}>
						<ul class="window__list">
							{#if $session.watchlist.length > 0}
								{#each $session.watchlist as offer}
									<li class="window__element">
										<img
											src={offer.company.logo}
											alt={'Emblemo de ' + offer.company.name}
											class="window__image"
										/>
										<div class="window__text">
											<span class="window__text-top">
												<a href={'/ofertoj/' + offer.ID} class="window__link">{offer.title}</a>
												<button
													on:click={() => changeObservation(offer.ID, offer)}
													class="window__star"
													>{#if $session.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
														<svg
															class="window__star-svg"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															width="24"
															height="24"
															><path fill="none" d="M0 0h24v24H0z" /><path
																d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
															/></svg
														>{:else}
														<svg
															class="window__star-svg"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															width="24"
															height="24"
															><path fill="none" d="M0 0h24v24H0z" /><path
																d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
															/></svg
														>{/if}</button
												>
											</span>
											{#if offer.closed}
												<small class="window__red">La oferto jam fermiĝis</small>
											{:else}
												<small>Fermonta {getDate(offer.close_at)}</small>
											{/if}
										</div>
									</li>
								{/each}
							{:else}
								<li class="window__element">Vi observas neniun oferton</li>
							{/if}
						</ul>
					</div>
				</div>
			{/if}
			<div
				class="hamburger"
				class:hamburger--clicked={hamburgerClicked}
				on:click={() => (hamburgerClicked = !hamburgerClicked)}
			>
				<div class="hamburger__cheese" />
				<div class="hamburger__meat" />
				<div class="hamburger__bun" />
			</div>
		</div>
	</div>
	<ul class="navbar__list" class:navbar__list--show={hamburgerClicked}>
		<li class="navbar__element">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<span
				on:click={() => hideExpandedBut('search')}
				class="navbar__expander"
				class:navbar__expander--active={!hide.search}>Serĉi</span
			>
			<ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.search}>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/ofertoj?p=1">Ofertojn</a>
				</li>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/firmaoj?p=1">Firmaojn</a>
				</li>
				<li class="navbar__sub-element">
					<a class="navbar__link" href="/uzantoj?p=1">Uzantojn</a>
				</li>
			</ul>
		</li>
		{#if $session}
			<li class="navbar__element">
				<!-- svelte-ignore a11y-invalid-attribute -->
				<span
					on:click={() => hideExpandedBut('panels')}
					class="navbar__expander"
					class:navbar__expander--active={!hide.panels}>Paneloj</span
				>
				<ul class="navbar__sub-list" class:navbar__sub-list--hidden={hide.panels}>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/firmapanelo">Firmopanelo</a>
					</li>
					<li class="navbar__sub-element">
						<a class="navbar__link" href="/ofertpanelo">Ofertpanelo</a>
					</li>
				</ul>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href="/mecenatoj">Mecenatoj</a>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href={`/uzantoj/${$session.ID}`}>Mia profilo</a>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href="/firmapanelo">Firmopanelo</a>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href="/ofertpanelo">Ofertpanelo</a>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href="/restarigi-pasvorton">Restarigi pasvorton</a>
			</li>
			<li on:click={deleteSession} class="navbar__element">
				<a class="navbar__link" href="javascript:void()">Elsaluti</a>
			</li>
		{:else}
			<li class="navbar__element">
				<a class="navbar__link" href="/registrigxi">Registriĝi</a>
			</li>
			<li class="navbar__element">
				<a class="navbar__link" href="/ensaluti">Ensaluti</a>
			</li>
		{/if}
	</ul>
</nav>

<style lang="sass">
@use '../styles/abstracts/colors' 
@use '../styles/abstracts/typography'
@use '../styles/abstracts/mixins'
@use '../styles/abstracts/functions'
@use '../styles/components'

.navbar
	z-index: 3
	position: fixed
	width: 100%
	justify-content: space-between
	display: flex
	height: 50px
	box-sizing: border-box
	background: colors.$bialy
	font-family: typography.$open-sans
	border-bottom: functions.generateBorder(1, colors.$szarszy)

	&--mobile
		display: none

	&__logo
		width: 100%

		&-container
			padding: 0 10px
			height: 100%
			align-items: center
			display: flex
			width: 150px
	
	&__list
		height: 100%
		align-items: center
		margin: 0
		padding: 0
		list-style: none
		display: flex

		&-left
			column-gap: 10px

			.navbar__expander::after
				margin-right: 20px

	&__sub

		&-list
			border: functions.generateBorder(1, colors.$szarszy)
			border-top: none
			background: colors.$bialy
			margin: 0
			padding: 0
			list-style: none
			display: block

			&--hidden
				display: none

		&-element
			height: 50px

			&:hover
				background: colors.$szary

	&__element
		height: 100%
		width: 150px

	&__expander, &__link
		@include mixins.square(100%)
		@include mixins.center(false, true)
		@include components.link

		&:hover, &--active
			background: colors.$szary

	&__expander
		gap: 10px
		@include components.expander-arrow(colors.$niebieski-link, colors.$niebieski-link)

		&-container
			height: 100%

	&__avatar
		pointer-events: none
		margin: 0 20px
		@include mixins.circlePhoto(40px)

	&__name
		text-overflow: ellipsis
		overflow: hidden
		white-space: nowrap
		max-width: 250px
		min-width: 70px
		pointer-events: none


.star
	height: 100%
	@include mixins.center(false, false)
	position: relative
	width: 40px
	padding-top: 4px

	svg
		color: colors.$navy
		cursor: pointer
		@include mixins.square(25px)

	path
		pointer-events: none

	&__number
		user-select: none
		top: 5px
		right: -1px
		position: absolute
		border-radius: 50%
		@include mixins.square(18px)
		@include mixins.center(false, true)
		margin: 0
		color: colors.$bialy
		background: colors.$crimson
		font-size: 0.7rem

.window
	position: absolute
	width: 250px
	max-height: 300px
	height: max-content
	background: colors.$szary
	right: 0
	top: 100% 
	border: functions.generateBorder(1, colors.$szarszy)

	&__red
		color: colors.$crimson

	&--hidden
		display: none

	&::before
		position: absolute
		content: ""
		display: block
		top: -9px
		right: 12px
		@include mixins.square(15px)
		transform: rotate(-45deg)
		background: colors.$szary
		border-top: functions.generateBorder(1, colors.$szarszy)
		border-right: functions.generateBorder(1, colors.$szarszy)
	// overflow-y: auto

	&__list
		padding: 0
		margin: 0
		max-height: 300px
		overflow-y: auto

	&__element
		display: flex
		padding: 10px
		column-gap: 5px
		border-bottom: functions.generateBorder(1, colors.$szarszy)

		&:last-child
			border: none 
	
	&__image
		@include mixins.square(100px)
		box-sizing: border-box
		object-fit: cover
		border-radius: 5px

	&__link
		overflow-wrap: anywhere
		@include components.link

	&__text
		display: flex
		flex-direction: column
		justify-content: space-between
		column-gap: 5px

		&-top
			justify-content: space-between
			display: flex

	&__star
		border: none
		background: transparent

.hamburger
	z-index: 2
	display: flex
	cursor: pointer
	@include mixins.square(40px)
	box-sizing: content-box
	justify-content: space-around
	flex-direction: column

	&__cheese, &__meat, &__bun
		pointer-events: none
		height: 5px
		width: 40px
		background: colors.$czarny
		transition: transform 0.3s ease-in-out

	&--clicked .hamburger__cheese
		transform: translateY(260%) rotate(45deg)

	&--clicked .hamburger__meat
		transform: rotate(-45deg)

	&--clicked .hamburger__bun
		transform: translateX(51px)

@media (max-width: 1050px)
	.navbar

		&__inner-container
			background: colors.$bialy
			display: flex
			width: 100%
			justify-content: space-between
			z-index: 2
			position: relative

		&__expander, &__link
			border-bottom: functions.generateBorder(1, colors.$szarszy) 
			box-sizing: border-box
			height: 50px

		&__element
			width: 100%
			box-sizing: border-box
			min-height: 50px

		&__sub-list
			border: none
			background: colors.$szary

		&__list
			transform: translateY(-500px)
			transition: transform 0.4s ease-in-out
			width: 100%
			height: auto
			flex-direction: column
			top: 50px
			background: colors.$bialy
			position: absolute

			&--show
				transform: translateY(0)

		&__right-side
			margin-right: 10px
			display: flex
			align-items: center
			height: 100%
			column-gap: 20px

		&--full
			display: none

		&--mobile
			display: flex

</style>
