<script context="module">
	export const load = ({ params }) => {
		return {
			props: {
				token: params.token
			}
		};
	};
</script>

<script>
	import { goto } from '$app/navigation';
	import { deleteData } from '$lib/utils';
	import { error, feedback } from '$lib/stores';
	import Spinner from '$lib/Spinner.svelte';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';

	export let token;
	onMount(() => {
		deleteData('http://localhost:5000/api/offers/subscription/' + token, false, {
			'Content-type': 'application/json'
		})
			.then((res) => {
				feedback.change(res);
				if ($session) {
					$session.subscription = false;
				}
			})
			.catch(error.change)
			.finally(() => goto('/'));
	});
</script>

<svelte:head>
	<title>Malaboni | Laborperejo</title>
	<meta
		name="description"
		content="Paĝo por malaboni servon rememorigi pri baldaŭ fermontaj ofertoj."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<div class="spinner__container">
	<Spinner />
</div>
