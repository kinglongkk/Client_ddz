"use strict";
cc._RF.push(module, '4f15dJ/gldIs4zxOC3NVB65', 'ddz_SceneLogin');
// script/scene/ddz_SceneLogin.js

"use strict";

/*
 登陆场景
 */

var app = require("ddz_app");

cc.Class({
	extends: require(app.subGameName + "_BaseScene"),

	properties: {},

	//----------回掉函数------------------
	OnCreate: function OnCreate() {},

	//进入场景
	OnSwithSceneEnd: function OnSwithSceneEnd() {
		console.log("come in OnSwithSceneEnd");
		app.ddz_FormManager().ShowForm("ddz_UILogin");
	},

	OnTouchEnd: function OnTouchEnd(event) {}
});

cc._RF.pop();