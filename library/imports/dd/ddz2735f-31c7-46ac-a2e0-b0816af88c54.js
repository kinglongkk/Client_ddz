"use strict";
cc._RF.push(module, 'ddz2735f-31c7-46ac-a2e0-b0816af88c54', 'ddz_UILayer');
// script/scene/Layer/ddz_UILayer.js

"use strict";

/*
 场景UI层
 */
var app = require("ddz_app");

cc.Class({
	extends: cc.Component,

	properties: {},

	OnCreate: function OnCreate(sceneType) {
		this.JS_Name = [sceneType, "UILayer"].join("_");
	}

});

cc._RF.pop();