import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
	selector: 'app-order-real-refund',
	templateUrl: './order-real-refund.component.html',
	styleUrls: ['./order-real-refund.component.scss']
})
export class OrderRealRefundComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1300px' };
	result = []; // 查询结果
	adminList; // 管理员列表
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		status: '',
		orderId: ''
	};
	visible: boolean = false; // 退款确认
	refundItem: any = {};

	ngOnInit() {
		this.search();
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('ordermanager/searchRefundList', this.fillterData).subscribe(res => {
			if (res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	// 退款
	refundColumn(item) {
		this.refundItem = item;
		this.visible = true;
	}
	refund() {
		this.loading = true;
		var data = {
			"version":"1.0",
			"modular":"pay",
			"requestname":"wechatPreRefund",
			"param":{
				"id": this.refundItem.id // 退款单ID 必传
			}
		}
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			if(res) {
				this.message.success('退款成功');
				this.search();
			}
			this.loading = false;
			this.visible = false;
		});
	}
}
