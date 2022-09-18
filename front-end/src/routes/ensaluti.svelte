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
	import { goto } from '$app/navigation';
	import { error } from '$lib/stores';
	import { session } from '$app/stores';
	import * as yup from 'yup';
	import { extractErrors, postData } from '$lib/utils';
	import PasswordInput from '$lib/PasswordInput.svelte';
	import Error from '$lib/Error.svelte';
	import { variables } from '$lib/variables';

	const values = {
		email: '',
		password: '',
		saveSession: false
	};
	let errors = {};

	let sending = false;

	const schema = yup.object().shape({
		email: yup
			.string()
			.trim()
			.required('Bonvolu entajpi vian retpoŝtadreson.')
			.email('La retpoŝtadreso ne validas.'),
		password: yup.string().trim().required('Bonvolu entajpi vian pasvorton.'),
		saveSession: yup.boolean().required()
	});

	const sendForm = () => {
		sending = true;
		postData(variables.base + '/api/session', JSON.stringify(values), true, {
			'Content-type': 'application/json'
		})
			.then((databaseUser) => {
				session.set(databaseUser);
				goto(`/uzantoj/${databaseUser.ID}`);
			})
			.catch((err) => {
				error.change(err);
				sending = false;
			});
	};

	const checkForm = () => {
		errors = {};
		schema
			.validate(values, { abortEarly: false })
			.then(sendForm)
			.catch((err) => (errors = extractErrors(err)));
	};
</script>

<svelte:head>
	<title>Ensaluti | Laborperejo</title>
	<meta name="description" content="Paĝo por ensaluti en laborperejon." />
</svelte:head>
<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Ensalutejo</h1>
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
		<div class="form__part">
			<label for="password" class="form__label">Pasvorto</label>
			<PasswordInput
				bind:value={values.password}
				disabled={sending}
				placeholder="Via pasvorto"
				id="password"
				autocomplete="current-password"
			/>
			<Error value={errors.password} />
		</div>
		<div class="form__part">
			<label class="form__label form__label--checkbox" for="remember-me"
				><input
					type="checkbox"
					id="remember-me"
					disabled={sending}
					bind:checked={values.saveSession}
				/>Memori min</label
			>
		</div>
		<div class="form__part">
			<a href="/peti-pasvortrestarigon">Ĉu vi forgesis vian pasvorton?</a>
		</div>
		<div class="form__part">
			<a href="/peti-konfirmigxjxetonon">Ĉu vi ne ricevis registriĝ-konfirmon?</a>
		</div>
		<div class="form__part">
			<button
				type="submit"
				class="form__button form__button--round form__button--green"
				disabled={sending}>Ensaluti</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../styles/components'

.form
	@include components.essential-form

	&__label--checkbox
		gap: 10px
		display: flex
		align-items: center

</style>
