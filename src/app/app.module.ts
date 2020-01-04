import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import zh from '@angular/common/locales/zh';

import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';

import { DataOverviewComponent } from './pages/data-overview/data-overview.component';

import { ProductClassifyManagementComponent } from './pages/productManagement/product-classify-management/product-classify-management.component';
import { ProductAddComponent } from './pages/productManagement/product-add/product-add.component';
import { ProductSearchComponent } from './pages/productManagement/product-search/product-search.component';

import { OrderCreatComponent } from './pages/orderManagement/order-creat/order-creat.component';
import { OrderEditComponent } from './pages/orderManagement/order-edit/order-edit.component';
import { OrderFinishSearchComponent } from './pages/orderManagement/order-finish-search/order-finish-search.component';

import { QbEidtComponent } from './pages/qbManagement/qb-eidt/qb-eidt.component';

import { UserProwerManagementComponent } from './pages/userManagement/user-prower-management/user-prower-management.component';
import { UserListSearchComponent } from './pages/userManagement/user-list-search/user-list-search.component';
import { UserCreditSearchComponent } from './pages/userManagement/user-credit-search/user-credit-search.component';

import { LeaseInfoSupplementComponent } from './pages/leaseManagement/lease-info-supplement/lease-info-supplement.component';
import { LeaseInfoViewComponent } from './pages/leaseManagement/lease-info-view/lease-info-view.component';

import { RepairAddComponent } from './pages/repairManager/repair-add/repair-add.component';
import { RepairEditComponent } from './pages/repairManager/repair-edit/repair-edit.component';
import { CustomerRepairSearchComponent } from './pages/repairManager/customer-repair-search/customer-repair-search.component';

import { SellCreatComponent } from './pages/sellManager/sell-creat/sell-creat.component';
import { SoldDeviceListComponent } from './pages/sellManager/sold-device-list/sold-device-list.component';

import { GameAddComponent } from './pages/gameManager/game-add/game-add.component';
import { GameListComponent } from './pages/gameManager/game-list/game-list.component';
import { GameOptionEditComponent } from './pages/gameManager/game-option-edit/game-option-edit.component';

import { WechatActiveManagementComponent } from './pages/wechat/wechat-active-management/wechat-active-management.component';


registerLocaleData(zh);

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		LayoutComponent,
		DataOverviewComponent,
		ProductClassifyManagementComponent,
		ProductAddComponent,
		ProductSearchComponent,
		OrderCreatComponent,
		OrderEditComponent,
		OrderFinishSearchComponent,
		QbEidtComponent,
		UserProwerManagementComponent,
		UserListSearchComponent,
		UserCreditSearchComponent,
		LeaseInfoSupplementComponent,
		LeaseInfoViewComponent,
		RepairAddComponent,
		RepairEditComponent,
		CustomerRepairSearchComponent,
		SellCreatComponent,
		SoldDeviceListComponent,
		GameAddComponent,
		GameListComponent,
		GameOptionEditComponent,
		WechatActiveManagementComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		NgZorroAntdModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		NgxEchartsModule,
		NzPopoverModule,
		NzButtonModule
	],
	providers: [
		{ provide: NZ_I18N, useValue: zh_CN },
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
