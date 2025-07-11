"use strict";
cc._RF.push(module, '08257xJf7tOFaWzZPKa4BCj', 'ddz_UIPractice');
// script/ui/ddz_UIPractice.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        contentNode: cc.Node
    },
    OnCreateInit: function OnCreateInit() {
        this.practiceConfig = app.ddz_SysDataManager().GetTableDict("practice");
        this.FormManager = app.ddz_FormManager();
        this.NetManager = app.ddz_NetManager();
        this.playerNumList = [];
        this.practiceId = 0;
        this.RegEvent("GetCurRoomID", this.Event_GetCurRoomID, this);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    //-----------------显示函数------------------
    OnShow: function OnShow() {
        this.gameType = app.subGameName;
        app[app.subGameName + "Client"].SetGameType('');
        this.curRoomID = 0;
        this.curGameTypeStr = "";
        app.ddz_GameManager().SetGetRoomIDByUI(true);
        app.ddz_NetManager().SendPack("game.C1101GetRoomID", {});
        app.ddz_GameManager().SetAutoPlayIng(false);
        this.FormManager.CloseForm("UIAutoPlay");
        this.FormManager.ShowForm(app.subGameName + "_UINoticeBar");
        this.FormManager.ShowForm(app.subGameName + "_UITop", app.subGameName + "_UIPractice", true, false, true);
        this.sendGameType();
    },
    sendGameType: function sendGameType() {
        var sendPack = {
            'gameType': this.gameType
        };
        app.ddz_NetManager().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GoldList", sendPack, this.OnSuccessInitData.bind(this));
    },
    OnSuccessInitData: function OnSuccessInitData(serverPack) {
        //获取服务端传过来的数据
        var list = serverPack.gameLists;
        if (this.playerNumList && this.playerNumList.length) {
            this.playerNumList.splice(0, this.playerNumList.length);
        }
        for (var idx = 0; idx < list.length; idx++) {
            this.playerNumList.push(list[idx]);
        }
        this.UpdatePractice();
    },
    UpdatePractice: function UpdatePractice() {
        var refreshList = [];
        for (var key in this.practiceConfig) {
            if (this.gameType == this.practiceConfig[key]['gameType']) refreshList.push(this.practiceConfig[key]);
        }
        for (var i = 0; i < refreshList.length; i++) {
            if (i > 3) {
                break;
            }
            var childNode = this.contentNode.children[i];
            var baseNum = refreshList[i]['baseMark'];
            var baseMark = '';
            if (baseMark >= 10000) baseMark = (baseNum / 10000).toFixed(1) + '万';else if (baseMark > 1000) baseMark = (baseNum / 1000).toFixed(1) + '千';else baseMark = baseNum.toString();
            childNode.getChildByName('lb_difen').getComponent(cc.Label).string = "底分:" + baseMark;
            if (this.playerNumList.length) {
                childNode.getChildByName('lb_renshu').getComponent(cc.Label).string = this.playerNumList[i].playerNum.toString() + '人';
            }
            var min = refreshList[i]['min'];
            var max = refreshList[i]['max'];
            var needStr = '';
            if (0 == max) {
                if (min < 1000) needStr = min.toString();else if (min >= 10000) needStr = parseInt(min / 10000).toString() + '万以上';else needStr = parseInt(min / 1000).toString() + '千以上';
            } else {
                if (min < 1000) needStr = min.toString() + '-';else if (min >= 10000) needStr = parseInt(min / 10000).toString() + '万-';else needStr = parseInt(min / 1000).toString() + '千-';

                if (max < 1000) needStr += max.toString();else if (max >= 10000) needStr += parseInt(max / 10000).toString() + '万';else needStr += parseInt(max / 1000).toString() + '千';
            }
            childNode.getChildByName('lb_zhunru').getComponent(cc.Label).string = "准入:" + needStr;
        }
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
        var code = codeInfo["Code"];
        if (code == this.ShareDefine.NotFind_Room) {
            app.SysNotifyManager().ShowSysMsg('DissolveRoom');
            this.curRoomID = 0;
            this.curGameTypeStr = '';
        } else if (code == this.ShareDefine.NotEnoughCoin) {
            this.WaitForConfirm("MSG_NOTROOMCOIN", [], [], this.ShareDefine.Confirm);
        } else if (code == this.ShareDefine.MuchCoin) {
            this.WaitForConfirm("MSG_TOOMUCHCOIN", [], [], this.ShareDefine.ConfirmOK);
        }
    },
    OnClose: function OnClose() {},
    //---------点击函数---------------------
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
        } else if ('MSG_NOTROOMCOIN' == msgID) {
            var testData = { action: "showForm", fromName: "UIStore" };
            app[app.subGameName + "Client"].ExitGame(testData);
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
    GetCfgByGameName: function GetCfgByGameName(gameName) {
        var cfgList = [];
        for (var key in this.practiceConfig) {
            if (gameName == this.practiceConfig[key].gameType) cfgList.push(this.practiceConfig[key]);
        }
        return cfgList;
    },
    sendPracticeId: function sendPracticeId() {
        var argList = Array.prototype.slice.call(arguments);
        var idx = 0;
        if (typeof argList[0] == 'string') {
            idx = Math.floor(argList[0].substring('item'.length));
        } else if (typeof argList[0] == 'number') {
            idx = argList[0];
        }
        this.practiceId = idx;

        var sendPack = {
            practiceId: idx
        };
        app.ddz_NetManager().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GoldRoom", sendPack, this.OnSuccess.bind(this), this.OnEnterRoomFailed.bind(this));
    },
    OnClick: function OnClick(btnName, btnNode) {
        var needCfgList = [];
        if ('btn_xsc' == btnName) {
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[0].id);
        } else if ('btn_cjc' == btnName) {
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[1].id);
        } else if ('btn_zjc' == btnName) {
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[2].id);
        } else if ('btn_gjc' == btnName) {
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[3].id);
        } else if ('btn_go' == btnName) {
            var gold = app.ddz_HeroManager().GetHeroProperty('gold');
            needCfgList = this.GetCfgByGameName(this.gameType);
            if (0 == needCfgList.length) {
                this.ErrLog('needCfgList Error curGameName :' + this.gameType);
                return;
            }
            if (gold < needCfgList[0].min) {
                this.WaitForConfirm("MSG_NOTROOMCOIN", [], [], this.ShareDefine.Confirm);
                return;
            }
            var needId = -1;
            for (var i = 0; i < needCfgList.length; i++) {
                if (gold >= needCfgList[i].min && (gold <= needCfgList[i].max || 0 == needCfgList[i].max)) {
                    needId = needCfgList[i].id;
                    break;
                }
            }
            if (-1 == needId) {
                this.ErrLog('CfgError needId = -1');
                return;
            }
            this.sendPracticeId(needId);
        } else {
            this.ErrLog("OnClick(%s) not find", btnName);
        }
    },

    OnSuccess: function OnSuccess(serverPack) {
        console.log('OnSuccess serverPack', serverPack);
        var roomID = serverPack.roomID;
        app.ddz_NetManager().SendPack('ddz.CDDZGetRoomInfo', { "roomID": roomID });
        app.ddz_ShareDefine().practiceId = this.practiceId;
    },

    OnEnterRoomFailed: function OnEnterRoomFailed(serverPack) {
        console.log('OnEnterRoomFailed serverPack', serverPack);
    }
});

cc._RF.pop();