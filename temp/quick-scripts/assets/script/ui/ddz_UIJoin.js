(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIJoin.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'e2a6deS8edPvYpzBY6dBjeC', 'ddz_UIJoin', __filename);
// script/ui/ddz_UIJoin.js

"use strict";

/*
 UIJoin 登陆界面
*/
var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        sp_shurukuang: cc.Node
    },
    OnCreateInit: function OnCreateInit() {
        this.labelString = [];
        this.GameManager = app.ddz_GameManager();
        // this.RegEvent("EnterRoomNeedJoinFamily", this.Event_EnterRoomNeedJoinFamily, this);
        this.RegEvent("GetFamilyInfo", this.Event_GetFamilyInfo, this);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    //事件回调
    Event_CodeError: function Event_CodeError(event) {
        var codeInfo = event;
        if (codeInfo["Code"] == this.ShareDefine.CLUB_NotClubJoinRoomErr) {
            app.ddz_SysNotifyManager().ShowSysMsg('CLUB_NotClubJoinRoomErr');
        }
    },
    Event_EnterRoomNeedJoinFamily: function Event_EnterRoomNeedJoinFamily(event) {
        var familyID = event["familyID"];

        this.WaitForConfirm("EnterRoomNeedJoinFamily", [], [familyID], this.ShareDefine.ConfirmYN);
    },

    Event_GetFamilyInfo: function Event_GetFamilyInfo() {

        //加入房主工会成功,再次发送进入房间
        if (this.labelString.length == 6) {
            var roomKey = this.labelString.join("");
            this.GameManager.SendEnterRoom(roomKey);
        } else {
            this.ErrLog("Event_GetFamilyInfo labelString error", this.labelString);
        }
    },

    OnShow: function OnShow() {
        this.ResetNumber();
    },

    ResetNumber: function ResetNumber() {
        var children = this.sp_shurukuang.children;
        for (var idx = 0; idx < children.length; idx++) {
            var sp_bg = children[idx];
            sp_bg.getChildByName("lb_num").getComponent(cc.Label).string = "";
        }
        this.labelString = [];
    },

    /**
     * 2次确认点击回调
     * @param curEventType
     * @param curArgList
     */
    OnConFirm: function OnConFirm(clickType, msgID, backArgList) {
        if (clickType != "Sure") {
            return;
        }

        //如果确定加入房主的工会
        if (msgID == "EnterRoomNeedJoinFamily") {
            //发送加入工会
            app.ddz_PlayerFamilyManager().SendJoinFamily(backArgList[0]);
        } else {
            this.ErrLog("OnConFirm not find msgID:%s", msgID);
        }
    },
    OnClickForm: function OnClickForm() {
        //this.CloseForm();
    },
    //---------点击函数---------------------
    OnClick: function OnClick(btnName, btnNode) {
        if (!btnName) {
            this.ErrLog("UIJoin Buttn OnClick(%s) not find btnName", btnName);
        }
        if (btnName === "btn_clear") {
            this.Click_Btn_Clear();
        } else if (btnName === "btn_close") {
            this.Click_btn_close();
        } else if (btnName === "btn_reset") {
            this.ResetNumber();
        } else {
            this.Click_BtnNumber(btnName);
        }
    },

    Click_btn_close: function Click_btn_close() {
        this.labelString = [];
        this.OnClick_Close();
    },

    Click_Btn_Clear: function Click_Btn_Clear() {
        if (this.labelString.length == 0) {
            return;
        }
        var node = this.GetWndNode("sp_shuru/shurukuang/sp_bg" + this.labelString.length + "/lb_num");
        node.getComponent(cc.Label).string = "";
        this.labelString.pop();
    },

    Click_BtnNumber: function Click_BtnNumber(btnName) {
        if (this.labelString.length >= 6) return;
        var num = Math.floor(btnName.substring(btnName.length - 1));
        this.labelString.push(num);
        var roomKey = this.labelString.join("");

        var children = this.sp_shurukuang.children;
        for (var idx = 0; idx < children.length; idx++) {
            var sp_bg = children[idx];
            var lb_num = sp_bg.getChildByName("lb_num").getComponent(cc.Label);
            if (lb_num.string == "") {
                var data = this.labelString[this.labelString.length - 1];
                lb_num.string = data.toString();
                break;
            }
        }
        if (this.labelString.length == 6) {
            var self = this;
            app.ddz_NetManager().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "EnterRoom", { "roomKey": roomKey, "posID": -1 }, function () {}, function (event) {
                self.ResetNumber();
            });
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
        //# sourceMappingURL=ddz_UIJoin.js.map
        