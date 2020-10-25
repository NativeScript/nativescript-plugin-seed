import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedYourplugin } from '@demo/shared';
import {} from '@nativescript/yourplugin';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedYourplugin {}
