/*
    客户端系统配置表管理器
*/
var app = require("ddz_app");

var ddz_SysDataManager = app.BaseClass.extend({

    Init:function(){
    	this.JS_Name = app["subGameName"] + "_SysDataManager";

		//字段key开始行
		this.FieldLine = 1;
		//有效配置开始行
		this.DataLine = 2;

		this.Key = 1245;

		this.isNative = false;

    	this.tableDict = {};

    	this.jsonDict = {};
    },

	// 获取表字典数据
	GetTableDict:function(tableName){
		//每个小游戏表名字加上游戏简写前缀
		// tableName = app.subGameName + "_" + tableName;
		//如果表为读取，则读取
		if (!this.tableDict[tableName]){
			console.log("GetTableDict not load  "+tableName);
			return {}
		}
		return this.tableDict[tableName].json;
	},

	//获取json配置文件
	GetJsonData:function(tableName){
		let dataDict = this.jsonDict[tableName];
		if(!dataDict){
			console.log("GetJsonData tableName not find  "+tableName);
			return
		}
		return dataDict
	},

	// 重载表数据
	ReloadTable:function(tableName, keyNameList=""){

		//可能本身就不存在表数据,初始化空字典
		if(!this.tableDict.hasOwnProperty(tableName)){
			this.tableDict[tableName] = {};
		}

		let that = this;

		this.ReadTable(tableName)
			.then(function(textData){
				
				let dataDict = that.tableDict[tableName];

				//清空原来的字典数据
				let keyList = Object.keys(dataDict);
				let count = keyList.length;
				for(let index=0; index<count; index++){
					let keyName = keyList[index];
					delete dataDict[keyName];
				}
				
				that.OnLoadTableEnd(tableName, keyNameList, textData, dataDict);
			})
			.catch(function(error){
				console.log("ReloadTable error:" + tableName + ":" + error.stack);
			})
	},

	// 删除表数据
	DeleteTable:function(tableName){
		delete this.tableDict[tableName];
	},

	// 读取表数据
	ReadTable:function(tableName){
		
		var that = this;
    	var tablePath = 'configs/' + tableName;

        //创建异步函数
        let promisefunc = function(resolve, reject){
                                                    //加载资源
                                                    cc.loader.loadRes(tablePath, function (error, textData) {

                                                        if(error){
                                                            reject(error);
                                                            return
                                                        }

                                                        resolve(textData);

                                                    })};
        //返回异步对象
        return new app.bluebird(promisefunc);

    },

    // 表数据读取完成
	OnLoadTableEnd:function(tableName, keyNameList, textData, tableInfo={}){
		this.tableDict[tableName] = textData;
		// console.log("OnLoadTableEnd tableName: " + tableName + ",textData: " + JSON.stringify(textData.json));
	},
	
	// 转化表为字典
	TransformTextData:function(tableName, textData){

		if(this.isNative){
			textData = this.DecodeText(textData);
		}

		let textDataList = textData.text.split("\n");
		let lineCount = textDataList.length;
		if(!lineCount){
			// this.ErrLog("TransformTextData(%s) not data", tableName);
			return
		}
		let lineNum = -1;

		let fieldNameList = null;
		let fieldCount = null;

		let tableDataDict = {};

		for(let index_i =0; index_i<lineCount; index_i++){
			let textLineDataStr = textDataList[index_i];

			//去除空格
			textLineDataStr = textLineDataStr.replace(/(\s*$)/g, "");
			//读到最后一行，跳出
			if(!textLineDataStr){
				continue
			}
			lineNum += 1;
			let textLineDataList = textLineDataStr.split("\t");
			
			//如果是key行,记录key数据
			if(lineNum === this.FieldLine){
				fieldNameList = textLineDataList;
				fieldCount = fieldNameList.length;
				continue
			}
			else if(lineNum >= this.DataLine){
				
				let rowCount = textLineDataList.length;
				if(rowCount != fieldCount){
					// this.ErrLog("TransformTextData(%s),textLineDataList:%s error need(%s)", tableName, JSON.stringify(textLineDataList), fieldCount);
					continue
				}
				let rowKey = textLineDataList[0];
				let rowDataDict = {};
				for(var index_j=0; index_j<rowCount; index_j++){
					let value = textLineDataList[index_j];
					try{
						value = this.GetTransformValue(value);
					}
					catch(error){
						// this.ErrLog("GetTransformValue(%s)(%s), error:%s", tableName, value, error.stack);
						//throw new Error("Read Text Fail:" + tablePath);
						value = undefined;
					}
					
					rowDataDict[fieldNameList[index_j]] = value;
				}
				if(tableName == "gameCreate" || tableName == "GameHelp"){
					tableDataDict[index_i] = rowDataDict;
				}else{
					tableDataDict[rowKey] = rowDataDict;
				}
			}
			else{
				
			}
		}

		return tableDataDict
	},

	//解密
	DecodeText:function(textData){

		let buffCount = textData.length;
		let outText = "";

		//遍历字符串解密
		for(let index_j=0; index_j<buffCount; ){

			let value = textData.substring(index_j, index_j+4);
			value = parseInt(value,16)^this.Key;
			outText += String.fromCharCode(value);

			index_j += 4;
		}


		return outText
	},
	
	/**
	 * 获取value转化后的值
	 */
	GetTransformValue:function(valueStr){
		let startStr = valueStr[0];
		let endStr = valueStr[valueStr.length-1];
		//如果是列表
		if(startStr === "[" && endStr === "]"){
			return JSON.parse(valueStr);
		}
		else if(startStr === "{" && endStr === "}"){
			return JSON.parse(valueStr);
		}
		else if (valueStr.indexOf("return") != -1){
			return new Function(valueStr);
		}
		else{
			//去整
			//如果不是纯数字,则为字符串
			if(isNaN(valueStr)){
				return valueStr
			}
			else{
				return Number(valueStr)
			}
		}

	},

	// 获取表字段名对应联合表key字符串
	GetKeyNameStr:function(keyNameList, valueDict){

		let keyValueList = [];
		let count = keyNameList.length;

		//构建联合表key 字符串
		for(let index = 0; index < count; index++){
			let keyName = keyNameList[index];
			if (!valueDict.hasOwnProperty(keyName)){
				// this.ErrLog("GetKeyNameStr valueDict(%s) dont have keyName(%s)", JSON.stringify(valueDict), keyName);
				return null
			}
			keyValueList.push(valueDict[keyName]);
		}

		return keyValueList.join("_")
	},
	
	//加载json配置文件
	OnLoadJson:function(jsonFileName, jsonData){

		this.jsonDict[jsonFileName] = jsonData;
	},
	//--------------------------联合key接口--------------------------------
	
	// 获取联合表keylist 对应的keystr
	GetMuchKeyStr:function(keyList){
		return keyList.join("_")
	},
	
	// 表数据输出
	DebugOutput:function(tableName=""){

		let tableInfo = null;
		
		//如果是指定表
		if(tableName){
			tableInfo = this.tableDict[tableName];
		}
		else{
			tableInfo = this.tableDict;
		}
		
	}

});


var g_ddz_SysDataManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_ddz_SysDataManager){
        g_ddz_SysDataManager = new ddz_SysDataManager();
    }
    return g_ddz_SysDataManager;
}