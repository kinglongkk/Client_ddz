"use strict";
cc._RF.push(module, 'ddzabab9-a978-43eb-87c9-45833b3809f8', 'UIDDZVideo');
// script/game/DDZ/ui/UIDDZVideo.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        handCards: cc.Node,
        control_list: cc.Node,
        img_dzp: cc.Node,
        boom_Ani: cc.Node,
        plane_Ani: cc.Node,
        cardPrefab: cc.Prefab,
        wanfa: cc.Label,
        lb_publicScore: cc.Label,
        lb_publicMultiple: cc.Label
    },

    OnCreateInit: function OnCreateInit() {
        this.SysDataManager = app[app.subGameName + "_SysDataManager"]();
        this.IntegrateImage = this.SysDataManager.GetTableDict("IntegrateImage");
        this.NetManager = app[app.subGameName + "_NetManager"]();
        this.WeChatManager = app[app.subGameName + "_WeChatManager"]();
        this.DDZDefine = app.DDZDefine();
        this.ShareDefine = app[app.subGameName + "_ShareDefine"]();
        this.PokerCard = app[app.subGameName + "_PokerCard"]();
        this.NetManager.RegNetPack("SPlayer_PlayBackData", this.OnPack_PlayBackData, this);
        this.boom_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.plane_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        this.InitCard();
        this.curTabId = 0;
        this.curRoomID = 0;
    },

    OnShow: function OnShow() {
        var switchGameData = cc.sys.localStorage.getItem("switchGameData");
        var playBackCode = JSON.parse(switchGameData).backCode;
        console.log("playBackCode === " + playBackCode);
        cc.sys.localStorage.setItem("switchGameData", "");
        this.GetPlayBackDataByCode(playBackCode);
    },

    GetPlayBackDataByCode: function GetPlayBackDataByCode(playBackCode) {
        this.wanfa.string = "";
        this.HideAll();
        this.jin1 = -1;
        this.jin2 = -1;
        this.playerList = false; //玩家列表
        this.playerCount = 0; //玩家个数
        this.playkey = 0; //回放帧
        this.playBack = false; //回放日志
        this.NextPlayTime = 0; //下帧播放时间
        this.pause = false; //暂停
        this.fadeOutTime = 5; //淡出时间
        this.dPos = -1; //庄家
        this.minplay = 0; //快退最多能退到的帧数
        this.clientPos = 0;
        this.PlayBackList = new Array();
        console.log("UIPokerVideo playBackCode：", playBackCode);
        this.NetManager.SendPack("game.CPlayerPlayBack", { "playBackCode": playBackCode, "chekcPlayBackCode": false }, this.OnPack_VideoData.bind(this), this.OnVideoFailed.bind(this));
    },

    OnVideoFailed: function OnVideoFailed(serverPack) {
        this.SetWndProperty("UIMessageNoExist", "active", true);
    },

    OnPack_PlayBackData: function OnPack_PlayBackData(serverPack) {
        var playBackNum = serverPack.playBackNum;
        var key = serverPack.id;
        this.PlayBackList[key] = serverPack.msg;
        if (this.PlayBackList.length == playBackNum) {
            var PlayBackJson = '';
            for (var i = 0; i < playBackNum; i++) {
                PlayBackJson += this.PlayBackList[i];
            }
            var playBack = eval('(' + PlayBackJson + ')');
            this.playBack = playBack.playbackList;
            console.log("OnPack_PlayBackData mt this.playBack:", this.playBack);
            this.NextPlayTime = Math.round(new Date().getTime() / 1000) - 1;
            this.schedule(this.Play, 0.5);
        }
    },

    OnPack_VideoData: function OnPack_VideoData(serverPack) {
        this.playerList = this.Str2Json(serverPack.playerList);
        this.dPos = serverPack.dPos;
        this.playerCount = this.playerList.length;
        var roomKey = serverPack.roomKey;
        var setID = serverPack.setID;
        var setAll = serverPack.setCount;
        this.curRoomID = serverPack.roomID;
        this.curTabId = serverPack.tabId;
        this.SetRoomInfo(this.playerCount, roomKey, setID, setAll);
        //获取对局人数
        this.playerCount = this.playerList.length;
        this.isSelf = false;
        //先找出玩家自己的位置
        for (var i = 0; i < this.playerList.length; i++) {
            if (app[app.subGameName + "_HeroManager"]().GetHeroID() == this.playerList[i].pid) {
                this.clientPos = this.playerList[i].pos;
                this.isSelf = true;
                break;
            }
        }
        this.ShowPlayerInfo(this.playerList);
    },

    InitCard: function InitCard() {
        //玩家手牌
        this.handCards.active = false;
        for (var _i = 0; _i < this.DDZDefine.MaxHandCard; _i++) {
            var card = cc.instantiate(this.cardPrefab);
            card.active = false;
            card.name = "card_" + (_i + 1).toString();
            this.handCards.addChild(card);
        }

        //玩家打出去的牌
        for (var _i2 = 0; _i2 < this.DDZDefine.MaxPlayer; _i2++) {
            var outCardList = this.node.getChildByName("outCardList" + _i2);
            outCardList.active = false;
            for (var j = 0; j < this.DDZDefine.MaxHandCard; j++) {
                var _card = cc.instantiate(this.cardPrefab);
                _card.active = false;
                _card.name = "card_" + (_i2 + 1).toString();
                outCardList.addChild(_card);
            }
        }

        //玩家明牌的牌
        for (var _i3 = 1; _i3 < this.DDZDefine.MaxPlayer; _i3++) {
            var openCardList = this.node.getChildByName("openCardList" + _i3);
            openCardList.active = false;
            for (var _j = 0; _j < this.DDZDefine.MaxHandCard; _j++) {
                var _card2 = cc.instantiate(this.cardPrefab);
                _card2.active = false;
                _card2.name = "card_" + (_i3 + 1).toString();
                openCardList.addChild(_card2);
            }
        }

        //地主牌
        for (var i = 0; i < 3; i++) {
            var _card3 = cc.instantiate(this.cardPrefab);
            _card3.active = false;
            _card3.scale = 0.39;
            _card3.name = "dzcard_" + (i + 1).toString();
            this.img_dzp.addChild(_card3);
        }
    },

    SetRoomInfo: function SetRoomInfo(playercount, roomKey, setID, setAll) {
        this.SetWndProperty("room_data/label_player_num", "text", playercount + "人场");
        this.SetWndProperty("room_data/label_player_ju", "text", "局数：" + setID + "/" + setAll);
        this.SetWndProperty("room_data/label_player_roomkey", "text", "房间号：" + roomKey);
    },

    SetPlayInfo: function SetPlayInfo() {
        var playnow = this.playkey + 1;
        var max = this.playBack.length;
        if (playnow > max) {
            playnow = max;
        }
        if (playnow < 0) {
            playnow = 0;
        }
        // this.SetWndProperty("playinfo", "text",playnow+"/"+max);
    },

    //服务端位置转客户端位置
    GetUIPosByDataPos: function GetUIPosByDataPos(dataPos) {
        var playerCount = this.playerList.length;
        var uiPos = (dataPos + (this.playerCount - this.clientPos)) % playerCount;
        return uiPos;
    },

    GetPlayerPos: function GetPlayerPos(dataPos) {
        var uiPos = -1;
        if (this.isSelf) {
            uiPos = this.GetUIPosByDataPos(dataPos);
        } else {
            uiPos = dataPos;
        }

        return uiPos;
    },

    SetSeat01OutCardPos: function SetSeat01OutCardPos(dataPos, len) {
        var uiPos = this.GetPlayerPos(dataPos);

        if (uiPos != 1) return;

        var node = this.node.getChildByName("outCardList1");
        var posX = 525 - 25 * len;
        node.x = posX;
    },

    ShowPlayerInfo: function ShowPlayerInfo(playerList) {
        for (var i = 0; i < playerList.length; i++) {
            var uiPos = this.GetPlayerPos(playerList[i].pos);
            var heroID = playerList[i].pid;
            var head = this.GetWndNode("sp_seat0" + uiPos + "/head");
            head.active = true;
            //显示用户头像
            head.getChildByName("touxiang").getChildByName("btn_headkuang").getChildByName("mask").getChildByName("btn_head").getComponent(app.subGameName + "_WeChatHeadImage").ShowHeroHead(heroID);
            //显示用户名字
            var sp_info = head.getChildByName('touxiang').getChildByName('sp_info');
            sp_info.getChildByName('lb_name').getComponent("cc.Label").string = playerList[i].name;
        }
    },


    HideAll: function HideAll() {
        this.SetWndProperty("UIMessageNoExist", "active", false);
        // this.SetWndProperty("playinfo", "text",'');
        for (var i = 0; i < 3; i++) {
            var ShowNode = this.GetWndNode("sp_seat0" + i);
            if (i != 0) {
                ShowNode.getChildByName('card').active = false;
                ShowNode.getChildByName('cardNum').active = false;
            }
            this.GetWndNode("sp_seat0" + i + "/jiesan").active = false;
            var head = this.GetWndNode("sp_seat0" + i + "/head");
            //显示地主
            head.getChildByName("touxiang").getChildByName("icon_dzm").active = false;
            //显示是否加倍
            head.getChildByName("touxiang").getChildByName("img_jb").active = false;
            ShowNode.getChildByName('pass').active = false;
            ShowNode.getChildByName('head').active = false;
            head.getChildByName("touxiang").getChildByName("trusteeship").active = false;
        }
        this.HideAllOutCard();
        this.HideAllOpenCard();
        this.HideAllHandCard();
    },

    HideAllHandCard: function HideAllHandCard() {
        this.handCards.active = false;
        for (var i = 0; i < this.handCards.children.length; i++) {
            var child = this.handCards.children[i];
            child.active = false;
        }
    },

    HideAllOutCard: function HideAllOutCard() {
        for (var i = 0; i < this.DDZDefine.MaxPlayer; i++) {
            var outCard = this.node.getChildByName("outCardList" + i);
            outCard.active = false;
        }
    },

    HideAllOpenCard: function HideAllOpenCard() {
        for (var i = 1; i < this.DDZDefine.MaxPlayer; i++) {
            var openCardList = this.node.getChildByName("openCardList" + i);
            openCardList.active = false;
        }
    },

    HidePokerBack: function HidePokerBack() {
        for (var i = 1; i < this.DDZDefine.MaxPlayer; i++) {
            var poker_back = this.GetWndNode("sp_seat0" + i + "/card/poker_back");
            if (!poker_back.active) {
                poker_back.active = true;
            }
        }
    },

    SetWanFa: function SetWanFa(cfg, isClub) {
        var wanfa = this.WanFa(cfg);
        if (isClub == true) {
            this.wanfa.string = "亲友圈," + wanfa;
        } else {
            this.wanfa.string = wanfa;
        }
    },
    ShowPosLostConnect: function ShowPosLostConnect(posID, isLostConnect) {
        var uiPos = this.GetPlayerPos(posID);
        var seat = this.GetWndNode("sp_seat0" + uiPos + "/head");
        if (isLostConnect == true) {
            seat.getChildByName('touxiang').getChildByName('sp_lixian').active = true;
        } else {
            this.scheduleOnce(function () {
                seat.getChildByName('touxiang').getChildByName('sp_lixian').active = false;
            }, 2);
        }
    },
    ShowShowJieSan: function ShowShowJieSan(posID) {
        var uiPos = this.GetPlayerPos(posID);
        var seat = this.GetWndNode("sp_seat0" + uiPos + "/jiesan");
        seat.getChildByName('jiesan').active = true;
        this.scheduleOnce(function () {
            seat.getChildByName('jiesan').active = false;
        }, 2);
    },

    PlayData: function PlayData() {
        if (this.playkey == -1) {
            this.playkey = 0;
        }
        var data = this.playBack[this.playkey];
        if (!data) {
            return false;
        }
        this.SetPlayInfo();
        console.log("PlayForce data:", data);
        var type = data.name;
        var res = data.res;
        var waitSecond = 0; //本帧播放时间
        // if(data["setPosCard"]){
        //     for(let i=0;i<data["setPosCard"].length;i++){
        //         let posID=data["setPosCard"][i].posID;
        //         let isLostConnect=data["setPosCard"][i].isLostConnect;
        //         this.ShowPosLostConnect(posID,isLostConnect);
        //     }
        // }
        if (type.indexOf("SDDZ_Config") >= 0) {
            waitSecond = 0;
            this.SetWanFa(res.cfg, res.isClub);
        } else if (type.indexOf("StartVoteDissolve") >= 0) {
            waitSecond = 2;
            var createPos = res.createPos;
            this.ShowShowJieSan(createPos);
        } else if (type.indexOf("SDDZ_SetStart") >= 0) {
            waitSecond = 1;
            this.HideAllOutCard();
            this.PlaySetStart(res, data.setPosCard);
            this.UpdateScoreAndDouble(res.setInfo.hogScore, res.setInfo.roomDouble);
        } else if (type.indexOf("SDDZ_ChangeStatus") >= 0) {
            waitSecond = 1;
            this.HideAllOutCard();
            this.PlayChangeStatus(res);
            this.UpdateScoreAndDouble(null, res.roomDouble);
        } else if (type.indexOf("SDDZ_Hog") >= 0) {
            waitSecond = 1;
            this.UpdateScoreAndDouble(res.hogScore, res.roomDouble);
        } else if (type.indexOf("SDDZ_OpCard") >= 0) {
            waitSecond = 1;
            this.PlayOpCard(res, data.setPosCard);
            this.UpdateScoreAndDouble(null, res.roomDouble);
        } else if (type.indexOf("SDDZ_SetEnd") >= 0) {
            waitSecond = 4000000;
            this.PlayEnd(res);
        } else {
            console.log("Play type no play:", type);
            console.log("Play type no play data:", data);
            this.pause == true;
            return;
        }
        this.playkey += 1;
        this.NextPlayTime = Math.round(new Date().getTime() / 1000) + waitSecond;
    },


    Play: function Play() {
        this.fadeOutTime = this.fadeOutTime - 0.5;
        if (this.fadeOutTime <= 0 && this.fadeOutTime > -2) {
            this.HideControl();
        }
        var now = Math.round(new Date().getTime() / 1000);
        if (this.NextPlayTime == 0 || now < this.NextPlayTime) {
            return;
        }
        if (this.pause == true) {
            return;
        }
        this.PlayData();
    },

    PlayAddDouble: function PlayAddDouble(res) {},

    PlayRobClose: function PlayRobClose(res) {},

    PlayEnd: function PlayEnd(res) {
        var data = res.setEnd;
        app[app.subGameName + "Client"].ExitGame();
    },

    ShowPass: function ShowPass(dataPos) {
        var uiPos = this.GetPlayerPos(dataPos);
        var node = this.GetWndNode("sp_seat0" + uiPos + "/pass");
        node.active = true;
    },

    PlayOpCard: function PlayOpCard(res, setPosCard) {
        var data = res;
        this.SetSeat01OutCardPos(data.pos, data.cardList.length);
        this.ShowOutCard(data.pos, data.cardList);
        this.HidePokerBack();
        //显示托管图标
        var uiPos = this.GetPlayerPos(data.pos);
        var trusteeshipNode = this.GetWndNode("sp_seat0" + uiPos + "/head/touxiang/trusteeship");
        trusteeshipNode.active = data.isFlash;
        if (!data.cardList.length && data.opCardType == 1) {
            this.ShowPass(data.pos);
        }
        if (setPosCard) {
            for (var i = 0; i < this.playerList.length; i++) {
                var player = this.playerList[i];
                if (this.isSelf) {
                    if (player.pos == this.clientPos) {
                        this.ShowSelfCard(setPosCard[player.pos]);
                    } else {
                        this.ShowOpenCardList(player.pos, setPosCard[player.pos]);
                    }
                } else {
                    if (player.pos == 0) {
                        this.ShowSelfCard(setPosCard[player.pos]);
                    } else {
                        this.ShowOpenCardList(player.pos, setPosCard[player.pos]);
                    }
                }
            }

            //显示动画特效
            if (data.opCardType == 11) {
                //炸弹
                this.boom_Ani.active = true;
                this.SetAniPos(data.pos);
                this.boom_Ani.getComponent(cc.Animation).play("zhadan");
            } else if (data.opCardType == 12 || data.opCardType == 13) {
                this.plane_Ani.active = true;
                this.plane_Ani.getComponent(cc.Animation).play("feiji");
            }
        }
    },


    SetAniPos: function SetAniPos(dataPos) {
        var uiPos = this.GetUIPosByDataPos(dataPos);
        if (uiPos == 1) {
            this.boom_Ani.setPosition(cc.v2(232, 64));
        } else {
            var outCardList = this.node.getChildByName("outCardList" + uiPos);
            this.boom_Ani.setPosition(cc.v2(outCardList.x, outCardList.y));
        }
    },

    PlayChangeStatus: function PlayChangeStatus(res) {
        if (res.state == this.ShareDefine.DDZSetState_Hog) {
            var holeCards = res.holeCards;
            for (var i = 0; i < holeCards.length; i++) {
                var cardNode = this.img_dzp.children[i];
                var cardValue = holeCards[i];
                if (cardValue) {
                    this.ShowCard(cardValue, cardNode);
                } else {
                    cardNode.active = false;
                }
            }
            this.img_dzp.active = true;
        } else if (res.state == this.ShareDefine.DDZSetState_AddDouble) {
            var addDoubleList = res.addDoubleList;
            for (var _i4 = 0; _i4 < addDoubleList.length; _i4++) {
                var isLandowner = false;
                if (res.landowner == _i4) {
                    isLandowner = true;
                }
                var uiPos = this.GetPlayerPos(_i4);
                var head = this.GetWndNode("sp_seat0" + uiPos + "/head");
                //显示地主
                head.getChildByName("touxiang").getChildByName("icon_dzm").active = isLandowner;
                //显示是否加倍
                if (addDoubleList[_i4] == 1) {
                    head.getChildByName("touxiang").getChildByName("img_jb").active = true;
                } else {
                    head.getChildByName("touxiang").getChildByName("img_jb").active = false;
                }
            }
        }
    },

    PlaySetStart: function PlaySetStart(res, setPosCard) {
        for (var i = 0; i < this.playerList.length; i++) {
            var player = this.playerList[i];
            var uiPos = this.GetPlayerPos(player.pos);
            var cardList = setPosCard[player.pos];
            if (uiPos == 0) {
                if (cardList.length == 24) {
                    this.handCards.getComponent(cc.Layout).spacingX = -95;
                } else {
                    this.handCards.getComponent(cc.Layout).spacingX = -90;
                }
                this.ShowSelfCard(cardList);
            } else {
                this.ShowOpenCardList(player.pos, cardList);
                this.GetWndNode("sp_seat0" + uiPos + "/card").active = true;
                this.GetWndNode("sp_seat0" + uiPos + "/cardNum").active = true;
                this.GetWndNode("sp_seat0" + uiPos + "/cardNum").getComponent(cc.Label).string = cardList.length + '张';
            }
        }
    },

    ShowSelfCard: function ShowSelfCard(cardList) {
        this.SortCardByMax(cardList);
        this.handCards.active = true;
        for (var i = 0; i < this.handCards.children.length; i++) {
            var cardNode = this.handCards.children[i];
            var cardValue = cardList[i];
            if (cardValue) {
                this.ShowCard(cardValue, cardNode);
            } else {
                cardNode.active = false;
            }
        }
    },

    ShowOutCard: function ShowOutCard(dataPos, cardList) {
        var uiPos = this.GetPlayerPos(dataPos);
        var pass = this.GetWndNode("sp_seat0" + uiPos + "/pass");
        pass.active = false;
        var outCardNodeList = this.node.getChildByName("outCardList" + uiPos);
        outCardNodeList.active = true;
        for (var i = 0; i < outCardNodeList.children.length; i++) {
            var cardNode = outCardNodeList.children[i];
            var value = cardList[i];
            if (value) {
                this.ShowCard(value, cardNode);
            } else {
                cardNode.active = false;
            }
        }
    },

    ShowOpenCardList: function ShowOpenCardList(dataPos, cardList) {
        var uiPos = this.GetPlayerPos(dataPos);
        if (uiPos == 0) return;
        this.SortCardByMax(cardList);
        var openCardList = this.node.getChildByName("openCardList" + uiPos);
        openCardList.active = true;
        for (var i = 0; i < openCardList.children.length; i++) {
            var cardNode = openCardList.children[i];
            var value = cardList[i];
            if (value) {
                this.ShowCard(value, cardNode);
            } else {
                cardNode.active = false;
            }
        }
        this.GetWndNode("sp_seat0" + uiPos + "/cardNum").getComponent(cc.Label).string = cardList.length + '张';
    },

    SortCardByMax: function SortCardByMax(pokers) {
        pokers.sort(function (a, b) {
            //大小王值最大
            var value_a = a & 0x0F;
            var value_b = b & 0x0F;
            if (value_a == 1) value_a = 16;
            if (value_a == 2) value_a = 17;
            if (value_b == 1) value_b = 16;
            if (value_b == 2) value_b = 17;
            return value_b - value_a;
        });
    },

    OnAniPlayFinished: function OnAniPlayFinished(event) {
        if (event.target.name == 'feiji') {
            this.plane_Ani.active = false;
        } else if (event.target.name == 'zhadan') {
            this.boom_Ani.active = false;
        }
    },

    OnClose: function OnClose() {},

    OnClick: function OnClick(btnName, btnNode) {
        this.fadeOutTime = 5;
        if (btnName == "btn_return") {
            app[app.subGameName + "Client"].ExitGame();
        } else if (btnName == "btnSure") {
            app[app.subGameName + "Client"].ExitGame();
        } else if (btnName == "btn_back") {
            this.OnClickPause();
            if (this.minplay >= this.playkey) {
                return;
            }
            this.playkey = this.playkey - 2; //扣一针,播放完一帧帧数会加一，所有要回到上一帧，帧数要-2
            this.PlayData();
        } else if (btnName == "btn_play") {
            this.OnClickPlay();
        } else if (btnName == "btn_pause") {
            this.OnClickPause();
        } else if (btnName == "btn_forward") {
            this.OnClickPause();
            this.PlayData();
        } else if (btnName == "btn_last") {
            if (this.curTabId <= 1) {
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('当前已经是第一局');
                return;
            }
            this.curTabId--;
            var self = this;
            var sendPack = {};
            sendPack.roomId = this.curRoomID;
            sendPack.tabId = this.curTabId;
            app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GetPlayBackCode", sendPack, function (serverPack) {
                var playDataGame = app[app.subGameName + "_ShareDefine"]().GametTypeID2PinYin[serverPack.gameId];
                if (playDataGame != app.subGameName) {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('获取回放数据不是该游戏的');
                    return;
                }
                self.GetPlayBackDataByCode(serverPack.playBackCode);
            }, function (error) {
                self.curTabId++;
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('获取回放数据失败,检查是否已经是否第一局');
            });
        } else if (btnName == "btn_next") {
            this.curTabId++;
            var _self = this;
            var _sendPack = {};
            _sendPack.roomId = this.curRoomID;
            _sendPack.tabId = this.curTabId;
            app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GetPlayBackCode", _sendPack, function (serverPack) {
                var playDataGame = app[app.subGameName + "_ShareDefine"]().GametTypeID2PinYin[serverPack.gameId];
                if (playDataGame != app.subGameName) {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('获取回放数据不是该游戏的');
                    return;
                }
                _self.GetPlayBackDataByCode(serverPack.playBackCode);
            }, function (error) {
                _self.curTabId--;
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg('获取回放数据失败,检查是否已经是否最后一局');
            });
        } else {
            this.ShowControl();
        }
    },

    OnClickPause: function OnClickPause() {
        this.pause = true;
        this.control_list.getChildByName('btn_play').active = true;
        this.control_list.getChildByName('btn_pause').active = false;
    },

    OnClickPlay: function OnClickPlay() {
        this.pause = false;
        this.control_list.getChildByName('btn_play').active = false;
        this.control_list.getChildByName('btn_pause').active = true;
    },

    HideControl: function HideControl() {
        var action = cc.fadeOut(2.0);
        this.control_list.runAction(action);
    },

    ShowControl: function ShowControl() {
        var action = cc.fadeIn(0.5);
        this.control_list.runAction(action);
    },

    UpdateScoreAndDouble: function UpdateScoreAndDouble(hogScore, roomDouble) {
        if (hogScore != null) {
            this.lb_publicScore.string = hogScore;
        }
        if (roomDouble != null) {
            this.lb_publicMultiple.string = roomDouble;
        }
    },

    //---------计时器，开局发牌逻辑--------------
    OnUpdate: function OnUpdate() {},

    //显示poker牌
    ShowCard: function ShowCard(cardType, cardNode) {
        this.PokerCard.GetPokeCard(cardType, cardNode);
        cardNode.active = true;
        cardNode.getChildByName("poker_back").active = false;
    },

    Str2Json: function Str2Json(jsondata) {
        if (jsondata === "") {
            return false;
        }
        var json = JSON.parse(jsondata);
        return json;
    }

});

cc._RF.pop();