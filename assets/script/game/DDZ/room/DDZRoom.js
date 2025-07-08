/*
 *  ----------------------------------------------------------------------------------------------------
 *  @copyright: Copyright (c) 2004, 2010 Xiamen DDM Network Technology Co.,Ltd., All rights reserved.
 *  ----------------------------------------------------------------------------------------------------
 *  @package SSSRoom.js
 *  @todo: 十三水房间
 *
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
var DDZRoom = app.BaseClass.extend({

	/**
	 * 初始化
	 */
	Init:function(){

		this.JS_Name = "DDZRoom";

		this.ComTool = app[app.subGameName + "_ComTool"]();
		this.ShareDefine = app[app.subGameName + "_ShareDefine"]();
		this.HeroManager = app[app.subGameName + "_HeroManager"]();

		this.DDZRoomPosMgr = app.DDZRoomPosMgr();
		this.DDZRoomSet = app.DDZRoomSet();

		this.OnReload();

		this.Log("Init");

	},

	OnReload:function(){

		this.dataInfo = {};

		this.roomConfig = {};

        this.roomRecord = {};

	},

	//-----------------------回调函数-----------------------------
	//登录初始化房间数据
	OnInitRoomData:function(serverPack){

		serverPack["state"] = this.ShareDefine.RoomStateStringDict[serverPack["state"]];

		if(serverPack.prizeType == 'Gold'){
			app[app.subGameName + "_ShareDefine"]().isCoinRoom = true;
		}
		else if(serverPack.prizeType == 'RoomCard'){
			app[app.subGameName + "_ShareDefine"]().isCoinRoom = false;
		}

		let cfg = serverPack["cfg"];
		this.roomConfig = cfg;

		let roomPosInfoList = serverPack["posList"]||[];
		console.log('roomPosInfoList', roomPosInfoList);
		this.DDZRoomPosMgr.OnInitRoomPosData(roomPosInfoList);

		let setInfo = serverPack["set"];
		this.DDZRoomSet.OnInitRoomSetData(setInfo);

		//其余信息存放到dataInfo
		this.dataInfo = serverPack;

		this.isGetGR = false;
		this.Log("roomConfig:", this.roomConfig);
		this.Log("dataInfo:", this.dataInfo);
	},

	//位置离开
	OnPosLeave:function(pos){
		this.DDZRoomPosMgr.OnPosLeave(pos);
	},
	UpdateOwnerID:function(ownerID){
		this.dataInfo['ownerID']=ownerID;
	},
	//继续游戏
	OnPosContinueGame:function(pos){
		this.DDZRoomPosMgr.OnPosContinueGame(pos);
	},

	//set开始
	OnSetStart:function(setInfo){
		this.dataInfo["state"] = this.ShareDefine.RoomState_Playing;
		this.dataInfo["setID"] = setInfo["setID"];
		this.GetRoomSet().OnSetStart(setInfo);
	},

	//set结束
	OnSetEnd:function(setEnd){
		this.DDZRoomSet.OnSetEnd(setEnd);
		this.DDZRoomPosMgr.OnSetEnd(setEnd);
	},

	//房间结束
	OnRoomEnd:function(roomEnd){
		this.dataInfo["state"] = this.ShareDefine.RoomState_End;
		this.dataInfo["roomEnd"] = roomEnd;
	},

	//开始解散房间
	OnStartVoteDissolve:function(createPos, endSec){
		let posAgreeList = [];

		for(let index=0; index<10; index++){
			console.log("createPos:"+createPos+",index:"+index);
			if(index == createPos){
				posAgreeList.push(1);
			}
			else{
				posAgreeList.push(0);
			}
		}
		let dissolveInfo = {"endSec":endSec,"createPos":createPos, "posAgreeList":posAgreeList};
		this.dataInfo["dissolve"] = dissolveInfo;
		return dissolveInfo;
	},

	//位置同意拒绝更新
	OnPosDealVote:function(pos, agreeDissolve){

		let dissolveInfo = this.dataInfo["dissolve"];
		let posAgreeList = dissolveInfo["posAgreeList"];
		if(!posAgreeList){
			this.ErrLog("OnPosDealVote not find posAgreeList:", this.dataInfo);
			return
		}

		if(pos >= posAgreeList.length){
			this.ErrLog("OnPosDealVote(%s,%s):", pos, agreeDissolve, posAgreeList);
			return
		}

		if(agreeDissolve){
			posAgreeList[pos] = 1;
		}
		else{
			posAgreeList[pos] = 2;
		}
		return dissolveInfo
	},
	//更新房间内的对局记录信息
    RoomRecord:function (serverPack) {
		this.roomRecord = {};
		this.roomRecord = serverPack;
	},
    OnSportsPointChange:function(serverPack){
		this[app.subGameName.toUpperCase()+"RoomPosMgr"].OnSportsPointChange(serverPack);
	},
	//---------------------设置函数---------------------
	OnDissolve:function(dissolve){
		this.dataInfo["dissolve"] = dissolve;
	},

	OnPlaying:function(serverPack){
		//改变玩家出牌位置
		let opPos = serverPack.opPos;
		let state = serverPack.state;
		this.DDZRoomSet.OnSetPlaying(opPos, state);
	},
	
	//---------------------获取函数---------------------
	//获取对局记录信息
	GetRoomRecord:function () {
		return this.roomRecord;
	},
	
	//获取房间信息
	GetRoomDataInfo:function () {
		return this.dataInfo;
    },
	//获取创建房间信息b
	GetRoomProperty:function(property){
		if(!this.dataInfo.hasOwnProperty(property)){
			this.ErrLog("GetRoomProperty not find:%s", property);
			return
		}
		return this.dataInfo[property];
	},

	//获取房间配置信息
	GetRoomConfig:function(){
		return this.roomConfig
	},

	//获取房间配置信息
	GetRoomConfigByProperty:function(property){
		if(!this.roomConfig.hasOwnProperty(property)){
			this.ErrLog("GetRoomConfigByProperty not find:%s", property);
			return
		}
		return this.roomConfig[property];
	},

	GetRoomSet:function(){
		let setID = this.dataInfo["setID"];
		if(!setID){
			this.ErrLog("GetSet not start set");
			return
		}
		return this.DDZRoomSet;
	},

	GetRoomPosMgr:function(){
		return this.DDZRoomPosMgr;
	},
	//客户端玩家是否是开房人
    IsClientIsCreater:function(){
        let heroID = this.HeroManager.GetHeroID();
        if(heroID == this.dataInfo["ownerID"]){
            return true
        }
        return false
    },
	//客户端玩家是否是房主
	IsClientIsOwner:function(){
		let heroID = this.HeroManager.GetHeroID();
		if(heroID == this.dataInfo["ownerID"]){
			return true
		}
		return false
	},

	SetGameRecord:function(bget){
		this.isGetGR = bget;
	},

	GetGameRecord:function(){
		return this.isGetGR;
	},

	//获取玩家setPos对象
	GetClientPlayerSetPos:function(){

		let pos = this.DDZRoomPosMgr.GetClientPos();
		if(pos < 0){
			this.ErrLog("GetClientPlayerSetPos not enter room");
			return
		}
		let setPos = this.DDZRoomSet.GetSetPosByPos(pos);
		if(!setPos){
			this.ErrLog("GetClientPlayerSetPos(%s) not find setPos", pos);
			return
		}
		return setPos
	},

	//获取客户端玩家信息
    GetClientPlayerInfo:function(){
		let pos = this.DDZRoomPosMgr.GetClientPos();
		if(pos < 0){
			this.ErrLog("GetClientPlayerInfo not enter room");
			return
		}
		let playerInfo = this.DDZRoomPosMgr.GetPlayerInfoByPos(pos);
		if(!playerInfo){
			this.ErrLog("GetClientPlayerInfo(%s) not find playerInfo", pos);
			return
		}
		return playerInfo
	},

	GetRoomWanfa:function(wanfa){
		if(this.roomConfig["kexuanwanfa"].indexOf(wanfa) != -1){
			return true;
		}
		return false;
	},

	ClearDissolve:function(){
		this.dataInfo['dissolve']='';
	},
})


var g_DDZRoom = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
	if(!g_DDZRoom)
		g_DDZRoom = new DDZRoom();
	return g_DDZRoom;
}
