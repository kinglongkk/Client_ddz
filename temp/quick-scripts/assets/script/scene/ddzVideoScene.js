(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/scene/ddzVideoScene.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4ff12gYWPVKaIp3Nk9Xxvr1', 'ddzVideoScene', __filename);
// script/scene/ddzVideoScene.js

"use strict";

/*
    打牌场景
*/

var app = require("ddz_app");

cc.Class({
    extends: require(app.subGameName + "_BaseScene"),
    properties: {},

    //------回掉函数-------------------
    OnCreate: function OnCreate() {},

    //进入场景
    OnSwithSceneEnd: function OnSwithSceneEnd() {}

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
        //# sourceMappingURL=ddzVideoScene.js.map
        