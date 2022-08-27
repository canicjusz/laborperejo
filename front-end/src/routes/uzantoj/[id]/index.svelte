<script>
	import PdfViewer from '$lib/PDFViewer.svelte';

	export let user;

	let name = user.name;
</script>

<svelte:head>
	<title>{name} | Laborperejo</title>
	<meta name="description" content="Profilo de {name} ĉe laborperejo." />
</svelte:head>

<div class="profile__container">
	<div class="profile">
		<div class="profile__left">
			<div class="profile__left-top">
				<div class="profile__image-container">
					<img src={user.profile.avatar} alt={'Profilbildo de ' + name} class="profile__image" />
				</div>
				<div class="profile__left-top-text">
					<span class="profile__title">
						<span class="offer__title-text">{user.name}</span>
					</span>
					<span class="profile__left-element"
						><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
							/></svg
						>
						{user.profile.place}, {user.profile.country}</span
					>
					{#if user.profile.my}
						<a href={`/uzantoj/${user.ID}/redakti`} class="profile__left-element"
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0L24 0 24 24 0 24z" /><path
									d="M20 2c.552 0 1 .448 1 1v3.757l-2 2V4H5v16h14v-2.758l2-2V21c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V3c0-.552.448-1 1-1h16zm1.778 6.808l1.414 1.414L15.414 18l-1.416-.002.002-1.412 7.778-7.778zM13 12v2H8v-2h5zm3-4v2H8V8h8z"
								/></svg
							>
							Redakti</a
						>
					{/if}
				</div>
			</div>
			<div class="profile__left-bottom">
				{@html user.profile.content}
				{#if user.profile.resume}
					<div class="profile__resume">
						<span class="profile__resume-text">
							Vivresumo:
							<a
								href={user.profile.resume}
								download
								class="profile__resume-download"
								title="Elŝuti la vivresumon"
								><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
									><path fill="none" d="M0 0h24v24H0z" /><path
										d="M13 12h3l-4 4-4-4h3V8h2v4zm2-8H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992z"
									/></svg
								></a
							>
						</span>
						<div class="profile__resume-file">
							<PdfViewer url={user.profile.resume} />
						</div>
					</div>
				{/if}
			</div>
		</div>
		<div class="profile__ad">
			Saluton, Jano ĉi-flanke, la kreinto de la retejo. Vivteni servilon ne estas senpage, <b
				>160€ jare</b
			>
			sufiĉus por tiu ĉi celo. Kiel lernejano al kiu ĉiam mankas mono, mi petas vin subteni la projekton
			per <a href="https://www.paypal.com/paypalme/janomichalako">Paypal</a> aŭ
			<a href="https://www.patreon.com/janomichalako">Patreon</a>. Grandan antaŭdankon al ĉiu
			donacanto!
		</div>
		<div class="profile__right">
			<div class="profile__right-element">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
					/></svg
				>
				{#if user.profile.job}
					{user.profile.searching ? 'Serĉanta laboron' : 'Laboranta'} kiel {user.profile.job}.
				{:else}
					{user.profile.searching ? 'Serĉanta' : 'Ne serĉanta'} laboron.
				{/if}
			</div>
			<div class="profile__languages">
				<span class="profile__languages-title">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z"
						/></svg
					>
					Lingvokapabloj:</span
				>
				<ul class="profile__languages-list">
					{#each user.profile.languages as language}
						<li class="profile__languages-element">
							{language.name}, {language.level}
						</li>{/each}
				</ul>
			</div>
			{#if user.profile.email}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
						/></svg
					>
					{user.profile.email}
				</div>
			{/if}
			{#if user.profile.phone}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498z"
						/></svg
					>
					{user.profile.phone}
				</div>
			{/if}
			{#if user.profile.li}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 0 1-1.548-1.549 1.548 1.548 0 1 1 1.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z"
						/></svg
					>
					<a href={user.profile.li} target="_blank">LinkedIne</a>
				</div>
			{/if}
			{#if user.profile.fb}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
						/></svg
					>
					<a href={user.profile.fb} target="_blank">Fejsbuke</a>
				</div>
			{/if}
			{#if user.profile.vk}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						><path
							class="st0"
							d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z"
						/></svg
					>
					<a href={user.profile.vk} target="_blank">Vkontakte</a>
				</div>
			{/if}
			{#if user.profile.mv}
				<div class="profile__right-element">
					<i class="mv-icon" />
					<a href={user.profile.mv} target="_blank">Miavive</a>
				</div>
			{/if}
			{#if user.profile.website}
				<div class="profile__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"
						/></svg
					>
					<a href={user.profile.website} target="_blank">{user.profile.website}</a>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="sass">
@use '../../../styles/abstracts/colors'
@use '../../../styles/abstracts/typography'
@use '../../../styles/components' 
@use '../../../styles/abstracts/functions'

.spinner__container
	text-align: center
	padding-top: 20px

.profile
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

	&__resume

		&-text
			margin: 10px 0
			display: flex
			align-items: center
			gap: 10px
			font-family: typography.$open-sans
		
		&-download
			height: 24px
			cursor: pointer
			transition: color 0.3s
			color: colors.$niebieski-link

			&:hover
				color: colors.$navy

	&__languages

		&-title
			display: flex
			column-gap: 10px
			align-items: center

		&-list
			margin: 0
</style>
