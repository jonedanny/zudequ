import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-user-prower-management',
  templateUrl: './user-prower-management.component.html',
  styleUrls: ['./user-prower-management.component.scss']
})
export class UserProwerManagementComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService,
		private modal: NzModalService
	) { }
	confirmModal: NzModalRef;
	
	tableScroll = { y: `${document.body.clientHeight - 400}px`, x: '950px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		username: ''
	};

	ngOnInit() {
		this.common.initData(() => {
			this.searchData();
		});
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('usermanager/managerUser', this.fillterData).subscribe(res => {
			this.result = res.content;
			this.total = res.total;
			console.log(res.content)
			this.loading = false;
		});
	}
	// 搜索
	search() {
		this.fillterData.page = 1;
		this.fillterData.rows = 25;
		this.searchData();
	}
	// 权限中文转换
	changeAuthorText(number) {
		switch(Number(number)) {
			case 0:
				return '普通合作者';
			case 1:
				return '系统管理员';
			case 2:
				return '超级管理员';
			case 3:
				return '神级管理员';
		}
	}
}
