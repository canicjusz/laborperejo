<script>
	import countries from '../../../countries';
	import categories from '../../../categories';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let search;
	const params = new URLSearchParams(search);
	let searchQuery = params.get('q') ?? '';
	let selectedCategories =
		params
			.get('k')
			?.split(',')
			.map((category) => +category) ?? [];
	let selectedCountries =
		params
			.get('l')
			?.split(',')
			.map((country) => countries[+country]) ?? [];

	let selectedOnlyOpened = params.get('mo') === '1' ? true : false;
	const hideExpandedBut = (clicked) =>
		hideKeys.forEach((key) => {
			hide[key] = key === clicked ? !hide[key] : true;
		});

	const hide = {
		category: true,
		country: true,
		miscellaneous: true
	};
	const hideKeys = Object.keys(hide);

	const joinParameter = (name, values) =>
		values.length > 0 ? '&' + name + '=' + values.join(',') : '';

	const createQuery = () => {
		const query =
			'?q=' +
			searchQuery +
			joinParameter(
				'l',
				selectedCountries.map((country) => countries.indexOf(country))
			) +
			joinParameter('k', selectedCategories) +
			'&mo=' +
			(selectedOnlyOpened ? '1' : '0');

		return query;
	};

	const submit = () => {
		dispatch('submit', createQuery());
	};

	let countryFilter = '';

	const filteringFunction = (filter) => {
		const filterToLower = filter.toLowerCase();
		return countries.filter((country) => country.toLowerCase().includes(filterToLower));
	};
	const toggleCountry = (country) => {
		const index = selectedCountries.indexOf(country);
		if (index > -1) {
			selectedCountries.splice(index, 1);
			selectedCountries = selectedCountries;
		} else {
			selectedCountries = [...selectedCountries, country];
		}
	};

	$: filteredCountries = filteringFunction(countryFilter);
</script>

<form class="form" on:submit|preventDefault={submit}>
	<div class="form__search-bar">
		<input
			class="form__search"
			type="search"
			bind:value={searchQuery}
			placeholder="Nomo de firmao, fragmento de priskribo"
		/>
		<button class="form__button form__button--blue form__button--round" type="submit"
			><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
				><path fill="none" d="M0 0h24v24H0z" /><path
					d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z"
				/></svg
			>Serĉi</button
		>
	</div>
	<div class="form__filters filters">
		<ul class="filters__expander-list">
			<li
				class="filters__expander"
				class:filters__expander--active={!hide.category}
				on:click={() => hideExpandedBut('category')}
			>
				Branĉo
			</li>
			<li
				class="filters__expander"
				class:filters__expander--active={!hide.country}
				on:click={() => hideExpandedBut('country')}
			>
				Lando
			</li>
			<li
				class="filters__expander"
				class:filters__expander--active={!hide.miscellaneous}
				on:click={() => hideExpandedBut('miscellaneous')}
			>
				Aldone
			</li>
		</ul>
		<div class="filters__filter-container">
			<div class="filters__filter" class:filters__filter--hidden={hide.category}>
				<div class="filters__list filters__list--categories">
					{#each categories as category, index}
						<label for={'category-' + index} class="filters__label">
							<input
								type="checkbox"
								name=""
								id={'category-' + index}
								bind:group={selectedCategories}
								value={index}
								class="filters__input"
							/>
							<span class="filters__label-text">{category}</span>
						</label>
					{/each}
				</div>
			</div>
			<div class="filters__filter" class:filters__filter--hidden={hide.country}>
				<div class="filters__text-input-container">
					<input
						type="text"
						bind:value={countryFilter}
						placeholder="Lando"
						class="filters__text-input"
					/>
				</div>
				{#key filteredCountries}
					<div class="filters__list filters__list--countries">
						{#each filteredCountries as country, index}
							<label for={'country-' + index} class="filters__label">
								<input
									type="checkbox"
									name=""
									id={'country-' + index}
									checked={selectedCountries.includes(country)}
									on:change={toggleCountry(country)}
									value={country}
									class="filters__input"
								/>
								<span class="filters__label-text">{country}</span>
							</label>
						{/each}
					</div>
				{/key}
			</div>
			<div class="filters__filter" class:filters__filter--hidden={hide.miscellaneous}>
				<div class="filters__list filters__list--miscellaneous">
					<label for="opened-only" class="filters__label">
						<input
							type="checkbox"
							id="opened-only"
							bind:checked={selectedOnlyOpened}
							class="filters__input"
						/>
						<span class="filters__label-text">montri nur fimaojn kun malfermitaj ofertoj</span>
					</label>
				</div>
			</div>
		</div>
	</div>
</form>

<style lang="sass">
@use '../styles/components' 

.form
	@include components.search-form

.filters
	@include components.filters

	&__list

		&--employments
			grid-template-columns: repeat(3, max-content)
		
		&--categories
			grid-template-columns: repeat(4, max-content)

			@media (max-width: 900px)
				grid-template-columns: repeat(3, max-content)

			@media (max-width: 700px)
				grid-template-columns: repeat(2, max-content)

			@media (max-width: 500px)
				grid-template-columns: max-content
</style>
