import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-product-search',
	templateUrl: './product-search.component.html',
	styleUrls: ['./product-search.component.scss']
})
export class ProductSearchComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }

	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '2050px' };
	result = []; // 查询结果
	loading = true;
	total = 0;
	fillterData = {
		page: 1,
		rows: 25,
		id: '',
		name: '',
		des: '',
		origin: null,
		price: '',
		status: '-1',
		classify_a: '',
		classify_b: '',
		classify_c: ''
	};
	departmentList = null; // 部门列表
	classify = null; // 分类原始数据
	classifyShow = {a:[],b:[],c:[]}; // 分类过滤显示数据
	classifyChoose = {a: '',b: '',c: ''}; // 选择的分类

	adminList = this.common.adminList; // 管理员列表
	visible = false; // 查看明细弹窗显示标识
	selectData = null; // 选中的数据
	modalDisplay = false;
	leaseHistory = false;
	leaseHistoryList = []; // 租赁历史记录数据
	leaseHistoryTitle = '';

	deviceFromDisplay = false; // 查询设备所属订单 显示框
	deviceFromData = null;

	classifyOutputData = []; // 分类输出数据
	classifyValues = null;

	ngOnInit() {
		this.common.initData(() => {
			this.departmentList = this.common.departmentList;
			this.classify = this.common.productClassify;
			console.log(this.classify);
			this.searchData();
		});
		this.refreshClassify();
	}
	searchData() {
		this.loading = true;
		this.Requset.post$('devicemanager/searchDevice', this.fillterData).subscribe(res => {
			this.result = res.content;
			this.total = res.total;
			console.log(res.content)
			// 格式化 年化率
			res.content.forEach(x => {
				x.nhl = (x.nhl * 100).toFixed(2) || 0;
			});
			this.result.forEach(x => {
				x.department = this.common.departmentTranslate(x.department);
				x.classify_a = this.common.classifyATranslate(x.classify_a);
				x.classify_b = this.common.classifyBTranslate(x.classify_b);
				x.classify_c = this.common.classifyCTranslate(x.classify_c);
			});
			this.loading = false;
		});
	}
	// 搜索
	search() {
		this.fillterData.page = 1;
		this.fillterData.rows = 25;
		this.searchData();
	}
	// 清除分类
	clearClassify() {
		if(this.classifyValues.length === 0) {
			this.fillterData.classify_a = '';
			this.fillterData.classify_b = '';
			this.fillterData.classify_c = '';
		}
	}
	// 更改分类
	changeClassifyBlock(values: any): void {
		this.fillterData.classify_a = '';
		this.fillterData.classify_b = '';
		this.fillterData.classify_c = '';
		if(values.length === 1) {
			this.fillterData.classify_a = values[0].id;
		} else if (values.length === 2) {
			this.fillterData.classify_a = values[0].id;
			this.fillterData.classify_b = values[1].id;
		} else if (values.length === 3) {
			this.fillterData.classify_a = values[0].id;
			this.fillterData.classify_b = values[1].id;
			this.fillterData.classify_c = values[2].id;
		}
	}
	// 刷新分类数据
	refreshClassify() {
		this.loading = true;
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
			this.loading = false;
		});
	}
	// 根据设备查找所属订单
	viewOrder(item) {
		this.deviceFromDisplay = true;
		this.Requset.post$('devicemanager/deviceFromOrder', item).subscribe(res => {
			if(res) {
				console.log(res);
				this.deviceFromData = res.content;
			}
		});
		
	}
	// 编辑商品
	Edit(item) {
		this.selectData = item;
		this.classifyChoose = {
			a: this.changeClassifyNameToId(item.classify_a,'a'),
			b: this.changeClassifyNameToId(item.classify_b,'b'),
			c: this.changeClassifyNameToId(item.classify_c,'c')
		};

		this.filterClassify();
		console.log(item);
		this.open();
	}
	// 查询历史租赁记录
	viewLeaseHistory(item) {
		this.leaseHistory = true;
		this.leaseHistoryTitle = item.name;
		this.Requset.post$('devicemanager/getDeviceLeaseHistory',{id: item.id}).subscribe(res => {
			if(res) {
				this.leaseHistoryList = res.content;
			}
		});
	}
	// 保存设备修改信息
	saveDeviceInfo() {
		if (this.selectData.name === '') {
			this.message.error('商品名称不能为空');
			return;
		}
		if (!this.selectData.price) {
			this.message.error('设备价格设置错误');
			return;
		}
		if (!this.selectData.out_price) {
			this.message.error('租赁价格设置错误');
			return;
		}
		const data = {
			id: this.selectData.id,
			name: this.selectData.name,
			des: this.selectData.des,
			origin: this.selectData.origin,
			price: this.selectData.price,
			out_price: this.selectData.out_price,
			classify_a: this.classifyChoose.a,
			classify_b: this.classifyChoose.b,
			classify_c: this.classifyChoose.c
		}

		this.Requset.post$('devicemanager/modifyDeviceInfo',data).subscribe(res => {
			this.message.success('修改成功');
			this.searchData();
		});
	}
	// 删除设备
	deleteDevice(item) {
		console.log(item);
		this.common.showConfirm('删除提示',`是否确定删除 ${item.name} ?`, () => {
			this.loading = true;
			this.Requset.post$('devicemanager/deleteDevice',{id: item.id}).subscribe(res => {
				this.message.success('删除成功');
				this.loading = false;
				this.searchData();
			});
		});
	}
	// 根据分类过滤原始数据
	filterClassify() {
		this.classifyShow.a = this.classify.a;
		this.classifyShow.b = [];
		this.classifyShow.c = [];
		console.log(this.classifyChoose);
		if(this.classifyChoose.b) {
			this.classify.b.forEach(x => {
				if(x.classify_a_id === this.classifyChoose.a) {
					this.classifyShow.b.push(x);
				}
			});
		}
		if(this.classifyChoose.c) {
			this.classify.c.forEach(x => {
				if(x.classify_b_id === this.classifyChoose.b) {
					this.classifyShow.c.push(x);
				}
			});
		}
	}
	// 分类名转换成分类ID
	changeClassifyNameToId(name,classify) {
		console.log(this.classify);
		if(classify === 'a'){
			for(let i = 0, r = this.classify.a.length; i < r; i++) {
				if(this.classify.a[i].name === name) {
					return this.classify.a[i].id;
				}
			}
		}
		if(classify === 'b'){
			for(let i = 0, r = this.classify.b.length; i < r; i++) {
				if(this.classify.b[i].name === name) {
					return this.classify.b[i].id;
				}
			}
		}
		if(classify === 'c'){
			for(let i = 0, r = this.classify.c.length; i < r; i++) {
				if(this.classify.c[i].name === name) {
					return this.classify.c[i].id;
				}
			}
		}
		return '-1';
	}
	// 切换分类
	changeClassify(event,type) {
		if(type === 'a') {
			this.classifyChoose.b = '-1'
			this.classifyChoose.c = '-1'
		}
		if(type === 'b') {
			this.classifyChoose.c = '-1'
		}
		this.filterClassify();
	}
	open(): void {
		this.visible = true;
	}

	close(): void {
		this.visible = false;
	}
}
