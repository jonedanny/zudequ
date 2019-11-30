import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-user-list-search',
	templateUrl: './user-list-search.component.html',
	styleUrls: ['./user-list-search.component.scss']
})
export class UserListSearchComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService,
		private modal: NzModalService
	) { }
	confirmModal: NzModalRef;

	resetPwdDisplay = false; // 重置密码框显示
	creatCustomerDisplay = false; // 

	resetLoading = false;
	resetPwdValue = ''; // 重置的密码值 (大于6位)

	currentUser = null; // 当前选择的客户

	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1380px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		username: ''
	};

	creatCustomerData = {
		username: ''
	}

	ngOnInit() {
		this.common.initData(() => {
			this.searchData();
		});
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('usermanager/customerUser', this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	// 搜索
	search() {
		this.fillterData.page = 1;
		this.fillterData.rows = 25;
		this.searchData();
	}
	// 打开重置密码框
	openResetPwdColumn(item) {
		this.resetPwdDisplay = true;
		this.currentUser = item;
	}
	// 重置密码
	resetPwd() {
		this.resetLoading = true;
		this.Requset.post$('usermanager/resetPwd', {
			username: this.currentUser.username,
			password: this.resetPwdValue
		}).subscribe(() => {
			this.message.success('重置成功');
			this.resetLoading = false;
			this.resetPwdDisplay = false;
			this.resetPwdValue = '';
			this.currentUser = null;
		});
	}
	// 删除用户
	deleteUser(item) {
		console.log(item);
		this.currentUser = item;
		this.confirmModal = this.modal.confirm({
			nzTitle: '删除提示',
			nzContent: `是否确认删除用户 [${this.currentUser.username}],一旦删除,则无法恢复!`,
			nzOnOk: () =>
				new Promise((resolve) => {
					console.log('delete');
					this.Requset.post$('usermanager/delete', {
						id: this.currentUser.id
					}).subscribe(() => {
						this.message.success('删除成功');
						this.searchData();
						resolve();
					});
				}).catch(() => console.log('Oops errors!'))
		});
	}
	// 创建用户
	creatCustomerUser() {
		this.creatCustomerDisplay = true;
	}
	customerCreat() {
		if(this.creatCustomerData.username === '') {
			this.message.warning('用户名不能为空');
			return;
		}
		this.Requset.post$('usermanager/creatNewCustomer', this.creatCustomerData).subscribe((res) => {
			if(res) {
				this.creatCustomerData.username = '';
				this.message.success('添加成功');
				this.searchData();
			}
			this.creatCustomerDisplay = false;
		});
	}
}
