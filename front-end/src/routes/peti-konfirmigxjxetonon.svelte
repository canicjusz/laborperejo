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
	import { error, feedback } from '$lib/stores';
	import { postData } from '$lib/utils';
	import Error from '$lib/Error.svelte';

	let sending = false;

	let email = '';
	let inputError = '';
	const schema = yup
		.string()
		.trim()
		.required('Bonvolu entajpi vian retpoŝtadreson.')
		.email('La retpoŝtadreso ne validas.')
		.max(320, 'Retpoŝtadreso ne povas esti pli longa ol 320 signoj.');

	const checkForm = () => {
		inputError = null;
		schema
			.validate(email, { abortEarly: false })
			.then(sendForm)
			.catch((err) => {
				inputError = err.message;
			});
	};

	const sendForm = () => {
		sending = true;
		const valuesToSend = { email };
		postData(variables.base + '/api/account/confirmation', JSON.stringify(valuesToSend), true, {
			'Content-type': 'application/json'
		})
			.then((data) => {
				sending = false;
				feedback.change(data);
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};
</script>

<svelte:head>
	<title>Peti registriĝ-ligilon | Laborperejo</title>
	<meta name="description" content="Paĝo por peti registriĝligilon ĉe laborperejo." />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Peti registriĝ-ligilon</h1>
		<div class="form__part">
			<label for="email" class="form__label">
				Retpoŝtadreso <input
					id="email"
					autocomplete="email"
					type="email"
					placeholder="Retpoŝtadreso"
					bind:value={email}
				/>
			</label>
		</div>
		<Error value={inputError} />
		<div class="form__part">
			<button
				type="submit"
				class="form__button form__button--round form__button--green"
				disabled={sending}>Resendi</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../styles/components'

.form
	@include components.essential-form
</style>
