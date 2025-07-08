"use strict";
cc._RF.push(module, 'e9911dSHBhBXL5LnKvD60Gg', 'ddz_BasePlay');
// script/game/DDZ/ui/ddz_BasePlay.js

"use strict";

var app = require("ddz_app");
var BasePlayForm = cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    OnCreateInit: function OnCreateInit() {
        this.DDZRoomMgr = app.DDZRoomMgr();
        this.DDZRoom = app.DDZRoom();
        this.HeroManager = app[app.subGameName + "_HeroManager"]();
        this.SceneManager = app[app.subGameName + "_SceneManager"]();
        this.UtilsWord = app[app.subGameName + "_UtilsWord"]();
        this.PokerCard = app[app.subGameName + "_PokerCard"]();
        this.DDZRoomPosMgr = app.DDZRoomPosMgr();
        this.DDZRoomSet = app.DDZRoomSet();
        this.LogicDDZGame = app.LogicDDZGame();
        this.ShareDefine = app[app.subGameName + "_ShareDefine"]();
        this.DDZDefine = app.DDZDefine();

        //是否第一次进入
        this.isFirstEnter = true;

        this.basePath = 'texture/game/doudizhu/';

        //UI
        this.btn_ok = this.GetWndNode("gameBtnStartList/btn_ok");
        this.tip_ok = this.node.getChildByName("tip_ok");
        this.razzNode = this.node.getChildByName("razzNode");

        //公共消息
        this.RegEvent("DDZ_PosContinueGame", this.Event_PosContinueGame);
        this.RegEvent("DDZ_DissolveRoom", this.Event_DissolveRoom);
        this.RegEvent("DDZ_StartVoteDissolve", this.Event_StartVoteDissolve); //发起房间结算投票
        this.RegEvent("DDZ_PosLeave", this.Event_PosLeave);
        this.RegEvent("DDZ_PosUpdate", this.Event_PosUpdate);
        this.RegEvent("DDZ_PosReadyChg", this.Event_PosReadyChg);
        this.RegEvent('GameGift', this.Event_GameGift);
        this.RegEvent('ExitRoomSuccess', this.Event_ExitRoomSuccess);
        this.RegEvent("DDZ_OnRoomNotFindByReason", this.Event_OnRoomNotFindByReason, this);

        this.RegEvent("OnCopyTextNtf", this.OnEvt_CopyTextNtf, this);

        //游戏消息
        this.RegEvent("DDZSetStart", this.Event_SetStart);
        this.RegEvent("DDZSetEnd", this.Event_SetEnd);
        this.RegEvent("RoomEnd", this.Event_RoomEnd);
        this.RegEvent("SPlayer_Trusteeship", this.OnPack_AutoStart);
        this.RegEvent("ChatMessage", this.Event_ChatMessage);
        this.RegEvent("HandCard", this.Event_ShowHandCard);
        this.RegEvent("OpCard", this.Event_OpCard);
        this.RegEvent("ChangeStatus", this.Event_ChangeStatus);
        this.RegEvent("AddDouble", this.Event_AddDouble);
        this.RegEvent("OpenCard", this.Event_OpenCard);
        this.RegEvent("Hog", this.Event_Hog);
        this.RegEvent("OpenStartGame", this.Event_OpenStartGame);
        this.RegEvent("CardNumber", this.Event_CardNumber);

        //比赛分不足时通知
        this.RegEvent("SportsPointEnough", this.Event_SportsPointEnough);
        this.RegEvent("SportsPointNotEnough", this.Event_SportsPointNotEnough);
        //比赛分门槛不足时通知
        this.RegEvent("SportsPointThresholdEnough", this.Event_SportsPointThresholdEnough);
        this.RegEvent("SportsPointThresholdNotEnough", this.Event_SportsPointThresholdNotEnough);

        this.RegEvent('CodeError', this.Event_CodeError);
        cc.game.on(cc.game.EVENT_HIDE, this.OnEventHide.bind(this));
        cc.game.on(cc.game.EVENT_SHOW, this.OnEventShow.bind(this));

        this.Left = [false, true, false];

        this.cardSpcedX = 0;

        this.handCards.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.handCards.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.handCards.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.handCards.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel, this);

        this.boom_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.plane_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.liandui_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.dragon_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.GameEnd_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.ShutDow_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        for (var i = 0; i < 3; i++) {
            var OpenCard_Ani = this.GetWndNode("sp_seat0" + i + "/OpenCard_Ani");
            OpenCard_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        }

        this.InitData();

        this.AddCardPrefab();

        this.invitationNode = cc.instantiate(this.UIInvitation);
        this.node.addChild(this.invitationNode);
    },
    Event_CodeError: function Event_CodeError(event) {
        var argDict = event;
        var code = argDict["Code"];
        if (code == this.ShareDefine.SportsPointNotEnough) {
            this.ShowSysMsg("比赛分不足房间自动解散");
            // this.SetWaitForConfirm("SportsPointNotEnough",this.ShareDefine.ConfirmYN, []);
        } else if (code == this.ShareDefine.NotAllow) {
            if (this.FormManager.IsFormShow("game/DDZ/UIDDZ_Result")) {
                this.FormManager.CloseForm("game/DDZ/UIDDZ_Result");
            }
            if (this.FormManager.IsFormShow("game/DDZ/UIDDZ_2DResult")) {
                this.FormManager.CloseForm("game/DDZ/UIDDZ_2DResult");
            }
        } else if (code == this.ShareDefine.SportsPointNotEnough) {
            this.ShowSysMsg("比赛分不足房间自动解散");
            // this.SetWaitForConfirm("SportsPointNotEnough",this.ShareDefine.ConfirmYN, []);
        } else if (code == this.ShareDefine.ApplyDissolve) {
            this.ShowSysMsg("申请解散次数已达上限");
        }
    },
    Event_SportsPointEnough: function Event_SportsPointEnough(event) {
        var msg = event.msg;
        this.SetWaitForConfirm("SportsPointEnough", this.ShareDefine.ConfirmOK, [msg]);
    },
    Event_SportsPointNotEnough: function Event_SportsPointNotEnough(event) {
        var msg = event.msg;
        this.ShowSysMsg("比赛分不足房间自动解散");
        // this.SetWaitForConfirm("SportsPointNotEnough",this.ShareDefine.ConfirmYN, []);
    },

    Event_SportsPointThresholdEnough: function Event_SportsPointThresholdEnough(event) {
        var msg = event.msg;
        this.SetWaitForConfirm("SportsPointThresholdEnough", this.ShareDefine.ConfirmOK, [msg]);
    },
    Event_SportsPointThresholdNotEnough: function Event_SportsPointThresholdNotEnough(event) {
        var msg = event.msg;
        // this.ShowSysMsg("您得比赛分门槛不足，请联系赛事管理");
        this.SetWaitForConfirm("SportsPointThresholdNotEnough", this.ShareDefine.ConfirmOK, []);
    },
    InitData: function InitData() {
        //所有的牌索引
        this.allCardIdx = 0;
        this.openCardMutiple = 0;
        this.allPlayerCardIdx = [0, 0, 0, 0];
        //黑桃3牌索引
        this.card3Idx = 0;

        this.firstTurn = false;

        this.tipCount = 0;

        this.lastCircleEnd = false;

        this.openCardInfo = {};

        this.notUp = false;

        this.landowner = -1;
    },
    IsShowCardDevice: function IsShowCardDevice() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty('kexuanwanfa');
        if (kexuanwanfa.length > 0) {
            if (kexuanwanfa.indexOf(8) > -1) {
                return false;
            }
        }
        return true;
    },
    IsShowChat: function IsShowChat() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        var gaoji = room.GetRoomConfigByProperty('gaoji');
        if (gaoji.length > 0) {
            if (gaoji.indexOf(6) > -1) {
                return false;
            }
        }
        return true;
    },
    OnShow: function OnShow() {
        this.CheckUpdateNotice();
        this.node.getChildByName("tip_exit_node").active = false;
        //确保该玩家还在该房间内，否则强制退出房间
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GetRoomID", {}, function (event) {
            if (event.roomID <= 0 || event.roomID != roomID) {
                app[app.subGameName + "Client"].ExitGame();
            }
        }, function (error) {
            app[app.subGameName + "Client"].ExitGame();
        });
        //初始化邀请在线好友的数据
        this.roomCfg = this.DDZRoomMgr.GetEnterRoom().GetRoomConfig();
        if (this.roomCfg.clubId > 0 || this.roomCfg.unionId > 0) {
            this.invitationNode.active = true;
            this.invitationNode.getComponent(this.invitationNode.name).InitData(this.roomCfg.clubId, this.roomCfg.unionId, roomID);
        } else {
            this.invitationNode.active = false;
        }
        this.AddHead();
        this.HideAll();
        this.unscheduleAllCallbacks();
        this.SceneManager.PlayMusic("back_1");
        this.InitData();
        this.ClearForbiddenTouch();
        //设置牌间距,便于选牌
        var handCardsSpacingX = this.handCards.getComponent(cc.Layout).spacingX;
        var cardNodeWidth = this.cardPrefab.data.width;
        this.cardSpcedX = cardNodeWidth + handCardsSpacingX;

        var state = this.DDZRoomSet.GetRoomSetProperty("state");
        var disslove = this.DDZRoom.GetRoomProperty("dissolve");
        var roomState = this.DDZRoom.GetRoomProperty("state");
        this.xianShi = this.DDZRoom.GetRoomConfigByProperty("xianShi");
        //显示房间信息
        this.labeiWanfa.string = this.WanFa();
        if (app[app.subGameName + "_ShareDefine"]().isCoinRoom) {
            this.roomInfo.active = false;
        } else {
            this.roomInfo.active = true;
            this.labelRoomId.string = "房间号：" + this.DDZRoom.GetRoomProperty("key");
            var setID = this.DDZRoom.GetRoomProperty("setID");
            var current = this.DDZRoom.GetRoomConfigByProperty("setCount");
            this.lb_jushu.string = "局数：" + setID + "/" + current;
        }
        //显示叫分和倍数
        this.UpdateScoreAndDouble();

        //更新金币和钻石
        this.UpdateSelfScore();

        if (disslove.endSec != 0) {
            //如果有人发起解散消息
            this.FormManager.ShowForm(app.subGameName + "_UIMessage02");
        }

        if (roomState != this.ShareDefine.RoomState_Init) {
            var setInfo = this.DDZRoomSet.GetRoomSetInfo();
            //更新记牌器
            this.UpdateCardNum(setInfo.cardNumMap);
            //如果有玩家托管  显示托管图标
            var posList = this.DDZRoom.GetRoomProperty("posList");
            for (var i = 0; i < posList.length; i++) {
                var data = posList[i];
                var pos = data['pos'];
                var isAuto = data['trusteeship'];
                if (isAuto) {
                    var headScript = this.GetUICardComponentByPos(pos);
                    headScript.ShowAutoIcon(isAuto);
                }
            }
            //分数
            // this.DDZRoomPosMgr.OnPoint(setInfo.posInfo, true);
            this.UpdatePlayerScore();
            //更新地主牌
            this.ShowDiZhuPai(setInfo.holeCards);
            this.landowner = setInfo.landowner;
            if (this.landowner != -1) {
                //已经确认地主了
                var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(this.landowner);
                var path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
                var headNode = this.GetWndNode(path);
                var _headScript = headNode.getComponent("UIDDZHead");
                _headScript.Showlandowner(true);
            }
            //发牌阶段
            if (state == this.ShareDefine.DDZSetState_FaPai) {
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
            } else if (state == this.ShareDefine.DDZSetState_Hog) {
                //抢地主阶段
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
                this.ShowBtnHog(setInfo.opPos, setInfo.isHaveHog);
            } else if (state == this.ShareDefine.DDZSetState_AddDouble) {
                //加倍阶段
                this.InitGameStateCommon(state);
                this.ShowBtnMultiple();
            } else if (state == this.ShareDefine.DDZSetState_Playing) {
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
                this.LogicDDZGame.SetCardData(setInfo.opType, setInfo.cardList);
                //显示当前操作位和上家出的牌
                var time = this.DDZDefine.MaxTickTime[this.xianShi];
                this.lastCircleEnd = setInfo.isFirstOp;
                this.firstTurn = setInfo.isFirstOp;
                if (setInfo.opPos == this.DDZRoomPosMgr.GetClientPos()) {
                    if (setInfo.isFirstOp) {
                        this.ShowBtnOutCard();
                    } else {
                        if (setInfo.opType == 0) {
                            this.ShowBtnOutCard();
                        } else {
                            var array = this.LogicDDZGame.GetTipCard();
                            this.ForbiddenTouch(array);
                            if (!array.length) {
                                if (this.isAutoPass()) {
                                    time = this.DDZDefine.MinTickTime;
                                } else {
                                    this.ShowAllGameBtn();
                                    time = this.DDZDefine.MinTickTime;
                                    this.lb_mypdgsj.active = true;
                                }
                            } else {
                                if (array.length == 0 || array.length == 1 && array[0].length == 0) {
                                    this.lb_mypdgsj.active = true;
                                }
                                this.ShowAllGameBtn();
                            }
                        }
                    }
                }
                //由于获取提示牌有排序了上家出牌，这边需要再次排序，从大到小
                this.LogicDDZGame.SortCardByMax(setInfo.cardList);
                this.ShowOutCard(setInfo.lastOpPos, setInfo.cardList);
                this.SetSeat01OutCardPos(setInfo.lastOpPos, setInfo.cardList.length);
                this.StartTickTime(setInfo.opPos, time);
            } else if (state == this.ShareDefine.DDZSetState_End) {
                //如果玩家已经准备则不显示结算界面
                var clientPos = this.DDZRoomPosMgr.GetClientPos();
                var clientPlayerInfo = this.DDZRoomPosMgr.GetPlayerInfoByPos(clientPos);
                if (clientPlayerInfo["gameReady"]) {
                    this.RefreshRoomShow();
                    return;
                }
                this.FormManager.ShowForm("game/DDZ/UIDDZ_Result");
            }
        } else {
            this.RefreshRoomShow();
        }

        //获取用户推广Url
        this.GetTuiGuangUrl();
    },

    OnAniPlayFinished: function OnAniPlayFinished(type, state) {
        console.log("type ==" + type);
        if (state.name == 'feiji') {
            this.plane_Ani.active = false;
        } else if (state.name == 'zhadan') {
            this.boom_Ani.active = false;
        } else if (state.name == 'wangzha') {
            this.boom_Ani.active = false;
        } else if (state.name == 'liandui') {
            this.liandui_Ani.active = false;
        } else if (state.name == 'shunzi') {
            this.dragon_Ani.active = false;
        } else if (state.name == 'dragon') {
            this.dragon_Ani.active = false;
        } else if (state.name == 'chuntian') {
            this.ShutDow_Ani.active = false;
        } else if (state.name == 'fanchuntian') {
            this.ShutDow_Ani.active = false;
        } else if (state.name == 'mingpai') {
            for (var i = 0; i < 3; i++) {
                var OpenCard_Ani = this.GetWndNode("sp_seat0" + i + "/OpenCard_Ani");
                OpenCard_Ani.active = false;
            }
        } else if (state.name == 'nongminshengli' || state.name == 'nongminshibai' || state.name == 'dizhushengli' || state.name == 'dizhushibai') {
            this.GameEnd_Ani.active = false;
        }
    },

    ShowAllCard: function ShowAllCard() {
        this.allCards.active = true;
        var cardNum = this.DDZDefine.MidHandCardEx;
        var playerNum = this.DDZRoom.GetRoomConfigByProperty("playerNum");
        var allCardNum = playerNum * cardNum;
        var xPos = -520;
        var yPos = 0;
        for (var i = 0; i < allCardNum; i++) {
            var card = this.allCards.children[i];
            card.getChildByName("poker_back").active = true;
            card.active = true;
            card.y = 0;
            card.x = xPos;
            xPos += 20;
        }
    },

    AddCardPrefab: function AddCardPrefab() {
        //发牌的牌墩
        this.allCards.active = false;
        for (var _i = 0; _i < this.DDZDefine.MaxTableCard; _i++) {
            var card = cc.instantiate(this.cardPrefab);
            this.allCards.addChild(card);
            card.active = false;
            card.name = "card_" + (_i + 1).toString();
        }

        //玩家手牌
        this.handCards.active = false;
        for (var _i2 = 0; _i2 < this.DDZDefine.MaxHandCard; _i2++) {
            var _card = cc.instantiate(this.cardPrefab);
            _card.active = false;
            _card.name = "card_" + (_i2 + 1).toString();
            this.handCards.addChild(_card);
        }

        //玩家打出去的牌
        for (var _i3 = 0; _i3 < this.DDZDefine.MaxPlayer; _i3++) {
            var outCardList = this.node.getChildByName("outCardList" + _i3);
            outCardList.active = false;
            for (var j = 0; j < this.DDZDefine.MaxHandCard; j++) {
                var _card2 = cc.instantiate(this.cardPrefab);
                _card2.active = false;
                _card2.name = "card_" + (_i3 + 1).toString();
                outCardList.addChild(_card2);
            }
        }

        //玩家明牌的牌
        for (var _i4 = 1; _i4 < this.DDZDefine.MaxPlayer; _i4++) {
            var openCardList = this.node.getChildByName("openCardList" + _i4);
            openCardList.active = false;
            for (var _j = 0; _j < this.DDZDefine.MaxHandCard; _j++) {
                var _card3 = cc.instantiate(this.cardPrefab);
                _card3.active = false;
                _card3.name = "card_" + (_i4 + 1).toString();
                openCardList.addChild(_card3);
            }
        }

        //地主牌
        for (var i = 0; i < 3; i++) {
            var _card4 = cc.instantiate(this.cardPrefab);
            _card4.active = false;
            _card4.scale = 0.39;
            _card4.name = "dzcard_" + (i + 1).toString();
            this.img_dzp.addChild(_card4);
        }
    },

    Event_ShowHandCard: function Event_ShowHandCard() {
        var downList = this.LogicDDZGame.GetHandCard();
        console.log("Event_ShowHandCard downList === " + downList);
        for (var i = 0; i < this.handCards.children.length; i++) {
            var cardValue = downList[i];
            var cardNode = this.handCards.children[i];
            cardNode.y = 0;
            if (cardValue) {
                var bSelected = this.LogicDDZGame.CheckSelected(cardValue);
                if (bSelected) {
                    cardNode.y += this.DDZDefine.MaxRisePosY;
                }
                var isLastCard = false;
                if (i == downList.length - 1) {
                    isLastCard = true;
                }
                var isShowLandowner = false;
                if (this.landowner == this.DDZRoomPosMgr.GetClientPos() && isLastCard) {
                    isShowLandowner = true;
                }
                this.ShowCard(cardValue, cardNode, isLastCard, isShowLandowner);
            } else {
                cardNode.active = false;
            }
        }
    },

    ChangeCardNum: function ChangeCardNum(dataPos, len) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (uiPos == 0) return;
        var card = this.GetWndNode("sp_seat0" + uiPos + "/card");
        card.active = true;
        var cardNum = this.GetWndNode("sp_seat0" + uiPos + "/cardNum");
        cardNum.active = true;
        cardNum.getComponent(cc.Label).string = len.toString();
        if (!card.getChildByName("poker_back").active) {
            card.getChildByName("poker_back").active = true;
        }
        this.ShowWarningByPos(dataPos, len);
        return len;
    },

    ShowWarningByPos: function ShowWarningByPos(dataPos, len) {
        if (this.DDZRoomPosMgr.GetClientPos() == dataPos) return;
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        var warning = this.GetWndNode("sp_seat0" + uiPos + "/warning");
        //只有剩一张牌才显示警告动画
        if (len <= 2 && len > 0) {
            warning.active = true;
            warning.getComponent(cc.Animation).play("warning");
            var sex = this.GetPlayerSex(dataPos);
            var pathStr = this.DDZDefine.SoundPath + "game_" + sex + "/";
            if (len == 1) {
                this.SoundManager.PlaySound(sex + "baojing1", pathStr + "baojing1");
            } else {
                this.SoundManager.PlaySound(sex + "baojing2", pathStr + "baojing2");
            }
        } else {
            warning.active = false;
            warning.getComponent(cc.Animation).stop("warning");
        }
    },

    SetSeat01OutCardPos: function SetSeat01OutCardPos(dataPos, len) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (uiPos != 1) return;

        var node = this.node.getChildByName("outCardList1");
        var posX = 410 - 20 * len;
        node.x = posX;
    },

    SetAniPos: function SetAniPos(dataPos) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (uiPos == 1) {
            this.boom_Ani.setPosition(cc.v2(232, 64));
        } else {
            var outCardList = this.node.getChildByName("outCardList" + uiPos);
            this.boom_Ani.setPosition(cc.v2(outCardList.x, outCardList.y));
        }
    },

    PlayCardSound: function PlayCardSound(pos, opCardType, cardList, circleEnd) {
        var sex = this.GetPlayerSex(pos);
        var pathStr = this.DDZDefine.SoundPath + "game_" + sex + "/";
        if (this.lastCircleEnd) {
            if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_SINGLECARD) {
                var value = this.LogicDDZGame.GetCardValue(cardList[0]);
                this.SoundManager.PlaySound(sex + "One_" + value, pathStr + "One_" + value + "");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_DUIZI) {
                var _value = this.LogicDDZGame.GetCardValue(cardList[0]);
                this.SoundManager.PlaySound(sex + "Double_" + _value, pathStr + "Double_" + _value + "");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_SHUNZI) {
                this.SoundManager.PlaySound(sex + "Series", pathStr + "Series");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_3BUDAI) {
                var _value2 = this.LogicDDZGame.GetCardValue(cardList[0]);
                this.SoundManager.PlaySound(sex + "Three_" + _value2, pathStr + "Three_" + _value2 + "");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_3DAI1) {
                this.SoundManager.PlaySound(sex + "ThreeAndOne", pathStr + "ThreeAndOne");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_3DAI2) {
                this.SoundManager.PlaySound(sex + "ThreeAndTwo", pathStr + "ThreeAndTwo");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI1) {
                this.SoundManager.PlaySound(sex + "FourAndTwo", pathStr + "FourAndOne");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI21) {
                this.SoundManager.PlaySound(sex + "FourAndFour", pathStr + "FourAndOneDui");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI2) {
                this.SoundManager.PlaySound(sex + "FourAndTwo", pathStr + "FourAndTwo");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI4) {
                this.SoundManager.PlaySound(sex + "FourAndFour", pathStr + "FourAndFour");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI0 || opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI1 || opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI2) {
                this.SoundManager.PlaySound(sex + "Plane", pathStr + "Plane");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_LIANDUI) {
                this.SoundManager.PlaySound(sex + "SeriesTwo", pathStr + "SeriesTwo");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_ZHADAN) {
                var _value3 = this.LogicDDZGame.GetCardValue(cardList[0]);
                if (_value3 == 16 || _value3 == 17) {
                    this.SoundManager.PlaySound(sex + "wangzha", pathStr + "wangzha");
                } else {
                    this.SoundManager.PlaySound(sex + "Boom", pathStr + "Boom");
                }
            }
        } else {
            if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_BUCHU) {
                var randomNum = Math.floor(Math.random() * 4 + 1);
                this.SoundManager.PlaySound(sex + "Not_" + randomNum, pathStr + "Not_" + randomNum + "");
            } else if (opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_ZHADAN) {
                var _value4 = this.LogicDDZGame.GetCardValue(cardList[0]);
                if (_value4 == 16 || _value4 == 17) {
                    this.SoundManager.PlaySound(sex + "wangzha", pathStr + "wangzha");
                } else {
                    this.SoundManager.PlaySound(sex + "Boom", pathStr + "Boom");
                }
            } else {
                var _randomNum = Math.floor(Math.random() * 3 + 1);
                this.SoundManager.PlaySound(sex + "Bigger_" + _randomNum, pathStr + "Bigger_" + _randomNum + "");
            }
        }

        this.lastCircleEnd = circleEnd;
    },

    Event_OpCard: function Event_OpCard(event) {
        console.log("OpCard信息 == " + event.opCardType);
        var data = event;
        this.firstTurn = false;
        this.notUp = false;
        this.gameBtn.active = false;
        this.tipCount = 0;
        var time = this.DDZDefine.MaxTickTime[this.xianShi];
        //更新公共倍数
        var roomDouble = data.roomDouble;
        this.DDZRoomSet.SetRoomSetProperty("roomDouble", roomDouble);
        this.DDZRoomSet.SetRoomSetProperty("opType", data.opCardType);
        this.DDZRoomSet.SetRoomSetProperty("cardList", data.cardList);
        this.UpdateScoreAndDouble();

        this.LogicDDZGame.SortCardByMax(data.cardList);

        if (data.turnEnd) {
            this.LogicDDZGame.ClearCardData();
        }
        //不显示手牌
        if (data.opPosCardLength >= 0) {
            this.ChangeCardNum(data.pos, data.opPosCardLength);
        }
        this.HideClockByPos(data.pos);
        this.LogicDDZGame.SetCardData(data.opCardType, data.cardList);
        this.ShowOutCard(data.pos, data.cardList);
        this.SetSeat01OutCardPos(data.pos, data.cardList.length);
        this.DeleteOpenCardList(data.pos, data.cardList);

        //音效
        this.PlayCardSound(data.pos, data.opCardType, data.cardList, data.turnEnd);

        //显示动画特效
        if (data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_SHUNZI) {
            //一条龙
            if (this.LogicDDZGame.CheckDragon()) {
                this.dragon_Ani.active = true;
                this.dragon_Ani.getComponent(cc.Animation).stop("shunzi");
                this.dragon_Ani.getComponent(cc.Animation).play("dragon");
            } else {
                this.dragon_Ani.active = true;
                this.dragon_Ani.getComponent(cc.Animation).stop("dragon");
                this.dragon_Ani.getComponent(cc.Animation).play("shunzi");
            }
        } else if (data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_ZHADAN) {
            //炸弹
            this.boom_Ani.active = true;
            // this.SetAniPos(data.pos);
            var cardValue = this.LogicDDZGame.GetCardValue(data.cardList[0]);
            if (cardValue == 16 || cardValue == 17) {
                this.boom_Ani.getComponent(cc.Animation).stop("zhadan");
                this.boom_Ani.getComponent(cc.Animation).play("wangzha");
            } else {
                this.boom_Ani.getComponent(cc.Animation).stop("wangzha");
                this.boom_Ani.getComponent(cc.Animation).play("zhadan");
            }
        } else if (data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI0 || data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI1 || data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI2) {
            this.plane_Ani.active = true;
            this.plane_Ani.getComponent(cc.Animation).play("feiji");
        } else if (data.opCardType == this.LogicDDZGame.DDZ_CARD_TYPE_LIANDUI) {
            this.liandui_Ani.active = true;
            this.liandui_Ani.getComponent(cc.Animation).play("liandui");
        }

        if (data.pos == this.DDZRoomPosMgr.GetClientPos()) {
            this.LogicDDZGame.OutPokerCard(data.cardList);
            this.ClearForbiddenTouch();
        }
        //检测是否是当前游戏已经结束
        if (data.isSetEnd) {
            return;
        }
        this.lb_mypdgsj.active = false;
        if (data.nextPos == this.DDZRoomPosMgr.GetClientPos()) {
            //判断剩余手牌是否能一次出完并且没有炸弹，如果可以，直接出
            if (!this.LogicDDZGame.IsHaveBoom()) {
                var opCardType = this.LogicDDZGame.GetCardType(false);
                console.log("所有手牌组成一个牌型：" + opCardType);
                if (opCardType > 0) {
                    var isOut = false;
                    if (data.turnEnd) {
                        isOut = true;
                    } else {
                        var tipArray = this.LogicDDZGame.GetTipCard();
                        if (tipArray.length > 0) {
                            var myHangCard = this.LogicDDZGame.GetHandCard();
                            for (var i = 0; i < tipArray.length; i++) {
                                //发给服务端的消息
                                if (tipArray[i].length == myHangCard.length) {
                                    isOut = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (isOut == true) {
                        var serverPack = {};
                        var roomID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("roomID");
                        serverPack.roomID = roomID;
                        var pos = this.DDZRoomPosMgr.GetClientPos();
                        serverPack.pos = pos;
                        var self = this;
                        this.scheduleOnce(function () {
                            self.ClientOpCardByType(opCardType, serverPack, false);
                        }, 1.0);
                        return;
                    }
                }
            }
            if (data.turnEnd) {
                this.ShowBtnOutCard();
            } else {
                var array = this.LogicDDZGame.GetTipCard();
                this.ForbiddenTouch(array);
                if (!array.length) {
                    if (this.isAutoPass()) {
                        time = this.DDZDefine.MinTickTime;
                    } else {
                        this.ShowAllGameBtn();
                        time = this.DDZDefine.MinTickTime;
                        this.lb_mypdgsj.active = true;
                    }
                } else {
                    if (array.length == 0 || array.length == 1 && array[0].length == 0) {
                        this.lb_mypdgsj.active = true;
                    }
                    this.ShowAllGameBtn();
                }
            }
        }

        this.StartTickTime(data.nextPos, time);
    },

    isCanChoose: function isCanChoose() {
        for (var i = 0; i < this.handCards.children.length; i++) {
            if (this.handCards.children[i].y > 0) {
                return false;
            }
        }
        return true;
    },
    ForbiddenTouch: function ForbiddenTouch(pokerList) {
        this.ClearForbiddenTouch();
        // return;//暂时不需要置灰

        var downList = this.LogicDDZGame.GetHandCard();
        if (pokerList.length) {
            var cardType = this.LogicDDZGame.GetLastCardType();
            if (cardType == this.LogicDDZGame.DDZ_CARD_TYPE_3BUDAI || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_3DAI1 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_3DAI2 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI2 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI4 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI0 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI1 || cardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI2) {
                if (!this.LogicDDZGame.CheckOnlyBoom(pokerList)) {
                    return;
                }
            }
            var lastValue = 0;
            for (var i = downList.length - 1; i >= 0; i--) {
                var poker = downList[i];
                var cardValue = this.LogicDDZGame.GetCardValue(poker);
                this.handCards.children[i].y = 0;

                if (lastValue == cardValue) {
                    if (this.handCards.children[i + 1].touchTag) {
                        this.handCards.children[i].touchTag = true;
                        this.handCards.children[i].getChildByName('bg_black').active = true;
                    } else {
                        this.handCards.children[i].touchTag = false;
                        this.handCards.children[i].getChildByName('bg_black').active = false;
                    }
                    continue;
                }

                var isHas = false;
                for (var j = 0; j < pokerList.length; j++) {
                    var list = pokerList[j];
                    if (list.indexOf(poker) != -1) {
                        isHas = true;
                        break;
                    }
                }

                if (isHas) {
                    this.handCards.children[i].touchTag = false;
                    this.handCards.children[i].getChildByName('bg_black').active = false;
                } else {
                    this.handCards.children[i].touchTag = true;
                    this.handCards.children[i].getChildByName('bg_black').active = true;
                    //                   this.handCards.children[i].addComponent(cc.Button);
                }
                lastValue = cardValue;
            }
        } else {
            for (var _i5 = 0; _i5 < downList.length; _i5++) {
                this.handCards.children[_i5].y = 0;
                this.handCards.children[_i5].touchTag = true;
                this.handCards.children[_i5].getChildByName('bg_black').active = true;
                // this.handCards.children[i].addComponent(cc.Button);
            }
        }
    },

    ClearForbiddenTouch: function ClearForbiddenTouch() {
        this.LogicDDZGame.ChangeSelectCard([]);
        var downList = this.LogicDDZGame.GetHandCard();
        for (var i = 0; i < downList.length; i++) {
            this.handCards.children[i].y = 0;
            this.handCards.children[i].touchTag = false;
            this.handCards.children[i].getChildByName('bg_black').active = false;
            //           this.handCards.children[i].removeComponent(cc.Button);
        }
    },

    DeleteOpenCardList: function DeleteOpenCardList(dataPos, cardList) {
        if (dataPos == this.DDZRoomPosMgr.GetClientPos()) return;

        if (this.openCardInfo[dataPos]) {
            var openCardList = this.openCardInfo[dataPos];
            for (var i = 0; i < cardList.length; i++) {
                var value = cardList[i];
                var pos = openCardList.indexOf(value);
                if (pos != -1) {
                    openCardList.splice(pos, 1);
                }
            }

            this.ShowOpenCard(dataPos, openCardList);
        }
    },

    Event_ChangeStatus: function Event_ChangeStatus(event) {
        var opPos = this.DDZRoomSet.GetRoomSetProperty("opPos");
        this.HideAllPass();
        this.HideAllClock();
        //不是明牌阶段隐藏按钮
        this.btn_go.active = false;
        this.btn_openCardStart.active = false;
        if (event.state == this.ShareDefine.DDZSetState_OpenCard) {
            console.log("明牌阶段...");
            this.btn_ok.active = false;
            this.tip_ok.active = false;
            this.btn_go.active = true;
            this.btn_openCardStart.active = true;
            this.StartTickTime(opPos, 5);
        } else if (event.state == this.ShareDefine.DDZSetState_FaPai) {
            console.log("发牌阶段...");
            //更新地主牌
            this.ShowDiZhuPai(event.holeCards);
            this.btn_go.active = false;
            this.btn_openCardStart.active = false;
            this.gameMultiple.active = false;
            this.lb_ddbrjb.active = false;
        } else if (event.state == this.ShareDefine.DDZSetState_Hog) {
            console.log("叫地主阶段...");
            //更新地主牌
            this.ShowDiZhuPai(event.holeCards);
            this.gameMultiple.active = false;
            this.lb_ddbrjb.active = false;
            this.ShowBtnHog(opPos);
        } else if (event.state == this.ShareDefine.DDZSetState_AddDouble) {
            console.log("加倍阶段...");
            //更新地主牌
            this.ShowDiZhuPai(event.holeCards);
            this.ShowBtnMultiple();
            //莫名其妙会出现牌遮挡不能出，强制清理下
            this.ClearForbiddenTouch();
        } else if (event.state == this.ShareDefine.DDZSetState_Playing) {
            console.log("打牌阶段...");
            //更新地主牌
            this.ShowDiZhuPai(event.holeCards);
            this.gameMultiple.active = false;
            this.lb_ddbrjb.active = false;
            this.StartGame(opPos);
        } else if (event.state == this.ShareDefine.DDZSetState_End) {
            console.log("打牌结束阶段...");
            this.lb_ddbrjb.active = false;
        }
    },

    Event_AddDouble: function Event_AddDouble(event) {
        var data = event;
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(data.pos);
        var sex = this.GetPlayerSex(data.pos);
        var pathStr = this.DDZDefine.SoundPath + "game_" + sex + "/";
        if (data.addDouble == 1) {
            this.ShowAddDouble(data.pos, data.addDouble);
            this.ShowImgTipByPos(uiPos, "lb_jb");
            this.SoundManager.PlaySound(sex + "jiabei", pathStr + "jiabei");
        } else {
            this.ShowImgTipByPos(uiPos, "lb_bjb");
            this.SoundManager.PlaySound(sex + "bujiabei", pathStr + "bujiabei");
        }

        if (data.pos == this.DDZRoomPosMgr.GetClientPos()) {
            this.lb_ddbrjb.active = true;
            this.gameMultiple.active = false;
            this.HideClockByPos(data.pos);
        }
    },

    Event_OpenCard: function Event_OpenCard(event) {
        var data = event;
        if (data.OpenCard == 0) return;
        var sex = this.GetPlayerSex(data.pos);
        var pathStr = this.DDZDefine.SoundPath + "game_" + sex + "/";
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(data.pos);
        var state = this.DDZRoomSet.GetRoomSetProperty("state");
        if (state == this.ShareDefine.DDZSetState_End) {
            this.ShowOpenCard(data.pos, data.cardList);
        } else {
            var OpenCard_Ani = this.GetWndNode("sp_seat0" + uiPos + "/OpenCard_Ani");
            OpenCard_Ani.active = true;
            OpenCard_Ani.getComponent(cc.Animation).play("mingpai");
            this.SoundManager.PlaySound(sex + "ShowCard", pathStr + "ShowCard");
            //更新公共倍数
            var roomDouble = data.roomDouble;
            this.DDZRoomSet.SetRoomSetProperty("roomDouble", roomDouble);
            this.UpdateScoreAndDouble();
        }
        this.openCardInfo[data.pos] = data.cardList;
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        var posInfo = setInfo.posInfo;
        for (var i = 0; i < posInfo.length; i++) {
            if (posInfo[i].posID == data.pos) {
                posInfo[i].openCard = 1;
                posInfo[i].cards = data.cardList;
                break;
            }
        }
        this.DDZRoomSet.SetRoomSetProperty("posInfo", posInfo);
        if (data.pos == this.DDZRoomPosMgr.GetClientPos()) {
            this.btn_openCard.active = false;
        }
    },

    Event_Hog: function Event_Hog(event) {
        var data = event;
        var hogScore = data.hogScore;
        var roomDouble = data.roomDouble;
        var isHaveHog = data.isHaveHog; //是否有人叫了地主
        var hogTime = data.hogTime; //当前位置操作了几次
        this.DDZRoomSet.SetRoomSetProperty("hogScore", hogScore);
        this.DDZRoomSet.SetRoomSetProperty("roomDouble", roomDouble);
        this.UpdateScoreAndDouble();
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(data.curPos);
        var sex = this.GetPlayerSex(data.curPos);
        var pathStr = this.DDZDefine.SoundPath + "game_" + sex + "/";
        var quedingdizhu = this.DDZRoom.GetRoomConfigByProperty("quedingdizhu");
        //刷新每个人叫地主次数
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        var posInfo = setInfo.posInfo;
        for (var _i6 = 0; _i6 < posInfo.length; _i6++) {
            if (posInfo[_i6].posID == data.curPos) {
                posInfo[_i6].hog = data.hog;
                break;
            }
        }
        this.DDZRoomSet.SetRoomSetProperty("posInfo", posInfo);
        if (data.hog == 0) {
            //不叫
            if (quedingdizhu == this.DDZDefine.HogCommon) {
                if (isHaveHog) {
                    this.SoundManager.PlaySound(sex + "buqiang", pathStr + "buqiang");
                    this.ShowImgTipByPos(uiPos, "lb_bq");
                } else {
                    this.SoundManager.PlaySound(sex + "bujiao_1", pathStr + "bujiao_1");
                    this.ShowImgTipByPos(uiPos, "lb_bj");
                }
            } else {
                this.SoundManager.PlaySound(sex + "bujiao_2", pathStr + "bujiao_2");
                this.ShowImgTipByPos(uiPos, "lb_bj");
            }
        } else {
            //叫了地主
            if (quedingdizhu == this.DDZDefine.HogCommon) {
                if (hogTime == 1) {
                    this.SoundManager.PlaySound(sex + "jiaodizhu", pathStr + "jiaodizhu");
                    this.ShowImgTipByPos(uiPos, "lb_jdz");
                } else if (hogTime == 2) {
                    this.SoundManager.PlaySound(sex + "qiangdizhu", pathStr + "qiangdizhu");
                    this.ShowImgTipByPos(uiPos, "lb_qdz");
                } else if (hogTime == 3) {
                    this.SoundManager.PlaySound(sex + "qiangdizhu_2", pathStr + "qiangdizhu_2");
                    this.ShowImgTipByPos(uiPos, "lb_qdz");
                } else {
                    this.SoundManager.PlaySound(sex + "woqiang", pathStr + "woqiang");
                    this.ShowImgTipByPos(uiPos, "lb_qdz");
                }
            } else if (quedingdizhu == this.DDZDefine.HogScore) {
                if (data.hog == 1) {
                    this.ShowImgTipByPos(uiPos, "lb_yf");
                    this.SoundManager.PlaySound(sex + "oneScore", pathStr + "oneScore");
                } else if (data.hog == 2) {
                    this.ShowImgTipByPos(uiPos, "lb_ef");
                    this.SoundManager.PlaySound(sex + "twoScore", pathStr + "twoScore");
                } else if (data.hog == 3) {
                    this.ShowImgTipByPos(uiPos, "lb_sf");
                    this.SoundManager.PlaySound(sex + "threeScore", pathStr + "threeScore");
                }
            }
        }
        this.HideClockByPos(data.curPos);
        if (data.landowner == -1) {
            this.ShowBtnHog(data.nextPos, isHaveHog);
        } else {
            console.log("地主pos位置：" + data.landowner);
            //已经确认地主了
            this.landowner = data.landowner;
            var _uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(data.landowner);
            var path = "sp_seat0" + _uiPos + "/head" + "/UIDDZHead" + _uiPos;
            var headNode = this.GetWndNode(path);
            var headScript = headNode.getComponent("UIDDZHead");
            headScript.Showlandowner(true);
            //更新地主牌
            this.ShowDiZhuPai(data.holeCards);
            //把地主牌发给地主
            setInfo = this.DDZRoomSet.GetRoomSetInfo();
            posInfo = setInfo.posInfo;
            for (var _i7 = 0; _i7 < posInfo.length; _i7++) {
                if (posInfo[_i7].posID == data.landowner) {
                    for (var j = 0; j < data.holeCards.length; j++) {
                        console.log("添加地主牌");
                        posInfo[_i7].cards.push(data.holeCards[j]);
                    }
                    break;
                }
            }
            this.DDZRoomSet.SetRoomSetProperty("posInfo", posInfo);
            this.LogicDDZGame.InitHandCard();
            for (var i = 0; i < 3; i++) {
                if (this.DDZRoomPosMgr.GetClientPos() == data.landowner) {
                    this.Event_ShowHandCard();
                    this.allPlayerCardIdx[0] += 1;
                } else if (this.DDZRoomPosMgr.GetClientPos() != data.landowner && posInfo[data.landowner].openCard == 1) {
                    var allOpenCardList = posInfo[data.landowner].cards;
                    this.ShowOpenCard(data.landowner, allOpenCardList);
                    this.AddCardAction(data.landowner);
                } else {
                    this.AddCardAction(data.landowner);
                }
            }
        }
    },

    Event_OpenStartGame: function Event_OpenStartGame(event) {
        var pos = event.pos;
        var openStartGame = event.openStartGame;
        this.DDZRoomPosMgr.SetPlayerInfoByPos(pos, "openStartGame", openStartGame);
        this.RefreshRoomShow();
    },

    Event_CardNumber: function Event_CardNumber(event) {
        var cardNumMap = event.cardNumMap;
        this.UpdateCardNum(cardNumMap);
    },

    UpdateCardNum: function UpdateCardNum(cardNumMap) {
        for (var i = 0; i < this.img_jpq.children.length; i++) {
            var key = this.img_jpq.children[i].name;
            var num = cardNumMap[key];
            this.img_jpq.children[i].getComponent(cc.Label).string = num;
        }
    },

    ShowImgTipByPos: function ShowImgTipByPos(uiPos) {
        var imgTipName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

        var img_tip = this.GetWndNode("sp_seat0" + uiPos + "/img_tip");
        if (imgTipName == "") {
            img_tip.active = false;
        } else {
            img_tip.active = true;
            this.SetNodeImageByFilePath(img_tip, this.basePath + imgTipName);
        }
    },

    ShowOpenCard: function ShowOpenCard(dataPos, cardList) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (uiPos == 0) return;
        this.LogicDDZGame.SortCardByMax(cardList);
        var openCardList = this.node.getChildByName("openCardList" + uiPos);
        openCardList.active = true;
        for (var i = 0; i < openCardList.children.length; i++) {
            var cardNode = openCardList.children[i];
            var value = cardList[i];
            var isLastCard = false;
            if (i == cardList.length - 1) {
                isLastCard = true;
            }
            var isShowLandowner = false;
            if (this.landowner == dataPos && isLastCard) {
                isShowLandowner = true;
            }
            if (value) {
                this.ShowCard(value, cardNode, isLastCard, isShowLandowner);
            } else {
                cardNode.active = false;
            }
        }
    },

    HideAllOpenCard: function HideAllOpenCard() {
        for (var i = 1; i < this.DDZDefine.MaxPlayer; i++) {
            var openCardList = this.node.getChildByName("openCardList" + i);
            openCardList.active = false;
        }
    },

    ShowAddDouble: function ShowAddDouble(dataPos, addDouble) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        var path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
        var headNode = this.GetWndNode(path);
        var headScript = headNode.getComponent("UIDDZHead");
        var isAddDouble = false;
        if (addDouble == 1) {
            isAddDouble = true;
        }
        headScript.ShowAddDouble(isAddDouble);
    },

    ShowOutCard: function ShowOutCard(dataPos, cardList) {
        if (dataPos < 0) return;
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (!cardList.length) {
            this.ShowImgTipByPos(uiPos, "lb_bc");
            return;
        }
        var outCardNodeList = this.node.getChildByName("outCardList" + uiPos);
        outCardNodeList.active = true;
        for (var i = 0; i < outCardNodeList.children.length; i++) {
            var cardNode = outCardNodeList.children[i];
            var value = cardList[i];
            var isLastCard = false;
            if (i == cardList.length - 1) {
                isLastCard = true;
            }
            var isShowLandowner = false;
            if (this.landowner == dataPos && isLastCard) {
                isShowLandowner = true;
            }
            if (value) {
                this.ShowCard(value, cardNode, isLastCard, isShowLandowner);
            } else {
                cardNode.active = false;
            }
        }
    },

    HideAllOutCard: function HideAllOutCard() {
        for (var i = 0; i < this.DDZDefine.MaxPlayer; i++) {
            var outCard = this.node.getChildByName("outCardList" + i);
            outCard.active = false;
        }
    },

    HideAllPass: function HideAllPass() {
        for (var i = 0; i < this.DDZDefine.MaxPlayer; i++) {
            var pass = this.GetWndNode("sp_seat0" + i + "/img_tip");
            pass.active = false;
        }
    },

    HideAllClock: function HideAllClock() {
        for (var i = 0; i < this.DDZDefine.MaxPlayer; i++) {
            var clock = this.GetWndNode("sp_seat0" + i + "/clock");
            clock.active = false;
        }
    },

    HideAllWarning: function HideAllWarning() {
        for (var i = 1; i < this.DDZDefine.MaxPlayer; i++) {
            var warning = this.GetWndNode("sp_seat0" + i + "/warning");
            warning.getComponent(cc.Animation).stop("warning");
            warning.active = false;
        }
    },

    HideAllHandCard: function HideAllHandCard() {
        this.handCards.active = false;
        for (var i = 0; i < this.handCards.children.length; i++) {
            var child = this.handCards.children[i];
            child.active = false;
        }
    },

    HideAllCardNum: function HideAllCardNum() {
        for (var i = 1; i < this.DDZDefine.MaxPlayer; i++) {
            var card = this.GetWndNode("sp_seat0" + i + "/card");
            card.active = false;
            var cardNum = this.GetWndNode("sp_seat0" + i + "/cardNum");
            cardNum.active = false;
            var poker_back = this.GetWndNode("sp_seat0" + i + "/card/poker_back");
            poker_back.active = false;
        }
    },

    HideClockByPos: function HideClockByPos(dataPos) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        var clock = this.GetWndNode("sp_seat0" + uiPos + "/clock");
        clock.active = false;
    },

    ClearPlayerTable: function ClearPlayerTable(dataPos) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        var outCardList = this.GetWndNode("outCardList" + uiPos);
        for (var i = 0; i < outCardList.children.length; i++) {
            var child = outCardList.children[i];
            if (child.active) {
                child.active = false;
            }
        }

        this.ShowImgTipByPos(uiPos, "");
    },

    //开始倒计时
    StartTickTime: function StartTickTime(dataPos) {
        var second = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.DDZDefine.MaxTickTime[this.xianShi];

        //先清理之前打出去的牌或者玩家的状态
        this.ClearPlayerTable(dataPos);
        this.tick = second;
        if (this.tick <= 0) return;
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        this.clock = this.GetWndNode("sp_seat0" + uiPos + "/clock");
        this.clock.active = true;
        this.clock.getChildByName("num").getComponent(cc.Label).string = this.tick;
        this.schedule(this.CallEverySecond, 1);
    },

    //每一秒进入
    CallEverySecond: function CallEverySecond() {
        //this.SoundManager.PlaySound("timeUp");
        this.tick--;
        this.clock.getChildByName("num").getComponent(cc.Label).string = this.tick;
        if (this.tick <= 0) {
            this.unschedule(this.CallEverySecond);
            this.clock.active = false;
            // if(this.notUp){
            //     this.Click_btn_pass();
            // }
        }
    },

    //显示提示和出牌按钮
    ShowBtnTipAndOutCard: function ShowBtnTipAndOutCard() {
        this.gameBtn.active = true;
        this.btn_tip.x = -120;
        this.btn_tip.active = true;
        // this.btn_pass.getChildByName("icon").getComponent(cc.Label).string = '不要';
        this.btn_outCard.x = 120;
        this.btn_outCard.active = true;
        this.btn_pass.active = false;
    },
    //显示所有按钮
    ShowAllGameBtn: function ShowAllGameBtn() {
        this.gameBtn.active = true;
        this.btn_pass.x = -230;
        this.btn_pass.active = true;
        this.btn_tip.x = 0;
        this.btn_tip.active = true;
        this.btn_outCard.x = 230;
        this.btn_outCard.active = true;
    },

    HideAllGameBtn: function HideAllGameBtn() {
        this.gameBtn.active = false;
        this.btn_pass.active = false;
        this.btn_tip.active = false;
        this.btn_outCard.active = false;

        this.btn_openCard.active = false;
        this.gameRobScore.active = false;
        this.gameRobLandLord.active = false;
        this.gameMultiple.active = false;
    },
    //显示抢地主按钮
    ShowBtnHog: function ShowBtnHog(opPos) {
        var isHaveHog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        this.gameBtn.active = false;
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        var posInfo = setInfo.posInfo;
        var isAlreadyHog = false;
        for (var i = 0; i < posInfo.length; i++) {
            if (posInfo[i].posID == this.DDZRoomPosMgr.GetClientPos() && posInfo[i].hog >= 1) {
                isAlreadyHog = true;
                break;
            }
        }
        if (opPos == this.DDZRoomPosMgr.GetClientPos()) {
            var quedingdizhu = this.DDZRoom.GetRoomConfigByProperty("quedingdizhu");
            if (quedingdizhu == this.DDZDefine.HogCommon) {
                this.gameRobLandLord.active = true;
                if (isHaveHog) {
                    //图片变成不抢 抢地主
                    var imgBtnNoRob = this.gameRobLandLord.getChildByName("btn_noRob").getChildByName("lb_btn_bjb");
                    this.SetNodeImageByFilePath(imgBtnNoRob, this.basePath + "lb_btn_bq");
                    var imgBtnRob = this.gameRobLandLord.getChildByName("btn_rob").getChildByName("lb_btn_jb");
                    this.SetNodeImageByFilePath(imgBtnRob, this.basePath + "lb_btn_qdz");
                } else {
                    //图片变成不叫 叫地主
                    var _imgBtnNoRob = this.gameRobLandLord.getChildByName("btn_noRob").getChildByName("lb_btn_bjb");
                    this.SetNodeImageByFilePath(_imgBtnNoRob, this.basePath + "lb_btn_bj");
                    var _imgBtnRob = this.gameRobLandLord.getChildByName("btn_rob").getChildByName("lb_btn_jb");
                    this.SetNodeImageByFilePath(_imgBtnRob, this.basePath + "lb_btn_jdz");
                }
                if (this.isWangZhaHog() && this.LogicDDZGame.IsHaveWangZhaOrBoom() && !isAlreadyHog) {
                    this.gameRobLandLord.getChildByName("btn_noRob").active = false;
                } else {
                    this.gameRobLandLord.getChildByName("btn_noRob").active = true;
                }
                this.gameRobScore.active = false;
            } else if (quedingdizhu == this.DDZDefine.HogScore) {
                this.gameRobLandLord.active = false;
                this.gameRobScore.active = true;
                //根据当前叫分来显示对应按钮
                var hogScore = this.DDZRoomSet.GetRoomSetProperty("hogScore");
                if (hogScore == 0) {
                    this.gameRobScore.getChildByName("btn_1").active = true;
                    this.gameRobScore.getChildByName("btn_2").active = true;
                    this.gameRobScore.getChildByName("btn_3").active = true;
                } else if (hogScore == 1) {
                    this.gameRobScore.getChildByName("btn_1").active = false;
                    this.gameRobScore.getChildByName("btn_2").active = true;
                    this.gameRobScore.getChildByName("btn_3").active = true;
                } else if (hogScore == 2) {
                    this.gameRobScore.getChildByName("btn_1").active = false;
                    this.gameRobScore.getChildByName("btn_2").active = false;
                    this.gameRobScore.getChildByName("btn_3").active = true;
                } else if (hogScore == 3) {
                    this.gameRobScore.getChildByName("btn_1").active = false;
                    this.gameRobScore.getChildByName("btn_2").active = false;
                    this.gameRobScore.getChildByName("btn_3").active = false;
                }
                if (this.isWangZhaHog() && this.LogicDDZGame.IsHaveWangZhaOrBoom() && !isAlreadyHog) {
                    this.gameRobScore.getChildByName("btn_noRobScore").active = false;
                } else {
                    this.gameRobScore.getChildByName("btn_noRobScore").active = true;
                }
            }
        } else {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
        }
        this.StartTickTime(opPos, 15);
    },
    //显示加倍按钮
    ShowBtnMultiple: function ShowBtnMultiple() {
        this.gameBtn.active = false;
        this.gameRobLandLord.active = false;
        this.gameRobScore.active = false;
        this.gameMultiple.active = true;
        this.StartTickTime(this.DDZRoomPosMgr.GetClientPos(), 5);
        // let playerAll = this.DDZRoomPosMgr.GetRoomAllPlayerInfo();
        // let playerAllList= Object.keys(playerAll);
        // for(var i = 0; i < playerAllList.length; i++){
        //     let player = playerAll[playerAllList[i]];
        //     this.StartTickTime(player.pos, 15);
    },

    HideAllBsNode: function HideAllBsNode() {
        // let room = this.DDZRoomMgr.GetEnterRoom();
        // let posList = room.GetRoomProperty("posList");
        // for(let idx = 0; idx < posList.length; idx++){
        //     let uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(posList[idx].pos);
        //     let path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
        //     let headNode = this.GetWndNode(path);
        //     headNode.getChildByName("otherNode").active = false;
        // }
    },

    //只显示出牌按钮
    ShowBtnOutCard: function ShowBtnOutCard() {
        this.gameBtn.active = true;
        this.btn_pass.active = false;
        this.btn_tip.active = false;
        this.btn_outCard.x = 0;
        this.btn_outCard.active = true;
    },
    //只显示不要按钮
    ShowBtnPass: function ShowBtnPass() {
        this.gameBtn.active = true;
        this.btn_pass.x = 0;
        this.btn_pass.active = true;
        // this.btn_pass.getChildByName("icon").getComponent(cc.Label).string = '要不起';
        this.btn_tip.active = false;
        this.btn_outCard.active = false;
    },

    StartGame: function StartGame(opPos) {
        this.lastCircleEnd = this.DDZRoomSet.GetRoomSetProperty("isFirstOp");
        this.gameBtn.active = false;
        this.gameRobLandLord.active = false;
        this.gameRobScore.active = false;
        this.gameMultiple.active = false;
        if (opPos == this.DDZRoomPosMgr.GetClientPos()) {
            this.ClearForbiddenTouch();
            this.ShowBtnOutCard();
        }
        this.StartTickTime(opPos);
    },

    //发牌动作
    FaPaiAction: function FaPaiAction(dataPos) {
        var card = this.allCards.children[this.allCardIdx];
        var clientCards = this.DDZRoomSet.GetHandCard();
        this.SortCardByMax(clientCards);
        if (!card || !card.active) {
            this.btn_openCard.active = false;
            this.FaPaiFinish();
            return;
        }
        var posList = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("posList");

        if (dataPos >= posList.length) {
            dataPos = 0;
        }

        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);

        this.allCardIdx++;
        if (this.allCardIdx <= 18) {
            this.btn_openCard.getChildByName("lb_multiple").getComponent(cc.Label).string = "x4";
            this.openCardMutiple = 4;
        } else if (this.allCardIdx > 18 && this.allCardIdx <= 36) {
            this.btn_openCard.getChildByName("lb_multiple").getComponent(cc.Label).string = "x3";
            this.openCardMutiple = 3;
        } else {
            this.btn_openCard.getChildByName("lb_multiple").getComponent(cc.Label).string = "x2";
            this.openCardMutiple = 2;
        }

        var position = null;
        if (dataPos == this.DDZRoomPosMgr.GetClientPos()) {
            position = this.handCards.getPosition();
        } else {
            var node = this.GetWndNode("sp_seat0" + uiPos);
            position = node.getPosition();
        }
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        var posInfo = setInfo.posInfo;
        var self = this;
        var action = cc.sequence(cc.moveTo(0.025, position), cc.callFunc(function (card) {
            if (self.DDZRoomPosMgr.GetClientPos() == dataPos) {
                self.handCards.active = true;
                var cardNode = self.handCards.children[self.allPlayerCardIdx[0]];
                cardNode.y = 0;
                var cardValue = clientCards[self.allPlayerCardIdx[0]];
                var isLastCard = false;
                if (self.allPlayerCardIdx[0] == clientCards.length - 1) {
                    isLastCard = true;
                }
                self.ShowCard(cardValue, cardNode, isLastCard);
                self.allPlayerCardIdx[0] += 1;
            } else if (self.DDZRoomPosMgr.GetClientPos() != dataPos && posInfo[dataPos].openCard == 1) {
                var openCardList = [];
                self.AddCardAction(dataPos);
                var allOpenCardList = posInfo[dataPos].cards;
                self.openCardInfo[dataPos] = posInfo[dataPos].cards;
                var _uiPos2 = self.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
                for (var i = 0; i < self.allPlayerCardIdx[_uiPos2]; i++) {
                    openCardList.push(allOpenCardList[i]);
                }
                console.log("位置 " + dataPos + " 明牌:" + openCardList);
                self.ShowOpenCard(dataPos, openCardList);
            } else {
                self.AddCardAction(dataPos);
            }
            dataPos++;
            card.active = false;
            self.FaPaiAction(dataPos);
            self.SoundManager.PlaySound("giveCard", self.DDZDefine.SoundPath + "giveCard");
        }));
        card.runAction(action);
    },
    CheckShouPai: function CheckShouPai() {},
    FaPaiFinish: function FaPaiFinish() {
        console.log("FaPaiFinish....");
        this.DDZRoomMgr.SendFaPaiFinish(this.DDZRoomPosMgr.GetClientPos());
        //检查手牌长度
        this.CheckShouPai();
    },
    SortCardByMax: function SortCardByMax(pokers) {
        var self = this;
        pokers.sort(function (a, b) {
            //return (b&0x0F) - (a&0x0F);
            return self.LogicDDZGame.GetCardValue(b) - self.LogicDDZGame.GetCardValue(a);
        });
    },
    //显示地主牌
    ShowDiZhuPai: function ShowDiZhuPai() {
        var allDzCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.img_dzp.active = true;
        for (var i = 0; i < this.img_dzp.children.length; i++) {
            var dzCard = this.img_dzp.children[i];
            if (allDzCard == null || allDzCard.length == 0) {
                dzCard.getChildByName("poker_back").active = true;
                dzCard.active = true;
            } else {
                this.ShowCard(allDzCard[i], dzCard, true, false);
            }
        }
    },

    //显示poker牌
    ShowCard: function ShowCard(cardType, cardNode, isLastCard) {
        var isShowLandowner = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var realValue = 0;
        if (cardType > 500) {
            realValue = cardType - 500;
        } else {
            realValue = cardType;
        }
        // if (!isLastCard) {
        //     cardNode.getChildByName('icon_1').active = false;
        // }else{
        //     cardNode.getChildByName('icon_1').active = true;
        // }
        this.PokerCard.GetPokeCard(realValue, cardNode, isLastCard, isShowLandowner);
        cardNode.active = true;
        cardNode.getChildByName("poker_back").active = false;
    },

    AddCardAction: function AddCardAction(dataPos) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        var wndNode = this.GetWndNode("sp_seat0" + uiPos + "/cardNum");
        this.allPlayerCardIdx[uiPos] += 1;
        wndNode.getComponent(cc.Label).string = this.allPlayerCardIdx[uiPos];
    },

    ///////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////牌触摸
    OnTouchStart: function OnTouchStart(event) {
        this.isChoose = this.isCanChoose();
        this.startIndex = 0;
        this.moveIndex = -1;
        this.lastMoveIndex = -1;
        var moveX = event.target.convertToNodeSpaceAR(event.touch.getLocation()).x;
        var downList = this.LogicDDZGame.GetHandCard();
        for (var i = 0; i < this.handCards.children.length; i++) {
            if (this.handCards.children[i].name.startsWith("card")) {
                var minX = this.handCards.children[i].x - this.handCards.children[i].width / 2;
                var maxX = minX + this.cardSpcedX;
                if (i == downList.length - 1) maxX = minX + this.handCards.children[i].width;
                if (moveX >= minX && moveX < maxX) {
                    this.startIndex = i;
                    this.handCards.children[i].getChildByName("bg_black").active = true;
                    break;
                }
            }
        }
    },

    OnTouchMove: function OnTouchMove(event) {
        var moveX = event.target.convertToNodeSpaceAR(event.touch.getLocation()).x;
        for (var i = 0; i < this.handCards.children.length; i++) {
            if (this.handCards.children[i].name.startsWith("card")) {
                if (this.handCards.children[i].touchTag == false || typeof this.handCards.children[i].touchTag == "undefined") {
                    this.handCards.children[i].getChildByName("bg_black").active = false;
                }
                var minX = this.handCards.children[i].x - this.handCards.children[i].width / 2;
                var maxX = minX + this.cardSpcedX;
                if (moveX >= minX && moveX < maxX) {
                    if (this.moveIndex >= 0 && this.moveIndex != i) {
                        this.lastMoveIndex = this.moveIndex;
                    }
                    this.moveIndex = i;
                    break;
                }
            }
        }
        if (this.lastMoveIndex == -1 || this.moveIndex == -1) {
            return;
        }
        if (this.startIndex > this.moveIndex) {
            //从右往左
            for (var _i8 = this.startIndex; _i8 >= this.moveIndex; _i8--) {
                if (this.handCards.children[_i8].name.startsWith("card")) {
                    if (this.handCards.children[_i8].touchTag) continue;
                    this.handCards.children[_i8].getChildByName("bg_black").active = true;
                }
            }
        } else {
            //从左往右
            if (this.lastMoveIndex > this.moveIndex) {
                if (this.handCards.children[this.lastMoveIndex].name.startsWith("card")) {
                    if (!this.handCards.children[this.lastMoveIndex].touchTag) {
                        this.handCards.children[this.lastMoveIndex].getChildByName("bg_black").active = false;
                    }
                }
            }
            for (var _i9 = this.startIndex; _i9 <= this.moveIndex; _i9++) {
                if (this.handCards.children[_i9].name.startsWith("card")) {
                    if (this.handCards.children[_i9].touchTag) continue;
                    this.handCards.children[_i9].getChildByName("bg_black").active = true;
                }
            }
        }
    },

    OnTouchEnd: function OnTouchEnd(event) {
        this.endIndex = this.startIndex;
        var moveX = event.target.convertToNodeSpaceAR(event.touch.getLocation()).x;
        var downList = this.LogicDDZGame.GetHandCard();
        for (var i = 0; i < this.handCards.children.length; i++) {
            if (this.handCards.children[i].name.startsWith("card")) {
                if (this.handCards.children[i].touchTag) {
                    this.handCards.children[i].getChildByName("bg_black").active = true;
                } else {
                    this.handCards.children[i].getChildByName("bg_black").active = false;
                }
                if (isEnd) continue;
                var isEnd = false;
                var minX = this.handCards.children[i].x - this.handCards.children[i].width / 2;
                var maxX = minX + this.cardSpcedX;
                if (i == downList.length - 1) maxX = minX + this.handCards.children[i].width;
                if (moveX >= minX && moveX < maxX) {
                    this.endIndex = i;
                    isEnd = true;
                }
            }
        }

        if (this.startIndex == this.endIndex) {
            if (this.handCards.children[this.endIndex].active && !this.handCards.children[this.endIndex].touchTag) {
                this.Click_card(this.handCards.children[this.endIndex]);
            }
        } else {
            if (this.startIndex > this.endIndex) {
                //从右往左
                for (var _i10 = this.startIndex; _i10 >= this.endIndex; _i10--) {
                    if (this.handCards.children[_i10].touchTag) continue;
                    if (this.handCards.children[_i10].active) this.Click_card(this.handCards.children[_i10]);
                }
            } else {
                //从左往右
                for (var _i11 = this.startIndex; _i11 <= this.endIndex; _i11++) {
                    if (this.handCards.children[_i11].touchTag) continue;
                    if (this.handCards.children[_i11].active) this.Click_card(this.handCards.children[_i11]);
                }
            }
        }

        if (this.isChoose == true) {
            var cardArray = this.LogicDDZGame.GetTipCardSlCard();
            if (cardArray.length > 0) {
                this.LogicDDZGame.ChangeSelectCard(cardArray[0]);
                this.Event_ShowHandCard();
            }
        }
    },

    OnTouchCancel: function OnTouchCancel(event) {
        for (var i = 0; i < this.handCards.children.length; i++) {
            if (this.handCards.children[i].name.startsWith("card")) {
                if (this.handCards.children[i].touchTag) continue;
                this.handCards.children[i].getChildByName("bg_black").active = false;
            }
        }

        if (this.isChoose == true) {
            var cardArray = this.LogicDDZGame.GetTipCardSlCard();
            if (cardArray.length > 0) {
                this.LogicDDZGame.ChangeSelectCard(cardArray[0]);
                this.Event_ShowHandCard();
            }
        }
    },

    Click_card: function Click_card(clickNode) {
        var name = "";
        name = clickNode.name;
        var cardIdx = name.substring(5, name.length);
        if (clickNode.y == 0) {
            clickNode.y = this.DDZDefine.MaxRisePosY;
            this.LogicDDZGame.SetCardSelected(parseInt(cardIdx));
        } else {
            clickNode.y = 0;
            this.LogicDDZGame.DeleteCardSelected(parseInt(cardIdx));
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////

    //添加头像
    AddHead: function AddHead() {
        //初始化加入头像 如果已经有加入了头像 显示出来
        var posList = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("posList");
        var playerCount = posList.length;
        for (var idx = 0; idx < posList.length; idx++) {
            var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(posList[idx].pos);
            var path = "sp_seat0" + uiPos.toString() + "/head";
            var node = this.GetWndNode(path);
            if (!node.getChildByName("UIDDZHead" + uiPos)) {
                var head = cc.instantiate(this.headPrefab);
                node.addChild(head);

                var headScript = head.getComponent("UIDDZHead");
                headScript.Init(uiPos, posList[idx].pos, cc.v2(0, 0), this.Left[uiPos]);
            } else {
                var headNode = node.getChildByName("UIDDZHead" + uiPos);
                // headNode.getChildByName("otherNode").active = false;
                // headNode.getChildByName("otherNode").getChildByName("bsPrefab").active = false;
                var _headScript2 = headNode.getComponent("UIDDZHead");
                _headScript2.Init(uiPos, posList[idx].pos, cc.v2(0, 0), this.Left[uiPos]);
            }
        }
    },

    OnEventShow: function OnEventShow() {
        console.log("从后台返回游戏内");
        var curTime = new Date().getTime();
        var lostHearTime = app[app.subGameName + "Client"].LostHearTime;
        if (this.outGameTime && curTime > this.outGameTime + 30000) {
            // app[app.subGameName + "Client"].lastHearTime = 0;
            this.outGameTime = 0;
            if (app[app.subGameName + "_NetWork"]().isConnectIng) {
                //ios的可能websoket不会主动断开
                console.log("后台切回来，先断开连接");
                app[app.subGameName + "_NetManager"]().Disconnect();
            }
            if (!app[app.subGameName + "Client"].bStartReConnect) {
                console.log("后台切回来，发起断线重连");
                app[app.subGameName + "Client"].StartReConnect();
                app[app.subGameName + "_NetWork"]().ReConnectByTipSureBtn();
            }
        } else {
            var roomID = this.DDZRoom.GetRoomProperty("roomID");
            app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "ShowLeave", { "roomID": roomID, "isShowLeave": false });
        }
        app[app.subGameName + "Client"].scheduleOnce(function () {
            app[app.subGameName + "Client"].StartTimer();
        }, 2);
    },

    OnEventHide: function OnEventHide() {
        console.log("从游戏内切换后台");
        this.outGameTime = new Date().getTime();
        var roomID = this.DDZRoom.GetRoomProperty("roomID");
        app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "ShowLeave", { "roomID": roomID, "isShowLeave": true });
        app[app.subGameName + "Client"].StopTimer();
    },

    ClearHead: function ClearHead() {
        for (var idx = 0; idx < this.DDZDefine.MaxPlayer; idx++) {
            var path = "sp_seat0" + idx + "/head" + "/UIDDZHead" + idx;
            var node = this.GetWndNode(path);
            if (node) {
                var headScript = node.getComponent("UIDDZHead");
                headScript.OnClose();
            }
        }
    },

    OnClose: function OnClose() {
        this.HideAll();
        this.ClearHead();
        this.unscheduleAllCallbacks();
        cc.game.off(cc.game.EVENT_HIDE);
        cc.game.off(cc.game.EVENT_SHOW);
    },

    InitGameStateCommon: function InitGameStateCommon(state) {
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        //得到玩家自己的手牌
        this.handCards.active = true;
        this.LogicDDZGame.InitHandCard();
        this.Event_ShowHandCard();

        //隐藏发牌的牌墩
        this.allCards.active = false;

        var playerAll = this.DDZRoomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        for (var i = 0; i < playerAllList.length; i++) {
            var player = playerAll[playerAllList[i]];
            for (var j = 0; j < setInfo.posInfo.length; j++) {
                var info = setInfo.posInfo[j];
                if (player.pid == info.pid) {
                    // console.log("InitGameStateCommon info cards === " + info.cards);
                    // if (state == this.ShareDefine.DDZSetState_Hog) {
                    //同步下牌根数
                    var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(player.pos);
                    this.allPlayerCardIdx[uiPos] = info.cards.length;
                    // }
                    this.InitCardNum(player.pos, info.cards.length);
                    this.ShowWarningByPos(player.pos, info.cards.length);
                    if (info.addDouble > 0) {
                        this.ShowAddDouble(player.pos, info.addDouble);
                    }
                    if (info.openCard == 1) {
                        this.openCardInfo[player.pos] = info.cards;
                        this.ShowOpenCard(player.pos, info.cards);
                    }
                }
            }
        }
    },

    UpdateScoreAndDouble: function UpdateScoreAndDouble() {
        this.lb_publicScore.string = this.DDZRoomSet.GetRoomSetProperty("hogScore");
        this.lb_publicMultiple.string = this.DDZRoomSet.GetRoomSetProperty("roomDouble");
    },

    InitCardNum: function InitCardNum(pos, count) {
        if (this.DDZRoomPosMgr.GetClientPos() == pos) return;
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(pos);
        var card = this.GetWndNode("sp_seat0" + uiPos + "/card");
        card.active = true;
        var cardNum = this.GetWndNode("sp_seat0" + uiPos + "/cardNum");
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty("kexuanwanfa");
        if (kexuanwanfa.indexOf(5) >= 0) {
            card.active = false;
            if (count <= 2) {
                card.active = true;
                cardNum.active = true;
                if (!card.getChildByName("poker_back").active) {
                    card.getChildByName("poker_back").active = true;
                }
                cardNum.getComponent(cc.Label).string = count.toString();
            }
        } else {
            card.active = true;
            cardNum.active = true;
            if (!card.getChildByName("poker_back").active) {
                card.getChildByName("poker_back").active = true;
            }
            cardNum.getComponent(cc.Label).string = count.toString();
        }
    },
    ////////////////////////////////show///////////////////////////////////////////
    RefreshRoomShow: function RefreshRoomShow() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        this.ShowPlayerReady(room);
    },

    HideAllZhunBeiLabel: function HideAllZhunBeiLabel() {
        var playerAll = this.DDZRoomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        for (var i = 0; i < playerAllList.length; i++) {
            var player = playerAll[playerAllList[i]];
            var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(player.pos);
            var path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
            var headNode = this.GetWndNode(path);
            var headScript = headNode.getComponent("UIDDZHead");
            headScript.setReady(false);
        }
    },

    ShowOrHideZhunbei: function ShowOrHideZhunbei(pos, isShow) {
        var headScript = this.GetUICardComponentByPos(pos);
        headScript.setReady(isShow);
    },

    HidePlayerAllBtn: function HidePlayerAllBtn() {
        this.btn_ready.active = false;
        this.btn_weixin.active = false;
        this.btn_fzkl.active = false;
        this.btn_cancel.active = false;
        this.btn_go.active = false;
        this.btn_openCardStart.active = false;
        this.btn_ok.active = false;
        this.tip_ok.active = false;
        this.invitationNode.active = false;
    },

    HideAll: function HideAll() {
        // this.HideAllZhunBeiLabel();
        this.HidePlayerAllBtn();
        this.HideAllClock();
        this.HideAllHandCard();
        this.HideAllPass();
        this.HideAllWarning();
        this.HideAllCardNum();
        this.HideAllOutCard();
        this.HideAllGameBtn();
        this.HideAllBsNode();
        this.HideAllOpenCard();
        this.btn_openCard.active = false;
        this.img_dzp.active = false;
        this.lb_mypdgsj.active = false;
        this.lb_ddbrjb.active = false;
        this.GameEnd_Ani.active = false;
        this.razzNode.active = false;
    },

    HideAllAni: function HideAllAni() {
        this.plane_Ani.active = false;
        this.liandui_Ani.active = false;
        this.boom_Ani.active = false;
        this.dragon_Ani.active = false;
    },

    OnClickForm: function OnClickForm() {
        this.FormManager.CloseForm(app.subGameName + "_UIChat");
    },

    OnClick: function OnClick(btnName, btnNode) {
        console.log('btnName', btnName, btnNode);
        var roomID = this.DDZRoom.GetRoomProperty("roomID");
        var pos = this.DDZRoomPosMgr.GetClientPos();
        if (btnName == "btn_go") {
            this.Click_btn_go();
        } else if (btnName == "btn_ok") {
            this.Click_btn_ok();
        } else if (btnName == "btn_openCardStart") {
            this.Click_btn_openCardStart();
        } else if (btnName == "btn_ready") {
            this.Click_btn_ready();
        } else if (btnName == "btn_cancel") {
            this.Click_btn_cancel();
        } else if (btnName == "btn_weixin") {
            this.Click_btn_weixin("WX");
        } else if (btnName == "btn_fzkl") {
            var str = "房间号：" + this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("key");
            this.Click_btn_fzkl(str);
        } else if (btnName == "btn_shuaxin") {
            this.ReInRoom();
        } else if (btnName == "bg") {
            this.FormManager.CloseForm(app.subGameName + "_UIChat");
        } else if (btnName == "btn_pass") {
            this.Click_btn_pass();
        } else if (btnName == "btn_tip") {
            this.Click_btn_tip();
        } else if (btnName == "btn_outCard") {
            this.Click_btn_outCard();
        } else if (btnName == "btn_openCard") {
            this.DDZRoomMgr.SendOpenCard(roomID, 1, this.openCardMutiple);
        } else if (btnName == "btn_noRob") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 0);
        } else if (btnName == "btn_rob") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 1);
        } else if (btnName == "btn_noRobScore") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 0);
        } else if (btnName == "btn_1") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 1);
        } else if (btnName == "btn_2") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 2);
        } else if (btnName == "btn_3") {
            this.gameRobLandLord.active = false;
            this.gameRobScore.active = false;
            this.DDZRoomMgr.SendHog(roomID, 3);
        } else if (btnName == "btn_noMultiple") {
            this.DDZRoomMgr.SendAddDouble(roomID, 0);
        } else if (btnName == "btn_multiple") {
            this.DDZRoomMgr.SendAddDouble(roomID, 1);
        } else if (btnName == "btn_menu") {
            if (this.bg_menu.active) {
                this.bg_menu.active = false;
            } else {
                var valueBackMusic = this.LocalDataManager.GetConfigProperty("SysSetting", "BackMusic");
                if (valueBackMusic) {
                    //替换按钮图片
                    var imgPath = 'texture/game/doudizhu/btn_openMusic';
                    var btnPath = 'bg_bottom/bg_menu/btn_openMusic';
                    this.SetWndImageByFilePath(btnPath, imgPath);
                } else {
                    //替换按钮图片
                    var _imgPath = 'texture/game/doudizhu/btn_closeMusic';
                    var _btnPath = 'bg_bottom/bg_menu/btn_openMusic';
                    this.SetWndImageByFilePath(_btnPath, _imgPath);
                }
                var valueSpSound = this.LocalDataManager.GetConfigProperty("SysSetting", "SpSound");
                if (valueSpSound) {
                    //替换按钮图片
                    var _imgPath2 = 'texture/game/doudizhu/btn_openSound';
                    var _btnPath2 = 'bg_bottom/bg_menu/btn_openSound';
                    this.SetWndImageByFilePath(_btnPath2, _imgPath2);
                } else {
                    //替换按钮图片
                    var _imgPath3 = 'texture/game/doudizhu/btn_closeSound';
                    var _btnPath3 = 'bg_bottom/bg_menu/btn_openSound';
                    this.SetWndImageByFilePath(_btnPath3, _imgPath3);
                }
                this.bg_menu.active = true;
            }
        } else if (btnName == "btn_openMusic") {
            var value = this.LocalDataManager.GetConfigProperty("SysSetting", "BackMusic");
            if (value) {
                this.LocalDataManager.SetConfigProperty("SysSetting", "BackMusic", 0);
                //替换按钮图片
                var _imgPath4 = 'texture/game/doudizhu/btn_closeMusic';
                var _btnPath4 = 'bg_bottom/bg_menu/btn_openMusic';
                this.SetWndImageByFilePath(_btnPath4, _imgPath4);
                this.SceneManager.PauseSceneMusic();
            } else {
                this.LocalDataManager.SetConfigProperty("SysSetting", "BackMusic", 1);
                //替换按钮图片
                var _imgPath5 = 'texture/game/doudizhu/btn_openMusic';
                var _btnPath5 = 'bg_bottom/bg_menu/btn_openMusic';
                this.SetWndImageByFilePath(_btnPath5, _imgPath5);
                this.SceneManager.RecoverySceneMusic();
            }
        } else if (btnName == "btn_openSound") {
            var _value5 = this.LocalDataManager.GetConfigProperty("SysSetting", "SpSound");
            if (_value5) {
                this.LocalDataManager.SetConfigProperty("SysSetting", "SpSound", 0);
                //替换按钮图片
                var _imgPath6 = 'texture/game/doudizhu/btn_closeSound';
                var _btnPath6 = 'bg_bottom/bg_menu/btn_openSound';
                this.SetWndImageByFilePath(_btnPath6, _imgPath6);
            } else {
                this.LocalDataManager.SetConfigProperty("SysSetting", "SpSound", 1);
                //替换按钮图片
                var _imgPath7 = 'texture/game/doudizhu/btn_openSound';
                var _btnPath7 = 'bg_bottom/bg_menu/btn_openSound';
                this.SetWndImageByFilePath(_btnPath7, _imgPath7);
            }
        } else if (btnName == "btn_talk") {
            this.FormManager.ShowForm(app.subGameName + "_UIChat");
        } else if (btnName == "btn_cardDevice") {
            if (this.img_jpq.active) {
                this.img_jpq.active = false;
            } else {
                var state = this.DDZRoomSet.GetRoomSetProperty("state");
                var roomState = this.DDZRoom.GetRoomProperty("state");
                if (roomState == this.ShareDefine.RoomState_Playing && state == this.ShareDefine.DDZSetState_Playing) {
                    this.img_jpq.active = true;
                }
            }
        } else if (btnName == "btn_jsfj" || btnName == "btn_Exit") {
            //提示退出房间还是查看大厅
            var room = this.DDZRoomMgr.GetEnterRoom();
            var roomCfg = room.GetRoomConfig();
            if (roomCfg.clubId != 0) {
                this.node.getChildByName("tip_exit_node").zIndex = 100;
                this.node.getChildByName("tip_exit_node").active = true;
            } else {
                this.Click_btn_jiesan();
            }
        } else if (btnName == "btn_close_tip") {
            this.node.getChildByName("tip_exit_node").active = false;
        } else if (btnName == "btn_exit_room") {
            this.Click_btn_jiesan();
        } else if (btnName == "btn_go_hall") {
            app[app.subGameName + "Client"].ExitGame(null, '0');
        } else if (btnName == "razzNode") {
            this.HideRazzNode();
        } else if (btnName == "bg_table") {
            this.HideRazzNode();
        } else if (btnName == "btn_setting") {
            app[app.subGameName + "_FormManager"]().ShowForm(app.subGameName + '_UISetting02');
        } else if (btnName == "btn_auto") {
            app[app.subGameName + "_GameManager"]().SendAutoStart();
        } else if (btnName == "btn_gps") {} else if (btnName == "btn_gameHelp") {
            app[app.subGameName + "_FormManager"]().ShowForm(app.subGameName + '_UIGameHelp');
        } else {
            this.LogicDDZGame.ClearSelectCard();
            this.ErrLog("OnClick(%s) not find", btnName);
        }
    },

    Click_btn_tip: function Click_btn_tip() {
        //是否要先出黑桃3
        var array = this.LogicDDZGame.GetTipCard();

        if (array.length) {
            if (this.tipCount >= array.length) {
                this.tipCount = 0;
            }
            this.LogicDDZGame.ChangeSelectCard(array[this.tipCount]);
            this.Event_ShowHandCard();
            this.tipCount++;
        }
    },

    Click_btn_pass: function Click_btn_pass() {
        var serverPack = {};
        var roomID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        serverPack.roomID = roomID;
        var pos = this.DDZRoomPosMgr.GetClientPos();
        serverPack.pos = pos;
        serverPack.opCardType = this.LogicDDZGame.DDZ_CARD_TYPE_BUCHU;
        serverPack.cardList = [];
        this.DDZRoomMgr.SendOpCard(serverPack);
        this.razzNode.active = false;
    },

    Click_btn_outCard: function Click_btn_outCard() {
        //发给服务端的消息
        var serverPack = {};
        var roomID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        serverPack.roomID = roomID;
        var pos = this.DDZRoomPosMgr.GetClientPos();
        serverPack.pos = pos;
        var razzCardList = this.LogicDDZGame.GetAllCardTypeBySpc();
        if (razzCardList.length > 1) {
            this.ShowRazzNode(razzCardList);
            return;
        }
        var opCardType = this.LogicDDZGame.GetCardType();
        this.ClientOpCardByType(opCardType, serverPack);
    },
    ClientOpCardByType: function ClientOpCardByType(opCardType, serverPack) {
        var isSelectCard = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (opCardType > this.LogicDDZGame.DDZ_CARD_TYPE_NOMARL) {
            serverPack.opCardType = opCardType;
            var cardList = [];
            if (isSelectCard) {
                cardList = this.LogicDDZGame.GetSelectCard();
            } else {
                cardList = this.LogicDDZGame.GetHandCard();
            }
            //获取当前局数
            var setID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("setID");

            this.LogicDDZGame.TransformValueToS(cardList);
            serverPack.cardList = cardList;
            serverPack.daiNum = this.LogicDDZGame.GetDaiNum();
            console.log("打出去的牌类型 ==" + serverPack.opCardType);
            this.DDZRoomMgr.SendOpCard(serverPack);
            this.razzNode.active = false;
        } else {
            this.ShowSysMsg("MSG_CANT_OUT");
            this.ReInRoom();
        }
    },
    Click_btn_ready: function Click_btn_ready() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Click_btn_ready not enter room");
            return;
        }
        var roomID = room.GetRoomProperty("roomID");
        var clientPos = room.GetRoomPosMgr().GetClientPos();
        console.log('roomID', roomID, clientPos);
        app[app.subGameName + "_GameManager"]().SendReady(roomID, clientPos);
    },

    Click_btn_cancel: function Click_btn_cancel() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Click_btn_cancel not enter room");
            return;
        }
        var roomID = room.GetRoomProperty("roomID");
        var clientPos = room.GetRoomPosMgr().GetClientPos();
        app[app.subGameName + "_GameManager"]().SendUnReady(roomID, clientPos);
    },
    Click_btn_ok: function Click_btn_ok() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Click_btn_ready not enter room");
            return;
        }
        var roomID = room.GetRoomProperty("roomID");
        var clientPos = room.GetRoomPosMgr().GetClientPos();
        app[app.subGameName + "_GameManager"]().SendReady(roomID, clientPos);
        this.btn_ok.active = false;
        this.tip_ok.active = true;
    },
    Click_btn_go: function Click_btn_go() {
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        this.btn_openCardStart.active = false;
        this.btn_go.active = false;
        this.DDZRoomMgr.SendOpenCardStart(roomID, false, 0);
    },
    Click_btn_openCardStart: function Click_btn_openCardStart() {
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        this.btn_openCardStart.active = false;
        this.btn_go.active = false;
        this.DDZRoomMgr.SendOpenCardStart(roomID, false, 1);
    },

    Click_btn_jiesan: function Click_btn_jiesan() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Click_btn_jiesan not enter room");
            return;
        }

        if (app[app.subGameName + "_ShareDefine"]().isCoinRoom) {
            //Event_ExitRoomSuccess 都有做退出处理
            //Event_CodeError
            var needArg = this.DDZRoomPosMgr.GetClientPos();
            var _roomID = this.DDZRoomMgr.GetEnterRoomID();
            app[app.subGameName + "_GameManager"]().SendExitRoom(_roomID, needArg);
            // app.FormManager().AddDefaultFormName("UIPractice");
            // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
            app[app.subGameName + "Client"].ExitGame();
            return;
        }

        var state = room.GetRoomProperty("state");
        if (state == this.ShareDefine.RoomState_End) {
            //直接退出到大厅
            // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
            app[app.subGameName + "Client"].ExitGame();
            return;
        }
        var ClientPos = this.DDZRoomPosMgr.GetClientPos();
        var player = this.DDZRoomPosMgr.GetPlayerInfoByPos(ClientPos);
        if (!player) return;
        var posName = player.name;
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        if (state == this.ShareDefine.RoomState_Playing) {
            var jiesan = room.GetRoomConfigByProperty("jiesan");
            if (jiesan == 4) {
                this.ShowSysMsg("此房间不可解散");
                return;
            }
            // app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID, posName);
            app[app.subGameName + "_ConfirmManager"]().SetWaitForConfirmForm(this.OnConFirm.bind(this), 'MSG_GAME_DissolveRoom', []);
            app[app.subGameName + "_ConfirmManager"]().ShowConfirm(this.ShareDefine.Confirm, 'MSG_GAME_DissolveRoom', []);
            return;
        }

        var msgID = '';

        var roomCfg = room.GetRoomConfig();
        if (roomCfg.createType == 2 || roomCfg.clubId != 0) {
            msgID = 'UIMoreTuiChuFangJian';
        } else {
            if (room.IsClientIsCreater()) {
                msgID = 'PlayerLeaveRoom';
            } else {
                msgID = 'UIMoreTuiChuFangJian';
            }
        }

        app[app.subGameName + "_ConfirmManager"]().SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, []);
        app[app.subGameName + "_ConfirmManager"]().ShowConfirm(this.ShareDefine.Confirm, msgID, []);
    },
    ReInRoom: function ReInRoom(room) {
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        this.DDZRoomMgr.SendGetRoomInfo(roomID);
    },
    //////////////////////////////////////////////////////////////////////////
    Event_PosReadyChg: function Event_PosReadyChg(event) {
        this.RefreshRoomShow();
        var serverPack = event;
        app[app.subGameName + "Client"].OnEvent("Head_PosReadyChg", serverPack);
    },

    Event_RoomEnd: function Event_RoomEnd(event) {
        // this.FormManager.ShowForm("UIPublic_Record");
        // this.HideAll();
    },

    OnPack_AutoStart: function OnPack_AutoStart(event) {},

    //一局开始
    Event_SetStart: function Event_SetStart(event) {
        var setID = this.DDZRoom.GetRoomProperty("setID");
        var current = this.DDZRoom.GetRoomConfigByProperty("setCount");
        this.lb_jushu.string = "局数：" + setID + "/" + current;

        this.btn_go.active = false;
        this.tip_ok.active = false;
        app[app.subGameName + "Client"].OnEvent("SetStart");
        this.firstTurn = true;
        this.allPlayerCardIdx = [0, 0, 0, 0];
        this.LogicDDZGame.InitHandCard();
        this.ClearForbiddenTouch();
        this.allCardIdx = 0;
        this.openCardMutiple = 0;
        this.openCardInfo = {};
        this.landowner = -1;
        this.HideAll();
        //显示叫分和倍数
        this.UpdateScoreAndDouble();
        //显示需要发的牌
        this.ShowAllCard();
        //从房主开始发牌
        var ownerID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("ownerID");
        var playerAll = this.DDZRoomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        var owner = null;
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty("kexuanwanfa");
        for (var i = 0; i < playerAllList.length; i++) {
            var player = playerAll[playerAllList[i]];
            if (ownerID == player.pid) {
                owner = player;
            }
            // 是否显示手牌
            if (kexuanwanfa.indexOf(5) < 0) {
                this.InitCardNum(player.pos, 0);
            }
        }
        //先判断是是否已经明牌了，如果已经明牌，则不显示明牌按钮
        var setInfo = this.DDZRoomSet.GetRoomSetInfo();
        var posInfo = setInfo.posInfo;
        //更新记牌器
        this.UpdateCardNum(setInfo.cardNumMap);
        var isAlreadyOpen = false;
        for (var _i12 = 0; _i12 < posInfo.length; _i12++) {
            if (posInfo[_i12].posID == this.DDZRoomPosMgr.GetClientPos() && posInfo[_i12].openCard == 1) {
                isAlreadyOpen = true;
                break;
            }
        }
        if (isAlreadyOpen) {
            this.btn_openCard.active = false;
        } else {
            if (this.DDZRoom.GetRoomWanfa(0)) {
                this.btn_openCard.active = false;
            } else {
                this.btn_openCard.active = true;
            }
        }
        if (owner == null) {
            this.FaPaiAction(0);
        } else {
            this.FaPaiAction(owner.pos);
        }
    },

    //-----------------回调函数------------------------
    Event_ChatMessage: function Event_ChatMessage(event) {
        var argDict = event;
        var senderPid = argDict["senderPid"];
        var quickID = parseInt(argDict["quickID"]);
        var content = argDict["content"];

        var playerList = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr().GetRoomAllPlayerInfo();
        var playerListKey = Object.keys(playerList);
        var initiatorPos = "";
        for (var i = 0; i < playerListKey.length; i++) {
            var player = playerList[playerListKey[i]];
            var pid = player["pid"];
            if (senderPid == pid) {
                initiatorPos = parseInt(i);
            }
        }
        var playerSex = this.InitHeroSex(initiatorPos);
        var soundName = "";
        var path = "";
        if (quickID < 101) {
            switch (quickID) {
                case 1:
                    content = app.i18n.t("UIVoiceStringBieChao");
                    soundName = [playerSex, "_FastVoice_1"].join("");
                    break;
                case 2:
                    content = app.i18n.t("UIVoiceStringBieZou");
                    soundName = [playerSex, "_FastVoice_2"].join("");
                    break;
                case 3:
                    content = app.i18n.t("UIVoiceStringZhaoHu");
                    soundName = [playerSex, "_FastVoice_3"].join("");
                    break;
                case 4:
                    content = app.i18n.t("UIVoiceStringZanLi");
                    soundName = [playerSex, "_FastVoice_4"].join("");
                    break;
                case 5:
                    content = app.i18n.t("UIVoiceStringZanShang");
                    soundName = [playerSex, "_FastVoice_5"].join("");
                    break;
                case 6:
                    content = app.i18n.t("UIVoiceStringCuiCu");
                    soundName = [playerSex, "_FastVoice_6"].join("");
                    break;
                case 7:
                    content = app.i18n.t("UIVoiceStringKuaJiang");
                    soundName = [playerSex, "_FastVoice_7"].join("");
                    break;
                case 8:
                    content = app.i18n.t("UIVoiceStringDaShang");
                    soundName = [playerSex, "_FastVoice_8"].join("");
                    break;
                case 9:
                    content = app.i18n.t("UIVoiceStringLiKai");
                    soundName = [playerSex, "_FastVoice_9"].join("");
                    break;
                case 10:
                    content = app.i18n.t("UIVoiceStringYanChi");
                    soundName = [playerSex, "_FastVoice_10"].join("");
                    break;
                default:
                    this.ErrLog("Event_chatmessage not find(%s)", quickID);
            }
        } else {
            switch (quickID) {
                case 101:
                    path = "face1Action";
                    break;
                case 102:
                    path = "face2Action";
                    break;
                case 103:
                    path = "face3Action";
                    break;
                case 104:
                    path = "face4Action";
                    break;
                case 105:
                    path = "face5Action";
                    break;
                case 106:
                    path = "face6Action";
                    break;
                case 107:
                    path = "face7Action";
                    break;
                case 108:
                    path = "face8Action";
                    break;
                case 109:
                    path = "face9Action";
                    break;
                case 110:
                    path = "face10Action";
                    break;
                case 111:
                    path = "face11Action";
                    break;
                case 112:
                    path = "face12Action";
                    break;
                case 113:
                    path = "face13Action";
                    break;
                case 114:
                    path = "face14Action";
                    break;
                case 115:
                    path = "face15Action";
                    break;
                case 116:
                    path = "face16Action";
                    break;
                case 117:
                    path = "face17Action";
                    break;
                case 118:
                    path = "face18Action";
                    break;
                case 119:
                    path = "face19Action";
                    break;
                case 120:
                    path = "face20Action";
                    break;
                default:
                    this.ErrLog("Event_chatmessage not find(%s)", quickID);
            }
        }
        this.SoundManager.PlaySound(soundName);

        var roomPosMgr = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr();

        //敏感词汇替换
        content = this.UtilsWord.CheckContentDirty(content);
        var headScript = this.GetUICardComponentByPos(initiatorPos);
        if (content == "") {
            headScript.ShowFaceContent(path);
        } else {
            headScript.ShowChatContent(content);
        }
    },

    //特效播放结束
    OnEffectEnd: function OnEffectEnd(wndPath, effectName) {},
    GiftMoveEnd: function GiftMoveEnd(sender, useData) {
        sender.getComponent(cc.Animation).play();
        sender.bMove = false;
        //播放音效
        app[app.subGameName + "_SoundManager"]().PlaySound('mofa_' + sender.name);
    },
    OnGiftAniEnd: function OnGiftAniEnd(event) {
        var nodes = this.giftNode.children;
        for (var i = nodes.length; i > 0; i--) {
            if (event) {
                var aniState = nodes[i - 1].getComponent(cc.Animation).getAnimationState(nodes[i - 1].name);
                if (aniState.isPlaying) continue;
                if (!nodes[i - 1].bMove) nodes[i - 1].removeFromParent();
            } else nodes[i - 1].removeFromParent();
        }
    },
    //-----------------回调函数------------------
    Event_GameGift: function Event_GameGift(event) {
        var self = this;
        var argDict = event;
        var sendPos = argDict['sendPos'];
        var recivePos = argDict['recivePos'];
        var productId = argDict['productId'];

        var sendUiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(sendPos);
        var sendPath = "sp_seat0" + sendUiPos + "/head" + "/UIDDZHead" + sendUiPos;
        var sendHeadNode = this.GetWndNode(sendPath);
        var sendHead = sendHeadNode.getComponent("UIDDZHead");
        var reciveUiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(recivePos);
        var recivePath = "sp_seat0" + reciveUiPos + "/head" + "/UIDDZHead" + reciveUiPos;
        var reciveHeadNode = this.GetWndNode(recivePath);
        var reciveHead = reciveHeadNode.getComponent("UIDDZHead");

        var giftIdx = productId - 1;
        var tempNode = cc.instantiate(this.giftPrefabs[giftIdx]);
        var ani = tempNode.getComponent(cc.Animation);
        // tempNode.tag = giftIdx;
        tempNode.name = ani.defaultClip.name;
        tempNode.bMove = true;
        ani.on('finished', this.OnGiftAniEnd, this);
        var vec1 = sendHead.node.convertToWorldSpaceAR(cc.v2(0, 0));
        var vec2 = reciveHead.node.convertToWorldSpaceAR(cc.v2(0, 0));
        vec1 = this.giftNode.convertToNodeSpaceAR(vec1);
        vec2 = this.giftNode.convertToNodeSpaceAR(vec2);
        tempNode.x = vec1.x;
        tempNode.y = vec1.y;
        this.giftNode.addChild(tempNode);
        var action = cc.sequence(cc.moveTo(1, vec2), cc.callFunc(self.GiftMoveEnd, self));
        tempNode.runAction(action);
    },

    InitHeroSex: function InitHeroSex(pos) {
        var DDZRoomPosMgr = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr();
        var player = DDZRoomPosMgr.GetPlayerInfoByPos(pos);
        var Sex = player["sex"];
        var playerSex = "";
        if (Sex == this.ShareDefine.HeroSex_Boy) {
            playerSex = "boy";
        } else if (Sex == this.ShareDefine.HeroSex_Girl) {
            playerSex = "girl";
        }
        return playerSex;
    },
    //继续游戏
    Event_PosContinueGame: function Event_PosContinueGame(event) {
        // this.HideAll();
        var argDict = event;
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Event_PosContinueGame not enter room");
            return;
        }
        var RoomPosMgr = room.GetRoomPosMgr();
        var clientPos = RoomPosMgr.GetClientPos();
        if (argDict["pos"] != clientPos) {
            var clientPlayerInfo = RoomPosMgr.GetPlayerInfoByPos(clientPos);
            // //如果玩家已经继续了,需要渲染其他人的状态
            if (!clientPlayerInfo["gameReady"]) {
                return;
            }
        } else {
            //如果是自己准备就清理界面
            this.FormManager.CloseForm("game/DDZ/UIDDZ_Result");
            this.FormManager.CloseForm("game/DDZ/UIDDZ_2DResult");
        }
        this.RefreshRoomShow();
        app[app.subGameName + "Client"].OnEvent("Head_PosReadyChg", argDict);
    },

    //位置更新
    Event_PosUpdate: function Event_PosUpdate(event) {
        var serverPack = event;
        app[app.subGameName + "Client"].OnEvent('Head_PosUpdate', serverPack);
        this.RefreshRoomShow();
    },

    //位置离开
    Event_PosLeave: function Event_PosLeave(event) {
        this.btn_ok.active = 0;
        this.tip_ok.active = 0;
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Event_PosLeave not enter room");
            return;
        }

        var argDict = event;
        var pos = argDict["pos"];

        app[app.subGameName + "Client"].OnEvent('Head_PosLeave', argDict);

        var clientPos = room.GetRoomPosMgr().GetClientPos();
        //如果是客户端玩家并且是被T了
        if (argDict["beKick"] && clientPos == pos) {
            if (argDict["kickOutTYpe"] == 2) {
                this.SetWaitForConfirm('MSG_BeKick', this.ShareDefine.ConfirmOK, [argDict.msg]);
            } else if (argDict["kickOutTYpe"] == 3) {
                this.SetWaitForConfirm('MSG_BeKick', this.ShareDefine.ConfirmOK, ["由于长时间未准备，您已被请出房间"]);
            } else {
                this.SetWaitForConfirm('UIPlay_BeKick', this.ShareDefine.ConfirmOK);
            }
        }
        //如果是客户端自己，返回大厅
        if (!argDict["beKick"] && clientPos == pos) {
            app[app.subGameName + "Client"].ExitGame();
        }
        this.RefreshRoomShow();
    },

    Event_ExitRoomSuccess: function Event_ExitRoomSuccess(event) {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("Event_PosLeave not enter room");
            return;
        }
        var clientPos = room.GetRoomPosMgr().GetClientPos();
        if (event["beKick"] && clientPos == event["pos"]) {
            //如果是被t先弹提示，不能直接退出
            return;
        }
        // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
        app[app.subGameName + "Client"].ExitGame();
    },

    Event_OnRoomNotFindByReason: function Event_OnRoomNotFindByReason(event) {
        var roomID = this.DDZRoom.GetRoomProperty("roomID");
        if (roomID != event.roomID) return;
        this.ShowSysMsg(event.msg);
        //弹出总结算
        this.FormManager.ShowForm("game/DDZ/UIDDZ_Record");
    },

    OnEvt_CopyTextNtf: function OnEvt_CopyTextNtf(event) {
        if (0 == event.code) this.ShowSysMsg("已复制：" + event.msg);else this.ShowSysMsg("房间号复制失败");
    },

    //一局结束
    Event_SetEnd: function Event_SetEnd(event) {
        this.unschedule(this.CallEverySecond);
        var setEnd = this.DDZRoomSet.GetRoomSetProperty("setEnd");
        //显示动画
        this.GameEnd_Ani.active = true;
        if (setEnd.landowner == this.DDZRoomPosMgr.GetClientPos()) {
            if (setEnd.pointList[this.DDZRoomPosMgr.GetClientPos()] > 0) {
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshengli");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshibai");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushibai");
                this.GameEnd_Ani.getComponent(cc.Animation).play("dizhushengli");
                this.SoundManager.PlaySound("MusicEx_Win", this.DDZDefine.SoundPath + "MusicEx_Win");
            } else {
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshengli");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshibai");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushengli");
                this.GameEnd_Ani.getComponent(cc.Animation).play("dizhushibai");
                this.SoundManager.PlaySound("MusicEx_Lose", this.DDZDefine.SoundPath + "MusicEx_Lose");
            }
        } else {
            if (setEnd.pointList[this.DDZRoomPosMgr.GetClientPos()] > 0) {
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushengli");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshibai");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushibai");
                this.GameEnd_Ani.getComponent(cc.Animation).play("nongminshengli");
                this.SoundManager.PlaySound("MusicEx_Win", this.DDZDefine.SoundPath + "MusicEx_Win");
            } else {
                this.GameEnd_Ani.getComponent(cc.Animation).stop("nongminshengli");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushibai");
                this.GameEnd_Ani.getComponent(cc.Animation).stop("dizhushengli");
                this.GameEnd_Ani.getComponent(cc.Animation).play("nongminshibai");
                this.SoundManager.PlaySound("MusicEx_Lose", this.DDZDefine.SoundPath + "MusicEx_Lose");
            }
        }
        //是否留局。三家全没叫地主
        var isPingJu = false;
        if (setEnd.pointList[0] == 0 && setEnd.pointList[1] == 0 && setEnd.pointList[2] == 0) {
            isPingJu = true;
        }
        //判断是否被春天
        for (var i = 0; i < setEnd.robCloseList.length; i++) {
            if (setEnd.robCloseList[i] == 1 && !isPingJu) {
                this.ShutDow_Ani.active = true;
                this.ShutDow_Ani.getComponent(cc.Animation).stop("fanchuntian");
                this.ShutDow_Ani.getComponent(cc.Animation).play("chuntian");
                break;
            } else if (setEnd.robCloseList[i] == -1 && !isPingJu) {
                this.ShutDow_Ani.active = true;
                this.ShutDow_Ani.getComponent(cc.Animation).stop("chuntian");
                this.ShutDow_Ani.getComponent(cc.Animation).play("fanchuntian");
                break;
            }
        }

        this.UpdatePlayerScore();
        //发送明牌消息
        // let roomID = this.DDZRoom.GetRoomProperty("roomID");
        // this.DDZRoomMgr.SendOpenCard(roomID, 1, 1);

        var self = this;
        this.scheduleOnce(function () {
            self.FormManager.ShowForm("game/DDZ/UIDDZ_Result");
        }, 2.0);
    },

    //房间解散
    Event_DissolveRoom: function Event_DissolveRoom(event) {

        var argDict = event;
        var ownnerForce = argDict["ownnerForce"];

        //未开启房间游戏时才会触发
        if (ownnerForce) {
            var room = this.DDZRoomMgr.GetEnterRoom();
            //如果是房主主动接撒直接退出
            if (room && room.IsClientIsOwner()) {
                // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
                app[app.subGameName + "Client"].ExitGame();
            } else {
                this.SetWaitForConfirm('OwnnerForceRoom', this.ShareDefine.ConfirmOK);
            }
        } else if (event.dissolveNoticeType == 1) {
            this.SetWaitForConfirm('SportsPointDissolveRoom', this.ShareDefine.ConfirmOK, [event.msg]);
        } else if (event.dissolveNoticeType == 3) {
            this.SetWaitForConfirm('MSG_BeDissolve', this.ShareDefine.ConfirmOK, [event.msg]);
        } else {
            var state = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("state");
            //如果没有打完一局不会下发roomend,直接显示2次弹框
            if (state != this.ShareDefine.RoomState_End) {
                this.SetWaitForConfirm('DissolveRoom', this.ShareDefine.ConfirmOK);
                this.FormManager.CloseForm(app.subGameName + "_UIMessage02");
            }
            //如果有roomend数据显示 结果界面
            else {
                    this.FormManager.CloseForm(app.subGameName + "_UIMessage02");
                    this.FormManager.ShowForm("game/DDZ/UIDDZ_Record");
                }
        }
    },

    //收到解散房间
    Event_StartVoteDissolve: function Event_StartVoteDissolve(event) {
        this.FormManager.ShowForm(app.subGameName + "_UIMessage02");
    },

    UpdatePlayerScore: function UpdatePlayerScore() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        var posList = room.GetRoomProperty("posList");
        for (var idx = 0; idx < posList.length; idx++) {
            var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(posList[idx].pos);
            var path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
            var headNode = this.GetWndNode(path);
            var headScript = headNode.getComponent("UIDDZHead");
            headScript.UpDateLabJiFen();
            headScript.UpDateLabSportsPoint();
            if (uiPos == 0) {
                this.UpdateSelfScore();
            }
        }
    },

    UpdateSelfScore: function UpdateSelfScore() {
        var pos = this.DDZRoomPosMgr.GetClientPos();
        var room = this.DDZRoomMgr.GetEnterRoom();
        var allPlayerInfo = room.GetRoomPosMgr().GetRoomAllPlayerInfo();
        // let createRoomType = this.DDZRoom.GetRoomConfigByProperty("createRoomType");
        if (this.ShareDefine.isCoinRoom) {
            //创建的是金币玩法
            this.img_bottom_input1.getChildByName("icon_jb").active = true;
            this.img_bottom_input1.getChildByName("icon_jf").active = false;
            var coin = app[app.subGameName + "_HeroManager"]().GetHeroProperty('gold');
            this.img_bottom_input1.getChildByName("lb_score").getComponent(cc.Label).string = coin;
            // }else if (createRoomType == this.ShareDefine.ScoreRoom) {
            //     //创建的是积分玩法
            //     this.img_bottom_input1.getChildByName("icon_jb").active = false;
            //     this.img_bottom_input1.getChildByName("icon_jf").active = true;
            //     let score = 0;
            //     score = allPlayerInfo[pos].point;
            //     this.img_bottom_input1.getChildByName("lb_score").getComponent(cc.Label).string = score;
        } else {
            this.img_bottom_input1.getChildByName("icon_jb").active = false;
            this.img_bottom_input1.getChildByName("icon_jf").active = true;
            var score = 0;
            score = allPlayerInfo[pos].realPoint;
            this.img_bottom_input1.getChildByName("lb_score").getComponent(cc.Label).string = score;
        }
        var roomCard = app[app.subGameName + "_HeroManager"]().GetHeroProperty('roomCard');
        this.img_bottom_input2.active = false;
        this.img_bottom_input2.getChildByName("lb_crystal").getComponent(cc.Label).string = roomCard;
    },

    GetUICardComponentByPos: function GetUICardComponentByPos(pos) {
        var room = this.DDZRoomMgr.GetEnterRoom();
        if (!room) {
            this.ErrLog("GetUICardComponentByPos not enter room");
            return;
        }

        var posList = room.GetRoomProperty("posList");
        for (var idx = 0; idx < posList.length; idx++) {
            if (pos == posList[idx].pos) {
                var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(posList[idx].pos);
                var path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
                var headNode = this.GetWndNode(path);
                var headScript = headNode.getComponent("UIDDZHead");
                return headScript;
            }
        }
    },
    //显示玩家准备状态
    ShowPlayerReady: function ShowPlayerReady(room) {
        if (!room) {
            this.ErrLog("Event_ShowReadyOrNoReady not enter room");
            return;
        }
        var roomSetID = room.GetRoomProperty("setID");
        var ReadyState = "";
        if (roomSetID > 0) {
            ReadyState = "gameReady";
        } else {
            ReadyState = "roomReady";
        }

        this.SetPlayerReadyInfo(ReadyState);
    },
    HideClientReady: function HideClientReady() {
        this.btn_ready.active = false;
        this.btn_weixin.active = false;
        this.btn_ok.active = false;
        this.invitationNode.active = false;
    },
    ShowPlayerOk: function ShowPlayerOk() {
        this.btn_ready.active = 0;
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty("kexuanwanfa");
        if (kexuanwanfa.indexOf(2) != -1) {
            //自动准备玩法
            this.btn_ok.active = 0;
            this.Click_btn_ok();
        } else {
            //手动准备玩法
            this.btn_ok.active = 1;
        }
        this.btn_weixin.active = 0;
        this.invitationNode.active = false;
        this.btn_go.active = 0;
    },
    isAutoPass: function isAutoPass() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty('kexuanwanfa');
        if (kexuanwanfa.length > 0) {
            if (kexuanwanfa.indexOf(3) > -1) {
                return true;
            }
        }
        return false;
    },
    isWangZhaHog: function isWangZhaHog() {
        var room = this.DDZRoomMgr.GetEnterRoom();
        var kexuanwanfa = room.GetRoomConfigByProperty('kexuanwanfa');
        if (kexuanwanfa.length > 0) {
            if (kexuanwanfa.indexOf(4) > -1) {
                return true;
            }
        }
        return false;
    },
    IsClientReady: function IsClientReady(ReadyState) {
        var roomPosMgr = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr();
        var clientPos = roomPosMgr.GetClientPos();
        var playerAll = roomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        for (var i = 0; i < playerAllList.length; i++) {
            var player = playerAll[playerAllList[i]];
            var isClientReady = player[ReadyState];
            if (player["pos"] == clientPos) {
                return isClientReady;
                break;
            }
        }
    },
    IsOpenStartGame: function IsOpenStartGame() {
        var roomPosMgr = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr();
        var clientPos = roomPosMgr.GetClientPos();
        var playerAll = roomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        for (var i = 0; i < playerAllList.length; i++) {
            var player = playerAll[playerAllList[i]];
            if (this.DDZRoom.GetRoomWanfa(0)) {
                return false;
            }
            return !player["openStartGame"];
        }
    },
    JoinPlayerFinish: function JoinPlayerFinish() {
        var roomPosMgr = this.DDZRoomMgr.GetEnterRoom().GetRoomPosMgr();
        var playerAll = roomPosMgr.GetRoomAllPlayerInfo();
        var playerAllList = Object.keys(playerAll);
        var tempNum = 0;
        for (var j = 0; j < playerAllList.length; j++) {
            var player = playerAll[playerAllList[j]];
            if (player.pid > 0) {
                tempNum++;
            }
        }
        if (tempNum == playerAllList.length) {
            return true;
        }
        return false;
    },
    SetPlayerReadyInfo: function SetPlayerReadyInfo(ReadyState) {
        if (ReadyState == "gameReady") {
            //第二局
            this.HideClientReady();
        } else if (ReadyState == "roomReady") {
            //第一局
            if (this.JoinPlayerFinish() && this.IsClientReady(ReadyState) == false) {
                //人数加满，本家没准备
                this.ShowPlayerOk();
            } else if (this.JoinPlayerFinish() && this.IsClientReady(ReadyState) == true) {
                //人数加满，本家准备
                this.HideClientReady();
            } else {
                //人数未满
                this.ShowPlayerYaoQing();
            }
        }
    },
    ShowPlayerYaoQing: function ShowPlayerYaoQing() {
        this.btn_ready.active = 0;
        this.btn_weixin.active = 1;
        this.btn_ok.active = false;
        if (this.roomCfg.clubId > 0 || this.roomCfg.unionId > 0) {
            this.invitationNode.active = true;
        } else {
            this.invitationNode.active = false;
        }
    },
    GetPlayerSex: function GetPlayerSex(pos) {
        var playerSex = "";
        var player = this.DDZRoomPosMgr.GetPlayerInfoByPos(pos);
        var Sex = player["sex"];
        if (Sex == this.ShareDefine.HeroSex_Boy) {
            playerSex = "boy";
        } else if (Sex == this.ShareDefine.HeroSex_Girl) {
            playerSex = "girl";
        }
        return playerSex;
    },

    //显示选择癞子牌选择
    ShowRazzNode: function ShowRazzNode(razzCardList) {
        var realCardList = razzCardList[0].realCardList;
        var cardLength = realCardList.length;
        var bg_lz = this.razzNode.getChildByName("bg_lz");
        bg_lz.width = 240 + (cardLength - 1) * 20;
        var content = bg_lz.getChildByName("razzView").getChildByName("view").getChildByName("content");
        content.removeAllChildren();
        bg_lz.getChildByName("razzView").width = bg_lz.width;
        bg_lz.getChildByName("razzView").getChildByName("view").width = bg_lz.width;
        content.width = bg_lz.width;
        for (var i = 0; i < razzCardList.length; i++) {
            var razzCell = cc.instantiate(this.razzNode.getChildByName("selectCardDemo"));
            razzCell.getChildByName("pokers").removeAllChildren();
            realCardList = razzCardList[i].realCardList;
            var cardType = razzCardList[i].cardType;
            var lb_cardType = razzCell.getChildByName("lb_cardType");
            lb_cardType.x = bg_lz.width / 2;
            if (cardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI1) {
                lb_cardType.getComponent(cc.Label).string = "飞机带单";
            } else if (cardType == this.LogicDDZGame.DDZ_CARD_TYPE_FEIJI2) {
                lb_cardType.getComponent(cc.Label).string = "飞机带对";
            } else if (cardType == this.LogicDDZGame.DDZ_CARD_TYPE_4DAI4) {
                lb_cardType.getComponent(cc.Label).string = "四带2对";
            } else {
                lb_cardType.getComponent(cc.Label).string = "未知牌型";
            }
            for (var j = 0; j < realCardList.length; j++) {
                var cardNode = cc.instantiate(this.cardPrefab);
                razzCell.getChildByName("pokers").addChild(cardNode);
                cardNode.name = "card_" + j.toString();
                var cardValue = realCardList[j];
                if (cardValue) {
                    var isLastCard = false;
                    if (j + 1 == realCardList.length) {
                        isLastCard = true;
                    }
                    this.ShowCard(cardValue, cardNode, isLastCard, false);
                } else {
                    cardNode.active = false;
                }
            }
            razzCell.active = true;
            content.addChild(razzCell);
            razzCell.name = "razzCell_" + i.toString();
            razzCell.on('click', this.OnRazzCell, this);
        }
        this.razzNode.active = true;
    },

    HideRazzNode: function HideRazzNode() {
        this.razzNode.active = false;
    },

    OnRazzCell: function OnRazzCell(event) {
        var itemName = event.target.name;
        var allRazzCardList = this.LogicDDZGame.GetAllCardTypeBySpc();
        var selectIndex = parseInt(itemName.substr('razzCell_'.length));
        var serverPack = {};
        var roomID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        serverPack.roomID = roomID;
        var pos = this.DDZRoomPosMgr.GetClientPos();
        serverPack.pos = pos;
        serverPack.opCardType = allRazzCardList[selectIndex]["cardType"];
        //获取当前局数
        var setID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("setID");

        this.LogicDDZGame.TransformValueToS(allRazzCardList[selectIndex]["realCardList"]);
        serverPack.cardList = allRazzCardList[selectIndex]["realCardList"];
        serverPack.daiNum = this.LogicDDZGame.GetDaiNum();
        console.log("打出去的牌类型 ==" + serverPack.opCardType);
        this.DDZRoomMgr.SendOpCard(serverPack);

        this.razzNode.active = false;
    },

    OnUpdate: function OnUpdate() {
        //更新系统时间
        var DateNow = new Date();
        var Hours = DateNow.getHours();
        var Minutes = DateNow.getMinutes();
        Hours = this.ComTool.StringAddNumSuffix("", Hours, 2);
        Minutes = this.ComTool.StringAddNumSuffix("", Minutes, 2);
        this.lb_time.string = Hours + ":" + Minutes;
    },

    /**
     * 2次确认点击回调
     */
    SetWaitForConfirm: function SetWaitForConfirm(msgID, type) {
        var msgArg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var cbArg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

        var ConfirmManager = app[app.subGameName + "_ConfirmManager"]();
        ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, cbArg);
        ConfirmManager.ShowConfirm(type, msgID, msgArg);
    },
    OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
        var ClientPos = this.DDZRoomPosMgr.GetClientPos();
        var player = this.DDZRoomPosMgr.GetPlayerInfoByPos(ClientPos);
        var posName = player.name;
        var roomID = this.DDZRoomMgr.GetEnterRoomID();
        if (clickType != "Sure") {
            if (msgID == "SportsPointNotEnough") {
                app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID);
            }
            return;
        }
        if (msgID == "UIPlay_BeKick") {
            // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
            app[app.subGameName + "Client"].ExitGame();
        } else if (msgID == "OwnnerForceRoom") {
            // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
            app[app.subGameName + "Client"].ExitGame();
        } else if (msgID == "DissolveRoom") {
            // app[app.subGameName + "_SceneManager"]().LoadScene("ddzMainScene");
            app[app.subGameName + "Client"].ExitGame();
        } else if (msgID == "PlayerLeaveRoom") {
            app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID);
        } else if (msgID == "SportsPointNotEnough") {} else if (msgID == "SportsPointThresholdEnough" || msgID == "SportsPointThresholdNotEnough") {
            app[app.subGameName + "Client"].ExitGame();
        } else if (msgID == "MSG_BeKick" || msgID == "MSG_BeDissolve") {
            app[app.subGameName + "Client"].ExitGame();
        } else if (msgID == "MSG_GAME_DissolveRoom") {
            app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID, posName);
        } else if (msgID == "UIMoreTuiChuFangJian") {
            if (!player) return;
            var state = this.DDZRoom.GetRoomProperty("state");
            if (state == this.ShareDefine.RoomState_Playing) {
                app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID, posName);
                return;
            }
            app[app.subGameName + "_GameManager"]().SendExitRoom(roomID, ClientPos);
        } else {
            this.ErrLog("OnConFirm msgID:%s error", msgID);
        }
    }
});

module.exports = BasePlayForm;

cc._RF.pop();