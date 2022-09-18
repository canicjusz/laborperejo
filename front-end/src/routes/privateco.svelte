<svelte:head>
	<title>Privateca Politiko | Laborperejo</title>
	<meta name="description" content="Privateca politiko de laborperejo." />
</svelte:head>
<div class="privacy__container">
	<div class="privacy">
		<h1 class="privacy__title">Privateca Politiko</h1>
		<p class="privacy__paragraph">
			La jena dokumento priskribas kiajn informojn ni kolektas, kiel ni kolektas ilin kaj kiel vi
			povas ŝanĝi/forigi ilin.
		</p>
		<h2 class="privacy__section-title">Kolektataj datenoj</h2>
		<h3 class="privacy__sub-section-title">Informoj provizitaj de vi</h3>
		<p class="privacy__paragraph">
			Je registriĝo vi provizas al ni vian plenan nomon, loĝlokon, parolatajn lingvojn,
			retpoŝtadreson kaj pasvorton. Via nomo, loĝloko kaj parolataj lingvoj estos uzitaj por krei
			profilon.
		</p>
		<p class="privacy__paragraph">
			Vi povas redakti vian profilon kaj memvole aldoni personan priskribon, vivresumon,
			profilbildon,serĉatan postenon, korespondan retpoŝtadreson, telefonnumeron kaj ligilojn al
			sociretejoj. Profilaj informoj estas videblaj de ĉiu.
		</p>
		<h3 class="privacy__sub-section-title">Informoj aŭtomate kolektitaj</h3>
		<p class="privacy__paragraph">
			Je ĉiu ensaluto kreiĝas kuketo, malgranda dosiero en retumilo, kiu disponigas datenojn al
			servilo. La kuketo enhavas viajn ensalutajn infojmojn, kiuj ebligos la servilon aŭtomate
			ensaluti uzanton. Se vi elektas "Memori min", la kuketo daŭros 90 tagojn, se ne, ĝi foriĝos
			tuj post fermiĝo de retumilo.
		</p>
		<h2 class="privacy__section-title">Celo de kolektado</h2>
		<p>
			Viaj datenoj estas utiligataj nur por funkciado de niaj servoj, ekzemple ĉi tiu retejo aŭ
			retpoŝto-dissendado. Neniu el viaj datenoj estas vendataj al eksteraj liverantoj.
		</p>
		<h2 class="privacy__section-title">Servoj de eksteraj liverantoj</h2>
		<p>
			Ni uzas servojn de Amazon Web Services kaj Zoho por retpoŝto-dissendado. Notinde estas ke tiuj
			ĉi liverantoj ankaŭ pritraktas viajn datenojn.
		</p>
		<h2 class="privacy__section-title">Forigo aŭ ŝanĝo de informoj</h2>
		<p class="privacy__paragraph">
			Vi povas peti nin aktualigi viajn datenojn (ekz. retpoŝtadreson uzatan por ensaluti), forigi
			viajn datenoj (sen ajna kialigo), aŭ raporti ŝajnigon de vi, via firmao. Oni povas kontakti
			nin interrete per helpo@laborperejo.com.
		</p>
	</div>
</div>

<style lang="sass">
@use '../styles/abstracts/typography'
@use '../styles/components'

.privacy
	@include components.info-page

	&__section-title, &__sub-section-title
		font-family: typography.$raleway

	&__section-title, &__sub-section-title
		margin: 15px 0

	&__section-title
		font-size: typography.$middle

	&__sub-section-title
		font-size: typography.$normal


</style>
