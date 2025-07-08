/*
    主场景
*/

var app = require("ddz_app");

cc.Class({
    extends: require(app.subGameName + "_BaseScene"),

    properties: {
    },
    //------回掉函数-------------------
    OnCreate:function(){
    	
    },
    
    //进入场景
    OnSwithSceneEnd:function(){


    },

	//显示动态设置的默认界面
	OnShowDefaultForm:function(){
		// let formNameList = app.ddz_FormManager().GetDefaultFormNameList();
		// let count = formNameList.length;
		// if(count){
		// 	for(let index=0; index<count; index++){
		// 		app.ddz_FormManager().ShowForm(formNameList[index]);
		// 	}
		// }
		// else{
        app.ddz_FormManager().ShowForm(app.subGameName + "_UIMain");
		// }
		// app.ddz_FormManager().ClearDefaultFormNameList();
	},
});
