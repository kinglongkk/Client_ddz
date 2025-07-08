var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BasePlay"),

    properties: {
        btn_ready:cc.Node,
        btn_weixin:cc.Node,
        btn_fzkl:cc.Node,
	    btn_cancel:cc.Node,
        btn_go:cc.Node,
        btn_openCardStart:cc.Node,
        handCards:cc.Node,
        allCards:cc.Node,
        gameBtn:cc.Node,
        gameRobLandLord:cc.Node,
        gameRobScore:cc.Node,
        btn_tip:cc.Node,
        btn_pass:cc.Node,
        btn_outCard:cc.Node,
        btn_yaobuqi:cc.Node,
        gameMultiple:cc.Node,
        btn_openCard:cc.Node,
        btn_openSound:cc.Node,
        btn_openMusic:cc.Node,
        boom_Ani:cc.Node,
        plane_Ani:cc.Node,
        liandui_Ani:cc.Node,
        dragon_Ani:cc.Node,
        GameEnd_Ani:cc.Node,
        ShutDow_Ani:cc.Node,
        bg_menu:cc.Node,
        img_jpq:cc.Node,
        img_dzp:cc.Node,
        lb_mypdgsj:cc.Node,
        lb_ddbrjb:cc.Node,

        img_bottom_input1:cc.Node,
        img_bottom_input2:cc.Node,

        labelRoomId:cc.Label,//特殊处理的房间信息显示
        labeiWanfa:cc.Label,
        lb_jushu:cc.Label,
        lb_publicScore:cc.Label,
        lb_publicMultiple:cc.Label,
        roomInfo:cc.Node,

        lb_time:cc.Label,

        headPrefab:cc.Prefab,
        cardPrefab:cc.Prefab,
        giftPrefabs:[cc.Prefab],
        giftNode:cc.Node,

        UIInvitation:cc.Prefab,
     },

    OnCreateInit: function () {
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
        this.btn_talk = this.GetWndNode("bg_bottom/btn_talk");
        this.btn_cardDevice = this.GetWndNode("bg_bottom/btn_cardDevice");

        //公共消息
        this.RegEvent("DDZ_PosContinueGame", this.Event_PosContinueGame);
        this.RegEvent("DDZ_DissolveRoom", this.Event_DissolveRoom);
        this.RegEvent("DDZ_StartVoteDissolve", this.Event_StartVoteDissolve);//发起房间结算投票
        this.RegEvent("DDZ_PosLeave", this.Event_PosLeave);
        this.RegEvent("DDZ_PosUpdate", this.Event_PosUpdate);
        this.RegEvent("DDZ_PosReadyChg", this.Event_PosReadyChg);
        this.RegEvent('GameGift',this.Event_GameGift);
        this.RegEvent('ExitRoomSuccess',this.Event_ExitRoomSuccess);
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

        this.RegEvent('CodeError',this.Event_CodeError);
        cc.game.on(cc.game.EVENT_HIDE,  this.OnEventHide.bind(this));
        cc.game.on(cc.game.EVENT_SHOW,  this.OnEventShow.bind(this));

        this.Left = [false,true,false];

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
            let OpenCard_Ani = this.GetWndNode("sp_seat0"+i+"/OpenCard_Ani");
            OpenCard_Ani.getComponent(cc.Animation).on('finished', this.OnAniPlayFinished, this);
        }
        
        this.InitData();

        this.AddCardPrefab();

        this.invitationNode = cc.instantiate(this.UIInvitation);
        this.node.addChild(this.invitationNode);
    },

    OnShow:function(){
        this.CheckUpdateNotice();
        this.node.getChildByName("tip_exit_node").active=false;
        //确保该玩家还在该房间内，否则强制退出房间
        let roomID = this.DDZRoomMgr.GetEnterRoomID();
        app[app.subGameName + "_NetManager"]().SendPack(app.subGameName+".C"+app.subGameName.toUpperCase()+"GetRoomID", {},function(event){
            if (event.roomID <= 0 || event.roomID != roomID) {
                app[app.subGameName + "Client"].ExitGame();
            }
        },function(error){
            app[app.subGameName + "Client"].ExitGame();
        });
        this.btn_talk.active = this.IsShowChat();
        this.btn_cardDevice.active = this.IsShowCardDevice();
         //初始化邀请在线好友的数据
        this.roomCfg = this.DDZRoomMgr.GetEnterRoom().GetRoomConfig();
        if (this.roomCfg.clubId > 0 || this.roomCfg.unionId > 0) {
            this.invitationNode.active = true;
            this.invitationNode.getComponent(this.invitationNode.name).InitData(this.roomCfg.clubId, this.roomCfg.unionId, roomID);
        }else{
            this.invitationNode.active = false;
        }
        this.isChoose = false;
        this.AddHead();
        this.HideAll();
        this.unscheduleAllCallbacks();
        this.SceneManager.PlayMusic("back_1");
        this.InitData();
        this.ClearForbiddenTouch();
        //设置牌间距,便于选牌
        let handCardsSpacingX = this.handCards.getComponent(cc.Layout).spacingX;
        let cardNodeWidth = this.cardPrefab.data.width;
        this.cardSpcedX = cardNodeWidth + handCardsSpacingX;

        let state = this.DDZRoomSet.GetRoomSetProperty("state");
        let disslove = this.DDZRoom.GetRoomProperty("dissolve");
        let roomState = this.DDZRoom.GetRoomProperty("state");
        this.xianShi = this.DDZRoom.GetRoomConfigByProperty("xianShi");
        //显示房间信息
        this.labeiWanfa.string = this.WanFa();
        if(app[app.subGameName + "_ShareDefine"]().isCoinRoom){
            this.roomInfo.active = false;
        }else{
            this.roomInfo.active = true;
            this.labelRoomId.string = "房间号："+this.DDZRoom.GetRoomProperty("key");
            let setID = this.DDZRoom.GetRoomProperty("setID");
            let current = this.DDZRoom.GetRoomConfigByProperty("setCount");
            this.lb_jushu.string = "局数：" + setID + "/" + current;
        }
        //显示叫分和倍数
        this.UpdateScoreAndDouble();

        //更新金币和钻石
        this.UpdateSelfScore();
        
        if(disslove.endSec != 0){
            //如果有人发起解散消息
            this.FormManager.ShowForm(app.subGameName + "_UIMessage02");
        }

        if(roomState != this.ShareDefine.RoomState_Init){
            let setInfo = this.DDZRoomSet.GetRoomSetInfo();
            //更新记牌器
            this.UpdateCardNum(setInfo.cardNumMap);
            //如果有玩家托管  显示托管图标
            let posList = this.DDZRoom.GetRoomProperty("posList");
            for(let i = 0; i < posList.length; i++){
                let data = posList[i];
                let pos = data['pos'];
                let isAuto = data['trusteeship'];
                if(isAuto){
                    let headScript = this.GetUICardComponentByPos(pos);
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
                let uiPos = this.DDZRoomPosMgr.GetUIPosByDataPos(this.landowner);
                let path = "sp_seat0" + uiPos + "/head" + "/UIDDZHead" + uiPos;
                let headNode = this.GetWndNode(path);
                let headScript = headNode.getComponent("UIDDZHead");
                headScript.Showlandowner(true);
            }
            //发牌阶段
            if(state == this.ShareDefine.DDZSetState_FaPai){
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
            }
            else if(state == this.ShareDefine.DDZSetState_Hog){
                //抢地主阶段
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
                this.ShowBtnHog(setInfo.opPos,setInfo.isHaveHog);
            }
            else if(state == this.ShareDefine.DDZSetState_AddDouble){
                //加倍阶段
                this.InitGameStateCommon(state);
                this.ShowBtnMultiple();
            }
            else if(state == this.ShareDefine.DDZSetState_Playing){
                this.InitGameStateCommon(state);
                this.gameMultiple.active = false;
                this.LogicDDZGame.SetCardData(setInfo.opType, setInfo.cardList);
                //显示当前操作位和上家出的牌
                let time = this.DDZDefine.MaxTickTime[this.xianShi];
                this.lastCircleEnd = setInfo.isFirstOp;
                this.firstTurn = setInfo.isFirstOp;
                if(setInfo.opPos == this.DDZRoomPosMgr.GetClientPos()){
                    if(setInfo.isFirstOp){
                        this.ShowBtnOutCard();
                    }
                    else{
                        if(setInfo.opType == 0){
                            this.ShowBtnOutCard();
                        }
                        else{
                            let array = this.LogicDDZGame.GetTipCard();
                            this.ForbiddenTouch(array);
                            if(!array.length){
                                if (this.isAutoPass()) {
                                    time = this.DDZDefine.MinTickTime;
                                }else{
                                    this.ShowAllGameBtn();
                                    time = this.DDZDefine.MinTickTime;
                                    this.lb_mypdgsj.active = true;
                                }
                            }
                            else{
                                if (array.length == 0 || (array.length == 1 && array[0].length == 0)) {
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
            }
            else if(state == this.ShareDefine.DDZSetState_End){
                //如果玩家已经准备则不显示结算界面
                let clientPos = this.DDZRoomPosMgr.GetClientPos();
                let clientPlayerInfo = this.DDZRoomPosMgr.GetPlayerInfoByPos(clientPos);
                if(clientPlayerInfo["gameReady"]){
                    this.RefreshRoomShow();
                    return;
                }
                this.FormManager.ShowForm("game/DDZ/UIDDZ_Result");
            }
        }
        else{
            this.RefreshRoomShow();
        }

        //获取用户推广Url
        this.GetTuiGuangUrl();
    },
});