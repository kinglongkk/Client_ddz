"use strict";
cc._RF.push(module, '02cd0eWhEZBjpEFlJW8USi4', 'ddz_UILogin');
// script/ui/ddz_UILogin.js

"use strict";

/*
    UILogin 登陆界面
*/
var app = require("ddz_app");

cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        EditBoxAccount: cc.EditBox,
        EditBoxPsw: cc.EditBox

    },

    //初始化
    OnCreateInit: function OnCreateInit() {
        this.HeroAccountManager = app.ddz_HeroAccountManager();
        this.ShareDefine = app.ddz_ShareDefine();

        this.RegEvent("CodeError", this.Event_CodeError);
        this.RegEvent("ConnectFail", this.Event_ConnectFail);

        this.isToken = 0;
    },

    //登录错误码
    Event_CodeError: function Event_CodeError(event) {
        var argDict = event;
        var code = argDict["Code"];
        if (code == this.ShareDefine.KickOut_AccountTokenError) {
            this.EditBoxPsw.string = "";
        } else if (code == this.ShareDefine.KickOut_ServerClose) {
            this.WaitForConfirm("Code_10016", [], [], this.ShareDefine.ConfirmYN);
        }
    },

    //连接服务器失败
    Event_ConnectFail: function Event_ConnectFail(event) {
        this.UpdateAccessPoint();
        var argDict = event;
        if (!argDict['bCloseByLogout']) this.ShowSysMsg("Net_ConnectFail");
    },

    //--------------------显示函数----------------

    OnShow: function OnShow() {

        this.ShowAccountInfo();
    },

    //显示账号信息
    ShowAccountInfo: function ShowAccountInfo() {
        var accountList = this.HeroAccountManager.GetLocalAccountList();
        var count = accountList.length;

        var account = "";
        var token = "";

        if (count) {
            account = accountList[count - 1];
            token = this.HeroAccountManager.GetAccountToken(account);
            this.isToken = 1;
        }

        this.EditBoxAccount.string = account;
        this.EditBoxPsw.string = token;
    },

    //---------点击函数---------------------

    OnClick: function OnClick(btnName, btnNode) {

        if (btnName == "btnLogin") {
            this.Click_btnLogin();
        } else if (btnName == "btnReg") {
            this.Click_btnReg();
        } else {
            this.ErrLog("OnClick:%s not find", btnName);
        }
    },

    //点击登陆
    Click_btnLogin: function Click_btnLogin() {
        var charAccount = this.EditBoxAccount.string;
        if (!charAccount) {
            this.ShowSysMsg("AccountLogin_NotInputAccount");
            return;
        }
        var psw = this.EditBoxPsw.string;
        if (!psw) {
            this.ShowSysMsg("AccountLogin_NotInputPsw");
            return;
        }

        //如果密码等于token为token登录
        if (this.isToken) {
            psw = this.HeroAccountManager.GetAccountToken(charAccount);
        }

        //账号密码登陆
        this.HeroAccountManager.AccountLogin(charAccount, psw, this.isToken);
    },

    //点击注册
    Click_btnReg: function Click_btnReg() {
        this.HeroAccountManager.OneKeyRegAccount();
    },

    OnEditBoxBegin: function OnEditBoxBegin(sender) {

        //如果点击了密码输入,则清除token标示
        if (sender == this.EditBoxPsw) {
            this.isToken = 0;
            sender.string = "";
        }
    },
    UpdateAccessPoint: function UpdateAccessPoint() {
        app.ddz_HeroAccountManager().ChangeAccessPoint();
    }
});

cc._RF.pop();