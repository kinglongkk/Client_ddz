(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/scene/ddz_SceneManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz9c411-3457-46c5-9740-86e8c42cb884', 'ddz_SceneManager', __filename);
// script/scene/ddz_SceneManager.js

"use strict";

/*
	场景管理器
*/

var app = require("ddz_app");

var ddz_SceneManager = app.BaseClass.extend({

    Init: function Init() {
        this.JS_Name = app["subGameName"] + "_SceneManager";

        this.SceneInfo = app.ddz_SysDataManager().GetTableDict("SceneInfo");

        this.backMusicSoundID = -1;
        this.beforeBackMusicSoundName = "";

        this.mapID = 0;
        this.sceneName = "";
        //当前场景的组件对象
        this.sceneComponent = null;

        this.loadingNode = null;

        this.isLoading = false;
        this.loadingSceneName = "";

        app[app.subGameName + "Client"].RegEvent("ModalLayer", this.OnEvent_ModalLayer, this);
        app[app.subGameName + "Client"].RegEvent("ShakeScene", this.OnEvent_OnShakeScene, this);

        this.Log("Init");
    },

    //---------------回掉事件---------------
    //显示最顶层layer
    OnEvent_ModalLayer: function OnEvent_ModalLayer(event) {
        if (!this.sceneComponent) {
            this.WarnLog("OnEvent_ModalLayer not sceneName");
            return;
        }
        this.sceneComponent.OnTopEvent(event);
    },

    //应用切入后台
    OnEventHide: function OnEventHide() {
        if (!this.sceneComponent) {
            this.WarnLog("OnEventHide not sceneName");
            return;
        }
        this.sceneComponent.OnEventHide();
    },

    //应用显示
    OnEventShow: function OnEventShow(bReConnect) {
        if (!this.sceneComponent) {
            this.WarnLog("OnEventShow not sceneName");
            return;
        }
        this.sceneComponent.OnEventShow(bReConnect);
    },

    OnEvent_OnShakeScene: function OnEvent_OnShakeScene() {
        if (!this.sceneComponent) {
            this.WarnLog("OnEvent_ModalLayer not sceneName");
            return;
        }
        this.sceneComponent.OnShakeScene();
    },
    //---------------外部操作接口----------------

    //切换场景
    LoadScene: function LoadScene(sceneName) {
        var mapID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var isReLoad = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


        if (this.loadingSceneName == sceneName) {
            console.log(sceneName + " 场景已经在加载中...");
            return;
        }
        this.loadingSceneName = sceneName;
        if (isReLoad) {
            //如果是游戏切换需要释放内存，重新加载
            //清理已经加载的界面
            app.ddz_FormManager().loadFormDict = {};
            app.ddz_FormManager().showFormDict = {};
            app.ddz_FormManager().createingFormDict = {};
            app.ddz_FormManager().formWndShowInfo = {};
            app.ddz_FormManager().defaultFormNameList = [];
        }
        if (sceneName != 'loginScene') {
            // app.ddz_FormManager().ShowForm("UIWaitForm");
            var that = this;
            cc.loader.loadRes("ui/ddz_UIWaitForm", function (err, prefab) {
                that.loadingNode = cc.instantiate(prefab);
                console.log("load uiwaitform");
                cc.game.addPersistRootNode(that.loadingNode);
                that.isLoading = true;
                that.ReadyLoadScene(sceneName, mapID);
            });
        } else {
            if (!this.SceneInfo.hasOwnProperty(sceneName)) {
                this.ErrLog("LoadScene(%s) SceneInfo.txt not find", sceneName);
                return;
            }

            if (this.isLoading) {
                this.ErrLog("LoadScene(%s) fail doing (%s) loading now", sceneName, this.sceneName);
                return;
            }

            this.isLoading = true;
            this.ReadyLoadScene(sceneName, mapID);
        }

        // let that = this;
        // if('clubScene' == sceneName){
        //     app.ClubManager().ChangeOrientationH(false,function(){
        //         that.ReadyLoadScene(sceneName,mapID);
        //     });
        // }
        // else{
        //     if(!app.ddz_FormManager()._isOrientationH()){
        //         app.ClubManager().ChangeOrientationH(true,function(){
        //             that.ReadyLoadScene(sceneName,mapID);
        //         });
        //     }
        //     else{
        //         that.ReadyLoadScene(sceneName,mapID);
        //     }
        // }
    },
    ReadyLoadScene: function ReadyLoadScene(sceneName, mapID) {
        var lastSceneName = this.sceneName;
        this.Log("LoadScene((%s,%s) -> (%s,%s))", lastSceneName, this.mapID, sceneName, mapID);
        this.mapID = mapID;
        this.sceneName = sceneName;
        var lastSceneScriptName = "";
        var lastSceneScript = null;
        var that = this;
        //如果前一个场景不是启动场景
        if (this.SceneInfo.hasOwnProperty(lastSceneName)) {
            lastSceneScriptName = this.SceneInfo[lastSceneName]["ComponentName"];
            //找到场景对应的脚本组件

            lastSceneScript = cc.find('Canvas').getComponent(lastSceneScriptName);
        }

        var bluebirdObj = app.ddz_FormManager().LoadSceneDefaultForm(sceneName);

        //如果返回异步对象,需要登录异步执行完成,在进入切换场景
        if (bluebirdObj) {
            bluebirdObj.then(function () {
                that.StartLoadScene(lastSceneScript, lastSceneScriptName, sceneName);
            }).catch(function (error) {
                that.ErrLog("LoadSceneDefaultForm(%s) error:%s", sceneName, error.stack);

                that.StartLoadScene(lastSceneScript, lastSceneScriptName, sceneName);
            });
        } else {
            this.StartLoadScene(lastSceneScript, lastSceneScriptName, sceneName);
        }
    },
    formPath2RealPath: function formPath2RealPath(formPath) {
        if (formPath.indexOf('/') < 1) {
            return 'ui/' + formPath;
        }
        return formPath;
    },
    RealGamePrefab: function RealGamePrefab(GamePrefab) {
        var is3DShow = app.LocalDataManager().GetConfigProperty("SysSetting", "is3DShow");
        if (is3DShow == 0 && GamePrefab == 'game/ZJMJ/ui/UIZJMJPlay') {
            //2D场景需要切换
            GamePrefab = 'game/ZJMJ/ui/UIZJMJ2DPlay';
        }
        if (is3DShow == 2 && GamePrefab == 'game/ZJMJ/ui/UIZJMJPlay') {
            //2D场景需要切换
            GamePrefab = 'game/ZJMJ/ui/UIZJMJKXPlay';
        }
        if (is3DShow == 3 && GamePrefab == 'game/ZJMJ/ui/UIZJMJPlay') {
            //2D场景需要切换
            GamePrefab = 'game/ZJMJ/ui/UIZJMJ17Play';
        }
        return this.formPath2RealPath(GamePrefab);
    },
    StartLoadScene: function StartLoadScene(lastSceneScript, lastSceneScriptName, sceneName) {
        //预加载有戏场景开始
        // console.log("StartLoadScene sceneName == " + sceneName);
        // console.log("StartLoadScene SceneInfo == " + JSON.stringify(this.SceneInfo));
        var GamePrefab = this.SceneInfo[sceneName].gamePrefab;
        var that = this;
        if (GamePrefab == 0) {
            //退出当前场景
            if (lastSceneScript) {
                lastSceneScript.OnBeforeExitScene();
            }
            //关闭场景界面和模型
            app.ddz_FormManager().OnBeforeExitScene(lastSceneScriptName);
            //加载失败,也要切换进场景
            this.sceneComponent = null;
            cc.director.loadScene(sceneName, that.OnLoadSceneEnd.bind(that));
        } else {
            app.ddz_ControlManager().CreateLoadPromise(this.RealGamePrefab(GamePrefab)).then(function (prefab) {
                //退出当前场景
                //加载失败,也要切换进场景
                that.sceneComponent = null;
                cc.director.preloadScene(sceneName, function () {

                    if (lastSceneScript) {
                        lastSceneScript.OnBeforeExitScene();
                    }
                    //关闭场景界面和模型
                    app.ddz_FormManager().OnBeforeExitScene(lastSceneScriptName);

                    cc.director.loadScene(sceneName, that.OnLoadSceneEnd.bind(that));
                });
                return;
            }).catch(function (error) {
                //
            });
        }
        //预加载有戏场景
    },

    ShowHelp: function ShowHelp(eventID, eventNode) {
        if (this.sceneComponent) {
            this.sceneComponent.ShowHelp(eventID, eventNode);
        }
    },

    //播放背景音乐
    PlayMusic: function PlayMusic(backGroundSound) {

        if (!this.SceneInfo.hasOwnProperty(this.sceneName)) {
            this.ErrLog("PlayMusic failed, SceneInfo.txt not find:%s", this.sceneName);
            return;
        }

        if (!backGroundSound) {
            backGroundSound = this.SceneInfo[this.sceneName]["BackGroundSound"];
            //读取缓存的背景音乐
            if (backGroundSound != "" && backGroundSound != "0") {
                backGroundSound = app.LocalDataManager().GetConfigProperty("SysSetting", "MainBackMusic");
            }
            //读取缓存的背景音乐
        }

        if (backGroundSound == "0") {
            return;
        }

        //如果切换场景时，两个场景播放的背景音乐相同则不需要再次播放
        // if(this.beforeBackMusicSoundName == backGroundSound){
        //     return;
        // }
        //如果背景音乐不同，则先停止上一个场景残留的背景音乐，重新播放新的背景音乐
        this.StopSceneMusic();
        this.beforeBackMusicSoundName = backGroundSound;

        var that = this;
        app.ddz_SoundManager().PlayBackMusic(backGroundSound).then(function (soundID) {
            that.backMusicSoundID = soundID;
        });
    },

    PauseSceneMusic: function PauseSceneMusic() {
        if (this.backMusicSoundID != -1) {
            app.ddz_SoundManager().PauseSound(this.backMusicSoundID);
        }
    },
    RecoverySceneMusic: function RecoverySceneMusic() {
        if (this.backMusicSoundID != -1) {
            app.ddz_SoundManager().ResumeSound(this.backMusicSoundID);
        }
    },
    StopSceneMusic: function StopSceneMusic() {
        if (this.backMusicSoundID != -1) {
            app.ddz_SoundManager().StopSoundByAudioID(this.backMusicSoundID);
        }
    },
    UpdateSceneMusic: function UpdateSceneMusic() {
        if (this.backMusicSoundID != -1) {
            var volume = app.LocalDataManager().GetConfigProperty("SysSetting", "BackVolume");
            cc.audioEngine.setVolume(this.backMusicSoundID, volume);
        }
    },
    //------------回掉函数-------------------

    //场景加载完成回掉
    OnLoadSceneEnd: function OnLoadSceneEnd() {
        this.Log("OnLoadSceneEnd sceneName:%s", this.sceneName);

        this.isLoading = false;
        this.loadingSceneName = "";
        console.log("unload uiwaitform  begein");
        if (this.loadingNode) {
            cc.game.removePersistRootNode(this.loadingNode);
            this.loadingNode.removeFromParent();
            this.loadingNode = null;
            console.log("unload uiwaitform success");
        }

        if (!this.SceneInfo.hasOwnProperty(this.sceneName)) {
            this.ErrLog("OnLoadSceneEnd SceneInfo.txt not find:(%s)", this.sceneName);
            return;
        }
        var sceneScriptName = this.SceneInfo[this.sceneName]["ComponentName"];
        //找到场景对应的脚本组件
        this.sceneComponent = cc.find('Canvas').getComponent(sceneScriptName);
        //ipad适配
        var node = cc.find('Canvas');
        var c = node.getComponent(cc.Canvas);
        var heightWidth = cc.winSize.height / cc.winSize.width;
        if (app[app.subGameName + "_ComTool"]().IsIpad() || heightWidth > 0.6) {
            c.fitWidth = true;
        } else {
            c.fitWidth = false;
        }

        var FormManager = app.ddz_FormManager();

        FormManager.OnSwithSceneEnd(this.sceneName);
        if (this.sceneComponent) {
            this.sceneComponent.OnShowDefaultForm();
            this.sceneComponent.OnSwithSceneEnd();
        } else {
            console.log("找不到场景上绑定的组件:" + sceneScriptName);
        }

        this.PlayMusic();
    },

    //定时回掉
    OnTimer: function OnTimer(passSecond) {
        if (this.sceneComponent) {
            this.sceneComponent.OnBaseTimer(passSecond);
        }
    },

    //切换账号
    OnReload: function OnReload() {
        this.isFirstEnterMainScene = true;
    },
    //-----------------获取接口---------------------------

    //获取当前加载的场景名
    GetSceneType: function GetSceneType() {
        return this.sceneName;
    },

    //获取当前场景的组件对象
    GetSceneComponent: function GetSceneComponent() {
        return this.sceneComponent;
    },

    //获取当前场景的地图ID
    GetMapID: function GetMapID() {
        return this.mapID;
    }
});

var g_ddz_SceneManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function () {
    if (!g_ddz_SceneManager) {
        g_ddz_SceneManager = new ddz_SceneManager();
    }
    return g_ddz_SceneManager;
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
        //# sourceMappingURL=ddz_SceneManager.js.map
        