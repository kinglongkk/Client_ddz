/*
    客户端公共require模块
*/

require('JSBaseModule');
let BaseClass = require('BaseClass');
let bluebird = require("bluebird");
let i18n = require("i18n");
let MD5Tool = require("MD5Tool");

//不需要创建单例的API
let apiDict = {
    "BaseClass":BaseClass["BaseClass"],
    "DBBaseClass":BaseClass["DBBaseClass"],
    "bluebird":bluebird,
    "i18n":i18n,
    "MD5":MD5Tool,
}


module.exports = apiDict;

//子游戏名称
let subGameName = "ddz";

module.exports.subGameName = subGameName;

//需要创建单例的API
let NeedCreateList = [
    //define
    "ddz_ShareDefine",

    "ddz_ComTool",
    "LocalDataManager",
    "ddz_UtilsWord",
    
    //基础模块
    "ddz_SysDataManager",
    "ddz_SysNotifyManager",
    "ddz_ConfirmManager",
    "ddz_ControlManager",
    "ddz_HttpPack",
    "ddz_NetRequest",
    "ddz_NetWork",
    "ddz_NetManager",
    "ddz_SDKManager",
    "ddz_WeChatManager",
    "ddz_WeChatAppManager",
    "ddz_DownLoadMgr",
    "ddz_LocationOnStartMgr",
    "ddz_HotUpdateMgr",
    
    //资源模块
    "ddz_SceneManager",
    "ddz_FormManager",
    "ddz_EffectManager",
	"ddz_SoundManager",
    "ddz_AudioManager",
    "ddz_HeadManager",
    //数据管理器
    "ddz_ServerTimeManager",
    "ddz_HeroAccountManager",
    "ddz_HeroManager",

    "ddz_NativeManager",

    //-----汇总数据管理器----
	"ddz_GameManager",

    //-----牌局相关-------
    "DDZRoom",
    "DDZRoomMgr",
    "DDZRoomSet",
    "DDZRoomPosMgr",
    "LogicDDZGame",
    "DDZDefine",
    "ddz_PokerCard"
];

module.exports.NeedCreateList = NeedCreateList;