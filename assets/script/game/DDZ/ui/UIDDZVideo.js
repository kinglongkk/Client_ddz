var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        handCards:cc.Node,
        control_list:cc.Node,
        img_dzp:cc.Node,
        boom_Ani:cc.Node,
        plane_Ani:cc.Node,
        cardPrefab:cc.Prefab,
        wanfa:cc.Label,
        lb_publicScore:cc.Label,
        lb_publicMultiple:cc.Label,
    },

    OnCreateInit: function () {
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

    OnShow:function(){
        let switchGameData = cc.sys.localStorage.getItem("switchGameData");
        let playBackCode = JSON.parse(switchGameData).backCode;
        console.log("playBackCode === " + playBackCode);
        cc.sys.localStorage.setItem("switchGameData", "");
        this.GetPlayBackDataByCode(playBackCode);
    },

    GetPlayBackDataByCode:function(playBackCode){
        this.wanfa.string="";
        this.HideAll();
        this.jin1=-1;
        this.jin2=-1;
        this.playerList=false;  //玩家列表
        this.playerCount=0;    //玩家个数
        this.playkey=0;       //回放帧
        this.playBack=false;  //回放日志
        this.NextPlayTime=0;   //下帧播放时间
        this.pause=false;      //暂停
        this.fadeOutTime=5;    //淡出时间
        this.dPos=-1;   //庄家
        this.minplay=0;  //快退最多能退到的帧数
        this.clientPos = 0;
        this.PlayBackList=new Array();
        console.log("UIPokerVideo playBackCode：",playBackCode);
        this.NetManager.SendPack("game.CPlayerPlayBack", {"playBackCode":playBackCode,"chekcPlayBackCode":false},this.OnPack_VideoData.bind(this), this.OnVideoFailed.bind(this));
    },

    OnVideoFailed:function(serverPack){
        this.SetWndProperty("UIMessageNoExist", "active",true);
    },

    OnPack_PlayBackData:function(serverPack){
        let playBackNum=serverPack.playBackNum;
        let key=serverPack.id;
        this.PlayBackList[key]=serverPack.msg;
        if(this.PlayBackList.length==playBackNum){
            let PlayBackJson='';
            for(let i=0;i<playBackNum;i++){
                PlayBackJson+=this.PlayBackList[i];
            }
            let playBack=eval('(' + PlayBackJson + ')');
            this.playBack=playBack.playbackList;
            console.log("OnPack_PlayBackData mt this.playBack:",this.playBack);
            this.NextPlayTime=Math.round(new Date().getTime()/1000)-1;
            this.schedule(this.Play,0.5);
        }
    },

    OnPack_VideoData:function(serverPack){
    	this.playerList=this.Str2Json(serverPack.playerList);
    	this.dPos=serverPack.dPos;
    	this.playerCount=this.playerList.length;
    	let roomKey=serverPack.roomKey;
    	let setID=serverPack.setID;
    	let setAll=serverPack.setCount;
        this.curRoomID = serverPack.roomID;
        this.curTabId = serverPack.tabId;
        this.SetRoomInfo(this.playerCount,roomKey,setID,setAll);
        //获取对局人数
        this.playerCount = this.playerList.length;
        this.isSelf = false;
        //先找出玩家自己的位置
        for(let i = 0; i < this.playerList.length; i++){
            if(app[app.subGameName + "_HeroManager"]().GetHeroID() == this.playerList[i].pid){
                this.clientPos = this.playerList[i].pos;
                this.isSelf = true;
                break;
            }
        }
    	this.ShowPlayerInfo(this.playerList);
	},
	
	InitCard:function(){
		//玩家手牌
        this.handCards.active = false;
        for(let i = 0; i < this.DDZDefine.MaxHandCard; i++){
            let card = cc.instantiate(this.cardPrefab);
            card.active = false;
            card.name = "card_" + (i+1).toString();
            this.handCards.addChild(card);
        }

        //玩家打出去的牌
        for(let i = 0; i < this.DDZDefine.MaxPlayer; i++){
            let outCardList = this.node.getChildByName("outCardList"+i);
            outCardList.active = false;
            for(let j = 0; j < this.DDZDefine.MaxHandCard; j++){
                let card = cc.instantiate(this.cardPrefab);
                card.active = false;
                card.name = "card_" + (i+1).toString();
                outCardList.addChild(card);
            }
        }

        //玩家明牌的牌
        for(let i = 1; i < this.DDZDefine.MaxPlayer; i++){
            let openCardList = this.node.getChildByName("openCardList"+i);
            openCardList.active = false;
            for(let j = 0; j < this.DDZDefine.MaxHandCard; j++){
                let card = cc.instantiate(this.cardPrefab);
                card.active = false;
                card.name = "card_" + (i+1).toString();
                openCardList.addChild(card);
            }
        }

        //地主牌
        for (var i = 0; i < 3; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.active = false;
            card.scale = 0.39;
            card.name = "dzcard_" + (i+1).toString();
            this.img_dzp.addChild(card);
        }
    },
    
	SetRoomInfo:function(playercount,roomKey,setID,setAll){
		this.SetWndProperty("room_data/label_player_num", "text",playercount+"人场");
		this.SetWndProperty("room_data/label_player_ju", "text","局数："+setID+"/"+setAll);
		this.SetWndProperty("room_data/label_player_roomkey", "text","房间号："+roomKey);
    },
    
    SetPlayInfo:function(){
        let playnow=this.playkey+1;
        let max=this.playBack.length;
        if(playnow>max){
            playnow=max;
        }
        if(playnow<0){
            playnow=0;
        }
        // this.SetWndProperty("playinfo", "text",playnow+"/"+max);
    },

    //服务端位置转客户端位置
	GetUIPosByDataPos:function(dataPos){
		let playerCount = this.playerList.length;
		let uiPos = (dataPos + (this.playerCount - this.clientPos)) % playerCount;
		return uiPos;
    },

    GetPlayerPos:function(dataPos){
        let uiPos = -1;
        if(this.isSelf){
            uiPos = this.GetUIPosByDataPos(dataPos);
        }
        else{
            uiPos =  dataPos;
        }

        return uiPos;
    },
    
    SetSeat01OutCardPos:function(dataPos, len){
        let uiPos = this.GetPlayerPos(dataPos);
        
        
        if(uiPos != 1) return;

        let node = this.node.getChildByName("outCardList1");
        let posX = 525 - 25 * len;
        node.x = posX;
    },

	ShowPlayerInfo(playerList){
		for(let i = 0; i < playerList.length; i++){
            let uiPos = this.GetPlayerPos(playerList[i].pos);
            let heroID = playerList[i].pid;
            let head = this.GetWndNode("sp_seat0"+uiPos+"/head");
            head.active = true;
            //显示用户头像
            head.getChildByName("touxiang").getChildByName("btn_headkuang").getChildByName("mask").getChildByName("btn_head").getComponent(app.subGameName + "_WeChatHeadImage").ShowHeroHead(heroID)
            //显示用户名字
			let sp_info = head.getChildByName('touxiang').getChildByName('sp_info');
			sp_info.getChildByName('lb_name').getComponent("cc.Label").string = playerList[i].name;
		}
	},
	
    HideAll:function(){
        this.SetWndProperty("UIMessageNoExist", "active",false);
        // this.SetWndProperty("playinfo", "text",'');
        for(let i = 0 ; i < 3; i++){
            let ShowNode = this.GetWndNode("sp_seat0"+i);
            if(i != 0){
                ShowNode.getChildByName('card').active=false;
                ShowNode.getChildByName('cardNum').active = false;
            }
            this.GetWndNode("sp_seat0"+i+"/jiesan").active = false;
            let head = this.GetWndNode("sp_seat0"+i+"/head");
            //显示地主
            head.getChildByName("touxiang").getChildByName("icon_dzm").active = false;
            //显示是否加倍
            head.getChildByName("touxiang").getChildByName("img_jb").active = false;
            ShowNode.getChildByName('pass').active=false;
            ShowNode.getChildByName('head').active=false;
            head.getChildByName("touxiang").getChildByName("trusteeship").active = false;
        }
        this.HideAllOutCard();
        this.HideAllOpenCard();
        this.HideAllHandCard();
    },

    HideAllHandCard:function(){
        this.handCards.active = false;
        for(let i = 0; i < this.handCards.children.length; i++){
            let child = this.handCards.children[i];
            child.active = false;
        }
    },

    HideAllOutCard:function(){
        for(let i = 0; i < this.DDZDefine.MaxPlayer; i++){
            let outCard = this.node.getChildByName("outCardList" + i);
            outCard.active = false;
        }
    },

    HideAllOpenCard:function(){
        for(let i = 1; i < this.DDZDefine.MaxPlayer; i++){
            let openCardList = this.node.getChildByName("openCardList" + i);
            openCardList.active = false;
        }
    },

    HidePokerBack:function(){
        for(let i = 1; i < this.DDZDefine.MaxPlayer; i++){
            let poker_back = this.GetWndNode("sp_seat0"+i+"/card/poker_back");
            if(!poker_back.active){
                poker_back.active = true;
            }
        }
    },


    SetWanFa:function(cfg,isClub){
        let wanfa=this.WanFa(cfg);
        if(isClub==true){
            this.wanfa.string="亲友圈,"+wanfa;
        }else{
            this.wanfa.string=wanfa;
        }
    },
    ShowPosLostConnect:function(posID,isLostConnect){
        let uiPos = this.GetPlayerPos(posID);
        let seat = this.GetWndNode("sp_seat0"+uiPos+"/head");
        if(isLostConnect==true){
            seat.getChildByName('touxiang').getChildByName('sp_lixian').active=true;
        }else{
            this.scheduleOnce(function(){
              seat.getChildByName('touxiang').getChildByName('sp_lixian').active=false;
            },2);
        }
        
    },
    ShowShowJieSan:function(posID){
        let uiPos = this.GetPlayerPos(posID);
        let seat = this.GetWndNode("sp_seat0"+uiPos+"/jiesan");
        seat.getChildByName('jiesan').active=true;
        this.scheduleOnce(function(){
              seat.getChildByName('jiesan').active=false;
        },2);
    },

	PlayData(){
        if(this.playkey == -1){
            this.playkey = 0;
        }
		let data=this.playBack[this.playkey];
		if(!data){
			return false;
		}
        this.SetPlayInfo();
		console.log("PlayForce data:",data);
		let type=data.name;
		let res=data.res;
		let waitSecond=0;//本帧播放时间
        // if(data["setPosCard"]){
        //     for(let i=0;i<data["setPosCard"].length;i++){
        //         let posID=data["setPosCard"][i].posID;
        //         let isLostConnect=data["setPosCard"][i].isLostConnect;
        //         this.ShowPosLostConnect(posID,isLostConnect);
        //     }
        // }
		if(type.indexOf("SDDZ_Config")>=0){
            waitSecond=0;
            this.SetWanFa(res.cfg,res.isClub);

        }else if(type.indexOf("StartVoteDissolve")>=0){
            waitSecond=2;
            let createPos=res.createPos;
            this.ShowShowJieSan(createPos);
        }else if(type.indexOf("SDDZ_SetStart")>=0){
            waitSecond=1;
            this.HideAllOutCard();
            this.PlaySetStart(res, data.setPosCard);
            this.UpdateScoreAndDouble(res.setInfo.hogScore, res.setInfo.roomDouble);
        }
        else if(type.indexOf("SDDZ_ChangeStatus")>=0){
            waitSecond=1;
            this.HideAllOutCard();
            this.PlayChangeStatus(res);
            this.UpdateScoreAndDouble(null, res.roomDouble);
        }else if(type.indexOf("SDDZ_Hog")>=0){
            waitSecond=1;
            this.UpdateScoreAndDouble(res.hogScore, res.roomDouble);
        }
        else if(type.indexOf("SDDZ_OpCard")>=0){
            waitSecond=1;
            this.PlayOpCard(res, data.setPosCard);
            this.UpdateScoreAndDouble(null, res.roomDouble);
        }
        else if(type.indexOf("SDDZ_SetEnd")>=0){
			waitSecond=4000000;
			this.PlayEnd(res);
        }
        else{
			console.log("Play type no play:",type);
			console.log("Play type no play data:",data);
			this.pause==true;
			return;
		}
		this.playkey+=1;
		this.NextPlayTime=Math.round(new Date().getTime()/1000)+waitSecond;
    },
    
	Play:function(){
		this.fadeOutTime=this.fadeOutTime-0.5;
		if(this.fadeOutTime<=0 && this.fadeOutTime>-2){
			this.HideControl();
		}
		let now=Math.round(new Date().getTime()/1000);
		if(this.NextPlayTime==0 || now<this.NextPlayTime){
			return
		}
		if(this.pause==true){
			return
		}
		this.PlayData();
    },
    
    PlayAddDouble:function(res){

    },

    PlayRobClose:function(res){

    },
	
	PlayEnd:function(res){
        let data=res.setEnd;
        app[app.subGameName + "Client"].ExitGame();
    },

    ShowPass:function(dataPos){
        let uiPos = this.GetPlayerPos(dataPos);
        let node = this.GetWndNode("sp_seat0"+uiPos+"/pass");
        node.active = true;
    },
    
	PlayOpCard(res, setPosCard){
        let data = res;
        this.SetSeat01OutCardPos(data.pos, data.cardList.length);
        this.ShowOutCard(data.pos, data.cardList);
        this.HidePokerBack();
        //显示托管图标
        let uiPos = this.GetPlayerPos(data.pos);
        let trusteeshipNode = this.GetWndNode("sp_seat0"+uiPos+"/head/touxiang/trusteeship");
        trusteeshipNode.active = data.isFlash;
        if(!data.cardList.length && data.opCardType == 1){
            this.ShowPass(data.pos);
        }
        if(setPosCard){
            for(let i = 0; i < this.playerList.length; i++){
                let player = this.playerList[i];
                if(this.isSelf){
                    if(player.pos == this.clientPos){
                        this.ShowSelfCard(setPosCard[player.pos]);
                    }
                    else{
                        this.ShowOpenCardList(player.pos, setPosCard[player.pos]);
                    }
                }
                else{
                    if(player.pos == 0){
                        this.ShowSelfCard(setPosCard[player.pos]);
                    }
                    else{
                        this.ShowOpenCardList(player.pos, setPosCard[player.pos]);
                    }
                }
                
            }

            //显示动画特效
            if(data.opCardType == 11){
                //炸弹
                this.boom_Ani.active = true;
                this.SetAniPos(data.pos);
                this.boom_Ani.getComponent(cc.Animation).play("zhadan");
            }
            else if(data.opCardType == 12 || data.opCardType == 13){
                this.plane_Ani.active = true;
                this.plane_Ani.getComponent(cc.Animation).play("feiji");
            }
        }
    },
    
    SetAniPos:function(dataPos){
        let uiPos = this.GetUIPosByDataPos(dataPos);
        if(uiPos == 1){
            this.boom_Ani.setPosition(cc.v2(232, 64));
        }
        else{
           let outCardList = this.node.getChildByName("outCardList"+uiPos);
           this.boom_Ani.setPosition(cc.v2(outCardList.x, outCardList.y));
        }
    },

    PlayChangeStatus:function(res){
        if (res.state == this.ShareDefine.DDZSetState_Hog) {
            let holeCards = res.holeCards;
            for (let i = 0; i < holeCards.length; i++) {
                let cardNode = this.img_dzp.children[i];
                let cardValue = holeCards[i];
                if(cardValue){
                    this.ShowCard(cardValue, cardNode);
                }
                else{
                    cardNode.active = false;
                }
            }
            this.img_dzp.active = true;
        }
        else if (res.state == this.ShareDefine.DDZSetState_AddDouble) {
            let addDoubleList = res.addDoubleList;
            for(let i = 0; i < addDoubleList.length; i++){
                let isLandowner = false;
                if (res.landowner == i) {
                    isLandowner = true;
                }
                let uiPos = this.GetPlayerPos(i);
                let head = this.GetWndNode("sp_seat0"+uiPos+"/head");
                //显示地主
                head.getChildByName("touxiang").getChildByName("icon_dzm").active = isLandowner;
                //显示是否加倍
                if (addDoubleList[i] == 1) {
                    head.getChildByName("touxiang").getChildByName("img_jb").active = true;
                }
                else{
                    head.getChildByName("touxiang").getChildByName("img_jb").active = false;
                }
            }
        }
    },
    
	PlaySetStart:function(res, setPosCard){
        for(let i = 0; i < this.playerList.length; i++){
            let player = this.playerList[i];
            let uiPos = this.GetPlayerPos(player.pos);
            let cardList = setPosCard[player.pos];
            if(uiPos == 0){
                if(cardList.length == 24){
                    this.handCards.getComponent(cc.Layout).spacingX = -95;
                }
                else{
                    this.handCards.getComponent(cc.Layout).spacingX = -90;
                }
                this.ShowSelfCard(cardList);
            }
            else{
                this.ShowOpenCardList(player.pos, cardList);
                this.GetWndNode("sp_seat0"+uiPos+"/card").active = true;
                this.GetWndNode("sp_seat0"+uiPos+"/cardNum").active = true;
                this.GetWndNode("sp_seat0"+uiPos+"/cardNum").getComponent(cc.Label).string = cardList.length + '张';
            }
        }
    },

    ShowSelfCard:function(cardList){
        this.SortCardByMax(cardList);
        this.handCards.active = true;
        for(let i = 0; i < this.handCards.children.length; i++){
            let cardNode = this.handCards.children[i];
            let cardValue = cardList[i];
            if(cardValue){
                this.ShowCard(cardValue, cardNode);
            }
            else{
                cardNode.active = false;
            }
        }
    },

    ShowOutCard:function(dataPos, cardList){
        let uiPos = this.GetPlayerPos(dataPos);
        let pass = this.GetWndNode("sp_seat0"+uiPos+"/pass");
        pass.active = false;
        let outCardNodeList = this.node.getChildByName("outCardList"+uiPos);
        outCardNodeList.active = true;
        for(let i = 0; i < outCardNodeList.children.length; i++){
            let cardNode = outCardNodeList.children[i];
            let value = cardList[i];
            if(value){
                this.ShowCard(value, cardNode);
            }
            else{
                cardNode.active = false;
            }
        }
    },
    
    ShowOpenCardList:function(dataPos, cardList){
        let uiPos = this.GetPlayerPos(dataPos);
        if(uiPos == 0) return;
        this.SortCardByMax(cardList);
        let openCardList = this.node.getChildByName("openCardList" + uiPos);
        openCardList.active = true;
        for(let i = 0; i < openCardList.children.length; i++){
            let cardNode = openCardList.children[i];
            let value = cardList[i];
            if(value){
                this.ShowCard(value, cardNode);
            }
            else{
                cardNode.active = false;
            }
        }
        this.GetWndNode("sp_seat0"+uiPos+"/cardNum").getComponent(cc.Label).string = cardList.length + '张';
    },

    SortCardByMax:function(pokers){
        pokers.sort(function(a, b){
            //大小王值最大
            let value_a = a&0x0F;
            let value_b = b&0x0F;
            if (value_a == 1) 
                value_a = 16;
            if (value_a == 2) 
                value_a = 17;
            if (value_b == 1) 
                value_b = 16;
            if (value_b == 2) 
                value_b = 17;
            return value_b - value_a;
        });
    },
	
	OnAniPlayFinished:function(event){
        if(event.target.name == 'feiji'){
            this.plane_Ani.active = false;
        }
        else if(event.target.name == 'zhadan'){
            this.boom_Ani.active = false;
        }
    },
    
    OnClose:function(){
        
    },

    OnClick:function(btnName, btnNode){
    	this.fadeOutTime=5;
        if(btnName == "btn_return"){
            app[app.subGameName + "Client"].ExitGame();
        }else if (btnName == "btnSure") {
            app[app.subGameName + "Client"].ExitGame();
        }
        else if(btnName=="btn_back"){
        	this.OnClickPause();
            if(this.minplay>=this.playkey){
                return;
            }
            this.playkey=this.playkey-2;  //扣一针,播放完一帧帧数会加一，所有要回到上一帧，帧数要-2
            this.PlayData();
        }else if(btnName=="btn_play"){
        	this.OnClickPlay();
        }else if(btnName=="btn_pause"){
        	this.OnClickPause();
        }else if(btnName=="btn_forward"){
        	this.OnClickPause();
        	this.PlayData();
        }else if(btnName=="btn_last"){
            if (this.curTabId <= 1) {
                app[app.subGameName+"_SysNotifyManager"]().ShowSysMsg('当前已经是第一局');
                return;
            }
            this.curTabId--;
            let self = this;
            let sendPack = {};
            sendPack.roomId = this.curRoomID;
            sendPack.tabId = this.curTabId;
            app[app.subGameName+"_NetManager"]().SendPack(app.subGameName+".C"+app.subGameName.toUpperCase()+"GetPlayBackCode", sendPack,function(serverPack){
                let playDataGame=app[app.subGameName+"_ShareDefine"]().GametTypeID2PinYin[serverPack.gameId];
                if (playDataGame != app.subGameName) {
                    app[app.subGameName+"_SysNotifyManager"]().ShowSysMsg('获取回放数据不是该游戏的');
                    return;
                }
                self.GetPlayBackDataByCode(serverPack.playBackCode);
            },
            function(error){
                self.curTabId++;
                app[app.subGameName+"_SysNotifyManager"]().ShowSysMsg('获取回放数据失败,检查是否已经是否第一局');
            });
        }else if(btnName=="btn_next"){
            this.curTabId++;
            let self = this;
            let sendPack = {};
            sendPack.roomId = this.curRoomID;
            sendPack.tabId = this.curTabId;
            app[app.subGameName+"_NetManager"]().SendPack(app.subGameName+".C"+app.subGameName.toUpperCase()+"GetPlayBackCode", sendPack,function(serverPack){
                let playDataGame=app[app.subGameName+"_ShareDefine"]().GametTypeID2PinYin[serverPack.gameId];
                if (playDataGame != app.subGameName) {
                    app[app.subGameName+"_SysNotifyManager"]().ShowSysMsg('获取回放数据不是该游戏的');
                    return;
                }
                self.GetPlayBackDataByCode(serverPack.playBackCode);
            },
            function(error){
                self.curTabId--;
                app[app.subGameName+"_SysNotifyManager"]().ShowSysMsg('获取回放数据失败,检查是否已经是否最后一局');
            });
        }
        else{
            this.ShowControl();
        }
    },

    OnClickPause:function(){
    	this.pause=true;
        this.control_list.getChildByName('btn_play').active=true;
        this.control_list.getChildByName('btn_pause').active=false;
    },

    OnClickPlay:function(){
    	this.pause=false;
        this.control_list.getChildByName('btn_play').active=false;
        this.control_list.getChildByName('btn_pause').active=true;
    },

    HideControl:function(){
    	var action = cc.fadeOut(2.0);
    	this.control_list.runAction(action);
    },

    ShowControl:function(){
    	var action = cc.fadeIn(0.5);
    	this.control_list.runAction(action);
    },

    UpdateScoreAndDouble:function(hogScore, roomDouble){
        if (hogScore != null) {
            this.lb_publicScore.string = hogScore;
        }
        if (roomDouble != null) {
            this.lb_publicMultiple.string = roomDouble;
        }
    },

	//---------计时器，开局发牌逻辑--------------
	OnUpdate:function(){
		
    },
    
    //显示poker牌
    ShowCard:function(cardType, cardNode){
        this.PokerCard.GetPokeCard(cardType, cardNode);
        cardNode.active = true;
        cardNode.getChildByName("poker_back").active = false;
    },

	Str2Json:function(jsondata){
        if(jsondata===""){
            return false;
        }
        var json = JSON.parse(jsondata);
        return json;
    },

    
});