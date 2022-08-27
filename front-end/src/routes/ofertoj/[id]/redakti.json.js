import { getData, convertDate } from '$lib/utils';

export const get = async ({ params, request }) => {
	const id = params.id;

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowFormated = convertDate(tomorrow);

	const { company_ID, company, isOwner, close_at, ID, ...editable } = await getData(
		`http://localhost:5000/api/offers/${id}`,
		true,
		{
			cookie: request.headers.get('cookie')
		}
	);

	editable.close_at = close_at ? convertDate(new Date(close_at)) : tomorrowFormated;

	return {
		body: { isOwner, company, editable, id, tomorrowFormated }
	};
};