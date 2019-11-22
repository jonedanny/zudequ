import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NzMessageService } from 'ng-zorro-antd/message';
import { RequsetService } from '../service/requset.service';
import { CommonDataService } from '../service/common-data.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    inner_userName = ''; // 登入用户名
    inner_password = ''; // 登入密码

    isSpinning = false; // loading
    isSaveLoginInfo = false; // 是否记住密码

    constructor(
        public router: Router,
        private message: NzMessageService,
        private common: CommonDataService,
        private Requset: RequsetService
    ) { }

    ngOnInit() {
        // 是否记住历史用户 登入信息
        let obj: any = localStorage.getItem('userInfo');
        if(obj){
            obj = JSON.parse(obj);
            this.inner_userName = obj.username;
            this.inner_password = obj.password;
            this.isSaveLoginInfo = true;
        }
    }
    // 登录
    login() {
        if(this.inner_userName === ''){
            this.message.error('请填写用户名');
            return;
        }
        if(this.inner_password === ''){
            this.message.error('请填写密码');
            return;
        }
        const data = {
            username: this.inner_userName,
            password: this.inner_password
        }
        this.isSpinning = true;
        this.Requset.post$('indexmanager/login',data).subscribe(res => {
            this.isSpinning = false;
            if(res){
                if(this.isSaveLoginInfo){
                    localStorage.setItem('userInfo',JSON.stringify(data));
                }
                this.common.userInfo = res.content[0];
                localStorage.setItem('userLoginInfo',JSON.stringify(this.common.userInfo));
                this.router.navigate(['main-container']);                
            }
        });
    }
    // 取消记住密码
    cancelSaveUserInfo() {
        if(this.isSaveLoginInfo === false){
            this.inner_userName = '';
            this.inner_password = '';
            localStorage.removeItem('userInfo');
        }
    }
}
