import { Observable } from '@nativescript/core';
import { Utils } from './utils';

export class YourpluginCommon extends Observable {
	public message: string;

	constructor() {
		super();
		this.message = Utils.SUCCESS_MSG();
	}

	public greet() {
		return 'Hello, NS7';
	}
}
