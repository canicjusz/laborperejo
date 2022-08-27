import { getData } from '$lib/utils';

export async function handle({ event, resolve }) {
	event.locals.user = await getData(`http://localhost:5000/api/profiles/mine`, true, {
		cookie: event.request.headers.get('cookie')
	});
	const response = await resolve(event);

	return response;
}

export async function getSession(event) {
	return event.locals.user;
}
