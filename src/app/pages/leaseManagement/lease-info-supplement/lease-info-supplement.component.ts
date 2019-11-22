import { Component, OnInit } from '@angular/core';
import { CommonDataService } from '../../../service/common-data.service';
import { RequsetService } from '../../../service/requset.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-lease-info-supplement',
	templateUrl: './lease-info-supplement.component.html',
	styleUrls: ['./lease-info-supplement.component.scss']
})
export class LeaseInfoSupplementComponent implements OnInit {

	constructor(
		private common: CommonDataService,
		private message: NzMessageService,
        private Requset: RequsetService
	) { }

	deviceList:Array<any> = []; // 设备列表
	adminList:Array<any> = []; // 管理员列表

	submitLoading:boolean = false; // 提交数据loading

	submitData = {
		userId : null, // 管理员 ID
		deviceId : null, // 设备ID
		deviceName : '', // 设备名称
		leaseMoney :0, // 租金
		leaseDay : 0, // 租赁天数
		startTime :'', // 租赁起始日
		endTime : '', // 租赁结束日
		des : '', // 租赁备注
		outPrice : 0, // 租金/天
		otherPrice : 0, // 装配费等其他费用
		expectLease : 0, // 预计租金
		orderId: '' // 订单ID
	}

	baseData = JSON.parse(JSON.stringify(this.submitData));

	ngOnInit() {
		this.searchAdminList();
	}
	// 选择设备
	selectedDevice() {
		// 查询设备租金
		for(let i = 0,r = this.deviceList.length; i < r; i++) {
			if(this.deviceList[i].id === this.submitData.deviceId) {
				this.submitData.outPrice = this.deviceList[i].out_price;
				this.submitData.deviceName = this.deviceList[i].name;
				break;
			}
		}
		this.calcExpectLease();
	}
	// 查询设备列表
	searchDeviceList() {
		this.common.getDeviceList(this.submitData.userId).subscribe(res => {
			this.deviceList = this.common.jsonSort(res.content,'name',false);
			console.log(this.deviceList);
		});
	}
	// 查询管理员列表
	searchAdminList() {
		this.common.getAdminList$().subscribe(res => {
			this.adminList = res.content;
		});
	}
	// 日期更改
	onChangeTime(result: Date): void {
		this.submitData.startTime = this.common.formatTime(result[0]);
		this.submitData.endTime = result[1] ? this.common.formatTime(result[1]) : '';
		// 计算天数
		if(result[1]) {
			const ds = Number(new Date(this.submitData.startTime).getTime()) / 1000;
			const de = Number(new Date(this.submitData.endTime).getTime()) / 1000;
			const days = (de - ds) / 60 / 60 / 24;
			this.submitData.leaseDay = days;
		}
		else {
			this.submitData.leaseDay = 0;
		}
		this.calcExpectLease();
	}
	// 预计租金计算
	calcExpectLease() {
		this.submitData.expectLease = Number((this.submitData.outPrice * this.submitData.leaseDay).toFixed(2));
	}
	// 计算其他费用
	calcOtherFee() {
		this.submitData.otherPrice = Number((this.submitData.expectLease - this.submitData.leaseMoney).toFixed(2));
	}
	// 提交补录信息
	submitForm() {
		const data = {
			userId: this.submitData.userId,
			deviceId: this.submitData.deviceId,
			deviceName: this.submitData.deviceName,
			leaseStart: this.submitData.startTime,
			leaseEnd: this.submitData.endTime,
			des: this.submitData.des,
			leaseDay: this.submitData.leaseDay,
			otherPrice: this.submitData.otherPrice,
			leasePrice: this.submitData.leaseMoney,
			orderId: this.submitData.orderId,
			is_pay: 1
		}
		
		if(data.userId === null){
			this.message.error('请选择出租人');
            return;
		}
		if(data.deviceId === null){
			this.message.error('请选择设备');
            return;
		}
		if(data.leasePrice <= 1 || !data.leasePrice){
			this.message.error('请输入租金');
            return;
		}
		if(data.leaseStart === '' || data.leaseEnd === ''){
			this.message.error('请选择租赁时间');
            return;
		}
		if(data.orderId === ''){
			this.message.error('请输入订单ID');
            return;
		}
		console.log('[补录提交信息]',data);
		this.submitLoading = true;
		this.Requset.post$('devicemanager/inserDeviceLeaseInfo',data).subscribe(res => {
			this.message.success('数据补录成功');
			// 添加租金明细
			const oth_data = {
				user_id: this.submitData.userId,
				device_id: this.submitData.deviceId,
				profit: this.submitData.leaseMoney
			};

			this.Requset.post$('devicemanager/addLeaseDetail',oth_data).subscribe(res => {
				this.message.success('租金明细添加成功');
				this.submitData = JSON.parse(JSON.stringify(this.baseData));
				this.submitLoading = false;
			});
		});
	}
}
