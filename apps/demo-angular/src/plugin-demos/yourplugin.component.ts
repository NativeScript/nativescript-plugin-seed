import { Component, NgZone } from '@angular/core';
import { DemoSharedYourplugin } from '@demo/shared';
import {} from '@nativescript/yourplugin';

@Component({
	selector: 'demo-yourplugin',
	templateUrl: 'yourplugin.component.html',
})
export class YourpluginComponent {
	demoShared: DemoSharedYourplugin;

	constructor(private _ngZone: NgZone) {}

	ngOnInit() {
		this.demoShared = new DemoSharedYourplugin();
	}
}
