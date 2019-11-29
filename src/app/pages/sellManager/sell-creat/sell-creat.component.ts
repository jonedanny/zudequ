import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-sell-creat',
	templateUrl: './sell-creat.component.html',
	styleUrls: ['./sell-creat.component.scss']
})
export class SellCreatComponent implements OnInit {

	constructor(
		private message: NzMessageService,
		private common: CommonDataService,
		private Requset: RequsetService
	) { }

	adminList; // 管理员列表
	userLoginInfo = JSON.parse(localStorage.getItem('userLoginInfo'));

	isSpinning = false; // 数据加载loading

	textInfo = {
		name: '', // 商品名称
		sku: '', // 商品序列号
		guarantee: '1年', // 保修（半年、1年、2年）
		price: null,
		des: '', // 备注
		user: '', // 购买人
		operater: this.userLoginInfo.name // 操作员
	};
	textInfoCopy = JSON.parse(JSON.stringify(this.textInfo));

	ngOnInit() {
		this.common.initData(() => {
			this.adminList = this.common.adminList;
			console.log(this.adminList);
		});
	}
	// 提交
	submitForm() {
		if(this.validate()) {
			this.isSpinning = true;
			this.Requset.post$('productmanager/addSoldDevice',this.textInfo).subscribe(res => {
				if(res) {
					this.textInfo = JSON.parse(JSON.stringify(this.textInfoCopy));
					this.message.success('添加销售单成功');
				}
				this.isSpinning = false;
			});
		}
	}
	// 提交数据验证
	validate() {
		if (this.textInfo.name === '') {
			this.message.error('请填写商品名称');
			return false;
		}
		if (this.textInfo.sku === '') {
			this.message.error('商品序列号');
			return false;
		}
		if (this.textInfo.price === '' || this.textInfo.price === null) {
			this.message.error('请填写商品价格');
			return false;
		}
		if (this.textInfo.user === '') {
			this.message.error('请填写购买人');
			return false;
		}
		return true;
	}
}
