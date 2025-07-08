"use strict";
cc._RF.push(module, 'ddze6f41-6970-45e7-ac7a-b23dee8e2364', 'ddz_SceneMain');
// script/scene/ddz_SceneMain.js

"use strict";

/*
    主场景
*/

var app = require("ddz_app");

cc.Class({
    extends: require(app.subGameName + "_BaseScene"),

    properties: {},
    //------回掉函数-------------------
    OnCreate: function OnCreate() {},

    //进入场景
    OnSwithSceneEnd: function OnSwithSceneEnd() {},

    //显示动态设置的默认界面
    OnShowDefaultForm: function OnShowDefaultForm() {
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
    }
});

cc._RF.pop();