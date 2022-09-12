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
	import { variables } from '$lib/variables';
	import { extractErrors, postData, convertDate } from '$lib/utils';
	import { session } from '$app/stores';
	import countries from '../../../countries';
	import categories from '../../../categories';
	import Editor from '$lib/Editor.svelte';
	import * as yup from 'yup';
	import Select from 'svelte-select';
	import { error } from '$lib/stores';
	import { goto } from '$app/navigation';
	import Error from '$lib/Error.svelte';
	import { onMount } from 'svelte';

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowFormated = convertDate(tomorrow);

	const workArrangements = ['hejme', 'laboreje', 'hibride'];
	const employmentTypes = ['plentempa', 'parttempa', 'aldona'];

	const schema = yup.object({
		title: yup
			.string()
			.trim()
			.required('Bonvolu entajpi titolon de la oferto.')
			.max(50, 'Titolo ne povas esti pli longa ol 50 signoj.'),
		description: yup
			.string()
			.trim()
			.required('Bonvolu entajpi priskribon de la oferto.')
			.max(8192, 'Priskribo ne povas esti pli longa ol 8192 signoj.'),
		salary: yup.boolean().required(),
		reward: yup
			.string()
			.trim()
			.required('Bonvolu entajpi rekompencon/salajron.')
			.max(70, 'Rekompenco ne povas esti pli longa ol 70 signoj.'),
		arrangement: yup
			.mixed()
			.oneOf(workArrangements, 'Bonvolu elekti manieron de laborado.')
			.required('Bonvolu elekti manieron de laborado.'),
		employment: yup
			.mixed()
			.oneOf(employmentTypes, 'Bonvolu elekti tipon de dungeco.')
			.required('Bonvolu elekti tipon de dungeco.'),
		country: yup
			.mixed()
			.oneOf(countries, 'Bonvolu elekti landon de la firmao aŭ de sekcio de la firmao.')
			.required('Bonvolu elekti landon de la firmao aŭ de sekcio de la firmao.'),
		place: yup
			.string()
			.trim()
			.required('Bonvolu entajpi adreson de la firmao aŭ de sekcio de la firmao.')
			.max(100, 'Adreso ne povas esti pli longa ol 100 singojn.'),
		categories: yup
			.array()
			.of(
				yup.mixed().oneOf(categories),
				'Bonvolu elekti kategoriojn laŭ kiuj oni povos trovi la oferton.'
			)
			.min(1, 'Oferto devas havi almenaŭ unu kategorion.')
			.max(3, 'Oferto povas havi maksimume tri kategoriojn.')
			.required('Bonvolu elekti kategoriojn laŭ kiuj oni povos trovi la oferton.'),
		closed: yup.boolean().required(),
		close_at: yup
			.date('Malfermitaj ofertoj devas havi specifitan fermiĝdaton.')
			.min(tomorrow, 'Oferto estu malfermita almenaŭ unu tagon.')
			.when('closed', {
				is: false,
				then: (schema) => schema.required('Malfermitaj ofertoj devas havi specifitan fermiĝdaton.')
			})
	});
	let errors = {};
	let sending = false;

	const checkForm = () => {
		errors = {};
		schema
			.validate(newOfferValues, { abortEarly: false })
			.then(createNewOffer)
			.catch((err) => (errors = extractErrors(err)));
	};

	let companyID = $session.companies[0].ID;
	onMount(() => {
		const stateCompany = history?.state?.company;
		if (stateCompany) {
			companyID = stateCompany;
		}
	});

	const newOfferValues = {
		companyID,
		title: '',
		description: '',
		salary: false,
		reward: '',
		arrangement: '',
		employment: '',
		country: '',
		place: '',
		categories: [],
		closed: false,
		close_at: undefined
	};

	//todo: salary jest stringiem a to bool

	const createNewOffer = () => {
		sending = true;
		newOfferValues.companyID = companyID;
		newOfferValues.close_at = !newOfferValues.closed ? new Date(newOfferValues.close_at) : null;
		postData(variables.base + '/api/offers', JSON.stringify(newOfferValues), true, {
			'Content-type': 'application/json'
		})
			.then((res) => goto(`/ofertoj/${res.ID}`))
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	$: companyIndex = $session.companies.findIndex((company) => company.ID === companyID);

	let visibleCategories = undefined;
</script>

<svelte:head>
	<title>Krei oferton | Laborperejo</title>
	<meta name="description" content="Paĝo por krei oferton ĉe laborperejo." />
</svelte:head>
<div class="offer__container">
	<form class="offer" on:submit|preventDefault={checkForm}>
		<div class="company-picker">
			<label for="company-selector" class="company-picker__label">Firmao:</label>
			<div class="select-container company-picker__select-container">
				<Select
					id="company-selector"
					items={$session.companies}
					value={$session.companies[companyIndex]}
					on:select={(e) => (companyID = e.detail.ID)}
					optionIdentifier="ID"
					labelIdentifier="name"
					placeholder="Elekti landon"
					noOptionsMessage="Mankas opcioj"
					isClearable={false}
				/>
			</div>
		</div>
		<div class="offer__left">
			<div class="offer__left-top">
				<div class="offer__image-container">
					<img
						src={$session.companies[companyIndex].logo}
						alt={'Emblemo de ' + $session.companies[companyIndex].name}
						class="offer__image"
					/>
				</div>
				<div class="offer__left-top-text">
					<div>
						<div class="offer__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
								/></svg
							>
							<input
								class="offer__input"
								id="title"
								type="text"
								bind:value={newOfferValues.title}
								placeholder="Titolo"
							/>
						</div>
						<Error value={errors.title} />
					</div>
					<div class="offer__left-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path d="M10 10.111V1l11 6v14H3V7z" /></svg
						>
						{$session.companies[companyIndex].name}
					</div>
					<div>
						<span class="offer__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M5 16v6H3V3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5zM5 5v9h8.236l1 2H19V7h-6.236l-1-2H5z"
								/></svg
							>
							<div class="select-container offer__select-container">
								<Select
									items={countries}
									on:select={(e) => (newOfferValues.country = e.detail.value)}
									on:clear={(e) => (newOfferValues.country = undefined)}
									placeholder="Elekti landon"
									noOptionsMessage="Mankas opcioj"
								/>
							</div>
						</span>
						<Error value={errors.country} />
					</div>
					<div>
						<span class="offer__left-element"
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
								/></svg
							>
							<input
								class="offer__input"
								type="text"
								bind:value={newOfferValues.place}
								autocomplete="street-address"
								placeholder="Adreso"
							/>
						</span>
						<Error value={errors.place} />
					</div>
				</div>
			</div>
			<div class="offer__left-bottom">
				<Editor bind:value={newOfferValues.description} placeholder="Priskribo de la oferto" />
				<Error value={errors.description} />
			</div>
		</div>
		<div class="offer__right">
			<div>
				<div class="offer__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M12 15.968l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275v10.693zm0 2.292l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26z"
						/></svg
					>
					<div class="select-container offer__select-container">
						<Select
							items={employmentTypes}
							on:select={(e) => (newOfferValues.employment = e.detail.value)}
							on:clear={(e) => (newOfferValues.employment = undefined)}
							placeholder="Tipo de dungeco"
							noOptionsMessage="Mankas opcioj"
						/>
					</div>
				</div>
				<Error value={errors.employment} />
			</div>
			<div>
				<div class="offer__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M21 21H3a1 1 0 0 1-1-1v-7.513a1 1 0 0 1 .343-.754L6 8.544V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1zM9 19h3v-6.058L8 9.454l-4 3.488V19h3v-4h2v4zm5 0h6V5H8v2.127c.234 0 .469.082.657.247l5 4.359a1 1 0 0 1 .343.754V19zm2-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V7zm-4 0h2v2h-2V7z"
						/></svg
					>
					<div class="select-container offer__select-container">
						<Select
							items={workArrangements}
							on:select={(e) => (newOfferValues.arrangement = e.detail.value)}
							on:clear={(e) => (newOfferValues.arrangement = undefined)}
							placeholder="Maniero de laborado"
							noOptionsMessage="Mankas opcioj"
						/>
					</div>
				</div>
				<Error value={errors.arrangement} />
			</div>
			<div>
				<div class="offer__right-element">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
						><path fill="none" d="M0 0h24v24H0z" /><path
							d="M7.784 14l.42-4H4V8h4.415l.525-5h2.011l-.525 5h3.989l.525-5h2.011l-.525 5H20v2h-3.784l-.42 4H20v2h-4.415l-.525 5h-2.011l.525-5H9.585l-.525 5H7.049l.525-5H4v-2h3.784zm2.011 0h3.99l.42-4h-3.99l-.42 4z"
						/></svg
					>
					<div class="select-container offer__select-container">
						<Select
							items={categories}
							bind:value={visibleCategories}
							on:select={(e) => {
								errors.categories = null;
								if (e.detail == undefined || e.detail.length < 4) {
									newOfferValues.categories = e.detail?.map(({ value }) => value);
								} else {
									errors.categories = 'Oni povas elekti nur 3 kategoriojn';
									visibleCategories.pop();
								}
							}}
							placeholder="Kategorioj"
							noOptionsMessage="Mankas opcioj"
							isMulti={true}
						/>
					</div>
				</div>
				<Error value={errors.categories} />
			</div>
			<div>
				<div class="offer__right-element offer__right-element--reverse">
					<label for="is-salary">Ĉu oni ricevos salajron?</label>
					<input
						class="offer__input"
						id="is-salary"
						type="checkbox"
						bind:checked={newOfferValues.salary}
					/>
				</div>
				<div>
					<div class="offer__right-element">
						{#if newOfferValues.salary}<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="24"
								height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M23 12v2c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-2c0 3.314 4.925 6 11 6s11-2.686 11-6zM12 4c6.075 0 11 2.686 11 6s-4.925 6-11 6-11-2.686-11-6 4.925-6 11-6z"
								/></svg
							>{:else}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 9h2v4h2V9h2l-3-3.5L7 9zm10 6h-2v-4h-2v4h-2l3 3.5 3-3.5z"
								/></svg
							>
						{/if}
						<input
							class="offer__input"
							type="text"
							placeholder={newOfferValues.salary ? 'Salajro' : 'Rekompenco'}
							bind:value={newOfferValues.reward}
						/>
					</div>
				</div>
				<Error value={errors.reward} />
			</div>
			<div>
				<div class="offer__right-element offer__right-element--reverse">
					<label for="is-closed">Ĉu la oferto estu fermita?</label>
					<input
						class="offer__input"
						type="checkbox"
						id="is-closed"
						bind:checked={newOfferValues.closed}
					/>
				</div>
			</div>
			<div>
				{#if !newOfferValues.closed}
					<!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M22 14h-2V7.238l-7.928 7.1L4 7.216V19h11v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10zM4.511 5l7.55 6.662L19.502 5H4.511zm16.903 14l2.122 2.121-1.415 1.415L20 20.414l-2.121 2.122-1.415-1.415L18.586 19l-2.122-2.121 1.415-1.415L20 17.586l2.121-2.122 1.415 1.415L21.414 19z"
							/></svg
						> -->
					<input
						class="offer__input"
						type="datetime-local"
						name=""
						id=""
						placeholder="Fermiĝdato"
						on:change={(e) => (newOfferValues.close_at = new Date(e.target.value))}
						min={tomorrowFormated}
					/>
				{/if}
				<Error value={errors.close_at} />
			</div>
			<button
				type="submit"
				disabled={sending}
				class="offer__button offer__button--green offer__button--round">Krei</button
			>
		</div>
	</form>
</div>

<style lang="sass">
// @use '../styles/abstracts/colors'
@use '../styles/abstracts/typography' 
// @use '../styles/abstracts/functions'
@use '../styles/components'

.company-picker
	grid-column: 1 / 3
	@include components.company-picker

.offer
	row-gap: 10px
	@include components.profile

	&__left-element, &__right-element
		font-size: typography.$normal

	&__select-container, &__input
		max-width: 250px

	&__button
		@include components.button

@media (max-width: 1000px)
	.company-picker
		grid-column: 1

	.offer
		grid-template-columns: minmax(100%, 642px)
		margin: 0 20px
		row-gap: 20px

		&__input, &__select-container
			max-width: none

		&__input
			min-width: 100%
			width: 0

@media (max-width: 700px)
	.offer

		&__left-top
			grid-template-columns: auto
			
		&__image
			text-align: center

			&-container
				text-align: center
</style>
