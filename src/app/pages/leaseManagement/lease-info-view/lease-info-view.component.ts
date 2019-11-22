import { Component, OnInit } from '@angular/core';
import { CommonDataService } from '../../../service/common-data.service';
import { RequsetService } from '../../../service/requset.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-lease-info-view',
  templateUrl: './lease-info-view.component.html',
  styleUrls: ['./lease-info-view.component.scss']
})
export class LeaseInfoViewComponent implements OnInit {

	constructor(
		private message: NzMessageService,
		private common: CommonDataService,
		private Requset: RequsetService
	) { }
	
	tableScroll = {y: `${document.body.clientHeight - 400}px`, x: '1730px'};
	dateFormat = 'yyyy/MM/dd';
	result = []; // 查询结果
	adminList; // 管理员列表
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		deviceName: '',
		leaseStart: '',
		leaseEnd: '',
		relativePeople: null,
		orderId: null,
		sort: null
	};
	currentPayData = null;
	visible = false;
	payData = {
		id: null,
		lease_day: 0,
		lease_price: 0,
		other_price: 0,
		lease_start: '',
		lease_end: '',
		des: ''
	}
	payDataCopy = JSON.parse(JSON.stringify(this.payData));
	deviceLeaseMoney = 0;
	estimateMoney = 0;
	ngOnInit() {
		this.common.initData(() => {
			this.adminList = this.common.adminList;
			this.searchData();
		});
	}
	// 过滤日期更改
	onChangeFilterTime(result: Date): void {
		this.fillterData.leaseStart = this.common.formatTime(result[0]);
		this.fillterData.leaseEnd = result[1] ? this.common.formatTime(result[1]) : '';
	}
	searchData() {
		this.Requset.post$('devicemanager/searchDeviceLeaseInfo',this.fillterData).subscribe(res => {
			this.result = res.content;
			this.total = res.total;
			this.loading = false;
		});
	}
	search() {
		this.fillterData.page = 1;
		this.fillterData.rows = 25;
		this.searchData();
	}
	// 排序
	sort(sort: { key: string; value: string }): void {
		console.log(sort);
		this.fillterData.sort = sort;
		this.search();
	}
	// 支付租金
	payRentDisplay(item) {
		this.currentPayData = item;
		this.currentPayData.ranges = [item.lease_start,item.lease_end];
		this.payData.id = item.id;
		this.payData.lease_day = this.common.DateDiffNormal(item.lease_start,item.lease_end);
		this.payData.lease_start = item.lease_start;
		this.payData.lease_end = item.lease_end;
		this.loading = true;
		// 查询设备租金
		this.Requset.post$('ordermanager/searchDeviceForId', {
			id: item.device_id
		}).subscribe(res => {
			console.log(res);
			this.loading = false;
			this.visible = true;
			this.deviceLeaseMoney = res.content[0].out_price;
			this.estimateMoney = Number(this.deviceLeaseMoney) * Number(this.payData.lease_day);
		});
		console.log(item);
	}
	// 租金更改
	changeMoney() {
		this.payData.other_price = Number(this.estimateMoney) - Number(this.payData.lease_price);
	}
	onTimeChange(event) {
		if(event.length === 0){
			this.payData.lease_day = 0;
			this.payData.lease_price = 0;
			this.payData.other_price = 0;
			this.payData.lease_start = '';
			this.payData.lease_end = '';
		} else {
			this.payData.lease_start = this.common.formatNormalTime(event[0]);
			this.payData.lease_end = this.common.formatNormalTime(event[1]);
			this.payData.lease_day = this.common.DateDiffNormal(this.payData.lease_start,this.payData.lease_end);
			this.estimateMoney = Number(this.deviceLeaseMoney) * Number(this.payData.lease_day);
			this.changeMoney();
		}
	}
	// 更新订单数据
	payRent() {
		this.loading = true;
		this.changeMoney();
		setTimeout(() => {
			this.Requset.post$('devicemanager/updateLease',this.payData).subscribe(() => {
				this.message.success(`租赁单: ${this.payData.id} -- 支付成功`);
				this.searchData();
				this.loading = false;
				this.visible = false;
	
				// 添加租金明细
				const oth_data = {
					user_id: this.currentPayData.lease_origin_user_id,
					device_id: this.currentPayData.device_id,
					profit: this.payData.lease_price
				};
	
				this.Requset.post$('devicemanager/addLeaseDetail',oth_data).subscribe(res => {
					this.payData = JSON.parse(JSON.stringify(this.payDataCopy));
					this.message.success('租金明细添加成功');
				});
			});
		}, 200);
	}
}
