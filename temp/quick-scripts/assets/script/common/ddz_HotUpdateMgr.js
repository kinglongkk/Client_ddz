(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/common/ddz_HotUpdateMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ddz49143-8c1f-4b51-b610-f41a6b7688d9', 'ddz_HotUpdateMgr', __filename);
// script/common/ddz_HotUpdateMgr.js

'use strict';

var app = require('ddz_app');

var ddz_HotUpdateMgr = app.BaseClass.extend({
    Init: function Init() {
        console.log('ddz_HotUpdateMgr Init - Start');
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'ALLGame/' + app.subGameName;
        this.LocalVersion = cc.sys.localStorage.getItem('LocalVersion_' + app.subGameName) || '';
        this._updating = false;

        // 确保存储目录存在
        if (!jsb.fileUtils.isDirectoryExist(this._storagePath)) {
            console.log('ddz_HotUpdateMgr Init - Creating directory: ' + this._storagePath);
            jsb.fileUtils.createDirectory(this._storagePath);
        } else {
            console.log('ddz_HotUpdateMgr Init - Directory exists, no cleanup performed');
        }

        if (!cc.sys.isNative) {
            console.log("Not native, exiting hot update: " + cc.sys.isNative);
            return;
        }

        console.log("Storage path for remote assets: " + this._storagePath);
        var UIRLFILE = "http://185.213.26.71:82/" + app.subGameName + "/remote-assets";

        // 优先加载本地清单文件
        var manifestPath = this._storagePath + '/project.manifest';
        if (jsb.fileUtils.isFileExist(manifestPath)) {
            console.log('ddz_HotUpdateMgr Init - Loading existing manifest: ' + manifestPath);
            this._am = new jsb.AssetsManager(manifestPath, this._storagePath, this.versionCompareHandle.bind(this));
            this._am.loadLocalManifest(manifestPath);
            this.LocalVersion = this._am.getLocalManifest().getVersion();
            cc.sys.localStorage.setItem('LocalVersion_' + app.subGameName, this.LocalVersion);
        } else {
            console.log('ddz_HotUpdateMgr Init - Creating new manifest');
            var customManifestStr = JSON.stringify({
                'packageUrl': UIRLFILE,
                'remoteManifestUrl': UIRLFILE + '/project.manifest',
                'remoteVersionUrl': UIRLFILE + '/version.manifest',
                'version': '0.0.1',
                'assets': {},
                'searchPaths': []
            });
            this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle.bind(this));
            var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
            this.LocalVersion = '0.0.1';
            cc.sys.localStorage.setItem('LocalVersion_' + app.subGameName, this.LocalVersion);
        }

        this._am.setVerifyCallback(function (path, asset) {
            var compressed = asset.compressed;
            var relativePath = asset.path;
            if (compressed) {
                console.log("Verification passed (compressed): " + relativePath);
                return true;
            } else {
                console.log("Verification passed (no MD5 check): " + relativePath);
                return true;
            }
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }
    },

    versionCompareHandle: function versionCompareHandle(versionA, versionB) {
        console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) continue;
            return a - b;
        }
        return vB.length > vA.length ? -1 : 0;
    },

    SaveManifest: function SaveManifest() {
        console.log("SaveManifest begin for " + app.subGameName);
        var path_Manifest = "http://185.213.26.71:82/" + app.subGameName + "/remote-assets/project.manifest";
        var file = this._storagePath + '/project.manifest';
        var self = this;
        var downloader = new jsb.Downloader();
        downloader.setOnFileTaskSuccess(function () {
            console.log("downFile2Local: project.manifest downloaded successfully for " + app.subGameName);
            var manifestContent = jsb.fileUtils.getStringFromFile(file);
            var manifestJson = JSON.parse(manifestContent);
            self.LocalVersion = manifestJson.version || self.LocalVersion;
            cc.sys.localStorage.setItem('LocalVersion_' + app.subGameName, self.LocalVersion);
            console.log("Updated LocalVersion to: " + self.LocalVersion);
            self.RestartApp();
        });
        downloader.setOnTaskError(function () {
            console.log("downFile2Local: project.manifest download failed for " + app.subGameName);
            app.SysNotifyManager().ShowSysMsg("下载Manifest失败，更新可能不完整...", [], 3);
            self.RestartApp();
        });
        downloader.createDownloadFileTask(path_Manifest, file);
    },

    getLocalVersion: function getLocalVersion() {
        console.log("getLocalVersion for " + app.subGameName + ": " + this.LocalVersion);
        if (this.LocalVersion === '' && this._am && !this._updating) {
            this.LocalVersion = this._am.getLocalManifest().getVersion();
            cc.sys.localStorage.setItem('LocalVersion_' + app.subGameName, this.LocalVersion);
        }
        return this.LocalVersion;
    },

    CheckUpdate: function CheckUpdate() {
        if (!cc.sys.isNative) {
            console.log("Not native, skipping update check");
            return;
        }
        if (this._updating) {
            console.log("Update in progress, cannot check...");
            app.SysNotifyManager().ShowSysMsg("正在更新，无法检测...", [], 3);
            return;
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            console.log("Failed to load local manifest for " + app.subGameName);
            app.SysNotifyManager().ShowSysMsg("加载本地Manifest失败...", [], 3);
            return;
        }
        this._am.setEventCallback(this.CheckCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
    },

    CheckCb: function CheckCb(event) {
        var code = event.getEventCode();
        console.log("CheckCb event for " + app.subGameName + ": " + code);
        switch (code) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log("No local manifest file found, update cannot proceed");
                app.SysNotifyManager().ShowSysMsg("找不到本地Manifest文件...", [], 3);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log("Failed to download/parse manifest, check network or server");
                app.SysNotifyManager().ShowSysMsg("下载或解析Manifest失败...", [], 3);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("Already up to date for " + app.subGameName);
                cc.sys.localStorage.setItem('updateCount_' + app.subGameName, 0);
                app[app.subGameName + "Client"].OnEvent('UpToDate');
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                console.log("New version found for " + app.subGameName + ", starting update");
                this.HotUpdate();
                break;
            default:
                console.log("CheckCb unknown event for " + app.subGameName + ": " + code);
                break;
        }
        this._am.setEventCallback(null);
        this._updating = false;
    },

    HotUpdate: function HotUpdate() {
        if (this._am && !this._updating) {
            var updateCount = parseInt(cc.sys.localStorage.getItem('updateCount_' + app.subGameName) || 0);
            if (updateCount >= 1) {
                console.log("Update limit reached for " + app.subGameName + ", skipping update");
                app[app.subGameName + "Client"].OnEvent('UpdateLimitReached');
                return;
            }
            this._am.setEventCallback(this.UpdateCb.bind(this));
            this.LocalVersion = this._am.getLocalManifest().getVersion();
            console.log("LocalVersion for " + app.subGameName + ": " + this.LocalVersion);
            console.log("RemoteVersion for " + app.subGameName + ": " + (this._am.getRemoteManifest() ? this._am.getRemoteManifest().getVersion() : "Not loaded"));
            this._failCount = 0;
            this._am.update();
            this._updating = true;
            cc.sys.localStorage.setItem('updateCount_' + app.subGameName, updateCount + 1);
        }
    },

    UpdateCb: function UpdateCb(event) {
        var failed = false;
        var needRestart = false;
        console.log("UpdateCb event for " + app.subGameName + ": " + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log("No local manifest file found for " + app.subGameName);
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log("Fail to download/parse manifest for " + app.subGameName);
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("Already up to date for " + app.subGameName);
                cc.sys.localStorage.setItem('updateCount_' + app.subGameName, 0);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                console.log("Progress for " + app.subGameName + ": " + event.getDownloadedBytes() + "/" + event.getTotalBytes());
                app[app.subGameName + "Client"].OnEvent('UpdateProgress', { bytes: event.getDownloadedBytes(), total: event.getTotalBytes() });
                break;
            case jsb.EventAssetsManager.ASSET_UPDATED:
                console.log("Asset updated for " + app.subGameName + ": " + event.getAssetId());
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log("Update finished for " + app.subGameName);
                var remoteManifest = this._am.getRemoteManifest();
                if (!remoteManifest) {
                    console.error("Remote manifest is null, falling back to SaveManifest");
                    needRestart = true;
                } else {
                    var manifestPath = this._storagePath + '/project.manifest';
                    try {
                        var manifestContent = remoteManifest.getManifestFile();
                        if (manifestContent) {
                            jsb.fileUtils.writeFile(manifestPath, manifestContent);
                            console.log("Saved updated manifest to: " + manifestPath);
                            this.LocalVersion = remoteManifest.getVersion() || this.LocalVersion;
                            cc.sys.localStorage.setItem('LocalVersion_' + app.subGameName, this.LocalVersion);
                            needRestart = true;
                        } else {
                            console.error("Manifest content is empty, falling back to SaveManifest");
                            needRestart = true;
                        }
                    } catch (e) {
                        console.error("Error saving manifest: " + e.message);
                        needRestart = true;
                    }
                }
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                console.log("Update failed for " + app.subGameName + ", retrying...");
                this._am.downloadFailedAssets();
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                console.log("Asset update error for " + app.subGameName + ": " + event.getAssetId() + ", " + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log("Decompress error for " + app.subGameName + ": " + event.getMessage());
                break;
        }
        if (failed) {
            this._am.setEventCallback(null);
            this._updating = false;
            app[app.subGameName + "Client"].OnEvent('UpdateFailed');
        }
        if (needRestart) {
            this.SaveManifest();
        }
    },

    RestartApp: function RestartApp() {
        console.log("RestartApp begin for " + app.subGameName);
        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this._am.getLocalManifest().getSearchPaths();
        Array.prototype.unshift.apply(searchPaths, newPaths);
        cc.sys.localStorage.setItem('HotUpdateSearchPaths_' + app.subGameName, JSON.stringify(searchPaths));
        jsb.fileUtils.setSearchPaths(searchPaths);
        if (!jsb.fileUtils.isFileExist(this._storagePath + '/project.manifest')) {
            console.error("Manifest file missing after update for " + app.subGameName);
            app[app.subGameName + "Client"].OnEvent('ManifestMissing');
            return;
        }
        console.log("Restarting game with search paths: " + JSON.stringify(searchPaths));
        cc.game.restart();
    },

    Destroy: function Destroy() {
        this._am.setEventCallback(null);
        this._updating = false;
        console.log("ddz_HotUpdateMgr Destroyed");
    }
});

var g_ddz_HotUpdateMgr = null;

exports.GetModel = function () {
    if (!g_ddz_HotUpdateMgr) g_ddz_HotUpdateMgr = new ddz_HotUpdateMgr();
    return g_ddz_HotUpdateMgr;
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
        //# sourceMappingURL=ddz_HotUpdateMgr.js.map
        