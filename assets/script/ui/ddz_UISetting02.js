var app = require("ddz_app");
cc.Class({
	extends: require(app.subGameName + "_BaseForm"),

	properties: {
		xuanze: cc.SpriteFrame,
		xuanze1: cc.SpriteFrame,
	},

	OnCreateInit: function () {
		this.ZorderLv = 8;
		this.sd_yinyue = this.GetWndNode("sp_setting/sp_yinyue/sd_yinyue");
		this.sd_yinxiao = this.GetWndNode("sp_setting/sp_yinxiao/sd_yinxiao");
		// this.sp_selecmusic = this.GetWndNode("sp_setting/sp_selecmusic");
		// this.btn_exit = this.GetWndNode("sp_setting/btn_tuichu");
		this.img_toggle1 = this.GetWndNode("sp_setting/sp_yinyue/btn_toggle1");
		this.img_toggle2 = this.GetWndNode("sp_setting/sp_yinxiao/btn_toggle2");
		// this.toggle4 = this.GetWndNode("sp_setting/sp_yuyin/Toggle4");
		this.sceneChangeNode = this.GetWndNode("sp_setting/sp_scene");
		// this.lb_name = this.GetWndNode("sp_setting/lb_name").getComponent(cc.Label);
		// this.fangYanXuanZe = this.GetWndNode("sp_setting/sp_language/btn_fangyan/xuanze").getComponent(cc.Sprite);
		// this.puTongXuanZe = this.GetWndNode("sp_setting/sp_language/btn_putong/xuanze").getComponent(cc.Sprite);

		this.LocalDataManager = app.LocalDataManager();
		this.RoomMgr = app[app.subGameName.toUpperCase() + "RoomMgr"]();
		this.RoomPosMgr = app[app.subGameName.toUpperCase() + "RoomPosMgr"]();
		this.ShareDefine = app[app.subGameName + "_ShareDefine"]();

		this.node.on("SliderParagraph", this.OnEven_SliderParagraph, this);

		let MaxCount = 20;
		this.dataList = [];
		for (let index = 0; index < MaxCount; index++) {
			this.dataList.push(index);
		}
	},

	OnEven_SliderParagraph: function (event) {
		let thisParentName = event.Node.parent.name;
		console.log("OnEven_SliderParagraph thisParentName：", thisParentName);
		if (thisParentName == "sp_yinyue") {
			this.LocalDataManager.SetConfigProperty("SysSetting", "BackVolume", event["Progress"]);
			let SceneManager = app[app.subGameName + "_SceneManager"]();
			SceneManager.UpdateSceneMusic();
			if (this.LocalDataManager.GetConfigProperty("SysSetting", "BackVolume") != 0) {
				if (!this.img_toggle1.active) {
					this.img_toggle1.active = true;
				}
			} else {
				if (this.img_toggle1.active) {
					this.img_toggle1.active = false;
				}
			}
		}
		else if (thisParentName == "sp_yinxiao") {
			this.LocalDataManager.SetConfigProperty("SysSetting", "SpVolume", event["Progress"]);
			if (this.LocalDataManager.GetConfigProperty("SysSetting", "SpVolume") != 0) {
				if (!this.img_toggle2.active) {
					this.img_toggle2.active = true;
				}
			} else {
				if (this.img_toggle2.active) {
					this.img_toggle2.active = false;
				}
			}
		}
	},

	OnShow: function () {
		// let playerName = app[app.subGameName + "_HeroManager"]().GetHeroProperty("name");
		// this.lb_name.string = playerName;
		let language = this.LocalDataManager.GetConfigProperty("SysSetting", app.subGameName + "_Language");
		this.jiesan = this.RoomMgr.GetEnterRoom().GetRoomConfigByProperty("jiesan");
		//福州麻将没有2d版本
		// this.node.getChildByName('sp_setting').getChildByName('sp_scene').active=true;

		this.playgame = app.subGameName;

		// if (language == this.ShareDefine.Mandarin) {
		// 	this.puTongXuanZe.spriteFrame = this.xuanze1;
		// 	this.fangYanXuanZe.spriteFrame = this.xuanze;
		// }
		// else if (language == this.ShareDefine.Dialect) {
		// 	this.puTongXuanZe.spriteFrame = this.xuanze;
		// 	this.fangYanXuanZe.spriteFrame = this.xuanze1;
		// }
		// else {
		// 	//this.ErrLog("UISetting02 language Error:%s", language);
		// }
		this.sd_yinyue.getComponent(app.subGameName + "_SliderProgressBarParagraph").InitData(this.dataList, [], false);
		this.sd_yinyue.getComponent(cc.Slider).progress = this.LocalDataManager.GetConfigProperty("SysSetting", "BackVolume");

		this.sd_yinxiao.getComponent(app.subGameName + "_SliderProgressBarParagraph").InitData(this.dataList, [], false);
		this.sd_yinxiao.getComponent(cc.Slider).progress = this.LocalDataManager.GetConfigProperty("SysSetting", "SpVolume");


		// let IsAudio = this.LocalDataManager.GetConfigProperty("SysSetting", "IsAudio");
		// console.log("Setting OnShow IsAudio:", IsAudio);
		// if (IsAudio > 0) {
		// 	this.toggle4.isChecked = true;
		// } else {
		// 	this.toggle4.isChecked = false;
		// }

		this.InitMusic(this.Check("BackVolume"), "sp_setting/sp_yinyue/btn_toggle1/img_dxk02");

		this.InitMusic(this.Check("SpVolume"), "sp_setting/sp_yinxiao/btn_toggle2/img_dxk02");

		this.InitMusicVolume(this.Check("SpVolume"), "sp_setting/sp_yinxiao/sd_yinxiao", "/pb_yinxiao");

		this.InitMusicVolume(this.Check("BackVolume"), "sp_setting/sp_yinyue/sd_yinyue", "/pb_yinyue");
		this.InitChangeScene();

		// let BackMusic=this.LocalDataManager.GetConfigProperty("SysSetting","BackMusic");
		// if(BackMusic){
		//如果背景音量大于0.读取缓存背景音乐
		// let MainBackMusic = this.LocalDataManager.GetConfigProperty("SysSetting", "GameBackMusic");
		// if (MainBackMusic == 'MainScene') {
		// 	this.sp_selecmusic.getChildByName('Toggle21').getComponent(cc.Toggle).isChecked = true;
		// 	this.sp_selecmusic.getChildByName('Toggle22').getComponent(cc.Toggle).isChecked = false;
		// 	this.sp_selecmusic.getChildByName('Toggle23').getComponent(cc.Toggle).isChecked = false;
		// } else if (MainBackMusic == 'RoomStart') {
		// 	this.sp_selecmusic.getChildByName('Toggle21').getComponent(cc.Toggle).isChecked = false;
		// 	this.sp_selecmusic.getChildByName('Toggle22').getComponent(cc.Toggle).isChecked = true;
		// 	this.sp_selecmusic.getChildByName('Toggle23').getComponent(cc.Toggle).isChecked = false;
		// } else if (MainBackMusic == 'RoomWaitStart') {
		// 	this.sp_selecmusic.getChildByName('Toggle21').getComponent(cc.Toggle).isChecked = false;
		// 	this.sp_selecmusic.getChildByName('Toggle22').getComponent(cc.Toggle).isChecked = false;
		// 	this.sp_selecmusic.getChildByName('Toggle23').getComponent(cc.Toggle).isChecked = true;
		// }
		// this.Click_Change_Back_Music(MainBackMusic);
		// }


	},
	InitChangeScene: function () {
		let is3DShow = this.LocalDataManager.GetConfigProperty("SysSetting", app.subGameName+"_is3DShow");
		if (is3DShow == 1) {
			this.sceneChangeNode.getChildByName('btn_3d').getChildByName('check').active=true;
			this.sceneChangeNode.getChildByName('btn_2d').getChildByName('check').active=false;
		}else {
			this.sceneChangeNode.getChildByName('btn_3d').getChildByName('check').active=false;
			this.sceneChangeNode.getChildByName('btn_2d').getChildByName('check').active=true;
		}
	},
	SetChangeScene: function (is3DShow) {
		this.LocalDataManager.SetConfigProperty("SysSetting", app.subGameName+"_is3DShow", is3DShow);
		this.InitChangeScene();
		app[app.subGameName + "_PokerCard"]().RefreshIs3DShow();
		let roomID = app.DDZRoomMgr().GetEnterRoomID();
        app.DDZRoomMgr().SendGetRoomInfo(roomID);
	},
	Check: function (option) {
		let value = this.LocalDataManager.GetConfigProperty("SysSetting", option);
		if (!value) {
			value = 0;
		}
		return value;
	},
	InitMusicVolume: function (optionValue, path1, path2) {
		if (!path1) {
			//this.ErrLog("InitMusicVolume(%s) not find", path);
			return;
		}
		if (!path2) {
			//this.ErrLog("InitMusicVolume(%s) not find", path);
			return;
		}
		if (optionValue >= 0 && optionValue <= 1) {
			this.GetWndComponent(path1, cc.Slider).progress = optionValue;
			this.GetWndComponent(path1 + path2, cc.ProgressBar).progress = optionValue;
		}
	},
	InitMusic: function (optionValue, path) {
		if (!path) {
			//this.ErrLog("InitMusic(%s) not find", path);
			return;
		}
		if (optionValue) {
			this.GetWndComponent(path, cc.Sprite).node.active = true;
		}
		else {
			this.GetWndComponent(path, cc.Sprite).node.active = false;
		}
	},
	//---------点击函数---------------------
	OnClick: function (btnName, btnNode) {
		if (btnName == "btn_toggle1") {
			this.Click_Toggle("BackMusic", "BackVolume");
		}
		else if (btnName == "btn_toggle2") {
			this.Click_Toggle("SpSound", "SpVolume");
		}
		else if (btnName == "Toggle4") {
			this.Click_Toggle("IsAudio");
		}
		else if (btnName == "Toggle21") {
			this.setMusicState();
			app[app.subGameName + "_SceneManager"]().PlayMusic("gameBackGround");
			this.LocalDataManager.SetConfigProperty("SysSetting", "GameBackMusic", "gameBackGround");
		}
		else if (btnName == "Toggle22") {
			this.setMusicState();
			app[app.subGameName + "_SceneManager"]().PlayMusic("RoomStart");
			this.LocalDataManager.SetConfigProperty("SysSetting", "GameBackMusic", "RoomStart");
		}
		else if (btnName == "Toggle23") {
			this.setMusicState();
			app[app.subGameName + "_SceneManager"]().PlayMusic("RoomWaitStart");
			this.LocalDataManager.SetConfigProperty("SysSetting", "GameBackMusic", "RoomWaitStart");
		}
		else if (btnName == "btn_jiesan") {
			this.Click_btn_jiesan();
			this.CloseForm();
		}

		else if (btnName == "btn_fangyan" || btnName == "btn_putong") {
			this.Click_Fangyan_PuTong(btnName);
		}
		else if (btnName == "btn_tuichu") {
			this.Click_Btn_QieHuan();
		} else if (btnName == "btn_2d") {
			let isChange2d = this.SetChangeScene(0);
			// this.FormManager.CloseForm("game/" + app.subGameName.toUpperCase() + "/UI" + app.subGameName.toUpperCase() + "_Play");
			// this.FormManager.ShowForm("game/" + app.subGameName.toUpperCase() + "/UI" + app.subGameName.toUpperCase() + "_2DPlay");

		}
		if (btnName == "btn_3d") {
			let isChange3d = this.SetChangeScene(1);
			// this.FormManager.ShowForm("game/" + app.subGameName.toUpperCase() + "/UI" + app.subGameName.toUpperCase() + "_Play");
			// this.FormManager.CloseForm("game/" + app.subGameName.toUpperCase() + "/UI" + app.subGameName.toUpperCase() + "_2DPlay");
		} else {
			//this.ErrLog("OnClick(%s) not find", btnName)
		}
	},
	Click_btn_jiesan: function () {

		let room = this.RoomMgr.GetEnterRoom();
		if (!room) {
			//this.ErrLog("Click_btn_jiesan not enter room");
			return
		}

		if (app[app.subGameName + "_ShareDefine"]().isCoinRoom) {
			//Event_ExitRoomSuccess 都有做退出处理
			//Event_CodeError
			app[app.subGameName + "Client"].ExitGame();
			return;
		}

		let state = room.GetRoomProperty("state");
		if (state == this.ShareDefine.RoomState_End) {
			//直接退出到大厅
			app[app.subGameName + "Client"].ExitGame();
			return
		}
		let ClientPos = this.RoomPosMgr.GetClientPos();
		let player = this.RoomPosMgr.GetPlayerInfoByPos(ClientPos);
		if (!player)
			return;
		let posName = player.name;
		let roomID = this.RoomMgr.GetEnterRoomID();
		if (state == this.ShareDefine.RoomState_Playing) {
			if (this.jiesan == 4) {
				app[app.subGameName + "_SysNotifyManager"]().ShowSysMsg("当前房间不可解散");
			}
			app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID, posName);
			return
		}

		let msgID = '';

		let roomCfg = room.GetRoomConfig();
		if (roomCfg.createType == 2 || roomCfg.clubId != 0) {
			msgID = 'UIMoreTuiChuFangJian';
		} else {
			if (room.IsClientIsOwner()) {
				msgID = 'PlayerLeaveRoom';
			}
			else {
				msgID = 'UIMoreTuiChuFangJian';
			}
		}

		app[app.subGameName + "_ConfirmManager"]().SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, []);
		app[app.subGameName + "_ConfirmManager"]().ShowConfirm(this.ShareDefine.Confirm, msgID, []);
	},
	setMusicState: function () {
		// if(!this.toggle1.isChecked){
		//     if(this.LocalDataManager.GetConfigProperty("SysSetting","BackVolume")==0){
		//         this.LocalDataManager.SetConfigProperty("SysSetting", "BackVolume", 0.1);
		//     }
		//     let SceneManager = app[app.subGameName + "_SceneManager"]();
		//     SceneManager.UpdateSceneMusic();

		// }
		if (this.LocalDataManager.GetConfigProperty("SysSetting", "BackVolume") != 0) {
			this.img_toggle1.active = true;
		} else {
			this.img_toggle1.active = false;
		}
		if (this.LocalDataManager.GetConfigProperty("SysSetting", "SpVolume") != 0) {
			this.img_toggle2.active = true;
		} else {
			this.img_toggle2.active = false;
		}
	},

	Click_Toggle: function (option, valuetype) {
		if (valuetype) {
			let value = this.LocalDataManager.GetConfigProperty("SysSetting", valuetype);
			let SceneManager = app[app.subGameName + "_SceneManager"]();
			if (value) {
				this.LocalDataManager.SetConfigProperty("SysSetting", valuetype, 0);

				//如果背景音乐关闭
				if (option == "BackMusic") {
					this.sd_yinyue.getComponent(cc.Slider).progress = 0;
					this.GetWndComponent("sp_setting/sp_yinyue/sd_yinyue/pb_yinyue", cc.ProgressBar).progress = 0;
					this.img_toggle1.children[0].active = false;
					SceneManager.UpdateSceneMusic();
					// SceneManager.PauseSceneMusic();
				} else {
					this.sd_yinxiao.getComponent(cc.Slider).progress = 0;
					this.GetWndComponent("sp_setting/sp_yinxiao/sd_yinxiao/pb_yinxiao", cc.ProgressBar).progress = 0;
					this.img_toggle2.children[0].active = false;
				}
			} else {
				this.LocalDataManager.SetConfigProperty("SysSetting", valuetype, 0.5);

				//背景音乐开
				if (option == "BackMusic") {
					this.sd_yinyue.getComponent(cc.Slider).progress = 0.5;
					this.GetWndComponent("sp_setting/sp_yinyue/sd_yinyue/pb_yinyue", cc.ProgressBar).progress = 0.5;
					this.img_toggle1.children[0].active = true;
					SceneManager.UpdateSceneMusic();
					// SceneManager.RecoverySceneMusic();
				} else {
					this.sd_yinxiao.getComponent(cc.Slider).progress = 0.5;
					this.GetWndComponent("sp_setting/sp_yinxiao/sd_yinxiao/pb_yinxiao", cc.ProgressBar).progress = 0.5;
					this.img_toggle2.children[0].active = true;
				}
			}
		} else {
			// let IsAudio = this.LocalDataManager.GetConfigProperty("SysSetting", option);
			// if (IsAudio) {
			// 	this.toggle4.isChecked = false;
			// 	this.LocalDataManager.SetConfigProperty("SysSetting", option, 0);
			// } else {
			// 	this.toggle4.isChecked = true;
			// 	this.LocalDataManager.SetConfigProperty("SysSetting", option, 1);
			// }
			// var aaa = this.LocalDataManager.GetConfigProperty("SysSetting", option);
		}

	},

	Click_Fangyan_PuTong: function (btnName1) {
		let btnName1XuanZePath = ["sp_setting/sp_language", btnName1, "xuanze"].join("/");
		let nodeSpriteFrame = this.GetWndComponent(btnName1XuanZePath, cc.Sprite).spriteFrame;
		let btnName2 = "";
		if (btnName1 == "btn_fangyan") {
			btnName2 = "btn_putong";
			this.LocalDataManager.SetConfigProperty("SysSetting", app.subGameName + "_Language", this.ShareDefine.Dialect);
		}
		else if (btnName1 == "btn_putong") {
			btnName2 = "btn_fangyan";
			this.LocalDataManager.SetConfigProperty("SysSetting", app.subGameName + "_Language", this.ShareDefine.Mandarin);
		} else {
			this.Error("Check_Fangyan_PuTong(%s) not find", btnName1);
		}
		if (nodeSpriteFrame.name == "btn_select") {
			return;
		}
		let btnName2XuanZePath = ["sp_setting/sp_language", btnName2, "xuanze"].join("/");
		if (nodeSpriteFrame.name == "icon_selectBg") {
			this.GetWndComponent(btnName1XuanZePath, cc.Sprite).spriteFrame = this.xuanze;
			this.GetWndComponent(btnName2XuanZePath, cc.Sprite).spriteFrame = this.xuanze1;
		} else {
			this.GetWndComponent(btnName1XuanZePath, cc.Sprite).spriteFrame = this.xuanze1;
			this.GetWndComponent(btnName2XuanZePath, cc.Sprite).spriteFrame = this.xuanze;
		}
	},
	Click_Btn_TuiChu: function () {
		let msgID = "MSG_EXIT_GAME";
		let ConfirmManager = app[app.subGameName + "_ConfirmManager"]();
		ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, []);
		ConfirmManager.ShowConfirm(this.ShareDefine.Confirm, msgID, [])
	},
	Click_Btn_QieHuan: function () {
		this.WaitForConfirm("UIMoreQieHuanZhangHao", [], [], this.ShareDefine.Confirm);
	},
	OnConFirm: function (clickType, msgID, backArgList) {
		if (clickType != "Sure") {
			return
		} else if (msgID == "PlayerLeaveRoom") {
			let roomID = this.RoomMgr.GetEnterRoomID();
			app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID);
		}
		else if (msgID == "UIMoreTuiChuFangJian") {
			let ClientPos = this.RoomPosMgr.GetClientPos();
			let player = this.RoomPosMgr.GetPlayerInfoByPos(ClientPos);
			if (!player)
				return;
			let posName = player.name;
			let roomID = this.RoomMgr.GetEnterRoomID();
			let state = this.RoomMgr.GetEnterRoom().GetRoomProperty("state");
			if (state == this.ShareDefine.RoomState_Playing) {
				app[app.subGameName + "_GameManager"]().SendDissolveRoom(roomID, posName);
				return;
			}
			this.RoomMgr.SendExitRoom(roomID, ClientPos);
		}
	}
});