<script context="module">
	export const load = ({ session, params }) => {
		if (!session?.ID)
			return {
				redirect: '/ensaluti',
				status: 303
			};
		if (session.ID !== +params.id)
			return {
				redirect: `/uzantoj/${session.ID}/redakti`,
				status: 303
			};
		return {};
	};
</script>

<script>
	import { variables } from '$lib/variables';
	import { error, feedback } from '$lib/stores';
	import { goto, beforeNavigate } from '$app/navigation';
	import { session } from '$app/stores';
	import { extractErrors, putData } from '$lib/utils';
	import Editor from '$lib/Editor.svelte';
	import countries from '../../../../../countries';
	import levels from '../../../../../levels';
	import * as yup from 'yup';
	import Select from 'svelte-select';
	import { deepEqual } from 'fast-equals';
	import { klona } from 'klona/json';
	import PdfViewer from '$lib/PDFViewer.svelte';
	import Error from '$lib/Error.svelte';

	const schema = yup.object({
		name: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian plenan nomon')
			.max(100, 'Via nomo ne povas esti pli longa ol 100 signoj.'),
		content: yup
			.string()
			.trim()
			.required('Bonvolu entajpi priskribon de la profilo.')
			.max(8192, 'Priskribo ne povas esti pli longa ol 8192 signoj.'),
		phone: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.matches(
				/^\+(?:[0-9] ?){6,14}[0-9]$/,
				'La numero ne validas. Memoru pri telefona landokodo, por klareco vi povas dividi la numeron per spacetoj.'
			)
			.transform((string) => (string == '' ? null : string))
			.nullable(),
		email: yup
			.string()
			.trim()
			.email('La retpoŝtadreso ne validas.')
			.max(320, 'Retpoŝtadreso ne povas esti pli longa ol 320 signoj.'),
		fb: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.matches(
				/^(?:(?:http|https):\/\/)?(?:www.)?facebook.com.*/,
				'La ligilo navigu al retejo ĉe facebook.com.'
			)
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		vk: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.matches(
				/^(?:(?:http|https):\/\/)?(?:www.)?vk.com.*/,
				'La ligilo navigu al retejo ĉe vk.com.'
			)
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		mv: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.matches(
				/^(?:(?:http|https):\/\/)?(?:www.)?miavivo.net.*/,
				'La ligilo navigu al retejo ĉe miavivo.net.'
			)
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		searching: yup.boolean().required(),
		job: yup
			.string()
			.trim()
			.max(100, 'Postennomo ne povas esti pli longa ol 100 signoj.')
			.when('searching', {
				is: true,
				then: (schema) => schema.required('Bonvolu entajpi laborpostenon, kiun vi serĉas.'),
				otherwise: (schema) => schema.nullable()
			}),
		avatar: yup.string().trim().required(),
		place: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian loĝlokon (nomon de via urbo, vilaĝo, muncipo).')
			.max(100, 'Loĝloko ne povas esti pli longa ol 100 signoj.'),
		country: yup
			.mixed()
			.oneOf(countries, 'Bonvolu elekti landon.')
			.required('Bonvolu elekti landon.'),
		resume: yup.string().trim().nullable(),
		languages: yup
			.array()
			.of(
				yup.object().shape({
					name: yup.string().trim().required('Bonvolu entajpi nomon.'),
					level: yup
						.string()
						.trim()
						.oneOf(levels, 'Bonvolu elekti nivelon.')
						.required('Bonvolu elekti nivelon.')
				})
			)
			.min(1, 'Aldonu almenaŭ unu lingvon.')
			.max(50, 'Oni ne povas aldoni pli ol 50 lingvojn.'),
		li: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.matches(
				/^(?:(?:http|https):\/\/)?(?:www.)?linkedin.com.*/,
				'La ligilo navigu al retejo ĉe linkedin.com.'
			)
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		website: yup
			.string()
			.trim()
			.transform((string) => (string == '' ? null : string))
			.url('La ligilo ne estas valida.')
			.max(500, 'Ligilo ne povas esti pli longa ol 500 signoj.')
			.nullable(),
		subscription: yup.boolean().required()
	});

	let errors = {};

	const checkForm = () => {
		errors = {};
		schema
			.validate(toEdit, { abortEarly: false })
			.then(sendChanges)
			.catch((err) => (errors = extractErrors(err)));
	};

	const original = {
		...$session.profile,
		name: $session.name,
		subscription: $session.subscription
	};

	const toEdit = klona(original);

	const addLanguage = () => {
		toEdit.languages = [...toEdit.languages, { name: '', level: undefined }];
	};

	const removeLanguage = (i) => {
		toEdit.languages.splice(i, 1);
		toEdit.languages = toEdit.languages;
	};

	let sending = false;

	let newImg;
	let newResume;

	const goToProfile = () => {
		changed = false;
		goto(`/uzantoj/${$session.ID}`);
	};

	const updateLocalUser = ({ name, subscription, ...profile }) => {
		$session.profile = profile;
		$session.name = name;
		$session.subscription = subscription;
		goToProfile();
	};

	const sendChanges = (values) => {
		sending = true;
		const data = new FormData();
		values.avatar = avatarSrc;
		values.resume = resumeSrc;
		data.append('json', JSON.stringify(values));
		if (newImg) {
			data.append('avatar', newImg);
		}
		if (newResume && resumeSrc) {
			data.append('resume', newResume);
		}
		putData(variables.base + '/api/profiles/mine', data, true)
			.then((res) => {
				feedback.change(res);
				updateLocalUser(values);
				sending = false;
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	const changeAvatar = (changeEvent) => {
		const element = changeEvent.target;
		if (element.files) {
			const file = element.files[0];
			if (file.type.startsWith('image/')) {
				URL.revokeObjectURL(avatarSrc);
				newImg = file;
				avatarSrc = URL.createObjectURL(newImg);
			} else {
				error.change({
					error: 'Nur bildoj kaj GIF-movbildoj alŝuteblas.'
				});
			}
		}
	};

	const changeResume = (changeEvent) => {
		const element = changeEvent.target;
		if (element.files) {
			const file = element.files[0];
			if (file.type === 'application/pdf') {
				URL.revokeObjectURL(resumeSrc);
				newResume = file;
				resumeSrc = URL.createObjectURL(newResume);
			} else {
				error.change({
					error: 'Nur dosieroj kun etendaĵo .pdf alŝuteblas.'
				});
			}
		}
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

	const removeResume = () => {
		URL.revokeObjectURL(resumeSrc);
		resumeSrc = null;
		if (original.resume != undefined) newResume = true;
	};

	let avatarSrc = toEdit?.avatar;
	let resumeSrc = toEdit?.resume;
	$: changed = !deepEqual(toEdit, original) || newImg || newResume;
</script>

<svelte:head>
	<title>Redakti profilon | Laborperejo</title>
	<meta name="robots" content="noindex,nofollow" />
	<meta name="description" content="Paĝo por redakti profilon ĉe laborperejo." />
</svelte:head>
{#if $session}
	<div class="profile__container">
		<form class="profile" on:submit|preventDefault={checkForm}>
			<div class="profile__left">
				<div class="profile__left-top">
					<div class="profile__image-container">
						<input
							class="profile__input profile__input--invisible"
							type="file"
							id="avatar"
							on:change={changeAvatar}
							accept="image/png, image/jpeg, image/gif"
						/>
						<label for="avatar" class="profile__image-label"
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"
								/></svg
							></label
						>
						<img src={avatarSrc} alt="Via profilbildo" class="profile__image" />
					</div>
					<div class="profile__left-top-text">
						<div>
							<span class="profile__left-element"
								><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
									><path fill="none" d="M0 0h24v24H0z" /><path
										d="M3 4.995C3 3.893 3.893 3 4.995 3h14.01C20.107 3 21 3.893 21 4.995v14.01A1.995 1.995 0 0 1 19.005 21H4.995A1.995 1.995 0 0 1 3 19.005V4.995zM5 5v14h14V5H5zm2.972 13.18a9.983 9.983 0 0 1-1.751-.978A6.994 6.994 0 0 1 12.102 14c2.4 0 4.517 1.207 5.778 3.047a9.995 9.995 0 0 1-1.724 1.025A4.993 4.993 0 0 0 12.102 16c-1.715 0-3.23.864-4.13 2.18zM12 13a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
									/></svg
								>
								<input
									class="profile__input"
									autocomplete="personal-name"
									type="text"
									bind:value={toEdit.name}
									placeholder="Plena nomo"
								/>
							</span>
							<Error value={errors.name} />
						</div>
						<div>
							<span class="profile__left-element">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
									><path fill="none" d="M0 0h24v24H0z" /><path
										d="M3 3h9.382a1 1 0 0 1 .894.553L14 5h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.382a1 1 0 0 1-.894-.553L12 16H5v6H3V3z"
									/></svg
								>
								<div class="select-container profile__select-container">
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
							<span class="profile__left-element"
								><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
									><path fill="none" d="M0 0h24v24H0z" /><path
										d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
									/></svg
								>
								<input
									class="profile__input"
									autocomplete="address-level2"
									type="text"
									bind:value={toEdit.place}
									placeholder="Loĝloko"
								/>
							</span>
							<Error value={errors.place} />
						</div>
					</div>
				</div>
				<div class="profile__left-bottom">
					<Editor bind:value={toEdit.content} placeholder="Priskribo de via profilo" />
					<Error value={errors.content} />
				</div>
				<div class="profile__resume">
					<span class="profile__resume-text">
						Vivresumo:
						<label for="resume" class="profile__resume-label">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2h3z"
								/></svg
							>
						</label>
					</span>
					<input
						class="profile__input profile__input--invisible"
						id="resume"
						type="file"
						accept="application/pdf"
						on:change={changeResume}
					/>
					{#if resumeSrc}
						<div class="profile__resume-pages">
							<span class="profile__resume-remove"
								><button class="profile__resume-button" on:click={removeResume} type="button"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
										><path fill="none" d="M0 0h24v24H0z" /><path
											d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"
										/></svg
									></button
								></span
							>
							<div class="profile__resume-viewer">
								<PdfViewer url={resumeSrc} />
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="profile__right">
				<div class="profile__right-element profile__right-element--reverse">
					<label for="is-searching" class="profile__label">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"
							/></svg
						>Ĉu vi serĉas laboron?</label
					>
					<input
						class="profile__input"
						type="checkbox"
						id="is-searching"
						bind:checked={toEdit.searching}
					/>
				</div>
				<div>
					<div>
						<label class="profile__label" for="job">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
								><path fill="none" d="M0 0h24v24H0z" /><path
									d="M7 5V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4zM4 16v3h16v-3H4zm0-2h16V7H4v7zM9 3v2h6V3H9zm2 8h2v2h-2v-2z"
								/></svg
							>
							{toEdit.searching ? 'Kiun postenon vi serĉas?' : 'Kio estas via posteno?'}
						</label>
						<input
							class="profile__input"
							id="job"
							type="text"
							bind:value={toEdit.job}
							placeholder="Laborposteno"
						/>
					</div>
					<Error value={errors.jon} />
				</div>
				<div>
					<label class="profile__label" for="languages">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.008 8.008 0 0 0 5.648 6.667zM10.03 13c.151 2.439.848 4.73 1.97 6.752A15.905 15.905 0 0 0 13.97 13h-3.94zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.008 8.008 0 0 0 19.938 13zM4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333 8.008 8.008 0 0 0 4.062 11zm5.969 0h3.938A15.905 15.905 0 0 0 12 4.248 15.905 15.905 0 0 0 10.03 11zm4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.008 8.008 0 0 0-5.648-6.667z"
							/></svg
						>
						Lingvokapabloj:</label
					>
					<div>
						<div class="language__container">
							{#each toEdit.languages as language, i}
								<div class="language">
									<input
										type="text"
										bind:value={language.name}
										placeholder="Lingvo"
										class="language__name-input"
									/>
									<div class="select-container profile__select-container">
										<Select
											items={levels}
											value={language.level}
											placeholder="Elekti nivelon"
											noOptionsMessage="Mankas opcioj"
											on:select={(e) => (language.level = e.detail.value)}
											on:clear={(e) => (language.level = undefined)}
										/>
									</div>
									<button
										on:click={() => removeLanguage(i)}
										class="language__remove-button"
										type="button"
									>
										<svg
											viewBox="-2 -2 50 50"
											focusable="false"
											aria-hidden="true"
											role="presentation"
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
							<Error value={errors.languages} />
						</div>
						<button
							on:click={addLanguage}
							type="button"
							class="profile__button profile__button--blue">Aldoni novan lingvon</button
						>
					</div>
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z"
							/></svg
						>
						<input
							class="profile__input"
							type="email"
							bind:value={toEdit.email}
							autocomplete="email"
							placeholder="Retpoŝtadreso sur via profilo"
						/>
					</div>
					<Error value={errors.email} />
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498z"
							/></svg
						>
						<input
							class="profile__input"
							autocomplete="tel"
							type="tel"
							bind:value={toEdit.phone}
							placeholder="+48 123 456 789"
						/>
					</div>
					<Error value={errors.phone} />
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 0 1-1.548-1.549 1.548 1.548 0 1 1 1.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z"
							/></svg
						>
						<input
							class="profile__input"
							type="url"
							bind:value={toEdit.li}
							placeholder="https://www.linkedin.com"
						/>
					</div>
					<Error value={errors.li} />
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
							/></svg
						>
						<input
							class="profile__input"
							type="url"
							bind:value={toEdit.fb}
							placeholder="https://www.facebook.com"
						/>
					</div>
					<Error value={errors.fb} />
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
							><path
								class="st0"
								d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z"
							/></svg
						>
						<input
							class="profile__input"
							type="url"
							bind:value={toEdit.vk}
							placeholder="https://www.vk.com"
						/>
					</div>
					<Error value={errors.vk} />
				</div>
				<div>
					<div class="profile__right-element">
						<i class="mv-icon" />
						<input
							class="profile__input"
							type="url"
							bind:value={toEdit.mv}
							placeholder="https://www.miavivo.net"
						/>
					</div>
					<Error value={errors.mv} />
				</div>
				<div>
					<div class="profile__right-element">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"
							/></svg
						>
						<input
							class="profile__input"
							autocomplete="url"
							type="url"
							bind:value={toEdit.website}
							placeholder="https://www.via-pagxaro.com"
						/>
					</div>
					<Error value={errors.website} />
				</div>
				<div class="profile__right-element profile__right-element--reverse">
					<label for="subscription" class="profile__label">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
							><path fill="none" d="M0 0h24v24H0z" /><path
								d="M22 20.007a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V19h18V7.3l-8 7.2-10-9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v16.007zM4.434 5L12 11.81 19.566 5H4.434zM0 15h8v2H0v-2zm0-5h5v2H0v-2z"
							/></svg
						>Ĉu aboni servon rememorigantan pri observitaj ofertoj?</label
					>
					<input
						class="profile__input"
						type="checkbox"
						id="subscription"
						bind:checked={toEdit.subscription}
					/>
				</div>
				<button
					on:click={goToProfile}
					disabled={!changed}
					class="profile__button profile__button--red profile__button--round"
					type="button">Nuligi ŝanĝoj</button
				>
				<button
					type="submit"
					disabled={!changed || sending}
					class="profile__button profile__button--green profile__button--round"
					>Akcepti ŝanĝojn</button
				>
			</div>
		</form>
	</div>
{/if}

<style lang="sass">
@use '../../../styles/abstracts/colors' 
@use '../../../styles/abstracts/typography' 
@use '../../../styles/components' 
@use '../../../styles/abstracts/mixins' 

.profile
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
		width: 100%
		@include components.button

	&__resume

		&-text
			display: flex
			align-items: center
			gap: 10px
			font-size: typography.$normal
			margin: 12px 0
			font-family: typography.$open-sans

		&-button
			color: colors.$bialy
			@include mixins.center(false, false)
			border-radius: 50%
			border: none
			@include mixins.square(42px)
			background: colors.$crimson
			transition: 0.3s background
			cursor: pointer

			&:hover
				background: colors.$bordowy

		&-remove
			@include mixins.center(false, false)
			@include mixins.square(48px)
			right: 0
			background: colors.$szary
			border-top-left-radius: 50%
			border-top-right-radius: 50%
			top: -48px
			position: absolute

			&::after, &::before
				content: ''
				position: absolute
				bottom: 0

			&::after
				left: -48px
				background: colors.$bialy
				border-bottom-right-radius: 50%
				@include mixins.square(48px)
				
			&::before
				left: -24px
				background: colors.$szary
				@include mixins.square(24px)

		&-pages
			border-top-left-radius: 10px
			border-bottom-right-radius: 10px
			border-bottom-left-radius: 10px
			position: relative
			background: colors.$szary
			overflow: visible
		
		&-viewer
			padding: 10px
			text-align: center
			overflow-y: auto

		&-label
			height: 24px
			cursor: pointer
			transition: color 0.3s
			color: colors.$niebieski-link

			&:hover
				color: colors.$navy

.language
	@include components.language-form
	
@media (max-width: 1000px)

	.profile
		grid-template-columns: minmax(100%, 642px)
		margin: 0 20px
		row-gap: 20px

		&__input, &__select-container
			max-width: none

	.language
		grid-template-columns: 1fr 1fr 30px

@media (max-width: 700px)
	.profile

		&__left-top-text
			text-align: center
			margin-left: 0

		&__left-top
			grid-template-columns: auto
			
		&__image
			text-align: center

			&-container
				text-align: center
</style>
