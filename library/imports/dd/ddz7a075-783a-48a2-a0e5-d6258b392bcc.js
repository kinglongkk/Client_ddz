"use strict";
cc._RF.push(module, 'ddz7a075-783a-48a2-a0e5-d6258b392bcc', 'DDZRoomSet');
// script/game/DDZ/room/DDZRoomSet.js

"use strict";

/*
 *  ----------------------------------------------------------------------------------------------------
 *  @copyright: Copyright (c) 2004, 2010 Xiamen DDM Network Technology Co.,Ltd., All rights reserved.
 *  ----------------------------------------------------------------------------------------------------
 *  @package SSSRoomSet.js
 *  @todo: 十三水房间
 *
 *  @author hongdian
 *  @date 2014-10-30 16:04
 *  @version 1.0
 *
 *  修改时间 修改人 修改内容
 *  -------------------------------------------------------------------------------
 *
 */
var app = require("ddz_app");

/**
 * 类构造
 */
var DDZRoomSet = app.BaseClass.extend({

	/**
  * 初始化
  */
	Init: function Init() {

		this.JS_Name = "DDZRoomSet";

		this.ComTool = app[app.subGameName + "_ComTool"]();
		this.ShareDefine = app[app.subGameName + "_ShareDefine"]();

		this.OnReload();
		this.Log("Init");
	},

	OnReload: function OnReload() {
		this.dataInfo = {};
	},

	InitSetInfo: function InitSetInfo(setInfo) {
		console.log('InitSetInfo', setInfo);

		this.dataInfo = setInfo;
	},

	//-----------------------回调函数-----------------------------
	OnInitRoomSetData: function OnInitRoomSetData(setInfo) {
		this.InitSetInfo(setInfo);
		var state = this.dataInfo["state"];

		if (this.ShareDefine.DDZSetStateStringDict.hasOwnProperty(state)) {
			this.dataInfo["state"] = this.ShareDefine.DDZSetStateStringDict[state];
		} else {
			// this.ErrLog("OnInitRoomSetData state:%s not find", state);
		}
		this.Log("OnInitRoomSetData:", this.dataInfo);
	},

	OnSetStart: function OnSetStart(setInfo) {
		this.InitSetInfo(setInfo);
		this.dataInfo["state"] = this.ShareDefine.DDZSetState_FaPai;
	},

	OnSetPlaying: function OnSetPlaying(opPos, state) {
		this.dataInfo["opPos"] = opPos;
		this.dataInfo["state"] = state;
	},

	OnSetEnd: function OnSetEnd(setEnd) {
		this.dataInfo["setEnd"] = setEnd;
		this.dataInfo["state"] = this.ShareDefine.DDZSetState_End;
		this.Log("OnSetEnd:", this.dataInfo);
	},

	//----------------获取接口--------------------

	//获取set属性值
	GetRoomSetProperty: function GetRoomSetProperty(property) {
		if (!this.dataInfo.hasOwnProperty(property)) {
			this.ErrLog("GetSetProperty(%s) not find", property);
			return;
		}
		return this.dataInfo[property];
	},

	SetRoomSetProperty: function SetRoomSetProperty(property, value) {
		if (!this.dataInfo.hasOwnProperty(property)) {
			this.ErrLog("SetSetProperty(%s) not find", property);
			return;
		}
		this.dataInfo[property] = value;
	},

	GetRoomSetInfo: function GetRoomSetInfo() {
		return this.dataInfo;
	},

	GetHandCard: function GetHandCard() {
		var posInfo = this.dataInfo["posInfo"];
		for (var i = 0; i < posInfo.length; i++) {
			if (posInfo[i].pid == app[app.subGameName + "_HeroManager"]().GetHeroProperty("pid")) {
				return posInfo[i].cards;
			}
		}
	}

});

var g_DDZRoomSet = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
	if (!g_DDZRoomSet) g_DDZRoomSet = new DDZRoomSet();
	return g_DDZRoomSet;
};

cc._RF.pop();