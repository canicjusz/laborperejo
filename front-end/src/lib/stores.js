import { writable } from 'svelte/store';

let num = 0;

export const user = writable(undefined);
function createError() {
	const { subscribe, set } = writable(undefined);

	return {
		subscribe,
		change: (err) => {
			set({
				content: err.content,
				alertID: num++
			});
		}
	};
}
function createFeedback() {
	const { subscribe, set } = writable(undefined);

	return {
		subscribe,
		change: (feedback) => {
			set({ content: feedback.content, alertID: num++ });
		}
	};
}

export const feedback = createFeedback();
export const error = createError();
