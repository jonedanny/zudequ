import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-wechat-feedback-management',
  templateUrl: './wechat-feedback-management.component.html',
  styleUrls: ['./wechat-feedback-management.component.scss']
})
export class WechatFeedbackManagementComponent implements OnInit {

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
		phone: '',
		sort: null
	};
	ngOnInit() {
		this.searchData();
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('wechat/wechatFeedBack', this.fillterData).subscribe(res => {
			if(res){
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
}
