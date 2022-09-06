<script context="module">
	export const load = async ({ session, params, fetch }) => {
		if (!session?.ID) return { redirect: '/ensaluti', status: 303 };
		const res = await fetch(`redakti.json`);
		const data = await res.json();
		return data.isOwner
			? {
					props: data
			  }
			: {
					redirect: '/ofertoj/' + data.id,
					status: 303
			  };
	};
</script>

<script>
	import { variables } from '$lib/variables';
	import { goto, beforeNavigate } from '$app/navigation';
	import countries from '../../../../../countries';
	import categories from '../../../../../categories';
	import { error, feedback } from '$lib/stores';
	import Select from 'svelte-select';
	import Editor from '$lib/Editor.svelte';
	const workArrangements = ['hejme', 'laboreje', 'hibride'];
	const employmentTypes = ['plentempa', 'parttempa', 'aldona'];
	import { extractErrors, putData } from '$lib/utils';
	import * as yup from 'yup';
	import { deepEqual } from 'fast-equals';
	import { klona } from 'klona/lite';
	import Error from '$lib/Error.svelte';

	export let id, company, editable, tomorrowFormated;

	let toEdit = klona(editable);
	let original = editable;
	let visibleCategories = [...editable.categories];
	let sending = false;

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
			.max(8192, 'La priskribo ne povas esti pli longa ol 8192 signoj.'),
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
			// .min(tomorrow, 'Oferto estu malfermita almenaŭ unu tagon')
			.when('closed', {
				is: true,
				then: (schema) => schema.nullable(),
				otherwise: (schema) =>
					schema.required('Malfermitaj ofertoj devas havi specifitan fermiĝdaton.')
			})
	});
	let errors = {};

	const checkForm = () => {
		errors = {};
		schema
			.validate(toEdit, { abortEarly: false })
			.then(sendChanges)
			.catch((err) => (errors = extractErrors(err)));
	};

	const sendChanges = (values) => {
		sending = true;
		values.close_at = new Date(values.close_at);
		values.offerID = id;
		putData(variables.base + `/api/offers/${id}`, JSON.stringify(values), true, {
			'Content-type': 'application/json'
		})
			.then((res) => {
				feedback.change(res);
				sending = false;
				goToOffer();
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	const goToOffer = () => {
		changed = false;
		goto('/ofertoj/' + id);
	};

	beforeNavigate(({ cancel }) => {
		//when there is an error, a dialog window shows up
		if (changed) {
			if (
				!confirm(
					'Ŝajnas, ke vi ne konservis ŝanĝojn. Se vi forlasos la retpaĝon antaŭ konservado, ĉiuj ŝanĝoj nuliĝos. Ĉu vi certe volas forlasi?'
				)
			) {
				cancel();
			} else {
				changed = false;
			}
		}
	});

	//reload on id change
	$: changed = !deepEqual(toEdit, original);
</script>

<svelte:head>
	<title>Redakti oferton | Laborperejo</title>
	<meta name="robots" content="noindex,nofollow" />
	<meta name="description" content="Paĝo por redakti oferton ĉe laborperejo." />
</svelte:head>

<div class="offer__container">
	<form class="offer" on:submit|preventDefault={checkForm}>
		<div class="offer__left">
			<div class="offer__left-top">
				<div class="offer__image-container">
					<img src={company.logo} alt={'Emblemo de ' + company.name} class="offer__image" />
				</div>
				<div class="offer__left-top-text">
					<div>
						<label for="title" class="offer__left-element">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
								/></svg
							>
							<input
								id="title"
								class="offer__input"
								type="text"
								bind:value={toEdit.title}
								placeholder="Titolo"
							/>
						</label>
						<Error value={errors.title} />
					</div>
					<span class="offer__left-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path d="M10 10.111V1l11 6v14H3V7z" /></svg
						>
						{company.name}
					</span>
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
						<span class="offer__left-element"
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
								/></svg
							>
							<input
								class="offer__input"
								autocomplete="street-address"
								type="text"
								bind:value={toEdit.place}
								placeholder="Adreso"
							/>
						</span>
						<Error value={errors.place} />
					</div>
				</div>
			</div>
			<div class="offer__left-bottom">
				<Editor bind:value={toEdit.description} placeholder="Priskribo de la oferto" />
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
							value={toEdit.employment}
							items={employmentTypes}
							on:select={(e) => (toEdit.employment = e.detail.value)}
							on:clear={(e) => (toEdit.employment = undefined)}
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
							value={toEdit.arrangement}
							items={workArrangements}
							on:select={(e) => (toEdit.arrangement = e.detail.value)}
							on:clear={(e) => (toEdit.arrangement = undefined)}
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
									toEdit.categories = e.detail?.map(({ value }) => value);
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
					<input class="offer__input" type="checkbox" id="is-salary" bind:checked={toEdit.salary} />
				</div>
				<div class="offer__right-element">
					{#if toEdit.salary}<svg
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
						placeholder={toEdit.salary ? 'Salajro' : 'Rekompenco'}
						bind:value={toEdit.reward}
					/>
				</div>
				<Error value={errors.reward} />
			</div>
			<div>
				<div class="offer__right-element offer__right-element--reverse">
					<label for="is-closed">Ĉu la oferto estu fermita?</label>
					<input type="checkbox" id="is-closed" bind:checked={toEdit.closed} />
				</div>
			</div>
			<div>
				{#if !toEdit.closed}
					<input
						type="datetime-local"
						class="offer__date"
						placeholder="Fermiĝdato"
						bind:value={original.close_at}
						on:change={(e) => (toEdit.close_at = new Date(e.target.value))}
						min={tomorrowFormated}
					/>
				{/if}
				<Error value={errors.close_at} />
			</div>
			<button
				on:click={goToOffer}
				disabled={!changed}
				class="offer__button offer__button--red offer__button--round"
				type="button">Nuligi ŝanĝoj</button
			>
			<button
				type="submit"
				disabled={!changed || sending}
				class="offer__button offer__button--green offer__button--round">Akcepti ŝanĝojn</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../../../styles/components' 
@use '../../../styles/abstracts/colors' 
@use '../../../styles/abstracts/typography' 

.offer
	@include components.profile

	&__left-element, &__right-element
		font-size: typography.$normal

	&__select-container, &__input
		max-width: 250px
	
	&__button
		@include components.button

	@media (max-width: 1000px)

	&__select-container, &__input
		max-width: none

@media (max-width: 1000px)
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
