(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/common/ddz_UtilsWord.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz133fc-c008-4704-a272-8d6b354f5f9d', 'ddz_UtilsWord', __filename);
// script/common/ddz_UtilsWord.js

"use strict";

var app = require("ddz_app");

var ddz_UtilsWord = app.BaseClass.extend({

    /**
     * 构造函数
     */
    Init: function Init() {
        this.JS_Name = app.subGameName + "_UtilsWord";
        this.SysDataManager = app.ddz_SysDataManager();
        this.dirtyWord = this.SysDataManager.GetTableDict("keywords");
        // console.log("UtilsWord init ",this.dirtyWord);
    },
    //检查字符串是否有敏感字符
    CheckContentDirty: function CheckContentDirty(string) {
        for (var idx in this.dirtyWord) {
            if (-1 != string.indexOf(this.dirtyWord[idx].id)) {
                var reg = new RegExp(this.dirtyWord[idx].id, "g");
                string = string.replace(reg, "**");
            }
        }

        return string;
    },

    //检查分享的字符串是否有敏感字符
    CheckShareContent: function CheckShareContent(string) {}

});

var g_ddz_UtilsWord = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
    if (!g_ddz_UtilsWord) {
        g_ddz_UtilsWord = new ddz_UtilsWord();
    }
    return g_ddz_UtilsWord;
};

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
        //# sourceMappingURL=ddz_UtilsWord.js.map
        