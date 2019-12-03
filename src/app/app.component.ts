import { Component } from '@angular/core';

declare var $: any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'ZdqAdminManager';
	ngOnInit() {
		// 全局表格点击选中效果
		$(document).on('click','.ant-table-row',function(){
			$('.ant-table-row').removeClass('selected');
			$(this).addClass('selected')
		});
	}
}
