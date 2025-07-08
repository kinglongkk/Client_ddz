(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UITop.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '95f18uKSHVBmKK1vN7uWZwB', 'ddz_UITop', __filename);
// script/ui/ddz_UITop.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        lb_heroName: cc.Label,
        lb_heroID: cc.Label,
        node_head: cc.Node,
        rightTop: cc.Node
    },
    OnCreateInit: function OnCreateInit() {
        this.closeformPath = "";
        this.RegEvent("HeroProperty", this.Event_HeroProperty);
        this.WeChatHeadImage1 = this.node_head.getComponent(app.subGameName + "_WeChatHeadImage");
    },
    OnShow: function OnShow(formPath) {
        var isShowFangka = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var isShowQuanka = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var isShowLedou = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        this.closeformPath = formPath;
        if (isShowFangka) {
            this.rightTop.getChildByName('fangka').active = true;
        } else {
            this.rightTop.getChildByName('fangka').active = false;
        }
        if (isShowQuanka) {
            this.rightTop.getChildByName('quanka').active = true;
        } else {
            this.rightTop.getChildByName('quanka').active = false;
        }
        if (isShowLedou) {
            this.rightTop.getChildByName('ledou').active = true;
        } else {
            this.rightTop.getChildByName('ledou').active = false;
        }
        this.ShowFastCount();
        this.ShowRoomCard();
        this.ShowClubCard();
        this.ShowHero_NameOrID();
    },

    Event_HeroProperty: function Event_HeroProperty(event) {
        var argDict = event;
        if (argDict["Property"] == "gold") {
            this.ShowFastCount();
        } else if (argDict["Property"] == "roomCard") {
            this.ShowRoomCard();
        } else if (argDict["Property"] == "clubCard") {
            this.ShowClubCard();
        }
    },
    ShowFastCount: function ShowFastCount() {
        var gold = app.ddz_HeroManager().GetHeroProperty('gold');
        this.rightTop.getChildByName('ledou').getChildByName('label').getComponent(cc.Label).string = gold;
    },
    ShowRoomCard: function ShowRoomCard() {
        var heroRoomCard = app.ddz_HeroManager().GetHeroProperty("roomCard");
        this.rightTop.getChildByName('fangka').getChildByName('label').getComponent(cc.Label).string = heroRoomCard;
    },
    ShowClubCard: function ShowClubCard() {
        var heroClubCard = app.ddz_HeroManager().GetHeroProperty("clubCard");
        this.rightTop.getChildByName('quanka').getChildByName('label').getComponent(cc.Label).string = heroClubCard;
    },

    ShowHero_NameOrID: function ShowHero_NameOrID() {
        var heroName = app.ddz_HeroManager().GetHeroProperty("name");
        this.lb_heroName.string = heroName;
        var width = this.lb_heroName.node.width;
        if (heroName.length > 9 && width > 200) this.lb_heroName.string = this.lb_heroName.string.substring(0, 9);
        var heroID = app.ddz_HeroManager().GetHeroProperty("pid");
        this.lb_heroID.string = app.i18n.t("UIMain_PIDText", { "pid": this.ComTool.GetPid(heroID) });
        this.WeChatHeadImage1.ShowHeroHead(heroID);
    },
    OnClick: function OnClick(btnName, btnNode) {
        if ('btn_close' == btnName) {
            if (this.closeformPath != "") {
                if (this.closeformPath == app.subGameName + "_UIMain") {
                    app[app.subGameName + "Client"].ExitGame();
                } else {
                    app.ddz_FormManager().CloseForm(this.closeformPath);
                    this.CloseForm();
                    app.ddz_FormManager().ShowForm(app.subGameName + "_UIMain");
                }
            }
        } else if ('btn_head' == btnName) {
            // this.FormManager.ShowForm("UIUserInfo");
        } else if ('btn_addGold' == btnName) {
            // this.FormManager.ShowForm("UIStore",'btn_table0');
        } else if ('btn_addRoomCard' == btnName) {
            // this.FormManager.ShowForm("UIStore",'btn_table1');
        } else if ('btn_addQuanCard' == btnName) {
            // this.FormManager.ShowForm('ui/club/UIClubStore');
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
        //# sourceMappingURL=ddz_UITop.js.map
        