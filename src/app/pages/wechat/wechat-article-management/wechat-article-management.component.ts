import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequsetService } from '../../../service/requset.service';
import { CommonDataService } from '../../../service/common-data.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import * as wangEditor from '../../../../../node_modules/wangeditor/release/wangEditor.js';

@Component({
	selector: 'app-wechat-article-management',
	templateUrl: './wechat-article-management.component.html',
	styleUrls: ['./wechat-article-management.component.scss']
})
export class WechatArticleManagementComponent implements OnInit {

	constructor(
		public common: CommonDataService,
		private message: NzMessageService,
		private Requset: RequsetService,
		private modal: NzModalService
	) { }
	
	confirmModal: NzModalRef;
	tableScroll = { y: `${document.body.clientHeight - 350}px`, x: '760px' };
	result = []; // 查询结果
	total = 0;
	fillterData = {
		page: 1,
		rows: 25
	};
	addColumnDisplay: boolean = false; // 显示添加
	articleData = {
		title: '',
		content: '',
		source: '租得趣电玩租赁',
		id: ''
	};
	isSpinning = true; // 数据加载loading
	editor: any;

	ngOnInit() {
		this.searchData();
	}
	searchData() {
		this.isSpinning = true;
		this.Requset.post$('wechat/wechatArticle', this.fillterData).subscribe(res => {
			this.result = res.content;
			console.log(this.result);
			this.isSpinning = false;
		});
	}
	// 保存
	save() {
		console.log(this.articleData);
		this.isSpinning = true;
		let data;
		// 文章内容赋值
		this.articleData.content = this.editor.txt.html().indexOf('d_new_article') !== -1 ? this.editor.txt.html() : `<div class="d_new_article" style="padding: 0 30px;">${this.editor.txt.html()}</div>`;

		if (this.articleData.id !== '') {
			data = {
				"version": "1.0",
				"modular": "article",
				"requestname": "editArticle",
				"param": {
					"id": this.articleData.id,
					"title": this.articleData.title,
					"content": this.articleData.content,
					"source": this.articleData.source
				}
			}
		} else {
			data = {
				"version": "1.0",
				"modular": "article",
				"requestname": "saveArticle",
				"param": {
					"title": this.articleData.title,
					"content": this.articleData.content,
					"source": this.articleData.source
				}
			}
		}
		this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
			this.message.success('操作成功');
			this.addColumnDisplay = false;
			this.isSpinning = false;
			this.articleData = {
				title: '',
				content: '',
				source: '租得趣电玩租赁',
				id: ''
			};
			this.clearData();
			this.searchData();
		});
	}
	// 编辑
	edit(item) {
		this.articleData = {
			title: item.title,
			content: item.content,
			source: item.source,
			id: item.id
		};
		this.open();
	}
	// 删除
	delete(item) {
		console.log(item);
		this.modal.confirm({
			nzTitle: '提示',
			nzContent: '确定要删除 "'+ item.title +'" 这篇文章吗?',
			nzOnOk: () => {
				this.isSpinning = true;
				const data = {
					"version": "1.0",
					"modular": "article",
					"requestname": "deleteArticle",
					"param": {
						"id": item.id
					}
				}
				this.Requset.post$('javacontact/javaContact', { data: JSON.stringify(data) }).subscribe(res => {
					this.message.success('操作成功');
					this.clearData();
					this.searchData();
				});
			}
		});
	}
	// 清除数据
	clearData() {
		this.articleData = {
			title: '',
			content: '',
			source: '租得趣电玩租赁',
			id: ''
		};
	}
	open(type?) {
		if (!this.editor) {
			this.editor = new wangEditor('#editor');
			this.editor.customConfig.uploadImgServer = 'http://122.114.177.171:8180/imgUpload/upload';
			this.editor.customConfig.uploadImgMaxLength = 1;
			this.editor.customConfig.uploadImgMaxSize = 3 * 1024 * 1024;
			this.editor.customConfig.uploadFileName = 'byqFile';
			this.editor.customConfig.uploadImgHeaders = {
				'Accept': 'application/json, text/plain, */*',
				'X-Requested-With': 'XMLHttpRequest'
			}
			this.editor.customConfig.uploadImgHooks = {
				customInsert: function (insertImg, result) {
					if(result.success) {
						var url = `https://www.zudequ.com/cmd/images/${result.content}`;
						insertImg(url);
					} else {
						this.message.console.error('上传失败');
					}
				}
			}
			console.log(this.editor.customConfig);
			this.editor.create();
		}
		this.editor.txt.html('');
		if(type === 'add') {
			this.clearData();
		}
		else {
			this.editor.txt.html(this.articleData.content);
		}
		this.addColumnDisplay = true;
	}
	close() {
		this.addColumnDisplay = false;
	}
}
