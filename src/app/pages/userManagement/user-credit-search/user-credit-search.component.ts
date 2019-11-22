import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

/**
 *  creditCourtRiskDetail 征信法院执行明细！
 *	creditRiskDetail 征信个人风险明细！
 *	creditLoanDemandDetail 征信个人近期贷款需求明细！
 *	creditLoanFDetail 征信个人近期贷款放款明细！
 *	creditLoanSDetail 征信个人近期贷款申请明细！
 *	creditHistoryDetail 征信个人历史逾期记录明细！ 
 *  {
		"version":"1.0",
		"modular":"credit",
		"requestname":"creditRiskDetail",
		"param":{
			"pid": 9
		}
	}
 */

@Component({
	selector: 'app-user-credit-search',
	templateUrl: './user-credit-search.component.html',
	styleUrls: ['./user-credit-search.component.scss']
})
export class UserCreditSearchComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService,
		private modalService: NzModalService
	) { }

	creditRiskDetailDisplay: boolean = false;
	creditLoanDemandDetailDisplay: boolean = false;
	creditLoanFDetailDisplay: boolean = false;
	creditLoanSDetailDisplay: boolean = false;
	creditHistoryDetailDisplay: boolean = false;

	creditSearchDisplay: boolean;
	tableScroll = { y: `${document.body.clientHeight - 400}px`, x: '2700px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		phone: '',
		sort: null
	};
	creditData = {
		name: null,
		phone: null,
		ident_number: null
	}
	creditDataCopy = JSON.parse(JSON.stringify(this.creditData));

	// 当前选择的明细
	currentViewDetail = {
		content: null,
		item: null,
		type: null
	};

	ngOnInit() {
		this.common.initData(() => {
			this.searchData();
		});
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('usercreditmanager/searchCustomerUserCredit', this.fillterData).subscribe(res => {
			this.result = res.content;
			this.total = res.total;
			this.loading = false;
		});
	}
	// 搜索
	search() {
		this.fillterData.page = 1;
		this.fillterData.rows = 25;
		this.searchData();
	}
	// 添加征信
	creditCreat() {
		this.loading = true;
		const json = {
			"version":"1.0",
			"modular":"credit",
			"requestname":"getCredit",
			"param":this.creditData
		};
		this.Requset.post$('usercreditmanager/addCustomerCredit', {data: JSON.stringify(json)}).subscribe(res => {
			if(res) {
				this.message.success('添加成功');
			}
			else {
				this.message.error('添加失败');
			}
			this.creditSearchDisplay = false;
			this.creditData = JSON.parse(JSON.stringify(this.creditDataCopy));
			this.searchData();
			this.loading = false;
		});
	}
	// 排序
	sort(sort: { key: string; value: string }): void {
		console.log(sort);
		this.fillterData.sort = sort;
		this.search();
	}
	// 身份证打*号
	secrecy(str) {
		const _str = String(str);
		return _str.substr(0, 3) + "*******" + str.substr(16);
	}
	info(): void {
		this.modalService.info({
			nzTitle: '分值标准说明',
			nzContent: '<p>分值在 0~100 之间，分值越高风险越大，（0,30) 建议通过，(30,80) 建议审核，[80,100)建议拒绝。</p>',
			nzOnOk: () => console.log('Info OK')
		});
	}
	// 查询明细
	creditDetail(item,type) {
		console.log(item);
		this.loading = true;
		const json = {
			"version":"1.0",
			"modular":"credit",
			"requestname":type,
			"param": {"pid": item.id}
		};
		this.Requset.post$('usercreditmanager/creditDetail', {data: JSON.stringify(json)}).subscribe((res: any) => {
			console.log(res);
			if(res.success) {
				if(typeof(res.content) === 'string') {
					this.message.warning(res.content);
				}
				else {
					this.currentViewDetail.item = item;
					this.currentViewDetail.content = res.content;
					this.currentViewDetail.type = type;
					switch(type) {
						case 'creditRiskDetail':
							this.creditRiskDetailDisplay = true;
							break;
						case 'creditLoanDemandDetail':
							this.creditLoanDemandDetailDisplay = true;
							break;
						case 'creditLoanFDetail':
							this.creditLoanFDetailDisplay = true;
							break;
						case 'creditLoanSDetail':
							this.creditLoanSDetailDisplay = true;
							break;
						case 'creditHistoryDetail':
							this.creditHistoryDetailDisplay = true;
							break;
					}
				}
			}
			this.loading = false;
		});
	}
	// 关闭明细窗口
	close() {
		this.creditRiskDetailDisplay = false;
		this.creditLoanDemandDetailDisplay = false;
		this.creditLoanFDetailDisplay = false;
		this.creditLoanSDetailDisplay = false;
		this.creditHistoryDetailDisplay = false;
		this.currentViewDetail.item = null;
		this.currentViewDetail.content = null;
		this.currentViewDetail.type = null
	}
}
