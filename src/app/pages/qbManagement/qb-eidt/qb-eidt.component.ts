import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
	selector: 'app-qb-eidt',
	templateUrl: './qb-eidt.component.html',
	styleUrls: ['./qb-eidt.component.scss']
})
export class QbEidtComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }

	qbModifyDisplay: boolean = false;
	visible: boolean = false;
	tableScroll = { y: `${document.body.clientHeight - 330}px`, x: '950px' };
	result = []; // 查询结果
	currentQbHistory = null; // 历史趣币变动结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		username: '',
		sort: null
	};
	// 提交的数据
	operation = {
		id: null,
		coins: null,
		action: '0',
		value: 0,
		username: '',
		resource: '0',
		deduction: null,
		pay: 0,
		reason: null,
	}
	operationCopy = JSON.parse(JSON.stringify(this.operation));
	ngOnInit() {
		this.common.initData(() => {
			this.searchData();
		});
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('qbmodifymanager/searchCustomerUserForCoins', this.fillterData).subscribe(res => {
			if(res){
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	showQbModifyColumn(item) {
		this.operation = JSON.parse(JSON.stringify(this.operationCopy));
		this.qbModifyDisplay = true;
		this.operation.username = item.username;
		this.operation.id = item.id;
		this.operation.coins = item.coins;
	}
	// 趣币修改
	qbModify() {
		if(!Number(this.operation.value) || Number(this.operation.value) <= 0 ) {
			this.message.warning('请填写趣币');
			return;
		}
		if(this.operation.action === '1') {
			if(Number(this.operation.value) > Number(this.operation.coins)) {
				this.message.warning('减少的趣币不能小于用户当前趣币数量');
				return;
			}
			this.operation.pay = 0;
		}
		this.loading = true;
		this.Requset.post$('qbmodifymanager/modifyQbNumber', this.operation).subscribe(res => {
			if(res){
				this.message.success('修改成功');
				this.searchData();
			}
			this.loading = false;
			this.qbModifyDisplay = false;
		});
	}
	// 查询用户历史趣币修改
	searchUserQbHistory(item) {
		this.loading = true;
		this.Requset.post$('qbmodifymanager/searchUserQbHistory', {username: item.username}).subscribe(res => {
			if(res) {
				this.currentQbHistory = res.content.reverse();
			}
			this.visible = true;
			this.loading = false;
		});
	}
	// 搜索
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
	// 修改实付
	innerPay() {
		setTimeout(() => {
			this.operation.pay = Number(this.operation.value) / 10;
		},50);
	}
}
