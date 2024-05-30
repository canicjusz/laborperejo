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
	import OfferSearch from '$lib/OfferSearch.svelte';
	import { goto, afterNavigate } from '$app/navigation';
	import Spinner from '$lib/Spinner.svelte';
	import { session } from '$app/stores';
	import { getDate, changeObservationCreator, getData, generateNavigation } from '$lib/utils';
	import { error } from '$lib/stores';
	export let search;
	const changeObservation = changeObservationCreator();
	let searchParams = new URLSearchParams(search);
	let currentPage = +searchParams.get('p') || 1;
	let pages;
	let offers;
	let visiblePages;

	const resetValues = () => {
		search = location.search;
		searchParams = new URLSearchParams(search);
		currentPage = +searchParams.get('p') || 1;
		pages = undefined;
		offers = undefined;
		visiblePages = undefined;
		downloadData();
	};

	afterNavigate(resetValues);

	const handleSubmit = (url) => goto('/ofertoj' + url.detail);

	const changePage = (page) => {
		if (currentPage !== page) {
			searchParams.set('p', page);
			// location.search = searchParams.to.string().trim();
			const newQueryString = '?' + searchParams.toString().trim();
			goto('/ofertoj' + newQueryString);
		}
	};

	const downloadData = async () => {
		await getData(variables.base + '/api/offers' + search)
			.then((data) => {
				pages = data.pages;
				offers = data.offers;
				visiblePages = generateNavigation(pages, currentPage);
			})
			.catch(error.change);
	};
</script>

<svelte:head>
	<title>Serĉi ofertojn | Laborperejo</title>
	<meta name="description" content="Serĉilo por trovi oferojn ĉe laborperejo." />
</svelte:head>
<OfferSearch on:submit={handleSubmit} {search} />
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
	<div class="offer__container">
		{#each offers as offer}
			<div class="offer">
				<!-- todo: alty wszystkie -->
				<a href={'/firmaoj/' + offer.company.ID}>
					<img
						src={offer.company.logo}
						alt={'Emblemo de ' + offer.company.name}
						class="offer__image"
					/>
				</a>
				<div class="offer__content">
					<div class="offer__content-top">
						<h1 class="offer__title">
							<a href={'/ofertoj/' + offer.ID} class="offer__title-link">{offer.title}</a>
							{#if $session?.ID}
								<button on:click={() => changeObservation(offer.ID, offer)} class="offer__star"
									>{#if $session.watchlist.some((followedOffer) => followedOffer.ID === offer.ID)}
										<span class="offer__star-text">Malobservi</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width="24"
											height="24"
											><path fill="none" d="M0 0h24v24H0z" /><path
												d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"
											/></svg
										>{:else}<span class="offer__star-text">Observi</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width="24"
											height="24"
											><path fill="none" d="M0 0h24v24H0z" /><path
												d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z"
											/></svg
										>{/if}</button
								>
							{/if}
						</h1>
						<p class="offer__company">
							<a href={'/firmaoj/' + offer.company.ID}>{offer.company.name}</a>
							en {offer.place}, {offer.country}
						</p>
					</div>
					<div class="offer__content-middle">
						<ul class="offer__info">
							<li>Dungeco: {offer.employment}</li>
							<li>Maniero: {offer.arrangement}</li>
							<li>
								{offer.salary ? 'Salajro' : 'Rekompenco'}: {offer.reward}
							</li>
						</ul>
					</div>
					<div class="offer__content-bottom">
						Kreita {getDate(offer.created_at)}{#if offer.close_at}, fermota {getDate(
								offer.close_at
							)}{/if}
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
@use '../../styles/abstracts/colors' 
@use '../../styles/abstracts/typography' 
@use '../../styles/components' 

.offer
	@include components.search-content

	&__title
		display: flex
		justify-content: space-between

	&__company
		overflow-wrap: anywhere
		margin: 5px 0 10px 0

	&__star
		display: inline-grid
		grid-template-columns: 1fr 24px
		align-items: center
		font-family: typography.$open-sans
		font-size: 1rem
		color: colors.$navy
		column-gap: 5px
		cursor: pointer
		background: transparent
		border: 0

		@media (max-width: 1000px)
			grid-template-columns: auto

			&-text
				display: none

</style>
