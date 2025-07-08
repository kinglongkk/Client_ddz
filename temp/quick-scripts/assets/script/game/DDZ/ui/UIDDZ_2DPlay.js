(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/game/DDZ/ui/UIDDZ_2DPlay.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '9c976oTJLNEOIUCwaJ0owie', 'UIDDZ_2DPlay', __filename);
// script/game/DDZ/ui/UIDDZ_2DPlay.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BasePlay"),

    properties: {
        headPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
        giftPrefabs: [cc.Prefab],
        icon_signal: [cc.SpriteFrame],

        UIInvitation: cc.Prefab
    },

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
        this.btn_ready = this.GetWndNode("gameBtnStartList/btn_ready");
        this.btn_weixin = this.GetWndNode("gameBtnStartList/btn_weixin");
        this.btn_fzkl = this.GetWndNode("btn_fzkl");
        this.btn_cancel = this.GetWndNode("gameBtnStartList/btn_weixin");
        this.btn_go = this.GetWndNode("gameBtnStartList/btn_go");
        this.btn_openCardStart = this.GetWndNode("gameBtnStartList/btn_openCardStart");
        this.handCards = this.GetWndNode("handCards");
        this.allCards = this.GetWndNode("allCards");
        this.gameBtn = this.GetWndNode("gameBtn");
        this.gameRobLandLord = this.GetWndNode("gameRobLandLord");
        this.gameRobScore = this.GetWndNode("gameRobScore");
        this.btn_tip = this.GetWndNode("gameBtn/btn_tip");
        this.btn_pass = this.GetWndNode("gameBtn/btn_pass");
        this.btn_outCard = this.GetWndNode("gameBtn/btn_outCard");
        this.btn_yaobuqi = this.GetWndNode("gameBtn/btn_yaobuqi");
        this.gameMultiple = this.GetWndNode("gameMultiple");
        this.btn_openCard = this.GetWndNode("btn_openCard");
        // this.btn_openSound = this.GetWndNode("gameBtnStartList/btn_go");
        // this.btn_openMusic = this.GetWndNode("gameBtnStartList/btn_go");
        this.boom_Ani = this.GetWndNode("boom_Ani");
        this.plane_Ani = this.GetWndNode("plane_Ani");
        this.liandui_Ani = this.GetWndNode("liandui_Ani");
        this.dragon_Ani = this.GetWndNode("dragon_Ani");
        this.GameEnd_Ani = this.GetWndNode("GameEnd_Ani");
        this.ShutDow_Ani = this.GetWndNode("ShutDow_Ani");
        this.bg_menu = this.GetWndNode("bg_menu");
        this.img_jpq = this.GetWndNode("img_jpq");
        this.img_dzp = this.GetWndNode("bg_dzp");
        this.lb_mypdgsj = this.GetWndNode("lb_mypdgsj");
        this.lb_ddbrjb = this.GetWndNode("lb_tsy02");
        this.giftNode = this.GetWndNode("giftNode");
        this.btn_talk = this.GetWndNode("btn_talk");
        this.btn_cardDevice = this.GetWndNode("btn_cardDevice");

        // this.img_bottom_input1 = this.GetWndNode("gameBtnStartList/btn_go");
        // this.img_bottom_input2 = this.GetWndNode("gameBtnStartList/btn_go");

        this.labelRoomId = this.GetWndNode("roomInfo/imgRoomIdDi/labelRoomId").getComponent(cc.Label);
        this.labeiWanfa = this.GetWndNode("img_bjl/labeiWanfa").getComponent(cc.Label);
        this.lb_jushu = this.GetWndNode("roomInfo/lb_jushu").getComponent(cc.Label);
        this.lb_publicScore = this.GetWndNode("bg_dzp/lb_publicScore").getComponent(cc.Label);
        this.lb_publicMultiple = this.GetWndNode("bg_dzp/lb_publicMultiple").getComponent(cc.Label);
        this.roomInfo = this.GetWndNode("roomInfo");

        this.lb_time = this.GetWndNode("roomInfo/imgTimeDi/lb_time").getComponent(cc.Label);
        this.img_dck = this.GetWndNode("roomInfo/imgTimeDi/img_dck").getComponent(cc.ProgressBar);
        this.img_wifi = this.GetWndNode("roomInfo/imgTimeDi/img_wifi").getComponent(cc.Sprite);

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
        this.btn_talk.active = this.IsShowChat();
        this.btn_cardDevice.active = this.IsShowCardDevice();
        //初始化邀请在线好友的数据
        this.roomCfg = this.DDZRoomMgr.GetEnterRoom().GetRoomConfig();
        if (this.roomCfg.clubId > 0 || this.roomCfg.unionId > 0) {
            this.invitationNode.active = true;
            this.invitationNode.getComponent(this.invitationNode.name).InitData(this.roomCfg.clubId, this.roomCfg.unionId, roomID);
        } else {
            this.invitationNode.active = false;
        }
        if (cc.sys.isNative) {
            app[app.subGameName + "Client"].RegEvent("EvtBatteryLevel", this.OnEvent_BatteryLevel, this);
            app[app.subGameName + "_NativeManager"]().CallToNative("registerReceiver", []);
        }
        app[app.subGameName + "Client"].RegEvent("EvtSpeedTest", this.OnEvent_SpeedTest, this);
        this.isChoose = false;
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
            this.labelRoomId.string = "房号：" + this.DDZRoom.GetRoomProperty("key");
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
                this.FormManager.ShowForm("game/DDZ/UIDDZ_2DResult");
            }
        } else {
            this.RefreshRoomShow();
        }

        //获取用户推广Url
        this.GetTuiGuangUrl();
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
            _card4.scale = 0.28;
            _card4.y = 6;
            _card4.name = "dzcard_" + (i + 1).toString();
            this.img_dzp.getChildByName("dzpNode").addChild(_card4);
        }
    },

    SetSeat01OutCardPos: function SetSeat01OutCardPos(dataPos, len) {
        var uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(dataPos);
        if (uiPos != 1) return;

        var node = this.node.getChildByName("outCardList1");
        var posX = 520 - 20 * len;
        node.x = posX;
    },

    //显示地主牌
    ShowDiZhuPai: function ShowDiZhuPai() {
        var allDzCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.img_dzp.active = true;
        for (var i = 0; i < this.img_dzp.getChildByName("dzpNode").children.length; i++) {
            var dzCard = this.img_dzp.getChildByName("dzpNode").children[i];
            if (allDzCard == null || allDzCard.length == 0) {
                dzCard.getChildByName("poker_back").active = true;
                dzCard.active = true;
            } else {
                this.ShowCard(allDzCard[i], dzCard, true, false);
            }
        }
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
                    imgBtnNoRob.getComponent(cc.Label).string = "不 抢";
                    var imgBtnRob = this.gameRobLandLord.getChildByName("btn_rob").getChildByName("lb_btn_jb");
                    imgBtnRob.getComponent(cc.Label).string = "抢地主";
                } else {
                    //图片变成不叫 叫地主
                    var _imgBtnNoRob = this.gameRobLandLord.getChildByName("btn_noRob").getChildByName("lb_btn_bjb");
                    _imgBtnNoRob.getComponent(cc.Label).string = "不 叫";
                    var _imgBtnRob = this.gameRobLandLord.getChildByName("btn_rob").getChildByName("lb_btn_jb");
                    _imgBtnRob.getComponent(cc.Label).string = "叫地主";
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

    UpdateSelfScore: function UpdateSelfScore() {},
    OnEvent_BatteryLevel: function OnEvent_BatteryLevel(event) {
        var power = event['Level'];
        var status = event['status'];
        this.img_dck.progress = power / 100;
    },
    OnEvent_SpeedTest: function OnEvent_SpeedTest(event) {
        var YanCi = event['yanci'];
        if (YanCi < 300) {
            this.img_wifi.spriteFrame = this.icon_signal[3];
        } else if (YanCi < 500) {
            this.img_wifi.spriteFrame = this.icon_signal[2];
        } else if (YanCi < 1000) {
            this.img_wifi.spriteFrame = this.icon_signal[1];
        } else {
            this.img_wifi.spriteFrame = this.icon_signal[0];
        }
    }, //一局结束
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
            self.FormManager.ShowForm("game/DDZ/UIDDZ_2DResult");
        }, 2.0);
    },

    Event_OnRoomNotFindByReason: function Event_OnRoomNotFindByReason(event) {
        var roomID = this.DDZRoom.GetRoomProperty("roomID");
        if (roomID != event.roomID) return;
        this.ShowSysMsg(event.msg);
        //弹出总结算
        this.FormManager.ShowForm("game/DDZ/UIDDZ_2DRecord");
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
                    this.FormManager.ShowForm("game/DDZ/UIDDZ_2DRecord");
                }
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
        //# sourceMappingURL=UIDDZ_2DPlay.js.map
        