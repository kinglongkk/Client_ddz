(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/ui/uiEffect/ddz_WeChatHeadImage.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddzce551-cdf7-4ff7-b9d1-ff119733cfed', 'ddz_WeChatHeadImage', __filename);
// script/ui/uiEffect/ddz_WeChatHeadImage.js

"use strict";

var app = require("ddz_app");

cc.Class({
	extends: require(app.subGameName + "_BaseComponent"),

	properties: {},

	// use this for initialization
	onLoad: function onLoad() {
		if (this.isLoadEnd) return;
		this.isLoadEnd = true;
		this.JS_Name = this.node.name + "_WeChatHeadImage";
		this.HeroAccountManager = app.ddz_HeroAccountManager();
		this.HeroManager = app.ddz_HeroManager();
		this.SysDataManager = app.ddz_SysDataManager();
		this.ShareDefine = app.ddz_ShareDefine();
		this.ControlManager = app.ddz_ControlManager();
		this.WeChatManager = app.ddz_WeChatManager();
		this.IntegrateImage = this.SysDataManager.GetTableDict("IntegrateImage");
		this.defaultManHeadPath = this.IntegrateImage["DefaultManHead"]["FilePath"];
		this.defaultWoMenHeadPath = this.IntegrateImage["DefaultWomenHead"]["FilePath"];

		this.headSprite = this.node.getComponent(cc.Sprite);
		this.heroID = 0;
		app[app.subGameName + "Client"].RegEvent("RefreshHeadImageSprite", this.Event_RefreshHeadImageSprite, this);
	},

	/*//显示
 onEnable:function(){
 	app[app.subGameName + "Client"].RegEvent("RefreshHeadImageSprite", this.Event_RefreshHeadImageSprite, this);
 },
 
 //关闭时
 onDisable:function(){
 	app[app.subGameName + "Client"].UnRegTargetEvent(this);
 },*/

	Event_RefreshHeadImageSprite: function Event_RefreshHeadImageSprite(event) {
		var heroIDList = event["HeroIDList"] || [];
		if (heroIDList.InArray(this.heroID)) {
			var spriteFrame = this.WeChatManager.GetHeroHeadSpriteFrame(this.heroID);
			this.headSprite.spriteFrame = spriteFrame;
		}
	},
	OnReloadHeroHead: function OnReloadHeroHead(heroID) {
		var heroSex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	},
	//显示微信头像
	ShowHeroHead: function ShowHeroHead(heroID) {
		var heroSex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		var bMag = false;
		if (this.WeChatManager) bMag = true;
		console.log('ShowHeroHead bMag = ' + bMag);
		if (!this.WeChatManager) {
			// this.ErrLog("ShowHeroHead(%s) not active", heroID);
			return;
		}
		this.heroID = heroID;

		var spriteFrame = this.WeChatManager.GetHeroHeadSpriteFrame(heroID);
		var that = this;

		if (spriteFrame) {
			console.log('ShowHeroHead bMag spriteFrame = ' + true);
			this.headSprite.spriteFrame = spriteFrame;
		} else {
			console.log('ShowHeroHead bMag spriteFrame = ' + false);
			var defaultHeadPath = "";
			if (heroSex == this.ShareDefine.HeroSex_Boy) {
				defaultHeadPath = this.defaultManHeadPath;
			} else {
				defaultHeadPath = this.defaultWoMenHeadPath;
			}

			//清空图片
			this.headSprite.spriteFrame = null;

			this.ControlManager.CreateLoadPromise(defaultHeadPath, cc.SpriteFrame).then(function (spriteFrame) {
				if (!spriteFrame) {
					// that.ErrLog("defaultHeadPath:%s not find", defaultHeadPath);
					return;
				}
				//如果已经被设置了图片过滤,有可能Event_RefreshHeadImageSprite回调设置了微信头像
				if (that.headSprite.spriteFrame) {} else {
					that.headSprite.spriteFrame = spriteFrame;
				}
			}).catch(function (error) {
				// that.ErrLog("error:%s", error.stack);
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
        //# sourceMappingURL=ddz_WeChatHeadImage.js.map
        