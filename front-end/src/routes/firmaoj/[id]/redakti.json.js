import { variables } from '$lib/variables';
import { getData } from '$lib/utils';

export const get = async ({ params, request }) => {
	const id = params.id;

	const {
		administrators,
		isOwner,
		isAdmin,
		created_at,
		offersNumber,
		offersOpenedNumber,
		...editable
	} = await getData(variables.base + `/api/companies/${id}`, true, {
		cookie: request.headers.get('cookie')
	});
	return {
		body: { isOwner, isAdmin, administrators, original: editable, id }
	};
};
