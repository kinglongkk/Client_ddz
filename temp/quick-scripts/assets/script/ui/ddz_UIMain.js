(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIMain.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddzf560c-e8f7-401b-b8b8-b65d6fcdaa11', 'ddz_UIMain', __filename);
// script/ui/ddz_UIMain.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        resVersion: cc.Label,
        lb_backCode: cc.EditBox
    },
    OnCreateInit: function OnCreateInit() {
        this.practiceConfig = app.ddz_SysDataManager().GetTableDict("practice");
        this.FormManager = app.ddz_FormManager();
        this.RegEvent("GetCurRoomID", this.Event_GetCurRoomID, this);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    //-----------------显示函数------------------
    OnShow: function OnShow() {
        app[app.subGameName + "Client"].SetGameType('');
        this.curRoomID = 0;
        this.curGameTypeStr = '';
        app.ddz_GameManager().SetGetRoomIDByUI(true);
        app.ddz_NetManager().SendPack("game.C1101GetRoomID", {});

        if (cc.sys.isNative) {
            this.resVersion.string = "resV" + app.ddz_HotUpdateMgr().getLocalVersion();
        } else {
            this.resVersion.string = '';
        }
        this.FormManager.ShowForm(app.subGameName + "_UITop", app.subGameName + "_UIMain", true, false, true);
        this.FormManager.ShowForm(app.subGameName + "_UINoticeBar");
        app.ddz_GameManager().SetAutoPlayIng(false);
        this.FormManager.CloseForm(app.subGameName + "_UIAutoPlay");
        //返回大厅检测下是否有需要处理的数据
        var allSwitchGameData = [];
        var switchGameData = cc.sys.localStorage.getItem("switchGameData");
        if (switchGameData != "") {
            allSwitchGameData.push(JSON.parse(switchGameData));
        }
        for (var i = 0; i < allSwitchGameData.length; i++) {
            if (!allSwitchGameData[i]) return;
            console.log("allSwitchGameData[i].action");
            var action = allSwitchGameData[i].action;
            switch (action) {
                case 'showForm':
                    this.FormManager.ShowForm(allSwitchGameData[i].fromName);
                    break;
                default:
                    console.log('未知动作: ' + action);
                    break;
            }
        }
        cc.sys.localStorage.setItem("switchGameData", "");
    },

    Event_GetCurRoomID: function Event_GetCurRoomID(event) {
        var serverPack = event;
        this.curRoomID = serverPack.roomID;
        if (0 != this.curRoomID) {
            this.curGameTypeStr = serverPack.gameType.toLowerCase();
        }
    },
    Event_CodeError: function Event_CodeError(event) {
        var codeInfo = event;
        if (codeInfo["Code"] == this.ShareDefine.NotFind_Room) {
            app.ddz_SysNotifyManager().ShowSysMsg('DissolveRoom');
            this.curRoomID = 0;
            this.curGameTypeStr = '';
        }
    },
    OnClose: function OnClose() {},
    //---------点击函数---------------------
    InitGameBtnList: function InitGameBtnList(serverPack) {
        this.FormManager.ShowForm("UICreatRoom", serverPack, this.gameName);
    },
    SetWaitForConfirm: function SetWaitForConfirm(msgID, type) {
        var msgArg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var cbArg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

        var ConfirmManager = app.ddz_ConfirmManager();
        ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, cbArg);
        ConfirmManager.ShowConfirm(type, msgID, msgArg);
    },
    OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
        if (clickType != "Sure") {
            return;
        }
        if ('MSG_GO_ROOM' == msgID) {
            this.Click_btn_goRoom();
        } else if ('MSG_CLUB_RoomCard_Not_Enough' == msgID) {
            var clubId = backArgList[0];
            for (var i = 0; i < this.clubCardNtfs.length; i++) {
                if (this.clubCardNtfs[i].clubId == clubId) {
                    this.clubCardNtfs.splice(i, 1);
                    break;
                }
            }
            if (0 != this.clubCardNtfs.length) {
                var data = this.clubCardNtfs[0];
                setTimeout(function () {
                    app.ddz_SysNotifyManager().ShowSysMsg('MSG_CLUB_RoomCard_Not_Enough', [data.clubName, data.roomcardattention]);
                }, 200);
            }
        }
    },
    OnClick: function OnClick(btnName, btnNode) {
        if ('btn_create' == btnName) {
            if (0 != this.curRoomID) {
                this.SetWaitForConfirm('MSG_GO_ROOM', this.ShareDefine.Confirm, [this.curGameTypeStr]);
                return;
            }
            this.gameName = 'ddz';
            this.FormManager.ShowForm(app.subGameName + "_UICreatRoom", null, this.gameName);
        } else if ('btn_lxc' == btnName) {
            if (0 != this.curRoomID) {
                this.SetWaitForConfirm('MSG_GO_ROOM', this.ShareDefine.Confirm, [this.curGameTypeStr]);
                return;
            }
            this.FormManager.ShowForm(app.subGameName + "_UIPractice");
        } else if ('btn_join' == btnName) {
            if (0 != this.curRoomID) {
                this.SetWaitForConfirm('MSG_GO_ROOM', this.ShareDefine.Confirm, [this.curGameTypeStr]);
                return;
            }
            this.FormManager.ShowForm(app.subGameName + "_UIJoin");
        } else if ('btn_exit' == btnName) {
            app[app.subGameName + "Client"].ExitGame();
        } else if ('btn_race' == btnName) {
            this.ShowSysMsg("功能暂未开放，尽情期待！");
            // let videoData = {action:"showVideo", backCode:100001};
            // cc.sys.localStorage.setItem("switchGameData", JSON.stringify(videoData));
            // app.ddz_SceneManager().LoadScene(app.subGameName + "VideoScene");
        } else if ("btn_video" == btnName) {
            var videoData = { action: "showVideo", backCode: parseInt(this.lb_backCode.string) };
            cc.sys.localStorage.setItem("switchGameData", JSON.stringify(videoData));
            app.ddz_SceneManager().LoadScene(app.subGameName + "VideoScene");
        } else {
            this.ErrLog("OnClick(%s) not find", btnName);
        }
    },

    Click_btn_goRoom: function Click_btn_goRoom() {
        app[app.subGameName + "Client"].SetGameType(this.curGameTypeStr);
        var event = {};
        event = {};
        event.roomID = this.curRoomID;
        app[app.subGameName + "Client"].OnEvent_LoginGetCurRoomID(event);
    }
});

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
        //# sourceMappingURL=ddz_UIMain.js.map
        