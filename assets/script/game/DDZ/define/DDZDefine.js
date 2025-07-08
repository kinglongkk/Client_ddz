

var DDZDefine = {
};

//---------------------------基础(所有项目通用的枚举)--------------------------------------

var Common = function(){
	//房间最多人数
	this.MaxPlayer = 3;
	//玩家最大手牌
	this.MaxHandCard = 20;
	//玩家16张手牌
	this.MidHandCardEx = 17;
	//玩家15张手牌
	this.MidHandCard = 17;
	//玩家12张手牌
	this.MinHandCard = 17;
	//桌面最多墩牌
	this.MaxTableCard = 54;
	//手牌升起高度
	this.MaxRisePosY = 30;
	//正常倒计时30S
	this.MaxTickTime = [-1, 180, 300, 60, 30, 15];
	//最少倒计时5S
	this.MinTickTime = 5;
	//斗地主音效的路径
	this.SoundPath = "sound/ddz/";

	//斗地主抢地主方式
	this.HogCommon = 0;
	this.HogScore = 1;

	//斗地主阶段
	this.FaPaiState = 0;
	this.HogState = 1;
	this.AddDoubleState = 2;
	this.PlayingState = 3;
	this.PlayEndState = 4;
	
};

Common.apply(DDZDefine, []);
/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
	return DDZDefine;
}
