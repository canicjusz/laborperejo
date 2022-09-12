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
	import Select from 'svelte-select';
	import { goto, beforeNavigate } from '$app/navigation';
	import { session } from '$app/stores';
	import { error, feedback } from '$lib/stores';
	import { getData, putData, deleteData, convertDate } from '$lib/utils';
	import Spinner from '$lib/Spinner.svelte';
	import Popup from '$lib/Popup.svelte';

	let companyID = $session.companies[0]?.ID;

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowFormated = convertDate(tomorrow);

	let offers = [];
	let originalData = [];
	let offersChanged = [];
	let p = 0;

	let isMore = false;
	let toRemove = null;

	let loading = false;
	let sending = false;

	const resetValues = () => {
		p = 0;
		isMore = false;
		offers = [];
		offersChanged = [];
		loadOffers();
	};

	const clearToRemove = () => {
		toRemove = null;
		showPopup = false;
	};

	const fillToRemove = (id, index) => {
		toRemove = {
			id,
			index
		};
		showPopup = true;
	};

	const loadOffers = async () => {
		loading = true;
		await getData(variables.base + `/api/offers?de=${companyID}&p=${++p}&nm=0`)
			.then((res) => {
				loading = false;
				const { offers: newOffers, pages } = res;
				newOffers.forEach((newOffer) => {
					newOffer.close_at = newOffer.close_at
						? convertDate(new Date(newOffer.close_at))
						: tomorrowFormated;
				});
				//gotta make a shallow copy
				offers = offers.concat(newOffers.map((obj) => Object.assign({}, obj)));
				originalData = originalData.concat(newOffers.map((obj) => Object.assign({}, obj)));
				offersChanged = offersChanged.concat(new Array(newOffers.length).fill(false));
				isMore = pages > p;
			})
			.catch((err) => {
				loading = false;
				error.change(err);
			});
	};

	let showPopup = false;

	//if offer has other closed or close_at values, change the state
	const changeState = (i) =>
		(offersChanged[i] =
			offers[i].closed !== originalData[i].closed ||
			(offers[i].close_at !== originalData[i].close_at && offers[i].closed === false));

	const removeOffer = () => {
		deleteData(variables.base + `/api/offers/${toRemove.id}`, true)
			.then((res) => {
				offers.splice(toRemove.index, 1);
				originalData.splice(toRemove.index, 1);
				offersChanged.splice(toRemove.index, 1);
				clearToRemove();
				offersChanged = offersChanged;
				//gotta do this cuz of the each block
				offers = offers;
			})
			.catch((err) => {
				error.change(err);
				clearToRemove();
			});
	};
	const acceptChanges = () => {
		let changes = [];
		sending = true;
		offersChanged.forEach((edited, i) => {
			if (edited) {
				if (offers[i].close_at == '') offers[i].closed = true;
				changes.push({
					ID: offers[i].ID,
					closed: offers[i].closed,
					close_at: !offers[i].closed ? new Date(offers[i].close_at) : null
				});
			}
		});
		const valuesToSend = { array: changes, companyID };
		putData(variables.base + `/api/offers`, JSON.stringify(valuesToSend), true, {
			'Content-type': 'application/json'
		})
			.then((res) => {
				offersChanged.fill(false);
				offersChanged = offersChanged;
				originalData = offers.map((obj) => Object.assign({}, obj));
				sending = false;
				feedback.change(res);
			})
			.catch((err) => {
				sending = false;
				error.change(err);
			});
	};

	beforeNavigate(({ cancel }) => {
		//when there is an error, a dialog window shows up
		if (changed) {
			if (
				!confirm(
					'Ŝajnas, ke vi ne konservis la ŝanĝojn. Se vi forlasos la retpaĝon antaŭ konservado, ĉiuj ŝanĝoj nuliĝos. Ĉu vi certe volas forlasi?'
				)
			) {
				cancel();
			} else {
				changed = false;
			}
		}
	});

	$: changed = offersChanged.includes(true);
	$: companyIndex = $session.companies.findIndex((company) => company.ID === companyID);
</script>

<svelte:head>
	<title>Ofertpanelo | Laborperejo</title>
	<meta name="description" content="Panelo de oniaj ofertoj ĉe laborperejo." />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<Popup show={showPopup}>
	<h1 class="popup__title popup__title--red">Averto!</h1>
	<p class="popup__text">
		Ĉu vi certe volas forigi firmaon {offers[toRemove.index].title} kaj ĝiajn ofertojn? La operacio ne
		malfareblas!
	</p>
	<div class="popup__buttons">
		<button
			on:click={removeOffer}
			class="popup__button popup__button--round popup__button--blue"
			type="button">Jes</button
		>
		<button
			on:click={clearToRemove}
			class="popup__button popup__button--round popup__button--blue"
			type="button">Ne</button
		>
	</div>
</Popup>
{#if companyID}
	{#await loadOffers()}
		<div class="spinner__container">
			<Spinner />
		</div>
	{:then}
		<div class="table__container">
			<div class="company-picker">
				<label for="company-selector" class="company-picker__label">Firmao:</label>
				<div class="select-container company-picker__select-container">
					<Select
						id=" company-selector"
						items={$session.companies}
						value={$session.companies[companyIndex]}
						on:select={(e) => {
							companyID = e.detail.ID;
							resetValues();
						}}
						optionIdentifier="ID"
						labelIdentifier="name"
						placeholder="Elekti landon"
						noOptionsMessage="Mankas opcioj"
						isClearable={false}
					/>
				</div>
			</div>
			<div class="table__shape">
				<table class="table">
					<thead class="table__head">
						<tr class="table__head-row">
							<th class="table__column-title">Laborposteno</th>
							<th class="table__column-title">Malfermita</th>
							<th class="table__column-title">Redakti</th>
							<th class="table__column-title">Forigi</th>
						</tr>
					</thead>
					<tbody class="table__body">
						{#if offers.length > 0}
							{#each offers as offer, i}
								<tr class="table__body-row">
									<td class="table__cell"><a href={`/ofertoj/${offer.ID}`}>{offer.title}</a></td>
									<td class="table__cell">
										<span>
											<label for={'checkbox-company-' + i} class="table__label">
												Ĉu la oferto estu fermita?
												<input
													id={'checkbox-company-' + i}
													type="checkbox"
													class="checkbox"
													bind:checked={offer.closed}
													on:change={() => changeState(i)}
												/>
											</label>
											{#if !offer.closed}
												<label for={'input-company-' + i} title="Fermiĝdato" class="table__label">
													<input
														type="datetime-local"
														id={'input-company-' + i}
														placeholder="Fermiĝdato"
														min={tomorrowFormated}
														bind:value={offer.close_at}
														on:change={() => changeState(i)}
													/>
												</label>
											{/if}
										</span></td
									>
									<td class="table__cell">
										<button
											on:click={() => goto(`/ofertoj/${offer.ID}/redakti`)}
											class="table__button table__button--blue"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="24"
												height="24"
												><path fill="none" d="M0 0L24 0 24 24 0 24z" /><path
													d="M20 2c.552 0 1 .448 1 1v3.757l-2 2V4H5v16h14v-2.758l2-2V21c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V3c0-.552.448-1 1-1h16zm1.778 6.808l1.414 1.414L15.414 18l-1.416-.002.002-1.412 7.778-7.778zM13 12v2H8v-2h5zm3-4v2H8V8h8z"
												/></svg
											>
										</button></td
									>
									<td class="table__cell">
										<button on:click={() => fillToRemove(offer.ID, i)} class="table__button"
											><svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												width="24"
												height="24"
												><path fill="none" d="M0 0h24v24H0z" /><path
													d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"
												/></svg
											></button
										>
									</td>
								</tr>
							{/each}
						{:else}
							<tr class="table__body-row">
								<td colspan="4" class="table__cell-info">Ĉi tiu firmao ne havas ofertojn</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
			{#if loading}
				<div class="spinner__container">
					<Spinner />
				</div>
			{/if}
			{#if isMore}
				<button
					on:click={loadOffers}
					disabled={loading}
					type="button"
					class="button button--blue button--round">Montri pliajn</button
				>
			{/if}
			<button
				on:click={() => goto('/ofertkreilo', { state: { company: companyID } })}
				type="button"
				class="button button--blue button--round">Aldoni oferton</button
			>
			<button
				on:click={acceptChanges}
				class="button button--green button--round"
				disabled={!changed || sending}>Akcepti la ŝanĝojn</button
			>
		</div>
	{/await}
{:else}
	<div class="url-error">
		<span>
			Por administri ofertojn vi devas havi almenaŭ unu firmaon. Navigu al <a href="/firmapanelo"
				>firmapanelo</a
			> pro krei firmaon.
		</span>
	</div>
{/if}

<style lang="sass">
@use '../styles/abstracts/colors' 
@use '../styles/abstracts/typography'
@use '../styles/components'

.table
	@include components.table

	&__container
		max-width: max-content
		padding: 20px
		margin: auto

	&__label
		display: flex
		column-gap: 10px
		align-items: center
		width: max-content

	&__shape
		margin-top: 10px

.company-picker
	@include components.company-picker

.button
	margin-top: 10px
	width: 200px
	@include components.button

	@media (max-width: 1000px)
		width: 100%


// @media (max-width: 450px)
// 	.buttons__container
// 		flex-direction: column
// 		row-gap: 10px

// 		.button
// 			width: 100%
</style>
