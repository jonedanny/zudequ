import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
	selector: 'app-product-add',
	templateUrl: './product-add.component.html',
	styleUrls: ['./product-add.component.scss']
})
export class ProductAddComponent implements OnInit {

	constructor(
		private message: NzMessageService,
		private common: CommonDataService,
		private Requset: RequsetService
	) { }
	
	productClassify; // 商品分类 数据
	adminList; // 管理员列表

	isSpinning = true; // 数据加载loading
	classifyOutputData = []; // 分类输出数据

	chooseInfo = {
		department: 1,
		name: '',
		des: '',
		classify_a: '',
		classify_b: '',
		classify_c: '',
		price: '',
		out_price: '',
		origin: null,
		classifyValues: null
	};
	chooseInfoCopy = JSON.parse(JSON.stringify(this.chooseInfo));
	ngOnInit() {
		this.common.initData(() => {
			this.productClassify = this.common.productClassify;
			this.adminList = this.common.adminList;
			this.refreshClassify();
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
		this.chooseInfo.classify_a = '';
		this.chooseInfo.classify_b = '';
		this.chooseInfo.classify_c = '';
		if(values.length === 1) {
			this.chooseInfo.classify_a = values[0].id;
		} else if (values.length === 2) {
			this.chooseInfo.classify_a = values[0].id;
			this.chooseInfo.classify_b = values[1].id;
		} else if (values.length === 3) {
			this.chooseInfo.classify_a = values[0].id;
			this.chooseInfo.classify_b = values[1].id;
			this.chooseInfo.classify_c = values[2].id;
		}
	}
	// 数据提交
	submit() {
		if (this.validate()) {
			if (!this.chooseInfo.origin) {
				this.chooseInfo.origin = 0;
			}
			this.Requset.post$('productmanager/addProduct',this.chooseInfo).subscribe(res => {
				this.message.success('添加商品成功');
				this.chooseInfo = JSON.parse(JSON.stringify(this.chooseInfoCopy));
			});
		}
	}
	// 数据校验
	validate() {
		let result = true;
		if (this.chooseInfo.name === '') {
			this.message.error('请输入商品名称');
			result = false;
		} else if (this.chooseInfo.classify_a === '') {
			this.message.error('请至少选择一级分类');
			result = false;
		}
		if (this.chooseInfo.origin) {
			if (this.chooseInfo.price === '') {
				this.message.error('请输入商品成本金额');
				result = false;
			} else if (this.chooseInfo.out_price === '') {
				this.message.error('请输入商品租金/天');
				result = false;
			}
		} 
		return result;
	}
}
