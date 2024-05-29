import { getData } from '$lib/utils';
import { variables } from '$lib/variables';

export async function handle({ event, resolve }) {
	event.locals.user = await getData(variables.base + `/api/profiles/mine`, true, {
		cookie: event.request.headers.get('cookie')
	}).catch(() => {});
	const response = await resolve(event);
	return response;
}

export async function getSession(event) {
	return event.locals.user;
}
