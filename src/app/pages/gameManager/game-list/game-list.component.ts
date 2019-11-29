import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
  ) { }
  
	tableScroll = { y: `${document.body.clientHeight - 330}px`, x: '1500px' };
	baseImgUrl = location.href.indexOf('http://localhost') !== -1 ? 'http://127.0.0.1/ZdpPhpManager/' : 'http://122.114.177.171:8006/ZdpPhpManager/';
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		name: '',
		type: '',
		classify: ''
	};
	ngOnInit() {
		this.search();
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('gamemanager/searchGameList',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}

}
