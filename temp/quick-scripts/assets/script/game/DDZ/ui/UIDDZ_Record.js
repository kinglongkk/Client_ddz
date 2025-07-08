(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/game/DDZ/ui/UIDDZ_Record.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz3f2d6-52ae-46dc-b24c-c211963c6662', 'UIDDZ_Record', __filename);
// script/game/DDZ/ui/UIDDZ_Record.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        room_Id: cc.Label,
        end_Time: cc.Label,
        lb_jushu: cc.Label,
        fristLayout: cc.Node,
        exitBtnNode: cc.Node,
        exitRoomBtnNode: cc.Node,
        goSecondBtnNode: cc.Node,
        title: cc.Node,

        wolaikaijuBtnNode: cc.Node,
        pingfenkaijuBtnNode: cc.Node,
        dayingjiakaijuBtnNode: cc.Node,

        lb_cur: cc.Label,
        lb_go: cc.EditBox,

        icon_fct: cc.SpriteFrame,
        icon_ct: cc.SpriteFrame,

        boy: cc.SpriteFrame,
        girl: cc.SpriteFrame,

        title_1: cc.SpriteFrame,
        title_2: cc.SpriteFrame,

        ddzPrefab: cc.Prefab,
        icon_dissolveSpr: [cc.SpriteFrame]
    },

    OnCreateInit: function OnCreateInit() {
        this.btn_continue = this.GetWndNode("fristFrame/btn_lists/btn_continue");
        this.PokerModle = app[app.subGameName + "_PokerCard"]();
        this.fristFrame = this.node.getChildByName('fristFrame');
        this.secondFrame = this.node.getChildByName('scendFrame');
        this.fristScorll = this.fristFrame.getChildByName('ScrollView').getComponent(cc.ScrollView);
        this.redColor = new cc.Color(181, 104, 48);
        this.greenColor = new cc.Color(59, 138, 133);
        this.RegEvent("GameRecord", this.Event_GameRecord);
        this.RegEvent("EVT_CloseDetail", this.CloseForm, this);
        this.curSetId = 0;
        this.totalSetId = 0;
        this.backCode = 0;
        this.RegEvent("NewVersion", this.Event_NewVersion, this);
    },
    Event_NewVersion: function Event_NewVersion() {
        this.isNewVersion = true;
    },

    OnShow: function OnShow() {
        var datainfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var playerList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var needShowIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

        this.isNewVersion = false;
        app[app.subGameName + "_HotUpdateMgr"]().CheckUpdate(); //
        this.btn_continue.active = false;
        this.HideAllBtn();
        this.needShowSecond = false; //控制点击数据未到处理
        this.fristFrame.active = false;
        this.secondFrame.active = false;

        this.playerList = null;
        this.datainfo = null;
        this.dataByZhanJi = false;
        this.clubId = 0;
        var setID = 0;
        var endSec = '';
        var roomKey = '';
        var roomID = 0;
        if (-1 != needShowIndex) {
            this.dataByZhanJi = true;
            this.playerList = playerList;
            this.datainfo = datainfo;
            setID = datainfo.setId;
            endSec = datainfo.endTime;
            roomKey = "房间号:" + datainfo.key;
            roomID = datainfo.roomId;
            if (1 == needShowIndex) this.fristData = datainfo.countRecords;else {
                this.needShowSecond = true;
                app.NetManager().SendPack("game.CPlayerSetRoomRecord", { "roomID": roomID });
            }
        } else {
            this.roomMrg = app.DDZRoomMgr();
            if (!this.roomMrg) {
                this.CloseForm();
                return;
            }
            this.room = this.roomMrg.GetEnterRoom();
            if (!this.room) {
                this.CloseForm();
                return;
            }
            var roomEnd = this.room.GetRoomProperty("roomEnd");
            if (!roomEnd) {
                this.CloseForm();
                return;
            }
            var record = roomEnd["record"];
            setID = record["setCnt"];
            endSec = record['endSec'];
            roomKey = "房间号:" + this.room.GetRoomProperty("key");
            this.fristData = record['recordPosInfosList'];
            roomID = this.room.GetRoomProperty("roomID");
            var roomCfg = this.room.GetRoomConfig();
            this.clubId = roomCfg.clubId;
        }
        this.room_Id.string = roomKey;
        this.totalSetId = setID;
        this.lb_jushu.string = app.i18n.t("UIWanFa_setCount", { "setCount": setID });
        this.end_Time.string = this.ComTool.GetDateYearMonthDayHourMinuteString(endSec);

        if (-1 == needShowIndex || 1 == needShowIndex) this.UpdateFristFrame();else {
            this.UpdateScendFrame();
        }
    },
    UpdateFristFrame: function UpdateFristFrame() {
        this.title.getComponent(cc.Sprite).spriteFrame = this.title_1;
        this.fristScorll.stopAutoScroll();
        this.fristLayout.removeAllChildren();
        var dataCount = 0;
        for (var i = 0; i < this.fristData.length; i++) {
            if (0 != this.fristData[i].pid) dataCount++;
        }
        //先找出大赢家
        var bigBang = -1;
        var lastPoint = this.fristData[0].point;
        for (var _i = 0; _i < this.fristData.length; _i++) {
            if (this.fristData[_i].pid <= 0) continue;
            if (lastPoint < this.fristData[_i].point) {
                bigBang = _i;
                lastPoint = this.fristData[_i].point;
            }
        }
        if (0 != this.fristData[0].point && -1 == bigBang) bigBang = 0;
        var showTipIndex = 1;
        var node = null;
        var nodeObjs = {};
        for (var _i2 = 0; _i2 < this.fristData.length; _i2++) {
            var allNum = this.fristData[_i2].winCount + this.fristData[_i2].loseCount + this.fristData[_i2].flatCount;
            if (this.fristData[_i2].pid <= 0 || 0 == allNum) continue;
            node = cc.instantiate(this.ddzPrefab);
            this.GetFristPrefabAllNode(node, nodeObjs);

            if (bigBang == _i2 || lastPoint == this.fristData[_i2].point) nodeObjs.iconWin.active = true;else nodeObjs.iconWin.active = false;

            this.SetUserInfo(nodeObjs.userInfo, this.fristData[_i2].pid);
            this.SetScore(nodeObjs, _i2);
            this.fristLayout.addChild(node);
        }
        if (this.dataByZhanJi) {
            this.exitBtnNode.active = true;
            this.exitRoomBtnNode.active = false;
        } else {
            this.exitBtnNode.active = false;
            this.goSecondBtnNode.active = false;
            this.exitRoomBtnNode.active = true;
            if (!app[app.subGameName + "_ShareDefine"]().isCoinRoom) {
                var roomCfg = this.room.GetRoomConfig();
                if (0 == this.clubId && roomCfg.createType == 1) {
                    this.wolaikaijuBtnNode.active = false;
                    this.pingfenkaijuBtnNode.active = false;
                    this.dayingjiakaijuBtnNode.active = false;
                }
                if (0 != roomCfg.clubId) {
                    this.btn_continue.active = true;
                } else {
                    this.btn_continue.active = false;
                }
            }
        }
        this.fristFrame.active = true;
        this.secondFrame.active = false;
    },
    GetFristPrefabAllNode: function GetFristPrefabAllNode(curNode, nodeObjs) {
        nodeObjs.userInfo = curNode.getChildByName('user_info');
        nodeObjs.winNum = curNode.getChildByName('lb_win_num');
        nodeObjs.loseNum = curNode.getChildByName('lb_lose_num');
        nodeObjs.win = curNode.getChildByName('lb_win');
        nodeObjs.lose = curNode.getChildByName('lb_lose');
        nodeObjs.iconWin = curNode.getChildByName('icon_win');
        nodeObjs.lb_sportsPoint = curNode.getChildByName('lb_sportsPoint');
        nodeObjs.icon_dissolve = curNode.getChildByName('icon_dissolve');
    },
    SetUserInfo: function SetUserInfo(userInfoNode, pid) {
        var player = null;
        var ownerID = 0;
        if (this.dataByZhanJi) {
            for (var i = 0; i < this.playerList.length; i++) {
                if (pid == this.playerList[i].pid) {
                    player = this.playerList[i];
                    break;
                }
            }
            ownerID = this.datainfo.ownerID;
        } else {
            player = this.room.GetRoomPosMgr().GetPlayerInfoByPid(pid);
            ownerID = this.room.GetRoomProperty("ownerID");
        }
        if (!player) {
            this.ErrLog('SetUserInfo Error this.playerList.length = ' + this.playerList.length);
            return;
        }
        var playerName = "";
        playerName = player["name"];
        if (playerName.length > 4) {
            playerName = playerName.substring(0, 4) + '...';
        }
        userInfoNode.getChildByName("lable_name").getComponent(cc.Label).string = playerName;

        userInfoNode.getChildByName("label_id").getComponent(cc.Label).string = this.ComTool.GetPid(pid);
        var wechatSprite = userInfoNode.getChildByName("mask").getChildByName("head_img").getComponent(app.subGameName + "_WeChatHeadImage");
        wechatSprite.OnLoad();
        wechatSprite.ShowHeroHead(pid);

        //玩家性别
        var sex = userInfoNode.getChildByName("sex");
        if (player.sex == 0) {
            sex.getComponent(cc.Sprite).spriteFrame = this.boy;
        } else {
            sex.getComponent(cc.Sprite).spriteFrame = this.girl;
        }

        //判断房主是谁
        var fangzhu = userInfoNode.getChildByName("fangzhu");
        if (ownerID == player.pid) fangzhu.active = true;else fangzhu.active = false;
        //判断地主是谁
        // let icon_dzm = userInfoNode.getChildByName("icon_dzm");
        // if(ownerID == player.pid)
        //     icon_dzm.active = true;
        // else
        //     icon_dzm.active = false;
    },
    SetScore: function SetScore(nodeObjs, dataIndex) {
        var data = this.fristData[dataIndex];
        if (data.point > 0) {
            nodeObjs.winNum.active = true;
            nodeObjs.loseNum.active = false;
            // if(data.point > 10000){
            //     let needNum = data.point / 10000;
            //     needNum = needNum.toFixed(1);
            //     nodeObjs.winNum.getComponent(cc.Label).string = '+' + needNum + '万';
            // }
            // else
            nodeObjs.winNum.getComponent(cc.Label).string = '+' + data.point;
        } else {
            nodeObjs.winNum.active = false;
            nodeObjs.loseNum.active = true;
            // if(data.point < -10000){
            //     let needNum = data.point / 10000;
            //     needNum = needNum.toFixed(1);
            //     nodeObjs.loseNum.getComponent(cc.Label).string = '' + needNum + '万';;
            // }
            // else
            nodeObjs.loseNum.getComponent(cc.Label).string = data.point;
        }
        nodeObjs.win.getComponent(cc.Label).string = data.winCount;
        nodeObjs.lose.getComponent(cc.Label).string = data.loseCount;
        //比赛分
        var lb_sportsPointTitle = this.GetWndNode("fristFrame/title_list/lb_sportsPointTitle");
        if (typeof data.sportsPoint != "undefined") {
            if (data.sportsPoint > 0) {
                nodeObjs.lb_sportsPoint.getComponent(cc.Label).string = '+' + data.sportsPoint;
            } else {
                nodeObjs.lb_sportsPoint.getComponent(cc.Label).string = '' + data.sportsPoint;
            }
            lb_sportsPointTitle.active = true;
        } else {
            nodeObjs.lb_sportsPoint.getComponent(cc.Label).string = "";
            lb_sportsPointTitle.active = false;
        }
        //显示是否解散（-1:正常结束,0:未操作,1:同意操作,2:拒绝操作,3:发起者）
        if (typeof data.dissolveState == "undefined" || data.dissolveState == -1) {
            nodeObjs.icon_dissolve.active = false;
        } else {
            nodeObjs.icon_dissolve.active = true;
            nodeObjs.icon_dissolve.getComponent(cc.Sprite).spriteFrame = this.icon_dissolveSpr[data.dissolveState];
        }
    },
    UpdateScendFrame: function UpdateScendFrame() {
        if (!this.recordList) return;
        this.title.getComponent(cc.Sprite).spriteFrame = this.title_2;
        this.curSetId = 1;
        this.fristScorll.stopAutoScroll();

        this.UpdateScendFrameByIndex();
        this.fristFrame.active = false;
        this.secondFrame.active = true;
    },

    //刷新单局信息
    UpdateScendFrameByIndex: function UpdateScendFrameByIndex() {
        this.lb_cur.string = this.curSetId + "/" + this.totalSetId;
        var allPlayer = [];
        if (this.dataByZhanJi) allPlayer = this.playerList;else {
            allPlayer = this.room.GetRoomProperty('posList');
        }
        var data = eval('(' + this.recordList[this.curSetId - 1].dataJsonRes + ')');
        console.log("UpdateScendFrameByIndex data == " + data);
        this.backCode = this.recordList[this.curSetId - 1].playbackCode;
        for (var i = 0; i < data.posResultList.length; i++) {
            var player = data.posResultList[i];
            var playerNode = this.secondFrame.getChildByName("playerList").getChildByName("player" + (i + 1));
            playerNode.active = true;

            var point = player.point;

            //玩家分数
            var winNode = playerNode.getChildByName("lb_win_num");
            var loseNode = playerNode.getChildByName("lb_lose_num");
            winNode.active = false;
            loseNode.active = false;

            //地主标识
            if (player.isLandowner) {
                playerNode.getChildByName("user_info").getChildByName("icon_dzm").active = true;
            } else {
                playerNode.getChildByName("user_info").getChildByName("icon_dzm").active = false;
            }

            if (point > 0) {
                winNode.active = true;
                winNode.getComponent(cc.Label).string = "+" + point;
            } else {
                loseNode.active = true;
                loseNode.getComponent(cc.Label).string = point;
            }

            //倍数
            playerNode.getChildByName("lb_beiShu").active = true;
            var beishu = playerNode.getChildByName("lb_beiShu").getComponent(cc.Label);

            beishu.string = player.doubleNum;

            //底分
            playerNode.getChildByName("lb_difen").active = true;
            var difen = playerNode.getChildByName("lb_difen").getComponent(cc.Label);
            difen.string = player.baseMark;

            //显示春天或者反春天
            var icon_robClose = playerNode.getChildByName("icon_robClose");
            icon_robClose.active = true;

            if (player.robClose == -1) {
                icon_robClose.getComponent(cc.Sprite).spriteFrame = this.icon_fct;
            } else if (player.robClose == 1) {
                icon_robClose.getComponent(cc.Sprite).spriteFrame = this.icon_ct;
            } else {
                icon_robClose.active = false;
            }

            var playerInfo = null;
            for (var _i3 = 0; _i3 < allPlayer.length; _i3++) {
                if (player.pid == allPlayer[_i3].pid) {
                    playerInfo = allPlayer[_i3];
                    break;
                }
            }

            var head = playerNode.getChildByName("user_info").getChildByName("mask").getChildByName("head_img").getComponent("WeChatHeadImage");
            head.ShowHeroHead(playerInfo.pid);
            //玩家名字
            var playerName = "";
            playerName = playerInfo.name;
            if (playerName.length > 6) {
                playerName = playerName.substring(0, 6) + '...';
            }
            var name = playerNode.getChildByName("user_info").getChildByName("lable_name").getComponent(cc.Label);
            name.string = playerName;

            var id = playerNode.getChildByName("user_info").getChildByName("label_id").getComponent(cc.Label);
            id.string = this.ComTool.GetPid(playerInfo["pid"]);

            //玩家性别
            var sex = playerNode.getChildByName("user_info").getChildByName("sex");
            if (playerInfo.sex == 0) {
                sex.getComponent(cc.Sprite).spriteFrame = this.boy;
            } else {
                sex.getComponent(cc.Sprite).spriteFrame = this.girl;
            }
        }
    },

    Event_GameRecord: function Event_GameRecord(serverPack) {
        this.recordList = serverPack.pSetRoomRecords;
        if (!this.needShowSecond) return;

        this.UpdateScendFrame();
    },

    //-----------------回调函数------------------

    //---------点击函数---------------------
    HideAllBtn: function HideAllBtn() {
        this.exitBtnNode.active = false;
        this.goSecondBtnNode.active = false;
        this.wolaikaijuBtnNode.active = false;
        this.pingfenkaijuBtnNode.active = false;
        this.dayingjiakaijuBtnNode.active = false;
    },
    OnClick: function OnClick(btnName, btnNode) {
        //继续房间使用
        var room = app.DDZRoom();
        var roomCfg = {};
        if (room) {
            roomCfg = room.GetRoomConfig();
            roomCfg.isContinue = true;
        }
        //继续房间使用

        if ('btn_close' == btnName) {
            if (!this.dataByZhanJi) {
                this.secondFrame.active = false;
                this.fristFrame.active = true;
            } else this.CloseForm();
        } else if ('btn_goScend' == btnName) {
            if (!this.room.GetGameRecord()) this.needShowSecond = true;else {
                this.UpdateScendFrame();
            }
        } else if ('btn_share' == btnName) {
            this.SDKManager.ShareScreen();
        } else if ('btn_last' == btnName) {
            if (this.curSetId > 1) {
                this.curSetId -= 1;
                this.UpdateScendFrameByIndex();
            }
        } else if ('btn_next' == btnName) {
            if (this.curSetId < this.totalSetId) {
                this.curSetId += 1;
                this.UpdateScendFrameByIndex();
            }
        } else if ('btn_gotarget' == btnName) {
            var selectSetId = parseInt(this.lb_go.string);
            if (selectSetId <= this.totalSetId) {
                this.curSetId = selectSetId;
                this.UpdateScendFrameByIndex();
            } else {
                this.ShowSysMsg("请输入正确的局数");
            }
        } else if ('btn_look' == btnName) {
            app.NetManager().SendPack("game.CPlayerPlayBack", { "playBackCode": this.backCode, "chekcPlayBackCode": true }, this.OnPack_VideoData.bind(this), this.OnVideoFailed.bind(this));
        } else if ('btn_continue' == btnName) {
            if (this.isNewVersion == true) {
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("游戏有新版本更新，请返回大厅");
                return;
            }
            var self = this;
            app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "ContinueEnterRoom", {}, function (event) {
                app[app.subGameName + "_NetManager"]().SendPack("game.C1101GetRoomID", {});
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_Result");
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_2DResult");
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_2DPlay");
                self.CloseForm();
            }, function (event) {
                if (event.Msg == "UNION_BACK_OFF_PLAYING") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您已申请退赛，当前无法进行比赛，请取消退赛申请或联系赛事举办方");
                } else if (event.Msg == "UNION_APPLY_REMATCH_PLAYING") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您的比赛分不足，已被淘汰，将被禁止参与赛事游戏，如要重新参与比赛，请联系举办方处理");
                } else if (event.Msg == "UNION_STATE_STOP") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("赛事已停用，无法加入房间，请联系赛事举办方");
                } else if (event.Msg == "ROOM_GAME_SERVER_CHANGE") {
                    console.log("切换服务器");
                } else if (event.Code == 12) {
                    console.log("游戏维护");
                } else if (event.Msg == "WarningSport_RoomJoinner") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您所在的推广员队伍或上级队伍比赛分低于预警值，无法加入比赛，请联系管理");
                } else if (event.Msg == "CLUB_SPORT_POINT_WARN") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您所在的亲友圈比赛分低于预警值，无法加入比赛，请联系管理");
                } else {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("无法继续游戏，请联系赛事举办方");
                }
            });
        } else if ('btn_exitRoom' == btnName) {
            app[app.subGameName + "Client"].ExitGame();
        } else if ('btn_exit' == btnName) {
            this.CloseForm();
        } else if (btnName == "btn_pingfenkaiju") {
            if (this.isNewVersion == true) {
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("游戏有新版本更新，请返回大厅");
                return;
            }
            roomCfg.paymentRoomCardType = 1;
            app.NetManager().SendPack("ddz.CDDZCreateRoom", roomCfg, function () {}, this.FailCreate.bind(this));
        } else if (btnName == "btn_wolaikaiju") {
            if (this.isNewVersion == true) {
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("游戏有新版本更新，请返回大厅");
                return;
            }
            roomCfg.paymentRoomCardType = 0;
            app.NetManager().SendPack("ddz.CDDZCreateRoom", roomCfg, function () {}, this.FailCreate.bind(this));
        } else if (btnName == "btn_dayingjiakaiju") {
            if (this.isNewVersion == true) {
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("游戏有新版本更新，请返回大厅");
                return;
            }
            roomCfg.paymentRoomCardType = 2;
            app.NetManager().SendPack("ddz.CDDZCreateRoom", roomCfg, function () {}, this.FailCreate.bind(this));
        } else {
            this.ErrLog("OnClick(%s) not find btnName", btnName);
        }
    },
    FailCreate: function FailCreate(serverPack) {
        if (serverPack['Msg'].indexOf('RoomCard need roomCard') > -1) {
            var desc = app.SysNotifyManager().GetSysMsgContentByMsgID("MSG_NotRoomCard");
            app.ConfirmManager().SetWaitForConfirmForm(this.OnConFirm.bind(this), "goBuyCard", []);
            app.FormManager().ShowForm("UIMessage", null, this.ShareDefine.ConfirmBuyGoTo, 0, 0, desc);
            return;
        } else {
            this.ErrLog("FailCreate Room Msg:(%s)", serverPack.Msg);
        }
    },
    OnSuccess: function OnSuccess(serverPack) {
        console.log('OnSuccess serverPack', serverPack);
        var roomID = serverPack.roomID;
        if ('ddz' == app.subGameName) {
            app.NetManager().SendPack('ddz.CDDZGetRoomInfo', { "roomID": roomID });
        }
        this.CloseForm();
    },

    OnEnterRoomFailed: function OnEnterRoomFailed(serverPack) {
        app[app.subGameName + "Client"].ExitGame();
        console.log('OnEnterRoomFailed serverPack', serverPack);
    },
    OnPack_VideoData: function OnPack_VideoData(gameType) {
        if (gameType == "DDZ") {
            this.FormManager.ShowForm("game/DDZ/UIDDZVideo", this.backCode);
        }
        this.CloseForm();
    },
    OnVideoFailed: function OnVideoFailed(serverPack) {
        app.SysNotifyManager().ShowSysMsg("MSG_REPLAY_ERROR");
    },
    OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
        if (clickType != "Sure") {
            return;
        }
        if ("goBuyCard" == msgID) {
            var clientConfig = app[app.subGameName + "Client"].GetClientConfig();
            if (app.PackDefine.APPLE_CHECK == clientConfig["appPackType"]) return;
            app.FormManager().ShowForm("UIStore");
            return;
        }
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
        //# sourceMappingURL=UIDDZ_Record.js.map
        