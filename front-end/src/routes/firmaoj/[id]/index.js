import { getData } from '$lib/utils';
import { variables } from '$lib/variables';

export const get = async ({ params, request }) => {
	const id = params.id;

	const company = await getData(variables.base + `/api/companies/${id}`, true, {
		cookie: request.headers.get('cookie')
	});

	const { offers, pages } = await getData(variables.base + `/api/offers?de=${id}&p=1`);

	return {
		body: { company, offers, pages, id }
	};
};
