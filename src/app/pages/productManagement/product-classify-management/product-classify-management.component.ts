import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzFormatEmitEvent } from 'ng-zorro-antd/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadFile } from 'ng-zorro-antd/upload';

@Component({
	selector: 'app-product-classify-management',
	templateUrl: './product-classify-management.component.html',
	styleUrls: ['./product-classify-management.component.scss']
})
export class ProductClassifyManagementComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }

	classifyOutputData = []; // 分类输出数据
	classifyEditData = {
		id: '',
		department: '',
		name: '',
		level: -1,
		manufactor: null,
		days: null,
		classify_type: null,
		img: '',
		classify_a_id: '',
		classify_b_id: ''
	};
	classifyEditDataCopy = JSON.parse(JSON.stringify(this.classifyEditData));
	visible = false; // 显示编辑信息
	hasAddSub = true; // 是否可添加子分类
	department: Array<any>; // 部门列表
	isSpinning = true; // 数据加载loading

	subClassifuName = ''; // 添加的子分类名

	modalDisplay = false; // 显示modal

	modalData = {
		id: null,
		name: ''
	}
	modalDataCopy = JSON.parse(JSON.stringify(this.modalData));

	deviceSellInfo = {
		productPrice: null,
		productRent: null,
		productDeposit: null,
		productDays: null,
		rentDays: null,
		productCapacity: null,
		des: null
	};
	deviceSellInfoCopy = JSON.parse(JSON.stringify(this.deviceSellInfo));
	avatarUrl: string; // 封面地址
	desImgList = []; // 描述图片列表
	ngOnInit() {
		this.refreshClassify();
		this.common.refreshDepatment(() => {
			this.department = this.common.departmentList;
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
				this.common.productClassify.a[i].title = this.common.productClassify.a[i].name;
				this.common.productClassify.a[i].key = this.common.productClassify.a[i].id;
				this.common.productClassify.a[i].expanded = false;
				this.classifyOutputData.push(this.common.productClassify.a[i]);
			}
			// 根据中文排序
			this.classifyOutputData.sort((a,b) => a.name.localeCompare(b.name, 'zh'));
			// 保存二级分类
			for (let i = 0, r = this.classifyOutputData.length; i < r; i++) {
				for (let s = 0, k = this.common.productClassify.b.length; s < k; s++) {
					if (this.common.productClassify.b[s].classify_a_id === this.classifyOutputData[i].id) {
						this.common.productClassify.b[s].children = [];
						this.common.productClassify.b[s].title = this.common.productClassify.b[s].name;
						this.common.productClassify.b[s].key = this.common.productClassify.b[s].id;
						this.common.productClassify.b[s].expanded = false;
						this.classifyOutputData[i].children.push(this.common.productClassify.b[s]);
					}
				}
				// 根据中文排序
				if(this.classifyOutputData[i].children.length > 0) {
					this.classifyOutputData[i].children.sort((a,b) => a.name.localeCompare(b.name, 'zh'));
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
							this.common.productClassify.c[x].title = this.common.productClassify.c[x].name;
							this.common.productClassify.c[x].key = this.common.productClassify.c[x].id;
							this.classifyOutputData[i].children[s].children.push(this.common.productClassify.c[x]);
						}
					}
					// 根据中文排序
					if(this.classifyOutputData[i].children[s].children.length > 0) {
						this.classifyOutputData[i].children[s].children.sort((a,b) => a.name.localeCompare(b.name, 'zh'));
					}
				}
			}

			console.log(this.classifyOutputData);
			this.isSpinning = false;
		});
	}
	// 展示分类详细
	nzEvent(event: NzFormatEmitEvent): void {
		this.hasAddSub = event.node.origin.classify_b_id ? false : true;
		this.classifyEditData.id = event.node.origin.id;
		this.classifyEditData.department = event.node.origin.department;
		this.classifyEditData.name = event.node.origin.name;
		this.classifyEditData.level = event.node.level;
		this.classifyEditData.classify_a_id = event.node.origin.classify_a_id || '';
		this.classifyEditData.classify_b_id = event.node.origin.classify_b_id || '';
		this.classifyEditData.manufactor = event.node.origin.manufactor || '';
		this.classifyEditData.classify_type = event.node.origin.classify_type || '';
		this.deviceSellInfo.productPrice = event.node.origin.product_price || '';
		this.deviceSellInfo.productRent = event.node.origin.product_rent || '';
		this.deviceSellInfo.productDeposit = event.node.origin.product_deposit || '';
		this.deviceSellInfo.productDays = event.node.origin.product_days || '';
		this.deviceSellInfo.rentDays = event.node.origin.rent_days || '';
		this.deviceSellInfo.productCapacity = event.node.origin.product_capacity || '';
		this.deviceSellInfo.des = event.node.origin.product_remark || '';
		this.avatarUrl = event.node.origin.img || '';
		this.desImgList = [];
		if(event.node.origin.imgs) {
			const desImg = event.node.origin.imgs.split(',');
			let i = -1;
			desImg.forEach(x => {
				this.desImgList.push({
					uid: i,
					name: x,
					status: 'done',
					url: 'https://www.zudequ.com/cmd/images/' + x,
					thumbUrl: 'https://www.zudequ.com/cmd/images/' + x
				});
				i--;
			});
		}
		console.log(event, this.classifyEditData)
		this.open();
	}
	// 修改分类价格
	editDeviceOuterPirce() {
		let a, b, c;
		if (this.classifyEditData.classify_a_id === '') {
			a = this.classifyEditData.id;
			b = '-1';
			c = '-1';
		}
		else if (this.classifyEditData.classify_b_id === '') {
			a = this.classifyEditData.classify_a_id;
			b = this.classifyEditData.id;
			c = '-1';
		}
		else {
			a = this.classifyEditData.classify_a_id;
			b = this.classifyEditData.classify_b_id;
			c = this.classifyEditData.id;
		}
		// if (!this.deviceSellInfo.productRent || this.deviceSellInfo.productRent === null || this.deviceSellInfo.productRent <= 0) {
		// 	if(!this.deviceSellInfo.productCapacity || this.deviceSellInfo.productCapacity <= 0) {
		// 		this.message.warning('请填写正确设备租金');
		// 		return;
		// 	}
		// }
		// if (!this.deviceSellInfo.productPrice || this.deviceSellInfo.productPrice === null || this.deviceSellInfo.productPrice <= 0) {
		// 	if(!this.deviceSellInfo.productCapacity || this.deviceSellInfo.productCapacity <= 0) {
		// 		this.message.warning('请填写正确设备买断价格');
		// 		return;
		// 	}
		// }
		const data = {
			"version": "1.0",
			"modular": "product",
			"requestname": "editPP",
			"param": {
				"classifyA": a,   // 必传
				"classifyB": b,     // 必传（空用-1代替）
				"classifyC": c,    // 必传（空用-1代替）
				"productName": this.classifyEditData.name,   // 分类名称 必传
				"productRent": Number(this.deviceSellInfo.productRent) || 0,  // 租金  必传
				"productPrice": Number(this.deviceSellInfo.productPrice) || 0,   // 当前买断价格  必传
				"productDeposit": Number(this.deviceSellInfo.productDeposit) || 0,  // --押金  必传
				"productDays": Number(this.deviceSellInfo.productDays) || 0,   // --设备准备天数  必传
				"rentDays": Number(this.deviceSellInfo.rentDays) || 7,   // --起租天数  必传
				"productCapacity": Number(this.deviceSellInfo.productCapacity) || 0,  // -设备容量
				"productRemark": this.deviceSellInfo.des  // 备注
			}
		}
		this.isSpinning = true;
		this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
			if (res) {
				this.message.success('修改分类设备价格与租金成功');
				this.deviceSellInfo = JSON.parse(JSON.stringify(this.deviceSellInfoCopy));
			}
			this.isSpinning = false;
			this.close();
		});
	}
	// 添加顶级分类
	addTopClassify() {
		if (this.modalData.id === null || this.modalData.name === '') {
			this.message.error('未选择部门或未填写分类名');
			return;
		}
		this.isSpinning = true;
		this.Requset.post$('productmanager/addTopClassify', this.modalData).subscribe(res => {
			if (!res) return;
			this.message.success('添加成功');
			this.modalData = JSON.parse(JSON.stringify(this.modalDataCopy));
			this.isSpinning = false;
			this.modalDisplay = false;
		});
	}
	// 添加子分类
	addSubClassify() {
		if (this.subClassifuName === '') {
			this.message.error('请输入子分类名');
			return;
		}
		this.isSpinning = true;
		if (this.classifyEditData.level === 0) {
			const data = {
				classify_a_id: this.classifyEditData.id,
				name: this.subClassifuName,
				department: this.classifyEditData.department
			}
			this.Requset.post$('productmanager/addSecondClassify', data).subscribe(res => {
				if (!res) return;
				this.message.success('添加成功');
				this.subClassifuName = '';
				this.isSpinning = false;
			});
		} else if (this.classifyEditData.level === 1) {
			const data = {
				classify_a_id: this.classifyEditData.classify_a_id,
				classify_b_id: this.classifyEditData.id,
				name: this.subClassifuName,
				department: this.classifyEditData.department
			}
			this.Requset.post$('productmanager/addThirdClassify', data).subscribe(res => {
				if (!res) return;
				this.message.success('添加成功');
				this.subClassifuName = '';
				this.isSpinning = false;
			});
		}
	}
	// 修改分类名
	modifyName() {
		const data = {
			id: this.classifyEditData.id,
			name: this.classifyEditData.name,
			level: this.classifyEditData.level,
			manufactor: this.classifyEditData.manufactor,
			classify_type: this.classifyEditData.classify_type,
		}
		this.Requset.post$('productmanager/modifyName', data).subscribe(res => {
			if (res) {
				this.message.success('修改成功');
			}

		});
	}
	// 删除分类
	deleteClassify() {
		this.isSpinning = true;
		const data = {
			id: this.classifyEditData.id,
			level: this.classifyEditData.level
		}
		// 查询改分类下是否有商品
		this.Requset.post$('productmanager/hasProductOfClassify', data).subscribe(res => {
			if (!res) return;
			if (res.content.length > 0) {
				this.message.error(`该分类下有${res.content.length}个商品,请删除商品后再尝试`);
				this.isSpinning = false;
				return;
			}
			this.isSpinning = false;
			this.common.showConfirm('确定要删除该分类?', '删除分类会造成相关分类或商品失效，请谨慎操作', () => {
				this.isSpinning = true;
				this.Requset.post$('productmanager/deleteClassify', data).subscribe(res => {
					this.message.success('删除成功');
					this.close();
					this.isSpinning = false;
				});
			});
		});
	}
	// 封面图片改变时调用
	changeAvatar(info: { file: UploadFile }): void {
		switch (info.file.status) {
			case 'uploading':
				this.isSpinning = true;
				break;
			case 'done':
				// Get this url from response in real world.
				console.log(info);
				this.isSpinning = false;
				this.avatarUrl = info.file.response.content;
				this.saveImg();
				break;
			case 'error':
				this.message.error('Network error');
				this.isSpinning = false;
				break;
		}
	}
	// 描述图片改变时调用
	changeDesImg(info: { file: UploadFile }) {
		switch (info.file.status) {
			case 'uploading':
				this.isSpinning = true;
				break;
			case 'done':
				this.isSpinning = false;
				this.saveImg();
				break;
			case 'removed':
				this.isSpinning = false;
				this.saveImg();
				break;
			case 'error':
				this.message.error('Network error');
				this.isSpinning = false;
				break;
		}
	}
	// 上传保存图片
	saveImg() {
		this.isSpinning = true;
		setTimeout(() => {
			console.log(this.classifyEditData, this.deviceSellInfo, this.avatarUrl, this.desImgList);
			// 处理描述图片的保存
			let imgs = '';
			console.log(this.desImgList);
			if (this.desImgList.length > 0) {
				this.desImgList.forEach(x => {
					if(x.response) {
						imgs += `${x.response.content},`;
					}
					else if (x.name) {
						imgs += `${x.name},`;
					}
				});
				imgs = imgs.substr(0, imgs.length - 1);
			}
			// 判单修改分类的等级
			if (this.classifyEditData.level === 0) {
				const data = {
					"version": "1.0",
					"modular": "classes",
					"requestname": "updateClassA",
					"param": {
						"id": this.classifyEditData.id, // 必传
						"name": this.classifyEditData.name, // 必传
						"img": this.avatarUrl || 'default.jpg', // 必传
						"manufactor": this.classifyEditData.manufactor, // 必传
						"imgs": imgs
				    }
				}
				this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
					this.isSpinning = false;
				});
			} else if(this.classifyEditData.level === 1) {
				const data = {
					"version": "1.0",
					"modular": "classes",
					"requestname": "updateClassB",
					"param": {
						"id": this.classifyEditData.id, // 必传
						"name": this.classifyEditData.name, // 必传
						"img": this.avatarUrl || 'default.jpg', // 必传
						"classifyAId": this.classifyEditData.classify_a_id, // 必传
						"classifyType": this.classifyEditData.classify_type, // 必传
						"imgs": imgs
				    }
				}
				this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
					this.isSpinning = false;
				});
			} else if (this.classifyEditData.level === 2) {
				var data = {
					"version": "1.0",
					"modular": "classes",
					"requestname": "updateClassC",
					"param": {
						"id": this.classifyEditData.id, // 必传
						"name": this.classifyEditData.name, // 必传
						"img": this.avatarUrl || 'default.jpg', // 必传
						"classifyAId": this.classifyEditData.classify_a_id, // 必传
						"classifyBId": this.classifyEditData.classify_b_id, // 必传
						"classifyType": this.classifyEditData.classify_type, // 必传
						"imgs": imgs
				    }
				}
				this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
					this.isSpinning = false;
				});
			}
		}, 100);
	}

	open(): void {
		this.visible = true;
	}

	close(): void {
		this.visible = false;
		this.classifyEditData = JSON.parse(JSON.stringify(this.classifyEditDataCopy));
	}

}
