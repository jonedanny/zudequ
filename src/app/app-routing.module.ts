import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../app/login/login.component';
import { LayoutComponent } from '../app/layout/layout.component';

import { DataOverviewComponent } from '../app/pages/data-overview/data-overview.component';

import { ProductClassifyManagementComponent } from './pages/productManagement/product-classify-management/product-classify-management.component';
import { ProductAddComponent } from './pages/productManagement/product-add/product-add.component';
import { ProductSearchComponent } from './pages/productManagement/product-search/product-search.component';

import { OrderCreatComponent } from './pages/orderManagement/order-creat/order-creat.component';
import { OrderEditComponent } from './pages/orderManagement/order-edit/order-edit.component';
import { OrderFinishSearchComponent } from './pages/orderManagement/order-finish-search/order-finish-search.component';
import { OrderUnpayComponent } from './pages/orderManagement/order-unpay/order-unpay.component';

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
import { GameCustomerChooseComponent } from './pages/gameManager/game-customer-choose/game-customer-choose.component';

import { WechatActiveManagementComponent } from './pages/wechat/wechat-active-management/wechat-active-management.component';

const routes: Routes = [
	{ path:'', component:LoginComponent },
	{ path:'Login', component:LoginComponent },
	{ path:'main-container', component:LayoutComponent, children:[
		{ path: '', component: DataOverviewComponent },
		// 数据概览
		{ path: 'DataOverviewComponent', component: DataOverviewComponent },
		// 租赁管理
		{ path: 'LeaseInfoSupplement', component: LeaseInfoSupplementComponent },
		{ path: 'LeaseInfoView', component: LeaseInfoViewComponent },
		// 订单管理
		{ path: 'OrderCreat', component: OrderCreatComponent },
		{ path: 'OrderUnpay', component: OrderUnpayComponent },
		{ path: 'OrderEdit', component: OrderEditComponent },
		{ path: 'OrderFinishSearch', component: OrderFinishSearchComponent },
		// 销售管理
		{ path: 'SellCreat', component: SellCreatComponent },
		{ path: 'SoldDeviceList', component: SoldDeviceListComponent },
		// 商品管理
		{ path: 'ProductClassifyManagement', component: ProductClassifyManagementComponent },
		{ path: 'ProductAdd', component: ProductAddComponent },
		{ path: 'ProductSearch', component: ProductSearchComponent },
		// 游戏管理
		{ path: 'GameAdd', component: GameAddComponent },
		{ path: 'GameList', component: GameListComponent },
		{ path: 'GameOptionEdit', component: GameOptionEditComponent },
		{ path: 'GameCustomerChoose', component: GameCustomerChooseComponent },
		// 游戏设备维修
		{ path: 'RepairAdd', component: RepairAddComponent },
		{ path: 'RepairEdit', component: RepairEditComponent },
		{ path: 'CustomerRepairSearch', component: CustomerRepairSearchComponent },
		// 趣币管理
		{ path: 'QbEdit', component: QbEidtComponent },
		// 用户管理
		{ path: 'UserPowerManagement', component: UserProwerManagementComponent },
		{ path: 'UserListSearch', component: UserListSearchComponent },
		{ path: 'UserCreditSearch', component: UserCreditSearchComponent },
		// 微信小程序
		{ path: 'WechatActiveManagement', component: WechatActiveManagementComponent },
	] },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
