<script context="module">
	export const load = ({ session, params }) => {
		const ID = session?.ID;
		return ID
			? {
					redirect: '/uzantoj/' + ID,
					status: 303
			  }
			: {
					props: {
						token: params.token,
						id: params.id
					}
			  };
	};
</script>

<script>
	import { variables } from '$lib/variables';
	import { goto } from '$app/navigation';
	import { error, feedback } from '$lib/stores';
	import * as yup from 'yup';
	export let token;
	export let id;
	import { extractErrors, putData } from '$lib/utils';
	import PasswordInput from '$lib/PasswordInput.svelte';
	import Error from '$lib/Error.svelte';
	let sending = false;

	const values = {
		password: '',
		retypedPassword: ''
	};
	let errors = {};

	const schema = yup.object().shape({
		password: yup
			.string()
			.trim()
			.required('Bonvolu entajpi novan pasvorton.')
			.matches(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,512}$/,
				'La pasvorto enhavu 8-512 signojn kaj po almenaŭ unu ciferon, ĉefliteron kaj malĉefliteron. Oni povas aldone uzi jenajn specjalajn signojn: #?!@$%^&*-_'
			),
		retypedPassword: yup
			.mixed()
			.required('Bonvolu reentajpi la pasvorton.')
			.test('match', 'La pasvortoj estas malsamaj.', function () {
				return this.parent.password === this.parent.retypedPassword;
			})
	});

	const sendPassword = () => {
		sending = true;
		const valuesToSend = {
			password: values.password,
			id,
			token
		};
		putData(variables.base + `/api/account/password`, JSON.stringify(valuesToSend), true, {
			'Content-type': 'application/json'
		})
			.then((res) => {
				feedback.change(res);
				goto('/ensaluti');
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	const checkForm = () => {
		errors = {};
		schema
			.validate(values, { abortEarly: false })
			.then(sendPassword)
			.catch((err) => (errors = extractErrors(err)));
	};
</script>

<svelte:head>
	<title>Restarigi pasvorton | Laborperejo</title>
	<meta
		name="description"
		content="Paĝo por restarigi pasvorton per retpoŝtadreso ĉe laborperejo."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Restarigejo</h1>
		<div class="form__part">
			<label for="new-password" class="form__label">Nova pasvorto</label>
			<PasswordInput
				bind:value={values.password}
				disabled={sending}
				placeholder="Nova pasvorto"
				autocomplete="new-password"
				id="new-password"
			/>
			<Error value={errors.password} />
		</div>
		<div class="form__part">
			<label for="new-retyped-password" class="form__label">Reentajpu la novan pasvorton</label>
			<PasswordInput
				bind:value={values.retypedPassword}
				disabled={sending}
				placeholder="Nova pasvorto"
				id="new-retyped-password"
				autocomplete="new-password"
			/>
			<Error value={errors.retypedPassword} />
		</div>
		<div class="form__part">
			<button
				type="submit"
				class="form__button form__button--round form__button--green"
				disabled={sending}>Restarigi</button
			>
		</div>
	</form>
</div>

<style lang="sass">
@use '../../../styles/components'

.form
	@include components.essential-form
</style>
