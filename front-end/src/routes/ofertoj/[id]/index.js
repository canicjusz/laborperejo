import { getData } from '$lib/utils';
import { variables } from '$lib/variables';

export const GET = async ({ params, request }) => {
	//${url.host}
	const res = await getData(variables.base + `/api/offers/${params.id}`, true, {
		cookie: request.headers.get('cookie')
	});
	return {
		body: { offer: res }
	};
};
