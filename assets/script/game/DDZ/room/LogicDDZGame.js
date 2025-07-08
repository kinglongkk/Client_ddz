var app = require("ddz_app");


var LogicDDZGame = app.BaseClass.extend({
    Init:function(){
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

        this.pokerType = [
            0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,   //方块 2-A
            0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,0x1E,   //梅花 2-A
            0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,0x2E,   //红桃 2-A
            0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D,0x3E,   ];//黑桃 2-A

        this.LOGIC_MASK_COLOR = 0xF0;
        this.LOGIC_MASK_VALUE = 0x0F;
        this.LOGIC_MASK_XIAOWANG = 16;
        this.LOGIC_MASK_DAWANG = 17;

        //打牌类型
        this.DDZ_CARD_TYPE_NOMARL = 0;            //默认状态
        this.DDZ_CARD_TYPE_BUCHU = 1;             //不出
        this.DDZ_CARD_TYPE_SINGLECARD = 2;      //单牌
        this.DDZ_CARD_TYPE_DUIZI = 3;          //对子
        this.DDZ_CARD_TYPE_3BUDAI = 4;              //3不带
        this.DDZ_CARD_TYPE_3DAI1 = 5;           //3带1
        this.DDZ_CARD_TYPE_3DAI2 = 6;           //3带2  三张同点牌+一对牌
        this.DDZ_CARD_TYPE_SHUNZI = 7;              //顺子
        this.DDZ_CARD_TYPE_LIANDUI = 8;             //联队
        this.DDZ_CARD_TYPE_4DAI1 = 9;          //4带1 
        this.DDZ_CARD_TYPE_4DAI21 = 10;             //4带1对 
        this.DDZ_CARD_TYPE_4DAI2 = 11;                  //4带2 两个单张
        this.DDZ_CARD_TYPE_4DAI4 = 12;              //4带2 两对
        this.DDZ_CARD_TYPE_FEIJI0 = 13;             //飞机 不带
        this.DDZ_CARD_TYPE_FEIJI1 = 14;             //飞机 三顺带单
        this.DDZ_CARD_TYPE_FEIJI2 = 15;             //飞机 三顺带对
        this.DDZ_CARD_TYPE_ZHADAN = 16;             //炸弹
    },

    InitHandCard:function(){
        this.handCardList = [];
        this.selectCardList = [];
        this.lastCardType = this.DDZ_CARD_TYPE_NOMARL;
        this.lastCardList = [];

        let handCard = this.DDZRoomSet.GetHandCard();
        for(let i = 0; i < handCard.length; i++){
            let card = handCard[i];
            this.handCardList.push(card);
        }

        this.SortCardByMax(this.handCardList);
        this.TransformValueToC(this.handCardList);
    },

    //取消选牌
    ClearSelectCard:function(){
        this.InitHandCard();
        app[app.subGameName + "Client"].OnEvent("HandCard");
    },


    //如果服务端发过来的牌值有重复，转换成唯一
    TransformValueToC:function(pokers){
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let count = 0;
            for(let j = i; j < pokers.length; j++){
                if(poker == pokers[j]){
                    count++;
                }
                if(count >= 2){
                    pokers[j] = pokers[j]+500;
                    break;
                }
            }
        }
    },

    //还原客户端转过的牌值
    TransformValueToS:function(pokers){
        for(let i = 0; i < pokers.length; i++){
            if(pokers[i] > 500){
                pokers[i] = pokers[i] - 500;
            }
        }
    },

    SortCardByMax:function(pokers){
        let self = this;
        pokers.sort(function(a, b){
            //return (b&0x0F) - (a&0x0F);
            return self.GetCardValue(b) - self.GetCardValue(a);
        });
    },

    SortCardByMinEx:function(pokers){
        let self = this;
        pokers.sort(function(a, b){
            //return (a&0x0F) - (b&0x0F);
            return self.GetCardValue(a) - self.GetCardValue(b);
        });
    },

    SortCardByMin:function(pokers){
        let self = this;
        pokers.sort(function(a, b){
            let aValue = a[0];
            let bValue = b[0];
            //return (aValue&0x0F) - (bValue&0x0F);
            return self.GetCardValue(aValue) - self.GetCardValue(bValue);
        });
    },

    OutPokerCard:function(cardList){
        if(!cardList.length){
            return;
        }
        //删除handcardlist和selectCardList中的元素
        for(let i = 0; i < cardList.length; i++){
            let value = cardList[i];
            let pos = this.handCardList.indexOf(value+500);
            if(pos != -1){
                this.handCardList.splice(pos,1);
            }
            else{
                let pos1 = this.handCardList.indexOf(value);
                if(pos1 != -1){
                    this.handCardList.splice(pos1,1);
                }
            }

            let cardPos = this.selectCardList.indexOf(value);
            if(cardPos != -1){
                this.selectCardList.splice(cardPos,1);
            }
        }
        console.log("selectCardList == "+this.selectCardList);
        app[app.subGameName + "Client"].OnEvent("HandCard");
    },

    GetHandCard:function(){
        return this.handCardList;
    },

    GetSelectCard:function(){
        return this.selectCardList;
    },

    ChangeSelectCard:function(cardList){
        this.selectCardList = [];
        this.selectCardList = cardList;
    },

    SetCardSelected:function(cardIdx){
        let cardType = this.handCardList[cardIdx -1];
        this.selectCardList.push(cardType);
        console.log("selectCardList == "+this.selectCardList);
    },

    DeleteCardSelected:function(cardIdx){
        let cardType = this.handCardList[cardIdx -1];
        let pos = this.selectCardList.indexOf(cardType)
        if (pos != -1){
            this.selectCardList.splice(pos, 1);
        }
        console.log("selectCardList111 == "+this.selectCardList);
    },

    SetCardData(opCardType, cardList){
        if(opCardType == this.DDZ_CARD_TYPE_BUCHU || !cardList.length){
            return;
        }

        if(this.lastCardType == this.DDZ_CARD_TYPE_NOMARL || opCardType == this.DDZ_CARD_TYPE_ZHADAN){
            this.lastCardType = opCardType;
        }
        
        console.log("this.lastCardTyp =="+this.lastCardType);
        this.lastCardList = cardList;
    },

    ClearCardData:function(){
        this.lastCardType = this.DDZ_CARD_TYPE_NOMARL;
        this.lastCardList = [];
    },

    GetLastCardType:function(){
        return this.lastCardType;
    },

    //检查组合是否只有炸弹
    CheckOnlyBoom:function(list){
        for(let i = 0; i < list.length; i++){
            let item = list[i];
            let sameCard = this.GetSameValue(item, item[0]);
            if(sameCard.length != item.length)
                return false;
        }
        return true;
    },

    CheckOneCard:function(isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        if(pokers.length != 1) return false;
        let lastCardValue = 0;
        let myCardValue = 0;

        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        myCardValue = this.GetCardValue(pokers[0]);

        if(lastCardValue && lastCardValue != 0){
            if(this.lastCardList.length != pokers.length) return false;
            if(myCardValue > lastCardValue){
                return true;
            }
            return false;
        }

        return true;
    },

    CheckDuizi:function(isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        if(pokers.length != 2) return false;

        let lastCardValue = 0;
        let myCardValue = 0;
        let bDui = false;

        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let duizi = this.GetSameValue(pokers, poker);
            if(duizi.length == 2){
                myCardValue = this.GetCardValue(poker);
                bDui = true;
                break;
            }
        }

        if(lastCardValue && lastCardValue != 0){
            if(this.lastCardList.length != pokers.length) return false;
            
            if(myCardValue > lastCardValue){
                return true;
            }
            return false;
        }

        if(bDui)
            return true;
        return false;
    },

    CheckShunzi:function(isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        if(pokers.length < 5) return false;

        let lastCardValue = 0;
        let myCardValue = 0;

        this.SortCardByMax(this.lastCardList);
        this.SortCardByMax(pokers);

        let lastValue = 0;
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let nowValue = this.GetCardValue(poker);

            if(nowValue == 15){
                return false;
            }

            if(lastValue != 0){
                if(lastValue - nowValue != 1)
                    return false;
            }
            
            lastValue = nowValue;
        }

        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        myCardValue = this.GetCardValue(pokers[0]);

        if(lastCardValue && lastCardValue != 0){
            if(this.lastCardList.length != pokers.length) return false;
            
            if(myCardValue > lastCardValue){
                return true;
            }
            return false;
        }

        return true;
    },

    //如果最后首发只有三带 可以不带牌出
    CheckLastThree:function(tag, lastCard){
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

    CheckSanDaiSiDai:function(tag, isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let handPokers = this.handCardList;
        if(pokers.length < 3) return false;
        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_3DAI1) {
            //没有勾选三带一玩法
            return false;
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_3DAI2) {
            //没有勾选三带二玩法
            return false;
        }
        let sidai=this.DDZRoom.GetRoomConfigByProperty("sidai");
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
        let lastCardValue = 0;
        let myCardValue = 0;
        let tempArrA = [];
        let tempArrB = [];

        for(let i=0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let samePoker = this.GetSameValue(this.lastCardList, poker);
            if(tag >= this.DDZ_CARD_TYPE_3BUDAI && tag <= this.DDZ_CARD_TYPE_3DAI2){
                if(samePoker.length >= 3){
                    this.RegularCard(tempArrA, samePoker, 3);
                    //tempArrA = samePoker;
                    break;
                }
            }
            else if(tag >= this.DDZ_CARD_TYPE_4DAI2 && tag <= this.DDZ_CARD_TYPE_4DAI4){
                if(samePoker.length >= 4){
                    this.RegularCard(tempArrA, samePoker, 4);
                    //tempArrA = samePoker;
                    break;
                }
            }
        }

        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let samePoker = this.GetSameValue(pokers, poker);
            if(tag >= this.DDZ_CARD_TYPE_3BUDAI && tag <= this.DDZ_CARD_TYPE_3DAI2){
                if(samePoker.length >= 3){
                    this.RegularCard(tempArrB, samePoker, 3);
                    //tempArrB = samePoker;
                    break;
                }
            }
            else if(tag >= this.DDZ_CARD_TYPE_4DAI2 && tag <= this.DDZ_CARD_TYPE_4DAI4){
                if(samePoker.length >= 4){
                    this.RegularCard(tempArrB, samePoker, 4);
                    //tempArrB = samePoker;
                    break;
                }
            }
        }
        if(tempArrA.length){
            lastCardValue = this.GetCardValue(tempArrA[0][0]);
        }
        
        if(tempArrB.length){
            myCardValue = this.GetCardValue(tempArrB[0][0]);
        }

        let daiCardList = this.GetDaiPaiList(pokers, tempArrB);

        //如果带的牌有王炸，不能出
        let guipai = 0;
        for (let i = 0; i < daiCardList.length; i++) {
            if (this.GetCardValue(daiCardList[i]) == this.LOGIC_MASK_XIAOWANG || 
                this.GetCardValue(daiCardList[i]) == this.LOGIC_MASK_DAWANG) {
                guipai++;
            }
        }
        if (guipai >= 2) {
            return false;
        }
        
        if(lastCardValue && lastCardValue != 0){
            if(this.lastCardList.length != pokers.length)
                return false;
            if(tag == this.DDZ_CARD_TYPE_3DAI2 && !this.CheckTagIsDuizi(daiCardList)){
                return false;
            }
            if(tag == this.DDZ_CARD_TYPE_4DAI21 && !this.CheckTagIsDuizi(daiCardList)){
                return false;
            }
            if(tag == this.DDZ_CARD_TYPE_4DAI4 && !this.CheckTagIsDuizi(daiCardList)){
                return false;
            }
            if(myCardValue > lastCardValue){
                return true;
            }
            return false;
        }
        if(tempArrB.length){
            if(tag == this.DDZ_CARD_TYPE_3BUDAI){
                if(pokers.length == 3){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_3DAI1){
                if(pokers.length == 4){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_3DAI2){
                if(pokers.length == 5 && this.CheckTagIsDuizi(daiCardList)){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_4DAI1){
                if(pokers.length == 5){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_4DAI21){
                if(pokers.length == 6 && this.CheckTagIsDuizi(daiCardList)){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_4DAI2){
                if(pokers.length == 6){
                    return true;
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_4DAI4){
                if(pokers.length == 8 && this.CheckTagIsDuizi(daiCardList)){
                    return true;
                }
            }
        }
        return false;
    },

    IsZhadan:function(pokers){
        let temp = [];
        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            if(zhadan.length >= 4){
                temp = zhadan;
                break;
            }
        }
        //是否是王炸
        if (pokers.length == 2) {
            let cardValue_1 = this.GetCardValue(pokers[0]);
            let cardValue_2 = this.GetCardValue(pokers[1]);
            if (cardValue_1 == 16 && cardValue_2 == 17)
                return true;
            if (cardValue_2 == 16 && cardValue_1 == 17)
                return true;
        }
        if(pokers.length){
            if(pokers.length - temp.length == 0){
                return true;
            }
        }
        return false;
    },
    
    CheckZhaDan:function(isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }

        let lastCardValue = 0;
        let myCardValue = 0;

        if(this.IsZhadan(this.lastCardList)){
            lastCardValue = this.GetCardValue(this.lastCardList[0]);
        }

        if(this.IsZhadan(pokers)){
            if(lastCardValue == 0) return true;
            myCardValue = this.GetCardValue(pokers[0]);
        }
        else{
            return false;
        }

        //王炸最大
        if (myCardValue == 16 || myCardValue == 17) {
            return true;
        }
        
        //先比较牌值再比较张数
        if(myCardValue > lastCardValue){
            if(pokers.length >= this.lastCardList.length){
                return true;
            }
        }
        else if(myCardValue <= lastCardValue){
            if(pokers.length > this.lastCardList.length){
                return true;
            }
        }

        return false;
    },

    IsLianShun:function(pokers){
        if(pokers.length < 2) return false;
        
        this.SortCardByMin(pokers);

        let lastValue = 0;
        for(let i = 0; i < pokers.length; i++){
            let item = pokers[i];
            let nowValue = this.GetCardValue(item[0]);

            if(nowValue == 15){
                return false;
            }

            if(lastValue != 0){
                if((lastValue+1) != nowValue)
                    return false;
            }
            
            lastValue = nowValue;
        }

        return true;
    },

    //如果有超过tag只取tag数量的牌
    RegularCard:function(pokers, list, tag){
        let temp = [];
        for(let i = 0; i < list.length; i++){
            if(temp.length == tag) break;
            temp.push(list[i]);
        }
        //如果已经在pokers列表里，无需重复计算
        let isHasArr = false;
        for (let i = 0; i < pokers.length; i++) {
            //判断数组是否相等需要排序后转字符串
            if (pokers[i].sort().toString() == temp.sort().toString()) {
                isHasArr = true;
                break;
            }
        }
        if (!isHasArr) {
            pokers[pokers.length] = temp;
        }
    },

    GetDaiNum:function(){
        return this.daiNum;
    },
    
    CheckFeiJi:function(tag,isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let handPokers = this.handCardList;
        if(pokers.length < 6) return false;
        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return false;
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return false;
        }
        let lastCardValue = 0;
        let myCardValue = 0;
        let tempArrA = [];
        let tempArrB = [];

        for(let i = 0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let santiao = this.GetSameValue(this.lastCardList, poker);
            let bInList = this.CheckPokerInListEx(tempArrA, poker);
            if(santiao.length >= 3 && !bInList){
                this.RegularCard(tempArrA, santiao, 3);
            }
        }

        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let santiao = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(tempArrB, poker);
            if(santiao.length >= 3 && !bInList && this.GetCardValue(poker) != 15){
                this.RegularCard(tempArrB, santiao, 3);
            }
        }

        if(tempArrA.length){
            let realPlaneA = this.GetRealPlane(tempArrA);
            lastCardValue = this.GetCardValue(realPlaneA[0][0]);
        }
        
        if(tempArrB.length < 2) return false;
        
        this.SortCardByMin(tempArrB);

        let realPlane = this.GetRealPlane(tempArrB);

        if(!realPlane.length) return false;

        myCardValue = this.GetCardValue(realPlane[0][0]);
        
        let value = (pokers.length - realPlane.length * 3);
        this.daiNum = value;
        let daiPaiList = this.GetDaiPaiList(pokers, realPlane);
        //如果带的牌有王炸，不能出
        let guipai = 0;
        for (let i = 0; i < daiPaiList.length; i++) {
            if (this.GetCardValue(daiPaiList[i]) == this.LOGIC_MASK_XIAOWANG || 
                this.GetCardValue(daiPaiList[i]) == this.LOGIC_MASK_DAWANG) {
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
        if(tag == this.DDZ_CARD_TYPE_FEIJI0){
            if(value == 0){
                if(lastCardValue && lastCardValue != 0){
                    if(myCardValue > lastCardValue){
                        return true;
                    }
                    return false;
                }
                return true;
            }
        }
        else if(tag == this.DDZ_CARD_TYPE_FEIJI1){
            if(value == realPlane.length){
                if(lastCardValue && lastCardValue != 0){
                    if(myCardValue > lastCardValue){
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
        }
        else if(tag == this.DDZ_CARD_TYPE_FEIJI2){
            if(realPlane.length==3 && value==1){
                //三飞机带单根,可以组成  444,555 带 3333
                let isHasZhadan = false;
                for(let i=0; i < pokers.length; i++){
                    let poker = pokers[i];
                    let zhadan = this.GetSameValue(pokers, poker);
                    if(zhadan.length >= 4){
                        isHasZhadan = true;
                        break;
                    }
                }
                if (isHasZhadan) {
                    return true;
                }
            }else if(realPlane.length==4 && value==3){
                //三飞机带单根,可以组成  444,555,666 带 3333 77
                let isHasZhadan = false;
                let isHasDuiZi = false;
                for(let i=0; i < pokers.length; i++){
                    let poker = pokers[i];
                    let zhadan = this.GetSameValue(pokers, poker);
                    if(zhadan.length >= 4){
                        isHasZhadan = true;
                        break;
                    }else if (zhadan.length == 2) {
                        // 并且还有一个对子
                        isHasDuiZi = true;
                    }
                }
                if (isHasZhadan && isHasDuiZi) {
                    return true;
                }
            }
            else if(value == realPlane.length * 2 && this.CheckTagIsDuizi(daiPaiList)){
                if(lastCardValue && lastCardValue != 0){
                    if(myCardValue > lastCardValue){
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

    CheckLianDui:function(isSelectCard = true){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        if(pokers.length < 6) return false;
        if(pokers.length%2 == 1) return false;

        let lastCardValue = 0;
        let myCardValue = 0;
        let tempArrA = [];
        let tempArrB = [];

        for(let i = 0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let duizi = this.GetSameValue(this.lastCardList, poker);
            let bInList = this.CheckPokerInList(tempArrA, poker);
            if(duizi.length == 2 && !bInList){
                tempArrA[tempArrA.length] = duizi;
            }
        }

        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let duizi = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInList(tempArrB, poker);
            if(duizi.length == 2 && !bInList){
                tempArrB[tempArrB.length] = duizi;
            }
        }

        if(tempArrB.length * 2 != pokers.length) return false;

        if(this.IsLianShun(tempArrA)){
            lastCardValue = this.GetCardValue(tempArrA[0][0]);
        }

        if(this.IsLianShun(tempArrB)){
            myCardValue = this.GetCardValue(tempArrB[0][0]);
        }
        else{
            return false;
        }
        
        if(lastCardValue && lastCardValue != 0){
            if((pokers.length - this.lastCardList.length) == 0){
                if(myCardValue > lastCardValue){
                    return true;
                }
            }
            return false;
        }
        return true;
    },

    //检查顺子是不是一条龙
    CheckDragon:function(){
        let pokers = this.lastCardList;
        if(pokers.length != 12) return false;

        this.SortCardByMinEx(pokers);

        let lastValue = 0;
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let nowValue = this.GetCardValue(poker);
            if(nowValue == lastValue) return false;

            if(nowValue == 15) return false;

            if(lastValue != 0){
                if(nowValue - lastValue != 1)
                    return false;
            }

            lastValue = nowValue;
        }

        return true; 
    },
    IsHaveBoom:function(isSelectCard = false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        //先判断是否有王炸
        let wangzhaList = [];
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            if(zhadan.length >= 4){
                return true;
            }
            if (this.GetCardValue(pokers[i]) == 16 ||
                this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }
        if (wangzhaList.length == 2) {
            return true;
        }
        return false;
    },

    IsHaveWangZhaOrBoom:function(isSelectCard = false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        //先判断是否有王炸
        let wangzhaList = [];
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            if (this.GetCardValue(pokers[i]) == 16 ||
                this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
            if (this.GetCardValue(pokers[i]) != 15) {
                continue;
            }
            if(zhadan.length >= 4){
                return true;
            }
        }
        if (wangzhaList.length == 2) {
            return true;
        }
        return false;
    },

    IsDismantleBoom:function(){
        let pokers = this.handCardList;
        if(this.CheckZhaDan()){
            return false;
        }
        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            if(this.selectCardList.indexOf(poker) != -1){
                let zhadan = this.GetSameValue(pokers, poker);
                if(zhadan.length >= 4){
                    return true;
                }
            }
        }
        
        return false;
    },

    GetCardType:function(isSelectCard = true){
        //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:4带1 9:4带2 10:4带3 
        //11:炸弹 12:飞机带单 13:飞机带对 14:连对
        this.daiNum = 0;

        if(isSelectCard && !this.selectCardList.length){
            return 0;
        }
        
        let bCheck = false;

        if(this.CheckZhaDan(isSelectCard)){
            return this.DDZ_CARD_TYPE_ZHADAN;
        }
        
        if(this.lastCardType == 0){
            if(this.CheckOneCard(isSelectCard)){
                return this.DDZ_CARD_TYPE_SINGLECARD;
            }
            else if(this.CheckDuizi(isSelectCard)){
                return this.DDZ_CARD_TYPE_DUIZI;
            }
            else if(this.CheckShunzi(isSelectCard)){
                return this.DDZ_CARD_TYPE_SHUNZI;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI1, isSelectCard)){
                return this.DDZ_CARD_TYPE_4DAI1;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI21, isSelectCard)){
                return this.DDZ_CARD_TYPE_4DAI21;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI4, isSelectCard)){
                return this.DDZ_CARD_TYPE_4DAI4;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI2, isSelectCard)){
                return this.DDZ_CARD_TYPE_4DAI2;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3DAI2, isSelectCard)){
                return this.DDZ_CARD_TYPE_3DAI2;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3DAI1, isSelectCard)){
                return this.DDZ_CARD_TYPE_3DAI1;
            }
            else if(this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_3BUDAI, isSelectCard)){
                return this.DDZ_CARD_TYPE_3BUDAI;
            }
            else if (this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI0, isSelectCard)) {
                return this.DDZ_CARD_TYPE_FEIJI0;
            }
            else if(this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1, isSelectCard)){
                return this.DDZ_CARD_TYPE_FEIJI1;
            }
            else if(this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI2, isSelectCard)){
                return this.DDZ_CARD_TYPE_FEIJI2;
            }
            else if(this.CheckLianDui(isSelectCard)){
                return this.DDZ_CARD_TYPE_LIANDUI;
            }
            else{
                return 0;
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD){
            if(this.CheckOneCard(isSelectCard)){
                bCheck = true;
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_DUIZI){
            if(this.CheckDuizi(isSelectCard)){
                bCheck = true;
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI){
            if(this.CheckShunzi(isSelectCard)){
                bCheck = true;
            }
        }
        else if((this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_3DAI1) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_3DAI2) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_4DAI1) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_4DAI21) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_4DAI2) || 
                (this.lastCardType == this.DDZ_CARD_TYPE_4DAI4)){
                if(this.CheckSanDaiSiDai(this.lastCardType, isSelectCard)){
                    bCheck = true;
                }
        }
        else if (this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0) {
            if(this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI0, isSelectCard)){
                bCheck = true;
            }
        }
        else if((this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1)){
            if(this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1, isSelectCard)){
                bCheck = true;
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2){
            if(this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI2, isSelectCard)){
                bCheck = true;
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI){
            if(this.CheckLianDui(isSelectCard)){
                bCheck = true;
            }
        }

        if(bCheck){
            return this.lastCardType;
        }

        return 0;
    },
    //特殊牌有多种牌型检测
    GetAllCardTypeBySpc:function(){
        if(!this.selectCardList.length){
            return [];
        }
        let allCardType = [];
        if(this.lastCardType == 0){
            let razzSanDaiSiDaiList = this.CheckSanDaiSiDai(this.DDZ_CARD_TYPE_4DAI4);
            if (razzSanDaiSiDaiList) {
                let razzSanDaiSiDaiObj = {"realCardList":this.selectCardList, "cardType":this.DDZ_CARD_TYPE_4DAI4};
                allCardType.push(razzSanDaiSiDaiObj);
            }
            let razzFeiJiList = this.CheckFeiJi(this.DDZ_CARD_TYPE_FEIJI1);
            if (razzFeiJiList) {
                let razzFeiJiObj = {"realCardList":this.selectCardList, "cardType":this.DDZ_CARD_TYPE_FEIJI1};
                allCardType.push(razzFeiJiObj);
            }
            return allCardType;
        }
        return allCardType;
    },
    //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:4带1 9:4带2 10:4带3 
        //11:炸弹 12:三带飞机 13:四带飞机 14:连对
    GetTipCardSlCard:function(){
        let array = [];
        if(this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD){
            array = this.GetOneCardTip(true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_DUIZI){
            array = this.GetDuiziTip(true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI){
            array = this.GetShunziTip(true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI ||
                this.lastCardType == this.DDZ_CARD_TYPE_3DAI1 ||
                this.lastCardType == this.DDZ_CARD_TYPE_3DAI2){
            array = this.GetSanDaiTip(this.lastCardType, true);                
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI2 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI4 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI1 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI21){
            array = this.GetSiDaiTip(this.lastCardType, true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_ZHADAN){
            array = this.GetZhaDan(true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0){
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI0, true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1){
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI1, true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2){
            array = this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI2, true);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI){
            array = this.GetLianDuiTip(true);
        }
        else if(this.lastCardType==0){
            //随意出牌
            array.push.apply(array, this.GetOneCardTip(true));
            array.push.apply(array, this.GetDuiziTip(true));
            array.push.apply(array, this.GetShunziTip(true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3BUDAI,true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3DAI1,true));
            array.push.apply(array, this.GetSanDaiTip(this.DDZ_CARD_TYPE_3DAI2,true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI2,true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI4,true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI1,true));
            array.push.apply(array, this.GetSiDaiTip(this.DDZ_CARD_TYPE_4DAI21,true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI0,true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI1,true));
            array.push.apply(array, this.GetFeiJiTip(this.DDZ_CARD_TYPE_FEIJI2,true));
            array.push.apply(array, this.GetLianDuiTip(true));
            array.push.apply(array, this.GetZhaDanTip(true));
        }
        if(array.length>0){
             array.sort(this.SortByLength);
        }
        return array;
    },
    SortByLength:function(a,b){
        if(a.length>b.length){
            return -1;
        }
        return 1;
    },
    GetTipCard:function(){
        let array = [];
        if (this.lastCardType == this.DDZ_CARD_TYPE_NOMARL) {
            let setInfo = this.DDZRoomSet.GetRoomSetInfo();
            this.SetCardData(setInfo.opType, setInfo.cardList);
            this.lastCardType = setInfo.opType;
            this.lastCardList = setInfo.cardList;
        }
        if(this.lastCardType == this.DDZ_CARD_TYPE_SINGLECARD){
            array = this.GetOneCard();
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_DUIZI){
            array = this.GetDuizi();
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_SHUNZI){
            array = this.GetShunzi();
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI ||
                this.lastCardType == this.DDZ_CARD_TYPE_3DAI1 ||
                this.lastCardType == this.DDZ_CARD_TYPE_3DAI2){
            array = this.GetSanDai();                
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI2 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI4 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI1 ||
                this.lastCardType == this.DDZ_CARD_TYPE_4DAI21){
            array = this.GetSiDai();
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_ZHADAN){
            array = this.GetZhaDan();
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI0){
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI0);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI1){
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI1);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_FEIJI2){
            array = this.GetFeiJi(this.DDZ_CARD_TYPE_FEIJI2);
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_LIANDUI){
            array = this.GetLianDui();
        }
        return array;
    },

    CheckSelected:function(cardValue){
        if (-1 == this.selectCardList.indexOf(cardValue)){
            return false;
        }
        return true;
    },

    //0:可以随便出牌 1:不出 2:单牌 3:对子 4:顺子 5:3不带 6:3带1 7:3带2 8:飞机不带 9:4带2 10:4带3 
    //11:炸弹 12:飞机带单 13:飞机带对 14:连对
    GetZhaDan:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let zhadans = [];

        let lastCardValue = 0;
        lastCardValue = this.GetCardValue(this.lastCardList[0]);

        //先判断是否有王炸
        let wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 ||
                this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }
        
        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(zhadans, poker);
            if(zhadan.length > 4 && !bInList){
                zhadans[zhadans.length] = zhadan;
            }
            else if(zhadan.length == 4 && !bInList && this.GetCardValue(zhadan[0]) > lastCardValue){
                zhadans[zhadans.length] = zhadan;
            }
        }

        return zhadans;
    },

    GetZhaDanTip:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let zhadans = [];

        //先判断是否有王炸
        let wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 ||
                this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }
        
        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(zhadans, poker);
            if(zhadan.length > 4 && !bInList){
                zhadans[zhadans.length] = zhadan;
            }
            else if(zhadan.length == 4 && !bInList){
                zhadans[zhadans.length] = zhadan;
            }
        }

        return zhadans;
    },

    GetZhaDanEx:function(array){
        let pokers = this.handCardList;
        let zhadans = [];
        let arrLen = array.length;//先记录下原来数组的长度，方便后续插入王炸炸弹

        //先判断是否有王炸
        let wangzhaList = [];
        for (var i = pokers.length - 1; i >= 0; i--) {
            if (this.GetCardValue(pokers[i]) == 16 ||
                this.GetCardValue(pokers[i]) == 17) {
                wangzhaList.push(pokers[i]);
            }
        }

        if (wangzhaList.length == 2) {
            zhadans[0] = wangzhaList;
        }
        
        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let zhadan = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(zhadans, poker);
            if(zhadan.length >= 4 && !bInList){
                zhadans[zhadans.length] = zhadan;
            }
        }
        let wangzha = [];
        for(let i = zhadans.length - 1; i >= 0; i--){
            let item = zhadans[i];
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

    PushTipCard:function(pokers, samePoker, len){
        let temp = [];
        samePoker.reverse();
        for(let i = 0; i < len; i++){
            temp.push(samePoker[i]);
        }

        pokers.push(temp);
    },

    GetOneCardTip:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let array = [];
        let chai = [];

        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            let sameValue = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(chai, poker);
            if(sameValue.length == 1){
                this.PushTipCard(array, sameValue, 1);
            }
            else if(sameValue.length > 1 && !bInList){
                this.PushTipCard(chai, sameValue, 1);
            }
        }
        array.push.apply(array, chai);
        return array;
    },

    GetOneCard:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let array = [];
        let chai = [];

        let lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            if(cardValue <= lastCardValue) continue;
            let sameValue = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(chai, poker);
            if(sameValue.length == 1){
                this.PushTipCard(array, sameValue, 1);
            }
            else if(sameValue.length > 1 && !bInList){
                this.PushTipCard(chai, sameValue, 1);
            }
        }
        array.push.apply(array, chai);
        this.GetZhaDanEx(array);
        return array;
    },

    GetDuiziTip:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let duizis = [];
        let chai = [];
        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            let duizi = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(duizis, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(duizi.length == 2 && !bInList){
                this.PushTipCard(duizis, duizi, 2);
            }
            else if(duizi.length > 2 && !bInListEx){
                this.PushTipCard(chai, duizi, 2);
            }
        }
        duizis.push.apply(duizis, chai);
        return duizis;
    },

    GetDuizi:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let duizis = [];
        let chai = [];
        if(pokers.length < this.lastCardList.length) return [];

        let lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            if(cardValue <= lastCardValue) continue;
            let duizi = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(duizis, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(duizi.length == 2 && !bInList){
                this.PushTipCard(duizis, duizi, 2);
            }
            else if(duizi.length > 2 && !bInListEx){
                this.PushTipCard(chai, duizi, 2);
            }
        }
        duizis.push.apply(duizis, chai);
        this.GetZhaDanEx(duizis);
        return duizis;
    },

    GetShunziTip:function(isSelectCard = false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        this.SortCardByMax(pokers);
        let array = [];
        for(let i = pokers.length - 1; i >= 0; i--){
            let lastValue = 0;
            let shunzi = [];
            shunzi.push(pokers[i]);
            for(let j = i; j >= 0; j--){
                let poker = pokers[j];
                let nowValue = this.GetCardValue(poker);
                if(nowValue == lastValue) continue;
                if(nowValue == 15){
                    break;
                }
                if(lastValue != 0){
                    if(nowValue - lastValue != 1){
                        break;
                    }
                    shunzi.push(poker);   
                }
                lastValue = nowValue;
                if(shunzi.length>=5){
                    array[array.length] = shunzi;
                }
            }
        }
        return array;
    },

    GetShunzi:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
            this.SortCardByMinEx(pokers);
        }
        let array = [];
        // if(pokers.length < this.lastCardList.length) return [];
        this.SortCardByMinEx(this.lastCardList);
        let lastCardValue = this.GetCardValue(this.lastCardList[0]);

        for(let i = pokers.length - 1; i >= 0; i--){
            let lastValue = 0;
            let shunzi = [];
            shunzi.push(pokers[i]);
            for(let j = i; j >= 0; j--){
                let poker = pokers[j];
                let nowValue = this.GetCardValue(poker);

                if(nowValue == lastValue) continue;

                if(nowValue <= lastCardValue){
                    break;
                }
                if(nowValue == 15){
                    break;
                }
                if(lastValue != 0){
                    if(nowValue - lastValue != 1)
                        break;
                    shunzi.push(poker);   
                }
                
                if(shunzi.length >= this.lastCardList.length){
                    array[array.length] = shunzi;
                    break;
                }
                lastValue = nowValue;
            }
        }
        this.GetZhaDanEx(array);
        return array;
    },
    GetSanDaiTip:function(lastCardType,isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let santiaos = [];
        let chai = [];

        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            let santiao = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(santiaos, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(santiao.length == 3 && !bInList){
                this.PushTipCard(santiaos, santiao, 3);
            }
            else if(santiao.length > 3 && !bInListEx){
                this.PushTipCard(chai, santiao, 3);
            }
        }

        this.SortCardByMin(santiaos);
        this.SortCardByMin(chai);

        santiaos.push.apply(santiaos, chai);
        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if(lastCardType == this.DDZ_CARD_TYPE_3BUDAI){
            this.GetOtherCard(santiaos, 0, false, true);
        }else if(lastCardType == this.DDZ_CARD_TYPE_3DAI1){
            if (sandai.indexOf(0) >= 0){
                //勾选三带一玩法
                this.GetOtherCard(santiaos, 1, false, true);
            }
        }
        else if(lastCardType == this.DDZ_CARD_TYPE_3DAI2){
            if (sandai.indexOf(1) >= 0){
                //勾选三带二玩法
                this.GetOtherCard(santiaos, 2, true, true);
            }
        }
        return santiaos;
    },
    GetSanDai:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let santiaos = [];
        let chai = [];
        // if(pokers.length < this.lastCardList.length) return [];

        let lastCardValue = 0;

        for(let i = 0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let santiao = this.GetSameValue(this.lastCardList, poker);
            if(santiao.length >= 3){
                lastCardValue = this.GetCardValue(santiao[0]);
                break;
            }
        }

        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            if(cardValue <= lastCardValue) continue;
            let santiao = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(santiaos, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(santiao.length == 3 && !bInList){
                this.PushTipCard(santiaos, santiao, 3);
            }
            else if(santiao.length > 3 && !bInListEx){
                this.PushTipCard(chai, santiao, 3);
            }
        }

        this.SortCardByMin(santiaos);
        this.SortCardByMin(chai);

        santiaos.push.apply(santiaos, chai);
        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if(this.lastCardType == this.DDZ_CARD_TYPE_3BUDAI){
            this.GetOtherCard(santiaos, 0, false);
        }else if(this.lastCardType == this.DDZ_CARD_TYPE_3DAI1){
            if (sandai.indexOf(0) >= 0){
                //勾选三带一玩法
                this.GetOtherCard(santiaos, 1, false);
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_3DAI2){
            if (sandai.indexOf(1) >= 0){
                //勾选三带二玩法
                this.GetOtherCard(santiaos, 2, true);
            }
        }
        this.GetZhaDanEx(santiaos);
        return santiaos;
    },

    GetSiDaiTip:function(lastCardType,isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let zhadans = [];
        let chai = [];

        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            let zhadan = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(zhadans, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(zhadan.length == 4 && !bInList){
                this.PushTipCard(zhadans, zhadan, 4);
            }
            else if(zhadan.length > 4 && !bInListEx){
                this.PushTipCard(chai, zhadan, 4);
            }
        }

        zhadans.push.apply(zhadans, chai);
        //判断玩法
        let sidai=this.DDZRoom.GetRoomConfigByProperty("sidai");
        if(lastCardType == this.DDZ_CARD_TYPE_4DAI2){
            if (sidai.indexOf(0) >= 0){
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 2, false, isSelectCard);
            }
        }
        else if(lastCardType == this.DDZ_CARD_TYPE_4DAI4){
            if (sidai.indexOf(1) >= 0){
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 4, true, isSelectCard);
            }
        }else if(lastCardType == this.DDZ_CARD_TYPE_4DAI1){
            if (sidai.indexOf(2) >= 0){
                //勾选四带1单张玩法
                this.GetOtherCard(zhadans, 1, false, isSelectCard);
            }
        }else if(lastCardType == this.DDZ_CARD_TYPE_4DAI21){
            if (sidai.indexOf(3) >= 0){
                //勾选四带一对玩法
                this.GetOtherCard(zhadans, 2, true, isSelectCard);
            }
        }
        return zhadans;
    },

    GetSiDai:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        let zhadans = [];
        let chai = [];
        // if(pokers.length < this.lastCardList.length) return [];

        let lastCardValue = 0;

        for(let i = 0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let zhadan = this.GetSameValue(this.lastCardList, poker);
            if(zhadan.length >= 4){
                lastCardValue = this.GetCardValue(zhadan[0]);
                break;
            }
        }

        for(let i = 0; i < pokers.length; i++){
            let poker = pokers[i];
            let cardValue = this.GetCardValue(poker);
            if(cardValue <= lastCardValue) continue;
            let zhadan = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(zhadans, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            if(zhadan.length == 4 && !bInList){
                this.PushTipCard(zhadans, zhadan, 4);
            }
            else if(zhadan.length > 4 && !bInListEx){
                this.PushTipCard(chai, zhadan, 4);
            }
        }

        zhadans.push.apply(zhadans, chai);
        //判断玩法
        let sidai=this.DDZRoom.GetRoomConfigByProperty("sidai");
        if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI2){
            if (sidai.indexOf(0) >= 0){
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 2, false);
            }
        }
        else if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI4){
            if (sidai.indexOf(1) >= 0){
                //勾选四带2单张玩法
                this.GetOtherCard(zhadans, 4, true);
            }
        }else if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI1){
            if (sidai.indexOf(2) >= 0){
                //勾选四带1单张玩法
                this.GetOtherCard(zhadans, 1, false);
            }
        }else if(this.lastCardType == this.DDZ_CARD_TYPE_4DAI21){
            if (sidai.indexOf(3) >= 0){
                //勾选四带一对玩法
                this.GetOtherCard(zhadans, 2, true);
            }
        }

        this.GetZhaDanEx(zhadans);
        return zhadans;
    },

    //得到真正的飞机
    GetRealPlane:function(lists){
        let lastValue = 0;
        let realPlane = [];
        for(let i = 0; i < lists.length; i++){
            let item = lists[i];
            let nowValue = this.GetCardValue(item[0]);
            
            if(lastValue != 0){
                if((lastValue+1) != nowValue){
                    if(realPlane.length >= 2){
                        break;
                    }
                    realPlane.splice(0, realPlane.length);
                    realPlane[realPlane.length] = item;
                }
                else{
                    realPlane[realPlane.length] = item;
                }
            }
            else{
                realPlane[realPlane.length] = item;
            }

            lastValue = nowValue;
        }
        return realPlane;
    },

    GetFeiJiTip:function(tag,isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return [];
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return [];
        }
        let tempArrB = [];

        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let santiao = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInList(tempArrB, poker);
            if(santiao.length >= 3 && !bInList && this.GetCardValue(poker) != 15){
                this.RegularCard(tempArrB, santiao, 3);
            }
        }

        //如果第一次检测三条小于2对 肯定凑不成飞机
        if(tempArrB.length < 2){
            // let zhadan = [];
            // this.GetZhaDanEx(zhadan);
            // return zhadan;
            return [];
        }
        
        this.SortCardByMin(tempArrB);

        //tempArrB里的三带或四带飞机找出来 去除不用的三条或四条
        let temp = [];
        let lastValue = 0;
        for(let i = 0; i < tempArrB.length; i++){
            let item = tempArrB[i];
            let nowValue = this.GetCardValue(item[0]);
            
            if(lastValue != 0){
                if((lastValue+1) != nowValue){
                    temp.splice(0, temp.length);
                    temp[temp.length] = item;
                }
                else{
                    temp[temp.length] = item;
                }
            }
            else{
                temp[temp.length] = item;
            }
            
            lastValue = nowValue;
        }
        //将真正的飞机合并成一个数组
        let realPlane = [];
        if(temp.length){
            let tp = [];
            for(let i = 0; i < temp.length; i++){
                let item = temp[i];
                for(let j = 0; j < item.length; j++){
                    tp.push(item[j]);
                }
            }

            realPlane[realPlane.length] = tp;
        }
        if(realPlane.length){
            if(tag == this.DDZ_CARD_TYPE_FEIJI1){
                let needCard1 = realPlane[0].length + (realPlane[0].length/3)*1;
                this.GetOtherCard(realPlane,(realPlane[0].length/3)*1,false,isSelectCard);
                if (!realPlane.length) {
                    return [];
                }
                //如果选中的牌不是所有牌，并且不满足完整牌型，return []
                if (realPlane[0].length != needCard1 && pokers != this.handCardList) {
                    return [];
                }
            }
            else if(tag == this.DDZ_CARD_TYPE_FEIJI2){
                let needCard2 = realPlane[0].length + (realPlane[0].length/3)*2;
                this.GetOtherCard(realPlane,(realPlane[0].length/3)*2,true,isSelectCard);
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

    GetFeiJi:function(tag,isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        //判断玩法
        let sandai=this.DDZRoom.GetRoomConfigByProperty("sandai");
        if (sandai.indexOf(0) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI1) {
            //没有勾选三带一玩法
            return [];
        }
        if (sandai.indexOf(1) < 0 && tag == this.DDZ_CARD_TYPE_FEIJI2) {
            //没有勾选三带二玩法
            return [];
        }
        let lastCardValue = 0;
        let tempArrA = [];
        let tempArrB = [];

        for(let i = 0; i < this.lastCardList.length; i++){
            let poker = this.lastCardList[i];
            let santiao = this.GetSameValue(this.lastCardList, poker);
            let bInList = this.CheckPokerInList(tempArrA, poker);
            if(santiao.length >= 3 && !bInList){
                //tempArrA[tempArrA.length] = santiao;
                this.RegularCard(tempArrA, santiao, 3);
            }
        }

        this.SortCardByMin(tempArrA);
        let realPlaneA = [];
        if(tempArrA.length){
            realPlaneA = this.GetRealPlane(tempArrA);
            let lastValue = (this.lastCardList.length - realPlaneA.length * 3);
            if(realPlaneA.length==3 && lastValue==1){
                //三飞机带单根,可以组成  444,555 带 3333
                for(let i=0; i < this.lastCardList.length; i++){
                    let poker = this.lastCardList[i];
                    let zhadan = this.GetSameValue(this.lastCardList, poker);
                    if(zhadan.length >= 4){
                        for (let j = 0; j < realPlaneA.length; j++) {
                            let sameCard = this.GetSameValue(realPlaneA[j], poker);
                            if (sameCard.length == 3) {
                                realPlaneA.splice(j,1);
                            }
                        }
                        break;
                    }
                }
            }else if(realPlaneA.length==4 && lastValue==3){
                //三飞机带单根,可以组成  444,555,666 带 3333 77
                let isHasZhadan = false;
                let isHasDuiZi = false;
                for(let i=0; i < pokers.length; i++){
                    let poker = pokers[i];
                    let zhadan = this.GetSameValue(pokers, poker);
                    if(zhadan.length >= 4){
                        for (let j = 0; j < realPlaneA.length; j++) {
                            let sameCard = this.GetSameValue(realPlaneA[j], poker);
                            if (sameCard.length == 3) {
                                realPlaneA.splice(j,1);
                            }
                        }
                        break;
                    }
                }
            }
            lastCardValue = this.GetCardValue(realPlaneA[0][0]);
        }

        for(let i=0; i < pokers.length; i++){
            let poker = pokers[i];
            let santiao = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInList(tempArrB, poker);
            if(santiao.length >= 3 && !bInList && this.GetCardValue(poker) != 15){
                //tempArrB[tempArrB.length] = santiao;
                this.RegularCard(tempArrB, santiao, 3);
            }
        }

        //如果第一次检测三条小于2对 肯定凑不成飞机
        if(tempArrB.length < 2){
            let zhadan = [];
            this.GetZhaDanEx(zhadan);
            return zhadan;
        }
        
        this.SortCardByMin(tempArrB);

        //tempArrB里的三带或四带飞机找出来 去除不用的三条或四条
        let temp = [];
        let lastValue = 0;
        for(let i = 0; i < tempArrB.length; i++){
            if(this.GetCardValue(tempArrB[i][0]) <= lastCardValue) continue;
            if(temp.length == realPlaneA.length) break;

            let item = tempArrB[i];
            let nowValue = this.GetCardValue(item[0]);
            
            if(lastValue != 0){
                if((lastValue+1) != nowValue){
                    temp.splice(0, temp.length);
                    temp[temp.length] = item;
                }
                else{
                    temp[temp.length] = item;
                }
            }
            else{
                temp[temp.length] = item;
            }
            
            lastValue = nowValue;
        }
        //如果飞机数量不足 返回空
        if(temp.length < realPlaneA.length){
            let zhadan = [];
            this.GetZhaDanEx(zhadan);
            return zhadan;
        }
        //将真正的飞机合并成一个数组
        let realPlane = [];
        if(temp.length){
            let tp = [];
            for(let i = 0; i < temp.length; i++){
                let item = temp[i];
                for(let j = 0; j < item.length; j++){
                    tp.push(item[j]);
                }
            }

            realPlane[realPlane.length] = tp;
        }
        if(realPlane.length){
            if(tag == this.DDZ_CARD_TYPE_FEIJI1){
                this.GetOtherCard(realPlane, this.lastCardList.length - realPlane[0].length, false);
            }
            else if(tag == this.DDZ_CARD_TYPE_FEIJI2){
                this.GetOtherCard(realPlane, this.lastCardList.length - realPlane[0].length, true);
            }
        }
        
        this.GetZhaDanEx(realPlane);
        return realPlane;
    },
    GetLianDuiTip:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        let tempArrB = [];

        
        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let duizi = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(tempArrB, poker);
            if(duizi.length >= 2 && !bInList){
                this.PushTipCard(tempArrB, duizi, 2);
            }
        }
        
        this.SortCardByMin(tempArrB);

        let temps = [];
        for(let i = 0; i < tempArrB.length; i++){
            let tp = [];
            tp.push.apply(tp, tempArrB[i]);
            let lastValue = 0;
            lastValue = this.GetCardValue(tempArrB[i][0]);
            for(let j = i+1; j < tempArrB.length; j++){
                let item = tempArrB[j];
                let nowValue = this.GetCardValue(item[0]);
            
                if(nowValue == 15){
                    break;
                }
    
                if((lastValue+1) != nowValue){
                    break;
                }
                tp.push.apply(tp, item);
                lastValue = nowValue;
                if(tp.length >= 6){
                    temps[temps.length] = tp;
                }
            }
        }
        return temps;
    },

    GetLianDui:function(isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        // if(pokers.length < this.lastCardList.length) return [];

        let lastCardValue = 0;
        let tempArrA = [];
        let tempArrB = [];

        this.SortCardByMinEx(this.lastCardList);
        lastCardValue = this.GetCardValue(this.lastCardList[0]);
        tempArrA = this.lastCardList;
        
        for(let i = pokers.length - 1; i >= 0; i--){
            let poker = pokers[i];
            let duizi = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(tempArrB, poker);
            if(duizi.length >= 2 && !bInList){
                this.PushTipCard(tempArrB, duizi, 2);
            }
        }
        
        this.SortCardByMin(tempArrB);

        let temps = [];
        for(let i = 0; i < tempArrB.length; i++){
            let tp = [];
            if(this.GetCardValue(tempArrB[i][0]) <= lastCardValue) continue;
            tp.push.apply(tp, tempArrB[i]);
            let lastValue = 0;
            lastValue = this.GetCardValue(tempArrB[i][0]);
            for(let j = i+1; j < tempArrB.length; j++){
                let item = tempArrB[j];
                let nowValue = this.GetCardValue(item[0]);
            
                if(nowValue == 15){
                    break;
                }
    
                if((lastValue+1) != nowValue){
                    break;
                }

                tp.push.apply(tp, item);
                lastValue = nowValue;

                if(tp.length == tempArrA.length){
                    temps[temps.length] = tp;
                    break;
                }
            }
        }

        this.GetZhaDanEx(temps);
        return temps;
    },

    GetOtherCard:function(list, tag, needDuizi = false, isSelectCard=false){
        let pokers = [];
        if(isSelectCard==false){
            pokers = this.handCardList;
        }else{
            pokers = this.selectCardList;
        }
        if(!list.length) return;
        let needPokersCount = 0;
        for (let i = 0; i < list.length; i++) {
            needPokersCount = list[i].length + tag;
        }

        let temp = []; 
        let chai = [];
        for(let i = pokers.length -1; i >= 0; i--){
            let poker = pokers[i];
            let cards = this.GetSameValue(pokers, poker);
            let bInList = this.CheckPokerInListEx(temp, poker);
            let bInListEx = this.CheckPokerInListEx(chai, poker);
            let bInListExEx = this.CheckPokerInListEx(list, poker);
            if(cards.length == 1 && !bInList){// && !bInListExEx
                this.PushTipCard(temp, cards, 1);
            }
            else if(cards.length >= 2 && !bInListEx){// && !bInListExEx
                this.PushTipCard(chai, cards, 2);
            }
        }

        // temp.push.apply(temp, chai);
        //先将list拷贝出来
        let tempList = [];
        tempList = list;
        //将获得的牌加入三条,四条或者飞机之中
        for(let i = 0; i < tempList.length; i++){
            let item = tempList[i];
            let len = item.length;
            if (!needDuizi) {
                for(let j = 0; j < temp.length; j++){
                    if(list[i].length - len == tag){
                        break;
                    }
                    let tp = temp[j];
                    for(let k = 0; k < tp.length; k++){
                        if(list[i].length - len == tag){
                            break;
                        }
                        if(item.indexOf(tp[k]) == -1){
                            //将获得的带牌加入list
                            list[i].push(tp[k]);
                        }
                    }
                }
            }
            else if (needDuizi) {
                //必须是对子
                for(let j = 0; j < chai.length; j++){
                    if(list[i].length - len == tag){
                        break;
                    }
                    let tp = chai[j];
                    for(let k = 0; k < tp.length; k++){
                        if(list[i].length - len == tag){
                            break;
                        }
                        if(item.indexOf(tp[k]) == -1){
                            //将获得的带牌加入list
                            list[i].push(tp[k]);
                        }
                    }
                }
            }
            //如果需要带对的，如果没有对。不能出
            if (needDuizi && chai.length == 0){
                list.splice(0,list.length);
                return;
            }
            //如果带的牌有王炸，不能出
            let guipai = 0;
            for (let i = 0; i < list.length; i++) {
                if (typeof(list[i]) == "object") {
                    for (let j = 0; j < list[i].length; j++) {
                        if (this.GetCardValue(list[i][j]) == this.LOGIC_MASK_XIAOWANG || 
                            this.GetCardValue(list[i][j]) == this.LOGIC_MASK_DAWANG) {
                            guipai++;
                        }
                    }
                }else{
                    if (this.GetCardValue(list[i]) == this.LOGIC_MASK_XIAOWANG || 
                        this.GetCardValue(list[i]) == this.LOGIC_MASK_DAWANG) {
                        guipai++;
                    }
                }
                
            }
            if (guipai >= 2) {
                list.splice(0,list.length);
                return;
            }
        }
        //判断下如果加入的牌还不够上家的牌型并且手上还有牌需要补充
        let curPokersCount = 0;
        for (let i = 0; i < list.length; i++) {
            curPokersCount = list[i].length;
        }
        if (curPokersCount < needPokersCount) {
            if (!needDuizi) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].length >= needPokersCount) continue;
                    for (let j = 0; j < pokers.length; j++) {
                        if (list[i].indexOf(pokers[j]) == -1) {
                            //将获得的带牌加入list
                            list[i].push(pokers[j]);
                            if (list[i].length == needPokersCount) {
                                break;
                            }
                        }
                    }
                }
            }else{
                //如果需要对。但是还有牌没带的，则不能飞机
                list.splice(0,list.length);
            }
        }
    },

///////////////////////////common///////////////////////////////////////
    CheckPokerInList:function(list, tagCard) { 
        if (list.length == 0) return false;

        let bInList = false;
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let pos = item.indexOf(tagCard);
        
            if (pos >= 0){
                return true;
            }
        }
        return bInList
    },

    CheckPokerInListEx:function(list, tagCard){
        if (list.length == 0) return false;
        
        let bInList = false;
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let tagValue = this.GetCardValue(tagCard);
            for (let j = 0; j < item.length; j++) {
                let cardValue = this.GetCardValue(item[j]);
                if(cardValue == tagValue){
                    return true;
                }
            }
        }
        return bInList;
    },

    //检测列表是否全是对子
    CheckTagIsDuizi:function(tagList){
        if (tagList.length < 2) return false;
        if (tagList.length%2 == 1) return false;

        let duiziNum = tagList.length/2;
        for (let j = 0; j < duiziNum; j++) {
            for(let i = 0; i < tagList.length; i++){
                let poker = tagList[i];
                let duizi = this.GetSameValue(tagList, poker);
                if(duizi.length >= 2){
                    let pos1 = tagList.indexOf(duizi[0]);
                    tagList.splice(pos1, 1);
                    let pos2 = tagList.indexOf(duizi[1]);
                    tagList.splice(pos2, 1);
                    break;
                }
            }
        }
        if (tagList.length == 0)
            return true;
        else
            return false;
    },

    //获取带牌
    GetDaiPaiList:function(pokers, sameList) {
        let tempList = [];
        for (let i = 0; i < sameList.length; i++) {
            tempList.push.apply(tempList, sameList[i]);
        }
        let daiPaiList = [];
        for (let i = 0; i < pokers.length; i++) {
            let poker = pokers[i];
            let index = tempList.indexOf(poker);
            if(index == -1){
                daiPaiList.push(poker);
            }
        }
        return daiPaiList;
    },
    
    //获取同一牌值
    GetSameValue:function(pokers, tagCard) { 
        let sameValueList = [];
        let tagCardValue = this.GetCardValue(tagCard);
        for (let i = 0; i < pokers.length; i++) {
            let poker = pokers[i];
            let pokerValue = this.GetCardValue(poker);

            if (tagCardValue == pokerValue){
                sameValueList[sameValueList.length] = poker;
            }
        }
        return sameValueList
    },
    //获取同一花色
    GetSameColor:function(pokers, tagCard) { 
        let sameColorList = [];
        for (let i = 0; i < pokers.length; i++) {
            let poker = pokers[i];
            let pokerColor = this.GetCardColor(poker);
            let tagCardColor = this.GetCardColor(tagCard);

            if (pokerColor == tagCardColor){
                sameColorList[sameColorList.length] = poker;
            }
        }
        return sameColorList;
    },

    //获取牌值
    GetCardValue:function(poker) {
        let realPoker = 0;
        if(poker > 500){
            realPoker = poker - 500;
        }
        else{
            realPoker = poker;
        }
        //大小王值最大
        if (realPoker == 65)
            return this.LOGIC_MASK_XIAOWANG;
        if (realPoker == 66)
            return this.LOGIC_MASK_DAWANG;
        return realPoker&this.LOGIC_MASK_VALUE;
    },

    //获取花色
    GetCardColor:function(poker) { 
        let realPoker = 0;
        if(poker > 500){
            realPoker = poker - 500;
        }
        else{
            realPoker = poker;
        }
        return realPoker&this.LOGIC_MASK_COLOR;
    },

    CheckSameValue:function(aCards,bCards){
        let bRet = false;
        for(let i = 0; i < aCards.length; i++){
            let poker = aCards[i];
            if(bCards.indexOf(poker) != -1){
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
exports.GetModel = function(){
    if(!g_LogicDDZGame){
        g_LogicDDZGame = new LogicDDZGame();
    }
    return g_LogicDDZGame;

}