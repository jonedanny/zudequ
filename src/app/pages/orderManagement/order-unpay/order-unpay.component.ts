import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-order-unpay',
	templateUrl: './order-unpay.component.html',
	styleUrls: ['./order-unpay.component.scss']
})
export class OrderUnpayComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '2100px' };
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
		sort: null,
	};
	fillterDataCopy = JSON.parse(JSON.stringify(this.fillterData));
	departmentList = null; // 部门列表
	orderDetail = []; // 订单明细
	editData = null;
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
