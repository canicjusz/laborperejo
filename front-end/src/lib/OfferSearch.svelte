<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import countries from '../../../countries';
	import categories from '../../../categories';
	const dispatch = createEventDispatcher();
	const hide = {
		employment: true,
		category: true,
		arrangement: true,
		country: true
	};
	let countryFilter = '';
	const hideKeys = Object.keys(hide);
	const employmentTypes = ['plentempa', 'parttempa', 'aldona'];
	const workArrangements = ['hejme', 'laboreje', 'hibride'];
	export let search;
	const params = new URLSearchParams(search);
	let searchQuery = params.get('q') ?? '';
	let selectedEmploymentTypes = params.get('d')?.split(',') ?? [];
	let selectedArrangements = params.get('m')?.split(',') ?? [];
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
	const hideExpandedBut = (clicked) =>
		hideKeys.forEach((key) => {
			hide[key] = key === clicked ? !hide[key] : true;
		});

	const joinParameter = (name, values) =>
		values.length > 0 ? '&' + name + '=' + values.join(',') : '';
	// jeszcze whether salary
	const createURL = () =>
		'?nm=1&q=' +
		searchQuery +
		joinParameter('d', selectedEmploymentTypes) +
		joinParameter('m', selectedArrangements) +
		joinParameter('k', selectedCategories) +
		joinParameter(
			'l',
			selectedCountries.map((country) => countries.indexOf(country))
		);

	const submit = () => {
		dispatch('submit', createURL());
	};

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
			placeholder="Nomoj de posteno, serĉvortoj"
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
				Kategorio
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
				class:filters__expander--active={!hide.employment}
				on:click={() => hideExpandedBut('employment')}
			>
				Dungeco
			</li>
			<li
				class="filters__expander"
				class:filters__expander--active={!hide.arrangement}
				on:click={() => hideExpandedBut('arrangement')}
			>
				Maniero
			</li>
		</ul>
		<div class="filters__filter-container">
			<div class="categories filters__filter" class:filters__filter--hidden={hide.category}>
				<div class="filters__list filters__list--categories">
					{#each categories as category, index}
						<label for={'category-' + index} class="filters__label">
							<input
								type="checkbox"
								name="category"
								id={'category-' + index}
								bind:group={selectedCategories}
								value={index}
								class="filters__input"
							/>
							<span class="filters__label-text">
								{category}
							</span>
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
							<label for={'country-' + index}>
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
			<div class="filters__filter" class:filters__filter--hidden={hide.employment}>
				<div class="filters__list filters__list--employments">
					{#each employmentTypes as employmentType, index}
						<label for={'employment-' + index} class="filters__label">
							<input
								type="checkbox"
								name=""
								id={'employment-' + index}
								bind:group={selectedEmploymentTypes}
								value={employmentType}
								class="filters__input"
							/>
							<span class="filters__label-text">{employmentType}</span>
						</label>
					{/each}
				</div>
			</div>
			<div class="filters__filter" class:filters__filter--hidden={hide.arrangement}>
				<div class="filters__list filters__list--arrangements">
					{#each workArrangements as arrangement, index}
						<label for={'arrangement-' + index} class="filters__label">
							<input
								type="checkbox"
								name=""
								id={'arrangement-' + index}
								bind:group={selectedArrangements}
								value={arrangement}
								class="filters__input"
							/>
							<span class="filters__label-text">{arrangement}</span>
						</label>
					{/each}
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

		&--employments, &--arrangements, &--employments
			grid-template-columns: repeat(3, max-content)
		
		&--categories
			grid-template-columns: repeat(4, max-content)

			@media (max-width: 900px)
				grid-template-columns: repeat(3, max-content)

			@media (max-width: 700px)
				grid-template-columns: repeat(2, max-content)

		&--categories, &--arrangements, &--employments
			@media (max-width: 500px)
				grid-template-columns: max-content

</style>
