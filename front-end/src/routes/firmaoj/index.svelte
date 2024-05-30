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
	import CompanySearch from '$lib/CompanySearch.svelte';
	import { onlyOpened, getDate, getData, generateNavigation } from '$lib/utils';
	import { goto, afterNavigate } from '$app/navigation';
	import { error } from '$lib/stores';
	import Spinner from '$lib/Spinner.svelte';
	export let search;
	let searchParams = new URLSearchParams(search);
	let currentPage = +searchParams.get('p') || 1;
	let pages;
	let companies;
	let visiblePages;

	const resetValues = () => {
		search = location.search;
		searchParams = new URLSearchParams(search);
		currentPage = +searchParams.get('p') || 1;
		pages = undefined;
		companies = undefined;
		visiblePages = undefined;
		downloadData();
	};

	afterNavigate(resetValues);

	const handleSubmit = (url) => goto('/firmaoj' + url.detail);

	const changePage = (page) => {
		if (currentPage !== page) {
			searchParams.set('p', page);
			// location.search = searchParams.to.string().trim();
			const newQueryString = '?' + searchParams.toString().trim();
			goto('/firmaoj' + newQueryString);
		}
	};

	const downloadData = async () =>
		await getData(variables.base + '/api/companies' + search)
			.then((data) => {
				pages = data.pages;
				companies = data.companies;
				visiblePages = generateNavigation(pages, currentPage);
			})
			.catch(error.change);
</script>

<svelte:head>
	<title>Serĉi firmaojn | Laborperejo</title>
	<meta name="description" content="Serĉilo por trovi firmaojn ĉe laborperejo." />
</svelte:head>
<CompanySearch on:submit={handleSubmit} {search} />
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
	<div class="company__container">
		{#each companies as company}
			<div class="company">
				<a href={'/firmaoj/' + company.ID}>
					<img src={company.logo} alt={'Emblemo de ' + company.name} class="company__image" />
				</a>
				<div class="company__content">
					<div class="company__content-top">
						<h1 class="company__title">
							<a href={'/firmaoj/' + company.ID} class="company__title-link">{company.name}</a>
						</h1>
					</div>
					<div class="company__content-middle">
						<ul class="company__info">
							<li>
								La ĉefsidejo situas en {company.country}.
							</li>
							<li>
								La ĉefa branĉo estas {company.industry}.
							</li>
							<li>
								Nombro de malfermitaj ofertoj: {onlyOpened(company.offers).length}.
							</li>
						</ul>
					</div>
					<div class="company__content-bottom">
						Kreita {getDate(company.created_at)}
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

.company
	@include components.search-content
</style>
