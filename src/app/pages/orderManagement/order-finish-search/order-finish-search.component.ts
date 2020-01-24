import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-order-finish-search',
  templateUrl: './order-finish-search.component.html',
  styleUrls: ['./order-finish-search.component.scss']
})
export class OrderFinishSearchComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1700px' };
	result = []; // 查询结果
	adminList; // 管理员列表
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		orderId: '',
		option: '',
		origin: '',
		des: '',
		relativePeople: '',
		completed: 1,
		flag: '',
		status: 5
	};
	departmentList = null; // 部门列表
	orderDetail = []; //订单明细
	ngOnInit() {
		this.common.initData(() => {
			this.departmentList = this.common.departmentList;
			this.adminList = this.common.adminList;
			this.search();
		});
	}
	// 查看订单明细
	viewOrderDetail(event,item,callback = function(){}) {
		this.orderDetail = [];
		if(event) {
			this.Requset.post$('ordermanager/viewOrderDetail', {cid: item.id, viewAll: true}).subscribe(res => {
				console.log(res);
				this.orderDetail = res.content;
				callback();
			});
		}
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('ordermanager/searchOrderList',this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
		});
	}
	__departmentText(value) {
		for(let i = 0,r = this.departmentList.length; i < r;i++) {
			if(this.departmentList[i].id === value) {
				return this.departmentList[i].name;
			}
		}
	}
	// 打印订单
	printOrder(item) {
		this.loading = true;
		this.Requset.post$('ordermanager/order_print',{id:item.id}).subscribe(data => {
			data.content[0].id = item.id;
			sessionStorage.setItem("print_content",JSON.stringify(data.content[0]));
			window.open('../../../assets/print/orderEditPrint.html');
			this.loading = false;
		});
	}
}
