<svelte:head>
	<title>Kontakto | Laborperejo</title>
	<meta name="description" content="Regularo de laborperejo" />
</svelte:head>
<div class="contact__container">
	<div class="contact">
		<h1 class="contact__title">Kontakto</h1>
		<p class="contact__paragraph">
			Ĉu vi vidas ke iu malobeas la regularon? Eble vi volas starigi demandon aŭ proponon? Sube
			estas diversaj manieroj por kontakti min:
		</p>
		<ul class="contact__list">
			<li>
				Retpoŝte:
				<ul class="contact__list">
					<li>Laborpereja retpoŝto: helpo@laborperejo.com</li>
					<li>Privata retpoŝto: janmichalak@int.pl</li>
				</ul>
			</li>
			<li>Diskorde: janomiĥalako#9984</li>
		</ul>
	</div>
</div>

<style lang="sass">
@use '../styles/components'

.contact
  @include components.info-page
</style>
