"use strict";
cc._RF.push(module, 'ddz46c30-c194-4d61-9af6-ad1f5a403fae', 'LogicDDZGame');
// script/game/DDZ/room/LogicDDZGame.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var app = require("ddz_app");

var LogicDDZGame = app.BaseClass.extend({
    Init: function Init() {
        this.JS_Name = "LogicDDZGame";

        this.ComTool = app[app.subGameName + "_ComTool"]();
        this.WeChatManager = app[app.subGameName + "_WeChatManager"]();
        this.PokerCard = app[app.subGameName + "_PokerCard"]();
        this.DDZRoomSet = app.DDZRoomSet();
        this.DDZRoom = app.DDZRoom();
        this.DDZDefine = app.DDZDefine();

        //手牌
        this.handCardList = [];
        //选中的牌
        this.selectCardList = [];
        //上一个玩家出牌的牌型
        this.lastCardType = 0;
        //上一个玩家出牌的牌值
        this.latCardList = [];

        this.Log("Init");

        this.pokerType = [0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, //方块 2-A
        0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, //梅花 2-A
        0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, //红桃 2-A
        0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E]; //黑桃 2-A

        this.LOGIC_MASK_COLOR = 0xF0;
        this.LOGIC_MASK_VALUE = 0x0F;
        this.LOGIC_MASK_XIAOWANG = 16;
        this.LOGIC_MASK_DAWANG = 17;

        //打牌类型
        this.DDZ_CARD_TYPE_NOMARL = 0; //默认状态
        this.DDZ_CARD_TYPE_BUCHU = 1; //不出
        this.DDZ_CARD_TYPE_SINGLECARD = 2; //单牌
        this.DDZ_CARD_TYPE_DUIZI = 3; //对子
        this.DDZ_CARD_TYPE_3BUDAI = 4; //3不带
        this.DDZ_CARD_TYPE_3DAI1 = 5; //3带1
        this.DDZ_CARD_TYPE_3DAI2 = 6; //3带2  三张同点牌+一对牌
        this.DDZ_CARD_TYPE_SHUNZI = 7; //顺子
        this.DDZ_CARD_TYPE_LIANDUI = 8; //联队
        this.DDZ_CARD_TYPE_4DAI1 = 9; //4带1 
        this.DDZ_CARD_TYPE_4DAI21 = 10; //4带1对 
        this.DDZ_CARD_TYPE_4DAI2 = 11; //4带2 两个单张
        this.DDZ_CARD_TYPE_4DAI4 = 12; //4带2 两对
        this.DDZ_CARD_TYPE_FEIJI0 = 13; //飞机 不带
        this.DDZ_CARD_TYPE_FEIJI1 = 14; //飞机 三顺带单
        this.DDZ_CARD_TYPE_FEIJI2 = 15; //飞机 三顺带对
        this.DDZ_CARD_TYPE_ZHADAN = 16; //炸弹
    },

    InitHandCard: function InitHandCard() {
        this.handCardList = [];
        this.selectCardList = [];
        this.lastCardType = this.DDZ_CARD_TYPE_NOMARL;
        this.lastCardList = [];

        var handCard = this.DDZRoomSet.GetHandCard();
        for (var i = 0; i < handCard.length; i++) {
            var card = handCard[i];
            this.handCardList.push(card);
        }

        this.SortCardByMax(this.handCardList);
        this.TransformValueToC(this.handCardList);
    },

    //取消选牌
    ClearSelectCard: function ClearSelectCard() {
        this.InitHandCard();
        app[app.subGameName + "Client"].OnEvent("HandCard");
    },

    //如果服务端发过来的牌值有重复，转换成唯一
    TransformValueToC: function TransformValueToC(pokers) {
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var count = 0;
            for (var j = i; j < pokers.length; j++) {
                if (poker == pokers[j]) {
                    count++;
                }
                if (count >= 2) {
                    pokers[j] = pokers[j] + 500;
                    break;
                }
            }
        }
    },

    //还原客户端转过的牌值
    TransformValueToS: function TransformValueToS(pokers) {
        for (var i = 0; i < pokers.length; i++) {
            if (pokers[i] > 500) {
                pokers[i] = pokers[i] - 500;
            }
        }
    },

    SortCardByMax: function SortCardByMax(pokers) {
        var self = this;
        pokers.sort(function (a, b) {
            //return (b&0x0F) - (a&0x0F);
            return self.GetCardValue(b) - self.GetCardValue(a);
        });
    },

    SortCardByMinEx: function SortCardByMinEx(pokers) {
        var self = this;
        pokers.sort(function (a, b) {
            //return (a&0x0F) - (b&0x0F);
            return self.GetCardValue(a) - self.GetCardValue(b);
        });
    },

    SortCardByMin: function SortCardByMin(pokers) {
        var self = this;
        pokers.sort(function (a, b) {
            var aValue = a[0];
            var bValue = b[0];
            //return (aValue&0x0F) - (bValue&0x0F);
            return self.GetCardValue(aValue) - self.GetCardValue(bValue);
        });
    },

    OutPokerCard: function OutPokerCard(cardList) {
        if (!cardList.length) {
            return;
        }
        //删除handcardlist和selectCardList中的元素
        for (var i = 0; i < cardList.length; i++) {
            var value = cardList[i];
            var pos = this.handCardList.indexOf(value + 500);
            if (pos != -1) {
                this.handCardList.splice(pos, 1);
            } else {
                var pos1 = this.handCardList.indexOf(value);
                if (pos1 != -1) {
                    this.handCardList.splice(pos1, 1);
                }
            }

            var cardPos = this.selectCardList.indexOf(value);
            if (cardPos != -1) {
                this.selectCardList.splice(cardPos, 1);
            }
        }
        console.log("selectCardList == " + this.selectCardList);
        app[app.subGameName + "Client"].OnEvent("HandCard");
    },

    GetHandCard: function GetHandCard() {
        return this.handCardList;
    },

    GetSelectCard: function GetSelectCard() {
        return this.selectCardList;
    },

    ChangeSelectCard: function ChangeSelectCard(cardList) {
        this.selectCardList = [];
        this.selectCardList = cardList;
    },

    SetCardSelected: function SetCardSelected(cardIdx) {
        var cardType = this.handCardList[cardIdx - 1];
        this.selectCardList.push(cardType);
        console.log("selectCardList == " + this.selectCardList);
    },

    DeleteCardSelected: function DeleteCardSelected(cardIdx) {
        var cardType = this.handCardList[cardIdx - 1];
        var pos = this.selectCardList.indexOf(cardType);
        if (pos != -1) {
            this.selectCardList.splice(pos, 1);
        }
        console.log("selectCardList111 == " + this.selectCardList);
    },

    SetCardData: function SetCardData(opCardType, cardList) {
        if (opCardType == this.DDZ_CARD_TYPE_BUCHU || !cardList.length) {
            return;
        }

        if (this.lastCardType == this.DDZ_CARD_TYPE_NOMARL || opCardType == this.DDZ_CARD_TYPE_ZHADAN) {
            this.lastCardType = opCardType;
        }

        console.log("this.lastCardTyp ==" + this.lastCardType);
        this.lastCardList = cardList;
    },


    ClearCardData: function ClearCardData() {
        this.lastCardType = this.DDZ_CARD_TYPE_NOMARL;
        this.lastCardList = [];
    },

    GetLastCardType: function GetLastCardType() {
        return this.lastCardType;
    },

    //检查组合是否只有炸弹
    CheckOnlyBoom: function CheckOnlyBoom(list) {
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var sameCard = this.GetSameValue(item, item[0]);
            if (sameCard.length != item.length) return false;
        }
        return true;
    },

    CheckOneCard: function CheckOneCard() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        if (pokers.length != 1) return false;
        var lastCardValue = 0;
        var myCardValue = 0;

        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        myCardValue = this.GetCardValue(pokers[0]);

        if (lastCardValue && lastCardValue != 0) {
            if (this.lastCardList.length != pokers.length) return false;
            if (myCardValue > lastCardValue) {
                return true;
            }
            return false;
        }

        return true;
    },

    CheckDuizi: function CheckDuizi() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        if (pokers.length != 2) return false;

        var lastCardValue = 0;
        var myCardValue = 0;
        var bDui = false;

        lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var duizi = this.GetSameValue(pokers, poker);
            if (duizi.length == 2) {
                myCardValue = this.GetCardValue(poker);
                bDui = true;
                break;
            }
        }

        if (lastCardValue && lastCardValue != 0) {
            if (this.lastCardList.length != pokers.length) return false;

            if (myCardValue > lastCardValue) {
                return true;
            }
            return false;
        }

        if (bDui) return true;
        return false;
    },

    CheckShunzi: function CheckShunzi() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        if (pokers.length < 5) return false;

        var lastCardValue = 0;
        var myCardValue = 0;

        this.SortCardByMax(this.lastCardList);
        this.SortCardByMax(pokers);

        var lastValue = 0;
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var nowValue = this.GetCardValue(poker);

            if (nowValue == 15) {
                return false;
            }

            if (lastValue != 0) {
                if (lastValue - nowValue != 1) return false;
            }

            lastValue = nowValue;
        }

        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        myCardValue = this.GetCardValue(pokers[0]);

        if (lastCardValue && lastCardValue != 0) {
            if (this.lastCardList.length != pokers.length) return false;

            if (myCardValue > lastCardValue) {
                return true;
            }
            return false;
        }

        return true;
    },

    //如果最后首发只有三带 可以不带牌出
    CheckLastThree: function CheckLastThree(tag, lastCard) {
        // if(this.lastCardType == 0){
        //     if(this.selectCardList.length != lastCard ||
        //         this.handCardList.length != lastCard) return false;

        //     let isCheck = false;
        //     for(let i = 0; i < this.selectCardList.length; i++){
        //         let poker = this.selectCardList[i];
        //         let samePoker = this.GetSameValue(this.selectCardList, poker);
        //         if(samePoker.length >= tag){
        //             isCheck = true;
        //             break;
        //         }
        //     }
        //     if(isCheck && this.selectCardList.length == lastCard && this.handCardList.length == lastCard){
        //         return true;
        //     }
        // }
        return false;
    },

    CheckSanDaiSiDai: function CheckSanDaiSiDai(tag) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var handPokers = this.handCardList;
        if (pokers.length < 3) return false;
        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_3DAI1) {
            //没有勾选三带一玩法
            return false;
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_3DAI2) {
            //没有勾选三带二玩法
            return false;
        }
        var sidai = this.DDZRoom.GetRoomConfigByProperty("sidai");
        if (sidai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_4DAI2) {
            //没有勾选四带2单张玩法
            return false;
        }
        if (sidai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_4DAI4) {
            //没有勾选四带二对玩法
            return false;
        }
        if (sidai.indexOf(2) < 0 && tag == this.DDZ_CARD_TYPE_4DAI1) {
            //没有勾选四带1单张玩法
            return false;
        }
        if (sidai.indexOf(3) < 0 && tag == this.DDZ_CARD_TYPE_4DAI21) {
            //没有勾选四带一对玩法
            return false;
        }
        var lastCardValue = 0;
        var myCardValue = 0;
        var tempArrA = [];
        var tempArrB = [];

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var samePoker = this.GetSameValue(this.lastCardList, poker);
            if (tag >= this.DDZ_CARD_TYPE_3BUDAI && tag <= this.DDZ_CARD_TYPE_3DAI2) {
                if (samePoker.length >= 3) {
                    this.RegularCard(tempArrA, samePoker, 3);
                    //tempArrA = samePoker;
                    break;
                }
            } else if (tag >= this.DDZ_CARD_TYPE_4DAI2 && tag <= this.DDZ_CARD_TYPE_4DAI4) {
                if (samePoker.length >= 4) {
                    this.RegularCard(tempArrA, samePoker, 4);
                    //tempArrA = samePoker;
                    break;
                }
            }
        }

        for (var _i = 0; _i < pokers.length; _i++) {
            var _poker = pokers[_i];
            var _samePoker = this.GetSameValue(pokers, _poker);
            if (tag >= this.DDZ_CARD_TYPE_3BUDAI && tag <= this.DDZ_CARD_TYPE_3DAI2) {
                if (_samePoker.length >= 3) {
                    this.RegularCard(tempArrB, _samePoker, 3);
                    //tempArrB = samePoker;
                    break;
                }
            } else if (tag >= this.DDZ_CARD_TYPE_4DAI2 && tag <= this.DDZ_CARD_TYPE_4DAI4) {
                if (_samePoker.length >= 4) {
                    this.RegularCard(tempArrB, _samePoker, 4);
                    //tempArrB = samePoker;
                    break;
                }
            }
        }
        if (tempArrA.length) {
            lastCardValue = this.GetCardValue(tempArrA[0][0]);
        }

        if (tempArrB.length) {
            myCardValue = this.GetCardValue(tempArrB[0][0]);
        }

        var daiCardList = this.GetDaiPaiList(pokers, tempArrB);

        //如果带的牌有王炸，不能出
        var guipai = 0;
        for (var _i2 = 0; _i2 < daiCardList.length; _i2++) {
            if (this.GetCardValue(daiCardList[_i2]) == this.LOGIC_MASK_XIAOWANG || this.GetCardValue(daiCardList[_i2]) == this.LOGIC_MASK_DAWANG) {
                guipai++;
            }
        }
        if (guipai >= 2) {
            return false;
        }

        if (lastCardValue && lastCardValue != 0) {
            if (this.lastCardList.length != pokers.length) return false;
            if (tag == this.DDZ_CARD_TYPE_3DAI2 && !this.CheckTagIsDuizi(daiCardList)) {
                return false;
            }
            if (tag == this.DDZ_CARD_TYPE_4DAI21 && !this.CheckTagIsDuizi(daiCardList)) {
                return false;
            }
            if (tag == this.DDZ_CARD_TYPE_4DAI4 && !this.CheckTagIsDuizi(daiCardList)) {
                return false;
            }
            if (myCardValue > lastCardValue) {
                return true;
            }
            return false;
        }
        if (tempArrB.length) {
            if (tag == this.DDZ_CARD_TYPE_3BUDAI) {
                if (pokers.length == 3) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_3DAI1) {
                if (pokers.length == 4) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_3DAI2) {
                if (pokers.length == 5 && this.CheckTagIsDuizi(daiCardList)) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_4DAI1) {
                if (pokers.length == 5) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_4DAI21) {
                if (pokers.length == 6 && this.CheckTagIsDuizi(daiCardList)) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_4DAI2) {
                if (pokers.length == 6) {
                    return true;
                }
            } else if (tag == this.DDZ_CARD_TYPE_4DAI4) {
                if (pokers.length == 8 && this.CheckTagIsDuizi(daiCardList)) {
                    return true;
                }
            }
        }
        return false;
    },

    IsZhadan: function IsZhadan(pokers) {
        var temp = [];
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var zhadan = this.GetSameValue(pokers, poker);
            if (zhadan.length >= 4) {
                temp = zhadan;
                break;
            }
        }
        //是否是王炸
        if (pokers.length == 2) {
            var cardValue_1 = this.GetCardValue(pokers[0]);
            var cardValue_2 = this.GetCardValue(pokers[1]);
            if (cardValue_1 == 16 && cardValue_2 == 17) return true;
            if (cardValue_2 == 16 && cardValue_1 == 17) return true;
        }
        if (pokers.length) {
            if (pokers.length - temp.length == 0) {
                return true;
            }
        }
        return false;
    },

    CheckZhaDan: function CheckZhaDan() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }

        var lastCardValue = 0;
        var myCardValue = 0;

        if (this.IsZhadan(this.lastCardList)) {
            lastCardValue = this.GetCardValue(this.lastCardList[0]);
        }

        if (this.IsZhadan(pokers)) {
            if (lastCardValue == 0) return true;
            myCardValue = this.GetCardValue(pokers[0]);
        } else {
            return false;
        }

        //王炸最大
        if (myCardValue == 16 || myCardValue == 17) {
            return true;
        }

        //先比较牌值再比较张数
        if (myCardValue > lastCardValue) {
            if (pokers.length >= this.lastCardList.length) {
                return true;
            }
        } else if (myCardValue <= lastCardValue) {
            if (pokers.length > this.lastCardList.length) {
                return true;
            }
        }

        return false;
    },

    IsLianShun: function IsLianShun(pokers) {
        if (pokers.length < 2) return false;

        this.SortCardByMin(pokers);

        var lastValue = 0;
        for (var i = 0; i < pokers.length; i++) {
            var item = pokers[i];
            var nowValue = this.GetCardValue(item[0]);

            if (nowValue == 15) {
                return false;
            }

            if (lastValue != 0) {
                if (lastValue + 1 != nowValue) return false;
            }

            lastValue = nowValue;
        }

        return true;
    },

    //如果有超过tag只取tag数量的牌
    RegularCard: function RegularCard(pokers, list, tag) {
        var temp = [];
        for (var i = 0; i < list.length; i++) {
            if (temp.length == tag) break;
            temp.push(list[i]);
        }
        //如果已经在pokers列表里，无需重复计算
        var isHasArr = false;
        for (var _i3 = 0; _i3 < pokers.length; _i3++) {
            //判断数组是否相等需要排序后转字符串
            if (pokers[_i3].sort().toString() == temp.sort().toString()) {
                isHasArr = true;
                break;
            }
        }
        if (!isHasArr) {
            pokers[pokers.length] = temp;
        }
    },

    GetDaiNum: function GetDaiNum() {
        return this.daiNum;
    },

    CheckFeiJi: function CheckFeiJi(tag) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var handPokers = this.handCardList;
        if (pokers.length < 6) return false;
        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return false;
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return false;
        }
        var lastCardValue = 0;
        var myCardValue = 0;
        var tempArrA = [];
        var tempArrB = [];

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var santiao = this.GetSameValue(this.lastCardList, poker);
            var bInList = this.CheckPokerInListEx(tempArrA, poker);
            if (santiao.length >= 3 && !bInList) {
                this.RegularCard(tempArrA, santiao, 3);
            }
        }

        for (var _i4 = 0; _i4 < pokers.length; _i4++) {
            var _poker2 = pokers[_i4];
            var _santiao = this.GetSameValue(pokers, _poker2);
            var _bInList = this.CheckPokerInListEx(tempArrB, _poker2);
            if (_santiao.length >= 3 && !_bInList && this.GetCardValue(_poker2) != 15) {
                this.RegularCard(tempArrB, _santiao, 3);
            }
        }

        if (tempArrA.length) {
            var realPlaneA = this.GetRealPlane(tempArrA);
            lastCardValue = this.GetCardValue(realPlaneA[0][0]);
        }

        if (tempArrB.length < 2) return false;

        this.SortCardByMin(tempArrB);

        var realPlane = this.GetRealPlane(tempArrB);

        if (!realPlane.length) return false;

        myCardValue = this.GetCardValue(realPlane[0][0]);

        var value = pokers.length - realPlane.length * 3;
        this.daiNum = value;
        var daiPaiList = this.GetDaiPaiList(pokers, realPlane);
        //如果带的牌有王炸，不能出
        var guipai = 0;
        for (var _i5 = 0; _i5 < daiPaiList.length; _i5++) {
            if (this.GetCardValue(daiPaiList[_i5]) == this.LOGIC_MASK_XIAOWANG || this.GetCardValue(daiPaiList[_i5]) == this.LOGIC_MASK_DAWANG) {
                guipai++;
            }
        }
        if (guipai >= 2) {
            return false;
        }
        //检测下飞机内是否有炸弹，如果有炸弹不能出
        // for(let i=0; i < pokers.length; i++){
        //     let poker = pokers[i];
        //     let zhadan = this.GetSameValue(pokers, poker);
        //     if(zhadan.length >= 4){
        //         return false;
        //     }
        // }
        if (tag == this.DDZ_CARD_TYPE_FEIJI0) {
            if (value == 0) {
                if (lastCardValue && lastCardValue != 0) {
                    if (myCardValue > lastCardValue) {
                        return true;
                    }
                    return false;
                }
                return true;
            }
        } else if (tag == this.DDZ_CARD_TYPE_FEIJI1) {
            if (value == realPlane.length) {
                if (lastCardValue && lastCardValue != 0) {
                    if (myCardValue > lastCardValue) {
                        return true;
                    }
                    return false;
                }
                return true;
            }
            // else if (handPokers.length < (realPlane.length*3 + realPlane.length)
            //     && handPokers.length == pokers.length) {
            //     //如果手牌少于需要带的牌数并且轮到本家出牌则返回true
            //     return true;
            // }
        } else if (tag == this.DDZ_CARD_TYPE_FEIJI2) {
            if (realPlane.length == 3 && value == 1) {
                //三飞机带单根,可以组成  444,555 带 3333
                var isHasZhadan = false;
                for (var _i6 = 0; _i6 < pokers.length; _i6++) {
                    var _poker3 = pokers[_i6];
                    var zhadan = this.GetSameValue(pokers, _poker3);
                    if (zhadan.length >= 4) {
                        isHasZhadan = true;
                        break;
                    }
                }
                if (isHasZhadan) {
                    return true;
                }
            } else if (realPlane.length == 4 && value == 3) {
                //三飞机带单根,可以组成  444,555,666 带 3333 77
                var _isHasZhadan = false;
                var isHasDuiZi = false;
                for (var _i7 = 0; _i7 < pokers.length; _i7++) {
                    var _poker4 = pokers[_i7];
                    var _zhadan = this.GetSameValue(pokers, _poker4);
                    if (_zhadan.length >= 4) {
                        _isHasZhadan = true;
                        break;
                    } else if (_zhadan.length == 2) {
                        // 并且还有一个对子
                        isHasDuiZi = true;
                    }
                }
                if (_isHasZhadan && isHasDuiZi) {
                    return true;
                }
            } else if (value == realPlane.length * 2 && this.CheckTagIsDuizi(daiPaiList)) {
                if (lastCardValue && lastCardValue != 0) {
                    if (myCardValue > lastCardValue) {
                        return true;
                    }
                    return false;
                }
                return true;
            }
            // else if (handPokers.length < (realPlane.length*3 + realPlane.length*2)
            //     && handPokers.length == pokers.length) {
            //     //如果手牌少于需要带的牌数并且轮到本家出牌则返回true
            //     return true;
            // }
        }
        return false;
    },

    CheckLianDui: function CheckLianDui() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        if (pokers.length < 6) return false;
        if (pokers.length % 2 == 1) return false;

        var lastCardValue = 0;
        var myCardValue = 0;
        var tempArrA = [];
        var tempArrB = [];

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var duizi = this.GetSameValue(this.lastCardList, poker);
            var bInList = this.CheckPokerInList(tempArrA, poker);
            if (duizi.length == 2 && !bInList) {
                tempArrA[tempArrA.length] = duizi;
            }
        }

        for (var _i8 = 0; _i8 < pokers.length; _i8++) {
            var _poker5 = pokers[_i8];
            var _duizi = this.GetSameValue(pokers, _poker5);
            var _bInList2 = this.CheckPokerInList(tempArrB, _poker5);
            if (_duizi.length == 2 && !_bInList2) {
                tempArrB[tempArrB.length] = _duizi;
            }
        }

        if (tempArrB.length * 2 != pokers.length) return false;

        if (this.IsLianShun(tempArrA)) {
            lastCardValue = this.GetCardValue(tempArrA[0][0]);
        }

        if (this.IsLianShun(tempArrB)) {
            myCardValue = this.GetCardValue(tempArrB[0][0]);
        } else {
            return false;
        }

        if (lastCardValue && lastCardValue != 0) {
            if (pokers.length - this.lastCardList.length == 0) {
                if (myCardValue > lastCardValue) {
                    return true;
                }
            }
            return false;
        }
        return true;
    },

    //检查顺子是不是一条龙
    CheckDragon: function CheckDragon() {
        var pokers = this.lastCardList;
        if (pokers.length != 12) return false;

        this.SortCardByMinEx(pokers);

        var lastValue = 0;
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var nowValue = this.GetCardValue(poker);
            if (nowValue == lastValue) return false;

            if (nowValue == 15) return false;

            if (lastValue != 0) {
                if (nowValue - lastValue != 1) return false;
            }

            lastValue = nowValue;
        }

        return true;
    },
    IsHaveBoom: function IsHaveBoom() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        //先判断是否有王炸
        var wangzhaList = [];
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var zhadan = this.GetSameValue(pokers, poker);
            if (zhadan.length >= 4) {
                return true;
            }
            if (this.GetCardValue(pokers[i]) == 16 || this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }
        if (wangzhaList.length == 2) {
            return true;
        }
        return false;
    },

    IsHaveWangZhaOrBoom: function IsHaveWangZhaOrBoom() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        //先判断是否有王炸
        var wangzhaList = [];
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var zhadan = this.GetSameValue(pokers, poker);
            if (this.GetCardValue(pokers[i]) == 16 || this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
            if (this.GetCardValue(pokers[i]) != 15) {
                continue;
            }
            if (zhadan.length >= 4) {
                return true;
            }
        }
        if (wangzhaList.length == 2) {
            return true;
        }
        return false;
    },

    IsDismantleBoom: function IsDismantleBoom() {
        var pokers = this.handCardList;
        if (this.CheckZhaDan()) {
            return false;
        }
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            if (this.selectCardList.indexOf(poker) != -1) {
                var zhadan = this.GetSameValue(pokers, poker);
                if (zhadan.length >= 4) {
                    return true;
                }
            }
        }

        return false;
    },

    GetCardType: function GetCardType() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:4带1 9:4带2 10:4带3 
        //11:炸弹 12:飞机带单 13:飞机带对 14:连对
        this.daiNum = 0;

        if (isSelectCard && !this.selectCardList.length) {
            return 0;
        }

        var bCheck = false;

        if (this.CheckZhaDan(isSelectCard)) {
            return this.DDZ_CARD_TYPE_ZHADAN;
        }

        if (this.lastCardType == 0) {
            if (this.CheckOneCard(isSelectCard)) {
                return this.DDZ_CARD_TYPE_SINGLECARD;
            } else if (this.CheckDuizi(isSelectCard)) {
                return this.DDZ_CARD_TYPE_DUIZI;
            } else if (this.CheckShunzi(isSelectCard)) {
                return this.DDZ_CARD_TYPE_SHUNZI;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI1, isSelectCard)) {
                return this.DDZ_CARD_TYPE_4DAI1;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI21, isSelectCard)) {
                return this.DDZ_CARD_TYPE_4DAI21;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI4, isSelectCard)) {
                return this.DDZ_CARD_TYPE_4DAI4;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI2, isSelectCard)) {
                return this.DDZ_CARD_TYPE_4DAI2;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3DAI2, isSelectCard)) {
                return this.DDZ_CARD_TYPE_3DAI2;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3DAI1, isSelectCard)) {
                return this.DDZ_CARD_TYPE_3DAI1;
            } else if (this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3BUDAI, isSelectCard)) {
                return this.DDZ_CARD_TYPE_3BUDAI;
            } else if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI0, isSelectCard)) {
                return this.DDZ_CARD_TYPE_FEIJI0;
            } else if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1, isSelectCard)) {
                return this.DDZ_CARD_TYPE_FEIJI1;
            } else if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI2, isSelectCard)) {
                return this.DDZ_CARD_TYPE_FEIJI2;
            } else if (this.CheckLianDui(isSelectCard)) {
                return this.DDZ_CARD_TYPE_LIANDUI;
            } else {
                return 0;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD) {
            if (this.CheckOneCard(isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_DUIZI) {
            if (this.CheckDuizi(isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI) {
            if (this.CheckShunzi(isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI || this.lastCardType == this.DDZ_CARD_TYPE_3DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_3DAI2 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI21 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI2 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI4) {
            if (this.CheckSanDaiSiDai(this.lastCardType, isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0) {
            if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI0, isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1) {
            if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1, isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2) {
            if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI2, isSelectCard)) {
                bCheck = true;
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI) {
            if (this.CheckLianDui(isSelectCard)) {
                bCheck = true;
            }
        }

        if (bCheck) {
            return this.lastCardType;
        }

        return 0;
    },
    //特殊牌有多种牌型检测
    GetAllCardTypeBySpc: function GetAllCardTypeBySpc() {
        if (!this.selectCardList.length) {
            return [];
        }
        var allCardType = [];
        if (this.lastCardType == 0) {
            var razzSanDaiSiDaiList = this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI4);
            if (razzSanDaiSiDaiList) {
                var razzSanDaiSiDaiObj = { "realCardList": this.selectCardList, "cardType": this.DDZ_CARD_TYPE_4DAI4 };
                allCardType.push(razzSanDaiSiDaiObj);
            }
            var razzFeiJiList = this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1);
            if (razzFeiJiList) {
                var razzFeiJiObj = { "realCardList": this.selectCardList, "cardType": this.DDZ_CARD_TYPE_FEIJI1 };
                allCardType.push(razzFeiJiObj);
            }
            return allCardType;
        }
        return allCardType;
    },
    //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:4带1 9:4带2 10:4带3 
    //11:炸弹 12:三带飞机 13:四带飞机 14:连对
    GetTipCardSlCard: function GetTipCardSlCard() {
        var array = [];
        if (this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD) {
            array = this.GetOneCardTip(true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_DUIZI) {
            array = this.GetDuiziTip(true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI) {
            array = this.GetShunziTip(true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI || this.lastCardType == this.DDZ_CARD_TYPE_3DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_3DAI2) {
            array = this.GetSanDaiTip(this.lastCardType, true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI2 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI4 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI21) {
            array = this.GetSiDaiTip(this.lastCardType, true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_ZHADAN) {
            array = this.GetZhaDan(true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0) {
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI0, true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1) {
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI1, true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2) {
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI2, true);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI) {
            array = this.GetLianDuiTip(true);
        } else if (this.lastCardType == 0) {
            //随意出牌
            array.push.apply(array, this.GetOneCardTip(true));
            array.push.apply(array, this.GetDuiziTip(true));
            array.push.apply(array, this.GetShunziTip(true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3BUDAI, true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3DAI1, true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3DAI2, true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI2, true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI4, true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI1, true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI21, true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI0, true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI1, true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI2, true));
            array.push.apply(array, this.GetLianDuiTip(true));
            array.push.apply(array, this.GetZhaDanTip(true));
        }
        if (array.length > 0) {
            array.sort(this.SortByLength);
        }
        return array;
    },
    SortByLength: function SortByLength(a, b) {
        if (a.length > b.length) {
            return -1;
        }
        return 1;
    },
    GetTipCard: function GetTipCard() {
        var array = [];
        if (this.lastCardType == this.DDZ_CARD_TYPE_NOMARL) {
            var setInfo = this.DDZRoomSet.GetRoomSetInfo();
            this.SetCardData(setInfo.opType, setInfo.cardList);
            this.lastCardType = setInfo.opType;
            this.lastCardList = setInfo.cardList;
        }
        if (this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD) {
            array = this.GetOneCard();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_DUIZI) {
            array = this.GetDuizi();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI) {
            array = this.GetShunzi();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI || this.lastCardType == this.DDZ_CARD_TYPE_3DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_3DAI2) {
            array = this.GetSanDai();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI2 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI4 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI1 || this.lastCardType == this.DDZ_CARD_TYPE_4DAI21) {
            array = this.GetSiDai();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_ZHADAN) {
            array = this.GetZhaDan();
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0) {
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI0);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1) {
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI1);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2) {
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI2);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI) {
            array = this.GetLianDui();
        }
        return array;
    },

    CheckSelected: function CheckSelected(cardValue) {
        if (-1 == this.selectCardList.indexOf(cardValue)) {
            return false;
        }
        return true;
    },

    //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:飞机不带 9:4带2 10:4带3 
    //11:炸弹 12:飞机带单 13:飞机带对 14:连对
    GetZhaDan: function GetZhaDan() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var zhadans = [];

        var lastCardValue = 0;
        lastCardValue = this.GetCardValue(this.lastCardList[0]);

        //先判断是否有王炸
        var wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 || this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }

        for (var _i9 = pokers.length - 1; _i9 >= 0; _i9--) {
            var poker = pokers[_i9];
            var zhadan = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(zhadans, poker);
            if (zhadan.length > 4 && !bInList) {
                zhadans[zhadans.length] = zhadan;
            } else if (zhadan.length == 4 && !bInList && this.GetCardValue(zhadan[0]) > lastCardValue) {
                zhadans[zhadans.length] = zhadan;
            }
        }

        return zhadans;
    },

    GetZhaDanTip: function GetZhaDanTip() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var zhadans = [];

        //先判断是否有王炸
        var wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 || this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }

        for (var _i10 = pokers.length - 1; _i10 >= 0; _i10--) {
            var poker = pokers[_i10];
            var zhadan = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(zhadans, poker);
            if (zhadan.length > 4 && !bInList) {
                zhadans[zhadans.length] = zhadan;
            } else if (zhadan.length == 4 && !bInList) {
                zhadans[zhadans.length] = zhadan;
            }
        }

        return zhadans;
    },

    GetZhaDanEx: function GetZhaDanEx(array) {
        var pokers = this.handCardList;
        var zhadans = [];
        var arrLen = array.length; //先记录下原来数组的长度，方便后续插入王炸炸弹

        //先判断是否有王炸
        var wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 || this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }

        for (var _i11 = 0; _i11 < pokers.length; _i11++) {
            var poker = pokers[_i11];
            var zhadan = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(zhadans, poker);
            if (zhadan.length >= 4 && !bInList) {
                zhadans[zhadans.length] = zhadan;
            }
        }
        var wangzha = [];
        for (var _i12 = zhadans.length - 1; _i12 >= 0; _i12--) {
            var item = zhadans[_i12];
            //对炸弹进行排序，从最小炸弹开始，王炸是最大的炸弹
            if (item.length == 2) {
                wangzha = item;
            } else {
                array.push(item);
            }
        }
        if (wangzha.length > 0) {
            array.push(wangzha);
        }
    },

    PushTipCard: function PushTipCard(pokers, samePoker, len) {
        var temp = [];
        samePoker.reverse();
        for (var i = 0; i < len; i++) {
            temp.push(samePoker[i]);
        }

        pokers.push(temp);
    },

    GetOneCardTip: function GetOneCardTip() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var array = [];
        var chai = [];

        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            var sameValue = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(chai, poker);
            if (sameValue.length == 1) {
                this.PushTipCard(array, sameValue, 1);
            } else if (sameValue.length > 1 && !bInList) {
                this.PushTipCard(chai, sameValue, 1);
            }
        }
        array.push.apply(array, chai);
        return array;
    },

    GetOneCard: function GetOneCard() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var array = [];
        var chai = [];

        var lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            if (cardValue <= lastCardValue) continue;
            var sameValue = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(chai, poker);
            if (sameValue.length == 1) {
                this.PushTipCard(array, sameValue, 1);
            } else if (sameValue.length > 1 && !bInList) {
                this.PushTipCard(chai, sameValue, 1);
            }
        }
        array.push.apply(array, chai);
        this.GetZhaDanEx(array);
        return array;
    },

    GetDuiziTip: function GetDuiziTip() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var duizis = [];
        var chai = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            var duizi = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(duizis, poker);
            var bInListEx = this.CheckPokerInListEx(chai, poker);
            if (duizi.length == 2 && !bInList) {
                this.PushTipCard(duizis, duizi, 2);
            } else if (duizi.length > 2 && !bInListEx) {
                this.PushTipCard(chai, duizi, 2);
            }
        }
        duizis.push.apply(duizis, chai);
        return duizis;
    },

    GetDuizi: function GetDuizi() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var duizis = [];
        var chai = [];
        if (pokers.length < this.lastCardList.length) return [];

        var lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            if (cardValue <= lastCardValue) continue;
            var duizi = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(duizis, poker);
            var bInListEx = this.CheckPokerInListEx(chai, poker);
            if (duizi.length == 2 && !bInList) {
                this.PushTipCard(duizis, duizi, 2);
            } else if (duizi.length > 2 && !bInListEx) {
                this.PushTipCard(chai, duizi, 2);
            }
        }
        duizis.push.apply(duizis, chai);
        this.GetZhaDanEx(duizis);
        return duizis;
    },

    GetShunziTip: function GetShunziTip() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        this.SortCardByMax(pokers);
        var array = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            var lastValue = 0;
            var shunzi = [];
            shunzi.push(pokers[i]);
            for (var j = i; j >= 0; j--) {
                var poker = pokers[j];
                var nowValue = this.GetCardValue(poker);
                if (nowValue == lastValue) continue;
                if (nowValue == 15) {
                    break;
                }
                if (lastValue != 0) {
                    if (nowValue - lastValue != 1) {
                        break;
                    }
                    shunzi.push(poker);
                }
                lastValue = nowValue;
                if (shunzi.length >= 5) {
                    array[array.length] = shunzi;
                }
            }
        }
        return array;
    },

    GetShunzi: function GetShunzi() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
            this.SortCardByMinEx(pokers);
        }
        var array = [];
        // if(pokers.length < this.lastCardList.length) return [];
        this.SortCardByMinEx(this.lastCardList);
        var lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for (var i = pokers.length - 1; i >= 0; i--) {
            var lastValue = 0;
            var shunzi = [];
            shunzi.push(pokers[i]);
            for (var j = i; j >= 0; j--) {
                var poker = pokers[j];
                var nowValue = this.GetCardValue(poker);

                if (nowValue == lastValue) continue;

                if (nowValue <= lastCardValue) {
                    break;
                }
                if (nowValue == 15) {
                    break;
                }
                if (lastValue != 0) {
                    if (nowValue - lastValue != 1) break;
                    shunzi.push(poker);
                }

                if (shunzi.length >= this.lastCardList.length) {
                    array[array.length] = shunzi;
                    break;
                }
                lastValue = nowValue;
            }
        }
        this.GetZhaDanEx(array);
        return array;
    },
    GetSanDaiTip: function GetSanDaiTip(lastCardType) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var santiaos = [];
        var chai = [];

        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            var santiao = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(santiaos, poker);
            var bInListEx = this.CheckPokerInListEx(chai, poker);
            if (santiao.length == 3 && !bInList) {
                this.PushTipCard(santiaos, santiao, 3);
            } else if (santiao.length > 3 && !bInListEx) {
                this.PushTipCard(chai, santiao, 3);
            }
        }

        this.SortCardByMin(santiaos);
        this.SortCardByMin(chai);

        santiaos.push.apply(santiaos, chai);
        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (lastCardType == this.DDZ_CARD_TYPE_3BUDAI) {
            this.GetOtherCard(santiaos, 0, false, true);
        } else if (lastCardType == this.DDZ_CARD_TYPE_3DAI1) {
            if (sandai.indexOf(0) >= 0) {
                //勾选三带一玩法
                this.GetOtherCard(santiaos, 1, false, true);
            }
        } else if (lastCardType == this.DDZ_CARD_TYPE_3DAI2) {
            if (sandai.indexOf(1) >= 0) {
                //勾选三带二玩法
                this.GetOtherCard(santiaos, 2, true, true);
            }
        }
        return santiaos;
    },
    GetSanDai: function GetSanDai() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var santiaos = [];
        var chai = [];
        // if(pokers.length < this.lastCardList.length) return [];

        var lastCardValue = 0;

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var santiao = this.GetSameValue(this.lastCardList, poker);
            if (santiao.length >= 3) {
                lastCardValue = this.GetCardValue(santiao[0]);
                break;
            }
        }

        for (var _i13 = 0; _i13 < pokers.length; _i13++) {
            var _poker6 = pokers[_i13];
            var cardValue = this.GetCardValue(_poker6);
            if (cardValue <= lastCardValue) continue;
            var _santiao2 = this.GetSameValue(pokers, _poker6);
            var bInList = this.CheckPokerInListEx(santiaos, _poker6);
            var bInListEx = this.CheckPokerInListEx(chai, _poker6);
            if (_santiao2.length == 3 && !bInList) {
                this.PushTipCard(santiaos, _santiao2, 3);
            } else if (_santiao2.length > 3 && !bInListEx) {
                this.PushTipCard(chai, _santiao2, 3);
            }
        }

        this.SortCardByMin(santiaos);
        this.SortCardByMin(chai);

        santiaos.push.apply(santiaos, chai);
        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI) {
            this.GetOtherCard(santiaos, 0, false);
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_3DAI1) {
            if (sandai.indexOf(0) >= 0) {
                //勾选三带一玩法
                this.GetOtherCard(santiaos, 1, false);
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_3DAI2) {
            if (sandai.indexOf(1) >= 0) {
                //勾选三带二玩法
                this.GetOtherCard(santiaos, 2, true);
            }
        }
        this.GetZhaDanEx(santiaos);
        return santiaos;
    },

    GetSiDaiTip: function GetSiDaiTip(lastCardType) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var zhadans = [];
        var chai = [];

        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var cardValue = this.GetCardValue(poker);
            var zhadan = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(zhadans, poker);
            var bInListEx = this.CheckPokerInListEx(chai, poker);
            if (zhadan.length == 4 && !bInList) {
                this.PushTipCard(zhadans, zhadan, 4);
            } else if (zhadan.length > 4 && !bInListEx) {
                this.PushTipCard(chai, zhadan, 4);
            }
        }

        zhadans.push.apply(zhadans, chai);
        //判断玩法
        var sidai = this.DDZRoom.GetRoomConfigByProperty("sidai");
        if (lastCardType == this.DDZ_CARD_TYPE_4DAI2) {
            if (sidai.indexOf(0) >= 0) {
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 2, false, isSelectCard);
            }
        } else if (lastCardType == this.DDZ_CARD_TYPE_4DAI4) {
            if (sidai.indexOf(1) >= 0) {
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 4, true, isSelectCard);
            }
        } else if (lastCardType == this.DDZ_CARD_TYPE_4DAI1) {
            if (sidai.indexOf(2) >= 0) {
                //勾选四带1单张玩法
                this.GetOtherCard(zhadans, 1, false, isSelectCard);
            }
        } else if (lastCardType == this.DDZ_CARD_TYPE_4DAI21) {
            if (sidai.indexOf(3) >= 0) {
                //勾选四带一对玩法
                this.GetOtherCard(zhadans, 2, true, isSelectCard);
            }
        }
        return zhadans;
    },

    GetSiDai: function GetSiDai() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        var zhadans = [];
        var chai = [];
        // if(pokers.length < this.lastCardList.length) return [];

        var lastCardValue = 0;

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var zhadan = this.GetSameValue(this.lastCardList, poker);
            if (zhadan.length >= 4) {
                lastCardValue = this.GetCardValue(zhadan[0]);
                break;
            }
        }

        for (var _i14 = 0; _i14 < pokers.length; _i14++) {
            var _poker7 = pokers[_i14];
            var cardValue = this.GetCardValue(_poker7);
            if (cardValue <= lastCardValue) continue;
            var _zhadan2 = this.GetSameValue(pokers, _poker7);
            var bInList = this.CheckPokerInListEx(zhadans, _poker7);
            var bInListEx = this.CheckPokerInListEx(chai, _poker7);
            if (_zhadan2.length == 4 && !bInList) {
                this.PushTipCard(zhadans, _zhadan2, 4);
            } else if (_zhadan2.length > 4 && !bInListEx) {
                this.PushTipCard(chai, _zhadan2, 4);
            }
        }

        zhadans.push.apply(zhadans, chai);
        //判断玩法
        var sidai = this.DDZRoom.GetRoomConfigByProperty("sidai");
        if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI2) {
            if (sidai.indexOf(0) >= 0) {
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 2, false);
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI4) {
            if (sidai.indexOf(1) >= 0) {
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 4, true);
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI1) {
            if (sidai.indexOf(2) >= 0) {
                //勾选四带1单张玩法
                this.GetOtherCard(zhadans, 1, false);
            }
        } else if (this.lastCardType == this.DDZ_CARD_TYPE_4DAI21) {
            if (sidai.indexOf(3) >= 0) {
                //勾选四带一对玩法
                this.GetOtherCard(zhadans, 2, true);
            }
        }

        this.GetZhaDanEx(zhadans);
        return zhadans;
    },

    //得到真正的飞机
    GetRealPlane: function GetRealPlane(lists) {
        var lastValue = 0;
        var realPlane = [];
        for (var i = 0; i < lists.length; i++) {
            var item = lists[i];
            var nowValue = this.GetCardValue(item[0]);

            if (lastValue != 0) {
                if (lastValue + 1 != nowValue) {
                    if (realPlane.length >= 2) {
                        break;
                    }
                    realPlane.splice(0, realPlane.length);
                    realPlane[realPlane.length] = item;
                } else {
                    realPlane[realPlane.length] = item;
                }
            } else {
                realPlane[realPlane.length] = item;
            }

            lastValue = nowValue;
        }
        return realPlane;
    },

    GetFeiJiTip: function GetFeiJiTip(tag) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return [];
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return [];
        }
        var tempArrB = [];

        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var santiao = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInList(tempArrB, poker);
            if (santiao.length >= 3 && !bInList && this.GetCardValue(poker) != 15) {
                this.RegularCard(tempArrB, santiao, 3);
            }
        }

        //如果第一次检测三条小于2对 肯定凑不成飞机
        if (tempArrB.length < 2) {
            // let zhadan = [];
            // this.GetZhaDanEx(zhadan);
            // return zhadan;
            return [];
        }

        this.SortCardByMin(tempArrB);

        //tempArrB里的三带或四带飞机找出来 去除不用的三条或四条
        var temp = [];
        var lastValue = 0;
        for (var _i15 = 0; _i15 < tempArrB.length; _i15++) {
            var item = tempArrB[_i15];
            var nowValue = this.GetCardValue(item[0]);

            if (lastValue != 0) {
                if (lastValue + 1 != nowValue) {
                    temp.splice(0, temp.length);
                    temp[temp.length] = item;
                } else {
                    temp[temp.length] = item;
                }
            } else {
                temp[temp.length] = item;
            }

            lastValue = nowValue;
        }
        //将真正的飞机合并成一个数组
        var realPlane = [];
        if (temp.length) {
            var tp = [];
            for (var _i16 = 0; _i16 < temp.length; _i16++) {
                var _item = temp[_i16];
                for (var j = 0; j < _item.length; j++) {
                    tp.push(_item[j]);
                }
            }

            realPlane[realPlane.length] = tp;
        }
        if (realPlane.length) {
            if (tag == this.DDZ_CARD_TYPE_FEIJI1) {
                var needCard1 = realPlane[0].length + realPlane[0].length / 3 * 1;
                this.GetOtherCard(realPlane, realPlane[0].length / 3 * 1, false, isSelectCard);
                if (!realPlane.length) {
                    return [];
                }
                //如果选中的牌不是所有牌，并且不满足完整牌型，return []
                if (realPlane[0].length != needCard1 && pokers != this.handCardList) {
                    return [];
                }
            } else if (tag == this.DDZ_CARD_TYPE_FEIJI2) {
                var needCard2 = realPlane[0].length + realPlane[0].length / 3 * 2;
                this.GetOtherCard(realPlane, realPlane[0].length / 3 * 2, true, isSelectCard);
                if (!realPlane.length) {
                    return [];
                }
                //如果选中的牌不是所有牌，并且不满足完整牌型，return []
                if (realPlane[0].length != needCard2 && pokers != this.handCardList) {
                    return [];
                }
            }
        }
        return realPlane;
    },

    GetFeiJi: function GetFeiJi(tag) {
        var isSelectCard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        //判断玩法
        var sandai = this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return [];
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return [];
        }
        var lastCardValue = 0;
        var tempArrA = [];
        var tempArrB = [];

        for (var i = 0; i < this.lastCardList.length; i++) {
            var poker = this.lastCardList[i];
            var santiao = this.GetSameValue(this.lastCardList, poker);
            var bInList = this.CheckPokerInList(tempArrA, poker);
            if (santiao.length >= 3 && !bInList) {
                //tempArrA[tempArrA.length] = santiao;
                this.RegularCard(tempArrA, santiao, 3);
            }
        }

        this.SortCardByMin(tempArrA);
        var realPlaneA = [];
        if (tempArrA.length) {
            realPlaneA = this.GetRealPlane(tempArrA);
            var _lastValue = this.lastCardList.length - realPlaneA.length * 3;
            if (realPlaneA.length == 3 && _lastValue == 1) {
                //三飞机带单根,可以组成  444,555 带 3333
                for (var _i17 = 0; _i17 < this.lastCardList.length; _i17++) {
                    var _poker8 = this.lastCardList[_i17];
                    var zhadan = this.GetSameValue(this.lastCardList, _poker8);
                    if (zhadan.length >= 4) {
                        for (var j = 0; j < realPlaneA.length; j++) {
                            var sameCard = this.GetSameValue(realPlaneA[j], _poker8);
                            if (sameCard.length == 3) {
                                realPlaneA.splice(j, 1);
                            }
                        }
                        break;
                    }
                }
            } else if (realPlaneA.length == 4 && _lastValue == 3) {
                //三飞机带单根,可以组成  444,555,666 带 3333 77
                var isHasZhadan = false;
                var isHasDuiZi = false;
                for (var _i18 = 0; _i18 < pokers.length; _i18++) {
                    var _poker9 = pokers[_i18];
                    var _zhadan3 = this.GetSameValue(pokers, _poker9);
                    if (_zhadan3.length >= 4) {
                        for (var _j = 0; _j < realPlaneA.length; _j++) {
                            var _sameCard = this.GetSameValue(realPlaneA[_j], _poker9);
                            if (_sameCard.length == 3) {
                                realPlaneA.splice(_j, 1);
                            }
                        }
                        break;
                    }
                }
            }
            lastCardValue = this.GetCardValue(realPlaneA[0][0]);
        }

        for (var _i19 = 0; _i19 < pokers.length; _i19++) {
            var _poker10 = pokers[_i19];
            var _santiao3 = this.GetSameValue(pokers, _poker10);
            var _bInList3 = this.CheckPokerInList(tempArrB, _poker10);
            if (_santiao3.length >= 3 && !_bInList3 && this.GetCardValue(_poker10) != 15) {
                //tempArrB[tempArrB.length] = santiao;
                this.RegularCard(tempArrB, _santiao3, 3);
            }
        }

        //如果第一次检测三条小于2对 肯定凑不成飞机
        if (tempArrB.length < 2) {
            var _zhadan4 = [];
            this.GetZhaDanEx(_zhadan4);
            return _zhadan4;
        }

        this.SortCardByMin(tempArrB);

        //tempArrB里的三带或四带飞机找出来 去除不用的三条或四条
        var temp = [];
        var lastValue = 0;
        for (var _i20 = 0; _i20 < tempArrB.length; _i20++) {
            if (this.GetCardValue(tempArrB[_i20][0]) <= lastCardValue) continue;
            if (temp.length == realPlaneA.length) break;

            var item = tempArrB[_i20];
            var nowValue = this.GetCardValue(item[0]);

            if (lastValue != 0) {
                if (lastValue + 1 != nowValue) {
                    temp.splice(0, temp.length);
                    temp[temp.length] = item;
                } else {
                    temp[temp.length] = item;
                }
            } else {
                temp[temp.length] = item;
            }

            lastValue = nowValue;
        }
        //如果飞机数量不足 返回空
        if (temp.length < realPlaneA.length) {
            var _zhadan5 = [];
            this.GetZhaDanEx(_zhadan5);
            return _zhadan5;
        }
        //将真正的飞机合并成一个数组
        var realPlane = [];
        if (temp.length) {
            var tp = [];
            for (var _i21 = 0; _i21 < temp.length; _i21++) {
                var _item2 = temp[_i21];
                for (var _j2 = 0; _j2 < _item2.length; _j2++) {
                    tp.push(_item2[_j2]);
                }
            }

            realPlane[realPlane.length] = tp;
        }
        if (realPlane.length) {
            if (tag == this.DDZ_CARD_TYPE_FEIJI1) {
                this.GetOtherCard(realPlane, this.lastCardList.length - realPlane[0].length, false);
            } else if (tag == this.DDZ_CARD_TYPE_FEIJI2) {
                this.GetOtherCard(realPlane, this.lastCardList.length - realPlane[0].length, true);
            }
        }

        this.GetZhaDanEx(realPlane);
        return realPlane;
    },
    GetLianDuiTip: function GetLianDuiTip() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        var tempArrB = [];

        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var duizi = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(tempArrB, poker);
            if (duizi.length >= 2 && !bInList) {
                this.PushTipCard(tempArrB, duizi, 2);
            }
        }

        this.SortCardByMin(tempArrB);

        var temps = [];
        for (var _i22 = 0; _i22 < tempArrB.length; _i22++) {
            var tp = [];
            tp.push.apply(tp, tempArrB[_i22]);
            var lastValue = 0;
            lastValue = this.GetCardValue(tempArrB[_i22][0]);
            for (var j = _i22 + 1; j < tempArrB.length; j++) {
                var item = tempArrB[j];
                var nowValue = this.GetCardValue(item[0]);

                if (nowValue == 15) {
                    break;
                }

                if (lastValue + 1 != nowValue) {
                    break;
                }
                tp.push.apply(tp, item);
                lastValue = nowValue;
                if (tp.length >= 6) {
                    temps[temps.length] = tp;
                }
            }
        }
        return temps;
    },

    GetLianDui: function GetLianDui() {
        var isSelectCard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        var lastCardValue = 0;
        var tempArrA = [];
        var tempArrB = [];

        this.SortCardByMinEx(this.lastCardList);
        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        tempArrA = this.lastCardList;

        for (var i = pokers.length - 1; i >= 0; i--) {
            var poker = pokers[i];
            var duizi = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(tempArrB, poker);
            if (duizi.length >= 2 && !bInList) {
                this.PushTipCard(tempArrB, duizi, 2);
            }
        }

        this.SortCardByMin(tempArrB);

        var temps = [];
        for (var _i23 = 0; _i23 < tempArrB.length; _i23++) {
            var tp = [];
            if (this.GetCardValue(tempArrB[_i23][0]) <= lastCardValue) continue;
            tp.push.apply(tp, tempArrB[_i23]);
            var lastValue = 0;
            lastValue = this.GetCardValue(tempArrB[_i23][0]);
            for (var j = _i23 + 1; j < tempArrB.length; j++) {
                var item = tempArrB[j];
                var nowValue = this.GetCardValue(item[0]);

                if (nowValue == 15) {
                    break;
                }

                if (lastValue + 1 != nowValue) {
                    break;
                }

                tp.push.apply(tp, item);
                lastValue = nowValue;

                if (tp.length == tempArrA.length) {
                    temps[temps.length] = tp;
                    break;
                }
            }
        }

        this.GetZhaDanEx(temps);
        return temps;
    },

    GetOtherCard: function GetOtherCard(list, tag) {
        var needDuizi = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var isSelectCard = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var pokers = [];
        if (isSelectCard == false) {
            pokers = this.handCardList;
        } else {
            pokers = this.selectCardList;
        }
        if (!list.length) return;
        var needPokersCount = 0;
        for (var i = 0; i < list.length; i++) {
            needPokersCount = list[i].length + tag;
        }

        var temp = [];
        var chai = [];
        for (var _i24 = pokers.length - 1; _i24 >= 0; _i24--) {
            var poker = pokers[_i24];
            var cards = this.GetSameValue(pokers, poker);
            var bInList = this.CheckPokerInListEx(temp, poker);
            var bInListEx = this.CheckPokerInListEx(chai, poker);
            var bInListExEx = this.CheckPokerInListEx(list, poker);
            if (cards.length == 1 && !bInList) {
                // && !bInListExEx
                this.PushTipCard(temp, cards, 1);
            } else if (cards.length >= 2 && !bInListEx) {
                // && !bInListExEx
                this.PushTipCard(chai, cards, 2);
            }
        }

        // temp.push.apply(temp, chai);
        //先将list拷贝出来
        var tempList = [];
        tempList = list;
        //将获得的牌加入三条,四条或者飞机之中
        for (var _i25 = 0; _i25 < tempList.length; _i25++) {
            var item = tempList[_i25];
            var len = item.length;
            if (!needDuizi) {
                for (var j = 0; j < temp.length; j++) {
                    if (list[_i25].length - len == tag) {
                        break;
                    }
                    var tp = temp[j];
                    for (var k = 0; k < tp.length; k++) {
                        if (list[_i25].length - len == tag) {
                            break;
                        }
                        if (item.indexOf(tp[k]) == -1) {
                            //将获得的带牌加入list
                            list[_i25].push(tp[k]);
                        }
                    }
                }
            } else if (needDuizi) {
                //必须是对子
                for (var _j3 = 0; _j3 < chai.length; _j3++) {
                    if (list[_i25].length - len == tag) {
                        break;
                    }
                    var _tp = chai[_j3];
                    for (var _k = 0; _k < _tp.length; _k++) {
                        if (list[_i25].length - len == tag) {
                            break;
                        }
                        if (item.indexOf(_tp[_k]) == -1) {
                            //将获得的带牌加入list
                            list[_i25].push(_tp[_k]);
                        }
                    }
                }
            }
            //如果需要带对的，如果没有对。不能出
            if (needDuizi && chai.length == 0) {
                list.splice(0, list.length);
                return;
            }
            //如果带的牌有王炸，不能出
            var guipai = 0;
            for (var _i26 = 0; _i26 < list.length; _i26++) {
                if (_typeof(list[_i26]) == "object") {
                    for (var _j4 = 0; _j4 < list[_i26].length; _j4++) {
                        if (this.GetCardValue(list[_i26][_j4]) == this.LOGIC_MASK_XIAOWANG || this.GetCardValue(list[_i26][_j4]) == this.LOGIC_MASK_DAWANG) {
                            guipai++;
                        }
                    }
                } else {
                    if (this.GetCardValue(list[_i26]) == this.LOGIC_MASK_XIAOWANG || this.GetCardValue(list[_i26]) == this.LOGIC_MASK_DAWANG) {
                        guipai++;
                    }
                }
            }
            if (guipai >= 2) {
                list.splice(0, list.length);
                return;
            }
        }
        //判断下如果加入的牌还不够上家的牌型并且手上还有牌需要补充
        var curPokersCount = 0;
        for (var _i27 = 0; _i27 < list.length; _i27++) {
            curPokersCount = list[_i27].length;
        }
        if (curPokersCount < needPokersCount) {
            if (!needDuizi) {
                for (var _i28 = 0; _i28 < list.length; _i28++) {
                    if (list[_i28].length >= needPokersCount) continue;
                    for (var _j5 = 0; _j5 < pokers.length; _j5++) {
                        if (list[_i28].indexOf(pokers[_j5]) == -1) {
                            //将获得的带牌加入list
                            list[_i28].push(pokers[_j5]);
                            if (list[_i28].length == needPokersCount) {
                                break;
                            }
                        }
                    }
                }
            } else {
                //如果需要对。但是还有牌没带的，则不能飞机
                list.splice(0, list.length);
            }
        }
    },

    ///////////////////////////common///////////////////////////////////////
    CheckPokerInList: function CheckPokerInList(list, tagCard) {
        if (list.length == 0) return false;

        var bInList = false;
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var pos = item.indexOf(tagCard);

            if (pos >= 0) {
                return true;
            }
        }
        return bInList;
    },

    CheckPokerInListEx: function CheckPokerInListEx(list, tagCard) {
        if (list.length == 0) return false;

        var bInList = false;
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var tagValue = this.GetCardValue(tagCard);
            for (var j = 0; j < item.length; j++) {
                var cardValue = this.GetCardValue(item[j]);
                if (cardValue == tagValue) {
                    return true;
                }
            }
        }
        return bInList;
    },

    //检测列表是否全是对子
    CheckTagIsDuizi: function CheckTagIsDuizi(tagList) {
        if (tagList.length < 2) return false;
        if (tagList.length % 2 == 1) return false;

        var duiziNum = tagList.length / 2;
        for (var j = 0; j < duiziNum; j++) {
            for (var i = 0; i < tagList.length; i++) {
                var poker = tagList[i];
                var duizi = this.GetSameValue(tagList, poker);
                if (duizi.length >= 2) {
                    var pos1 = tagList.indexOf(duizi[0]);
                    tagList.splice(pos1, 1);
                    var pos2 = tagList.indexOf(duizi[1]);
                    tagList.splice(pos2, 1);
                    break;
                }
            }
        }
        if (tagList.length == 0) return true;else return false;
    },

    //获取带牌
    GetDaiPaiList: function GetDaiPaiList(pokers, sameList) {
        var tempList = [];
        for (var i = 0; i < sameList.length; i++) {
            tempList.push.apply(tempList, sameList[i]);
        }
        var daiPaiList = [];
        for (var _i29 = 0; _i29 < pokers.length; _i29++) {
            var poker = pokers[_i29];
            var index = tempList.indexOf(poker);
            if (index == -1) {
                daiPaiList.push(poker);
            }
        }
        return daiPaiList;
    },

    //获取同一牌值
    GetSameValue: function GetSameValue(pokers, tagCard) {
        var sameValueList = [];
        var tagCardValue = this.GetCardValue(tagCard);
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var pokerValue = this.GetCardValue(poker);

            if (tagCardValue == pokerValue) {
                sameValueList[sameValueList.length] = poker;
            }
        }
        return sameValueList;
    },
    //获取同一花色
    GetSameColor: function GetSameColor(pokers, tagCard) {
        var sameColorList = [];
        for (var i = 0; i < pokers.length; i++) {
            var poker = pokers[i];
            var pokerColor = this.GetCardColor(poker);
            var tagCardColor = this.GetCardColor(tagCard);

            if (pokerColor == tagCardColor) {
                sameColorList[sameColorList.length] = poker;
            }
        }
        return sameColorList;
    },

    //获取牌值
    GetCardValue: function GetCardValue(poker) {
        var realPoker = 0;
        if (poker > 500) {
            realPoker = poker - 500;
        } else {
            realPoker = poker;
        }
        //大小王值最大
        if (realPoker == 65) return this.LOGIC_MASK_XIAOWANG;
        if (realPoker == 66) return this.LOGIC_MASK_DAWANG;
        return realPoker & this.LOGIC_MASK_VALUE;
    },

    //获取花色
    GetCardColor: function GetCardColor(poker) {
        var realPoker = 0;
        if (poker > 500) {
            realPoker = poker - 500;
        } else {
            realPoker = poker;
        }
        return realPoker & this.LOGIC_MASK_COLOR;
    },

    CheckSameValue: function CheckSameValue(aCards, bCards) {
        var bRet = false;
        for (var i = 0; i < aCards.length; i++) {
            var poker = aCards[i];
            if (bCards.indexOf(poker) != -1) {
                bRet = true;
                break;
            }
        }

        return bRet;
    }
});

var g_LogicDDZGame = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
    if (!g_LogicDDZGame) {
        g_LogicDDZGame = new LogicDDZGame();
    }
    return g_LogicDDZGame;
};

cc._RF.pop();