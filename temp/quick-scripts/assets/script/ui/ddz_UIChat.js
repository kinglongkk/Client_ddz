(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIChat.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddzf3581-de6e-436b-897b-d6e8f27eaea8', 'ddz_UIChat', __filename);
// script/ui/ddz_UIChat.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        EditBox: cc.EditBox,
        layout_face: cc.Node,
        layout_chat: cc.Node,
        scr_chat: cc.Node,
        scr_typing: cc.Node,
        sp_face: cc.Node,
        sp_chat: cc.Node,
        sp_typing: cc.Node,
        layout_record: cc.Node,
        typing_kuang: cc.Node,
        btn_send: cc.Node
    },

    OnCreateInit: function OnCreateInit() {},

    OnShow: function OnShow() {
        this.RoomMgr = app.DDZRoomMgr();
        var roomID = this.RoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        this.EditBox.string = "";

        //this.scr_chat.active = false;
        this.scr_chat.active = true;
        this.scr_typing.active = false;
        this.layout_face.active = true;
        this.sp_face.active = true;
        this.sp_chat.active = false;
        this.sp_typing.active = false;
        //this.typing_kuang.active = false;
        //this.btn_send.active = false;
        this.typing_kuang.active = true;
        this.btn_send.active = true;
        for (var idx = 0; idx < this.layout_chat.children.length; idx++) {
            var node = this.layout_chat.children[idx];
            var content = "";
            var isShow = true;
            switch (idx) {
                case 0:
                    content = app.i18n.t("UIVoiceStringBieChao");
                    break;
                case 1:
                    content = app.i18n.t("UIVoiceStringBieZou");
                    break;
                case 2:
                    content = app.i18n.t("UIVoiceStringZhaoHu");
                    break;
                case 3:
                    content = app.i18n.t("UIVoiceStringZanLi");
                    break;
                case 4:
                    content = app.i18n.t("UIVoiceStringZanShang");
                    break;
                case 5:
                    content = app.i18n.t("UIVoiceStringCuiCu");
                    break;
                case 6:
                    content = app.i18n.t("UIVoiceStringKuaJiang");
                    break;
                default:
                    isShow = false;
                    this.ErrLog("Event_chatmessage not find(%s)", idx);
            }
            node.active = isShow;
            node.getChildByName("lb_chat").getComponent(cc.Label).string = content;
        }
    },

    //-----------------回调函数------------------

    //---------点击函数---------------------
    OnClickForm: function OnClickForm() {
        //   this.CloseForm();
    },

    OnClick: function OnClick(btnName, btnNode) {
        if (btnName == "btn_send") {
            this.Click_btn_send();
        } else if (btnName == "btn_face") {
            this.Click_btn_face();
        } else if (btnName == "btn_chat") {
            this.Click_btn_chat();
        } else if (btnName == "btn_typing") {
            this.Click_btn_typing();
        } else if (btnName == "btn_close") {
            this.CloseForm();
        } else if (btnName.startsWith("btn_")) {
            this.Click_Btn(btnName);
        } else {
            this.ErrLog("OnClick(%s) not find btnName", btnName);
        }
    },
    Click_btn_face: function Click_btn_face() {
        this.scr_chat.active = false;
        this.scr_typing.active = false;
        this.layout_face.active = true;
        this.sp_face.active = true;
        this.sp_chat.active = false;
        this.sp_typing.active = false;
        this.typing_kuang.active = false;
        this.btn_send.active = false;
    },
    Click_btn_chat: function Click_btn_chat() {
        this.layout_face.active = false;
        this.scr_chat.active = true;
        this.scr_typing.active = false;
        this.sp_face.active = false;
        this.sp_chat.active = true;
        this.sp_typing.active = false;
        this.typing_kuang.active = false;
        this.btn_send.active = false;
    },
    Click_btn_typing: function Click_btn_typing() {
        this.layout_face.active = false;
        this.scr_chat.active = false;
        this.scr_typing.active = true;
        this.sp_face.active = false;
        this.sp_chat.active = false;
        this.sp_typing.active = true;
        this.typing_kuang.active = true;
        this.btn_send.active = true;
        var roomID = this.RoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        app.ddz_NetManager().SendPack("game.SChatMessageHandler", { "roomID": roomID }, this.GetChatMessageRecord.bind(this));
    },
    Click_btn_send: function Click_btn_send() {
        var content = this.EditBox.string;
        if (!content || "" == content) return;
        var roomID = this.RoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        app.ddz_GameManager().SendChat(5, 0, roomID, content);
        this.EditBox.string = "";
        this.CloseForm();
    },
    Click_Btn: function Click_Btn(btnName) {
        var quickID = 0;
        if (btnName.startsWith("btn_face")) {
            quickID = parseInt(btnName.substring(btnName.length - 3));
        } else if (btnName.startsWith("btn_chat")) {
            quickID = parseInt(btnName.substring(btnName.length - 2));
        }
        var roomID = this.RoomMgr.GetEnterRoom().GetRoomProperty("roomID");
        var content = "";

        app.ddz_GameManager().SendChat(5, quickID, roomID, content);

        this.CloseForm();
    },

    GetChatMessageRecord: function GetChatMessageRecord(serverPack) {
        this.layout_record.removeAllChildren();
        var list = serverPack;

        if (!list.length) return;

        for (var idx = 0; idx < list.length; idx++) {
            var data = list[idx];
            if (data.content == "") continue;
            var node = new cc.Node();
            node.anchorX = 0;
            var label = node.addComponent(cc.Label);
            label.fontSize = 30;
            label.lineHeight = 35;
            label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            label.enableWrapText = true;
            label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            var string = data.senderName + ":" + data.content;
            label.string = string;
            node.width = this.layout_record.width;
            node.color = cc.color(82, 98, 69);
            this.layout_record.addChild(node);
        }

        //this.scr_typing.getComponent(cc.ScrollView).scrollToBottom(2.0);
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
        //# sourceMappingURL=ddz_UIChat.js.map
        