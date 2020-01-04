import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { UploadFile } from 'ng-zorro-antd/upload';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'app-wechat-active-management',
	templateUrl: './wechat-active-management.component.html',
	styleUrls: ['./wechat-active-management.component.scss']
})
export class WechatActiveManagementComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService,
		private modal: NzModalService
	) { }

	confirmModal: NzModalRef;
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '1180px' };
	result = []; // 查询结果
	total = 0;
	fillterData = {
		page: 1,
		rows: 25
	};
	isSpinning = true; // 数据加载loading
	classifyOutputData = []; // 分类输出数据
	classify = {
		classify_a: '',
		classify_b: '',
		classify_c: '',
		classifyValues: null
	};
	/**
	 * 活动类型
	 * 1 活动广告 链接商品 (多张图)
	 * 2 新货上架 图文外链
	 * 3 最新活动 图文外链
	 * 4 当下爆品 链接商品
	 * 5 首页通知 最多5条文字滚动
	 */
	activeType:string = '1';

	link:string = ''; // 外链地址
	proName:string = ''; // 商品名字
	sort:number = 1; // 排序

	addColumnDisplay: boolean = false; // 显示添加

	avatarUrl:string = ''; // 封面图片

	moduleClass:string = '主机类'; // 商品大类

	flag:string = ''; // 标识 add:新增 edit:修改

	optionId:string = ''; // 操作ID 修改 | 删除

	ngOnInit() {
		this.searchData();
		this.refreshClassify();
	}
	searchData() {
		this.isSpinning = true;
		this.Requset.post$('wechat/wechatActive', this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.isSpinning = false;
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
		this.classify.classify_a = '';
		this.classify.classify_b = '';
		this.classify.classify_c = '';
		if(values.length === 1) {
			this.classify.classify_a = values[0].id;
		} else if (values.length === 2) {
			this.classify.classify_a = values[0].id;
			this.classify.classify_b = values[1].id;
		} else if (values.length === 3) {
			this.classify.classify_a = values[0].id;
			this.classify.classify_b = values[1].id;
			this.classify.classify_c = values[2].id;
		}
		console.log(this.classify);
	}
	// 封面图片改变时调用
	changeAvatar(info: { file: UploadFile }): void {
		switch (info.file.status) {
			case 'uploading':
				this.isSpinning = true;
				break;
			case 'done':
				// Get this url from response in real world.
				this.isSpinning = false;
				this.avatarUrl = info.file.response.content;
				break;
			case 'error':
				this.message.error('Network error');
				this.isSpinning = false;
				break;
		}
	}
	// 提交数据
	save() {
		this.isSpinning = true;
		let data: any = {
			"homeType": this.activeType, // 1广告2最新品3最新活动4爆品  必传
     		"imgSrc": this.avatarUrl, // 图片路径  必传
			"classaId": this.classify.classify_a, // 分类A
			"classbId": this.classify.classify_b, // 分类B
			"classcId": this.classify.classify_c, // 分类C
			"outSrc": this.link,  // 外链
			"moduleName": this.changeModuleText(this.activeType), // 模块名称
			"moduleClass": this.moduleClass,
			"sort": this.sort  // 排序  必传
		};
		if(this.flag === 'edit') {
			data.id = this.optionId;
		}
		const postData = {
			"version": "1.0",
		    "modular": "home",
		    "requestname": this.flag === "add" ? "addHome" : "updateHome",
			"param": data
		}
		this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(postData) }).subscribe(res => {
			this.message.success('操作成功');
			this.addColumnDisplay = false;
			this.isSpinning = false;
			this.clearData();
			this.searchData();
		});
	}
	// 转换模块名称
	changeModuleText(id) {
		for(let i = 0,r = this.common.activeType.length; i < r; i++) {
			if(this.common.activeType[i].id == id) {
				return this.common.activeType[i].name;
			}
		}
	}
	// 编辑
	edit(item) {
		this.open('edit');
		this.avatarUrl = item.img_src;
		this.link = item.out_src;
		this.sort = item.sort;
		this.activeType = item.home_type;
		this.optionId = item.id;
		let value = [];
		if(item.classa_id && item.classa_id !== '-1') {
			value.push(item.classa_id);
		}
		if(item.classb_id && item.classb_id !== '-1') {
			value.push(item.classb_id);
		}
		if(item.classc_id && item.classc_id !== '-1') {
			value.push(item.classc_id);
		}
		this.classify = {
			classify_a: item.classa_id,
			classify_b: item.classb_id,
			classify_c: item.classc_id,
			classifyValues: value
		};
	}
	// 删除
	delete(item) {
		console.log(item);
		this.confirmModal = this.modal.confirm({
			nzTitle: '提示?',
			nzContent: `确认要删除 ID ${item.id} 这条活动吗?`,
			nzOnOk: () =>
			new Promise((resolve, reject) => {
				console.log(item);
				const data = {
					"version": "1.0",
					"modular": "home",
					"requestname": "delHome",
					"param": {
						"id": item.id // 必传
					}
				}
				this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
					this.message.success('操作成功');
					this.addColumnDisplay = false;
					this.isSpinning = false;
					this.clearData();
					this.searchData();
					resolve();
				});
			}).catch(() => console.log('Oops errors!'))
		});
	}
	// 重置数据
	clearData() {
		this.avatarUrl = '';
		this.link = '';
		this.proName = '';
		this.sort = 1;
		this.classify = {
			classify_a: '',
			classify_b: '',
			classify_c: '',
			classifyValues: null
		};
	}
	open(type) {
		this.clearData();
		this.addColumnDisplay = true;
		this.flag = type;
	}
	close() {
		this.addColumnDisplay = false;
	}
}
