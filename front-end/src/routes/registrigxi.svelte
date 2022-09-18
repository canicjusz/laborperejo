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
	import { variables } from '$lib/variables';
	import * as yup from 'yup';
	import Select from 'svelte-select';
	import countries from '../../../countries';
	import levels from '../../../levels';
	import { error, feedback } from '$lib/stores';
	import { extractErrors, postData } from '$lib/utils';
	import PasswordInput from '$lib/PasswordInput.svelte';
	import Error from '$lib/Error.svelte';
	import Popup from '$lib/Popup.svelte';
	const values = {
		email: '',
		password: '',
		retypedPassword: '',
		name: '',
		country: undefined,
		place: '',
		languages: [{ name: 'Esperanto', level: undefined }]
	};
	let errors = {};
	const schema = yup.object().shape({
		email: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian retpoŝtadreson.')
			.email('La retpoŝtadreso ne validas.')
			.max(320, 'La retpoŝtadreso ne povas esti pli longa ol 320 signoj.'),
		password: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian pasvorton.')
			.matches(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,512}$/,
				'La pasvorto enhavu 8-512 signojn kaj po almenaŭ unu ciferon, ĉefliteron kaj malĉefliteron. Oni povas aldone uzi jenajn specjalajn signojn: #?!@$%^&*-_'
			),
		retypedPassword: yup
			.mixed()
			.required('Bonvolu reentajpi la pasvorton.')
			.test('match', 'La pasvortoj estas malsamaj.', function () {
				return this.parent.password === this.parent.retypedPassword;
			}),
		name: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian plenan nomon')
			.max(100, 'Via nomo ne povas esti pli longa ol 100 signoj.'),
		place: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian loĝlokon (nomon de via urbo, vilaĝo, muncipo).')
			.max(100, 'Loĝloko ne povas esti pli longa ol 100 signoj.'),
		country: yup
			.mixed()
			.oneOf(countries, 'Bonvolu elekti landon.')
			.required('Bonvolu elekti landon.'),
		languages: yup
			.array()
			.of(
				yup.object().shape({
					name: yup.string().trim().required('Bonvolu aldoni nomon.'),
					level: yup
						.string()
						.trim()
						.oneOf(levels, 'Bonvolu elekti nivelon.')
						.required('Bonvolu elekti nivelon.')
				})
			)
			.min(1, 'Aldonu almenaŭ unu lingvon.')
			.max(50, 'Oni ne povas aldoni pli ol 50 lingvojn.'),
		consent: yup
			.bool()
			.required('La regularo kaj la privateca politiko estas akceptendaj.')
			.oneOf([true], 'La regularo kaj la privateca politiko estas akceptendaj.')
	});

	let sending = false;
	let showPopup = false;

	const sendForm = (data) => {
		sending = true;
		const { retypedPassword, ...valuesToSend } = data;
		postData(variables.base + '/api/profiles', JSON.stringify(valuesToSend), true, {
			'Content-type': 'application/json'
		})
			.then(() => {
				showPopup = true;
			})
			.catch((res) => {
				error.change(res);
				sending = false;
			});
	};

	const checkForm = () => {
		errors = {};
		schema
			.validate(values, { abortEarly: false })
			.then(sendForm)
			.catch((err) => {
				errors = extractErrors(err);
			});
	};

	const addLanguage = () => {
		values.languages = [...values.languages, { name: '', level: undefined }];
	};

	const removeLanguage = (i) => {
		values.languages.splice(i, 1);
		values.languages = values.languages;
	};

	const resendConfirmation = () => {
		const valuesToSend = { email: values.email };

		postData(variables.base + '/api/account/confirmation', JSON.stringify(valuesToSend), true, {
			'Content-type': 'application/json'
		})
			.then(feedback.change)
			.catch(error.change);
	};
</script>

<svelte:head>
	<title>Registriĝi | Laborperejo</title>
	<meta name="description" content="Paĝo por registriĝi ĉe laborperejo." />
</svelte:head>
<Popup show={showPopup}>
	<h1 class="popup__title popup__title--blue">Bonvenon!</h1>
	<p class="popup__text">
		Ni sendis al vi ({values.email}) registriĝ-konfirmon. Bonvolu kontroli vian retpoŝtkeston,
		atentu ke la retmesaĝo povas iri ĝis 5 minutoj.
		<br />
		Se vi ne vidas la retmesaĝon, bonvolu kontroli spamejon. Se ne venis al vi la retmesaĝo, alklaku
		la suban butonon.
	</p>
	<div class="popup__buttons">
		<button class="popup__button popup__button--blue" on:click={resendConfirmation} type="button"
			>Resendi retmesaĝon</button
		>
	</div>
</Popup>
<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Registriĝejo</h1>
		<div class="form__part">
			<label for="personal-name" class="form__label">Plena nomo</label>
			<input
				placeholder="Plena nomo"
				type="text"
				id="personal-name"
				bind:value={values.name}
				autocomplete="name"
				disabled={sending}
			/>
			<Error value={errors.name} />
		</div>
		<div class="form__part">
			<label for="country" class="form__label">Lando</label>
			<div class="select-container">
				<Select
					id="country"
					items={countries}
					value={values.country}
					on:select={(e) => (values.country = e.detail.value)}
					on:clear={(e) => (values.country = undefined)}
					placeholder="Elekti landon"
					noOptionsMessage="Mankas opcioj"
					isDisabled={sending}
				/>
			</div>
			<Error value={errors.country} />
			<Error value={errors['country.value']} />
		</div>
		<div class="form__part">
			<label for="place" class="form__label">Loĝloko</label>
			<input
				type="text"
				id="place"
				bind:value={values.place}
				autocomplete="address-level2"
				placeholder="Urbo, provinco"
				disabled={sending}
			/>
			<Error value={errors.place} />
		</div>
		<div class="form__part">
			<label for="languages" class="form__label">Lingvoj</label>
			<div class="language__container">
				{#each values.languages as language, i}
					<div class="language">
						<input
							type="text"
							disabled={sending}
							bind:value={language.name}
							placeholder="Lingvo"
							class="language__name-input"
						/>
						<div class="select-container">
							<Select
								items={levels}
								value={language.level}
								placeholder="Elekti nivelon"
								noOptionsMessage="Mankas opcioj"
								on:select={(e) => (language.level = e.detail.value)}
								on:clear={(e) => (language.level = undefined)}
								isDisabled={sending}
							/>
						</div>
						<button
							on:click={() => removeLanguage(i)}
							class="language__remove-button"
							disabled={sending}
							type="button"
						>
							<svg viewBox="-2 -2 50 50" focusable="false" aria-hidden="true" role="presentation"
								><path
									fill="currentColor"
									d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
              l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
								/></svg
							>
						</button>
						<Error value={errors[`languages[${i}].name`]} />
						<Error value={errors[`languages[${i}].level`]} />
					</div>
				{/each}
			</div>
			<button
				on:click={addLanguage}
				type="button"
				class="form__button form__button--blue"
				disabled={sending}>Aldoni novan lingvon</button
			>
			<Error value={errors.languages} />
		</div>
		<div class="form__part">
			<label for="email" class="form__label">Retpoŝtadreso</label>
			<input
				type="email"
				id="email"
				bind:value={values.email}
				autocomplete="email"
				placeholder="Retpoŝtadreso"
				disabled={sending}
			/>
			<Error value={errors.email} />
		</div>
		<div class="password form__part">
			<label for="password" class="form__label"
				>Pasvorto <small class="form__small"
					>(estu almenaŭ 8 signoj, unu ĉeflitero, cifero, malĉeflitero. Oni povas uzi ĉi tiujn
					simbolojn: #?!@$%^&*-_ )</small
				></label
			>
			<PasswordInput
				bind:value={values.password}
				disabled={sending}
				autocomplete="new-password"
				id="password"
				placeholder="Pasvorto"
			/>
			<Error value={errors.password} />
		</div>
		<div class="password form__part">
			<label for="retype-password" class="form__label">Reentajpu la pasvorton</label>
			<PasswordInput
				bind:value={values.retypedPassword}
				disabled={sending}
				autocomplete="new-password"
				id="retype-password"
				placeholder="Pasvorto"
			/>
			<Error value={errors.retypedPassword} />
		</div>
		<div class="form__part">
			<label class="form__label form__label--checkbox" for="consent"
				><input
					type="checkbox"
					id="consent"
					disabled={sending}
					bind:checked={values.consent}
				/><span
					>Mi akceptas <a href="/regularo" target="_blank">la regularon</a> kaj
					<a href="/privateco" target="_blank">la privatecan politikon</a></span
				></label
			>
			<Error value={errors.consent} />
		</div>
		<div class="form__part">
			<button
				type="submit"
				class="form__button form__button--green form__button--round"
				disabled={sending}>Registriĝi</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../styles/abstracts/colors'
@use '../styles/abstracts/mixins' 
@use '../styles/components'

.form
	@include components.essential-form

	&__label--checkbox
		gap: 10px
		display: flex
		align-items: center

.language
	@include components.language-form
</style>
