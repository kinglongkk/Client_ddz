(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/uiEffect/ddz_AnimationEvent.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz6c10f-bcff-4bbc-80cd-ebd4410b6dca', 'ddz_AnimationEvent', __filename);
// script/ui/uiEffect/ddz_AnimationEvent.js

"use strict";

/*
 动画节点关键帧回调接收
 */

cc.Class({
	extends: cc.Component,

	properties: {
		EventNode: cc.Node
	},

	// use this for initialization
	onLoad: function onLoad() {
		this.JS_Name = this.node.name + "_AnimationEvent";
	},

	OnModelAnimationEvent: function OnModelAnimationEvent() {
		var argList = Array.prototype.slice.call(arguments);
		if (this.EventNode) {
			this.EventNode.emit("OnAnimationEvent", { "Node": this.node, "ArgList": argList });
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
        //# sourceMappingURL=ddz_AnimationEvent.js.map
        