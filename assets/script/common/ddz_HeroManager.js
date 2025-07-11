/*
    玩家个人数据管理器
*/
var app = require("ddz_app");

var ddz_HeroManager = app.BaseClass.extend({

    Init:function(){
    	this.JS_Name = app.subGameName + "_HeroManager";

        let SysDataManager = app.ddz_SysDataManager();
        this.NetManager = app.ddz_NetManager();
        this.ShareDefine = app.ddz_ShareDefine();
        this.ComTool = app.ddz_ComTool();

        this.NetManager.RegNetPack("playerchanged", this.OnPack_HeroProperty, this);

        this.OnReload();

    	// this.Log("Init");
    },

    //切换账号
    OnReload:function(){
        this.dataInfo = {};
        this.heroID = 0;
    },


    //登陆初始化数据
    InitLoginData:function(heroID, heroInfo){
        this.dataInfo = heroInfo;
        this.heroID = heroID;
        //记录用户活跃度
        if(!cc.sys.isNative){
            heroInfo['vipExp']=0;
        }
        app.LocalDataManager().SetConfigProperty("Account", "AccountActive",heroInfo['vipExp']);
        app[app.subGameName + "Client"].OnEvent("ReloadHeroData",{});
    },

    //-------------------封包函数--------------------------
    //属性变化
    OnPack_HeroProperty:function(serverPack){

	    let count = serverPack.length;
	    for(let index=0; index<count; index++){
		    let dataInfo = serverPack[index];
		    let property = dataInfo["name"];
		    this.SetHeroProperty(property, dataInfo["value"]);
	    }
    },

    //----------------设置接口---------------------------
    //设置英雄属性
    SetHeroProperty:function(property, value){
        if(!this.dataInfo.hasOwnProperty(property)){
            this.ErrLog("SetHeroProperty(%s,%s) error", property, value);
            return false
        }
        this.dataInfo[property] = value;

        let argDict = {
            "Property":property,
            "Value":value,
        };
        app[app.subGameName + "Client"].OnEvent("HeroProperty", argDict);

        return true
    },

    //----------------获取接口-----------------------------

    //获取英雄ID
    GetHeroID:function(){
        return this.heroID;
    },

    GetHeroInfo:function(){
        return this.dataInfo
    },

    //获取英雄属性值
    GetHeroProperty:function(property){
        if(!this.dataInfo.hasOwnProperty(property)){
            this.ErrLog("GetHeroProperty(%s) error", property);
            return 
        }
        return this.dataInfo[property];
    },

    //随机角色名
    // GetRandHeroName:function(){
    //     let familyKeyList = Object.keys(this.FamilyName);
    //     let nameKeyList = Object.keys(this.Name);

    //     let familyName = this.FamilyName[this.ComTool.ListChoice(familyKeyList)]["FamilyName"];
    //     let name = this.Name[this.ComTool.ListChoice(nameKeyList)]["Name"];

    //     return [familyName, name].join("");
    // },

    //-------------发包接口------------------------
});


var g_ddz_HeroManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_ddz_HeroManager){
        g_ddz_HeroManager = new ddz_HeroManager();
    }
    return g_ddz_HeroManager;
}