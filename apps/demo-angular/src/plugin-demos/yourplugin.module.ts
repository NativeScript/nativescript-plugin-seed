import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { YourpluginComponent } from './yourplugin.component';

@NgModule({
	imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: YourpluginComponent }])],
	declarations: [YourpluginComponent],
	schemas: [NO_ERRORS_SCHEMA],
})
export class YourpluginModule {}
