var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        touxiang:cc.Node,
        sp_chatdi_left:cc.Node,
        sp_chatdi_right:cc.Node,
        sp_chatdi_leftBottom:cc.Node,
        sp_chatdi_rightBottom:cc.Node,
        sp_audio_left:cc.Node,
        sp_audio_right:cc.Node,
        sp_lixian:cc.Node,
        sp_likai:cc.Node,
        btn_out:cc.Node,

        zhuangjia:cc.Node,
        fangzhu:cc.Node,

        lb_name:cc.Label,
        lb_jifen:cc.Label,
        btn_head:cc.Node,
        icon_auto:cc.Node,
        face_ani:cc.Node,
        icon_ready:cc.Node,
        // bg_box:cc.Node,
        icon_dzm:cc.Node,
        img_jb:cc.Node,
    },

    Init: function (uiPos,dataPos,point,isLeft=-1,bResetPoint=true,useBottomChat=false) {
        this.is3DShow = app.LocalDataManager().GetConfigProperty("SysSetting", app.subGameName + "_is3DShow");
        this.uiPos = uiPos;
        this.playerPos = dataPos;
        if(bResetPoint){
            this.node.x = point.x;
            this.node.y = point.y; 
            if(isLeft==-1){
                if(point.x>0){
                    this.isLeft=true;
                }else{
                    this.isLeft=false;
                }
            }
            else{
                if(isLeft){
                    this.isLeft=true;
                }
                else{
                    this.isLeft=false;
                }
            }
        }
        this.playerInfo = null;
        if(-1 == this.playerPos){
            this.node.active = false;
            return;
        }
        if(!this.bIsInitBaseEnd){
            this.bIsInitBaseEnd = true;
            this.InitBaseData();
        }

        this.node.active = true;
        this.RoomMgr = app.DDZRoomMgr();
        this.RoomPosMgr = this.RoomMgr.GetEnterRoom().GetRoomPosMgr();
        this.WeChatHeadImage = this.btn_head.getComponent(app.subGameName + "_WeChatHeadImage");
        app[app.subGameName + "Client"].RegEvent("SetStart", this.Event_SetStart,this);
        app[app.subGameName + "Client"].RegEvent("PosContine", this.Event_PosContine,this);
        app[app.subGameName + "Client"].RegEvent("PlayerOffline", this.Event_PlayerOffline,this);
        app[app.subGameName + "Client"].RegEvent("SPlayer_Trusteeship", this.OnPack_AutoStart, this);
        app[app.subGameName + "Client"].RegEvent("Head_PosReadyChg", this.Event_PosReadyChg,this);
        app[app.subGameName + "Client"].RegEvent("Head_PosUpdate", this.Event_PosPosUpdate,this);
        app[app.subGameName + "Client"].RegEvent("Head_PosLeave", this.Event_PosLeave,this);
        app[app.subGameName + "Client"].RegEvent("Head_UpdateBacker",this.Event_UpdateBacker,this);
        app[app.subGameName + "Client"].RegEvent("Head_AudioNtf",this.Event_AudioNtf,this);

        app[app.subGameName + "Client"].RegEvent("RoomSportsPointChange",this.Event_SportsPointChange,this);
        //获取控件
        this.lb_SportsPoint = this.node.getChildByName("touxiang").getChildByName("lb_SportsPoint");
        this.HideAllChild();
        this.left = {x:-75,y:0};
        this.right = {x:75,y:0};
        this.node.name = 'UIDDZHead' + this.uiPos;
        this.SetItemPos(this.isLeft);

        this.useBottomChat = useBottomChat;
        this.sp_chatdi_left.removeAllChildren();
        this.sp_chatdi_right.removeAllChildren();
        this.sp_chatdi_leftBottom.removeAllChildren();
        this.sp_chatdi_rightBottom.removeAllChildren();
        this.msgNode = new cc.Node();
        this.msgNode.name = "chat_msg";
        this.msgNode.addComponent(cc.Label);
        this.msgNode.x = 51;
        this.msgNode.y = 0;
        this.msgNode.color = new cc.Color(90, 76, 79);
        this.msgNode.width = 280;
        this.bottomMsgNode = null;
        if(this.isLeft){
            this.msgNode.scaleX = -1;
            this.msgNode.scaleY = -1;
            this.msgNode.anchorX = 1;
            this.msgNode.anchorY = 0.5;
            this.sp_chatdi_left.addChild(this.msgNode);
            this.bottomMsgNode = cc.instantiate(this.msgNode);
            this.sp_chatdi_leftBottom.addChild(this.bottomMsgNode);
        }
        else{
            this.msgNode.anchorX = 0;
            this.msgNode.anchorY = 0.5;
            this.sp_chatdi_right.addChild(this.msgNode);
            this.bottomMsgNode = cc.instantiate(this.msgNode);
            this.sp_chatdi_rightBottom.addChild(this.bottomMsgNode);
        }
        
       


        this.DeleteWndEffect("touxiang/btn_headkuang", "touxiangkuangtexiao");

        this.UpdatePlayerInfo();

        this.face_ani.getComponent(cc.Animation).on('finished', this.onFinished.bind(this), this);
        this.time = -1;
        app[app.subGameName + "_HeadManager"]().SetHeadInfo(dataPos,this.node);
    },
    onFinished:function(){
        this.face_ani.active = false;
    },

    setReady:function(isShow){
        let room = this.roomMrg.GetEnterRoom();
        let state = room.GetRoomProperty("state");
        if(state == this.ShareDefine.RoomState_Playing){
            this.icon_ready.active = false;
        }else{
            this.icon_ready.active = isShow;
        }
    },
    HideAllChild:function(){
        this.touxiang.active = 0;
        this.sp_chatdi_left.active = 0;
        this.sp_chatdi_right.active = 0;
        this.sp_chatdi_leftBottom.active = 0;
        this.sp_chatdi_rightBottom.active = 0;
        this.sp_audio_left.active = 0;
        this.sp_audio_right.active = 0;
        this.icon_ready.active = 0;
        this.btn_out.active = 0;
        this.icon_auto.active = 0;
        this.zhuangjia.active = 0;
        this.lb_jifen.string = "";
        this.fangzhu.active = false;
        this.sp_lixian.active = false;
        this.sp_likai.active = false;
        this.icon_dzm.active = false;
        this.img_jb.active = false;
        // this.bg_box.active = false;
        let others = this.node.getChildByName('otherNode').children;
        for(let i=0;i<others.length;i++)
            others[i].active = false;
    },
    //-----------------回调函数------------------------
    Event_PosReadyChg:function(event){
        let serverPack = event;
        let pos = serverPack["pos"];
        let isReady=serverPack["isReady"];
        if(app[app.subGameName + "_ShareDefine"]().isCoinRoom){
        	//练习场OK 手势图标不显示
            this.btn_out.active=0;
    	}else{
    		if(pos == this.playerPos){
                if (isReady == true) {
                    this.icon_ready.active = true;
                } else {
                    this.icon_ready.active = false;
                }
        	}
    	}
    },
    
    Event_PosPosUpdate:function(event){
        this.UpdatePlayerInfo();
    },
    
    Event_PosLeave:function(event){
        let serverPack = event;
        let pos = serverPack["pos"];
        if(pos == this.playerPos)
            this.HideAllChild();
    },

    Event_SetStart:function(event){
        if(-1 == this.playerPos)
            return;
        this.icon_dzm.active = false;
        this.img_jb.active = false;
        this.UpdatePlayerInfo();
    },
    Event_PosContine:function(event){
        if(-1 == this.playerPos)
            return;
        let room = this.roomMrg.GetEnterRoom();
        let setState = room.GetRoomSet().GetRoomSetProperty("state");
        if(this.playerPos==event.pos){
            if(setState==this.ShareDefine.SetState_Playing){
                //游戏进行中，OK按钮关闭
                this.icon_ready.active=false;
            }else{
                this.icon_ready.active=true;
            }
        }
    },
    Event_PlayerOffline:function(event){
        if(-1 == this.playerPos)
            return;
        this.UpdatePlayerInfo();
    },
    
    OnPack_AutoStart:function(event){
        if(-1 == this.playerPos)
            return;
        let serverPack = event;
        let roomID = serverPack["roomID"];
        let pos = serverPack["pos"];
        let isAuto = serverPack["trusteeship"];
        let pid = serverPack["pid"];
        let heroID = app[app.subGameName + "_HeroManager"]().GetHeroProperty("pid");
       
        let roomPosMg = this.roomMrg.GetEnterRoom().GetRoomPosMgr();
        let allPlayers = roomPosMg.GetRoomAllPlayerInfo();
        allPlayers[pos].trusteeship = isAuto;
        if(pid == allPlayers[this.playerPos].pid)
            this.icon_auto.active = isAuto;    
    },
    
    //本家显示出牌动作
    OnShowPosActionHelp:function () {
        if(-1 == this.playerPos)
            return;
        this.AddWndEffect("touxiang/btn_headkuang", "touxiangkuangtexiao", "touxiangkuangtexiao");
    },

    //--------------刷新函数-----------------
    OnUpdate:function () {
        if(-1 == this.playerPos)
            return;
        let time = new Date().getTime();
        if(this.time){
            if(this.time < time){
                this.sp_chatdi_left.active=0;
                this.sp_chatdi_right.active=0;
                this.sp_chatdi_leftBottom.active = 0;
                this.sp_chatdi_rightBottom.active = 0;
                return;
            }
            if(!this.useBottomChat){
                if(this.useLeftChat){
                    this.sp_chatdi_left.active = 1;
                }else{
                    this.sp_chatdi_right.active = 1;
                }
            }
            else{
                if(this.useLeftChat){
                    this.sp_chatdi_leftBottom.active = 1;
                }else{
                    this.sp_chatdi_rightBottom.active = 1;
                }
            }
        }
    },

    //本家动作结束回调
    OnClosePosActionHelp:function(){
        this.DeleteWndEffect("touxiang/btn_headkuang", "touxiangkuangtexiao");
    },

    ShowChatContent:function (content) {
        let msgNode = null;
        if(!this.useBottomChat)
            msgNode = this.msgNode;
        else
            msgNode = this.bottomMsgNode;
        let lb_chat = msgNode.getComponent(cc.Label);
        lb_chat.overflow = cc.Label.Overflow.NONE;
        lb_chat.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        lb_chat.verticalAlign = cc.Label.VerticalAlign.CENTER;
        lb_chat.fontSize = 20;
        lb_chat.lineHeight = 25;
        lb_chat.string = content;
        let width = this.msgNode.width;
        let newWidth = width + 80;
        if(width >= 280){
            newWidth = 360;
            lb_chat.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            msgNode.width = 280;
        }
        if(!this.useBottomChat){
            this.sp_chatdi_leftBottom.active = 0;
            this.sp_chatdi_rightBottom.active = 0;
            if(this.useLeftChat){
                this.sp_chatdi_left.active = 1;
                this.sp_chatdi_right.active = 0;
                this.sp_chatdi_left.width = newWidth;
            }
            else{
                this.sp_chatdi_left.active = 0;
                this.sp_chatdi_right.active = 1;
                this.sp_chatdi_right.width = newWidth;
            }
        }
        else{
            this.sp_chatdi_left.active = 0;
            this.sp_chatdi_right.active = 0;
            if(this.useLeftChat){
                this.sp_chatdi_leftBottom.active = 1;
                this.sp_chatdi_rightBottom.active = 0;
                this.sp_chatdi_leftBottom.width = newWidth;
            }
            else{
                this.sp_chatdi_leftBottom.active = 0;
                this.sp_chatdi_rightBottom.active = 1;
                this.sp_chatdi_rightBottom.width = newWidth;
            }
        }
        this.time = new Date().getTime() + 4000;
    },
    ShowFaceContent:function(path){
        this.face_ani.active = true;
        var animState = this.face_ani.getComponent(cc.Animation).play(path);
        animState.repeatCount = 3;
    },

    ShowAutoIcon:function(isAuto){
        this.icon_auto.active = isAuto;
    },

    ShowAudioContent:function () {
        if(this.useLeftAudio){
            this.sp_audio_left.active = 1;
            this.sp_audio_right.active = 0;
            this.AudioAnimation =  this.sp_audio_left.getComponent(cc.Animation);
        }
        else{
            this.sp_audio_left.active = 0;
            this.sp_audio_right.active = 1;
            this.AudioAnimation =  this.sp_audio_right.getComponent(cc.Animation);
        }

        this.AudioAnimation.stop();
        this.AudioAnimation.play("UIAudioPlay");
    },

    CloseAudioContent:function(){
        if(this.AudioAnimation) this.AudioAnimation.stop();

        this.sp_audio_left.active = 0;
        this.sp_audio_right.active = 0;
    },

    OnClose:function(){
        this.HideAllChild();
        this.lb_jifen.string = "";
        this.fangzhu.active = false;
        this.uiPos = -1;
        this.playerPos = -1;
        this.playerInfo = null;
        app[app.subGameName + "Client"].UnRegTargetEvent(this);
    },
    SetItemPos:function(isLeft){
        if(isLeft){
            this.useLeftAudio = true;
            this.useLeftChat = true;
            this.icon_auto.x = this.left.x + 39;
            this.icon_auto.y = this.left.y - 36;
            if (this.is3DShow == 1) {
                this.icon_dzm.x = this.right.x - 10;
                this.icon_dzm.y = this.right.y + 10;
                this.icon_ready.x = this.left.x;
                this.icon_ready.y = this.left.y;
            }
        }
        else{
            this.useLeftAudio = false;
            this.useLeftChat = false;
            this.icon_auto.x = this.right.x - 39;
            this.icon_auto.y = this.right.y - 36;
            if (this.is3DShow == 1) {
                this.icon_dzm.x = this.left.x + 10;
                this.icon_dzm.y = this.left.y + 10;
                this.icon_ready.x = this.right.x;
                this.icon_ready.y = this.right.y;
            }
        }
        //客户端玩家特殊处理
        if (this.uiPos == 0 && this.is3DShow == 1) {
            this.useLeftAudio = false;
            this.useLeftChat = false;
            this.icon_ready.x = this.right.x;
            this.icon_ready.y = this.right.y + 50;
            this.icon_auto.x = this.right.x;
            this.icon_auto.y = this.right.y + 50;
            this.icon_dzm.x = this.right.x;
            this.icon_dzm.y = this.right.y + 10;
            this.touxiang.getChildByName("sp_info").active = false;
        }
    },
    Event_AudioNtf:function(event){
        let serverPack = event;
        let bShow = serverPack["bShow"];
        let pos = serverPack["pos"];
        console.log('Event_AudioNtf bShow '+ bShow +' pos ' + pos);
        if(bShow){
            if(pos != this.playerPos)
                return;
            this.ShowAudioContent();
        }
        else
            this.CloseAudioContent();
    },
    Event_UpdateBacker:function(event){
        if(-1 == this.playerPos)
            return;
        let data = event;
        if(data.bShow)
            this.UpdateBacker();
        else
            this.zhuangjia.active = false;
    },
    UpdateBacker:function(){
        let room = this.roomMrg.GetEnterRoom();
        let state = room.GetRoomProperty("state");
        // this.bg_box.active = false;
        if(state == this.ShareDefine.RoomState_Init){
            this.zhuangjia.active = false;
        }
        else{
            let roomSet = room.GetRoomSet();
            let dPos = -1;
            if(roomSet){
                if(roomSet.GetRoomSetInfo().hasOwnProperty('backerPos')){
                    dPos = roomSet.GetRoomSetProperty("backerPos");
                }else{
                    dPos = roomSet.dataInfo.dPos;
                }
            }
            else{
                if(room.GetRoomProperty('set').stateInfo)
                    dPos = room.GetRoomProperty('set').stateInfo.backerPos;
                else
                    dPos = room.GetRoomProperty('set').backerPos;
            }
            let isDPos = false;
            if(dPos == this.playerPos){
                isDPos = true;
                // this.bg_box.active = true;
            }
            //是否庄
            this.zhuangjia.active = isDPos;
        }
    },
    //显示本家玩家信息
    UpdatePlayerInfo:function(){
        this.roomMrg = app.DDZRoomMgr();
        let room = this.roomMrg.GetEnterRoom();
        let state = room.GetRoomProperty("state");
        let setState=0;
        if(state==this.ShareDefine.RoomState_Playing){
            setState = room.GetRoomSet().GetRoomSetProperty("state");
        }
        let allPlayerInfo = null;
        let playerLength = 0;
        allPlayerInfo=room.GetRoomPosMgr().GetRoomAllPlayerInfo();
        playerLength = allPlayerInfo.length;
        if(this.playerPos >= playerLength){
            this.ErrLog('UIDDZHead this.playerPos >= playerLength');
            return;
        }
        this.playerInfo = allPlayerInfo[this.playerPos];
        //如果没有有玩家坐下
        if(!this.playerInfo || 0 == this.playerInfo.pid){
            console.log("没有有玩家坐下");
            this.HideAllChild();
            return
        }
        //准备按钮更新,区分啃爹的金币场
        if(setState==this.ShareDefine.SetState_Playing){
            //游戏进行中，OK按钮关闭
            this.icon_ready.active=false;
        }else{
            if(app[app.subGameName + "_ShareDefine"]().isCoinRoom){
                this.icon_ready.active=true;
            }else{
                if(state==this.ShareDefine.RoomState_Init){
                    if(this.playerInfo.roomReady){
                        this.icon_ready.active=true;
                    }else{
                        this.icon_ready.active=false;
                    }
                }else{
                    // if(this.playerInfo.gameReady){
                    //     this.icon_ready.active=true;
                    // }else{
                    //     this.icon_ready.active=false;
                    // }
                    this.icon_ready.active=false;
                }
            }
        }
        //隐藏踢出房间按钮
        if(state != this.ShareDefine.RoomState_Init){
            this.btn_out.active = false;
        }

        //提示控件隐藏
        this.ShowPlayerBaseInfo(room);

        //庄家
        this.UpdateBacker();
    },
    ShowBtnOut:function(){
        let room = this.roomMrg.GetEnterRoom();
        let state = room.GetRoomProperty("state");
        if(state != this.ShareDefine.RoomState_Init)
            return;
        if(room.IsClientIsCreater()==false){
            this.btn_out.active=false;
            return;
        }
        if(this.playerInfo.pid== this.createID){
            this.btn_out.active=false;
        }else{
            this.btn_out.active=true;
        }
    },
    HideBtnOut:function(){
        this.btn_out.active=false;
    },
    //获取位置玩家头像基础信息
    ShowPlayerBaseInfo:function (room) {
        this.touxiang.active = 1;
        //有玩家坐下才需要显示玩家头像
        let pid = this.playerInfo.pid;
        if(pid){
            this.WeChatHeadImage.ShowHeroHead(pid);
        }

        //显示是否房主
        let createID = room.GetRoomProperty("ownerID");
        let iscreateID = false;
        this.createID=createID;
        this.HideBtnOut();
        if(this.playerInfo.pid == createID){
            iscreateID = true;
        }else{
            this.ShowBtnOut();
        }
        
        if(app[app.subGameName + "_ShareDefine"]().isCoinRoom){
            this.fangzhu.active = false;
            this.btn_out.active = false;
        }
        else{
            this.fangzhu.active = iscreateID;
        }
        
        //是否离线
        if(this.playerInfo.isLostConnect)
            this.sp_lixian.active = 1;
        else
            this.sp_lixian.active = 0;

        //是否离开
        if(this.playerInfo.isShowLeave && !this.playerInfo.isLostConnect)
            this.sp_likai.active = 1;
        else
            this.sp_likai.active = 0;
        
        //积分
        this.UpDateLabJiFen();
        //比赛分
        if (typeof(this.playerInfo.sportsPoint)!="undefined") {
            this.UpDateLabSportsPoint();
        }else{
            this.lb_SportsPoint.active = false;
        }
        let shortName = "";
        if(this.playerInfo.name.length > 5){
            shortName = this.playerInfo.name.substring(0, 5) + '...';
        }else{
            shortName = this.playerInfo.name;
        }
        //名字
        this.lb_name.string = shortName;

    },
    UpDateLabJiFen:function () {
        let playerIntegral = 0;
        if(this.playerInfo){
            playerIntegral = this.playerInfo.realPoint;
        }
        this.lb_jifen.string = playerIntegral;
    },
    Event_SportsPointChange:function(event){
        let roomID = this.RoomMgr.GetEnterRoomID();
        let pos = this.playerInfo.pos;
        let pid = this.playerInfo.pid;
        if (event.roomID != roomID ||
            event.posId != pos ||
            event.pid != pid) {
            return;
        }
        this.UpDateLabSportsPoint();
    },
    UpDateLabSportsPoint:function () {
        let sportsPoint = 0;
        if(this.playerInfo){
            sportsPoint = this.playerInfo.sportsPoint;
        }
        if (typeof(sportsPoint)!="undefined") {
            let clientPos = this.RoomMgr.GetEnterRoom().GetRoomPosMgr().GetClientPos();
            if (clientPos == this.playerInfo.pos) {
                sportsPoint = this.playerInfo.sportsPoint;
                this.lb_SportsPoint.getComponent(cc.Label).string = sportsPoint;
                this.lb_SportsPoint.active = true;
            } else {
                this.lb_SportsPoint.getComponent(cc.Label).string = "";
                this.lb_SportsPoint.active = false;
            }
        }
    },
    Showlandowner:function(isShow){
        this.icon_dzm.active = isShow;
    },
    ShowAddDouble:function(isShow){
        this.img_jb.active = isShow;
    },
    //---------点击函数---------------------
    //---------点击函数---------------------
    OnClick:function(btnName, btnNode){
        console.log("onclick btnName:",btnName);
        if(btnName == "btn_head"){
            this.Click_btn_head();
        }
        else if(btnName == "btn_out"){
            this.Click_btn_out();
        }
        else{
            this.ErrLog("OnClick btnName:%s error", btnName);
        }
    },

    Click_btn_head:function(){
        this.FormManager.ShowForm(app.subGameName + "_UIUserInfo",this.playerPos);
    },

    Click_btn_out:function(){
        let room = this.RoomMgr.GetEnterRoom();
        let state = room.GetRoomProperty("state");
        if(state == this.ShareDefine.RoomState_Playing || state == this.ShareDefine.RoomState_Playing){
            app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("SSS_CANNOT_KICK");
        }else{
            let roomID = this.RoomMgr.GetEnterRoomID();
            app[app.subGameName + "_GameManager"]().SendKickPosIndex(roomID, this.playerPos);
        }
    },


});