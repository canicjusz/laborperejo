<script context="module">
	export function load({ url }) {
		const search = url.search;
		return {
			props: {
				search
			}
		};
	}
</script>

<script>
	import { variables } from '$lib/variables';
	import UserSearch from '$lib/UserSearch.svelte';
	import { goto, afterNavigate } from '$app/navigation';
	import { getDate, getData, generateNavigation } from '$lib/utils';
	import Spinner from '$lib/Spinner.svelte';
	import { error } from '$lib/stores';
	export let search;
	let searchParams = new URLSearchParams(search);
	let currentPage = +searchParams.get('p') || 1;
	let pages;
	let profiles;
	let visiblePages;

	const resetValues = () => {
		search = location.search;
		searchParams = new URLSearchParams(search);
		currentPage = +searchParams.get('p') || 1;
		pages = undefined;
		profiles = undefined;
		visiblePages = undefined;
		downloadData();
	};

	afterNavigate(resetValues);

	const handleSubmit = (url) => goto('/uzantoj' + url.detail);

	const changePage = (page) => {
		if (currentPage !== page) {
			searchParams.set('p', page);
			// location.search = searchParams.to.string().trim();
			const newQueryString = '?' + searchParams.toString().trim();
			goto('/uzantoj' + newQueryString);
		}
	};

	const downloadData = async () => {
		await getData(variables.base + '/api/profiles' + search)
			.then((data) => {
				pages = data.pages;
				profiles = data.profiles;
				visiblePages = generateNavigation(pages, currentPage);
			})
			.catch(error.change);
	};
</script>

<svelte:head>
	<title>Serĉi uzantojn | Laborperejo</title>
	<meta name="description" content="Serĉilo por trovi uzantojn ĉe laborperejo." />
</svelte:head>

<UserSearch on:submit={handleSubmit} {search} />
{#if visiblePages === undefined}
	<div class="spinner__container">
		<Spinner />
	</div>
{:else if visiblePages.length !== 0}
	<div class="pagination">
		<div class="pagination__scroll">
			<div class="pagination__container">
				{#each visiblePages as page}
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						href={'javascript:void()'}
						class="pagination__element"
						class:pagination__element--selected={currentPage === page}
						on:click|preventDefault={() => changePage(page)}>{page}</a
					>
				{/each}
			</div>
		</div>
	</div>
	<div class="profile__container">
		{#each profiles as profile}
			<div class="profile">
				<a href={'/uzantoj/' + profile.ID}>
					<img
						src={profile.avatar}
						alt={'Profilbildo de ' + profile.user_name}
						class="profile__image"
					/>
				</a>
				<div class="profile__content">
					<div class="profile__content-top">
						<h1 class="profile__title">
							<a href={'/uzantoj/' + profile.user_ID} class="profile__title-link"
								>{profile.user_name}</a
							>
						</h1>
					</div>

					<div class="profile__content-middle">
						<ul class="profile__info">
							<li>
								Loĝanta en {profile.place}, {profile.country}.
							</li>
							<li>
								{#if profile.job}
									{profile.searching ? 'Serĉanta laboron' : 'Laboranta'} kiel {profile.job}.
								{:else}
									{profile.searching ? 'Serĉanta' : 'Ne serĉanta'} laboron.
								{/if}
							</li>
						</ul>
					</div>
					<div class="profile__content-bottom">
						Kreita {getDate(profile.created_at)}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="pagination pagination--bottom">
		<div class="pagination__scroll">
			<div class="pagination__container">
				{#each visiblePages as page}
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						href={'javascript:void()'}
						class="pagination__element"
						class:pagination__element--selected={currentPage === page}
						on:click|preventDefault={() => changePage(page)}>{page}</a
					>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div class="nothing__container">Pardonon, ni nenion trovis</div>
{/if}

<style lang="sass">
@use '../../styles/components' 

.profile
	@include components.search-content
</style>
