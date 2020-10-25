import { Yourplugin } from '@nativescript/yourplugin';
import { DemoSharedBase } from '../utils';

export class DemoSharedYourplugin extends DemoSharedBase {
	private yourplugin: Yourplugin;

	constructor() {
		super();
		this.yourplugin = new Yourplugin();
	}

	testIt() {
		console.log('test yourplugin!');
		let message = this.yourplugin.message;

		console.log('Your message is', message);
	}
}
