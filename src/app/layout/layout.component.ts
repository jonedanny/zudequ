import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequsetService } from '../service/requset.service';
import { CommonDataService } from '../service/common-data.service';

@Component({
	selector: 'app-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

	breadcrumb: Array<any> = []; // 导航
	navList: Array<any> = []; // 菜单
	chooseNav: string = ''; // 当前选中的菜单
	isCollapsed = false; // 判断主菜单是否展开

	userLoginInfo = JSON.parse(localStorage.getItem('userLoginInfo'));
	constructor(
		private common: CommonDataService,
		public router: Router,
		private route: ActivatedRoute,
		private Requset: RequsetService
	) {
		// 加载菜单
		this.Requset.local_get$('assets/json/nav.json').subscribe(res => {
			this.navList = res;
		});
	}

	ngOnInit() {
		this.route.url.subscribe(() => {
			const currentPath = location.href.split('main-container');
			if(currentPath[1]) {
				this.chooseNav = currentPath[1].replace('/','');
			}
			else {
				this.chooseNav = 'DataOverviewComponent';
			}
			setTimeout(() => {
				this.locationNav();
			},50);
		});
	}
	// 页面跳转
	changePage(url) {
		this.router.navigate([`main-container/${url}`]);
		this.locationNav();
	}
	// 定位导航
	locationNav() {
		this.breadcrumb = [];
		for(let i=0,r=this.navList.length;i<r;i++) {
			if(this.navList[i].url && this.navList[i].url === this.chooseNav) {
				this.breadcrumb.push(this.navList[i].name);
				break;
			}
			if(this.navList[i].child) {
				for(let s=0,k=this.navList[i].child.length;s<k;s++) {
					if(this.navList[i].child[s].url === this.chooseNav) {
						this.breadcrumb.push(this.navList[i].name);
						this.breadcrumb.push(this.navList[i].child[s].name);
					}
				}
			}
		}
	}
	// 登出
	logout() {
		this.Requset.get$('indexmanager/loginOut').subscribe(res => {
			if(res){
				localStorage.removeItem('userLoginInfo');
				this.router.navigate(['Login']);                
			}
		});
	}
}
