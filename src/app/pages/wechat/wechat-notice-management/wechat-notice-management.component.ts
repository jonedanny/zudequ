import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-wechat-notice-management',
  templateUrl: './wechat-notice-management.component.html',
  styleUrls: ['./wechat-notice-management.component.scss']
})
export class WechatNoticeManagementComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }

	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1500px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		sort: null
	};
	noticeData = {
		title: '',
		content: ''
	}
	addColumnDisplay: boolean = false;

	ngOnInit() {
		this.searchData();
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('wechat/wechatNotice', this.fillterData).subscribe(res => {
			if(res){
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	// 添加通知
	addNotice() {
		this.loading = true;
		this.Requset.post$('wechat/wechatAddNotice', this.noticeData).subscribe(res => {
			this.searchData();
			this.noticeData.title = '';
			this.noticeData.content = '';
			this.loading = false;
			this.close();
			this.message.success('添加通知成功');
		});
	}
	// 删除通知
	delete(item) {
		this.loading = true;
		this.Requset.post$('wechat/wechatDeleteNotice', {id: item.id}).subscribe(res => {
			this.searchData();
			this.loading = false;
			this.message.success('删除成功');
		});
	}
	// 显示添加通知框
	open() {
		this.addColumnDisplay = true;
	}
	close() {
		this.addColumnDisplay = false;
	}
}
