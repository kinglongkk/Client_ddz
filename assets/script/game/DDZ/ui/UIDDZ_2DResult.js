var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        btn_share:cc.Node,
        btn_exit:cc.Node,
        btn_continue:cc.Node,
        btn_openStart:cc.Node,
        sp_winLose:cc.Node,
        win:cc.SpriteFrame,
        lose:cc.SpriteFrame,
        icon_fct:cc.SpriteFrame,
        icon_ct:cc.SpriteFrame,
        boy:cc.SpriteFrame,
        girl:cc.SpriteFrame,
        playerList:cc.Node,

        room_Id:cc.Label,
        lb_jushu:cc.Label,
        end_Time:cc.Label,
        room_MaxScore:cc.Label,
        playBackCode:cc.Label,
    },

    OnCreateInit: function () {
        this.DDZRoomMgr = app.DDZRoomMgr();
        this.DDZRoom = app.DDZRoom();
        this.DDZRoomPosMgr = app.DDZRoomPosMgr();
        this.SoundManager = app[app.subGameName + "_SoundManager"]();
        this.HeroManager = app[app.subGameName + "_HeroManager"]();
        this.DDZRoomSet = app.DDZRoomSet();
        this.ComTool = app[app.subGameName + "_ComTool"]();
        this.SDKManager = app[app.subGameName + "_SDKManager"]();
        this.DDZDefine = app.DDZDefine();

        this.bigWinner = 0;
    },

    ShowGameResult:function(){
        let room = this.DDZRoomMgr.GetEnterRoom();
        if(!room){
            this.ErrLog("Event_PosContinueGame not enter room");
            return
        }
        if(!app[app.subGameName + "_ShareDefine"]().isCoinRoom){
            this.btn_exit.active = false;
        }
        else{
            this.btn_exit.active = true;
        }

        //最后一局可直接退出
        if(!this.isEnd){
            this.btn_exit.active = false;
        }else{
            this.btn_exit.active = true;
        }

        let setEnd = this.DDZRoomSet.GetRoomSetProperty("setEnd");
        let allPlayer = this.DDZRoomPosMgr.GetRoomAllPlayerInfo();
        let key = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("key");
        let setId = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("setID");
        let time = 0;
        let isReconnect = false;
        let pointList = [];
        if(!setEnd){
            setEnd = {};
            setEnd.posInfo = this.DDZRoomSet.GetRoomSetInfo().posInfo;
            setEnd.landowner = this.DDZRoomSet.GetRoomSetInfo().landowner;
            setEnd.baseMark = this.DDZRoomSet.GetRoomSetInfo().baseMark;
            setEnd.playBackCode = this.DDZRoomSet.GetRoomSetInfo().playBackCode;
            setId = this.DDZRoomSet.GetRoomSetInfo().setID;
            time = this.DDZRoomSet.GetRoomSetInfo().startTime;
            isReconnect = true;
            for(let i = 0; i < setEnd.posInfo.length; i++){
                pointList.push(setEnd.posInfo[i].point);
            }
        }
        else{
            time = setEnd.startTime;
            for(let i = 0; i < setEnd.pointList.length; i++){
                pointList.push(setEnd.pointList[i]);
            }
        }

        pointList.sort(function(a, b){
            return b - a;
        });

        this.bigWinner = pointList[0];

        this.ShowResultNormal(allPlayer, setEnd, isReconnect);

        this.room_Id.string = "房间号:" + key;
        let current = room.GetRoomConfigByProperty("setCount");
        this.lb_jushu.string = setId + "/" + current;
        let sec = Math.round(time/1000);
        this.end_Time.string = this.ComTool.GetDateYearMonthDayHourMinuteString(sec);
        //地主封顶分数
        this.room_MaxScore.string = "地主封顶分数:"+this.GetMaxScore();
        if (setEnd.playBackCode && setEnd.playBackCode != 0) {
            this.playBackCode.string = "回放码:"+setEnd.playBackCode;
        }else{
            this.playBackCode.string = "";
        }
        
    },

    GetMaxScore:function(){
        let dizhufengding = this.DDZRoom.GetRoomConfigByProperty('dizhufengding');
        if(dizhufengding == 0){
            return '32分';
        }
        else if(dizhufengding == 1){
            return '64分';
        }
        else if(dizhufengding == 2){
            return '128分';
        }else if(dizhufengding == 3){
            return '不限制';
        }
    },

    ShowResultNormal:function(allPlayer, setEnd, isReconnect){
        let playerList = [];
        for(let idx in allPlayer){
            playerList.push(allPlayer[idx]);
        }
        //先排序一下
        playerList.sort(function(a, b){
            return a.pos - b.pos;
        });

        let playerNum = playerList.length;

        for (let i = 0; i < playerList.length; i++) {
            let player = playerList[i];

            let path = "playerList/player" + (i+1).toString();
            let playerNode = this.GetWndNode(path);
            playerNode.active = true;
            
            // if(player.pid == this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("ownerID")){
            //     playerNode.getChildByName("user_info").getChildByName("fangzhu").active = true;
            // }
            let point = 0;
            if(isReconnect){
                point = setEnd.posInfo[i].point;
            }
            else{
                point = setEnd.pointList[i];
            }
            //显示胜利或失败图片和音效 
            if(player.pos == this.DDZRoomPosMgr.GetClientPos()){
                if(point > 0){
                    // this.SoundManager.PlaySound("win");
                    this.sp_winLose.getComponent(cc.Sprite).spriteFrame = this.win;
                    // this.SoundManager.PlaySound("sssResult_Win");
                }
                else{
                    // this.SoundManager.PlaySound("fail");
                    this.sp_winLose.getComponent(cc.Sprite).spriteFrame = this.lose;
                    // this.SoundManager.PlaySound("sssResult_Lose");
                }
            }

            //玩家分数
            let winNode = playerNode.getChildByName("lb_win_num");
            let loseNode = playerNode.getChildByName("lb_lose_num");
            winNode.active = false;
            loseNode.active = false;

            // //大赢家
            // if(point == this.bigWinner){
            //     playerNode.getChildByName("icon_win").active = true;
            // }
            
            //地主标识
            if (setEnd.landowner == player.pos) {
                playerNode.getChildByName("user_info").getChildByName("icon_dzm").active = true;
            }else{
                playerNode.getChildByName("user_info").getChildByName("icon_dzm").active = false;
            }
    
            if(point > 0){
                winNode.active = true;
                winNode.getComponent(cc.Label).string = "+" + point;
            }
            else{
                loseNode.active = true;
                loseNode.getComponent(cc.Label).string = point;
            }
            //显示比赛分
            if(isReconnect){
                if (typeof(setEnd.posInfo[i].sportsPoint)!="undefined") {
                    if (setEnd.posInfo[i].sportsPoint > 0) {
                        playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = "";
                        playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "+"+setEnd.posInfo[i].sportsPoint;
                    }else{
                        playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "";
                        playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = ""+setEnd.posInfo[i].sportsPoint;
                    }
                    playerNode.getChildByName("lb_sptitle").active = true;
                }else{
                    playerNode.getChildByName("lb_sptitle").active = false;
                    playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = "";
                    playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "";
                }
            }
            else{
                if (typeof(setEnd.sportsPointList)!="undefined" && typeof(setEnd.sportsPointList[i])!="undefined") {
                    if (setEnd.sportsPointList[i] > 0) {
                        playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = "";
                        playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "+"+setEnd.sportsPointList[i];
                    }else{
                        playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "";
                        playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = ""+setEnd.sportsPointList[i];
                    }
                    playerNode.getChildByName("lb_sptitle").active = true;
                }else{
                    playerNode.getChildByName("lb_sptitle").active = false;
                    playerNode.getChildByName("lb_loseSp").getComponent(cc.Label).string = "";
                    playerNode.getChildByName("lb_winSp").getComponent(cc.Label).string = "";
                }
            }
            
            //倍数
            playerNode.getChildByName("lb_beiShu").active = true;
            let beishu = playerNode.getChildByName("lb_beiShu").getComponent(cc.Label);

            let number = 0;

            if(isReconnect){
                number = setEnd.posInfo[i].doubleNum;
            }
            else{
                number = setEnd.doubleNumList[player.pos];
            }
            
            number <= 0 ? beishu.string = 1 : beishu.string = number;

            //底分
            playerNode.getChildByName("lb_difen").active = true;
            let difen = playerNode.getChildByName("lb_difen").getComponent(cc.Label);
            difen.string = setEnd.baseMark;

            //显示春天或者反春天
            let icon_robClose = playerNode.getChildByName("icon_robClose");
            icon_robClose.active = true;

            let robClose = 0;
            if (isReconnect) {
                robClose = setEnd.posInfo[i].robClose;
            }
            else{
                robClose = setEnd.robCloseList[player.pos];
            }
            
            if (robClose == -1) {
                icon_robClose.getComponent(cc.Sprite).spriteFrame = this.icon_fct;
            }else if (robClose == 1) {
                icon_robClose.getComponent(cc.Sprite).spriteFrame = this.icon_ct;    
            }else{
                icon_robClose.active = false;
            }
            
            let head = playerNode.getChildByName("user_info").getChildByName("head_img").getComponent(app.subGameName + "_WeChatHeadImage");
            head.ShowHeroHead(player.pid);
            //玩家名字
            let playerName = "";
            playerName = player.name;
            if(playerName.length > 6){
                playerName = playerName.substring(0, 6) + '...';
            }
            let name = playerNode.getChildByName("user_info").getChildByName("lable_name").getComponent(cc.Label);
            name.string = playerName;

            let id = playerNode.getChildByName("user_info").getChildByName("label_id").getComponent(cc.Label);
            id.string = "ID:"+this.ComTool.GetPid(player["pid"]);

            //玩家性别
            let sex = playerNode.getChildByName("user_info").getChildByName("sex");
            if (player.sex == 0) {
                sex.getComponent(cc.Sprite).spriteFrame = this.boy;
            }else{
                sex.getComponent(cc.Sprite).spriteFrame = this.girl;
            }
        }
    },

    OnShow:function(){
        this.FormManager.CloseForm("UIChat");
        let juShu = this.DDZRoom.GetRoomConfig().setCount;
        let setID = this.DDZRoomMgr.GetEnterRoom().GetRoomProperty("setID");
        if(setID >= juShu && !app[app.subGameName + "_ShareDefine"]().isCoinRoom){
            this.isEnd = true;
            // this.btn_continue.getChildByName("icon").getComponent(cc.Label).string = "总结算";
            this.btn_openStart.active = false;
        }
        else{
            this.isEnd = false;
            // this.btn_continue.getChildByName("icon").getComponent(cc.Label).string = "继续";
            if(this.DDZRoom.GetRoomWanfa(0)){
                this.btn_openStart.active = false;
            }else{
                this.btn_openStart.active = true;
            }
        }
        if (app[app.subGameName + "_ShareDefine"]().isCoinRoom) {
            this.btn_openStart.active = false;
        }
        for(let i = 0; i < this.playerList.children.length; i++){
            let child = this.playerList.children[i];
            child.active = false;
        }
        this.ShowGameResult();
    },

    OnClick:function(btnName, btnNode){
        if(btnName == "btn_jixu"){
            if(!this.isEnd){
                if(app[app.subGameName + "_ShareDefine"]().isCoinRoom){
                    app[app.subGameName + "_NetManager"]().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "GoldRoom", {practiceId:app[app.subGameName + "_ShareDefine"]().practiceId}, this.OnSuccess.bind(this),this.OnEnterRoomFailed.bind(this));
                }
                else{
                    let room = this.DDZRoomMgr.GetEnterRoom();
                    if(!room){
                        this.ErrLog("Click_btn_ready not enter room");
                        return
                    }
                    let roomID = room.GetRoomProperty("roomID");
                    app[app.subGameName + "_GameManager"]().SendContinueGame(roomID);
                }
            }
            else{
                this.FormManager.ShowForm("game/DDZ/UIDDZ_2DRecord");
            }
            
        }
        else if(btnName == "btn_openStart"){
            let room = this.DDZRoomMgr.GetEnterRoom();
            let roomID = room.GetRoomProperty("roomID");
            this.DDZRoomMgr.SendOpenCardStart(roomID, true);
        }
        else if(btnName == "btn_share"){
            this.SDKManager.ShareScreen();
        }
        else if(btnName == "btn_out"){
            // app[app.subGameName + "_FormManager"]().AddDefaultFormName("UIPractice");
            app[app.subGameName + "Client"].ExitGame();
        }
    },

    OnSuccess:function(serverPack){
        let roomID = serverPack.roomID;
        app[app.subGameName + "_NetManager"]().SendPack('ddz.CDDZGetRoomInfo', {"roomID":roomID});
    },

    OnEnterRoomFailed:function(serverPack){
        app[app.subGameName + "Client"].ExitGame();
    },
});
