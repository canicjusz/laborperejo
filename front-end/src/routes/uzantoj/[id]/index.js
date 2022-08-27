import { getData } from '$lib/utils';

export const get = async ({ params, request }) => {
	//${url.host}
	const res = await getData(`http://localhost:5000/api/profiles/${params.id}`, true, {
		cookie: request.headers.get('cookie')
	});
	return {
		body: { user: res }
	};
};
