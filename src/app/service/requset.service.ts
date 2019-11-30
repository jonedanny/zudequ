import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, retry, timeout } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
@Injectable({
	providedIn: 'root'
})
export class RequsetService {

	private readonly baseUrl:string = location.href.indexOf('http://localhost') !== -1 ? 'http://127.0.0.1/ZdpPhpManager/index.php?/' : 'http://122.114.177.171:8006/ZdpPhpManager/index.php?/';

	orgin = []; // 来源 人
	department = []; // 部门
	classA = []; // 分类A
	classB = []; // 分类B
	classC = []; // 分类C
	headers = null; // 头部求情信息
	constructor(
		private message: NzMessageService,
		private http: HttpClient
	) {
		if(localStorage.getItem('userLoginInfo')){
			this.headers = new HttpHeaders().set("Author", JSON.parse(localStorage.getItem('userLoginInfo')).token || '');
		}
	}

	/**
	 * 改变头部验证
	 */
	setHeaderToken(token) {
		this.headers = new HttpHeaders().set("author", token);
	}

	get$(url): Observable<any> {
		return this.http.get(this.baseUrl + url,{headers: this.headers}).pipe(
			map((res): any => {
				return res;
			})
		);
	}

	local_get$(url): Observable<any> {
		return this.http.get(url,{headers: this.headers}).pipe(
			map((res): any => {
				return res;
			})
		);
	}

	post$(url,data): Observable<any> {
		return this.http.post(this.baseUrl + url,data,{headers: this.headers}).pipe(
			map((res): any => {
				return this.handel(res);
			})
		);
	}

	handel(res) {
		if(res.success.toString() === 'true'){
			return res;
		}
		else{
			this.message.error(res.content);
			return null;
		}
	}
}
