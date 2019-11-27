import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-customer-repair-search',
  templateUrl: './customer-repair-search.component.html',
  styleUrls: ['./customer-repair-search.component.scss']
})
export class CustomerRepairSearchComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
  ) { }
  
	tableScroll = { y: `${document.body.clientHeight - 400}px`, x: '1700px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		repairID: '',
		taobaoID: ''
	};
	ngOnInit() {
		this.search();
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('repair/searchCustomerApply',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
}
