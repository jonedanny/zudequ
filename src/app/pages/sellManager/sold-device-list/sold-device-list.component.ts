import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-sold-device-list',
  templateUrl: './sold-device-list.component.html',
  styleUrls: ['./sold-device-list.component.scss']
})
export class SoldDeviceListComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
  ) { }
  
	tableScroll = { y: `${document.body.clientHeight - 330}px`, x: '1700px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		name: '',
		user: ''
	};
	ngOnInit() {
		this.search();
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('productmanager/searchSoldDevice',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
}
