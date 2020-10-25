import { Application, Dialogs, Observable } from '@nativescript/core';

export class UtilsCommon extends Observable {
	public static SUCCESS_MSG(): string {
		let msg = `Your plugin is working on ${Application.android ? 'Android' : 'iOS'}.`;

		setTimeout(() => {
			Dialogs.alert(`${msg} For real. It's really working :)`).then(() => console.log(`Dialog closed.`));
		}, 2000);

		return msg;
	}
}
