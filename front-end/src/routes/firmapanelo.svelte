<script context="module">
	export const load = ({ session }) => {
		return session?.ID
			? {}
			: {
					redirect: '/ensaluti',
					status: 303
			  };
	};
</script>

<script>
	import { error, feedback } from '$lib/stores';
	import { getData, deleteData, postData } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { extractErrors, onlyOpened } from '$lib/utils';
	import countries from '../../../countries';
	import categories from '../../../categories';
	import * as yup from 'yup';
	import Select from 'svelte-select';
	import Spinner from '$lib/Spinner.svelte';
	import { session } from '$app/stores';
	import Error from '$lib/Error.svelte';
	import Popup from '$lib/Popup.svelte';
	//sprawdz access
	let companies = [];
	let currentPage = 0;

	let toRemove = {};
	let creatingMode = false;
	const schema = yup.object({
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
		country: yup
			.mixed()
			.oneOf(countries, 'Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao.')
			.required('Bonvolu elekti landon, en kiu troviĝas sidejo de la firmao.'),
		email: yup
			.string()
			.trim()
			.email('La retpoŝtadreso ne validas.')
			.required('Bonvolu entajpi retpoŝtadreson, kiun uzu laborprenantoj por kontakti la firmaon.')
			.max(320, 'Retpoŝtadreso ne povas esti pli longa ol 320 signoj.'),
		address: yup
			.string()
			.trim()
			.required(
				'Bonvolu entajpi adreson de sidejo de la firmao (numero de la konstruaĵo, strato, urbo, poŝtkodo).'
			)
			.max(120, 'Adreso ne povas esti pli longa ol 120 signoj.')
	});
	let newCompanyValues = {
		industry: '',
		name: '',
		country: '',
		email: '',
		address: ''
	};
	let pages = 1;
	let loading = false;
	let errors = {};
	let showPopup = false;

	const checkForm = () => {
		errors = {};
		schema
			.validate(newCompanyValues, { abortEarly: false })
			.then(createNewCompany)
			.catch((err) => (errors = extractErrors(err)));
	};
	//add "more" button later
	const getCompanies = async () => {
		loading = true;
		await getData('http://localhost:5000/api/companies?p=' + ++currentPage + '&a=' + $session.ID)
			.then((res) => {
				pages = res.pages;
				companies = [...companies, ...res.companies];
				loading = false;
			})
			.catch((err) => {
				loading = false;
				error.change(err);
			});
	};

	const resetNewCompanyValues = () => {
		newCompanyValues = {
			industry: undefined,
			name: undefined,
			country: undefined,
			email: undefined,
			address: undefined
		};
	};

	const createNewCompany = () => {
		creatingMode = false;
		postData('http://localhost:5000/api/companies', JSON.stringify(newCompanyValues), true, {
			'Content-type': 'application/json'
		})
			.then((res) => {
				resetNewCompanyValues();
				feedback.change({ content: 'La firmao estis kreita.' });
				companies = [...companies, res];
				$session.companies = companies;
			})
			.catch(error.change);
	};
	const clearToRemove = () => {
		toRemove = null;
		showPopup = false;
	};
	const fillToRemove = (id, index) => {
		toRemove = {
			id,
			index
		};
		showPopup = true;
	};
	const removeCompany = () => {
		deleteData(`http://localhost:5000/api/companies/${toRemove.id}`, true)
			.then((res) => {
				showPopup = false;
				feedback.change(res);
				companies.splice(toRemove.index, 1);
				companies = companies;
				$session.companies = companies;
				toRemove = {};
			})
			.catch((err) => {
				showPopup = false;
				toRemove = {};
				error.change(err);
			});
	};
</script>

<svelte:head>
	<title>Firmapanelo | Laborperejo</title>
	<meta name="description" content="Panelo de oniaj firmaoj ĉe laborperejo." />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
{#await getCompanies()}
	<div class="spinner__container">
		<Spinner />
	</div>
{:then}
	<Popup show={showPopup}>
		<p class="popup__text">
			Ĉu vi certe volas forigi firmaon {companies[toRemove.index].name} kaj ĝiajn ofertojn? La operacio
			ne malfareblas!
		</p>
		<div class="popup__buttons">
			<button
				on:click={removeCompany}
				class="popup__button popup__button--round popup__button--blue"
				type="button">Jes</button
			>
			<button
				on:click={clearToRemove}
				class="popup__button popup__button--round popup__button--blue"
				type="button">Ne</button
			>
		</div>
	</Popup>
	<div class="containers-aligner">
		<div class="table__container">
			<div class="table__shape">
				<table class="table">
					<thead class="table__head">
						<tr class="table__head-row">
							<th class="table__column-title">Markemblemo</th>
							<th class="table__column-title">Nomo</th>
							<th class="table__column-title">Laborofertoj <small>(malfermitaj)</small></th>
							<th class="table__column-title">Redakti</th>
							<th class="table__column-title">Forigi</th>
						</tr>
					</thead>
					<tbody class="table__body">
						{#if companies.length > 0}
							{#each companies as company, i}
								<tr class="table__body-row">
									<td class="table__cell"
										><img
											src={company.logo}
											alt={'Emblemo de ' + company.name}
											class="table__img"
										/></td
									>
									<td class="table__cell"><a href={`/firmaoj/${company.ID}`}>{company.name}</a></td>
									<td class="table__cell">
										{onlyOpened(company.offers).length}
									</td>
									<td class="table__cell">
										<button
											on:click={() => goto(`/firmaoj/${company.ID}/redakti`)}
											class="table__button table__button--blue"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="24"
												height="24"
												><path fill="none" d="M0 0L24 0 24 24 0 24z" /><path
													d="M20 2c.552 0 1 .448 1 1v3.757l-2 2V4H5v16h14v-2.758l2-2V21c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V3c0-.552.448-1 1-1h16zm1.778 6.808l1.414 1.414L15.414 18l-1.416-.002.002-1.412 7.778-7.778zM13 12v2H8v-2h5zm3-4v2H8V8h8z"
												/></svg
											></button
										></td
									>
									<td class="table__cell">
										<button
											on:click={() => fillToRemove(company.ID, i)}
											class="table__button"
											disabled={company.owner !== $session.ID}
											><svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="24"
												height="24"
												><path fill="none" d="M0 0h24v24H0z" /><path
													d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"
												/></svg
											></button
										>
									</td>
								</tr>
							{/each}
						{:else}
							<tr class="table__body-row">
								<td colspan="5" class="table__cell-info">Ĉi tiu firmao ne havas ofertojn</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
			{#if pages > currentPage}
				<button
					type="button"
					class="button button--blue button--round"
					disabled={loading}
					on:click={getCompanies}>Montri pliajn</button
				>
			{/if}
			{#if !creatingMode}
				<button
					type="button"
					class="button button--blue button--round"
					on:click={() => (creatingMode = true)}>Firmao-kreilo</button
				>
			{/if}
			{#if loading}
				<div class="spinner__container">
					<Spinner />
				</div>
			{/if}
		</div>
		{#if creatingMode}
			<form on:submit|preventDefault={checkForm} class="form">
				<button
					on:click={() => {
						creatingMode = false;
						errors = {};
					}}
					type="button"
					class="form__close"
					><svg viewBox="-2 -2 50 50" focusable="false" aria-hidden="true" role="presentation"
						><path
							fill="currentColor"
							d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
              l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
						/></svg
					></button
				>
				<div class="form__part">
					<span class="form__label">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path d="M10 10.111V1l11 6v14H3V7z" /></svg
						>
						<input
							type="text"
							bind:value={newCompanyValues.name}
							placeholder="Nomo"
							autocomplete="organization"
						/>
					</span>
					<Error value={errors.name} />
				</div>
				<div class="form__part">
					<label class="form__label" for="industry">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
							/></svg
						>
						<div class="form__select-container select-container">
							<Select
								id="industry"
								items={categories}
								on:select={(e) => (newCompanyValues.industry = e.detail.value)}
								on:clear={(e) => (newCompanyValues.industry = undefined)}
								placeholder="Elekti branĉon"
								noOptionsMessage="Mankas opcioj"
							/>
						</div>
					</label>
					<Error value={errors.indsutry} />
				</div>
				<div class="form__part">
					<label class="form__label" for="country">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
							/></svg
						>
						<div class="form__select-container select-container">
							<Select
								id="country"
								items={countries}
								on:select={(e) => (newCompanyValues.country = e.detail.value)}
								on:clear={(e) => (newCompanyValues.country = undefined)}
								placeholder="Elekti landon"
								noOptionsMessage="Mankas opcioj"
							/>
						</div>
					</label>
					<Error value={errors.country} />
				</div>
				<div class="form__part">
					<label class="form__label">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
							/></svg
						>
						<input
							type="text"
							bind:value={newCompanyValues.address}
							placeholder="Adreso"
							autocomplete="street-address"
						/>
					</label>
					<Error value={errors.address} />
				</div>
				<div class="form__part">
					<label class="form__label">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
							/></svg
						>
						<input
							type="email"
							bind:value={newCompanyValues.email}
							placeholder="Rekruta retpoŝtadreso"
							autocomplete="email"
						/>
					</label>
					<Error value={errors.email} />
				</div>
				<div class="form__part">
					<button type="submit" class="form__button form__button--green form__button--round"
						>Krei firmaon</button
					>
				</div>
			</form>
		{/if}
	</div>
{:catch err}
	<div class="url-error">
		<span>
			<b>Eraro {err.response.status}</b>: {err.response.data.error}
		</span>
	</div>
{/await}

<!-- szarszy dac na table border -->
<style lang="sass">
@use '../styles/abstracts/colors'
@use '../styles/abstracts/typography'
@use '../styles/abstracts/mixins'
@use '../styles/abstracts/functions'
@use '../styles/components'

.table
	@include components.table

	&__container
		max-width: 100%
		padding: 20px

.form
	gap: 10px
	position: relative
	display: grid
	grid-template-columns: 1fr 1fr
	padding: 40px 10px 10px 10px
	border-radius: 10px
	border: functions.generateBorder(1, colors.$szarszy)
	background: colors.$bialy
	margin-bottom: 10px

	@media (max-width: 700px)
		grid-template-columns: 1fr

	&__close
		right: 10px
		top: 10px
		position: absolute
		background: colors.$crimson
		color: colors.$bialy
		border: none
		@include mixins.square(30px)
		@include mixins.center(false, false)

	&__label
		margin: 10px 0 0 0
		display: flex
		align-items: center
		column-gap: 10px

	&__select-container
		width: 100%

	&__button
		width: 100%
		@include components.button

	&__part
		width: 300px

.button
	margin-top: 10px
	width: 200px
	@include components.button

	@media (max-width: 1000px)
		width: 100%

.containers

	&-aligner
		padding: 0 20px
		box-sizing: border-box
		flex-direction: column
		@include mixins.center(false, false)

// @media (max-width: 600px)
// 	.form
// 		grid-template-columns: 1fr

// @media (max-width: 450px)
// 	.buttons__container
// 		flex-direction: column
// 		row-gap: 10px

// 		.button
// 			max-width: 100%

</style>
