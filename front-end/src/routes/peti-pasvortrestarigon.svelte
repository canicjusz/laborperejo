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

	let email = '';
	let inputError = undefined;
	let sending = false;

	const schema = yup
		.string()
		.trim()
		.required('Bonvolu entajpi vian retpoŝtadreson.')
		.email('La retpoŝtadreso ne validas.')
		.max(320, 'Retpoŝtadreso ne povas esti pli longa ol 320 signoj.');

	const sendForm = () => {
		sending = true;
		const valuesToSend = { email };
		postData(variables.base + '/api/account/password', JSON.stringify(valuesToSend), true, {
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

	const checkForm = () => {
		inputError = null;
		schema
			.validate(email, { abortEarly: false })
			.then(sendForm)
			.catch((err) => {
				inputError = err.message;
			});
	};
</script>

<svelte:head>
	<title>Peti pasvortrestarigon | Laborperejo</title>
	<meta
		name="description"
		content="Paĝo por peti ligilon per kiu oni povas restarigi sian pasvorton ĉe laborperejo."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Peti restarigon de via pasvorto</h1>
		<div class="form__part">
			<label for="email" class="form__label">Retpoŝtadreso</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				disabled={sending}
				placeholder="Retpoŝtadreso"
				autocomplete="email"
			/>
		</div>
		<Error value={inputError} />
		<div class="form__part">
			<button
				type="submit"
				class="form__button form__button--green form__button--round"
				disabled={sending}>Sendi peton</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../styles/components'

.form
	@include components.essential-form
</style>
