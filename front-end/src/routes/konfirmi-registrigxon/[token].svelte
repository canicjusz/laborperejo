<script context="module">
	export const load = ({ session, params, fetch }) => {
		const ID = session?.ID;
		return ID
			? {
					redirect: '/uzantoj/' + ID,
					status: 303
			  }
			: {
					props: {
						token: params.token
					}
			  };
	};
</script>

<script>
	import { goto } from '$app/navigation';
	import { putData } from '$lib/utils';
	import { error } from '$lib/stores';
	import Spinner from '$lib/Spinner.svelte';
	import { onMount } from 'svelte';

	export let token;
	onMount(() => {
		putData('http://localhost:5000/api/account/confirmation', JSON.stringify({ token }), true, {
			'Content-type': 'application/json'
		})
			.then(() => {
				goto('/ensaluti');
			})
			.catch((err) => {
				error.change(err);
				goto('/peti-konfirmigxjxetonon');
			});
	});
</script>

<svelte:head>
	<title>Konfirmi registriĝon | Laborperejo</title>
	<meta
		name="description"
		content="Paĝo por konfirmi validecon de registriĝligilo ĉe laborperejo."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<div class="spinner__container">
	<Spinner />
</div>
