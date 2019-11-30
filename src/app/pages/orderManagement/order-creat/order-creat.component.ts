import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-order-creat',
	templateUrl: './order-creat.component.html',
	styleUrls: ['./order-creat.component.scss']
})
export class OrderCreatComponent implements OnInit {

	constructor(
		private message: NzMessageService,
		private common: CommonDataService,
		private Requset: RequsetService,
		private modal: NzModalService
	) { }

	confirmModal: NzModalRef;
	adminList; // 管理员列表
	productClassify; // 商品分类 数据
	userLoginInfo = JSON.parse(localStorage.getItem('userLoginInfo'));

	isSpinning = true; // 数据加载loading
	classifyOutputData = []; // 分类输出数据
	
	storeList = []; // 店铺来源列表

	textInfo = {
		department: '1',
		name: '',
		classify_a: '',
		classify_b: '',
		classify_c: '',
		operator: this.userLoginInfo.name,
		classifyValues: null,
		originNum: 0,
		targetNum: 0,
		origin: '',
		start: null,
		end: null,
		money: null,
		deposit: null,
		option: '',
		des: '',
		completed: 0,
		store: null,
		sell_pro: [],
		date: null,
		phone: ''
	};
	textInfoCopy = JSON.parse(JSON.stringify(this.textInfo));
	productList: any[] = []; // 商品列表
	productSelectList: any[] = []; // 已锁仓的商品列表

	__productList: any; // 选中的商品
	__productSelectList: any; // 选中的锁仓商品

	leaseDay = null; // 租赁天数

	ngOnInit() {
		this.common.initData(() => {
			this.productClassify = this.common.productClassify;
			this.storeList = this.common.store;
			this.adminList = this.common.adminList;
			console.log(this.adminList);
			this.refreshClassify();
			this.refreshProList();
		});
	}
	// 刷新分类数据
	refreshClassify() {
		this.isSpinning = true;
		this.classifyOutputData = [];
		this.common.refreshProductClassify(() => {
			console.log(this.common.productClassify)
			// 保存一级分类
			for (let i = 0, r = this.common.productClassify.a.length; i < r; i++) {
				this.common.productClassify.a[i].children = [];
				this.common.productClassify.a[i].label = this.common.productClassify.a[i].name;
				this.common.productClassify.a[i].value = this.common.productClassify.a[i].id;
				this.classifyOutputData.push(this.common.productClassify.a[i]);
			}
			// 保存二级分类
			for (let i = 0, r = this.classifyOutputData.length; i < r; i++) {
				for (let s = 0, k = this.common.productClassify.b.length; s < k; s++) {
					if (this.common.productClassify.b[s].classify_a_id === this.classifyOutputData[i].id) {
						this.common.productClassify.b[s].children = [];
						this.common.productClassify.b[s].label = this.common.productClassify.b[s].name;
						this.common.productClassify.b[s].value = this.common.productClassify.b[s].id;
						this.classifyOutputData[i].children.push(this.common.productClassify.b[s]);
					}
				}
			}
			// 保存三级分类
			for (let i = 0, r = this.classifyOutputData.length; i < r; i++) {
				for (let s = 0, k = this.classifyOutputData[i].children.length; s < k; s++) {
					for (let x = 0, y = this.common.productClassify.c.length; x < y; x++) {
						if (
							this.common.productClassify.c[x].classify_a_id === this.classifyOutputData[i].id &&
							this.common.productClassify.c[x].classify_b_id === this.classifyOutputData[i].children[s].id
						) {
							this.common.productClassify.c[x].isLeaf = true;
							this.common.productClassify.c[x].label = this.common.productClassify.c[x].name;
							this.common.productClassify.c[x].value = this.common.productClassify.c[x].id;
							this.classifyOutputData[i].children[s].children.push(this.common.productClassify.c[x]);
						}
					}
				}
			}
			console.log(this.classifyOutputData);
			this.isSpinning = false;
		});
	}
	// 更改分类
	changeClassify(values: any): void {
		this.textInfo.classify_a = '';
		this.textInfo.classify_b = '';
		this.textInfo.classify_c = '';
		if(values.length === 1) {
			this.textInfo.classify_a = values[0].id;
		} else if (values.length === 2) {
			this.textInfo.classify_a = values[0].id;
			this.textInfo.classify_b = values[1].id;
		} else if (values.length === 3) {
			this.textInfo.classify_a = values[0].id;
			this.textInfo.classify_b = values[1].id;
			this.textInfo.classify_c = values[2].id;
		}
		this.refreshProList();
	}
	// 创建订单
	submitForm() {
		if(this.validate()) {
			// 重复付款途径订单查询警告
			this.Requset.post$('ordermanager/warningRepeatOrigin', {origin: this.textInfo.origin}).subscribe(res => {
				console.log(res);
				if(res && res.content === 0) {
					this.creatOrder();
				}
				else if (res && res.content > 0) {
					this.confirmModal = this.modal.confirm({
						nzTitle: '订单提示',
						nzContent: '已存在相同付款途径的租赁中订单，是否继续?',
						nzOnOk: () => {
							this.creatOrder();
						}
					});
				}
			});
		}
	}
	creatOrder() {
		// 自动计算租赁结束日期
		this.textInfo.end = this.common.calcAddNumDate(this.textInfo.start, this.leaseDay - 1);
		console.log(this.textInfo,this.productSelectList)
		this.isSpinning = true;
		let details = [];
		this.productSelectList.forEach(x => {
			details.push({
				"pid" : x.id,     // 商品ID必传
				"pName" : x.name,   //  商品名称  必传
				"rent" : x.out_price,     // 单位租金  必传（两位小数）
				"userid" : x.origin,   // 出租人ID（设备所有人） 必传  （整数）
				"username" : this.systemIdChange(x.origin), //  出租人姓名（设备所有人姓名） 必传
				"des" : x.des  // 说明备注
			});
		});
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"creatOrder",
			"param":{
				"start" : this.textInfo.start,    // 开始时间 必传
				"end" : this.textInfo.end,     // 结束时间 必传
				"money" : this.textInfo.money,   // 订单金额 必传  （两位小数）
				"deposit" : this.textInfo.deposit,   // 趣币  （整数）
				"origin" : this.textInfo.origin,    // 承租人
				"des" : this.textInfo.des,     // 说明备注
				"department" : this.textInfo.department,    // 部门ID 必传
				"opteration" : this.textInfo.operator,      // 操作员  必传
				"phone" : this.textInfo.phone,         // 用户手机 必传
				"store" : this.textInfo.store,
				"details" : details				
			}
		}
		this.Requset.post$('javacontact/javaContact',{data: JSON.stringify(data)}).subscribe(res => {
			this.isSpinning = false;
			this.textInfo = JSON.parse(JSON.stringify(this.textInfoCopy));
			this.refreshProList();
			this.leaseDay = null;
			this.message.success('创建订单成功');
		});
	}
	// 清除分类
	clearClassify() {
		if(this.textInfo.classifyValues.length === 0) {
			this.textInfo.classify_a = '';
			this.textInfo.classify_b = '';
			this.textInfo.classify_c = '';
			this.refreshProList();
		}
	}
	// 添加商品
	add() {
		if(this.__productList.length === 0) {
			return;
		}
		this.isSpinning = true;
		this.Requset.post$('ordermanager/lockedProduct', this.__productList).subscribe(res => {
			this.isSpinning = false;
			this.refreshProList();
		});
	}
	// 删除商品
	remove() {
		if(this.__productSelectList.length === 0) {
			return;
		}
		this.isSpinning = true;
		this.Requset.post$('ordermanager/unlockedProduct', this.__productSelectList).subscribe(res => {
			this.isSpinning = false;
			this.refreshProList();
		});
	}
	// 订单时间修改
	orderTimeChange(result: Date): void {
		this.textInfo.start = this.common.formatNormalTime(result);
	}
	// 刷新订单商品
	refreshProList() {
		this.isSpinning = true;
		let count = 0;
		this.Requset.post$('devicemanager/searchFilterOrderAddDevice', this.textInfo).subscribe(res => {
			console.log('[商品列表]',res)
			this.productList = res.content;
			this.textInfo.originNum = res.content.length;
			count++;
			if(count === 2) {
				this.isSpinning = false;
			}
		});
		this.Requset.post$('devicemanager/searchLockedDevice', this.textInfo).subscribe(res => {
			this.productSelectList = res.content;
			this.textInfo.targetNum = res.content.length;
			count++;
			if(count === 2) {
				this.isSpinning = false;
			}
		});
	}
	// 提交数据验证
	validate() {
		if(!this.textInfo.phone || this.textInfo.phone.length < 11) {
			this.message.error('手机号码格式不正确');
			return false;
		}
		if(!this.leaseDay) {
			this.message.error('请填写租赁天数');
			return false;
		}
		if(!this.textInfo.start) {
			this.message.error('请填写租赁起始日');
			return false;
		}
		if(!this.textInfo.origin) {
			this.message.error('请填写途径来源');
			return false;
		}
		if(!this.textInfo.money) {
			this.message.error('请填写金额');
			return false;
		}
		if(!this.textInfo.deposit) {
			this.message.error('请填写押金');
			return false;
		}
		if(!this.textInfo.store) {
			this.message.error('请选择店铺');
			return false;
		}
		if(!this.textInfo.operator) {
			this.message.error('请选择操作员');
			return false;
		}
		if(this.productSelectList.length === 0) {
			this.message.error('请添加订单商品');
			return false;
		}
		return true;
	}
	// 系统管理员 ID -> name
	systemIdChange(id) {
		for(let i = 0,r = this.adminList.length;i < r; i++){
			if(this.adminList[i].id == id) {
				return this.adminList[i].name;
			}
		}
	}
}
