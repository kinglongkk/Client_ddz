"use strict";
cc._RF.push(module, 'ddzjad63-73c8-4c91-a279-282a2b91e170', 'ddz_NetManager');
// script/net/ddz_NetManager.js

"use strict";

/*
    网络通信管理器
*/
var app = require("ddz_app");
var emitter = require('ddz_emitter');

var ddz_NetManager = app.BaseClass.extend({

	Init: function Init() {
		this.JS_Name = "ddz_NetManager";

		this.emitter = new emitter();
		this.ShareDefine = app.ddz_ShareDefine();
		this.SysDataManager = app.ddz_SysDataManager();
		this.NetWork = app.ddz_NetWork();
		this.httpRequest = app.ddz_NetRequest();
		this.ComTool = app.ddz_ComTool();

		this.NewSysMsg = this.SysDataManager.GetTableDict("NewSysMsg");

		//h5客户端启动url
		this.H5ClientStartUrl = "";

		this.InitServerAddress();

		this.InitHttpPack();

		this.RegNetPack("game.C1105GMPack", this.OnPack_GMPack, this);

		this.RetryTime = 0;
	},

	//切换账号
	OnReload: function OnReload() {
		this.NetWork.OnReload();
	},

	//初始化连接
	InitConnectAccountID: function InitConnectAccountID(accountID) {
		this.NetWork.InitConnectInfo(accountID);
	},

	//初始化连接的服务器地址
	InitServerAddress: function InitServerAddress() {

		var clientConfig = app[app.subGameName + "Client"].GetClientConfig();

		this.AccountServerUrl = ['http://', clientConfig["AccountServerIP"], ":", clientConfig["AccountServerPort"], "/ClientPack"].join("");

		//this.AccountServerUrlHttps = ['https://', clientConfig["AccountServerIP"], ":", clientConfig["AccountServerPort"].toString()+'0', "/ClientPack"].join("");


		this.OrderServerUrl = ['http://', clientConfig["OrderServerIP"], ":", clientConfig["OrderServerPort"], "/ClientPack"].join("");

		this.ResServerUrl = ['http://', clientConfig["ResServerIP"], ":", clientConfig["ResServerPort"], "/ClientPack"].join("");

		var gateServerInfo = app["GateServerInfo"];

		this.SysLog("AccountServer(%s)", this.AccountServerUrl, "b-g");
		this.SysLog("OrderServer(%s)", this.OrderServerUrl, "b-g");
		this.SysLog("ResServerUrl(%s)", this.ResServerUrl, "b-g");
		this.SysLog("Server(%s:%s)", clientConfig["GameServerIP"], clientConfig["GameServerPort"], "b-g");
	},

	//设置首次连接服务器IP
	SetGateServerAddress: function SetGateServerAddress(gateServerIP, gateServerPort) {
		if (!gateServerIP || !gateServerPort) {
			this.ErrLog("SetGateServerAddress(%s,%s) error", gateServerIP, gateServerPort);
			return;
		}
		//更新内存
		var gateServerInfo = app["GateServerInfo"];
		gateServerInfo["GateServerIP"] = gateServerIP;
		gateServerInfo["GateServerPort"] = gateServerPort;

		//修改本地数据库
		app.LocalDataManager().GetConfigProperty("DebugInfo", "GateServerInfo", gateServerInfo);

		app[app.subGameName + "Client"].OnEvent("OnGateServerChangeIP", null);
	},

	//设置服务器连接IP地址
	SetServerAddress: function SetServerAddress(gameServerIP, gameServerPort) {

		if (!gameServerIP || !gameServerPort) {
			this.ErrLog("SetServerAddress(%s,%s) error", gameServerIP, gameServerPort);
			return;
		}

		//保存到本地数据库
		var LocalDataManager = app.LocalDataManager();
		var dbGameServerInfo = {
			"GameServerIP": gameServerIP,
			"GameServerPort": gameServerPort
		};
		LocalDataManager.SetConfigProperty("DebugInfo", "GameServerInfo", dbGameServerInfo);

		//修改内存中缓存的字典
		app[app.subGameName + "Client"].RefreshClientConfig();

		app[app.subGameName + "Client"].OnEvent("OnChangeIP", null);
	},
	SetAccountAddress: function SetAccountAddress(accountServerIP, serverServerPort) {
		if (!accountServerIP || !serverServerPort) {
			this.ErrLog("SetAccountAddress(%s,%s) error", accountServerIP, serverServerPort);
			return;
		}
		this.AccountServerUrl = ['http://', accountServerIP, ":", serverServerPort, "/ClientPack"].join("");
		//this.AccountServerUrlHttps = ['https://', accountServerIP, ":", serverServerPort.toString()+'0', "/ClientPack"].join("");

		//保存到本地数据库
		var LocalDataManager = app.LocalDataManager();
		var dbAccountServerInfo = {
			"AccountServerIP": accountServerIP,
			"AccountServerPort": serverServerPort
		};
		LocalDataManager.SetConfigProperty("DebugInfo", "AccountServerInfo", dbAccountServerInfo);

		//修改内存中缓存的字典
		app[app.subGameName + "Client"].RefreshClientConfig();

		app[app.subGameName + "Client"].OnEvent("OnChangeIP", null);
	},
	SetResAddress: function SetResAddress(resServerIP, serverServerPort) {
		if (!resServerIP || !serverServerPort) {
			this.ErrLog("SetResAddress(%s,%s) error", resServerIP, serverServerPort);
			return;
		}
		this.ResServerUrl = ['http://', resServerIP, ":", serverServerPort, "/ClientPack"].join("");

		//保存到本地数据库
		var LocalDataManager = app.LocalDataManager();
		var dbResServerInfo = {
			"ResServerIP": resServerIP,
			"ResServerPort": serverServerPort
		};
		LocalDataManager.SetConfigProperty("DebugInfo", "ResServerInfo", dbResServerInfo);

		//修改内存中缓存的字典
		app[app.subGameName + "Client"].RefreshClientConfig();

		app[app.subGameName + "Client"].OnEvent("OnChangeIP", null);
	},
	SetOrderAddress: function SetOrderAddress(orderServerIP, serverServerPort) {
		if (!orderServerIP || !serverServerPort) {
			this.ErrLog("SetOrderAddress(%s,%s) error", orderServerIP, serverServerPort);
			return;
		}
		this.OrderServerUrl = ['http://', orderServerIP, ":", serverServerPort, "/ClientPack"].join("");

		//保存到本地数据库
		var LocalDataManager = app.LocalDataManager();
		var dbOrderServerInfo = {
			"OrderServerIP": orderServerIP,
			"OrderServerPort": serverServerPort
		};
		LocalDataManager.SetConfigProperty("DebugInfo", "OrderServerInfo", dbOrderServerInfo);

		//修改内存中缓存的字典
		app[app.subGameName + "Client"].RefreshClientConfig();

		app[app.subGameName + "Client"].OnEvent("OnChangeIP", null);
	},

	//设置资源服务器地址
	SetH5ClientStartUrl: function SetH5ClientStartUrl(h5ClientStartUrl) {
		this.H5ClientStartUrl = h5ClientStartUrl;
	},

	//初始化http封包
	InitHttpPack: function InitHttpPack() {
		//输出发送封包字典
		// {
		//     0xFF00:packName
		// }
		this.sendHttpPackDict = {};

		//封包发送到那个服务器
		// {
		//     0xFF00:account,
		// }
		this.packReceiveServerTypeDict = {};

		var ClientHttpPackDict = app.ddz_HttpPack().ClientHttpPackDict;

		for (var packHeadName in ClientHttpPackDict) {
			var headNameList = packHeadName.split(".");
			if (headNameList.length != 3) {
				this.ErrLog("InitHttpPack ClientHttpPackDict packHeadName:%s error", packHeadName);
				continue;
			}
			var headInt = Math.floor(headNameList[1]);

			if (this.sendHttpPackDict.hasOwnProperty(headInt)) {
				this.ErrLog("InitHttpPack sendHttpPackDict have find(%s) headInt", packHeadName);
				continue;
			}
			this.sendHttpPackDict[headInt] = ClientHttpPackDict[packHeadName];

			this.packReceiveServerTypeDict[headInt] = headNameList[2];
		}
	},

	//初始化连接
	InitConnectServer: function InitConnectServer() {
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "OpenNet");

		var clientConfig = app[app.subGameName + "Client"].GetClientConfig();

		var gameServerIP = clientConfig["GameServerIP"];
		var gameServerPort = clientConfig["GameServerPort"];

		//初始化连接服务器
		this.NetWork.InitWebSocket(gameServerIP, gameServerPort, this.OnWebSocketEvent.bind(this), this.OnConnectSuccess.bind(this));
	},

	/**
  * 获取url字符串格式
  * @param dataDict
  * @returns {String}
  */
	GetUrlStr: function GetUrlStr(dataDict) {

		if (!dataDict) {
			return "";
		}
		var urlSendStr = '?';
		for (var key in dataDict) {
			urlSendStr += key + '=' + dataDict[key] + '&';
		}
		//去掉最后一个&
		urlSendStr = urlSendStr.substring(0, urlSendStr.length - 1);

		return urlSendStr;
	},

	//获取http请求发送的封包
	GetHttpSendPack: function GetHttpSendPack(head) {
		if (!this.sendHttpPackDict.hasOwnProperty(head)) {
			this.ErrLog("GetHttpSendPack sendHttpPackDict not find:%s", head);
			return;
		}
		return { "Head": head };
	},

	//获取http封包发送的目的地地址
	GetHttpSendPackUrl: function GetHttpSendPackUrl(head) {
		var serverType = this.packReceiveServerTypeDict[head];
		if (!serverType) {
			this.ErrLog("GetHttpSendPackUrl(%s) not find", head);
			return;
		}

		var url = "";
		switch (serverType) {
			case "account":
				url = this.AccountServerUrl;
				break;
			case "order":
				url = this.OrderServerUrl;
				break;
			case "res":
				url = this.ResServerUrl;
				break;
			default:
				this.ErrLog("GetHttpSendPackUrl serverType:%s error", serverType);
				break;
		}

		return url;
	},

	//获取客户端启动后的html地址串
	GetH5ClientStartUrl: function GetH5ClientStartUrl() {
		return this.H5ClientStartUrl;
	},

	//获取客户端资源服务器HTTP地址
	GetResServerHttpAddress: function GetResServerHttpAddress() {
		var clientConfig = app[app.subGameName + "Client"].GetClientConfig();
		return ['http://', clientConfig["ResServerIP"], ":", clientConfig["ResServerPort"]].join("");
	},

	//-------------websocket请求------------------
	//系统自主发送重连请求
	SendReConnect: function SendReConnect(eventName, sendPack) {
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "OpenNet");
		this.NetWork.RequestReConnect(eventName, sendPack);
	},
	//向服务器发起请求
	SendPack: function SendPack(eventName, sendPack) {
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		var errorCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

		// console.log(sendPack);
		//开启模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "OpenNet");
		this.NetWork.Request(eventName, sendPack, callback, errorCallback);
	},

	//向服务器发起请求,不触发网络
	SendPackOnly: function SendPackOnly(eventName, sendPack) {
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		var errorCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

		this.NetWork.Request(eventName, sendPack, callback, errorCallback);
	},

	//通知服务器得封包数据
	NotifyPack: function NotifyPack(eventName, sendPack) {
		this.NetWork.Notify(eventName, sendPack);
	},

	//注册封包事件(需要字符串封包头,才可以避免RegHttpNetPack相同封包头注册事件区分)
	RegNetPack: function RegNetPack(head, func, target) {
		head = head.toLocaleLowerCase();
		var valueType = Object.prototype.toString.call(head).slice("[object ".length, -1);
		if (valueType != "String") {
			this.ErrLog("RegNetPack need String head");
			return;
		}

		if (!func || !target) {
			this.ErrLog("RegNetPack head:%s error", head);
			return;
		}
		this.emitter.on(head, func, target);
	},

	//取消封包注册
	UnRegNetPack: function UnRegNetPack(eventName, func) {
		this.emitter.off(eventName, func);
	},

	//取消所有封包注册
	UnAllRegNetPack: function UnAllRegNetPack() {
		this.emitter.removeAllListeners();
	},

	//服务器连接成功
	OnConnectSuccess: function OnConnectSuccess(isReconnecting) {
		//关闭模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "ReceiveNet");
		app[app.subGameName + "Client"].OnEvent(app.subGameName + "_ConnectSuccess", { "ServerName": "GameServer", "IsReconnecting": isReconnecting });
	},
	//websocket事件回掉
	OnWebSocketEvent: function OnWebSocketEvent(eventName, arg) {
		// console.log("子游戏 OnWebSocketEvent 回调");
		//关闭模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "ReceiveNet");

		switch (eventName) {
			case "OnError":
				app[app.subGameName + "Client"].OnEvent("ConnectFail", { "ServerName": "GameServer", "EventType": "OnError" });
				break;

			case "Reconnectd":
				app[app.subGameName + "Client"].OnEvent("ModalLayer", "StartReConnect");
				this.NetWork.ReConnect();
				break;

			case "OnClose":
				app[app.subGameName + "Client"].OnEvent("ConnectFail", { "bCloseByLogout": arg[0], "ServerName": "GameServer", "EventType": "OnClose" });
				break;

			case "OnKick":
				app.ddz_SysNotifyManager().ShowSysMsg("Kick_ByServer");
				break;

			case "OnReceive":
				this.OnReceive(arg[0], arg[1]);
				break;

			case "OnCodeError":
				this.OnCodeError(arg[0], arg[1], arg[2]);
				break;

			case "OnGMReceive":
				this.OnGMReceive(arg[0], arg[1]);
				break;

			default:
				this.ErrLog("OnWebSocketEvent(%s):", eventName, arg);
				break;
		}
	},

	OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
		if (clickType != "Sure") {
			return;
		}
		if ("goBuyCard" == msgID) {
			var clientConfig = app[app.subGameName + "Client"].GetClientConfig();
			app.ddz_FormManager().ShowForm("UIStore");
			app.ddz_FormManager().CloseForm("UIJoin");
			app.ddz_FormManager().CloseForm("UIChouJiang");
			app.ddz_FormManager().CloseForm("game/base/ui/majiang/UIMJResultDetail");
			return;
		}
	},

	//封包事件回掉
	OnReceive: function OnReceive(routeName, receivePack) {
		try {
			this.emitter.emit(routeName, receivePack);
		} catch (error) {
			this.ErrLog("OnReceive:%s", error.stack);
			this.ErrLog("OnReceive routeName :%s, receivePack:%s", routeName, JSON.stringify(receivePack));
		}
	},

	//封包事件失败回掉
	OnCodeError: function OnCodeError(eventName, code, resultInfo) {
		var codeMsg = ["Code", code].join("_");

		//如果是错误提示类型,根据提示码提示,直接提示
		if (code == this.ShareDefine.ErrorSysMsg) {
			app.ddz_SysNotifyManager().ShowSysMsg(resultInfo["Msg"]);
		}
		// else if(code == this.ShareDefine.NotAllow){
		// 	app.ddz_SysNotifyManager().ShowSysMsg('MSG_SERVICE_NOTALLOW');
		// }
		else if (code == this.ShareDefine.InOtherRoomPlay) {
				app.ddz_SysNotifyManager().ShowSysMsg('MSG_IN_OTHER_ROOM_PLAY');
			} else if (code == 12) {
				app[app.subGameName + "Client"].ExitGame();
			}
			//继续游戏失败
			else if (code == this.ShareDefine.ResetRoomInfo) {
					var roomID = app[app.subGameName.toUpperCase() + "RoomMgr"]().GetEnterRoomID();
					if (roomID) {
						app[app.subGameName.toUpperCase() + "RoomMgr"]().SendGetRoomInfo(roomID);
					}
				} else if (code == this.ShareDefine.Maintain) {
					var finishttime = resultInfo["Msg"];
					app.ddz_SysNotifyManager().ShowSysMsg('服务器维护中,预计结束时间：' + app.ddz_ComTool().GetDateYearMonthDayHourMinuteString(finishttime));
				} else if (code == this.ShareDefine.ErrorNotRoomCard) {
					//房卡不足
					var desc = app.ddz_SysNotifyManager().GetSysMsgContentByMsgID("MSG_NotRoomCard");
					app.ddz_ConfirmManager().SetWaitForConfirmForm(this.OnConFirm.bind(this), "goBuyCard", []);
					app.ddz_FormManager().ShowForm(app.subGameName + "_UIMessage", null, this.ShareDefine.ConfirmBuyGoTo, 0, 0, desc);
				} else if (code == this.ShareDefine.ErrorMaxRoom) {
					app.ddz_SysNotifyManager().ShowSysMsg('可以创建的房间数量不足');
				} else if (code == this.ShareDefine.NotMagic) {
					app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('禁止魔法表情');
				} else if (code == this.ShareDefine.ErrorNotQuanCard) {
					//圈币不足
					app.ddz_SysNotifyManager().ShowSysMsg('圈卡不足，请前往亲友圈商城购买圈卡');
					app.ddz_FormManager().GetFormComponentByFormName("ui/club/UIClub").OnClick('btn_addRoomCard', null);
				} else if (code == 5025) {
					//重新刷新下房间信息
					var roomMgr = app[app.subGameName.toUpperCase() + "RoomMgr"]();
					if (roomMgr && typeof roomMgr != "undefined") {
						var _roomID = roomMgr.GetEnterRoomID();
						roomMgr.SendGetRoomInfo(_roomID);
					}
				}
				//如果有配置系统提示码,则提示错误提示码对应的文本
				else if (this.NewSysMsg.hasOwnProperty(codeMsg)) {

						var errorMsg = resultInfo["Msg"];
						//开发模式有 提示文本的话 显示错误文本
						if (this.ShareDefine.IsDevelopment && errorMsg) {
							app.ddz_SysNotifyManager().ShowSysMsg("CodeErrorMsg", [errorMsg]);
						}
						//如果不是开发模式,弹通用的系统提示
						else {
								app.ddz_SysNotifyManager().ShowSysMsg(codeMsg);
							}
					}
					//如果配置表没有配置的错误码
					else {
							//如果是不需要提示的,不配置也不需要显示的系统提示码
							if (this.ShareDefine.NoShowSysMsgCodeList.InArray(code)) {}
							//没有配置,是开发模式弹框
							else if (this.ShareDefine.IsDevelopment) {
									app.ddz_SysNotifyManager().ShowSysMsg("CodeErrorMsg", [resultInfo["Msg"]]);
								}
						}
		app[app.subGameName + "Client"].OnEvent("CodeError", { "Code": code, "EventName": eventName, "Result": resultInfo });
	},

	//接受到GM命令汇报
	OnGMReceive: function OnGMReceive(eventName, argDict) {
		app[app.subGameName + "Client"].OnEvent("ReceiveGM", argDict);
	},

	//------------------http请求--------------------------------

	//注册http封包事件(需要整形封包头,才可以避免RegNetPack相同封包头注册事件区分)
	RegHttpNetPack: function RegHttpNetPack(head, func, target) {
		var valueType = Object.prototype.toString.call(head).slice("[object ".length, -1);
		if (valueType != "Number") {
			this.ErrLog("RegNetPack need Int head");
			return;
		}
		head = head.toString();
		this.emitter.on(head, func, target);
	},

	UnRegHttpNetPack: function UnRegHttpNetPack(head, func) {
		var valueType = Object.prototype.toString.call(head).slice("[object ".length, -1);
		if (valueType != "Number") {
			this.ErrLog("UnRegHttpNetPack need Int head");
			return;
		}
		head = head.toString();
		this.emitter.off(head, func);
	},

	//发送HTTP请求
	SendHttpPack: function SendHttpPack(sendPack) {
		console.log("sendPack:", sendPack);
		var serverUrl = this.GetHttpSendPackUrl(sendPack.Head);
		if (!serverUrl) {
			this.ErrLog("SendHttpPack(%s) not find serverUrl", sendPack);
			return;
		}
		//开启模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "OpenNet");
		var argDict = { "Sign": "ddcat" };
		var argString = this.GetUrlStr(argDict);

		if (this.IsDevelopment()) {
			this.NetLog("[SendHttp](%s):", serverUrl, sendPack, "b-g");
		}
		this.sendPack = sendPack;
		this.httpRequest.SendHttpRequest(serverUrl, argString, "POST", sendPack);
	},

	//发送HTTPS请求
	/*SendHttpsPack:function(){
 	let sendPack=this.sendPack;
     let serverUrl=this.AccountServerUrlHttps;
     if(!serverUrl){
         this.ErrLog("SendHttpPacks(%s) not find serverUrl", sendPack);
         return
     }
 //开启模态层
     app[app.subGameName + "Client"].OnEvent("ModalLayer", "OpenNet");
     let argDict = {"Sign":"ddcat"};
     let argString = this.GetUrlStr(argDict);
    if(this.IsDevelopment()){
   this.NetLog("[SendHttps](%s):", serverUrl, sendPack, "b-g");
  }
       this.httpRequest.SendHttpRequest(serverUrl, argString, "POST", sendPack);
 },
 */
	//接受到http请求回复
	OnReceiveHttpPack: function OnReceiveHttpPack(serverUrl, httpResText) {
		//关闭模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "ReceiveNet");

		var receivePack = JSON.parse(httpResText);
		if (this.IsDevelopment()) {
			this.NetLog("[RecvHttp]:", receivePack, "b-gb");
		}

		if (receivePack.hasOwnProperty("code")) {
			this.ErrLog("OnReceiveHttpPack HttpCode:", receivePack);

			var eventName = "HttpRequestCode";
			if (serverUrl == this.AccountServerUrl) {
				eventName = "AccountServerCode";
				this.OnCodeError(eventName, receivePack["code"], receivePack);
			} else if (serverUrl == this.ResServerUrl) {
				eventName = "ResServerCode";
				this.OnCodeError(eventName, receivePack["code"], receivePack);
			} else {
				this.ErrLog("OnReceiveHttpPack serverUrl(%s) error", serverUrl);
			}
		} else {
			try {
				//转化封包头为字符串 分发事件
				var head = receivePack.Head.toString();
				this.emitter.emit(head, receivePack);
			} catch (error) {
				this.ErrLog("OnReceiveHttpPack(%s) error", httpResText);
				return;
			}
		}
	},
	/**
  * 请求连接失败
  */
	OnConnectHttpFail: function OnConnectHttpFail(serverUrl, readyState, status) {
		this.ErrLog("HttpConnectFail(%s, %s,%s)", serverUrl, readyState, status);

		//关闭模态层
		app[app.subGameName + "Client"].OnEvent("ModalLayer", "ReceiveNet");

		if (serverUrl == this.AccountServerUrl) {
			//app.ddz_SysNotifyManager().ShowSysMsg("Code_10010");
			//app[app.subGameName + "Client"].OnEvent("ConnectHttpFail", {"ServerName":"AccountServer"});
			//http请求失败，尝试用https请求
			//this.SendHttpsPack();
			if (this.RetryTime == 9) {
				app.ddz_SysNotifyManager().ShowSysMsg("Code_10010");
				app[app.subGameName + "Client"].OnEvent("ConnectHttpFail", { "ServerName": "AccountServer" });
				return;
			}
			//换节点
			app.ddz_HeroAccountManager().UpdateAccessPoint();
			this.InitServerAddress();
			this.SendHttpPack(this.sendPack);
			this.RetryTime = this.RetryTime + 1;
		} else if (serverUrl == this.AccountServerUrlHttps) {
			/*if(this.RetryTime==5){
   	app.ddz_SysNotifyManager().ShowSysMsg("Code_10010");
   	app[app.subGameName + "Client"].OnEvent("ConnectHttpFail", {"ServerName":"AccountServer"});
   	return;
   }
   //换节点
   app.ddz_HeroAccountManager().UpdateAccessPoint();
   this.InitServerAddress();
   this.SendHttpPack(this.sendPack);
   this.RetryTime=this.RetryTime+1;*/
		} else {
			this.ErrLog("OnConnectHttpFail serverUrl:%s error", serverUrl);
		}
	},

	//------------操作函数-----------------------------

	//下线
	Disconnect: function Disconnect() {
		var byLogout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

		this.NetWork.Disconnect(byLogout);
	},

	SendGMPack: function SendGMPack(cmdString) {
		var sendPack = { "cmdString": cmdString };
		this.SendPack("game.C1105GMPack", sendPack);
	},

	OnPack_GMPack: function OnPack_GMPack(serverPack) {
		app[app.subGameName + "Client"].OnEvent("GMPack", serverPack);
	}

});

var g_ddz_NetManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
	if (!g_ddz_NetManager) {
		g_ddz_NetManager = new ddz_NetManager();
	}
	return g_ddz_NetManager;
};

cc._RF.pop();