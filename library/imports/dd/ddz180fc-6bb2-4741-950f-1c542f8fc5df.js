"use strict";
cc._RF.push(module, 'ddz180fc-6bb2-4741-950f-1c542f8fc5df', 'ddz_HeroAccountManager');
// script/common/ddz_HeroAccountManager.js

"use strict";

/*
    玩家账号数据管理器
*/
var app = require("ddz_app");

var ddz_HeroAccountManager = app.BaseClass.extend({

    Init: function Init() {
        this.JS_Name = app["subGameName"] + "_HeroAccountManager";

        this.NetManager = app[app.subGameName + "_NetManager"]();
        this.LocalDataManager = app.LocalDataManager();
        this.ShareDefine = app[app.subGameName + "_ShareDefine"]();
        this.SysNotifyManager = app[app.subGameName + "_SysNotifyManager"]();
        this.SysDataManager = app[app.subGameName + "_SysDataManager"]();

        this.NetManager.RegHttpNetPack(0x0000, this.OnHttpPack_AccountLogin, this);
        this.NetManager.RegHttpNetPack(0x0005, this.OnHttpPack_RegAccountResult, this);
        this.NetManager.RegHttpNetPack(0x0006, this.OnHttpPack_ChangeAccountPswResult, this);

        app[app.subGameName + "Client"].RegEvent("CodeError", this.Event_CodeError, this);
        app[app.subGameName + "Client"].RegEvent("ConnectFail", this.Event_ConnectFail, this);
        app[app.subGameName + "Client"].RegEvent("ConnectHttpFail", this.Event_ConnectHttpFail, this);
        app[app.subGameName + "Client"].RegEvent(app.subGameName + "_ConnectSuccess", this.Event_ConnectSuccess, this);

        //密码正则表达式(长度5~11之间,只能包含字符,数字和下划线)
        this.PswReg = /^(\w){5,11}$/;
        //账号正则表达式(字符开头,长度5~16之间,只能包含字符,数字和下划线)
        this.AccountReg = /^[a-zA-Z]\w{4,15}$/;

        //账号首字符正则表达式(首字符字母)
        this.AccountFirstStrReg = /^[a-zA-z]/;

        this.OnReload();

        //本地缓存账号密码字典 {account:psw}
        this.localAccountDict = {};
        //登陆账号顺序列表 晚登陆的在后面
        this.logInAccountList = [];

        this.InitLocalAccount();
        this.lastChangeTime = 0;
    },

    //切换账号
    OnReload: function OnReload() {
        this.IsDoLogining(false);
        this.dataInfo = {};
    },

    Event_CodeError: function Event_CodeError(event) {
        var codeInfo = event;
        //如果是授权失败,过期了,重新授权
        if (codeInfo["Code"] == this.ShareDefine.KickOut_AccountAuthorizationFail) {
            var accountType = app[app.subGameName + "Client"].GetClientConfigProperty("AccountType");
            if (accountType == this.ShareDefine.SDKType_WeChat) {
                //微信浏览器登录情况
                var gameLoadUrl = app[app.subGameName + "Client"].GetClientConfigProperty("GameLoadUrl");
                window.location.href = gameLoadUrl;
            }
            this.LocalDataManager.SetConfigProperty("Account", "AccessTokenInfo", {});
            if (app[app.subGameName + "_FormManager"]().IsFormShow("UILogin01") == false) {
                app[app.subGameName + "_FormManager"]().IsFormShow("UILogin01");
            }
        }
        //密码错误等异常,需要清除登录标示
        this.IsDoLogining(false);
    },
    //连接服务器失败
    Event_ConnectFail: function Event_ConnectFail(event) {
        this.IsDoLogining(false);
        this.UpdateAccessPoint();
    },

    Event_ConnectHttpFail: function Event_ConnectHttpFail(event) {
        this.IsDoLogining(false);
        this.UpdateAccessPoint();
    },
    UpdateAccessPoint: function UpdateAccessPoint() {
        var now = new Date().getTime();
        if (now - this.lastChangeTime < 5000) {
            return;
        }
        this.lastChangeTime = now;
        var clientConfig = app[app.subGameName + "Client"].GetClientConfig();
        var CheckServerUrl = ['http://', clientConfig["AccountServerIP"], ":", "88", "/checklive.php"].join("");
        console.log("Check CheckServerUrl:" + CheckServerUrl);
        this.HttpRequest(CheckServerUrl, "", "GET", {});
        //this.ChangeAccessPoint();
        //app[app.subGameName + "_NetManager"]().InitServerAddress();
    },

    HttpRequest: function HttpRequest(serverUrl, argString, requestType, sendPack) {
        var url = [serverUrl, argString].join("");
        var dataStr = JSON.stringify(sendPack);
        var timeOut = false;
        var isError = false;
        // 每次都实例化一个，否则会引起请求结束，实例被释放了
        var httpRequest = new XMLHttpRequest();
        httpRequest.timeout = 1500;
        httpRequest.open(requestType, url, true);
        // 服务器json解码
        httpRequest.setRequestHeader("Content-Type", "application/json");
        var that = this;
        httpRequest.onerror = function () {
            console.log("Check CheckServerUrl Error");
            if (timeOut == true) {
                console.log("Check CheckServerUrl Error timeOut return");
                return;
            }
            isError = true;
            that.ChangeAccessPoint();
            app[app.subGameName + "_NetManager"]().InitServerAddress();
        };
        httpRequest.ontimeout = function () {
            console.log("Check CheckServerUrl timeOut");
            if (isError == true) {
                console.log("Check CheckServerUrl timeOut Error return");
                return;
            }
            timeOut = true;
            that.ChangeAccessPoint();
            app[app.subGameName + "_NetManager"]().InitServerAddress();
        };
        httpRequest.onreadystatechange = function () {
            if (timeOut == true || isError == true) {
                console.log("Check CheckServerUrl timeOut2");
                return;
            }
            console.log("Check CheckServerUrl success:" + httpRequest.status);
            if (httpRequest.status == 200) {
                if (httpRequest.readyState == 4) {
                    console.log("Check CheckServerUrl success4");
                }
            }
        };
        httpRequest.send(dataStr);
    },
    ChangeAccessPoint: function ChangeAccessPoint() {
        if (!cc.sys.isNative) {
            return; //浏览器不用切换节点
        }
        var AccessPoint = app.LocalDataManager().GetConfigProperty("Account", "AccessPoint");
        if (AccessPoint == 0) {
            app.LocalDataManager().SetConfigProperty("Account", "AccessPoint", 1);
        } else if (AccessPoint == 1) {
            app.LocalDataManager().SetConfigProperty("Account", "AccessPoint", 2);
        } else if (AccessPoint == 2) {
            app.LocalDataManager().SetConfigProperty("Account", "AccessPoint", 3);
        } else if (AccessPoint == 3) {
            app.LocalDataManager().SetConfigProperty("Account", "AccessPoint", 0);
        }
    },
    //---------------------本地账号逻辑-----------------

    //解析本地缓存账号记录
    InitLocalAccount: function InitLocalAccount() {
        var accountDict = this.LocalDataManager.GetConfigProperty("Account", "AccountDict");
        var accountList = this.LocalDataManager.GetConfigProperty("Account", "AccountList");

        this.logInAccountList = accountList;

        for (var charAccount in accountDict) {
            if (this.logInAccountList.InArray(charAccount, true)) {
                this.localAccountDict[charAccount] = accountDict[charAccount];
            } else {
                this.ErrLog("InitLocalAccount logInAccountList not find :%s", charAccount);
            }
        }
    },

    /**
     * 增加本地缓存账号
     * @param account
     * @param psw
     */
    AddNewAccountList: function AddNewAccountList(account, token) {

        if (this.logInAccountList.InArray(account)) {
            this.logInAccountList.Remove(account);
            this.logInAccountList.push(account);
        } else {
            this.logInAccountList.push(account);
        }

        this.localAccountDict[account] = token;

        this.SavePlayerAccount();
    },

    /**
     * 删除本地账号
     * @param account
     */
    DeleteLocalAccount: function DeleteLocalAccount(account) {

        if (this.logInAccountList.InArray(account)) {
            this.logInAccountList.Remove(account);
        }
        delete this.localAccountDict[account];

        this.SavePlayerAccount();
    },

    /**
     * 清除本地所有账号
     * @param account
     */
    DeleteAllLocalAccount: function DeleteAllLocalAccount() {
        this.localAccountDict = {};
        this.logInAccountList = [];
        this.SavePlayerAccount();
    },

    /**
     * 保存账号数据
     */
    SavePlayerAccount: function SavePlayerAccount() {
        this.LocalDataManager.SetConfigProperty("Account", "AccountDict", this.localAccountDict);
        this.LocalDataManager.SetConfigProperty("Account", "AccountList", this.logInAccountList);
    },

    /**
     * 获取账号密码
     * @param account
     */
    GetAccountToken: function GetAccountToken(account) {
        if (!this.localAccountDict.hasOwnProperty(account)) {
            // this.Log("GetAccountToken not find:%s", account);
            return "";
        }
        return this.localAccountDict[account];
    },

    /**
     * 获取缓存账号列表
     */
    GetLocalAccountList: function GetLocalAccountList() {
        return this.logInAccountList;
    },

    GetAccountProperty: function GetAccountProperty(property) {
        if (!this.dataInfo.hasOwnProperty(property)) {
            this.ErrLog("GetAccountProperty not find:%s", property);
            return;
        }
        return this.dataInfo[property];
    },

    SetAccountProperty: function SetAccountProperty(property, value) {
        this.dataInfo[property] = value;
    },

    //获取账号属性
    GetAccountInfo: function GetAccountInfo() {
        return this.dataInfo;
    },

    /**
     * 检测账号是否合法
     */
    CheckCanUseAccount: function CheckCanUseAccount(account) {
        return this.AccountReg.test(account);
    },

    /**
     * 检测密码合法
     * @param psw
     */
    CheckCanUsePassWord: function CheckCanUsePassWord(psw) {
        return this.PswReg.test(psw);
    },

    CheckAccountFirstStr: function CheckAccountFirstStr(account) {
        return this.AccountFirstStrReg.test(account);
    },

    //---------------------事件回掉函数-----------------
    ErrorCloseGame: function ErrorCloseGame() {
        console.log("异常关闭游戏：" + app.subGameName);
        cc.game.off(cc.game.EVENT_HIDE);
        cc.game.off(cc.game.EVENT_SHOW);
        if (!cc.sys.isNative) {
            app[app.subGameName + "_SceneManager"]().LoadScene(app.subGameName + "MainScene");
            return;
        }
        var switchGameData = null;
        var roomMgr = app[app.subGameName.toUpperCase() + "RoomMgr"]();
        if (roomMgr) {
            if (roomMgr.clubId > 0 || roomMgr.unionId > 0) {
                switchGameData = { action: "openClub" };
            }
        }
        if (switchGameData != null) {
            cc.sys.localStorage.setItem("switchGameData", JSON.stringify(switchGameData));
        }
        app[app.subGameName + "_SoundManager"]().StopAllSound();
        //主动断开socket连接，服务端会将玩家踢出
        if (app[app.subGameName + "_NetWork"]().isConnectIng) {
            app[app.subGameName + "_NetManager"]().Disconnect(true);
        }
        app[app.subGameName + "Client"].RemoveClientManager();
        var gamePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + "ALLGame/" + app.subGameName;
        console.log("ExitGame gamePath:" + gamePath);
        window.require(gamePath + "/src/hall.js");
    },
    //连接服务器成功
    Event_ConnectSuccess: function Event_ConnectSuccess(event) {
        console.log(app.subGameName + " 连接服务器成功");
        app[app.subGameName + "_NetWork"]().isReconnecting = false;
        app[app.subGameName + "_NetWork"]().isConnectIng = true;
        if (!this.dataInfo["AccountID"]) {
            console.log("Event_ConnectSuccess not dataInfo");

            this.IsDoLogining(false);
            //本地开发项目跳过登录，请求一个游客账号
            if (!cc.sys.isNative) {
                // this.NetManager.SendPack("base.C1111RoleReLogin", {"accountID":0, "uuid":0, "gameName":app.subGameName});
                //this.OneKeyRegAccount();
            } else {
                var accountID = this.LocalDataManager.GetConfigProperty("Account", "AccountID");
                var uuid = this.LocalDataManager.GetConfigProperty("Account", "uuid");
                this.NetManager.SendPack("base.C1111RoleReLogin", { "accountID": accountID, "uuid": uuid, "gameName": app.subGameName });
                this.dataInfo["AccountID"] = accountID;
            }
            return;
        }
        //网页测试用游客登录
        if (!cc.sys.isNative) {
            var serverID = app[app.subGameName + "Client"].GetClientConfigProperty("ServerID");
            var sendPack = {
                "accountID": this.dataInfo["AccountID"],
                "openid": this.dataInfo["Openid"],
                "unionid": this.dataInfo["Unionid"],
                "token": this.dataInfo["Token"],
                "nickName": this.dataInfo["NickName"],
                "sex": this.dataInfo["Sex"],
                "headImageUrl": this.dataInfo["HeadImageUrl"],
                "serverID": serverID,
                "version": this.ShareDefine.ClientVersion
            };

            //如果是重连
            if (app[app.subGameName + "_HeroManager"]().GetHeroID()) {
                this.NetManager.SendReConnect("base.C1004Login", sendPack);
            } else {
                //登录过程完成
                this.IsDoLogining(false);
                //发送登陆token到connector
                console.log("登录过程完成:", JSON.stringify(sendPack));
                this.NetManager.SendPack("base.C1004Login", sendPack);
            }
        } else {
            //如果是重连
            if (app[app.subGameName + "_HeroManager"]().GetHeroID()) {
                var _accountID = this.dataInfo["AccountID"];
                var version = "1.0.1";
                var reloginSign = this.dataInfo["reloginSign"];
                if (typeof _accountID == "undefined") {
                    console.log("本地内存还没获取到accountID");
                    this.ErrorCloseGame();
                    return;
                }
                if (typeof reloginSign == "undefined") {
                    console.log("本地内存还没获取到reloginSign");
                    this.ErrorCloseGame();
                    return;
                }
                var signString = "accountID=" + _accountID.toString() + "&version=" + version + "&" + reloginSign.toString();
                var sign = app.MD5.hex_md5(signString);
                this.NetManager.SendReConnect("base.C1008Login", { "accountID": _accountID, "version": version, "sign": sign });
            }
        }
    },

    //注册账号结果
    OnHttpPack_RegAccountResult: function OnHttpPack_RegAccountResult(serverPack) {
        var result = serverPack.Result;
        if (result == 1) {
            this.SysNotifyManager.ShowSysMsg("Account_RegAccountFind");
        }
        this.IsDoLogining(false);
    },

    //修改密码结果
    OnHttpPack_ChangeAccountPswResult: function OnHttpPack_ChangeAccountPswResult(serverPack) {
        this.dataInfo["CharAccountPsw"] = serverPack.Psw;

        this.SysNotifyManager.ShowSysMsg("Account_ChangeAccountPswSuccess");
    },

    //账号服务器登录账号回复
    OnHttpPack_AccountLogin: function OnHttpPack_AccountLogin(serverPack) {
        this.dataInfo = serverPack;

        //每次登陆都覆盖缓存的sdkToken(客户端只记录一个玩家登陆token)
        var sdkToken = this.dataInfo["SDKToken"];
        var accountType = this.dataInfo["AccountType"];
        var accountID = this.dataInfo["AccountID"];

        var accessTokenInfo = {};
        //如果是微信APP,sdk授权登录
        if (sdkToken && accountType == this.ShareDefine.SDKType_WeChatApp) {
            accessTokenInfo = {
                "SDKToken": sdkToken,
                "AccountType": accountType,
                "AccountID": accountID
            };
        }
        this.ErrLog("OnHttpPack_AccountLogin sdkToken:%s, accessTokenInfo:%s", sdkToken, JSON.stringify(accessTokenInfo));
        this.LocalDataManager.SetConfigProperty("Account", "AccessTokenInfo", accessTokenInfo);

        //如果是公司内部账号,需要保存账号记录
        if (accountType == this.ShareDefine.SDKType_Company) {
            this.AddNewAccountList(this.dataInfo["CharAccount"], this.dataInfo["Token"]);
        }

        this.NetManager.InitConnectServer();
    },

    //----------------------操作函数--------------------

    //账号密码连接
    AccountLogin: function AccountLogin(charAccount, psw, isToken) {

        if (this.isDoLogin) {
            this.ErrLog("AccountLogin(%s,%s) is doing login", charAccount, psw);
            return;
        }
        this.IsDoLogining(true);

        var sendPack = this.NetManager.GetHttpSendPack(0xFF03);
        sendPack.CharAccount = charAccount;
        sendPack.CharAccountPsw = psw;
        sendPack.IsToken = isToken;
        this.NetManager.SendHttpPack(sendPack);
    },

    //一键注册账号密码
    OneKeyRegAccount: function OneKeyRegAccount() {

        if (this.isDoLogin) {
            this.ErrLog("OneKeyRegAccount is doing login");
            return;
        }
        this.IsDoLogining(true);

        var sendPack = this.NetManager.GetHttpSendPack(0xFF00);
        this.NetManager.SendHttpPack(sendPack);
    },

    SendRegAccount: function SendRegAccount(charAccount, accountPsw) {
        if (this.isDoLogin) {
            this.ErrLog("SendRegAccount is doing login");
            return;
        }
        this.IsDoLogining(true);

        var sendPack = this.NetManager.GetHttpSendPack(0xFF07);
        sendPack.CharAccount = charAccount;
        sendPack.Psw = accountPsw;
        this.NetManager.SendHttpPack(sendPack);
    },

    SendChangeAccountPsw: function SendChangeAccountPsw(accountID, oldPsw, newPsw) {
        var sendPack = this.NetManager.GetHttpSendPack(0xFF08);
        sendPack.AccountID = accountID;
        sendPack.OldPsw = oldPsw;
        sendPack.NewPsw = newPsw;
        this.NetManager.SendHttpPack(sendPack);
    },

    //sdk授权登录
    //sdkType:sdk类型
    //token:授权code
    //mpID:使用到的对应第3方标示(公众号)
    LoginAccountBySDK: function LoginAccountBySDK(sdkType, token, mpID, sdkAccountID) {
        if (this.isDoLogin) {
            this.ErrLog("LoginAccountBySDK is doing (%s,%s) login", sdkType, token);
            this.IsDoLogining(false);
            var that = this;
            cc.director.getScene()._sgNode.scheduleOnce(function () {
                //					that.SysLog("LoginAccountBySDK 0123456");
                that.IsDoLogining(false);
            }, 0.5);
            return;
        }
        this.IsDoLogining(true);

        if (!sdkAccountID) {
            sdkAccountID = 0;
        }
        var sendPack = this.NetManager.GetHttpSendPack(0xFF02);
        sendPack.SDKType = sdkType;
        sendPack.Token = token;
        sendPack.UserData = mpID;
        sendPack.SDKAccountID = sdkAccountID;
        this.NetManager.SendHttpPack(sendPack);
    },

    //设置是否是在登录
    IsDoLogining: function IsDoLogining(state) {
        this.isDoLogin = state;
        if (state) {
            app[app.subGameName + "Client"].OnEvent("ChangeBtnState", { "state": 1 });
        } else {
            app[app.subGameName + "Client"].OnEvent("ChangeBtnState", { "state": 0 });
        }
    }
});

var g_ddz_HeroAccountManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
    if (!g_ddz_HeroAccountManager) {
        g_ddz_HeroAccountManager = new ddz_HeroAccountManager();
    }
    return g_ddz_HeroAccountManager;
};

cc._RF.pop();