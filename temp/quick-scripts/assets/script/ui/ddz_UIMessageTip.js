(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIMessageTip.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '7d1d1mpn/dBK7sHnw0co2GA', 'ddz_UIMessageTip', __filename);
// script/ui/ddz_UIMessageTip.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        lb_info: cc.Label

    },

    OnCreateInit: function OnCreateInit() {
        this.SysNotifyManager = app.ddz_SysNotifyManager();
    },

    OnShow: function OnShow(msgID) {
        this.ShowLabelString(msgID);
    },
    ShowLabelString: function ShowLabelString(msgID) {
        var desc = this.SysNotifyManager.GetSysMsgContentByMsgID(msgID);
        var reg = /\/n/g;
        desc = desc.replace(reg, "\n");
        reg = /\/t/g;
        desc = desc.replace(reg, "\t");
        this.lb_info.string = desc;
    },

    GetMsgWndSize: function GetMsgWndSize() {
        return this.lb_info.node.getContentSize();
    },
    //-----------------回调函数------------------

    //---------点击函数---------------------
    OnClick: function OnClick(btnName, btnNode) {}

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
        //# sourceMappingURL=ddz_UIMessageTip.js.map
        