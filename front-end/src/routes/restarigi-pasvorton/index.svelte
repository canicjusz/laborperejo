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
	// todo: zrobic jakis osobny panel do zmiany hasla, bo jak chlop zbanowany to moze chcec se zmienic haslo, no a w sumie czemu nie
	import * as yup from 'yup';
	import { extractErrors, putData } from '$lib/utils';
	import { feedback, error } from '$lib/stores';
	import { session } from '$app/stores';
	import PasswordInput from '$lib/PasswordInput.svelte';
	import Error from '$lib/Error.svelte';

	let sending = false;
	const values = {
		curr: '',
		new: '',
		newRetyped: ''
	};
	let errors = {};
	const schema = yup.object().shape({
		curr: yup.string().trim().required('Bonvolu entajpi vian nunan pasvorton.'),
		new: yup
			.string()
			.trim()
			.required('Bonvolu entajpi novan pasvorton.')
			.matches(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[\w#?!@$%^&*ĤŜĜĈĴŬĥŝĝĉĵŭ-]{8,512}$/,
				'La pasvorto enhavu 8-512 signojn kaj po almenaŭ unu ciferon, ĉefliteron kaj malĉefliteron. Oni povas aldone uzi jenajn specjalajn signojn: #?!@$%^&*-_'
			)
			.test('match', 'Nova pasvorto ne povas esti sama kiel la malnova.', function () {
				return this.parent.curr !== this.parent.new;
			}),
		newRetyped: yup
			.mixed()
			.required('Bonvolu reentajpi la novan pasvorton.')
			.test('match', 'La pasvortoj estas malsamaj.', function () {
				return this.parent.new === this.parent.newRetyped;
			})
	});

	const sendForm = () => {
		const { newRetyped, ...valuesToSend } = values;
		sending = true;
		putData(
			variables.base + `/api/account/${$session.ID}/password`,
			JSON.stringify(valuesToSend),
			true,
			{
				'Content-type': 'application/json'
			}
		)
			.then((res) => {
				feedback.change(res);
				sending = false;
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
	<title>Ŝanĝi pasvorton | Laborperejo</title>
	<meta name="description" content="Paĝo por ŝanĝi pasvorton de konto ĉe laborperejo." />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="form__container">
	<form on:submit|preventDefault={checkForm} class="form">
		<h1 class="form__title">Ŝanĝi pasvorton</h1>
		<div class="form__part">
			<label for="current-password" class="form__label">Via nuna pasvorto</label>
			<PasswordInput
				bind:value={values.curr}
				disabled={sending}
				placeholder="Nuna pasvorto"
				id="current-password"
				autocomplete="current-password"
			/>
			<Error value={errors.curr} />
		</div>
		<div class="form__part">
			<label for="new-password" class="form__label">Nova pasvorto</label>
			<PasswordInput
				bind:value={values.new}
				disabled={sending}
				placeholder="Nova pasvorto"
				autocomplete="new-password"
				id="new-password"
			/>
			<Error value={errors.new} />
		</div>
		<div class="form__part">
			<label for="new-retyped-password" class="form__label">Reentajpu la novan pasvorton</label>
			<PasswordInput
				id="new-retyped-password"
				bind:value={values.newRetyped}
				disabled={sending}
				autocomplete="new-retyped-password"
				placeholder="Nova pasvorto"
			/>
			<Error value={errors.newRetyped} />
		</div>
		<button type="submit" class="form__button form__button--blue form__button--round"
			>Ĝisdatigi pasvorton</button
		>
	</form>
</div>

<style lang="sass">
@use '../../styles/components'

.form
	@include components.essential-form
</style>
