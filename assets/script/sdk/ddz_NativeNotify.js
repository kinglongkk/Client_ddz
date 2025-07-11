/*
 * 	NativeManager.js
 * 	移动端接口管理器
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 * change: "2014-10-28 20:24" hongdian 同步C++
 *
 */
var app = require("ddz_app");
/**
 * 类构造
 */
window.ddz_NativeNotify = {
	//native平台回调
	OnNativeNotify:function(eventType, eventDataString){
        try {
        	console.log(app.subGameName + "_NativeNotify OnNativeNotify eventType:" + eventType + ",eventDataString:" + eventDataString);
            let dataDict = JSON.parse(eventDataString);
            if (dataDict["subGameName"] != app.subGameName) {
                return;
            }
            if (eventType == "wechat") { //微信登录
	            app.ddz_WeChatAppManager().OnNativeNotifyWXLogin(dataDict);
            }else if (eventType == "wechatShare") {  //微信分享
                app.ddz_WeChatAppManager().OnNativeNotifyWXShare(dataDict);
            }else if (eventType == "wechatPay") { //微信支付
                app.ddz_WeChatAppManager().OnNativeNotifyWXPay(dataDict);
            }else if (eventType == "onBatteryLevel") { //电量回掉
                app[app.subGameName + "Client"].OnEvent("EvtBatteryLevel",{"Level": dataDict["Level"], "status":dataDict["status"]});
            }else if (eventType == "apkProess") { //下载apk进度
                app[app.subGameName + "Client"].OnEvent("LoadApkProess", {"progress": dataDict["proess"]});
            }else if (eventType == "download") { //下载
            	app.ddz_DownLoadMgr().OnDownLoadEvent(dataDict);
            }else if (eventType == "palyAudioFinsh") { //播放完成
            	app[app.subGameName + "Client"].OnEvent("palyAudioFinsh", {});
            }else if (eventType == "AudioError") {//录音失败
            	app[app.subGameName + "Client"].OnEvent("AudioError", {});
			}else if (eventType == "AudioStopError") {//录音失败
            	app[app.subGameName + "Client"].OnEvent("AudioStopError", {});
            }else if (eventType == "MedioRecordError") {//播放失败
            	app[app.subGameName + "Client"].OnEvent("MedioRecordError", {});
            }else if (eventType == "wellPrepared") {//准备录音
            	app[app.subGameName + "Client"].OnEvent("wellPrepared", {});
            }else if (eventType == "RecordAudioFinsh") { //录音完成
            	app[app.subGameName + "Client"].OnEvent("RECORDAUDIOFINSH", {});
            }else if (eventType == "GETLOCATION") { //获取定位
                app.ddz_LocationOnStartMgr().OnGetLocationCallBack(dataDict);
            }else if (eventType == "OnGetLocationForBaiduMapCallBack") { //获取百度定位结果
            	app[app.subGameName + "_LocationOnStartMgr"]().OnGetLocationForBaiduMapCallBack(dataDict);
            }else if (eventType == "copyText") { //获取定位
            	app[app.subGameName + "Client"].OnEvent("OnCopyTextNtf", dataDict);
            }else if (eventType == "DDShare") {
            	app[app.subGameName + "Client"].OnEvent("OnDDShare", dataDict);
            }else if (eventType == "XLShare") {
            	app[app.subGameName + "Client"].OnEvent("OnXLShare", dataDict);
            }else{
                console.log(app.subGameName + "_NativeNotify OnNativeNotify not find eventType: " + eventType); 
            }
        }
        catch(error) {
            if(eventType=='wechatShare'){
        		//还是给分享成功回调
            	app.ddz_WeChatAppManager().OnNativeNotifyWXShare({"ErrCode":0});
        	}else{
            	// this.ErrLog("OnNativeNotify(%s,%s) error(%s), error.stack:%s", eventType, eventDataString, error, error.stack);
                console.log(app.subGameName + "_NativeNotify OnNativeNotify error: " + eventType);
        	}
        }
	},
}