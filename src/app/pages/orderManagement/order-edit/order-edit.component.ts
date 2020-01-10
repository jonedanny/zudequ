import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
	selector: 'app-order-edit',
	templateUrl: './order-edit.component.html',
	styleUrls: ['./order-edit.component.scss']
})
export class OrderEditComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService
	) { }
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '2100px' };
	result = []; // 查询结果
	adminList; // 管理员列表
	storeList = []; // 店铺来源列表
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
		completed: 0,
		sort: null,
		flag: ''
	};
	fillterDataCopy = JSON.parse(JSON.stringify(this.fillterData));
	departmentList = null; // 部门列表
	visible = false; // 订单编辑框显示

	editData = null;

	displayDeleteColumn = false; // 订单删除提示
	deleteData = null; // 删除数据

	displayCompleteColumn = false; // 订单完成提示
	displayShiftCompleteColumn = false; // 提前订单完成提示
	completeData = null; // 完成数据

	displayAddDeviceColumn = false; // 商品添加
	currentAddPro = []; // 添加的商品
	addDeviceFilter = ''; // 查找添加的商品
	addDeviceList = []; // 查找添加的商品列表

	displayReturnCompleteColumn = false; // 商品归还

	removeDeviceOptionText = ''; // 删除商品后重新生成的字符串
	displayBuyoutColumn = false; // 买断提示
	orderDetail = []; // 订单明细

	synchronizationTime = 0; // 同步租赁时间 缩短或延迟

	/***
	 * 提前完成订单的参数
	 */
	shiftCompleteOrderData = {
		id: 0,
		freightPayer: '0',
		backRent: '0',
		days: 0,
		des: ''
	}

	/***
	 * 买断商品参数
	 */
	buyoutData = {
		"cid": null,  // 订单ID  必传 （整数)
		"pId": 0, // 设备ID必传
		"pName": "",  // -备编码 必传
		"price": null, //  设备价格  必传
		"des": "", // 备注说明
		"userName": "",
		"cdid": "" //订单明细ID
	}

	/**
	 * 归还商品的参数
	 */
	returnDeviceData = {
		"editType": 2,   // 操作状态  1新增  2删除   必传  （整数
		"id": '',   // 订单明细ID  必传  （整数）
		"pid": '',   // 设备产品ID  必传 （整数
		"cid": '',    // 订单ID  必传 （整数
		"des": '',    // 备注说明
		'endTime': '' // 租赁结束时间
	}

	shiftCompleteOrderDataCopy = JSON.parse(JSON.stringify(this.shiftCompleteOrderData));
	
	addModifyDeviceTime = null; // 修改添加设备的时间
	removeModifyDeviceTime = null; // 修改删除设备的时间

	ngOnInit() {
		this.common.initData(() => {
			this.departmentList = this.common.departmentList;
			this.adminList = this.common.adminList;
			this.storeList = this.common.store;
			this.search();
		});
	}
	// 过滤搜索
	search() {
		this.loading = true;
		this.Requset.post$('ordermanager/searchOrderList', this.fillterData).subscribe(res => {
			if(res) {
				this.result = res.content;
				this.total = res.total;
			}
			this.loading = false;
			console.log(this.result);
		});
	}
	// 排序
	sort(sort: { key: string; value: string }): void {
		console.log(sort);
		this.fillterData.sort = sort;
		this.search();
	}

	editOrderDeviceTime(event, type) {
		console.log(event, type)
		if (type === 'add') {
			this.addModifyDeviceTime = this.common.formatNormalTime(event);
		} else if (type === 'rejuce') {
			this.removeModifyDeviceTime = this.common.formatNormalTime(event);
		}
	}

	// 添加设备
	addDevice() {
		if(this.currentAddPro.length === 0) {
			this.message.warning('请添加商品');
			return;
		}
		if(this.addModifyDeviceTime === null) {
			this.message.warning('请填写商品起租日');
			return;
		}
		this.loading = true;
		let param = [];
		console.log(this.editData, this.currentAddPro,this.adminList);
		this.currentAddPro.forEach(x => {
			param.push({
				"pName": x.name,    // 设备商品名称   必传
				"cid": this.editData.id,  // 订单明细ID  必传 （整数
				"pid": x.id,  // 设备产品ID  必传 （整数
				"rent" : x.out_price,    // 设备单位租金 必传 （两位小数）
				"userid" : x.origin,    // 出租人ID（设备所有人ID） 必传 （整数
				"username" : this.systemIdChange(x.origin),   // 出租人姓名（设备所有人姓名） 必传
				"des": x.des   //  备注说明
			});
		});
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"editOrderProduct",
			"param":{
				"editType": 1,     // 操作状态  1新增  2删除   必传 （整数
				"startTime" :this.addModifyDeviceTime,  // 开始租赁时间（即订单开始时间） 必传
				"endTime" : this.editData.end,  // 结束租赁时间（即订单结束时间） 必传
				"details": param
			}
		}

		// 更新订单商品列表
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			this.message.success('添加商品成功');
			this.addModifyDeviceTime = null;
			this.displayAddDeviceColumn = false;
			this.currentAddPro = [];
			this.addDeviceFilter = '';
			this.addDeviceList = [];
			this.editData.option = null;
			this.viewOrderDetail(true,this.editData,false,() => {
				this.editData.option = this.orderDetail;
				this.loading = false;
			});
		});
	}
	// 删除设备
	removeDeviceWarning(item) {
		console.log(item);
		this.returnDeviceData.id = item.id;
		this.returnDeviceData.pid = item.pid;
		this.returnDeviceData.cid = item.cid;
		this.returnDeviceData.des = item.des;
		this.removeModifyDeviceTime = item.end_time;
		this.displayReturnCompleteColumn = true;
		console.log(this.removeModifyDeviceTime);
	}
	removeDevice() {
		if(this.removeModifyDeviceTime === null) {
			this.message.warning('请填写商品归还日');
			return;
		}
		this.loading = true;
		// 备注：添加商品已完成，缺少删除与添加删除后的状态更新，删除的商品更新由前端完成
		this.returnDeviceData.endTime = this.removeModifyDeviceTime;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"editOrderProduct",
			"param":this.returnDeviceData
		}
		// 归还商品
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			this.message.success('归还商品成功');
			this.removeModifyDeviceTime = null;
			this.displayReturnCompleteColumn = false;
			this.editData.option = null;
			this.viewOrderDetail(true,this.editData,false,() => {
				this.editData.option = this.orderDetail;
				this.loading = false;
			});
		});
	}

	addPro(item) {
		// 排除重复添加
		let isRepeat = false;
		for(let i = 0,r = this.currentAddPro.length; i < r; i ++) {
			if(this.currentAddPro[i].id === item.id) {
				isRepeat = true;
				break;
			}
		}
		if(isRepeat === false) {
			this.currentAddPro.push(item);
			return;
		}
		this.message.warning('不能重复添加商品');
	}
	removePro(item) {
		for(let i = 0,r = this.currentAddPro.length; i < r; i ++) {
			if(this.currentAddPro[i].id === item.id) {
				this.currentAddPro.splice(i,1);
				break;
			}
		}
	}
	// 更新当前订单编辑
	refreshOrderStatus() {
		this.Requset.post$('ordermanager/searchOrderForId', {id: this.editData.id}).subscribe(res => {
			let result = res.content[0];
			this.editData = result;
			this.loading = false;
		});
	}
	// 查找需添加的设备
	addDeviceFilterSearch() {
		this.loading = true;
		this.Requset.post$('ordermanager/addDeviceFilterSearch', {text: this.addDeviceFilter}).subscribe(res => {
			this.addDeviceList = res.content;
			this.loading = false;
		});
	}
	// 订单编辑
	edit(item) {
		this.visible = true;
		this.editData = item;
		this.editData.option = null;
		this.viewOrderDetail(true,item,false,() => {
			this.editData.option = this.orderDetail;
		});
	}
	// 保存编辑
	saveEdit() {
		this.loading = true;
		console.log(this.editData);
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"editOrder",
			"param":{
				"id" : this.editData.id,    // 订单ID
				"start" : this.editData.start,    // 开始时间 必传
				"end" : this.editData.end,     // 结束时间 必传
				"money" : this.editData.money,   // 订单金额 必传  （两位小数）
				"deposit" : this.editData.deposit,   // 押金  （整数）
				"origin" : this.editData.origin,    // 承租人
				"store" : this.editData.store,    // 来源
				"des" : this.editData.des,      // 说明备注
				"phone" : this.editData.phone         // 用户手机 必传
			}
		};
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			if(res && res.success) {
				this.message.success('修改成功');
				this.search();
			}
			this.loading = false;
		});
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
	// 删除订单
	deleteOrderWarning(item) {
		this.deleteData = item;
		this.displayDeleteColumn = true;
	}
	deleteOrder() {
		console.log(this.deleteData);
		for (let i = 0, r = this.deleteData.option.length; i < r; i++) {
			this.deleteData.option[i] = this.deleteData.option[i].replace(/^\s+|\s+$/g, '');
			this.deleteData.option[i] = this.deleteData.option[i].split(' ')[1];
		}
		this.Requset.post$('ordermanager/orderDelete', this.deleteData).subscribe(res => {
			this.message.success('删除成功');
			this.search();
		});
		this.displayDeleteColumn = false;
	}
	// 完成订单
	completeOrderWarning(item) {
		console.log(item);
		this.completeData = item;
		this.displayCompleteColumn = true;
	}
	completeOrder() {
		this.loading = true;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"orderCompleted",
			"param":{
				"id": this.completeData.id
			}
		}
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			if(res) {
				this.message.success('订单已完成');
				// 短信通知用户
				this.Requset.post$('javacontact/postMessageChangeQb',{
					realPay: Number(this.completeData.money),
					username: this.completeData.phone
				}).subscribe(res => {
					this.message.success('已发送短信通知客户');
					this.search();
				});
			}
			this.loading = false;
		});
		this.displayCompleteColumn = false;
	}
	// 提前完成订单
	shiftCompleteOrderWarning(item) {
		this.completeData = item;
		this.displayShiftCompleteColumn = true;
	}
	shiftCompleteOrder() {
		this.loading = true;
		this.shiftCompleteOrderData.id = this.completeData.id;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"aheadOrderCompleted",
			"param":this.shiftCompleteOrderData
		}
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			if(res) {
				this.message.success('订单已完成');
				this.search();
				this.shiftCompleteOrderData = JSON.parse(JSON.stringify(this.shiftCompleteOrderDataCopy));
			}
			this.loading = false;
		});
		this.displayShiftCompleteColumn = false;
	}
	// 买断商品
	buyOutDeviceWarning(item) {
		console.log(item);
		this.displayBuyoutColumn = true;
		this.buyoutData.cid = item.cid;
		this.buyoutData.pId = item.pid;
		this.buyoutData.pName = item.p_name;
		this.buyoutData.price = null;
		this.buyoutData.des = '';
		this.buyoutData.userName = item.userName;
		this.buyoutData.cdid = item.id
	}
	buyOutDevice() {
		if(this.buyoutData.price <= 0 || !this.buyoutData.price) {
			this.message.warning('请填写买断价格');
			return;
		}
		const buyoutDataCopy = JSON.parse(JSON.stringify(this.buyoutData));
		delete buyoutDataCopy.userName;
		const data = {
			"version":"1.0",
			"modular":"order",
			"requestname":"buyOut",
			"param": buyoutDataCopy
		}
		this.loading = true;
		this.Requset.post$('javacontact/javaContact', {data: JSON.stringify(data)}).subscribe(res => {
			if(res) {
				this.message.success('买断成功');
				this.displayBuyoutColumn = false;
				this.search();
			}
			this.loading = false;
		});
	}
	// 查看订单明细
	viewOrderDetail(event,item,viewAll,callback = function(){}) {
		this.orderDetail = [];
		if(event) {
			this.Requset.post$('ordermanager/viewOrderDetail', {cid: item.id, viewAll: viewAll}).subscribe(res => {
				console.log(res);
				this.orderDetail = res.content;
				callback();
			});
		}
	}
	// 编辑时间更改
	changedate(event,type) {
		console.log(event,type);
		// 格式化标准时间
		const date = this.common.formatNormalTime(event);
		if(type === 'start') {
			this.editData.start = date;
		} else if(type === 'end') {
			this.editData.end = date;
		}
	}
	__departmentText(value) {
		for (let i = 0, r = this.departmentList.length; i < r; i++) {
			if (this.departmentList[i].id === value) {
				return this.departmentList[i].name;
			}
		}
	}
	// 系统管理员 ID -> name
	systemIdChange(id) {
		for(let i = 0,r = this.adminList.length;i < r; i++){
			console.log(id,this.adminList[i].id,this.adminList[i].id == id)
			if(this.adminList[i].id == id) {
				return this.adminList[i].name;
			}
		}
	}
	// 时间同步
	synchronizationTimeDate() {
		console.log(this.editData);
		const start = this.changeDateTiem(this.editData.start, this.synchronizationTime);
		const end = this.changeDateTiem(this.editData.end, this.synchronizationTime);
		this.editData.start = start;
		this.editData.end = end;
	}
	// 加减时间
	changeDateTiem(date,days) {
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		console.log(d.getDate(), days);
		const m = d.getMonth() + 1;
		return d.getFullYear() + '-' + m + '-' + d.getDate();
	}
	// 订单关注
	orderCareful(index, item) {
		console.log(index, item);
		const flag = item.flag_careful === '1' ? '0' : '1';
		this.loading = true;
		this.Requset.post$('ordermanager/signOrder', {orderId: item.id, flag: flag}).subscribe(res => {
			console.log(res);
			if(res.success) {
				if(flag === '1') {
					this.message.success('已添加标记');
				} else {
					this.message.success('已取消标记');
				}
				this.result[index].flag_careful = flag;
			}
			this.loading = false;
		});
	}
}
