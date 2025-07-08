(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/ddz_UINoticeBar.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4f71cQzbEhBO7zctU1gm3YW', 'ddz_UINoticeBar', __filename);
// script/ui/ddz_UINoticeBar.js

"use strict";

/*
 UIDice.js 摇色子界面
 */

var app = require("ddz_app");

cc.Class({
		extends: require(app.subGameName + "_BaseForm"),

		properties: {
				msg: cc.Node
		},

		OnCreateInit: function OnCreateInit() {

				this.NetManager = app.ddz_NetManager();

				this.speed = 30;

				this.msgList = [];

				this.NetManager.SendPack("game.CSystemNotice", {}, this.GetNoticeMsg.bind(this));
		},

		OnShow: function OnShow() {

				var argList = Array.prototype.slice.call(arguments);

				this.count = 0;

				this.runMsg();
		},

		runMsg: function runMsg() {

				this.msg.stopAllActions();

				if (!this.msgList.length) return;

				if (this.count >= this.msgList.length) {
						this.count = 0;
				}

				this.msg.getComponent(cc.Label).string = this.msgList[this.count];

				var node = this.node.getChildByName("bg");

				this.msg.x = node.width / 2 + node.x;
				this.msg.y = node.height / 2;

				var mWidth = this.msg.width;

				var moveX = node.x - node.width / 2 - mWidth;

				var time = (node.width + mWidth) / this.speed;

				var self = this;

				var seq = cc.sequence(cc.moveTo(time, cc.v2(moveX, this.msg.y)), cc.callFunc(function () {
						this.runMsg();
				}, this));

				this.msg.runAction(seq);

				this.count++;
		},

		GetNoticeMsg: function GetNoticeMsg(serverPack) {
				var list = serverPack;

				if (!list.length) return;

				for (var idx = 0; idx < list.length; idx++) {
						var data = list[idx];
						this.msgList.push(data.content);
				}

				this.runMsg();
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
        //# sourceMappingURL=ddz_UINoticeBar.js.map
        