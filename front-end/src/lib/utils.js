import { get } from 'svelte/store';
import { error } from './stores';
import { getStores } from '$app/stores';

const extractErrors = (err) => {
	return err.inner.reduce((acc, err) => ({ ...acc, [err.path]: err.message }), {});
};

const onlyClosed = (offers) => offers.filter((offer) => offer.closed);

const onlyOpened = (offers) => offers.filter((offer) => !offer.closed);

const months = [
	'januaro',
	'februaro',
	'marto',
	'aprilo',
	'majo',
	'junio',
	'julio',
	'aŭgusto',
	'septembro',
	'oktobro',
	'novembro',
	'decembro'
];

const getDate = (string) => {
	const date = new Date(string);
	const year = date.getFullYear();
	const monthIndex = date.getMonth();
	const day = date.getDate();
	return `la ${day}-an de ${months[monthIndex]} ${year}`;
};

const getData = async (url, withCredentials = false, headers) => {
	const opts = {
		method: 'GET',
		credentials: withCredentials ? 'include' : 'omit',
		headers
	};
	return await fetch(url, opts).then(async (res) => {
		const JSONResponse = await res.json();
		if (res.ok) return JSONResponse;
		throw JSONResponse;
	});
};

const deleteData = async (url, withCredentials = false, headers) => {
	const opts = {
		method: 'DELETE',
		credentials: withCredentials ? 'include' : 'omit',
		headers
	};
	return await fetch(url, opts).then(async (res) => {
		const JSONResponse = await res.json();
		if (res.ok) return JSONResponse;
		throw JSONResponse;
	});
};

const postData = async (url, data = {}, withCredentials = false, headers) => {
	const opts = {
		method: 'POST',
		credentials: withCredentials ? 'include' : 'omit',
		body: data,
		headers
	};
	return await fetch(url, opts).then(async (res) => {
		const JSONResponse = await res.json();
		if (res.ok) return JSONResponse;
		throw JSONResponse;
	});
};

const putData = async (url, data = {}, withCredentials = false, headers) => {
	const opts = {
		method: 'PUT',
		credentials: withCredentials ? 'include' : 'omit',
		body: data,
		headers
	};
	return await fetch(url, opts).then(async (res) => {
		const JSONResponse = await res.json();
		if (res.ok) return JSONResponse;
		throw JSONResponse;
	});
};

const changeObservationCreator = () => {
	const { session } = getStores();
	return (ID, offer) => {
		let watchlist = get(session).watchlist;
		const isWatched = watchlist.some((offer) => offer.ID === ID);
		if (isWatched) {
			deleteData(`http://localhost:5000/api/offers/${ID}/follow`, true)
				.then(() => {
					const offerIndex = watchlist.findIndex((offer) => offer.ID === ID);
					watchlist.splice(offerIndex, 1);
					session.update((u) => {
						u.watchlist = watchlist;
						return u;
					});
				})
				.catch(error.change);
		} else {
			postData(`http://localhost:5000/api/offers/${ID}/follow`, {}, true)
				.then(() => {
					watchlist.push({
						ID,
						company: {
							logo: offer.company.logo
						},
						title: offer.title,
						closed: offer.closed,
						close_at: offer.close_at
					});
					session.update((u) => {
						u.watchlist = watchlist;
						return u;
					});
				})
				.catch(error.change);
		}
	};
};

const generateNavigation = (pages, currentPage) => {
	if (pages < 1) return [];
	const visiblePages = [currentPage];
	while (visiblePages.length < pages && visiblePages.length < 5) {
		const firstElement = visiblePages[0];
		const lastElement = visiblePages[visiblePages.length - 1];
		if (firstElement > 1) {
			visiblePages.unshift(firstElement - 1);
		}
		if (lastElement < pages) {
			visiblePages.push(lastElement + 1);
		}
	}
	return visiblePages;
};

const convertDate = (date) =>
	new Date(date.getTime() + date.getTimezoneOffset() * -60 * 1000)
		.toISOString()
		.trim()
		.slice(0, 16);

export {
	extractErrors,
	onlyClosed,
	onlyOpened,
	getDate,
	changeObservationCreator,
	getData,
	deleteData,
	postData,
	putData,
	generateNavigation,
	convertDate
};
