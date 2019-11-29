import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-repair-edit',
  templateUrl: './repair-edit.component.html',
  styleUrls: ['./repair-edit.component.scss']
})
export class RepairEditComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
  ) { }
  
	tableScroll = { y: `${document.body.clientHeight -330}px`, x: '3550px' };
	visible: boolean = false;
	displayCompleteColumn: boolean = false;
	adminList; // 管理员列表
	chooseId = null; // 完成或删除的订单
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		taobao_id: '',
		order_id: '',
		state: '',
		isFinished: '0'
	};
	// 选择需要编辑的信息
	selectData = null;
	ngOnInit() {
		this.common.initData(() => {
			this.adminList = this.common.adminList;
			this.search();
		});
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('repair/searchApplyList',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	// 交付时间修改
	applyTimeChange(event) {
		this.selectData.finishRepair = this.common.formatNormalTime(event);
	}
	// 获取编辑信息
	edit(item) {
		this.visible = true;
		this.selectData = {
			id: item.id,
			taobao_id: item.taobao_id,
			order_id: item.order_id,
			reason: item.reason,
			state: item.state,
			time: item.time,
			des: item.des,
			repairList: item.repairList,
			money: item.money,
			finishRepair: item.finishRepair === '0000-00-00' || null ? null : item.finishRepair,
			error: item.error,
			uid: item.uid,
			phone: item.phone,
			creat_time: item.creat_time,
			maintenance_man: item.maintenance_man
		}
	}
	// 保存修改
	save() {
		this.loading = true;
		this.Requset.post$('repair/modifyRepairInfo',this.selectData).subscribe(res => {
			if(res){
				this.message.success('修改成功');
				this.search();
			}
			this.visible = false;
			this.loading = false;
		});
	}
	// 完成维修单
	completeRepairWarning(item) {
		this.chooseId = item.id;
		this.displayCompleteColumn = true;
	}
	// 打印
	print(item) {
		console.log(item);
		item.maintenance_man = this.systemIdChange(item.maintenance_man);
		sessionStorage.setItem('print_content',JSON.stringify(item));
		window.open('../../../assets/print/repairPrint.html');
	}
	completeRepair() {
		this.loading = true;
		this.Requset.post$('repair/finiedRepairOrder',{id: this.chooseId}).subscribe(res => {
			if(res) {
				this.message.success(`维修单 ID:${this.chooseId} 已完成`);
				this.search();
			}
			this.displayCompleteColumn = false;
			this.loading = false;
		});
	}
	// 系统管理员 ID -> name
	systemIdChange(id) {
		for(let i = 0,r = this.adminList.length;i < r; i++){
			if(this.adminList[i].id == id) {
				return this.adminList[i].name;
			}
		}
	}
}
