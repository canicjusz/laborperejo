import { getData } from '$lib/utils';
import { variables } from '$lib/variables';

export const get = async () => {
	console.log('1');
	const res = await getData(variables.base + `/api/patrons`, false);
	console.log(res, 'xD');
	return {
		body: { patrons: res }
	};
};
