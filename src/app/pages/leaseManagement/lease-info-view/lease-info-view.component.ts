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
	
	tableScroll = {y: `${document.body.clientHeight - 350}px`, x: '2100px'};
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
	errorDesVisible = false;
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
	estimateMoney = 0; // 系统估计的租金
	errorOrderDes = ''; // 异常备注
	recovery:boolean = false; // 设备是否已收回本金
	recoveryLoading:boolean = false;
	currentRecovery:any = null;

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
		this.estimateMoney = item.lease_price;
		this.visible = true;
		this.recoveryLoading = true;
		this.currentRecovery = null;
		// 查询设备租金
		this.Requset.post$('devicemanager/searchDevice', {
			id: item.device_id,
			rows: 1,
			page: 1,
			name: "",
			des: "",
			origin:null,
			price: "",
			status: "-1"
		}).subscribe(res => {
			console.log(res);
			const data = res.content[0];
			this.currentRecovery = data;
			this.recovery = Number(data.ljsy) >= Number(data.price) ? true : false;
			this.recoveryLoading = false;
		});
	}
	// 异常订单备注
	errorDes(item) {
		this.currentPayData = item;
		this.errorDesVisible = true;
	}
	submitErrorDes() {
		this.loading = true;
		var data = {
			errorOrderDes: this.errorOrderDes,
			id: this.currentPayData.id
		};
		this.Requset.post$('devicemanager/updateErrorDes',data).subscribe(() => {
			this.message.success('备注成功');
			this.searchData();
			this.loading = false;
			this.errorDesVisible = false;
			this.errorOrderDes = '';
		});
	}
	// 租金更改
	changeMoney() {
		console.log(this.payData.lease_price, this.estimateMoney);
		this.payData.other_price =  Number(this.estimateMoney) - Number(this.payData.lease_price);
		this.payData.other_price > 0 ? this.payData.other_price : 0;
	}
	onTimeChange(event) {
		if(event.length === 0){
			this.payData.lease_day = 0;
			this.payData.lease_start = '';
			this.payData.lease_end = '';
		} else {
			this.payData.lease_start = this.common.formatNormalTime(event[0]);
			this.payData.lease_end = this.common.formatNormalTime(event[1]);
			this.payData.lease_day = this.common.DateDiffNormal(this.payData.lease_start,this.payData.lease_end);
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
