import { Component, OnInit } from '@angular/core';
import { CommonDataService } from '../../../service/common-data.service';
import { RequsetService } from '../../../service/requset.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-repair-add',
	templateUrl: './repair-add.component.html',
	styleUrls: ['./repair-add.component.scss']
})
export class RepairAddComponent implements OnInit {

	constructor(
		private common: CommonDataService,
		private message: NzMessageService,
        private Requset: RequsetService
	) { }

	isSpinning: boolean = false;
	adminList:Array<any> = []; // 管理员列表
	// 数据提交参数
	postData = {
		uid: '', // 序列号
		taobao_id: '', // 淘宝id
		order_id: '', // 物流单号
		reason: '', // 维修原因
		time: '无', // 保修时间
		state: '已收到包裹', // 维修状态
		finishRepair: '', // 交付时间
		repairList: '', // 物品清单
		money: '', // 维修金额
		error: '', // 出现的异常
		des: '', // 备注
		phone: '', // 联系电话
		maintenance_man: null // 维修人员
	};
	postDataCopy = JSON.parse(JSON.stringify(this.postData));
	ngOnInit() {
		this.searchAdminList();
	}
	// 查询管理员列表
	searchAdminList() {
		this.common.getAdminList$().subscribe(res => {
			this.adminList = res.content;
		});
	}
	// 交付时间修改
	applyTimeChange(event) {
		this.postData.finishRepair = this.common.formatNormalTime(event);
	}
	// 提交数据
	addRepairInfo() {
		if(this.postData.maintenance_man === null) {
			this.message.warning('请选择维修人员');
			return;
		}
		this.isSpinning = true;
		this.Requset.post$('repair/addRepairInfo',this.postData).subscribe(res => {
			this.isSpinning = false;
			this.postData = JSON.parse(JSON.stringify(this.postDataCopy));
			this.message.success('创建维修单成功');
		});
	}
}
