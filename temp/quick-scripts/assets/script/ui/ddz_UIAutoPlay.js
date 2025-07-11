(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UIAutoPlay.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz73f77-9e26-4e6c-963e-a986ed4e2dfc', 'ddz_UIAutoPlay', __filename);
// script/ui/ddz_UIAutoPlay.js

"use strict";

var app = require("ddz_app");
cc.Class({
    extends: require(app.subGameName + "_BaseForm"),

    properties: {
        lb_notice: cc.Node
    },

    // use this for initialization
    OnCreateInit: function OnCreateInit() {},
    OnShow: function OnShow() {
        var gameName = app.subGameName;
        if (gameName.indexOf("mj") > -1) {
            this.lb_notice.active = true;
        } else {
            this.lb_notice.active = false;
        }
        app[app.subGameName + "Client"].OnEvent("Card01AutoPlay", []);
    },
    OnClick: function OnClick(btnName, btnNode) {
        if ('btn_cancel' == btnName) {
            app.ddz_GameManager().CancelAutoPlay();
            this.CloseForm();
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
        //# sourceMappingURL=ddz_UIAutoPlay.js.map
        