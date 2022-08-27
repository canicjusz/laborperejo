import { getData } from '$lib/utils';

export const get = async ({ params, request }) => {
	const id = params.id;

	const company = await getData(`http://localhost:5000/api/companies/${id}`, true, {
		cookie: request.headers.get('cookie')
	});

	const { offers, pages } = await getData(`http://localhost:5000/api/offers?de=${id}&p=1`);

	return {
		body: { company, offers, pages, id }
	};
};
