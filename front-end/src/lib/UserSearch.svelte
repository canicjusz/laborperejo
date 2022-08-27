<script>
	import countries from '../../../countries';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let search;
	const params = new URLSearchParams(search);
	let searchQuery = params.get('q') ?? '';
	let selectedCountries =
		params
			.get('l')
			?.split(',')
			.map((country) => countries[+country]) ?? [];
	let selectedOnlySearching = params.get('ns') === '1' ? true : false;
	const hide = {
		miscellaneous: true,
		country: true
	};
	const hideKeys = Object.keys(hide);

	const hideExpandedBut = (clicked) =>
		hideKeys.forEach((key) => {
			hide[key] = key === clicked ? !hide[key] : true;
		});

	const createURL = () => {
		const query =
			'?q=' +
			searchQuery +
			'&s=' +
			(selectedOnlySearching ? '1' : '0') +
			(selectedCountries.length > 0
				? '&l=' + selectedCountries.map((country) => countries.indexOf(country)).join(',')
				: '');
		return query;
	};

	const submit = () => dispatch('submit', createURL());

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
			placeholder="Nomo de uzanto, fragmento de priskribo"
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
					<label for="selected-only" class="filters__label">
						<input
							class="filters__input"
							type="checkbox"
							id="selected-only"
							bind:checked={selectedOnlySearching}
						/>
						<span class="filters__label-text">montri nur uzantojn serĉantajn laboron</span>
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
</style>
