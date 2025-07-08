(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/game/DDZ/room/DDZRoomPosMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddzf2054-919a-4aa1-90cc-f6bb37e66847', 'DDZRoomPosMgr', __filename);
// script/game/DDZ/room/DDZRoomPosMgr.js

"use strict";

/*
 *  ----------------------------------------------------------------------------------------------------
 *  @copyright: Copyright (c) 2004, 2010 Xiamen DDM Network Technology Co.,Ltd., All rights reserved.
 *  ----------------------------------------------------------------------------------------------------
 *  @package SSSRoomPosMgr.js
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
var DDZRoomPosMgr = app.BaseClass.extend({

	/**
  * 初始化
  */
	Init: function Init() {

		this.JS_Name = "DDZRoomPosMgr";

		this.ComTool = app[app.subGameName + "_ComTool"]();
		this.ShareDefine = app[app.subGameName + "_ShareDefine"]();
		this.WeChatManager = app[app.subGameName + "_WeChatManager"]();

		// S2228_LostConnect
		this.OnReload();

		this.Log("Init");
	},

	OnReload: function OnReload() {

		this.dataInfo = {};

		this.clientPos = -1;
		this.downPos = -1;
		this.upPos = -1;
		this.facePos = -1;
		this.posCount = -1;
	},

	//-----------------------回调函数-----------------------------
	OnInitRoomPosData: function OnInitRoomPosData(roomPosInfoList) {
		this.dataInfo = {};

		this.clientPos = -1;
		this.downPos = -1;
		this.upPos = -1;
		this.facePos = -1;
		this.posCount = -1;
		var heroImageUrlDict = {};
		var heroID = app[app.subGameName + "_HeroManager"]().GetHeroID();
		this.posCount = roomPosInfoList.length;

		for (var index = 0; index < this.posCount; index++) {
			var roomPosInfo = roomPosInfoList[index];
			var pos = roomPosInfo["pos"];
			this.dataInfo[pos] = roomPosInfo;

			var pid = roomPosInfo["pid"];
			var headImageUrl = roomPosInfo["headImageUrl"];
			if (pid == heroID) {
				this.clientPos = pos;
			}
			if (pid && headImageUrl) {
				heroImageUrlDict[pid] = headImageUrl;
			}
		}

		this.WeChatManager.InitHeroHeadImageByDict(heroImageUrlDict);
		// if(this.clientPos < 0){
		// 	this.ErrLog("OnInitRoomPosData clientPos not find");
		// }
		// else{
		// 	let posNum = 4;
		// 	if(this.posCount != 2){
		// 		this.upPos = (this.clientPos + posNum - 1)%posNum;
		// 		this.downPos = (this.clientPos + 1)%posNum;
		// 		this.facePos = (this.clientPos + 2)%posNum;

		// 	}
		// 	else
		// 		this.facePos = this.clientPos == 0 ? 1 : 0;

		// 	this.Log("upPos(%s) clientPos(%s) downPos(%s) facePos(%s)", this.upPos, this.clientPos, this.downPos, this.facePos);
		// }

		this.upPos = (this.clientPos + this.posCount - 1) % this.posCount;
		this.downPos = (this.clientPos + 1) % this.posCount;
		this.facePos = (this.clientPos + 2) % this.posCount;

		this.Log("OnInitRoomPosData:", this.dataInfo);
	},
	//获取房间有几个玩家
	GetRoomPlayerCount: function GetRoomPlayerCount() {
		return this.posCount;
	},
	UpdateOwnerID: function UpdateOwnerID(ownerID) {
		this.dataInfo['ownerID'] = ownerID;
	},

	OnPosLeave: function OnPosLeave(pos) {
		var playerInfo = this.dataInfo[pos];
		if (!playerInfo) {
			this.ErrLog("OnPosLeave not find:%s", pos);
			return;
		}
		playerInfo["pid"] = 0;
		playerInfo["name"] = 0;
		playerInfo["roomReady"] = false;
		playerInfo["gameReady"] = false;
		playerInfo["giveUpGame"] = 0;
		playerInfo["point"] = 0;
		playerInfo["flashCnt"] = 0;
		playerInfo["paiPin"] = 0;
		playerInfo["up"] = 0;
		playerInfo["down"] = 0;
	},

	//座位信息更新
	OnPosUpdate: function OnPosUpdate(pos, posInfo) {
		var playerInfo = this.dataInfo[pos];
		if (!playerInfo) {
			this.Log("OnPosUpdate not find:%s", pos);
			return false;
		}
		this.dataInfo[pos] = posInfo;

		var heroID = posInfo["pid"];
		var headImageUrl = posInfo["headImageUrl"];
		if (heroID && headImageUrl) {
			this.WeChatManager.InitHeroHeadImage(heroID, headImageUrl);
		}

		return true;
	},

	OnPosIsReady: function OnPosIsReady(pos, isReady) {
		var playerInfo = this.dataInfo[pos];
		if (!playerInfo) {
			this.Log("onPosTotalJifen not find:%s", pos);
			return false;
		}
		playerInfo.isCardReady = isReady;
	},

	//开局准备
	OnPosReadyChg: function OnPosReadyChg(pos, roomReady) {
		var playerInfo = this.dataInfo[pos];
		if (!playerInfo) {
			this.Log("OnPosReadyChg not find:%s", pos);
			return false;
		}
		playerInfo["roomReady"] = roomReady;

		return true;
	},

	//准备下一句
	OnPosContinueGame: function OnPosContinueGame(pos) {
		var playerInfo = this.dataInfo[pos];
		if (!playerInfo) {
			this.ErrLog("OnPosContinueGame not find:%s", pos);
			return;
		}
		playerInfo["gameReady"] = true;
	},

	OnSetEnd: function OnSetEnd(setEnd) {
		//清除准备状态
		for (var pos in this.dataInfo) {
			var playerInfo = this.dataInfo[pos];
			playerInfo["gameReady"] = false;
			playerInfo["point"] += setEnd.pointList[pos];
			this.dataInfo[pos]['point'] = playerInfo["point"];
			//比赛分
			if (typeof playerInfo.sportsPoint != "undefined") {
				var sp = parseFloat(playerInfo["sportsPoint"]).toFixed(2);
				var addSp = parseFloat(setEnd.sportsPointList[pos]).toFixed(2);
				var totalSp = parseFloat(sp) + parseFloat(addSp);
				//保留小数点后面两位
				playerInfo["sportsPoint"] = totalSp.toFixed(2);
				this.dataInfo[pos]['sportsPoint'] = totalSp.toFixed(2);

				var real = parseFloat(playerInfo["realPoint"]).toFixed(2);
				var addReal = parseFloat(setEnd.sportsPointList[pos]).toFixed(2);
				var totalReal = parseFloat(real) + parseFloat(addReal);
				playerInfo["realPoint"] = totalReal.toFixed(2);
			} else {
				var _real = parseFloat(playerInfo["realPoint"]).toFixed(2);
				var _addReal = parseFloat(setEnd.pointList[pos]).toFixed(2);
				var _totalReal = parseFloat(_real) + parseFloat(_addReal);
				playerInfo["realPoint"] = _totalReal.toFixed(2);
			}
		}

		// this.OnPoint(setEnd.pointList);
	},

	OnSportsPointChange: function OnSportsPointChange(serverPack) {
		//同步更新比赛分
		for (var pos in this.dataInfo) {
			var playerInfo = this.dataInfo[pos];
			if (pos == serverPack.posId && playerInfo.pid == serverPack.pid) {
				var sp = parseFloat(playerInfo["sportsPoint"]).toFixed(2);
				var addSp = parseFloat(serverPack.sportsPoint).toFixed(2);
				var totalSp = parseFloat(sp) + parseFloat(addSp);
				//保留小数点后面两位
				playerInfo["sportsPoint"] = totalSp.toFixed(2);
				this.dataInfo[pos]['sportsPoint'] = totalSp.toFixed(2);
			}
		}
	},
	//更新积分，如果是断线重连不需要增加分数，直接同步服务端的分数就好
	// OnPoint:function(pointList, isReconnect = false){
	// 	for(let pos in this.dataInfo){
	// 		let playerInfo = this.dataInfo[pos];
	// 		if(isReconnect){
	// 			playerInfo["point"] = pointList[pos].point;
	// 		}
	// 		else{
	// 			playerInfo["point"] += pointList[pos];
	// 		}
	// 	}
	// },

	//-------------------------获取接口---------------------
	//获取客户端玩家准备状态
	GetPlayerReadyState: function GetPlayerReadyState(roomSetID) {
		var ReadyState = "";
		if (roomSetID > 0) {
			ReadyState = "gameReady";
		} else {
			ReadyState = "roomReady";
		}
		return this.GetPlayerInfoByPos(this.clientPos)[ReadyState];
	},

	//设置玩家离线状态
	SetPlayerOfflineState: function SetPlayerOfflineState(pos, isLostConnect, isShowLeave) {
		if (!this.dataInfo.hasOwnProperty(pos)) {
			this.ErrLog("SetPlayerOfflineState not find:%s", pos);
			return;
		}
		this.dataInfo[pos]["isLostConnect"] = isLostConnect;
		this.dataInfo[pos]["isShowLeave"] = isShowLeave;
	},

	//获取房间所有玩家信息
	GetRoomAllPlayerInfo: function GetRoomAllPlayerInfo() {
		return this.dataInfo;
	},

	GetPlayerInfoByPid: function GetPlayerInfoByPid(pid) {
		for (var i in this.dataInfo) {
			if (pid == this.dataInfo[i].pid) return this.dataInfo[i];
		}
		return null;
	},

	//获取房间指定位置玩家信息
	GetPlayerInfoByPos: function GetPlayerInfoByPos(pos) {
		if (!this.dataInfo.hasOwnProperty(pos)) {
			this.ErrLog("GetPlayerInfoByPos(%s) not find", pos);
			return;
		}
		return this.dataInfo[pos];
	},

	//设置房间指定位置玩家指定字段信息
	SetPlayerInfoByPos: function SetPlayerInfoByPos(pos, propertyName, propertyValue) {
		if (!this.dataInfo.hasOwnProperty(pos)) {
			this.ErrLog("SetPlayerInfoByPos(%s) not find", pos);
			return;
		}
		this.dataInfo[pos][propertyName] = propertyValue;
	},

	//获取客户端玩家的座位
	GetClientPos: function GetClientPos() {
		return this.clientPos;
	},

	//获取客户端玩家的上家位置ID
	GetClientUpPos: function GetClientUpPos() {
		return this.upPos;
	},

	//获取客户端玩家下家位置ID
	GetClientDownPos: function GetClientDownPos() {
		return this.downPos;
	},

	//获取客户端玩家对家位置ID
	GetClientFacePos: function GetClientFacePos() {
		return this.facePos;
	},

	//获取开设房间位置的数量
	GetPosCount: function GetPosCount() {
		return this.posCount;
	},

	//服务端位置转客户端位置
	GetUIPosByDataPos: function GetUIPosByDataPos(dataPos) {
		var playerCount = this.posCount;
		var uiPos = (dataPos + (playerCount - this.clientPos)) % playerCount;
		//如果是两人场，是对面做，用0和2位置
		//如果是三人场，是使用0,1,3位置
		// if (playerCount == 2 && uiPos == 1) {
		// 	uiPos = 2;
		// }else if (playerCount == 3 && uiPos == 2) {
		// 	uiPos = 3;
		// }

		return uiPos;
	}
});

var g_DDZRoomPosMgr = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
	if (!g_DDZRoomPosMgr) g_DDZRoomPosMgr = new DDZRoomPosMgr();
	return g_DDZRoomPosMgr;
};

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=DDZRoomPosMgr.js.map
        