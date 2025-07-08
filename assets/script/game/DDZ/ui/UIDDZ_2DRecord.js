var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        room_Id:cc.Label,
        end_Time:cc.Label,
        lb_jushu:cc.Label,
        fristLayout:cc.Node,
        exitBtnNode:cc.Node,
        exitRoomBtnNode:cc.Node,

        wolaikaijuBtnNode:cc.Node,
        pingfenkaijuBtnNode:cc.Node,
        dayingjiakaijuBtnNode:cc.Node,

        icon_fct:cc.SpriteFrame,
        icon_ct:cc.SpriteFrame,

        boy:cc.SpriteFrame,
        girl:cc.SpriteFrame,

        icon_dissolveSpr: [cc.SpriteFrame],
    },

    OnCreateInit: function () {
        this.btn_continue = this.GetWndNode("fristFrame/btn_lists/btn_continue");
        this.PokerModle = app[app.subGameName + "_PokerCard"]();
        this.fristFrame = this.node.getChildByName('fristFrame');
        this.fristScorll = this.fristFrame.getChildByName('ScrollView').getComponent(cc.ScrollView);
        this.redColor = new cc.Color(181,104,48);
        this.greenColor = new cc.Color(59,138,133);
        this.RegEvent("EVT_CloseDetail", this.CloseForm, this);
        this.curSetId = 0;
        this.totalSetId = 0;
        this.backCode = 0;
        this.RegEvent("NewVersion", this.Event_NewVersion, this);
    },
    Event_NewVersion:function(){
        this.isNewVersion=true;
    },

    OnShow:function(datainfo=null,playerList=null,needShowIndex=-1){
        this.isNewVersion=false;
        app[app.subGameName+"_HotUpdateMgr"]().CheckUpdate(); //
        this.btn_continue.active = false;
    	this.HideAllBtn();
        this.needShowSecond = false;//控制点击数据未到处理
        this.fristFrame.active = false;

        this.playerList = null;
        this.datainfo = null;
        this.dataByZhanJi = false;
        this.clubId = 0;
        let setID = 0;
        let endSec = '';
        let roomKey = '';
        let roomID = 0;
        if(-1 != needShowIndex){
            this.dataByZhanJi = true;
            this.playerList = playerList;
            this.datainfo = datainfo;
            setID = datainfo.setId;
            endSec = datainfo.endTime;
            roomKey = "房间号:" + datainfo.key;
            roomID = datainfo.roomId;
            if(1 == needShowIndex)
                this.fristData = datainfo.countRecords;
            else{
                this.needShowSecond = true;
                app.NetManager().SendPack("game.CPlayerSetRoomRecord", {"roomID":roomID});
            }
        }
        else{
            this.roomMrg = app.DDZRoomMgr();
            if(!this.roomMrg){
                this.CloseForm();
                return
            }
            this.room = this.roomMrg.GetEnterRoom();
            if(!this.room){
                this.CloseForm();
                return
            }
            let roomEnd = this.room.GetRoomProperty("roomEnd");
            if(!roomEnd){
                this.CloseForm();
                return
            }
            let record = roomEnd["record"];
            setID = record["setCnt"];
            endSec = record['endSec'];
            roomKey = "房间号:" + this.room.GetRoomProperty("key");
            this.fristData = record['recordPosInfosList'];
            roomID = this.room.GetRoomProperty("roomID");
            let roomCfg = this.room.GetRoomConfig();
            this.clubId = roomCfg.clubId;
        }
        this.room_Id.string = roomKey;
        this.totalSetId = setID;
        this.lb_jushu.string = app.i18n.t("UIWanFa_setCount", {"setCount": setID});
        this.end_Time.string = this.ComTool.GetDateYearMonthDayHourMinuteString(endSec);

        this.UpdateFristFrame();
    },
    UpdateFristFrame:function(){
        this.fristScorll.stopAutoScroll();
        let dataCount = 0;
        for(let i=0;i<this.fristData.length;i++){
            if(0 != this.fristData[i].pid)
                dataCount++
        }
        //先找出大赢家
        let bigBang = -1;
        let lastPoint = this.fristData[0].point;
        for(let i=0;i<this.fristData.length;i++){
            if(this.fristData[i].pid <= 0)
                continue;
            if(lastPoint < this.fristData[i].point){
                bigBang = i;
                lastPoint = this.fristData[i].point;
            }
        }
        if(0 != this.fristData[0].point && -1 == bigBang)
            bigBang = 0;
        let showTipIndex = 1;
        let node = null;
        let nodeObjs = {};
        for(let i=0;i<this.fristData.length;i++){
            let allNum = this.fristData[i].winCount + this.fristData[i].loseCount + this.fristData[i].flatCount;
            if(this.fristData[i].pid <= 0 || 0 == allNum)
                continue;
            node = this.fristLayout.getChildByName("record"+(i+1));
            this.GetFristPrefabAllNode(node,nodeObjs);

            if(bigBang == i || lastPoint == this.fristData[i].point)
                nodeObjs.iconWin.active = true;
            else
                nodeObjs.iconWin.active = false;

            this.SetUserInfo(nodeObjs.userInfo,this.fristData[i].pid);
            this.SetScore(nodeObjs,i);
        }
        if(this.dataByZhanJi){
            this.exitBtnNode.active = true;
            this.exitRoomBtnNode.active = false;
        }else{
            this.exitBtnNode.active = false;
            this.exitRoomBtnNode.active = true;
            if(!app[app.subGameName + "_ShareDefine"]().isCoinRoom){
                let roomCfg=this.room.GetRoomConfig();
                if(0 == this.clubId && roomCfg.createType==1){
                    this.wolaikaijuBtnNode.active=false;
                    this.pingfenkaijuBtnNode.active=false;
                    this.dayingjiakaijuBtnNode.active=false;
                }
                if (0 != roomCfg.clubId) {
                    this.btn_continue.active = true;
                }else{
                    this.btn_continue.active = false;
                }
        	}
        }
        this.fristFrame.active = true;
    },
    GetFristPrefabAllNode:function(curNode,nodeObjs){
        nodeObjs.userInfo = curNode.getChildByName('user_info');
        nodeObjs.winNum = curNode.getChildByName('lb_win_num');
        nodeObjs.loseNum = curNode.getChildByName('lb_lose_num');
        nodeObjs.win = curNode.getChildByName('lb_win');
        nodeObjs.lose = curNode.getChildByName('lb_lose');
        nodeObjs.iconWin = curNode.getChildByName('icon_win');
        nodeObjs.lb_spTitle = curNode.getChildByName('lb_spTitle');
        nodeObjs.lb_winSp = curNode.getChildByName('lb_winSp');
        nodeObjs.lb_loseSp = curNode.getChildByName('lb_loseSp');
        nodeObjs.icon_dissolve = curNode.getChildByName('icon_dissolve');
    },
    SetUserInfo:function(userInfoNode,pid){
        let player = null;
        let ownerID = 0;
        if(this.dataByZhanJi){
            for(let i=0;i<this.playerList.length;i++){
                if(pid == this.playerList[i].pid){
                    player = this.playerList[i];
                    break;
                }
            }
            ownerID = this.datainfo.ownerID;
        }
        else{
            player = this.room.GetRoomPosMgr().GetPlayerInfoByPid(pid);
            ownerID = this.room.GetRoomProperty("ownerID");
        }
        if(!player){
            this.ErrLog('SetUserInfo Error this.playerList.length = ' + this.playerList.length);
            return;
        }
        let playerName = "";
        playerName = player["name"];
        if(playerName.length > 4){
            playerName = playerName.substring(0, 4) + '...';
        }
        userInfoNode.getChildByName("lable_name").getComponent(cc.Label).string = playerName;

        userInfoNode.getChildByName("label_id").getComponent(cc.Label).string = "ID:"+this.ComTool.GetPid(pid);
        let wechatSprite = userInfoNode.getChildByName("head_img").getComponent(app.subGameName + "_WeChatHeadImage");
        wechatSprite.OnLoad();
        wechatSprite.ShowHeroHead(pid);

        //玩家性别
        let sex = userInfoNode.getChildByName("sex");
        if (player.sex == 0) {
            sex.getComponent(cc.Sprite).spriteFrame = this.boy;
        }else{
            sex.getComponent(cc.Sprite).spriteFrame = this.girl;
        }

        //判断房主是谁
        let fangzhu = userInfoNode.getChildByName("fangzhu");
        if(ownerID == player.pid)
            fangzhu.active = true;
        else
            fangzhu.active = false;
        //判断地主是谁
        // let icon_dzm = userInfoNode.getChildByName("icon_dzm");
        // if(ownerID == player.pid)
        //     icon_dzm.active = true;
        // else
        //     icon_dzm.active = false;
    },
    SetScore:function(nodeObjs,dataIndex){
        let data = this.fristData[dataIndex];
        if(data.point > 0){
            nodeObjs.winNum.active = true;
            nodeObjs.loseNum.active = false;
            // if(data.point > 10000){
            //     let needNum = data.point / 10000;
            //     needNum = needNum.toFixed(1);
            //     nodeObjs.winNum.getComponent(cc.Label).string = '+' + needNum + '万';
            // }
            // else
                nodeObjs.winNum.getComponent(cc.Label).string = '+' + data.point;
        }
        else{
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
        if (typeof(data.sportsPoint)!="undefined") {
            if (data.sportsPoint > 0) {
                nodeObjs.lb_loseSp.getComponent(cc.Label).string = "";
                nodeObjs.lb_winSp.getComponent(cc.Label).string = '+'+data.sportsPoint;
            }else{
                nodeObjs.lb_winSp.getComponent(cc.Label).string = "";
                nodeObjs.lb_loseSp.getComponent(cc.Label).string = ''+data.sportsPoint;
            }
            nodeObjs.lb_spTitle.active = true;
        }else{
            nodeObjs.lb_winSp.getComponent(cc.Label).string = "";
            nodeObjs.lb_loseSp.getComponent(cc.Label).string = "";
            nodeObjs.lb_spTitle.active = false;
        }
        //显示是否解散（-1:正常结束,0:未操作,1:同意操作,2:拒绝操作,3:发起者）
        if (typeof(data.dissolveState) == "undefined" || data.dissolveState == -1) {
            nodeObjs.icon_dissolve.active=false;
        }else{
            nodeObjs.icon_dissolve.active=true;
            nodeObjs.icon_dissolve.getComponent(cc.Sprite).spriteFrame = this.icon_dissolveSpr[data.dissolveState];
        }
    },

    //-----------------回调函数------------------

    //---------点击函数---------------------
    HideAllBtn:function(){
    	this.exitBtnNode.active = false;
        this.wolaikaijuBtnNode.active=false;
        this.pingfenkaijuBtnNode.active=false;
        this.dayingjiakaijuBtnNode.active=false;
    },
    OnClick:function(btnName, btnNode){
        //继续房间使用
        let room = app.DDZRoom();
        let roomCfg={};
        if(room){
            roomCfg = room.GetRoomConfig();
            roomCfg.isContinue=true;
        }
        //继续房间使用

        if('btn_close' == btnName){
            if(!this.dataByZhanJi){
                this.fristFrame.active = true;
            }
            else
                this.CloseForm();
        }
        else if('btn_share' == btnName){
            this.SDKManager.ShareScreen();
        }
        else if('btn_continue' == btnName){
            if(this.isNewVersion==true){
                app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("游戏有新版本更新，请返回大厅");
                return;
            }
            let self = this;
            app[app.subGameName + "_NetManager"]().SendPack(app.subGameName+".C"+app.subGameName.toUpperCase()+"ContinueEnterRoom",{}, function(event){
                app[app.subGameName + "_NetManager"]().SendPack("game.C1101GetRoomID", {});
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_Result");
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_2DResult");
                app[app.subGameName + "_FormManager"]().CloseForm("game/DDZ/UIDDZ_2DPlay");
                self.CloseForm();
            }, function(event){
                if (event.Msg == "UNION_BACK_OFF_PLAYING") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您已申请退赛，当前无法进行比赛，请取消退赛申请或联系赛事举办方");
                }else if (event.Msg == "UNION_APPLY_REMATCH_PLAYING") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您的比赛分不足，已被淘汰，将被禁止参与赛事游戏，如要重新参与比赛，请联系举办方处理");
                }else if (event.Msg == "UNION_STATE_STOP") {
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("赛事已停用，无法加入房间，请联系赛事举办方");
                }else if(event.Msg=="ROOM_GAME_SERVER_CHANGE"){
                    console.log("切换服务器");
                }else if(event.Code==12){
                    console.log("游戏维护");
                }else if(event.Msg=="WarningSport_RoomJoinner"){
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您所在的推广员队伍或上级队伍比赛分低于预警值，无法加入比赛，请联系管理");
                }else if(event.Msg=="CLUB_SPORT_POINT_WARN"){
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("您所在的亲友圈比赛分低于预警值，无法加入比赛，请联系管理");
                }else{
                    app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("无法继续游戏，请联系赛事举办方");
                }
            });
        }
        else if('btn_exitRoom' == btnName){
            app[app.subGameName + "Client"].ExitGame();
        }
        else if('btn_exit' == btnName){
            this.CloseForm();
        }
        else{
            this.ErrLog("OnClick(%s) not find btnName",btnName);
        }
    },

    OnEnterRoomFailed:function(serverPack){
        app[app.subGameName + "Client"].ExitGame();
        console.log('OnEnterRoomFailed serverPack', serverPack);
    },
});