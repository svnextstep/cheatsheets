var showTenseInfo = {
  iIdCurrTense : "",
  oCurrSet : [],

  init : function (winWr) {
    this.winWr	= (winWr)? winWr : window._wrapper;
    this.winWr.setOnloadListener(this);
  },

  onload : function (evtWr) {
    var iId;
    this.tblTense = this.winWr.getElement(this.config.iTblTense);
    var links = this.tblTense.elm.getElementsByTagName("span");
    for (var i=0; i < links.length; i++) {
      iId = links[i].getAttribute("id");
      if (iId && iId.substring(0, this.config.linkTensePref.length) == this.config.linkTensePref) {
        var par = this.winWr.getElmWrapper(links[i]);
        if (this.winWr.checkElement(iId)) {
          par.addListener(this, "onclick", "showRuls");
        }
      }
    }
  },

  showRuls : function (evtWr){
    var iId = evtWr.elmWr.elm.id;
    this.iIdCurrTense = iId.substring(this.config.linkTensePref.length);
    var oRuleComp = [];
    if (typeof(this.oCurrSet.divExpl) == "object") { this.clearSetings(); }
    /* get rule params for current tense */
    if(this.winWr.checkElement(this.config.divRules+this.iIdCurrTense)){
      var oElmRule = this.winWr.getElement(this.config.divRules+this.iIdCurrTense);
      oRuleComp = this.setCurrRule(oElmRule);
    }
    /* set rules */
    for (var i in this.config.oSentenceForms) {
     this.setSentenceRules(this.config.oSentenceForms[i], oRuleComp);
    }
    /* explain rules division */
    if (this.winWr.checkElement(this.config.divExplainPref+this.iIdCurrTense)) {
     var oDivExpl = this.winWr.getElement(this.config.divExplainPref+this.iIdCurrTense);
     oDivExpl.show();
     this.oCurrSet = {"iIdTense" : this.iIdCurrTense,"divExpl" : oDivExpl, "oRuleComp": oRuleComp};
    }
  },

  setCurrRule : function (oElmRule){
    var iId, sName, oElm;
    var oRuleComp = [];
    var elms = oElmRule.elm.getElementsByTagName("span");
    for (var i=0; i < elms.length; i++) {
      iId = elms[i].getAttribute("id");
      if (this.winWr.checkElement(iId)) {
        oElm = this.winWr.getElement(iId);
        sName = iId.substring(this.iIdCurrTense.length+1);
        oRuleComp[sName] = (oElm.elm.hasChildNodes()) ? oElm.elm.firstChild.nodeValue : "";
      }
    }
    return oRuleComp;
  },

  

  setSentenceRules : function (sForm, oVerb, sQuestion) {
    var oRule = {"ax":[], "verb" : []};
    var ax2 = (typeof(oVerb.ax2) == "undefined") ? "" :  (" " + oVerb.ax2);
    if (sForm == "n") {
      if (typeof(oVerb.ax0) != "undefined") {oRule["ax"]["ax0"] = oVerb.ax0+ " not " ;}
      oRule["ax"]["ax"] = oVerb.ax + " not " +  ax2;
      if (typeof(oVerb.ax3) !="undefined") { oRule["ax"]["ax3"] = oVerb.ax3 + " not " + ax2;}
      oRule["verb"]["verb"] = (typeof(oVerb.verb1) != "undefined" ?  oVerb.verb1 : oVerb.verb) + ((oVerb.postfix == "ing" )? oVerb.postfix : "");
    }else if (sForm == "q") {
      oRule["qs"] = (typeof(oVerb.qs) != "undefined") ? oVerb.qs : this.config.defQuestion;;
      oRule["ax"]["ax"] = oVerb.ax;
      if (typeof(oVerb.ax3) !="undefined") oRule["ax"]["ax3"] = oVerb.ax3;
      oRule["ax2"] = ax2;
      oRule["verb"]["verb"] = (typeof(oVerb.verb1) != "undefined" ?  oVerb.verb1 : oVerb.verb) + ((typeof(oVerb.postfix) != "undefined" && oVerb.postfix == "ing" )? oVerb.postfix : "");
    } else {
      if (Boolean(oVerb.bAxInP) && typeof(oVerb.ax0) != "undefined") {oRule["ax"]["ax0"] = oVerb.ax0;}
      if (Boolean(oVerb.bAxInP)) {oRule["ax"]["ax"] = oVerb.ax +  ax2;}
      if (Boolean(oVerb.bAxInP) && typeof(oVerb.ax3) != "undefined") { oRule["ax"]["ax3"] = oVerb.ax3 + ax2;}
      oRule["verb"]["verb"] = oVerb.verb + ((oVerb.postfix == "ing" )? oVerb.postfix : "");
      if (typeof(oVerb.postfix) != "undefined" && oVerb.postfix != "ing" ){ oRule["verb"]["verb3"] = oVerb.verb + oVerb.postfix;}
    }
    for (var i in oRule) {
      if (this.winWr.checkElement(sForm+"_"+i)) {
        var oTd = this.winWr.getElement(sForm+"_"+i);
        this.clearNode(oTd);
        if (i == "ax" || i == "verb"){
          for (var n in oRule[i]) {
            var div = this.createDiv(oRule[i][n],n);
            oTd.elm.appendChild(div);
          }
        }else {
          var sText = this.winWr.doc.createTextNode(oRule[i]);
          oTd.elm.appendChild(sText);
        }
      }
    }
  },

  clearNode : function (oObj){
    if (oObj.elm.hasChildNodes()) {
      while (oObj.elm.firstChild) {
        oObj.elm.removeChild(oObj.elm.firstChild);
      }
    }
  },

  clearSetings : function (){
    var divExpl = this.oCurrSet.divExpl;
    divExpl.hide();
    this.oCurrSet = new Array();
  },
  
  createDiv : function (sElm,sClassName){//alert(sClassName);
    var div = this.winWr.doc.createElement("div");
    div.setAttribute("class", sClassName);
    var sText = this.winWr.doc.createTextNode(sElm);
    div.appendChild(sText);
    return div;
  },
  
  config : {
   "iTblTense" : "tblTense",
   "linkTensePref" : "link_",
   "divExplainPref" : "expl_",
   "divRules" : "rule_",
   "defQuestion" : "Where",
   "oSentenceForms" : {"0":"p","1":"n","2":"q"}
  }
}