var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        resVersion:cc.Label,
        lb_backCode:cc.EditBox,
    },
    OnCreateInit: function () {
        this.practiceConfig = app.ddz_SysDataManager().GetTableDict("practice");
        this.FormManager = app.ddz_FormManager();
        this.RegEvent("GetCurRoomID", this.Event_GetCurRoomID, this);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    //-----------------显示函数------------------
    OnShow: function () {
        app[app.subGameName + "Client"].SetGameType('');
        this.curRoomID = 0;
        this.curGameTypeStr = '';
        app.ddz_GameManager().SetGetRoomIDByUI(true);
        app.ddz_NetManager().SendPack("game.C1101GetRoomID", {});

        if(cc.sys.isNative){
            this.resVersion.string = "resV" + app.ddz_HotUpdateMgr().getLocalVersion();
        }else{
            this.resVersion.string = '';
        }
        this.FormManager.ShowForm(app.subGameName + "_UITop", app.subGameName + "_UIMain",true,false,true);
        this.FormManager.ShowForm(app.subGameName + "_UINoticeBar");
        app.ddz_GameManager().SetAutoPlayIng(false);
        this.FormManager.CloseForm(app.subGameName + "_UIAutoPlay");
        //返回大厅检测下是否有需要处理的数据
        let allSwitchGameData = [];
        let switchGameData = cc.sys.localStorage.getItem("switchGameData");
        if (switchGameData != "") {
            allSwitchGameData.push(JSON.parse(switchGameData));
        }
        for (let i = 0; i < allSwitchGameData.length; i++) {
            if (!allSwitchGameData[i]) return;
            console.log("allSwitchGameData[i].action");
            let action = allSwitchGameData[i].action;
            switch(action){
                case 'showForm':
                    this.FormManager.ShowForm(allSwitchGameData[i].fromName);
                    break;
                default:
                    console.log('未知动作: ' + action);
                    break;
            }
        }
        cc.sys.localStorage.setItem("switchGameData", "");
    },
    
    Event_GetCurRoomID:function(event){
        let serverPack = event;
        this.curRoomID = serverPack.roomID;
        if(0 != this.curRoomID){
            this.curGameTypeStr = serverPack.gameType.toLowerCase();
        }
    },
    Event_CodeError:function(event){
        let codeInfo = event;
        if(codeInfo["Code"] == this.ShareDefine.NotFind_Room){
            app.ddz_SysNotifyManager().ShowSysMsg('DissolveRoom');
            this.curRoomID = 0;
            this.curGameTypeStr = '';
        }
    },
    OnClose:function(){
    },
    //---------点击函数---------------------
    InitGameBtnList:function(serverPack){
        this.FormManager.ShowForm("UICreatRoom",serverPack,this.gameName);
    },
    SetWaitForConfirm:function(msgID,type,msgArg=[],cbArg=[]){
        let ConfirmManager = app.ddz_ConfirmManager();
        ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, cbArg);
        ConfirmManager.ShowConfirm(type, msgID, msgArg);
    },
    OnConFirm:function(clickType, msgID, backArgList){
        if(clickType != "Sure"){
            return
        }
        if('MSG_GO_ROOM' == msgID){
            this.Click_btn_goRoom();
        }
        else if('MSG_CLUB_RoomCard_Not_Enough' == msgID){
            let clubId = backArgList[0];
            for(let i=0;i<this.clubCardNtfs.length;i++){
                if(this.clubCardNtfs[i].clubId == clubId){
                    this.clubCardNtfs.splice(i,1);
                    break;
                }
            }
            if(0 != this.clubCardNtfs.length){
                let data = this.clubCardNtfs[0];
                setTimeout(function(){
                    app.ddz_SysNotifyManager().ShowSysMsg('MSG_CLUB_RoomCard_Not_Enough',[data.clubName,data.roomcardattention]);
                },200);
            }
        }
    },
    OnClick:function(btnName, btnNode){
        if('btn_create' == btnName){
            if(0 != this.curRoomID){
                this.SetWaitForConfirm('MSG_GO_ROOM',this.ShareDefine.Confirm,[this.curGameTypeStr]);
                return;
            }
        	this.gameName='ddz';
            this.FormManager.ShowForm(app.subGameName + "_UICreatRoom",null,this.gameName);
        }else if('btn_lxc'==btnName){
            if(0 != this.curRoomID){
                this.SetWaitForConfirm('MSG_GO_ROOM',this.ShareDefine.Confirm,[this.curGameTypeStr]);
                return;
            }
            this.FormManager.ShowForm(app.subGameName + "_UIPractice");
        }
        else if('btn_join' == btnName){
            if(0 != this.curRoomID){
                this.SetWaitForConfirm('MSG_GO_ROOM',this.ShareDefine.Confirm,[this.curGameTypeStr]);
                return;
            }
            this.FormManager.ShowForm(app.subGameName + "_UIJoin");
        }
        else if('btn_exit' == btnName){
            app[app.subGameName + "Client"].ExitGame();
        }
        else if('btn_race' == btnName){
            this.ShowSysMsg("功能暂未开放，尽情期待！");
            // let videoData = {action:"showVideo", backCode:100001};
            // cc.sys.localStorage.setItem("switchGameData", JSON.stringify(videoData));
            // app.ddz_SceneManager().LoadScene(app.subGameName + "VideoScene");
        }
        else if ("btn_video" == btnName) {
            let videoData = {action:"showVideo", backCode:parseInt(this.lb_backCode.string)};
            cc.sys.localStorage.setItem("switchGameData", JSON.stringify(videoData));
            app.ddz_SceneManager().LoadScene(app.subGameName + "VideoScene");
        }
        else{
            this.ErrLog("OnClick(%s) not find",btnName);
        }
        
    },

    Click_btn_goRoom:function(){
        app[app.subGameName + "Client"].SetGameType(this.curGameTypeStr);
        let event = {};
        event = {};
        event.roomID = this.curRoomID;
        app[app.subGameName + "Client"].OnEvent_LoginGetCurRoomID(event);
    },
});