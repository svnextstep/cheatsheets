var showDetail = {
	oMainItems : [],
	oFormItems : [],
	subMenu : [],
	
	init : function (aMainItems, aSentenceForm, aTenseTable, aDefaultVal, winWr) 
	{
		this.aMainItems = aMainItems;
		this.aSentenceForm = aSentenceForm;
		this.aTenseTable = aTenseTable;
		for (var i in aDefaultVal) {
			this[i] = aDefaultVal[i];
		}
		alert (this.defMainItem+" "+this.defTense+" "+this.defForm);
		this.winWr	= (winWr)? winWr : window._wrapper;
		this.winWr.setOnloadListener(this);
		
	},
	
	set_obj : function (aMainItems, funcName, ) {
		for (var i in aMainItems){
			alert (aMainItems[i]);
			oMainItem = this.winWr.getElement(aMainItems[i]);
			oMainItem.addListener(this, 'onclick', funcName);
			this.oMainItems['items'][this.aMainItems[i]] = oMainItem;
			if (this.aMainItems[i] == this.defMainItem){
				this.oMainItems['def'] = this.currMainItem = aMainItems[i];
				
			}
		}
	}, 
	onload : function (evtWr) 
	{
		var oMainItem, oFormItem;
		this.set_obj(this.aMainItems, 'set_current_info', this.oMainItems);
		for (var i in this.aMainItems){
			
			oMainItem = this.winWr.getElement(this.aMainItems[i]);
			oMainItem.addListener(this, 'onclick', 'set_current_info');
			this.oMainItems['items'][this.aMainItems[i]] = oMainItem;
			if (this.aMainItems[i] == this.defMainItem){
				this.oMainItems['def'] = this.currMainItem = this.aMainItems[i];
				
			}
		}
		
		for (var n in this.aSentenceForm) {
			oFormItem = this.winWr.getElement(this.aSentenceForm[i]);
			oFormItem.addListener(this, 'onclick', 'set_current_info');
			this.oFormItems['items'][this.aSentenceForm[i]] = oFormItem;
			if (this.aSentenceForm[i] == this.defForm){
				this.oFormItems['def'] = this.currFormItem = this.aSentenceForm[i];
			}
		}
		
		this.show_details(this.aMainItems[i]);
		
		/*var currMenu, divs, iNum=1 ;
		menuItems = this.winWr.doc.getElementsByTagName("a");
		for(var i=0; i<menuItems.length; i++) {
			menuItem = menuItems[i].getAttribute("id");
			numMenu = menuItem.substring(this.config.prefixMenu.length);
			if(menuItem && menuItem.substring(0, this.config.prefixMenu.length) == this.config.prefixMenu) {
				currMenu = this.winWr.getElmWrapper(menuItems[i]);
				currMenu.addListener(this, "onclick", "show_detail");
				this.subMenu[iNum] = {"sId" : numMenu};
				iNum++;
			}
		}*/
		this.winWr.removeOnloadListener(this);
	},
	
	set_current_info : function(evtWr){
		//alert(evtWr.elmWr.elm.id);
		this.show_details(evtWr.elmWr.elm.id);
	},
	
	show_details: function (iMainItemId){
			alert (iMainItemId);
		/*if (typeof(this.carrShowDiv) != "undefined"){ this.carrShowDiv.setDisplay("none"); }
		var showElm, currElm, iNum = 1;
		var elmId = evtWr.elmWr.elm.id;
		var num = elmId.substring(this.config.prefixMenu.length);
		for (var n in this.subMenu){
			if (this.subMenu[n].sId == num){
				showElm = this.winWr.getElement(this.config.prefixDetail+this.subMenu[n].sId);
				
			} /*else {
				currElm = this.winWr.getElement(this.config.prefixDetail+this.subMenu[n].sId);
				currElm.elm.className = this.config.prexAdv+iNum;
				this.subMenu[num].bIsShow = false;
				iNum++;			
			}*/
		/*}
		this.carrShowDiv = showElm;
		showElm.setDisplay(true);*/
	},
	
	config : {
		prefix : "card_",
		prefixMenu : "menu_",
		prefixDetail : "detail_",
 		blockAdvFace :  "block_face",
		prexAdv : "block_adv"
	}	


}