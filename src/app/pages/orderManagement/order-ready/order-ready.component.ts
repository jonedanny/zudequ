import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-order-ready',
	templateUrl: './order-ready.component.html',
	styleUrls: ['./order-ready.component.scss']
})
export class OrderReadyComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '2250px' };

	result = []; // 查询结果
	adminList; // 管理员列表
	storeList = []; // 店铺来源列表
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		origin: '',
		des: '',
		status: '', // 订单状态 1: 未付款 2: 已付款
		sort: null,
	};
	fillterDataCopy = JSON.parse(JSON.stringify(this.fillterData));
	departmentList = null; // 部门列表
	orderDetail = []; // 订单明细
	editData = null;
	customerAddress: any = {}; // 用户地址
	visible: boolean = false; // 装配框显示
	fitOutList: any = []; // 装配列表
	currentOrder: any = null;

	ngOnInit() {
		this.common.initData(() => {
			this.departmentList = this.common.departmentList;
			this.adminList = this.common.adminList;
			this.storeList = this.common.store;
			this.search();
		});
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('ordermanager/searchUnpayOrderList', this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
			console.log(this.result);
		});
	}
	// 查看订单明细
	viewOrderDetail(event,item,viewAll,callback = function(){}) {
		this.orderDetail = [];
		if(event) {
			this.Requset.post$('ordermanager/viewOrderDetail', {cid: item.id, viewAll: viewAll}).subscribe(res => {
				console.log(res);
				this.orderDetail = res.content;
				callback();
			});
		}
	}
	// 查看装配列表
	fitOut(item) {
		this.loading = true;
		this.currentOrder = item;
		this.Requset.post$('ordermanager/viewOrderDetail', {cid: item.id, viewAll: true}).subscribe(res => {
			console.log(res);
			this.visible = true;
			this.loading = false;
			this.fitOutList = res.content;
		});
	}
	// 装配
	fitOutItem(item) {
		this.loading = true;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"sweepCode",
			"param": {
				"id": item.cid, // 订单ID必传
				"did": item.id, // 明细ID （在确定替换某个明细的时候传）
				"productName":  item.p_name // 扫码设备名称 必选
			}
		}
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			this.loading = false;
			if (res) {
				this.message.success('装配成功');
				for (let i = 0, r = this.fitOutList.length; i < r; i++) {
					if(this.fitOutList[i].id === res.content.id.toString()) {
						this.fitOutList[i].pid = res.content.pid;
						break;
					}
				}
			}
		});
	}
	// 查看地址明细
	viewAddressDetail(event,item) {
		this.customerAddress = {};
		if (event) {
			if (item.address_id === '0') {
				this.customerAddress.address = '门店自提';
			} else {
				// 请求后台接口 查询客户地址
				this.Requset.post$('ordermanager/searchCustomerAddress', {id: item.address_id}).subscribe(res => {
					const data = res.content[0];
					this.customerAddress.address = `${data.province} ${data.city} ${data.area} ${data.address}`;
					this.customerAddress.name = data.lname;
					this.customerAddress.phone = data.lphone;
				});
			}
		}
	}
	// 发货
	outItem() {
		console.log(this.currentOrder);
		this.loading = true;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"deliverGoods",
			"param": {
				"id": this.currentOrder.id // 订单ID必传
			}
		}
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			this.loading = false;
			this.visible = false;
			this.message.success('发货成功');
			this.search();
		});
	}
	// 排序
	sort(sort: { key: string; value: string }): void {
		console.log(sort);
		this.fillterData.sort = sort;
		this.search();
	}
	__departmentText(value) {
		for (let i = 0, r = this.departmentList.length; i < r; i++) {
			if (this.departmentList[i].id === value) {
				return this.departmentList[i].name;
			}
		}
	}
}
