import { unlink } from 'fs/promises';

export async function removeFile(path) {
	try {
		await unlink(path);
	} catch (e) {
		console.log('Error removeFile', e.message);
	}
}

export const checkUserSession = (session, userId) => {
	if (!session) {
		session = {};
	}

	session[userId] = session[userId] || [];

	return session;
};

export const currentSessionConsole = (session, firstName, lastName) => {
	const lastNameText = lastName ? ' ' + lastName : '';
	console.log(`currentSession: ${firstName}${lastNameText}`, session);
};
