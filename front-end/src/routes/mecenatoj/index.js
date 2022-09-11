import { getData } from '$lib/utils';
import { variables } from '$lib/variables';

export const GET = async () => {
	const res = await getData(variables.base + `/api/patrons`, false);
	return {
		body: { patrons: res }
	};
};
