<script context="module">
	export const load = async ({ session, fetch }) => {
		if (!session?.ID) return { redirect: '/ensaluti', status: 303 };
		const res = await fetch(`redakti.json`);
		const data = await res.json();
		return data.isAdmin
			? {
					props: data
			  }
			: {
					redirect: '/firmaoj/' + data.id,
					status: 303
			  };
	};
</script>

<script>
	import { variables } from '$lib/variables';
	import { goto, beforeNavigate } from '$app/navigation';
	import { error, feedback } from '$lib/stores';
	import { session } from '$app/stores';
	import { getDate, extractErrors, deleteData, getData, postData, putData } from '$lib/utils';
	import countries from '../../../../../countries';
	import Editor from '$lib/Editor.svelte';
	import * as yup from 'yup';
	import { klona } from 'klona/json';
	import { deepEqual } from 'fast-equals';
	import categories from '../../../../../categories';
	import Spinner from '$lib/Spinner.svelte';
	import Select from 'svelte-select';
	import Error from '$lib/Error.svelte';
	import Popup from '$lib/Popup.svelte';

	export let administrators, original, id, isOwner;

	let numberID = +id;

	let toEdit = klona(original);
	let newImg;
	let searchQuery = '';
	let sending = false;

	const schema = yup.object({
		logo: yup.string().trim().required(),
		industry: yup
			.string()
			.trim()
			.oneOf(categories, 'Bonvolu elekti branĉon, al kiu apartenas la firmao.')
			.max(100, 'Branĉo ne povas esti pli longa ol 100 signoj.'),
		name: yup
			.string()
			.trim()
			.required('Bonvolu entajpi nomon de la firmao.')
			.max(100, 'Nomo ne povas esti pli longa ol 100 signoj.'),
		description: yup
			.string()
			.trim()
			.required('Bonvolu entajpi priskribon de la firmao.')
			.max(8192, 'La priskribo ne povas esti pli longa ol 8192 signoj.'),
		country: yup
			.mixed()
			.oneOf(countries, 'Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao.')
			.required('Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao.'),
		address: yup
			.string()
			.trim()
			.required(
				'Bonvolu entajpi adreson de sidejo de la firmao (numero de la konstruaĵo, strato, urbo, poŝtkodo).'
			)
			.max(120, 'Adreso ne povas esti pli longa ol 120 signoj.'),
		phone: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.matches(
				/^\+(?:[0-9] ?){6,14}[0-9]$/,
				'La numero ne validas. Memoru pri telefona landokodo, por klareco vi povas dividi la numeron per spacetoj.'
			)
			.nullable(),
		email: yup
			.string()
			.trim()
			.email('La retpoŝtadreso ne validas.')
			.required('Bonvolu entajpi retpoŝtadreson, kiun uzu laborprenantoj por kontakti la firmaon.')
			.max(320, 'La retpoŝtadreso ne povas esti pli longa ol 320 signoj.'),
		website: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		li: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.matches(
				/^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/,
				'Ligilo navigu al retejo ĉe linkedin.com.'
			)
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable()
	});
	let errors = {};

	const checkForm = () => {
		errors = {};
		schema
			.validate(toEdit, { abortEarly: false })
			.then(sendChanges)
			.catch((err) => (errors = extractErrors(err)));
	};

	let searchedAdministrators = [];
	let currentPage = 1;
	let pagesNumber = 1;
	const companyIndex = $session.companies.findIndex((company) => company.ID === numberID);

	const updateLocalCompany = () => {
		Object.assign($session.companies[companyIndex], toEdit);
		goToProfile();
	};

	const sendChanges = (values) => {
		sending = true;
		const data = new FormData();
		data.append('json', JSON.stringify(values));
		if (newImg) {
			data.append('logo', newImg);
			values.logo = logoSrc;
		}
		putData(variables.base + `/api/companies/${id}`, data, true)
			.then((res) => {
				sending = false;
				feedback.change(res);
				updateLocalCompany(res);
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	const showImage = (changeEvent) => {
		const element = changeEvent.target;
		if (element.files) {
			const file = element.files[0];
			if (file.type.startsWith('image/')) {
				URL.revokeObjectURL(logoSrc);
				newImg = file;
			} else {
				error.change({
					content: 'Nur bildoj kaj GIF-movbildoj alŝuteblas.'
				});
			}
		}
	};

	const removeAdministrator = (userID, userIndex) => {
		deleteData(variables.base + `/api/companies/${id}/administrator/${userID}`, true)
			.then((res) => {
				searched = false;
				feedback.change(res);
				administrators.splice(userIndex, 1);
				administrators = administrators;
			})
			.catch(error.change);
	};

	const addAdministrator = (userID, userIndex) => {
		postData(variables.base + `/api/companies/${id}/administrator/${userID}`, {}, true)
			.then((res) => {
				searched = false;
				feedback.change(res);
				const user = searchedAdministrators[userIndex];
				const newProfile = {
					ID: userID,
					profile: {
						created_at: user.created_at,
						user_name: user.user_name,
						avatar: user.avatar
					}
				};
				searchedAdministrators.splice(userIndex, 1);
				searchedAdministrators = searchedAdministrators;
				administrators = [newProfile, ...administrators];
			})
			.catch(error.change);
	};

	let newOwner = {};

	let showPopup = false;
	const fillNewOwner = (id, name) => {
		newOwner = { id, name };
		showPopup = true;
	};

	const clearNewOwner = () => {
		showPopup = false;
		newOwner = {};
	};

	const changeOwner = () => {
		showPopup = false;
		putData(variables.base + `/api/companies/${id}/owner/${newOwner.id}`, {}, true)
			.then((res) => {
				feedback.change(res);
				isOwner = false;
				$session.companies[companyIndex].owner = newOwner.id;
			})
			.catch(error.change);
	};

	let loadingAdmins = false;
	let searched = false;

	const searchAdministrator = (more) => {
		searched = true;
		loadingAdmins = true;
		if (more) {
			currentPage++;
		} else {
			pagesNumber = 1;
			currentPage = 1;
			searchedAdministrators = [];
		}
		getData(variables.base + '/api/profiles?p=' + currentPage + '&na=' + id + '&q=' + searchQuery)
			.then((res) => {
				loadingAdmins = false;
				const { profiles, pages } = res;
				pagesNumber = pages;
				searchedAdministrators = searchedAdministrators.concat(profiles);
			})
			.catch((err) => {
				loadingAdmins = false;
				error.change(err);
			});
	};

	const goToProfile = () => {
		changed = false;
		goto(`/firmaoj/${id}`);
	};

	beforeNavigate(({ cancel }) => {
		//when there is an error, a dialog window shows up
		if (changed) {
			if (
				!confirm(
					'Ŝajnas, ke vi ne konservis la ŝanĝojn. Se vi forlasos la retpaĝon antaŭ konservado, ĉiuj ŝanĝoj nuliĝos. Ĉu vi certe volas forlasi?'
				)
			) {
				cancel();
			} else {
				changed = false;
			}
		}
	});

	$: logoSrc = newImg ? URL.createObjectURL(newImg) : toEdit?.logo;
	$: changed = !deepEqual(toEdit, original) || newImg;
</script>

<svelte:head>
	<title>Redakti firmaon | Laborperejo</title>
	<meta name="robots" content="noindex,nofollow" />
	<meta name="description" content="Paĝo por redakti firmaon ĉe laborperejo." />
</svelte:head>
<Popup show={showPopup}>
	<h1 class="popup__title popup__title--red">Averto!</h1>
	<p class="popup__text">
		Ĉu vi certe volas eksiĝi posedanto kaj posedantigi {newOwner.name}? Vi perdos eblon forigi la
		firmaon kaj regi la administrantaron.
	</p>
	<div class="popup__buttons">
		<button
			on:click={changeOwner}
			class="popup__button popup__button--round popup__button--blue"
			type="button">Jes</button
		>
		<button
			on:click={clearNewOwner}
			class="popup__button popup__button--round popup__button--blue"
			type="button">Ne</button
		>
	</div>
</Popup>

<div class="company__container">
	<form class="company" on:submit|preventDefault={checkForm}>
		<div class="company__left">
			<div class="company__left-top">
				<div class="company__image-container">
					<input
						class="company__input company__input--invisible"
						type="file"
						id="logo"
						name="logo"
						on:change={showImage}
						accept="image/png, image/jpeg, image/gif"
					/>
					<label for="logo" class="company__image-label"
						><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
							/></svg
						></label
					>
					<img src={logoSrc} alt={'Emblemo de ' + toEdit.name} class="company__image" />
				</div>
				<div class="company__left-top-text">
					<div>
						<span class="company__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path d="M10 10.111V1l11 6v14H3V7z" /></svg
							>
							<input
								class="company__input"
								type="text"
								bind:value={toEdit.name}
								placeholder="Nomo"
								autocomplete="organization"
							/>
						</span>
						<Error value={errors.name} />
					</div>
					<div>
						<span class="company__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
								/></svg
							>
							<div class="select-container company__select-container">
								<Select
									items={countries}
									value={toEdit.country}
									on:select={(e) => (toEdit.country = e.detail.value)}
									on:clear={(e) => (toEdit.country = undefined)}
									placeholder="Elekti landon"
									noOptionsMessage="Mankas opcioj"
								/>
							</div>
						</span>
						<Error value={errors.country} />
					</div>
					<div>
						<span class="company__left-element"
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
								/></svg
							>
							<input
								class="company__input"
								type="text"
								bind:value={toEdit.address}
								placeholder="Adreso"
								autocomplete="street-address"
							/>
						</span>
						<Error value={errors.address} />
					</div>
				</div>
			</div>
			<div class="company__left-bottom">
				<Editor bind:value={toEdit.description} />
				<Error value={errors.description} />
			</div>
		</div>
		<div class="company__right">
			<div>
				<div class="company__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
						/></svg
					>
					<div class="select-container company__select-container">
						<Select
							items={categories}
							value={toEdit.industry}
							on:select={(e) => (toEdit.industry = e.detail.value)}
							on:clear={(e) => (toEdit.industry = undefined)}
							placeholder="Elekti branĉon"
							noOptionsMessage="Mankas opcioj"
						/>
					</div>
				</div>
				<Error value={errors.industry} />
			</div>
			<div>
				<div class="company__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
						/></svg
					>
					<input
						class="company__input"
						type="email"
						bind:value={toEdit.email}
						placeholder="Rekruta retpoŝtadreso"
						autocomplete="email"
					/>
				</div>
				<Error value={errors.email} />
			</div>
			<div>
				<div class="company__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.296 11.422 11.422 0 0 0 4.583 1.364 1 1 0 0 1 .921.997v4.462a1 1 0 0 1-.898.995c-.53.055-1.064.082-1.602.082C9.94 21 3 14.06 3 5.5c0-.538.027-1.072.082-1.602A1 1 0 0 1 4.077 3h4.462a1 1 0 0 1 .997.921A11.422 11.422 0 0 0 10.9 8.504a1 1 0 0 1-.296 1.294l-1.238.884zm-2.522-.657l1.9-1.357A13.41 13.41 0 0 1 7.647 5H5.01c-.006.166-.009.333-.009.5C5 12.956 11.044 19 18.5 19c.167 0 .334-.003.5-.01v-2.637a13.41 13.41 0 0 1-3.668-1.097l-1.357 1.9a12.442 12.442 0 0 1-1.588-.75l-.058-.033a12.556 12.556 0 0 1-4.702-4.702l-.033-.058a12.442 12.442 0 0 1-.75-1.588z"
						/></svg
					>
					<input
						class="company__input"
						type="tel"
						bind:value={toEdit.phone}
						placeholder="+48 123 456 789"
						autocomplete="tel"
					/>
				</div>
				<Error value={errors.phone} />
			</div>
			<div>
				<div class="company__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 0 1-1.548-1.549 1.548 1.548 0 1 1 1.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z"
						/></svg
					>
					<input
						class="company__input"
						type="url"
						bind:value={toEdit.li}
						placeholder="https://www.linkedin.com"
					/>
				</div>
				<Error value={errors.li} />
			</div>
			<div>
				<div class="company__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"
						/></svg
					>
					<input
						class="company__input"
						type="url"
						bind:value={toEdit.website}
						placeholder="https://www.via-pagxaro.com"
						autocomplete="url"
					/>
				</div>
				<Error value={errors.website} />
			</div>
			<button
				on:click={goToProfile}
				disabled={!changed}
				class="company__button company__button--red company__button--round"
				type="button">Nuligi la ŝanĝojn</button
			>
			<button
				type="submit"
				disabled={!changed || sending}
				class="company__button company__button--green company__button--round"
				>Akcepti ŝanĝojn</button
			>
		</div>
	</form>
</div>
{#if isOwner}
	<hr />
	<div class="admin-panel">
		<h2 class="admin-panel__title">Administrantoj</h2>
		<div class="admin-list">
			{#if administrators.length > 0}
				{#each administrators as admin, i}
					<div class="admin">
						<img
							src={admin.profile.avatar}
							alt={'Profilbildo de ' + admin.profile.user_name}
							class="admin__avatar"
						/>
						<a href={'/uzantoj/' + admin.ID} target="_blank" class="admin__title">
							{admin.profile.user_name}</a
						>
						<div class="admin__date">
							Kreita {getDate(admin.profile.created_at)}
						</div>
						<button
							class="admin__button admin__button--blue admin__button--round"
							on:click={() => fillNewOwner(admin.ID, admin.profile.user_name)}
						>
							Posedantigi
						</button>
						<button
							on:click={() => removeAdministrator(admin.ID, i)}
							class="admin__button admin__button--red admin__button--round">Forigi</button
						>
					</div>
				{/each}
			{:else}
				Ne estas aliaj administrantoj de ĉi tiu firmao.
			{/if}
		</div>
		<h2 class="admin-panel__title">Serĉi administrantojn</h2>
		<form on:submit|preventDefault={() => searchAdministrator(false)} class="admin-panel__form">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Nomo de uzanto, fragmento de priskribo"
				class="admin-panel__input"
			/>
			<button
				type="submit"
				class="admin-panel__button admin-panel__button--round admin-panel__button--blue"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
					><path fill="none" d="M0 0h24v24H0z" /><path
						d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"
					/></svg
				>Serĉi</button
			>
		</form>
		<div class="admin-list">
			{#if searchedAdministrators.length > 0}
				{#each searchedAdministrators as administrator, i}
					<div class="admin">
						<img
							src={administrator.avatar}
							alt={'Profilbildo de ' + administrator.user_name}
							class="admin__avatar"
						/>
						<a href={'/uzantoj/' + administrator.user_ID} target="_blank" class="admin__title">
							{administrator.user_name}</a
						>
						<div class="admin__date">
							Kreita {getDate(administrator.created_at)}
						</div>
						<button
							on:click={() => addAdministrator(administrator.user_ID, i)}
							class="admin__button admin__button--green admin__button--round">Aldoni</button
						>
					</div>
				{/each}
				{#if currentPage < pagesNumber && !loadingAdmins}
					<button class="admin-panel__load-more" on:click={() => searchAdministrator(true)}
						><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
							/></svg
						></button
					>{/if}
			{:else if searched && !loadingAdmins}
				Ni nenion trovis, pardonon!
			{/if}
			{#if loadingAdmins}
				<div class="spinner__container">
					<Spinner />
				</div>{/if}
		</div>
	</div>
{/if}

<style lang="sass">
@use '../../../styles/components' 
@use '../../../styles/abstracts/colors' 
@use '../../../styles/abstracts/typography' 
@use '../../../styles/abstracts/mixins' 
@use '../../../styles/abstracts/functions' 

.company
	@include components.profile

	&__left-element, &__right-element
		font-size: typography.$normal

	&__select-container, &__input
		max-width: 250px

	&__input--invisible
		display: none

	&__image-label
		@include mixins.center(false, false)
		cursor: pointer
		bottom: 0
		left: 0
		width: 100%
		height: 30px
		background: colors.$czarny
		opacity: 0.9
		color: colors.$bialy
		position: absolute
		transition: color 0.3s

		&:hover
			color: colors.$niebieski-link
	
	&__button
		@include components.button

hr
	width: 949px

.admin
	display: flex
	flex-direction: column
	gap: 5px
	overflow-wrap: anywhere
	font-family: typography.$open-sans
	padding: 10px
	border-radius: 10px
	background: colors.$bialy
	width: 220px
	margin-bottom: auto
	border: generateBorder(1, colors.$szarszy)

	&__button
		width: 100%
		@include components.button

	&-list
		font-family: typography.$open-sans
		max-width: 100%
		overflow: auto
		box-sizing: border-box
		margin: 0
		display: flex
		column-gap: 10px
		height: max-content

	&__avatar
		@include mixins.circlePhoto(220px)

	&__title
		font-size: typography.$middle

	&-panel
		width: 949px
		margin: auto
		padding: 0 0 10px 0

		&__load-more
			padding: 10px
			cursor: pointer
			color: colors.$bialy
			@include mixins.square(50px)
			background: colors.$niebieski-link
			align-self: center
			border-radius: 50%
			border: none
			@include mixins.center(false, false)

		&__button
			width: 300px
			@include components.button

		&__title
			margin: 0
			padding: 10px 0 10px 0
			font-size: typography.$large
			font-family: typography.$raleway

		&__form
			width: 100%
			box-sizing: border-box
			column-gap: 30px
			display: flex
			background: colors.$bialy
			border-radius: 10px
			padding: 10px
			border: functions.generateBorder(1, colors.$szarszy)
			align-items: center
			margin: 0 0 10px 0

@media (max-width: 1000px)
	hr
		width: min(642px, calc(100% - 40px))

	.company
		display: grid
		grid-template-columns: minmax(100%, 642px)
		margin: 0 20px
		row-gap: 20px

		&__select-container, &__input
			max-width: none

	.admin-panel
		width: min(642px, 100%)

@media (max-width: 700px)
	.company

		&__name
			text-align: center

		&__left-top
			grid-template-columns: auto

			&-text
				margin: 0
			
	.logo
		text-align: center

		&__container
			text-align: center

	.admin-panel
		box-sizing: border-box
		margin: 0
		padding: 0 20px
		width: 100%

	.admin-panel__form
		flex-direction: column
		row-gap: 10px

		input, button
			width: 100%
			max-width: 100%

	.button__container
		width: 100%

</style>
