(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIUserInfo.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ab291OQni5F8I6k6FIscBNw', 'ddz_UIUserInfo', __filename);
// script/ui/ddz_UIUserInfo.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        sp_head: cc.Sprite,
        label_name: cc.Label,
        label_id: cc.Label,
        label_ip: cc.Label,
        label_gps: cc.Label,
        sp_female: cc.Sprite,
        sp_ip: cc.Node,
        sp_gps: cc.Node,
        sp_boy: cc.SpriteFrame,
        sp_girl: cc.SpriteFrame,
        itemsNode: cc.Node,
        itemPrefab: cc.Prefab,
        editBox: cc.EditBox,
        btnCopyNode: cc.Node
    },

    OnCreateInit: function OnCreateInit() {
        this.ReqIP();
        this.pos = -1;
        this.RegEvent("SHOWINFODISTANCE", this.OnEvt_ShowInfoDistance);
        this.RegEvent("OnCopyTextNtf", this.OnEvt_CopyTextNtf);

        var Gifts = app.ddz_SysDataManager().GetTableDict("Gift");
        this.giftCfg = [];
        for (var key in Gifts) {
            var itemNode = cc.instantiate(this.itemPrefab);
            itemNode.name = 'item' + key;
            itemNode.on('click', this.OnGiftClick, this);

            this.itemsNode.addChild(itemNode);
            var imgPath = 'texture/ui/' + app.subGameName + '_UIUserInfo/' + Gifts[key].ImageName;
            var iconPath = 'ScrollView/items/' + itemNode.name + '/item_icon';
            this.SetWndImageByFilePath(iconPath, imgPath);
        }
        this.editBox.node.on('editing-did-ended', this.EditBoxChangeCB, this);
    },
    EditBoxEndCB: function EditBoxEndCB() {
        this.editBox.string = this.label_id.string;
    },
    OnShow: function OnShow() {
        var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

        //        app.LocationMgr().setType("userinfo");
        this.pos = pos;
        if (pos < 0) {
            this.sp_gps.active = false;
            this.itemsNode.active = false;
            this.ShowHero_NameOrID();
        } else {
            this.RoomMgr = app.DDZRoomMgr();
            var room = this.RoomMgr.GetEnterRoom();
            var roomPosMgr = room.GetRoomPosMgr();
            this.sp_gps.active = true;
            this.itemsNode.active = true;
            this.ShowPlayerInfo(room);
            var playerInfo = roomPosMgr.GetPlayerInfoByPos(this.pos);
            if (playerInfo) {
                this.ShowPlayerAddress(playerInfo.pid);
            }
        }
        this.ShowSex();
        this.SetGiftBtnInteractable(this.sp_gps.active);
    },
    ShowPlayerAddress: function ShowPlayerAddress(pid) {
        if (pid > 0) {
            var that = this;
            var sendPack = { "pid": pid };
            app.ddz_NetManager().SendPack("game.CPlayerLocationInfo", sendPack, function (success) {
                var detail = success.locationInfo;
                var address = detail.Address;
                var updateTime = detail.updateTime;
                var now = Math.floor(new Date().getTime() / 1000);
                if (now - updateTime > 10800) {
                    //3小时内的定位有效
                    that.label_gps.string = "未知地址";
                    return;
                }
                if (address) {
                    that.label_gps.string = "地址:" + address;
                } else {
                    that.label_gps.string = "未知地址";
                }
            }, function (error) {
                //全部定位获取失败
                that.label_gps.string = "未知地址";
            });
        } else {
            this.label_gps.string = "未知地址";
        }
        //显示用户ip
        // this.SendHttpRequest('http://www.qp355.com/myip.php', "?Sign=ddcat", "GET",{});
    },
    SendHttpRequest: function SendHttpRequest(serverUrl, argString, requestType, sendPack) {

        var url = [serverUrl, argString].join("");

        var dataStr = JSON.stringify(sendPack);

        //每次都实例化一个，否则会引起请求结束，实例被释放了
        var httpRequest = new XMLHttpRequest();

        httpRequest.timeout = 2000;

        httpRequest.open(requestType, url, true);
        //服务器json解码
        httpRequest.setRequestHeader("Content-Type", "application/json");
        var that = this;
        httpRequest.onerror = function () {
            that.ErrLog("httpRequest.error:%s", url);
            that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
        };
        httpRequest.ontimeout = function () {};
        httpRequest.onreadystatechange = function () {

            //执行成功
            if (httpRequest.status == 200) {
                if (httpRequest.readyState == 4) {
                    that.OnReceiveHttpPack(serverUrl, httpRequest.responseText);
                }
            } else {
                that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
                that.ErrLog("onreadystatechange(%s,%s)", httpRequest.readyState, httpRequest.status);
            }
        };
        httpRequest.send(dataStr);
    },
    OnReceiveHttpPack: function OnReceiveHttpPack(serverUrl, httpResText) {
        try {
            var serverPack = JSON.parse(httpResText);
            if (serverPack["IsSuccess"] == 1) {
                this.sp_ip.getChildByName('label_IP').getComponent(cc.Label).string = serverPack.myip;
            } else {
                this.sp_ip.getChildByName('label_IP').getComponent(cc.Label).string = '未知ip';
            }
        } catch (error) {
            this.sp_ip.getChildByName('label_IP').getComponent(cc.Label).string = '未知ip';
        }
    },
    OnConnectHttpFail: function OnConnectHttpFail(serverUrl, readyState, status) {
        this.sp_ip.getChildByName('label_IP').getComponent(cc.Label).string = '未知ip';
    },
    SetGiftBtnInteractable: function SetGiftBtnInteractable(bEnable) {
        var items = this.itemsNode.children;
        for (var i = 0; i < items.length; i++) {
            var btn = items[i].getComponent(cc.Button);
            if (btn) btn.interactable = bEnable;
        }
    },
    ShowPlayerInfo: function ShowPlayerInfo(room) {
        var roomPosMgr = room.GetRoomPosMgr();
        var allPlayerInfo = null;
        if (roomPosMgr) allPlayerInfo = roomPosMgr.GetRoomAllPlayerInfo();else allPlayerInfo = room.GetRoomProperty('posList');
        var playerInfo = allPlayerInfo[this.pos];
        this.label_name.string = playerInfo["name"];
        this.label_id.string = this.ComTool.GetPid(playerInfo["pid"]);
        this.editBox.string = this.label_id.string;
        this.SetShowIDNode();
        if (playerInfo["playerIP"] == undefined) {
            this.label_ip.string = "ip获取失败";
        } else {
            this.label_ip.string = playerInfo["playerIP"];
        }
        //this.label_gps.string = "您距"+ this.label_name.string +"的距离：未知距离";
        var WeChatHeadImage1 = this.sp_head.getComponent(app.subGameName + "_WeChatHeadImage");
        WeChatHeadImage1.ShowHeroHead(playerInfo["pid"]);

        //app.LocationMgr().OnGetLocation();
    },
    //显示距离
    OnEvt_ShowInfoDistance: function OnEvt_ShowInfoDistance(event) {
        var room = this.RoomMgr.GetEnterRoom();
        var roomPosMgr = room.GetRoomPosMgr();
        var distance = parseInt(event["distance"].toString());
        if (event["pos1"] == roomPosMgr.GetClientPos() && event["pos2"] == this.pos) {
            this.label_gps.string = "您距" + this.label_name.string + "的距离：" + distance + "米";
        } else if (event["pos2"] == roomPosMgr.GetClientPos() && event["pos1"] == this.pos) {
            this.label_gps.string = "您距" + this.label_name.string + "的距离：" + distance + "米";
        }
    },
    ReqIP: function ReqIP() {
        app.ddz_NetManager().SendPack('game.CPlayerAddress', {});
    },

    ShowHero_NameOrID: function ShowHero_NameOrID() {
        var heroName = app.wzmj_HeroManager().GetHeroProperty("name");
        this.label_name.string = heroName;
        var heroID = app.wzmj_HeroManager().GetHeroProperty("pid");
        this.label_id.string = this.ComTool.GetPid(heroID); // app.i18n.t("UIMain_PIDText",{"pid":this.ComTool.GetPid(heroID)});
        this.editBox.string = this.label_id.string;
        var WeChatHeadImage1 = this.sp_head.getComponent(app.subGameName + "_WeChatHeadImage");
        WeChatHeadImage1.ShowHeroHead(heroID);
        this.SetShowIDNode();
    },
    ShowSex: function ShowSex() {
        var sex = -1;
        if (-1 == this.pos) sex = app.wzmj_HeroAccountManager().GetAccountProperty("Sex");else {
            var room = this.RoomMgr.GetEnterRoom();
            sex = room.GetRoomProperty('posList')[this.pos].sex;
        }
        if (sex == app.ddz_ShareDefine().HeroSex_Boy) {
            this.sp_female.spriteFrame = this.sp_boy;
        } else {
            this.sp_female.spriteFrame = this.sp_girl;
        }
    },
    OnGiftClick: function OnGiftClick(event) {
        if (-1 == this.pos) return;
        if (!this.RoomMgr) return;
        var room = this.RoomMgr.GetEnterRoom();
        if (!room) return;

        var itemName = event.target.name;
        var data = {};
        data.roomID = room.GetRoomProperty("roomID");
        data.pos = this.pos;
        data.productId = parseInt(itemName.substr('item'.length));
        app.ddz_NetManager().SendPack(app.subGameName + ".C" + app.subGameName.toUpperCase() + "SendGift", data);
        this.CloseForm();
    },
    SetShowIDNode: function SetShowIDNode() {
        if (cc.sys.isNative) {
            this.label_id.node.active = true;
            this.editBox.node.active = false;
            //this.btnCopyNode.active = true;
        } else {
            this.label_id.node.active = false;
            this.editBox.node.active = true;
            this.btnCopyNode.active = false;
        }
    },
    OnEvt_CopyTextNtf: function OnEvt_CopyTextNtf(event) {
        if (0 == event.code) this.ShowSysMsg("已复制ID：" + event.msg);else this.ShowSysMsg("复制失败");
    },
    OnClick: function OnClick(btnName, btnNode) {
        if ('btn_copy' == btnName) {
            var str = this.label_id.string;
            if (cc.sys.isNative) {
                var argList = [{ "Name": "msg", "Value": str.toString() }];
                app.wzmj_NativeManager().CallToNative("copyText", argList);
            } else {}
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
        //# sourceMappingURL=ddz_UIUserInfo.js.map
        