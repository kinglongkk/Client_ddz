"use strict";
cc._RF.push(module, 'ddz327b7-0ade-4678-8ff8-5f7c2fc0458d', 'ddz_SysNotifyManager');
// script/common/ddz_SysNotifyManager.js

"use strict";

/*
 *  ----------------------------------------------------------------------------------------------------
 *  @copyright: Copyright (c) 2004, 2010 Xiamen DDM Network Technology Co.,Ltd., All rights reserved.
 *  ----------------------------------------------------------------------------------------------------
 *  @package SysNotifyManager.js
 *  @todo: 系统通知模块
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
var ddz_SysNotifyManager = app.BaseClass.extend({

	/**
  * 初始化
  */
	Init: function Init() {

		this.JS_Name = app.subGameName + "_SysNotifyManager";

		this.SysDataManager = app.ddz_SysDataManager();
		this.NewSysMsg = this.SysDataManager.GetTableDict("NewSysMsg");

		this.ComTool = app.ddz_ComTool();
		this.ShareDefine = app.ddz_ShareDefine();

		//缓存的正则表达式字典
		this.regExpDict = {};

		app.ddz_NetManager().RegNetPack("S1010_SystemMessage", this.OnPack_ServerSysMsg, this);
	},

	//-----------------------回调函数-----------------------------
	/**
  * 接收封包
  */
	OnPack_ServerSysMsg: function OnPack_ServerSysMsg(serverPack) {
		//系统提示码
		var msgID = serverPack.key;
		var argList = serverPack.p || [];

		var count = argList.length;
		var msgArgList = [];
		for (var index = 0; index < count; index++) {

			var data = argList[index];

			if (data["StringValue"]) {
				msgArgList.push(data["StringValue"]);
			} else {
				msgArgList.push(data["IntValue"]);
			}
		}

		this.ShowSysMsg(msgID, msgArgList);

		app[app.subGameName + "Client"].OnEvent("ServerSysMsg", { "MsgID": msgID, "MsgArgList": msgArgList });
	},

	//-----------------------获取函数-----------------------------

	//获取系统提示文本
	GetSysMsgContentByMsgID: function GetSysMsgContentByMsgID(msgID, paramList) {

		if (!paramList) {
			paramList = [];
		}
		//如果查找不到系统提示码,则为纯文本弹框提示直接播放不解码
		if (!this.NewSysMsg.hasOwnProperty(msgID)) {
			this.ErrLog("GetSysMsgContentByMsgID(%s) NewSysMsg.txt not find", msgID);
			return "";
		}
		var msgInfo = this.NewSysMsg[msgID];
		var msgContent = msgInfo['Content'];

		return this.TranslateMsgContent(msgContent, paramList);
	},

	/**
  * 替换消息文本
  * @param msgID 消息ID
  * @return 无返回值
  * @remarks 
  */
	TranslateMsgContent: function TranslateMsgContent(msgContent, paramList) {

		var count = paramList.length;

		// 替换文本
		for (var index = 0; index <= count; index++) {

			var param = paramList[index];
			var argIndex = index + 1;
			var regExpObj = null;

			var regKeyString = this.ComTool.StringAddNumSuffix("S", argIndex, 1);
			if (msgContent.indexOf(regKeyString) != -1) {

				if (this.regExpDict.hasOwnProperty(regKeyString)) {
					regExpObj = this.regExpDict[regKeyString];
				} else {
					regExpObj = new RegExp("{" + regKeyString + "}", "g");
					this.regExpDict[regKeyString] = regExpObj;
				}
				msgContent = msgContent.replace(regExpObj, param);
			}
		}

		return msgContent;
	},

	/**
  * 显示系统提示
  * @param msgID
  */
	ShowSysMsg: function ShowSysMsg(msgID) {
		var msgArgList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

		var msgContent = "";
		var msgPos = 0;
		//如果查找不到系统提示码,则为纯文本弹框提示直接播放不解码
		if (this.NewSysMsg.hasOwnProperty(msgID)) {
			var msgInfo = this.NewSysMsg[msgID];
			msgPos = msgInfo["Pos"];

			msgContent = msgInfo['Content'];
			msgContent = this.TranslateMsgContent(msgContent, msgArgList);
		} else {
			msgPos = 4;
			msgContent = msgID;
		}

		//出现位置 1系统广播(不允许主动调用这种类型,只能又聊天系统频道下发)
		if (msgPos == 1) {
			this.ErrLog("ShowSysMsg(%s) error", msgID);
		}
		//只触发事件不显示提示,由事件自己决定(服务端下发客户端弹2次确认框等待点击)
		else if (msgPos == 2) {}
			//浮动提示
			else if (msgPos == 3) {
					app.ddz_FormManager().ShowForm(app.subGameName + "_UIMessage_Drift", msgID, msgArgList, msgContent);
				}
				//"确定" 弹框提示
				else if (msgPos == 4) {
						console.log("msgContent ==" + msgContent);
						app.ddz_FormManager().ShowForm(app.subGameName + "_UIMessage", "OnSys", this.ShareDefine.ConfirmOK, msgID, msgArgList, msgContent);
					}
					//"是","否"" 弹框提示
					else if (msgPos == 5) {
							var ConfirmManager = app.ddz_ConfirmManager();
							ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, []);
							ConfirmManager.ShowConfirm(this.ShareDefine.ConfirmYN, msgID, msgArgList);
						} else {
							this.ErrLog("ShowSysMsg(%s) msgPos(%s) error", msgID, msgPos);
						}
	},

	OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
		if (clickType == "Sure") {
			// this.Log("打开客服QQ");
		}
	}

});

var g_ddz_SysNotifyManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
	if (!g_ddz_SysNotifyManager) g_ddz_SysNotifyManager = new ddz_SysNotifyManager();
	return g_ddz_SysNotifyManager;
};

cc._RF.pop();