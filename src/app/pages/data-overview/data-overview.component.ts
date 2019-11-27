import { Component, OnInit } from '@angular/core';
import { RequsetService } from '../../service/requset.service';
import { CommonDataService } from '../../service/common-data.service';
import { EChartOption } from 'echarts';

@Component({
	selector: 'app-data-overview',
	templateUrl: './data-overview.component.html',
	styleUrls: ['./data-overview.component.scss']
})
export class DataOverviewComponent implements OnInit {

	constructor(
		private common: CommonDataService,
		private Requset: RequsetService
	) { }

	isSpinning = false; // loading
	userLoginInfo = JSON.parse(localStorage.getItem('userLoginInfo'));

	productAll: number = 0; // 设备总数
	productLeased: number = 0; // 正在出租的设备
	allLeaseComein: number = 0; // 租金总收入 (CNY)
	investmentMoney: number = 0; // 已投入的总资金 (CNY)
	annualizedRate: number = 0; // 年化率
	maintenanceDevice: number = 0; // Maintenance

	start: string = ''; // 查询客户列表筛选起始时间
	end: string = ''; //  查询客户列表筛选结束时间
	date: any;
	customerList: Array<any> = []; // 客户列表
	customerTotal: number = 0; // 客户总量

	chartOption: EChartOption; // 图表
	recentlyComein: Array<any> = []; // 获取客户最近200条租金收入数据
	recentlyComeinDetail: boolean = false;
	recentlyDevice: Array<any> = []; // 获取客户最近200条设备采购数据
	recentlyDeviceDetail: boolean = false;
	customerCalcEchartsData = {
		days: [],
		count: []
	}

	ngOnInit() {
		this.getSelfAllProInfo();
		this.getSelfAllLeaseMoney();
		this.getAllcustomer();
		this.getCustomerRecentlyComein();
		this.getCustomerRecentlyDevice();
	}
	// 获取客户租金收入
	getCustomerRecentlyComein() {
		this.Requset.post$('indexmanager/getCustomerRecentlyComein',{userId:this.userLoginInfo.id}).subscribe(res => {
			this.recentlyComein = res.content;
		});
	}
	// 获取客户设备添加信息
	getCustomerRecentlyDevice() {
		this.Requset.post$('indexmanager/getCustomerRecentlyDevice',{userId:this.userLoginInfo.id}).subscribe(res => {
			this.recentlyDevice = res.content;
		});
	}

	// 获取自己设备所有信息
	getSelfAllProInfo() {
		this.common.getDeviceList(this.userLoginInfo.id).subscribe(res => {
			const data = res.content
			this.productAll = 0;
			this.productLeased = 0;
			this.investmentMoney = 0;

			this.productAll = data.length;
			for (let i = 0, r = data.length; i < r; i++) {
				this.investmentMoney += Number(data[i].price);
				if (data[i].is_sell === '1') {
					this.productLeased++;
				}
			}
			this.calcAnnualizedRate();
		});
	}
	// 查询租金总收入
	getSelfAllLeaseMoney() {
		this.allLeaseComein = 0;
		this.common.getSelfAllLeaseMoney$(this.userLoginInfo.id).subscribe(res => {
			const data = res.content;
			for (let i = 0, r = data.length; i < r; i++) {
				this.allLeaseComein += Number(data[i].profit);
			}
			this.calcAnnualizedRate();
		});
	}
	// 统计年化率
	calcAnnualizedRate() {
		if(this.investmentMoney !== 0 && this.allLeaseComein !== 0) {
			// 计算投资的时间
			const _date = Number(this.common.DateDiff("2019-08-15"));
			this.annualizedRate = (this.allLeaseComein / this.investmentMoney) / _date * 365 * 100;
		}
	}
	// 查询所有客户
	getAllcustomer() {
		this.customerTotal = 0;
		this.common.getCustomerList$(this.start, this.end).subscribe(res => {
			if(res) {
				const data = res.content;
				// console.log('[查询所有客户]', data);
				for (let i = 0, r = data.length; i < r; i++) {
					this.customerCalcEchartsData.days.push(data[i].days);
					this.customerCalcEchartsData.count.push(data[i].COUNT);
					this.customerTotal += Number(data[i].COUNT);
				}
				console.log(this.customerCalcEchartsData)
				this.drawCharts();
			}
		});
	}
	// 客户时间过滤
	onChangeTime(event) {
		if (event === false && this.date.length === 2) {
			this.start = this.common.formatTime(this.date[0]);
			this.end = this.common.formatTime(this.date[1]);
			this.getAllcustomer();
		}
	}
	// 是否清空时间
	isClearTime() {
		if (this.date.length === 0) {
			this.start = '';
			this.end = '';
			this.getAllcustomer();
		}
	}
	// 客户统计图表
	drawCharts() {
		this.chartOption = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985'
					}
				},
				showContent: false
			},
			grid: {
				left: 30,
				top: 30,
				bottom: 80,
				right: 5
			},
			dataZoom: [{
				type: 'slider',
				start: 90,
				end: 100
			}],
			xAxis: {
				axisTick: {
					show: false
				},
				axisLine: {
					show: false
				},
				z: 10,
				data: this.customerCalcEchartsData.days,
				axisLabel: {
					color: '#aaa'
				}
			},
			yAxis: {
				name: '数量 / 人',
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					color: '#aaa'
				}
			},
			series: [
				{
					data: this.customerCalcEchartsData.count,
					type: 'bar',
					itemStyle: {
						normal: {color: 'rgba(0,0,0,0.05)'}
					},
					barGap:'-100%',
					barCategoryGap:'40%',
					animation: false
				},
				{
					name: '新增客户数',
					type: 'bar',
					itemStyle: {
						color: '#40a9ff'
					},
					label: {
						normal: {
							show: true,
							position: 'top',
							color: '#000'
						}
					},
					data: this.customerCalcEchartsData.count
				}
			]
		}
	}
}
