import { Injectable } from '@angular/core';
import { RequsetService } from '../service/requset.service';
import { Observable, forkJoin } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Injectable({
	providedIn: 'root'
})
export class CommonDataService {

	constructor(
		private Requset: RequsetService,
		private modal: NzModalService
	) { }

	confirmModal: NzModalRef;
	productClassify = { a: [], b: [], c: [] }; // 商品分类 数据
	departmentList = []; // 部门列表
	adminList = []; // 管理员列表
	userInfo = {}; // 登录用户信息

	// 获取设备列表
	getDeviceList(userId: string = ''): Observable<any> {
		return this.Requset.post$('devicemanager/searchDeviceId', { userId: userId });
	}

	// 获取管理员列表
	getAdminList$(): Observable<any> {
		return this.Requset.get$('indexmanager/getAdminList');
	}

	// 获取部门列表
	getDepartmentList(): Observable<any> {
		return this.Requset.get$('indexmanager/getDepartmentList');
	}

	// 获取分类1
	getClassifyA$(): Observable<any> {
		return this.Requset.get$('indexmanager/getClassifyA');
	}

	// 获取分类2
	getClassifyB$(): Observable<any> {
		return this.Requset.get$('indexmanager/getClassifyB');
	}

	// 获取分类3
	getClassifyC$(): Observable<any> {
		return this.Requset.get$('indexmanager/getClassifyC');
	}

	// 查询自己的历史明细合计租金
	getSelfAllLeaseMoney$(userId): Observable<any> {
		return this.Requset.post$('devicemanager/searchLeaseDetail', { userId: userId });
	}

	// 查询客户列表
	getCustomerList$(start, end): Observable<any> {
		return this.Requset.post$('indexmanager/getCustomerList', { start: start, end: end });
	}

	// 刷新分类列表
	refreshProductClassify(callback = () => { }) {
		forkJoin(this.getClassifyA$(), this.getClassifyB$(), this.getClassifyC$(), this.getAdminList$()).subscribe(([$res1, $res2, $res3, $res4]) => {
			this.productClassify.a = $res1.content;
			this.productClassify.b = $res2.content;
			this.productClassify.c = $res3.content;
			this.adminList = $res4.content;
			callback();
		});
	}

	// 刷新部门列表
	refreshDepatment(callback = () => { }) {
		this.getDepartmentList().subscribe(res => {
			this.departmentList = res.content;
			callback();
		});
	}


	// 初始需要加载的数据
	initData(callback = () => { }) {
		const self = this;
		function* stopFun() {
			yield;
			callback();
		}
		let turn = stopFun();
		// 刷新商品分类 && 刷新部门
		this.refreshProductClassify(() => {
			turn.next();
		});
		this.refreshDepatment(() => {
			turn.next();
		});
	}

	// 格式化时间
	formatTime(date: Date, type: number = 1) {
		const d = date;
		const resDate = d.getFullYear() + '-' + p((d.getMonth() + 1)) + '-' + p(d.getDate());
		const resTime = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
		function p(s) {
			return s < 10 ? '0' + s : s
		}
		if (type === 1) {
			return resDate;
		}
		else if (type === 2) {
			return resDate + ' ' + resTime;
		}
	}

	// 格式化标准时间
	formatNormalTime(date) {
		const d = new Date(date);
		return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
	}
	// 部门ID转名字
	departmentTranslate(id) {
		for (let i = 0, r = this.departmentList.length; i < r; i++) {
			if (this.departmentList[i].id === id) {
				return this.departmentList[i].name;
			}
		}
		return '';
	}
	// 分类A ID转名字
	classifyATranslate(id) {
		for (let i = 0, r = this.productClassify.a.length; i < r; i++) {
			if (this.productClassify.a[i].id === id) {
				return this.productClassify.a[i].name;
			}
		}
		return '';
	}
	// 分类B ID转名字
	classifyBTranslate(id) {
		for (let i = 0, r = this.productClassify.b.length; i < r; i++) {
			if (this.productClassify.b[i].id === id) {
				return this.productClassify.b[i].name;
			}
		}
		return '';
	}
	// 分类C ID转名字
	classifyCTranslate(id) {
		for (let i = 0, r = this.productClassify.c.length; i < r; i++) {
			if (this.productClassify.c[i].id === id) {
				return this.productClassify.c[i].name;
			}
		}
		return '';
	}
	// 管理员转换名字
	adminListTranslate(id) {
		for (let i = 0, r = this.adminList.length; i < r; i++) {
			if (this.adminList[i].id === id) {
				return this.adminList[i].name;
			}
		}
		return '';
	}
	// 排序
	jsonSort(array, field, reverse) {
		//数组长度小于2 或 没有指定排序字段 或 不是json格式数据
		if (array.length < 2 || !field || typeof array[0] !== "object") return array;
		//数字类型排序
		if (typeof array[0][field] === "number") {
			array.sort(function (x, y) { return x[field] - y[field] });
		}
		//字符串类型排序
		if (typeof array[0][field] === "string") {
			array.sort(function (x, y) { return x[field].localeCompare(y[field]) });
		}
		//倒序
		if (reverse) {
			array.reverse();
		}
		return array;
	}
	// 店铺来源
	store = [
		{ id: 0, name: '租得趣' },
		{ id: 1, name: '支付宝' },
		{ id: 2, name: '白租' },
		{ id: 3, name: '工作室' }
	];
	//计算天数差的函数，通用  
	DateDiff(sDate) {    //sDate1和sDate2是xxxx-xx-xx格式  
		const d1 = new Date(sDate.replace(/\-/g, '/'));
		const d2 = new Date();
		var iDays = parseInt((Math.abs(d1.getTime() - d2.getTime()) / 1000 / 60 / 60 / 24).toString());    //把相差的毫秒数转换为天数  
		return iDays;
	}
	//计算2个天数的差值
	DateDiffNormal(sDate,eDate) {    //sDate1和sDate2是xxxx-xx-xx格式  
		const d1 = new Date(sDate.replace(/\-/g, '/'));
		const d2 = new Date(eDate.replace(/\-/g, '/'));
		var iDays = parseInt((Math.abs(d1.getTime() - d2.getTime() - 86400000) / 1000 / 60 / 60 / 24).toString());    //把相差的毫秒数转换为天数  
		return iDays;
	}
	//自动计算日期加天数后的日期
	calcAddNumDate(date,num) {
		const timeStamp = new Date(date.replace(/\-/g, '/')).getTime();
		const addStamp = num * 1000 * 60 * 60 * 24;
		return this.timestampToTime(timeStamp + addStamp);
	}
	//时间戳转日期
	timestampToTime(timestamp) {
		const dateObj = new Date(+timestamp) // ps, 必须是数字类型，不能是字符串, +运算符把字符串转化为数字，更兼容
		const year = dateObj.getFullYear() // 获取年，
		const month = dateObj.getMonth() + 1 // 获取月，必须要加1，因为月份是从0开始计算的
		const date = dateObj.getDate() // 获取日，记得区分getDay()方法是获取星期几的。
		return year + '-' + month + '-' + date;
	}
	showConfirm(title, content, callback): void {
		this.confirmModal = this.modal.confirm({
			nzTitle: title,
			nzContent: content,
			nzOnOk: () => {
				callback();
			}
		});
	}
}
