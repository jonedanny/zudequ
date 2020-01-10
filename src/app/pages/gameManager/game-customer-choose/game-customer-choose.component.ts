import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';

@Component({
  selector: 'app-game-customer-choose',
  templateUrl: './game-customer-choose.component.html',
  styleUrls: ['./game-customer-choose.component.scss']
})
export class GameCustomerChooseComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private Requset: RequsetService
	) { }

	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1330px' };
	baseImgUrl = location.href.indexOf('http://localhost') !== -1 ? 'http://127.0.0.1/ZdpPhpManager/' : 'http://122.114.177.171:8006/ZdpPhpManager/';
	result = []; // 查询结果
	type = []; // 游戏类型
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		taobaoId: ''
	};
	ngOnInit() {
		this.search();
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('gamemanager/searchCustomerChooseGameList',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			for(let i = 0, r = this.result.length; i < r; i++) {
				this.result[i].real_container = Math.floor(Number(this.result[i].real_container) * 100) / 100;
				this.result[i].game_list = JSON.parse(this.result[i].game_list);
				this.result[i].games_number = this.result[i].game_list.length;
			}
			console.log(this.result);
			this.loading = false;
		});
	}

}
