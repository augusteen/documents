/******************************************************************************
This work contains or references Vistaar generic components or Vistaar API, and
is developed in accordance with Vistaar best practices and solution development
guidelines. This work is designed and intended to be used only with licensed
Vistaar software.
********************************************************************************/

/**
 * @namespace WebUI
 */

/**
 * <p> <img uml="actor user
rectangle PricePlanBestPractice {
  user -- (show)
  (show) --> (evalBestPractice & setCountOfBestPractice) 
}"></p>
 * @class 
 * @memberof WebUI
 */
function PricePlanBestPracticesManager() {

    var m_PricePlanViolationObject;
    var m_PricePlanBestPracticePopupObject;

    var m_arrMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var m_FactCode = ["Bill_FOB", "Shelf", "Net_List_ATAX"]; // 19Oct15

    var m_TGOBJECT = "TGObj";
    var m_DGSUMMARYPROPOSED = "grdSummaryProposed";
    var m_TGOFFPREMISESPROPOSED = "TG_OffPremisesProposed";
    var m_TGOONPREMISESPROPOSED = "TG_OnPremisesProposed";
    var m_TGOFFPREMISESCURRENT = "TG_OffPremisesCurrent";
    var m_TGONPREMISESCURRENT = "TG_OnPremisesCurrent";

    var m_objTreeGridOff;
    var m_objTreeGridOn;
    var m_objSummaryTreeGrid;

    var m_CurGrdMapping;
    var m_ProGrdMapping;

    var m_EditableFrom;

    var m_HistorEditFrom;

    var m_PGEffectivity;

    var m_notificationTemplate = "<div><div class='clsNotificationDataDiv'>PLACE_HOLDER_FOR_MESSAGE</div> <button type='button' class='clsBestCloseBtn' onclick='getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().getPriceBestPracticeManager().hideBestPracticePopup()' title='Close Best Practice'></div> ";

    /*var m_notificationTemplate = "<div><div class='clsNotificationDataDiv'>PLACE_HOLDER_FOR_MESSAGE</div> <button type='button' class='clsBestCloseBtn' onclick='getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().getPriceBestPracticeManager().hideBestPracticePopup()' ontouchstart='getObjectFactory().getPricePlanControllerManager().getPricePlanUIManager().getPriceBestPracticeManager().hideBestPracticePopup()' title='Close Best Practice'></div> ";*/

    var m_ON = "ON";
    var m_OFF = "OFF";


    /**
	 *  ### List of Best Practices
	 *  
	 * | Type 	| Best Practice 	| Message 	|
	|----------	|:----------------------:	|-------------------------------------------------------------------------------------------	|
	| Hardstop 	| VolumeNot100 	| The % of Business must sum to 100% for each month 	|
	| Hardstop 	| VolumeNotPresent 	| Deal Line does not have volume entered for the year 	|
	| Hardstop 	| DuplicateNetList 	| Deal Lines in the same channel cannot have the same Net List in same month 	|
	| Hardstop 	| WPSame 	| WP cannot be different for the same month across Deal Lines 	|
	| Hardstop 	| DASame 	| DA cannot be different for the same month across Deal Lines 	|
	| Hardstop 	| IncompletePriceLine 	| Deal Line is missing required inputs 	|
	| Softstop 	| RABNegative 	| RAB cannot be negative 	|
	| Softstop 	| ProposedNetFOBDeeeper 	| Proposed Priceline Net FOB is deeper than current 	|
	| Softstop 	| ProposedNetListDeeeper 	| Proposed Priceline Net List is deeper than current 	|
	| Softstop 	| MinNetFOBGuidance 	| Net FOB is below guidance value 	|
	| Softstop 	| MinNetListGuidance 	| Net list is below guidance value 	|
	| Softstop 	| MinRABGuidance 	| RAB is below guidance value 	|
	| Softstop 	| AvgRABGuidance 	| Avg full Year RAB is below guidance value 	|
	| Softstop 	| AvgNetFOBGuidance 	| Avg full Year Net FOB is below guidance value 	|
	| Softstop 	| AvgPYNetFOBGuidance 	| Avg full Year Net FOB is below previous year avg full Year Net FOB 	|
	| Softstop 	| NegativePerctBusiness 	| Percentage of business is negative 	|
	| Softstop 	| MinDaysToChange 	| This is a posting market. Please make sure pricing is submitted within the posting window 	|
	| Softstop 	| AvgVolumeGuidance 	| Full year volume percent for Priceline is either below or above threshold 	|
	| Softstop 	| AvgFOBDecreased 	| Proposed Avg FOB decreased from Current Avg FOB 	|
  <p> <img uml="
        object BestPractice {
         count = 0
         text = The % of Business must sum to 100% for each month
         list =  List of Locations
         type = HardStop/SoftStop
         isReadOnly = false
        } "> </p>
	 * @type {Object}
	 * 
	 */
    var m_objlistPractices = {
        "VolumeNot100": {
            "count": 0,
            "text": "The % of Business must sum to 100% for each month",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "VolumeNotPresent": {
            "count": 0,
            "text": "Deal Line does not have volume entered for the year",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "DuplicateNetList": {
            "count": 0,
            "text": "Deal Lines in the same channel cannot have the same Net List in same month",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "WPSame": {
            "count": 0,
            "text": "WP cannot be different for the same month across Deal Lines",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "DASame": {
            "count": 0,
            "text": "DA cannot be different for the same month across Deal Lines",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "AllowanceDiff": {
            "count": 0,
            "text": "∆ SDA > ∆ Net List",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "IncompletePriceLine": {
            "count": 0,
            "text": "Deal Line is missing required inputs",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "RABNegative": {
            "count": 0,
            "text": "RAB cannot be negative",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "ProposedNetFOBDeeeper": {
            "count": 0,
            "text": "Proposed priceline Net FOB is deeper than current",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "ProposedNetListDeeeper": {
            "count": 0,
            "text": "Proposed priceline Net List is deeper than current",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "MinNetFOBGuidance": {
            "count": 0,
            "text": "Net FOB is below guidance value",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "MinNetListGuidance": {
            "count": 0,
            "text": "Net list is below guidance value",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "MinRABGuidance": {
            "count": 0,
            "text": "RAB is below guidance value",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "AvgRABGuidance": {
            "count": 0,
            "text": "Avg full Year RAB is below guidance value",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "AvgNetFOBGuidance": {
            "count": 0,
            "text": "Avg full Year Net FOB is below guidance value",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "AvgPYNetFOBGuidance": {
            "count": 0,
            "text": "Avg full Year Net FOB is below previous year avg full Year Net FOB",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "NegativePerctBusiness": {
            "count": 0,
            "text": "Percentage of business is negative",
            "list": [],
            "type": "HardStop",
            "isReadOnly": false
        },
        "MinDaysToChange": {
            "count": 0,
            "text": "This is a posting market. Please make sure pricing is submitted within the posting window",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": true
        },
        "AvgVolumeGuidance": {
            "count": 0,
            "text": "Full year volume percent for priceline is either below or above threshold",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        },
        "AvgFOBDecreased": {
            "count": 0,
            "text": "Proposed Avg FOB decreased from Current Avg FOB",
            "list": [],
            "type": "SoftStop",
            "isReadOnly": false
        }
    };

    var m_currentPractice;
    var m_currentPracticeList;
    var m_prevCellElement = [];

    var m_nonManDealsMaster, m_skuManDealsMaster, m_disManDealsMaster, m_disSNDDealsMaster, m_skuSNDDealsMaster;

    this.getSelectedBestPractice = function(l_text) {
        for (var practices in m_objlistPractices) {
            if (m_objlistPractices[practices].text == l_text && m_objlistPractices[practices].count > 0) {
                m_currentPractice = practices;
                return m_objlistPractices[practices];
            }
        }
        return undefined;
    };

    this.getPreviousBestPractice = function(l_text) {
        var l_keyarr = [];
        var bnext = false;
        var blast;

        for (var practices in m_objlistPractices) {
            l_keyarr.push(practices);
        }
        for (var i = l_keyarr.length - 1; i >= 0; i--) {
            if (bnext && m_objlistPractices[l_keyarr[i]].count > 0 && m_objlistPractices[l_keyarr[i]].isReadOnly == false) {
                m_currentPractice = l_keyarr[i];
                return m_objlistPractices[l_keyarr[i]];
            } else {
                if (m_objlistPractices[l_keyarr[i]].text == l_text) {
                    bnext = true;
                }
            }
            blast = l_keyarr[i];
        };
        return this.getPrevNonEmptyBestPractices();
    };

    this.getNextBestPractice = function(l_text) {
        var bnext = false;
        var blast;
        for (var practices in m_objlistPractices) {
            if (bnext && m_objlistPractices[practices].count > 0 && m_objlistPractices[practices].isReadOnly == false) {
                m_currentPractice = practices;
                return m_objlistPractices[practices];
            } else {
                if (m_objlistPractices[practices].text == l_text) {
                    bnext = true;
                }
            }
            blast = practices;
        };
        return this.getNextNonEmptyBestPractices();
    };

    this.getNextNonEmptyBestPractices = function() {
        for (var practices in m_objlistPractices) {
            if (m_objlistPractices[practices].count > 0 && m_objlistPractices[practices].isReadOnly == false) {
                return m_objlistPractices[practices];
            }
        }
    };

    this.getPrevNonEmptyBestPractices = function() {
        var l_keyarr = [];
        for (var practices in m_objlistPractices) {
            l_keyarr.push(practices);
        }
        for (var i = l_keyarr.length - 1; i >= 0; i--) {
            if (m_objlistPractices[l_keyarr[i]].count > 0 && m_objlistPractices[l_keyarr[i]].isReadOnly == false) {
                return m_objlistPractices[l_keyarr[i]];
            }
        };
    };
    /**
     * When user clicks on Best Practice button this function is called
     * @param  {number} l_xPosition X postion
     * @param  {number} l_yPostion  Y position
     * @param  {number} l_width     Width
     * @param  {number} l_height    Height
     */
    this.show = function(l_xPosition, l_yPostion, l_width, l_height) {
        //Show PP Operation button tray -- IPAD View
        if (getCommonFuncMgr().isNonDeskTopView() && !VistaarExtjs.getCmp("btnExpandCollpseToolBar").pressed) {
            VistaarExtjs.getCmp("btnExpandCollpseToolBar").toggle(true);
            getPricePlanControllerManagerObj().getPricePlanUIManager().btn_ExpandCollapsePricePlanTabTool_Click(VistaarExtjs.getCmp("btnExpandCollpseToolBar"));
        }

        var obj_MenuViolation = Ext.getCmp("menuBestPractices");
        var l_btnpractice = Ext.ComponentQuery.query('button[id=btnBestPractices]')[0];

        l_xPosition = l_btnpractice.getX();
        l_yPostion = l_btnpractice.getY();
        l_width = l_btnpractice.getWidth();
        l_height = l_btnpractice.getHeight();

        if (m_PricePlanViolationObject == undefined) {
            m_PricePlanViolationObject = obj_MenuViolation;
            obj_MenuViolation.showAt(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6, l_yPostion + l_height - 5);
        } else {
            obj_MenuViolation.showAt(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6, l_yPostion + l_height - 5);
        }
        /**IPAD related changes**/
        obj_MenuViolation.setX(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6);
        obj_MenuViolation.setY(l_yPostion + l_height - 5);

        Ext.getStore('store_Violations').loadData([]);
        Ext.getStore('store_Errors').loadData([]);

        setCursorMode(WAITCURSORMODE, 'menuBestPractices', 'Loading');
        Ext.Function.defer(function() {
            this.evalBestPractice();
            this.setCountOfBestPractice();
        }, 1000, this);
        //setDefaultCursor();
    };

    this.hide = function() {
        if (m_PricePlanViolationObject != undefined) {
            m_PricePlanViolationObject.hide();
        };
    };

    this.ishidden = function() {
        if (m_PricePlanViolationObject == undefined) {
            return true;
        } else {
            return m_PricePlanViolationObject.hidden;
        }
    };
    /**
     * Intialize function of Price Plan Best Practice it does following
     * * Init `m_objlistPractices` object count to zero 
     * * Init SKUMaster and DistributoMaster for Across Channel Best Practices
     * * Init Current Grid Mapping
     */
    this.initializeModuleObjects = function() {
        m_CurGrdMapping = {};
        m_ProGrdMapping = {};
        m_objTreeGridOff = Ext.getCmp([m_TGOFFPREMISESPROPOSED])[m_TGOBJECT];
        m_objTreeGridOn = Ext.getCmp([m_TGOONPREMISESPROPOSED])[m_TGOBJECT];
        // m_objCurrentTreeGridOn = Ext.getCmp([m_TGONPREMISESCURRENT])[m_TGOBJECT];
        // m_objCurrentTreeGridOff = Ext.getCmp([m_TGOFFPREMISESCURRENT])[m_TGOBJECT];

        //8Oct15 - create cureent grid data array object
        m_CurGrdMapping[m_ON] = this.createCurGrdMappingArray(Ext.getCmp([m_TGONPREMISESCURRENT]));
        m_CurGrdMapping[m_OFF] = this.createCurGrdMappingArray(Ext.getCmp([m_TGOFFPREMISESCURRENT]));

        //30Oct10 - deeper price line logic change
        //m_ProGrdMapping[m_ON] = this.createProGrdMappingArray(m_objTreeGridOn);
        //m_ProGrdMapping[m_OFF] = this.createProGrdMappingArray(m_objTreeGridOff);
        m_ProGrdMapping[m_ON] = this.createProGrdMappingArray(Ext.getCmp([m_TGONPREMISESCURRENT]));
        m_ProGrdMapping[m_OFF] = this.createProGrdMappingArray(Ext.getCmp([m_TGOFFPREMISESCURRENT]));

        m_objSummaryTreeGrid = Ext.getCmp([m_DGSUMMARYPROPOSED])["DGObj"];

        //4Jul16 new DA,WP and Duplicate Net requirement  --- AC
        m_nonManDealsMaster = getPricePlanControllerManagerObj().getActivePricePlanData()['SKUMaster'];
        m_skuManDealsMaster = getPricePlanControllerManagerObj().getActivePricePlanData()['SKUMaster'];
        m_disManDealsMaster = getPricePlanControllerManagerObj().getActivePricePlanData()['DistributorMaster'];
        m_disSNDDealsMaster = getPricePlanControllerManagerObj().getActivePricePlanData()['DistributorMaster'];
        m_skuSNDDealsMaster = getPricePlanControllerManagerObj().getActivePricePlanData()['SKUMaster'];

        for (var item in m_objlistPractices) {
            m_objlistPractices[item].count = 0;
            m_objlistPractices[item].list = [];
            //m_objlistPractices[item].isReadOnly = false;
        }
        this.loadBestPracticesStore();
    };

    this.createCurGrdMappingArray = function(p_GridObj) {
        var l_gridRow;
        var l_mappingArray = [];
        var l_data = p_GridObj[m_TGOBJECT].getStore().data;

        // itrate over data items
        for (var rowIdx in l_data.items) {
            l_gridRow = l_data.items[rowIdx];
            // check if deal id is present
            if (l_gridRow.data.DealID && l_gridRow.data.MetricsType !== "PG") {
                l_mappingArray[l_gridRow.data.DealID] = l_gridRow;
            }
        }
        return l_mappingArray;
    };


    this.createProGrdMappingArray = function(p_GridObj) {
        var l_gridRow;
        var l_mappingArray = [];
        //var l_data = p_GridObj.getStore().data;//30Oct10 - deeper price line logic change
        var l_data = p_GridObj[m_TGOBJECT].getStore().data;
        var childData = [];
        // itrate over data items
        for (var rowIdx in l_data.items) {
            l_gridRow = l_data.items[rowIdx];
            // check if deal id is present
            if (l_gridRow.data.DealID && l_gridRow.data.MetricsType !== "PG") {
                childData = [];
                for (var childRowIdx in l_gridRow.childNodes) {
                    childData[l_gridRow.childNodes[childRowIdx].data.FactCode] = l_gridRow.childNodes[childRowIdx].data;
                }
                l_mappingArray[l_gridRow.data.DealID] = childData;
            }
        }
        return l_mappingArray;
    };

    this.loadBestPracticesStore = function() {
        var l_arrBestListHS = [];
        var l_arrBestListSS = [];

        setCursorMode(DEFAULTCURSORMODE, 'menuBestPractices', 'Loading');
        for (var practices in m_objlistPractices) {
            if (m_objlistPractices[practices].count > 0 && m_objlistPractices[practices].type == 'HardStop') {
                l_arrBestListHS.push(m_objlistPractices[practices]);
            }
            if (m_objlistPractices[practices].count > 0 && m_objlistPractices[practices].type == 'SoftStop') {
                l_arrBestListSS.push(m_objlistPractices[practices]);
            }
        };

        Ext.getStore('store_Violations').loadData(l_arrBestListHS);
        Ext.getStore('store_Errors').loadData(l_arrBestListSS);
    };

    //blur event on Violation poup window
    this.onWindowBlurEvent = function(window, event, eOpts) {
        var btnBestPractices = VistaarExtjs.getCmp("btnPricePlanBestPractices");
        m_PricePlanViolationObject.hide();
        btnBestPractices.toggle();
    };


    this.hideBestPracticePopup = function() {
        //var bestwindow = Ext.ComponentQuery.query('window[cls=clsWindowNotificationWidget animated slideInRight]')[0];
        //	if(Ext.DomQuery.hasOwnProperty('selectNode'))
        //{
        var bestwindow = Ext.DomQuery.selectNode("div[class^=x-window clsWindowNotificationWidget animated]");
        if (bestwindow != undefined) {
            VistaarFunctionLib.closeWindow(m_PricePlanBestPracticePopupObject);
        }
        this.removeClsfromPrevElement();
        //}
    };

    this.showBestPracticePopup = function(l_practicetext) {
        //show best practice popup or create one
        //m_PricePlanBestPracticePopupObject = VistaarFunctionLib.showWindow(" BestPracticePopup ");
        //var bestwindow = Ext.ComponentQuery.query('window[cls=clsWindowNotificationWidget animated slideInRight]')[0];
        var bestwindow = Ext.DomQuery.selectNode("div[class^=x-window clsWindowNotificationWidget animated]");
        if (bestwindow === undefined) {
            m_PricePlanBestPracticePopupObject = VistaarFunctionLib.showWindow("BestPracticePopup");
        } else {
            var panelinfo = m_PricePlanBestPracticePopupObject.getComponent('pnlNotificationDetailInfo');
            panelinfo.show();
            //bestwindow.show(); - 24dec15
        }

        /*        if (m_PricePlanBestPracticePopupObject === undefined) {

        m_PricePlanBestPracticePopupObject = VistaarFunctionLib.showWindow(" BestPracticePopup ");

        } else {

        var panelButton = m_PricePlanBestPracticePopupObject.getComponent('pnlButtonParent');
        panelButton.show();

        var panelinfo = m_PricePlanBestPracticePopupObject.getComponent('pnlNotificationDetailInfo');
        panelinfo.show();

        }

        */
        m_currentPracticeList = new list(this.getSelectedBestPractice(l_practicetext));
        this.updateNotificationPanel();
        this.getElementtoaddCls(m_currentPracticeList.getElement());
        m_PricePlanViolationObject.hide();
        setDefaultCursor();
    };


    this.updateNotificationPanel = function() {
        var pnlnotify = m_PricePlanBestPracticePopupObject.getComponent('pnlNotificationDetailInfo');
        var l_textToShow = m_currentPracticeList.getElement().text;

        if (!l_textToShow) {
            l_textToShow = m_currentPracticeList.text;
        }
        var l_notification = m_notificationTemplate.replace('PLACE_HOLDER_FOR_MESSAGE', l_textToShow);
        pnlnotify.setHtml(l_notification);
    };

    //on Data View click
    this.onDvItemClickViolation = function(view, record, item, index, event, eOpts) {
        try {
            if (record.data.isReadOnly == false) {
                // activate price plan
                setWaitCursor();
                Ext.defer(function() {
                    this.activatePricePlanForBP();
                    this.showBestPracticePopup(record.data.text);
                    var btn = VistaarExtjs.getCmp("btnBestPractices");
                    btn.toggle(false);
                }, 50, getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager());
            }
        } catch (err) {
            setDefaultCursor();
            console.log('Error in onDvItemClickViolation from previous element');
        }
    };

    this.onDvItemClickErrors = function(view, record, item, index, event, eOpts) {
        try {
            if (record.data.isReadOnly == false) {
                setWaitCursor();
                Ext.defer(function() {
                    // activate price plan
                    this.activatePricePlanForBP();
                    this.showBestPracticePopup(record.data.text);
                    var btn = VistaarExtjs.getCmp("btnBestPractices");
                    btn.toggle(false);
                }, 50, getPricePlanControllerManagerObj().getPricePlanUIManager().getPriceBestPracticeManager());
            }
        } catch (err) {
            setDefaultCursor();
            console.log('Error in onDvItemClickViolation from previous element');
        }
    };

    this.activatePricePlanForBP = function() { // 29Oct15
        if (!getPricePlanControllerManagerObj().getPricePlanUIManager().isPricePlanGridViewActive()) {
            // imapct analysis toggle button
            VistaarExtjs.getCmp("btnImpactAnalysisOpen").toggle(false);
            getPricePlanControllerManagerObj().setPricePlanMainView();
        }
        //Expand Total Column before best practices navigation....(IPAD issue 22-Dec)
        getPricePlanControllerManagerObj().getPricePlanUIManager().expandTotalColumn_Prior_BP_Nav();
    };

    /**
     * This is function run on show of the Best Practice popup
     *  <p> <img uml="
     *  (*) -down-> &quot;initializeModuleObjects&quot;
     *  -down-> &quot;lookupSummaryGridForBestPractice&quot;
     *  -down-> &quot;lookupGridForBestPractice&quot; 
     *  note right: Off section
     *  -down-> &quot;lookupGridForBestPractice&quot; 
     *  note right: ON section
     *  -down-> &quot;checkBPAcrossChannel&quot;
     *  -down-> &quot;loadBestPracticesStore&quot;
     *  -down-> (*)
     *  " > </p>
     */
    this.evalBestPractice = function() {
        // This is used to fetch Best Practices list
        /*
        List of Best Practice to consider
        1.Volume is not 100%
        2.Price line without out volume
        3.Duplicate Net List
        4.Allowance should be same
        5.Difference of allowance > difference of Net List
        6.Incomplete Price line (For Price line with volume > 0)
        Deal Line Name
        Bill FOB
        Net List
        Shelf......
        */

        var currentMonth = getGlobalConstantsObj().getTimeDetails().CurrentMonthName;
        var closedMonth = getCommonFuncMgr().m_PP_ClosedMonth;

        closedMonth === 'Dec' ? m_EditableFrom = ' ' : closedMonth === '' ? m_EditableFrom = 'Jan' : m_EditableFrom = currentMonth;

        //m_EditableFrom =  getGlobalConstantsObj().getTimeDetails().CurrentMonthName;  
        //getCommonFuncMgr().m_PP_ClosedMonth; 
        // getCommonFuncMgr().m_PP_EditableFrom; 
        // getPricePlanControllerManagerObj().getActivePricePlanData().AdditionalInfo.EditableFrom
        var editInfo = getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().fetchEditedInfo();
        m_HistorEditFrom = getPricePlanControllerManagerObj().getActivePricePlanData().AdditionalInfo.EvalBestPracticeMonths;

        m_HistorEditFrom = this.updateHistoryEdit(m_HistorEditFrom, editInfo);

        m_PGEffectivity = getCommonFuncMgr().m_PP_PG_Effectivity;

        var l_BestPractice = getPricePlanControllerManagerObj().getBestracticeGuidanceData(); //- 6Oct15
        var p_factCodeArr = {};

        if (l_BestPractice !== undefined) {
            this.initializeModuleObjects();
            this.lookupSummaryGridForBestPractice(l_BestPractice); //- 5Oct15
            this.lookupGridForBestPractice(m_OFF, l_BestPractice[m_OFF], p_factCodeArr);
            this.lookupGridForBestPractice(m_ON, l_BestPractice[m_ON], p_factCodeArr);
            this.checkBPAcrossChannel(p_factCodeArr); //13Nov15
            this.loadBestPracticesStore();
        }
    };

    this.updateHistoryEdit = function(p_history, p_edited) {

        for (var obj = 0; obj < p_edited.length; obj++) {
            for (month in p_edited[obj]['Values']) {
                var channel = p_history[p_edited[obj]['Variable Attributes']['Channels']];
                if (!channel.hasOwnProperty(month)) {
                    channel[month] = true;
                }
            }
        }
        return p_history;
    };
    this.checkBPAcrossChannel = function(p_factCodeArr) {

        //new requirement change 4th July AC
        /*		var key;
        		for (key in p_factCodeArr) {
        			this.checkAllowanceSeggreagated(p_factCodeArr[key], key, "", "DA", m_objlistPractices.DASame);
        			this.checkAllowanceSeggreagated(p_factCodeArr[key], key, "", "WP", m_objlistPractices.WPSame);
        		}
        		*/
        try {
            var dealID = [];

            var l_preference = getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence;

            if (l_preference['WP'] !== undefined) {
                this.newevaluateFactObjects("WP", m_objlistPractices.WPSame, 'ALL', m_nonManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("WP", m_objlistPractices.WPSame, 'ALL', m_skuManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("WP", m_objlistPractices.WPSame, 'ALL', m_disManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("WP", m_objlistPractices.WPSame, 'ALL', m_disSNDDealsMaster, dealID);
                this.newevaluateFactObjects("WP", m_objlistPractices.WPSame, 'ALL', m_skuSNDDealsMaster, dealID);
            }

            if (l_preference['DA'] !== undefined) {
                dealID = [];
                this.newevaluateFactObjects("DA", m_objlistPractices.DASame, 'ALL', m_nonManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("DA", m_objlistPractices.DASame, 'ALL', m_skuManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("DA", m_objlistPractices.DASame, 'ALL', m_disManDealsMaster, dealID);
                dealID = [];
                this.newevaluateFactObjects("DA", m_objlistPractices.DASame, 'ALL', m_disSNDDealsMaster, dealID);
                this.newevaluateFactObjects("DA", m_objlistPractices.DASame, 'ALL', m_skuSNDDealsMaster, dealID);
            }

            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'OFF', m_nonManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'OFF', m_skuManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'OFF', m_disManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'OFF', m_disSNDDealsMaster, dealID);
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'OFF', m_skuSNDDealsMaster, dealID);

            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'ON', m_nonManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'ON', m_skuManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'ON', m_disManDealsMaster, dealID);
            dealID = [];
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'ON', m_disSNDDealsMaster, dealID);
            this.newevaluateFactObjects("Net_List_ATAX", m_objlistPractices.DuplicateNetList, 'ON', m_skuSNDDealsMaster, dealID);



        } catch (err) {
            console.log('Error in newevaluateFactObjects');
        }
    };

    this.checkGridforDA = function(p_sGridName) {
        var l_objGrid = (p_sGridName == 'OFF' ? m_objTreeGridOff : m_objTreeGridOn);
    };

    this.getMonthFromString = function(p_Month) {
        return p_Month ? new Date(Date.parse(p_Month + " 1, 2012")).getMonth() + 1 : 0;
    };

    this.lookupSummaryGridForBestPractice = function(pBPGuidance) {
        var l_dgOBj = Ext.getCmp(m_DGSUMMARYPROPOSED).DGObj;

        var l_store = l_dgOBj.getStore();

        var l_data = l_store.data.items; //VistaarDG.getDataFromDynamicGrid(m_DGSUMMARYPROPOSED);

        var l_OffNetFOB,
            l_OnNetFOB;

        var l_FY = "FY";
        var l_grdName = "Summary";

        // minimum days to change --  19Oct15
        if (pBPGuidance["Additional Information"]["Posting Flag"] == "1") {
            this.buildBestPractices(0, l_FY, l_grdName, m_objlistPractices.MinDaysToChange.list, m_objlistPractices.MinDaysToChange.text);
            m_objlistPractices.MinDaysToChange.count += 1;
        }

        for (var rowIdx in l_data) {

            //if (l_data[rowIdx].data.Metrics == "Seasonality (Current)") {
            //	break;
            //}
            // if (l_data[rowIdx].Metrics == "Off Premise RAB" || l_data[rowIdx].Metrics == "on Premise RAB") {
            // if (l_data[rowIdx][l_FY] < pBPGuidance["AVG_RAB_VS_GUIDANCE"]) {
            // this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgRABGuidance.list, l_data[rowIdx].Metrics);
            // m_objlistPractices.AvgRABGuidance.count += 1;
            // }
            // } else
            //
            if (l_data[rowIdx].data.Type == "Proposed") {

                if (l_data[rowIdx].data.Metrics == "Off Premise Net FOB" || l_data[rowIdx].data.Metrics == "On Premise Net FOB") {
                    // Avg. full year Net FOB at Pricecat level is below Last Year
                    if (l_data[rowIdx].data[l_FY] < l_data[rowIdx].data["PY"]) {
                        this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgPYNetFOBGuidance.list, m_objlistPractices.AvgPYNetFOBGuidance.text, "", l_data[rowIdx].data.Metrics);
                        m_objlistPractices.AvgPYNetFOBGuidance.count += 1;
                    }
                }
                if (l_data[rowIdx].data.Metrics == "Off Premise Net FOB") {
                    if (l_data[rowIdx].data[l_FY] < pBPGuidance[m_OFF]["AVG_FOB_GUIDLINE"]) {
                        this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgNetFOBGuidance.list, m_objlistPractices.AvgNetFOBGuidance.text + " \"" + pBPGuidance[m_OFF]["AVG_FOB_GUIDLINE"] + "\"", "", l_data[rowIdx].data.Metrics);
                        m_objlistPractices.AvgNetFOBGuidance.count += 1;
                    }
                    l_OffNetFOB = l_data[rowIdx].data[l_FY];
                }
                if (l_data[rowIdx].data.Metrics == "On Premise Net FOB") {
                    if (l_data[rowIdx].data[l_FY] < pBPGuidance[m_ON]["AVG_FOB_GUIDLINE"]) {
                        this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgNetFOBGuidance.list, m_objlistPractices.AvgNetFOBGuidance.text + " \"" + pBPGuidance[m_ON]["AVG_FOB_GUIDLINE"] + "\"", "", l_data[rowIdx].data.Metrics);
                        m_objlistPractices.AvgNetFOBGuidance.count += 1;
                    }
                    l_OnNetFOB = l_data[rowIdx].data[l_FY]
                }

            } else {

                if (l_data[rowIdx].data.Metrics == "Off Premise Net FOB") {
                    if (l_OffNetFOB < l_data[rowIdx].data[l_FY]) {
                        var l_Percent = ((l_data[rowIdx].data[l_FY] - l_OffNetFOB) / l_data[rowIdx].data[l_FY]) * 100;
                        this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgFOBDecreased.list, m_objlistPractices.AvgFOBDecreased.text + " " + getCommonFuncMgr().setNumberFormat(l_Percent, 2) + "%", "", l_data[rowIdx].data.Metrics);
                        m_objlistPractices.AvgFOBDecreased.count += 1;
                    }
                }

                if (l_data[rowIdx].data.Metrics == "On Premise Net FOB") {
                    if (l_OnNetFOB < l_data[rowIdx].data[l_FY]) {
                        var l_Percent = ((l_data[rowIdx].data[l_FY] - l_OffNetFOB) / l_data[rowIdx].data[l_FY]) * 100;
                        this.buildBestPractices(rowIdx, l_FY, l_grdName, m_objlistPractices.AvgFOBDecreased.list, m_objlistPractices.AvgFOBDecreased.text + " " + getCommonFuncMgr().setNumberFormat(l_Percent, 2) + "%", "", l_data[rowIdx].data.Metrics);
                        m_objlistPractices.AvgFOBDecreased.count += 1;
                    }
                }

            }
        }
    };

    /**
     *@description  The function that loops through grid data 
     * 
     * <p> <img uml="
     * title lookupGridForBestPractice
start
while (Months?)
   if (Editable From and History Edit ? ) then (yes)


     if (Business Line ?) then (yes)
      : Check volume and volume mix 
       1. if volume is there volume mix should be 100
       2. if volume is not there then volume mix should be 0/100/empty
       3. Negative Percent of Business;
     else (no)
      if ( Not Deleted Deal and Volume Mix Present and Childrens ? ) then (yes)
        :lookupChildforBestPractice
         updateFactsObjects;
      endif 
     endif
  
  endif 
endwhile
stop
     * "> </p>
     * @param  {string} p_sGridName      Grid Name ON/OFF
     * @param  {object} p_BPGuidanceData Guidance Data
     * @param  {object} p_factCodeArr    Fact Code to check 
     */
    this.lookupGridForBestPractice = function(p_sGridName, p_BPGuidanceData, p_factCodeArr) {
        try {
            //Looping through which Grid
            var l_objGrid = (p_sGridName == 'OFF' ? m_objTreeGridOff : m_objTreeGridOn);

            var l_rootNode = l_objGrid.getRootNode();

            var l_store = l_objGrid.getStore();
            var l_data = l_store.data;

            var l_grdview = l_objGrid.getView();

            var l_gridRow;

            var l_bCheckDealName = true;
            var l_bVolumeMix;
            var l_VolumeValue = 0;

            var l_otherFacts;
            var l_allowance;
            var curChildrens;

            l_rootNode.collapseChildren();

            /*

            Removing volume check

            var l_bVolume;

            l_bVolume = true;

            if (this.ValidateNumberReturnBlank(this.getVolume(l_objGrid)) == "") {
            l_bVolume = false;
            };
            */

            //to perform best practice check on FY
            this.lookupForAvgBestPractice(l_data, l_bCheckDealName, p_sGridName, p_BPGuidanceData);

            //loop with months
            for (var l_Month in m_arrMonths) {
                l_otherFacts = [];
                if (!p_factCodeArr[m_arrMonths[l_Month]]) {
                    p_factCodeArr[m_arrMonths[l_Month]] = [];
                }
                l_allowance = 0;
                curChildrens = {};
                //loop through rows along ON/OFF section treegrid
                for (var rowIdx in l_data.items) {

                    l_gridRow = l_data.items[rowIdx];

                    l_bVolumeMix = true;

                    //if (this.getMonthFromString(m_arrMonths[l_Month]) >= this.getMonthFromString(l_gridRow.data["EditableFrom"])) { Change of global EditableFrom
                    if ((this.getMonthFromString(m_arrMonths[l_Month]) >= this.getMonthFromString(m_EditableFrom) || m_HistorEditFrom[p_sGridName].hasOwnProperty(m_arrMonths[l_Month])) && m_PGEffectivity[m_arrMonths[l_Month]]) {

                        if (l_gridRow.data.MetricsType == "Business") {
                            //Check % of Business not 100% when volume -
                            var l_volume = this.ValidateNumberReturnBlank(this.getVolumeByMonth(l_objGrid, m_arrMonths[l_Month]));
                            var l_volumeMix = Math_toFixedTo(this.ValidateNumberReturnZero(l_gridRow.data[m_arrMonths[l_Month]]), 0);
                            if (l_volume !== "" && l_volume !== 0) { //18Nov15 -742
                                // if volume is there volume mix should be 100
                                if (l_volumeMix != 100) {
                                    //this.buildBestPractices(msg, l_gridRow, 7 + parseInt(l_Month), l_sGridName,m_objlistPractices.VolumeNot100.list);
                                    this.buildBestPractices(l_gridRow, m_arrMonths[l_Month], p_sGridName, m_objlistPractices.VolumeNot100.list, m_objlistPractices.VolumeNot100.text);
                                    m_objlistPractices.VolumeNot100.count += 1;
                                }
                            } else {
                                // if volume is not there then volume mix should be 0/100/""
                                if (!(l_volumeMix == 100 || l_volumeMix == 0 || l_volumeMix == "")) {
                                    //this.buildBestPractices(msg, l_gridRow, 7 + parseInt(l_Month), l_sGridName,m_objlistPractices.VolumeNot100.list);
                                    this.buildBestPractices(l_gridRow, m_arrMonths[l_Month], p_sGridName, m_objlistPractices.VolumeNot100.list, m_objlistPractices.VolumeNot100.text);
                                    m_objlistPractices.VolumeNot100.count += 1;
                                }
                            }
                            //#745 - Negative Percent of Business
                            if (l_gridRow.data[m_arrMonths[l_Month]] < 0) {
                                this.buildBestPractices(l_gridRow, m_arrMonths[l_Month], p_sGridName, m_objlistPractices.NegativePerctBusiness.list);
                                m_objlistPractices.NegativePerctBusiness.count += 1;
                            }
                        } else {

                            //if (!l_gridRow.data['Deleted Deal']) {
                            if (!(l_gridRow.data['Deleted Deal'] && (this.getMonthFromString(l_gridRow.data['Deleted Time']) < this.getMonthFromString(m_arrMonths[l_Month])))) {
                                //Volume mix is not entered
                                //to check lookup FY columns

                                if (this.ValidateNumberReturnBlank(l_gridRow.data[m_arrMonths[l_Month]]) === "") {
                                    l_bVolumeMix = false;
                                }

                                if (l_bVolumeMix) {
                                    //Check allowance and create array of facts
                                    var childrens = l_gridRow.data.children;

                                    if (m_CurGrdMapping[p_sGridName][l_gridRow.data.DealID]) {
                                        curChildrens = m_CurGrdMapping[p_sGridName][l_gridRow.data.DealID].data.children;
                                    }
                                    //Check if the Row contains Children
                                    if (childrens != undefined) {
                                        //get time memeber code (YYddmm)
                                        var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(parseInt(l_Month) + 1);
                                        var facts = this.lookupChildForBestPractices(childrens, l_gridRow, m_arrMonths[l_Month], p_sGridName, curChildrens, p_BPGuidanceData[l_timeMemberCode]);

                                        facts.VolumeMix = l_gridRow.data[m_arrMonths[l_Month]];
                                        facts["GridName"] = p_sGridName;
                                        l_otherFacts.push(facts);
                                        p_factCodeArr[m_arrMonths[l_Month]].push(facts); //13Nov15 - Acrooss chaneel DA
                                        if (l_bCheckDealName) {
                                            this.checkDealName(l_gridRow, p_sGridName);
                                        };
                                        this.updateFactsObject(facts, l_timeMemberCode, m_arrMonths[l_Month], l_gridRow.data['SKU Excluded'], l_gridRow.data['Distributor Excluded']);
                                    }

                                };
                            }
                        };
                    }
                }

                l_bCheckDealName = false;

                //31Oct15 - SDA and Netlist delta check - IT#634
                //ET#1241 : The best practice '∆ SDA > ∆ Net List' needs to be turned off.
                //this.checkNetListandAllowance(l_otherFacts, m_arrMonths[l_Month], p_sGridName);
                //this.checkDuplicateNetList(l_otherFacts, m_arrMonths[l_Month], p_sGridName);

                //comment it on 4 July for new change in requiremnt 
                //this.checkAllowanceSeggreagated(l_otherFacts, m_arrMonths[l_Month], p_sGridName, "Net_List_ATAX", m_objlistPractices.DuplicateNetList);

                //this.checkAllowanceSeggreagated(l_otherFacts, m_arrMonths[l_Month], p_sGridName, "WP", m_objlistPractices.WPSame); - 18Nov15
                //this.checkAllowanceSeggreagated(l_otherFacts, m_arrMonths[l_Month], p_sGridName, "DA", m_objlistPractices.DASame);
                //l_FactsArr[m_arrMonths[l_Month]] = l_otherFacts;
            }
        } catch (err) {
            console.log('Error in removeCls from previous element');
        }
    };

    /**
     * To Check following best Practice 
     *  * VolumeNotPresent
     *  * AvgVolumeGuidance
     * @param  {object} p_data           Grid Data
     * @param  {boolean} p_bCheckDealName Check Deal Name
     * @param  {string} p_sGridName      Grid Name ON/OFF
     * @param  {object} p_BPGuidanceData Guidance Data
     */
    this.lookupForAvgBestPractice = function(p_data, p_bCheckDealName, p_sGridName, p_BPGuidanceData) {
        try {
            var l_volThreshold = p_BPGuidanceData["DEEP_PERCENT_OF_BUSINESS"];
            for (var rowIdx in p_data.items) {
                l_gridRow = p_data.items[rowIdx];
                var l_VolumePresent = true;
                if (l_gridRow.data.MetricsType !== "Business") {
                    if (!l_gridRow.data['Deleted Deal']) {

                        //check if its not PG deal and volume is present
                        if (p_bCheckDealName && !(l_gridRow.data['MetricsType'] == 'Volume') && !(l_gridRow.data['MetricsType'] == 'PG')) {
                            if (l_gridRow.data["DealLevelCode"] !== "Frontline") { // added FL condition 11Dec15
                                // check if all values of volume across months are blank - 27Oct15
                                if (this.ValidateNumberReturnZero(l_gridRow.data["FY"]) == 0) {
                                    if (this.checkVolumeNotPresent(l_gridRow.data)) {
                                        this.buildFYVolumeBP("VolumeNotPresent", p_sGridName, l_gridRow.data['DealID']);
                                        l_VolumePresent = false;
                                    }
                                }
                            }
                            if (l_VolumePresent && (l_gridRow.data["FY"] < (l_volThreshold["Threshold_1"] * 100) || l_gridRow.data["FY"] > (l_volThreshold["Threshold_2"] * 100))) {
                                var l_textToShow = " \"" + l_volThreshold['Threshold_1'] * 100 + " - " + l_volThreshold['Threshold_2'] * 100 + "\"";
                                // check if avg year volume threshold
                                this.buildFYVolumeBP("AvgVolumeGuidance", p_sGridName, l_gridRow.data['DealID'], l_textToShow);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Error in Avg best practices');
        }
    };

    this.buildFYVolumeBP = function(p_BestPractice, p_sGridName, p_DealID, p_Text) {
        var l_objBestPractice = {};
        l_objBestPractice.GridName = p_sGridName;
        l_objBestPractice.Column = "FY";
        l_objBestPractice.DealID = [];
        l_objBestPractice.DealID.push(p_DealID);
        if (p_Text) {
            l_objBestPractice.text = m_objlistPractices[p_BestPractice].text + p_Text;
        } else {
            l_objBestPractice.text = m_objlistPractices[p_BestPractice].text;
        }
        m_objlistPractices[p_BestPractice].list.push(l_objBestPractice);
        m_objlistPractices[p_BestPractice].count += 1;
    };

    /* check if entire row data is blank*/
    this.checkVolumeNotPresent = function(pGridRowData) {
        for (var l_Month in m_arrMonths) {
            //if (this.getMonthFromString(m_arrMonths[l_Month]) >= this.getMonthFromString(pGridRowData.data["EditableFrom"]))
            //check for null and blank - 31Oct15 - IT #632
            if (pGridRowData[m_arrMonths[l_Month]] !== "" && pGridRowData[m_arrMonths[l_Month]] !== null) {
                return false;
            }
        }
        return true;
    };

    this.getVolume = function(p_GridObj) {
        /*		Get the row from the grid object with uniquie DealID		 */
        var l_gridRow;
        var l_rootNode = p_GridObj.getRootNode();
        var l_data = l_rootNode.data;

        for (var rowIdx in l_rootNode.childNodes) {
            if (l_rootNode.childNodes[rowIdx].data.MetricsType == "Volume") {
                return l_rootNode.childNodes[rowIdx].data.FY;
            }
        }
    };

    this.getVolumeByMonth = function(p_GridObj, p_Month) {
        /*
        Get the row from the grid object with uniquie DealID

        */
        var l_gridRow;
        var l_rootNode = p_GridObj.getRootNode();
        var l_data = l_rootNode.data;

        for (var rowIdx in l_rootNode.childNodes) {

            if (l_rootNode.childNodes[rowIdx].data.MetricsType == "Volume") {

                return l_rootNode.childNodes[rowIdx].data[p_Month];

            }
        }
    }

    this.checkNetListandAllowance = function(p_otherFacts, p_nocolumn, p_sGridName) {
        // body...
        //Delta only volume
        var l_dltaAllowance;
        var l_dltaNetList;
        for (var i = 0; i < p_otherFacts.length - 1; i++) {

            //l_dltaAllowance = Math.abs(p_otherFacts[i + 1]['Allowance'] - p_otherFacts[i]['Allowance']);
            l_dltaAllowance = Math.abs(p_otherFacts[i + 1]['SDA'] - p_otherFacts[i]['SDA']);
            l_dltaNetList = Math.abs(p_otherFacts[i + 1]['Net_List_ATAX'] - p_otherFacts[i]['Net_List_ATAX']);

            if (l_dltaAllowance > l_dltaNetList) {
                var l_objBestPractice = {};

                l_objBestPractice.GridName = p_sGridName;

                l_objBestPractice.Column = p_nocolumn;

                l_objBestPractice.DealID = [];

                l_objBestPractice.DealID.push(p_otherFacts[i + 1]['DealID']);
                l_objBestPractice.DealID.push(p_otherFacts[i]['DealID']);

                m_objlistPractices.AllowanceDiff.list.push(l_objBestPractice);
                m_objlistPractices.AllowanceDiff.count += 1;
            }
        };

    }

    this.updateFactsObject = function(p_facts, p_TimeMemberCode, Month, bSKU, bDist) {

        var dealID = p_facts.DealID;

        var skuList = this.getIncList('SKU_Included', dealID, p_TimeMemberCode);
        var distList = this.getIncList('Distributor_Included', dealID, p_TimeMemberCode);

        p_facts['SKUList'] = skuList;
        p_facts['DISList'] = distList;
        p_facts['Month'] = Month;
        bSKU ? p_facts['SKU'] = true : p_facts['SKU'] = false;
        bDist ? p_facts['DIS'] = true : p_facts['DIS'] = false;

        if (!bSKU && !bDist) {

            for (deal in m_nonManDealsMaster[p_TimeMemberCode]) {

                var obj = m_nonManDealsMaster[p_TimeMemberCode][deal];

                if (skuList.indexOf(obj['Code']) >= 0) {
                    obj['Facts'] ? obj['Facts'].push(p_facts) : obj['Facts'] = [p_facts];
                }

            }
        }
        if (bSKU && !bDist) {
            for (deal in m_skuManDealsMaster[p_TimeMemberCode]) {

                var obj = m_skuManDealsMaster[p_TimeMemberCode][deal];

                if (skuList.indexOf(obj['Code']) >= 0) {
                    obj['Facts'] ? obj['Facts'].push(p_facts) : obj['Facts'] = [p_facts];
                }

            }
        }

        if (bDist && !bSKU) {
            for (deal in m_disManDealsMaster[p_TimeMemberCode]) {

                var obj = m_disManDealsMaster[p_TimeMemberCode][deal];

                if (distList.indexOf(obj['Code']) >= 0) {
                    obj['Facts'] ? obj['Facts'].push(p_facts) : obj['Facts'] = [p_facts];
                }

            }
        }

        if (bSKU && bDist) {

            for (deal in m_disSNDDealsMaster[p_TimeMemberCode]) {

                var obj = m_disSNDDealsMaster[p_TimeMemberCode][deal];

                if (distList.indexOf(obj['Code']) >= 0) {
                    obj['Facts'] ? obj['Facts'].push(p_facts) : obj['Facts'] = [p_facts];
                }
            }

            for (deal in m_skuSNDDealsMaster[p_TimeMemberCode]) {

                var obj = m_skuSNDDealsMaster[p_TimeMemberCode][deal];

                if (skuList.indexOf(obj['Code']) >= 0) {
                    obj['Facts'] ? obj['Facts'].push(p_facts) : obj['Facts'] = [p_facts];
                }
            }

        }
    }

    this.newevaluateFactObjects = function(p_fact, p_list, p_channel, p_masterData, dealID) {


        //console.log(m_skuMaster);
        for (time in p_masterData) {

            var nonManaged = p_masterData[time]
                .filter(function(obj) {
                    return !!obj['Facts'];
                }).map(function(obj) {
                    return obj['Facts'].filter(
                        function(chanl) {
                            return p_channel == 'ALL' ? true : chanl['GridName'] == p_channel;
                        }).map(function(factin) {
                        return factin[p_fact];
                    });
                });

            if (nonManaged.length > 0) {
                for (l in nonManaged) {
                    var nonManagedCount = p_fact == 'Net_List_ATAX' ? this.reduceArray(nonManaged[l]) : this.removeDup(nonManaged[l]);;

                    if (nonManagedCount.length > 1) {

                        for (var k = 1; k < nonManagedCount.length; k++) {
                            var obj = p_masterData[time]
                                .filter(function(obj) {
                                    return !!obj['Facts'];
                                }).map(function(obj2) {
                                    return obj2['Facts'].filter(
                                        function(chanl) {
                                            return p_channel == 'ALL' ? true : chanl['GridName'] == p_channel;
                                        }).filter(function(fact) {
                                        return fact[p_fact] == nonManagedCount[k];
                                    });
                                });


                            for (key in obj) {
                                for (key2 in obj[key]) {
                                    if (dealID.indexOf(obj[key][key2].DealID + obj[key][key2].GridName + obj[key][key2].Month) == -1) {
                                        var l_objBestPractice = {};

                                        l_objBestPractice.GridName = obj[key][key2].GridName;
                                        l_objBestPractice.Qualifier = p_fact == 'Net_List_ATAX' ? 'Net List' : p_fact;
                                        l_objBestPractice.Column = obj[key][key2].Month;
                                        l_objBestPractice.DealID = obj[key][key2].DealID;
                                        p_list.list.push(l_objBestPractice);

                                        p_list.count += 1;

                                        dealID.push(obj[key][key2].DealID + obj[key][key2].GridName + obj[key][key2].Month);
                                    }

                                }
                            }
                        }
                    }
                }
            }

        }

    }

    this.SameCount = function(arr) {

        var map = new Object();

        for (var i = 0; i < uniqueCount.length; i++) {
            if (map[uniqueCount[i]] != null) {
                map[uniqueCount[i]] += 1;
            } else {
                map[uniqueCount[i]] = 1;
            }
        }
        return map;
    }

    this.removeDup = function(arr) {
        return arr.sort().
        filter(function(me, i, arr) {
            return (i === 0) || (me !== arr[i - 1]);
        }).filter(function(value) {
            return value !== undefined;
        });
    }

    this.reduceArray = function(arr) {
        var obj = arr.reduce(function(countMap, word) {
            countMap[word] = ++countMap[word] || 1;
            return countMap
        }, {});
        var newarr = ["0"];
        for (key in obj) {
            if (obj[key] > 1)
                newarr.push(key);
        }
        return newarr;
    }
    this.extractCode = function(obj) {
        return obj['Code'];
    }

    this.getIncList = function(p_Type, dealID, timecode) {

        var inclusion = getPricePlanControllerManagerObj().getActivePricePlanData()["InclusionDetails"];

        return inclusion[dealID][timecode][p_Type].map(this.extractCode);

    }
    this.checkAllowanceSeggreagated = function(l_otherFacts, p_nocolumn, p_sGridName, p_AllowanceName, p_objlist) {
        /*
        To check allowance we need to check if Volume Mix is not 0
        if volume mix is 0 then it is meant that the Deal is inactive
        	*/
        var l_duplicate = {};
        var l_max = [];
        var l_duplicateGrp = [];
        var l_allowanceValue;
        var matched;

        // get active price plan exclution data
        var l_pricePlanExclusionData = getPricePlanControllerManagerObj().getActivePricePlanData()["ExclusionDetails"];
        //get time member code
        var l_timeMemberCode = getPricePlanControllerManagerObj().getPricePlanUIManager().getTimeMemberCode(m_arrMonths.indexOf(p_nocolumn) + 1);

        // loop for all facts
        for (var i = 0; i < l_otherFacts.length; i++) {
            l_duplicate = {};
            //check if vlume mix is greater than 0
            if (l_otherFacts[i]['VolumeMix'] > 0) {
                l_allowanceValue = l_otherFacts[i][p_AllowanceName];
                // check for first value
                if (l_allowanceValue != undefined) { //&& l_allowanceValue >= 0
                    if (l_duplicateGrp.length == 0) {
                        l_duplicate[l_allowanceValue] = {};
                        l_duplicate[l_allowanceValue]['DealID'] = [];
                        l_duplicate[l_allowanceValue]['GridName'] = [];
                        l_duplicate[l_allowanceValue]['DealID'].push(l_otherFacts[i]['DealID']);
                        l_duplicate[l_allowanceValue]['GridName'].push(l_otherFacts[i]['GridName']); //13Nov15
                        l_duplicateGrp.push(l_duplicate);
                        l_max[l_duplicateGrp.length] = l_duplicate[l_allowanceValue]['DealID'].length;
                    } else {
                        matched = false;
                        // for each duplicate value in group
                        for (var idx = 0; idx < l_duplicateGrp.length; idx++) {
                            // for each object of group array
                            for (var grp in l_duplicateGrp[idx]) {
                                // check if it match with current ID SKU exclusion
                                if (this.compareExclusion(l_pricePlanExclusionData[l_duplicateGrp[idx][grp]['DealID'][0]][l_timeMemberCode], l_pricePlanExclusionData[l_otherFacts[i]['DealID']][l_timeMemberCode], "SKU_Exluded")) {
                                    // check for same allowns value in group
                                    if (l_duplicateGrp[idx][l_allowanceValue] == undefined) {
                                        l_duplicateGrp[idx][l_allowanceValue] = {};
                                        l_duplicateGrp[idx][l_allowanceValue]['DealID'] = [];
                                        l_duplicateGrp[idx][l_allowanceValue]['GridName'] = [];
                                        l_duplicateGrp[idx][l_allowanceValue]['DealID'].push(l_otherFacts[i]['DealID']);
                                        l_duplicateGrp[idx][l_allowanceValue]['GridName'].push(l_otherFacts[i]['GridName']); //13Nov15
                                        //l_duplicateGrp[idx] = l_duplicate;
                                        l_max[idx] = l_duplicateGrp[idx][l_allowanceValue]['DealID'].length;
                                    } else {
                                        l_duplicateGrp[idx][l_allowanceValue]['DealID'].push(l_otherFacts[i]['DealID']);
                                        l_duplicateGrp[idx][l_allowanceValue]['GridName'].push(l_otherFacts[i]['GridName']); //13Nov15
                                        l_max[idx] = l_duplicateGrp[idx][l_allowanceValue]['DealID'].length;
                                    }
                                    matched = true;
                                }
                                break;
                            }
                            if (matched == true) {
                                break;
                            }
                        }
                        if (matched == false) {
                            l_duplicate[l_allowanceValue] = {};
                            l_duplicate[l_allowanceValue]['DealID'] = [];
                            l_duplicate[l_allowanceValue]['GridName'] = [];
                            l_duplicate[l_allowanceValue]['DealID'].push(l_otherFacts[i]['DealID']);
                            l_duplicate[l_allowanceValue]['GridName'].push(l_otherFacts[i]['GridName']); //13Nov15
                            l_duplicateGrp.push(l_duplicate);
                            l_max[idx] = l_duplicate[l_allowanceValue]['DealID'].length;
                        }
                    }
                }
            }
        };

        var iSameCount = 0;

        for (var idx = 0; idx < l_duplicateGrp.length; idx++) {
            l_duplicate = l_duplicateGrp[idx];
            iSameCount = 0;

            if (p_AllowanceName == "Net_List_ATAX") {
                for (var netlist in l_duplicate) {
                    if (l_duplicate[netlist]['DealID'].length > 1) {
                        p_objlist.count += 1;
                        var l_objBestPractice = {};

                        l_objBestPractice.GridName = p_sGridName;
                        //l_objBestPractice.GridName = l_duplicate[netlist]['GridName'];
                        l_objBestPractice.Qualifier = 'Net List';
                        l_objBestPractice.Column = p_nocolumn;
                        l_objBestPractice.DealID = l_duplicate[netlist]['DealID'];
                        p_objlist.list.push(l_objBestPractice);

                        p_objlist.count += 1;
                    }
                }
            } else {
                for (var allowance in l_duplicate) {
                    iSameCount = iSameCount + 1;
                };

                if (iSameCount > 1) {
                    for (allowance in l_duplicate) {
                        if (l_duplicate[allowance]['DealID'].length <= l_max[idx]) {
                            //m_objlistPractices.AllowanceSame.count += 1;
                            var l_objBestPractice = {};

                            l_objBestPractice.GridName = p_sGridName;
                            // if allownce is DA den assign grid name array
                            if (p_AllowanceName == "DA" || p_AllowanceName == "WP") {
                                l_objBestPractice.GridName = l_duplicate[allowance]['GridName'];
                            }
                            l_objBestPractice.Column = p_nocolumn;
                            l_objBestPractice.Qualifier = p_AllowanceName;
                            l_objBestPractice.DealID = l_duplicate[allowance]['DealID'];
                            p_objlist.list.push(l_objBestPractice);

                            p_objlist.count += 1;
                        }
                    };
                }
            }
        }
    };

    this.compareExclusion = function(pVal1, pVal2, pExclusion) {
        // get length both array
        var l_val1Length = pVal1[pExclusion].length;
        var l_val2Length = pVal2[pExclusion].length;
        var match;

        // check both array has same length
        if (l_val1Length == l_val2Length) {
            // if legth is zero
            if (l_val1Length == 0) {
                return true;
            } else {
                // loop to comapre code
                for (var idx1 = 0; idx1 < l_val1Length; idx1++) {
                    match = false;
                    for (var idx2 = 0; idx2 < l_val2Length; idx2++) {
                        if (pVal1[pExclusion][idx1].Code == pVal2[pExclusion][idx2].Code) {
                            match = true;
                            break;
                        }
                    }
                    if (!match) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    };

    this.checkAllowance = function(l_otherFacts, p_nocolumn, p_sGridName) {
        /*
        To check allowance we need to check if Volume Mix is not 0
        if volume mix is 0 then it is meant that the Deal is inactive
        	*/
        var l_duplicate = {};
        var l_max;
        for (var i = 0; i < l_otherFacts.length; i++) {
            if (l_otherFacts[i]['VolumeMix'] > 0) {
                if (l_duplicate[l_otherFacts[i]['Allowance']] == undefined) {
                    l_duplicate[l_otherFacts[i]['Allowance']] = [];
                    l_duplicate[l_otherFacts[i]['Allowance']].push(l_otherFacts[i]['DealID']);

                    l_max = l_duplicate[l_otherFacts[i]['Allowance']].length;
                } else {
                    l_duplicate[l_otherFacts[i]['Allowance']].push(l_otherFacts[i]['DealID']);

                    l_max = l_duplicate[l_otherFacts[i]['Allowance']].length;
                }
            }
        };

        for (var allowance in l_duplicate) {
            if (l_duplicate[allowance].length <= l_max) {
                //m_objlistPractices.AllowanceSame.count += 1;
                var l_objBestPractice = {};

                l_objBestPractice.GridName = p_sGridName;

                l_objBestPractice.Column = p_nocolumn;

                l_objBestPractice.Qualifier = 'Allowance';

                l_objBestPractice.DealID = l_duplicate[allowance];

                //l_objBestPractice.dealidd = l_duplicate[allowance];

                m_objlistPractices.AllowanceSame.list.push(l_objBestPractice);
                m_objlistPractices.AllowanceSame.count += 1;
            }
        };

    };

    this.checkDuplicateNetList = function(p_otherFacts, p_nocolumn, p_sGridName) {
        //Check Duplication Net List
        var l_duplicate = {};

        for (var i = 0; i < p_otherFacts.length; i++) {
            if (p_otherFacts[i]['VolumeMix'] > 0) {
                if (p_otherFacts[i]['Net_List_ATAX'] != undefined && p_otherFacts[i]['Net_List_ATAX'] > 0) {
                    if (l_duplicate[p_otherFacts[i]['Net_List_ATAX']] == undefined) {
                        l_duplicate[p_otherFacts[i]['Net_List_ATAX']] = [];
                        l_duplicate[p_otherFacts[i]['Net_List_ATAX']].push(p_otherFacts[i]['DealID']);
                    } else {
                        l_duplicate[p_otherFacts[i]['Net_List_ATAX']].push(p_otherFacts[i]['DealID']);
                    }
                }
            }
        };

        for (var netlist in l_duplicate) {
            if (l_duplicate[netlist].length > 1) {
                m_objlistPractices.DuplicateNetList.count += 1;
                var l_objBestPractice = {};

                l_objBestPractice.GridName = p_sGridName;

                l_objBestPractice.Qualifier = 'Net List';

                l_objBestPractice.Column = p_nocolumn;

                l_objBestPractice.DealID = l_duplicate[netlist];

                m_objlistPractices.DuplicateNetList.list.push(l_objBestPractice);

                m_objlistPractices.DuplicateNetList.count += 1;
            }
        };
    };

    this.checkDealName = function(p_gridRow, p_sGridName) {
        if ((p_gridRow.data.MetricsType != "Business") && (p_gridRow.data.MetricsType != "Volume")) {
            if (p_gridRow.data["DealName"] == undefined || p_gridRow.data["DealName"] == "" || p_gridRow.data["DealName"] == 0) {

                var msg = 'Incomplete Price Line';
                this.buildBestPractices(p_gridRow, "Deal Name", p_sGridName, m_objlistPractices.IncompletePriceLine.list, m_objlistPractices.IncompletePriceLine.text);

                m_objlistPractices.IncompletePriceLine.count += 1;
            }
        }
    };

    /*creates best practice object*/
    this.buildBestPractices = function(p_gridRow, p_gridColumn, p_sGridName, p_list, p_text, p_Lvl, p_Qualifier) {
        var l_objBestPractice = {};
        //assign grid name
        l_objBestPractice.GridName = p_sGridName;

        //if summary section
        if (p_sGridName == "Summary") {
            l_objBestPractice.DealID = "";
            l_objBestPractice.Qualifier = p_Qualifier;
            l_objBestPractice.RowIdx = p_gridRow;
        } else {
            //for volume/Buisness add deal id as metrics tpe
            if (p_gridRow.data.MetricsType == "Volume" || p_gridRow.data.MetricsType == "Business") {
                l_objBestPractice.DealID = p_gridRow.data.MetricsType;
            } else {
                //assign deal id
                if (p_Lvl == "DEAL") {
                    l_objBestPractice.DealID = [p_gridRow.data.DealID];
                } else {
                    l_objBestPractice.DealID = p_gridRow.data.DealID;
                }
                //assign qualifier
                if (p_Qualifier != undefined) {
                    l_objBestPractice.Qualifier = p_Qualifier;
                }
            }
        }
        //asign text to show and grid column
        l_objBestPractice.text = p_text;
        l_objBestPractice.Column = p_gridColumn;

        p_list.push(l_objBestPractice);
    };

    this.fetchDealSubChl = function(p_DealName) {
        var l_arrName = p_DealName.split("-");
        return l_arrName[1];
    };

    /**
     * Childrens in the grid consist of facts, this function loops through children to look for 
     * * IncompletePriceLine
     * * ProposedNetListDeeeper
     * * MinNetListGuidance
     * * RABNegative
     * * MinRABGuidance
     * * ProposedNetFOBDeeeper
     * * MinNetFOBGuidance
     * <p> <img uml="
     *     object FactList {
     *       WP = value
     *       WPRow = value
     *       DA = value
     *       DARow = value
     *       Net_FOB = value
     *       Net_List_ATAX = value
     *       SDA = value
     *       SDA = value
     *     }
     * "> </p>
     * @param  {object} p_children    children object from tree grid
     * @param  {string} p_gridRow     Grid Row index
     * @param  {string} p_Month       Month Name
     * @param  {string} p_sGridName   Grid Name
     * @param  {object} p_guidance    Guidance Data
     * @return {object}               FactList
     */
    this.lookupChildForBestPractices = function(p_children, p_gridRow, p_Month, p_sGridName, p_curChildren, p_guidance) {
        var l_facts = {};
        l_facts['DealID'] = p_gridRow.data['DealID'];
        var l_DealName = p_gridRow.data['DealName'];

        //CR 1135 where when Frontline deal has a mix we have to consider WP and DA as zero
        if (p_gridRow.data["DealLevelCode"] == "Frontline") {
            l_facts["WP"] = 0;
            l_facts["WPRow"] = 0;
            l_facts["DA"] = 0;
            l_facts["DARow"] = 0;
        }
        // get lowest value facts from current grid section - to find deeper value in proposed
        var l_lowestFactValueArr = this.getLowestFactValueArray(["Net_FOB", "Net_List_ATAX"], p_Month, p_sGridName);

        for (var childrens in p_children) {
            //if (this.getMonthFromString(p_Month) >= this.getMonthFromString(p_children[childrens]["EditableFrom"])) {
            if ((this.getMonthFromString(p_Month) >= this.getMonthFromString(m_EditableFrom) || m_HistorEditFrom[p_sGridName].hasOwnProperty(p_Month)) && m_PGEffectivity[p_Month]) { //Check if this is actual based on editable from
                if (m_FactCode.indexOf(p_children[childrens].FactCode) > 0) {
                    if (this.ValidateNumberReturnBlank(p_children[childrens][p_Month]) === "") {
                        this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.IncompletePriceLine.list, m_objlistPractices.IncompletePriceLine.text, "", p_children[childrens].Qualifier);
                        m_objlistPractices.IncompletePriceLine.count += 1;
                    } else {
                        if (p_children[childrens].FactCode == 'Net_List_ATAX' && this.fetchDealSubChl(l_DealName) != 'WHS') {
                            l_facts[p_children[childrens].FactCode] = p_children[childrens][p_Month];
                            l_facts[p_children[childrens].FactCode + 'Row'] = childrens;
                        };
                    }

                    //New priceline is deepest - Proposed priceline is deeper (NET FOB or Net List) than any current
                    if (p_children[childrens].FactCode == "Net_List_ATAX") {
                        // check for deeper value
                        if (l_lowestFactValueArr[p_children[childrens].FactCode] > p_children[childrens][p_Month]) {
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.ProposedNetListDeeeper.list, m_objlistPractices.ProposedNetListDeeeper.text + " \"" + l_lowestFactValueArr[p_children[childrens].FactCode] + "\"", "DEAL");
                            m_objlistPractices.ProposedNetListDeeeper.count += 1;
                        }
                        //check with guidace value
                        if (this.ValidateNumberReturnZero(p_children[childrens][p_Month]) < this.ValidateNumberReturnZero(p_guidance["MIN_NET_LIST_GUIDLINE"])) {
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.MinNetListGuidance.list, m_objlistPractices.MinNetListGuidance.text + " \"" + p_guidance["MIN_NET_LIST_GUIDLINE"] + " \"", "", p_children[childrens].Qualifier);
                            m_objlistPractices.MinNetListGuidance.count += 1;
                        }
                    }

                } else {
                    // to check RAB
                    if (p_children[childrens].FactCode == 'RAB') {
                        if (this.ValidateNumberReturnZero(p_children[childrens][p_Month]) < 0) {
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.RABNegative.list, m_objlistPractices.RABNegative.text, "", p_children[childrens].Qualifier);
                            m_objlistPractices.RABNegative.count += 1;
                        }
                        if (this.ValidateNumberReturnZero(p_children[childrens][p_Month]) < this.ValidateNumberReturnZero(p_guidance["MIN_RAB_GUIDLINE"])) {
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.MinRABGuidance.list, m_objlistPractices.MinRABGuidance.text + " \"" + p_guidance["MIN_RAB_GUIDLINE"] + "\"", "", p_children[childrens].Qualifier);
                            m_objlistPractices.MinRABGuidance.count += 1;
                        }
                    }

                    //31Oct15 - SDA delta - 634
                    if (p_children[childrens].FactCode == 'SDA' && this.fetchDealSubChl(l_DealName) != 'WHS') {
                        l_facts[p_children[childrens].FactCode] = p_children[childrens][p_Month];
                        l_facts[p_children[childrens].FactCode + 'Row'] = childrens;
                    };

                    if (p_children[childrens].FactCode == 'DA') { //&& this.ValidateNumberReturnZero(p_children[childrens][p_Month]) >= 0
                        l_facts[p_children[childrens].FactCode] = p_children[childrens][p_Month];
                        l_facts[p_children[childrens].FactCode + 'Row'] = childrens;
                    };
                    //31Oct15 -
                    if (p_children[childrens].FactCode == 'WP') { //&& this.ValidateNumberReturnZero(p_children[childrens][p_Month]) >= 0
                        l_facts[p_children[childrens].FactCode] = p_children[childrens][p_Month];
                        l_facts[p_children[childrens].FactCode + 'Row'] = childrens;
                    };

                    if (p_children[childrens].FactCode == "Net_FOB") {
                        // check for deeper value
                        if (l_lowestFactValueArr[p_children[childrens].FactCode] > p_children[childrens][p_Month]) {
                            //this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.ProposedNetFOBDeeeper.list, p_children[childrens].Qualifier);
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.ProposedNetFOBDeeeper.list, m_objlistPractices.ProposedNetFOBDeeeper.text + " \"" + l_lowestFactValueArr[p_children[childrens].FactCode] + "\"", "DEAL");
                            m_objlistPractices.ProposedNetFOBDeeeper.count += 1;
                        }
                        //check with guidace value
                        if (this.ValidateNumberReturnZero(p_children[childrens][p_Month]) < this.ValidateNumberReturnZero(p_guidance["MIN_NET_FOB_GUIDLINE"])) {
                            this.buildBestPractices(p_gridRow, p_Month, p_sGridName, m_objlistPractices.MinNetFOBGuidance.list, m_objlistPractices.MinNetFOBGuidance.text + " \"" + p_guidance["MIN_NET_FOB_GUIDLINE"] + "\"", "", p_children[childrens].Qualifier);
                            m_objlistPractices.MinNetFOBGuidance.count += 1;
                        }
                    }
                };
            };
        };
        return l_facts;
    };

    // to create lowest fact value array for given facts
    this.getLowestFactValueArray = function(p_FactNameArr, p_Month, p_sGridName) {
        var l_CurGrdMapping = m_ProGrdMapping[p_sGridName];
        var l_lowestFactValue = [];

        for (var idx in l_CurGrdMapping) {
            // itrate for each fact name
            for (var factIdx in p_FactNameArr) {
                if (l_CurGrdMapping[idx][p_FactNameArr[factIdx]] && l_CurGrdMapping[idx][p_FactNameArr[factIdx]][p_Month] > 0) {
                    if (l_lowestFactValue[p_FactNameArr[factIdx]]) {
                        if (l_lowestFactValue[p_FactNameArr[factIdx]] > l_CurGrdMapping[idx][p_FactNameArr[factIdx]][p_Month]) {
                            l_lowestFactValue[p_FactNameArr[factIdx]] = l_CurGrdMapping[idx][p_FactNameArr[factIdx]][p_Month];
                        }
                    } else {
                        l_lowestFactValue[p_FactNameArr[factIdx]] = l_CurGrdMapping[idx][p_FactNameArr[factIdx]][p_Month];
                    }
                }
            }
        }
        return l_lowestFactValue;
    };

    // check if given facts value is lesser accross deals
    this.compareForDeeperPrice = function(p_GridID, p_FactName, p_FactValue, p_Month, p_sGridName) {
        var l_ProGrdMapping = m_ProGrdMapping[p_sGridName];
        var l_lowestFactValue;
        for (var idx in l_ProGrdMapping) {
            if (l_lowestFactValue) {
                if (l_ProGrdMapping[idx][p_FactName]) {
                    if (l_lowestFactValue > l_ProGrdMapping[idx][p_FactName][p_Month]) {
                        l_lowestFactValue = l_ProGrdMapping[idx][p_FactName][p_Month];
                    }
                }
            } else {
                l_lowestFactValue = l_ProGrdMapping[idx][p_FactName][p_Month];
            }
        }
        if (l_lowestFactValue > p_FactValue) {
            return true
        }
        return false;
    };

    this.ValidateNumberReturnBlank = function(p_number) {
        if (isNaN(p_number) || !isFinite(p_number) || (p_number == null) || (p_number === "") || (p_number == undefined)) {
            return "";
        } else {
            return p_number;
        }
    };

    this.ValidateNumberReturnZero = function(p_number) {
        if (isNaN(p_number) || !isFinite(p_number) || (p_number == null) || (p_number === "") || (p_number == undefined)) {
            return 0;
        } else {
            return p_number;
        }
    };

    this.PanelHideEvent = function(component, eOpts) {
        this.removeClsfromPrevElement();
        this.hideBestPracticePopup();
    };

    this.addClstoElement = function(p_arrelement) {
        if (Ext.getCmp("btnOnPremiseToggleValues").pressed) {
            Ext.getCmp("btnOnPremiseToggleValues").toggle();
            VistaarExtjs.getCmp("tabPnlOnPremise").setActiveTab(0);
        }
        if (Ext.getCmp("btnOffPremiseToggleValues").pressed) {
            Ext.getCmp("btnOffPremiseToggleValues").toggle();
            VistaarExtjs.getCmp("tabPnlOffPremise").setActiveTab(0);
        }

        var l_Element = [];
        for (var i = 0; i < p_arrelement.length; i++) {

            var l_GridContainer = Ext.getCmp('cntPricePlanGridView');

            var element = Ext.get(p_arrelement[i].id);

            l_Element.push(Ext.get(p_arrelement[i].id));

            l_GridContainer.scrollTo(element.getX(), 0, false);
            l_GridContainer.scrollTo(element.getX(), element.getY() - l_GridContainer.getY() - 100, false);
        }

        this.removeClsfromPrevElement();

        Ext.defer(function() {
            for (var i = 0; i < l_Element.length; i++) {
                l_Element[i].removeCls('animated zoomInOut');
            }
            Ext.defer(function() {
                for (var i = 0; i < l_Element.length; i++) {
                    m_prevCellElement.push(l_Element[i]);
                    l_Element[i].addCls('animated zoomInOut');
                    if (p_arrelement[i].type == "HardStop") {
                        l_Element[i].addCls('clsErrorBestPractices');
                    } else {
                        l_Element[i].addCls('clsSoftStopBestPractices');
                    }
                }
            }, 50);
        }, 50);
    };

    // remove best practicce cls
    this.removeClsfromPrevElement = function() {
        if (m_prevCellElement != undefined) {
            for (var i = 0; i < m_prevCellElement.length; i++) {
                try {
                    if (m_prevCellElement[i].hasCls('clsErrorBestPractices')) { //20Oct15
                        m_prevCellElement[i].removeCls('clsErrorBestPractices');
                    } else if (m_prevCellElement[i].hasCls('clsSoftStopBestPractices')) { //20Oct15
                        m_prevCellElement[i].removeCls('clsSoftStopBestPractices');
                    }
                } catch (err) {
                    console.log('Error in removeCls from previous element');
                }
            }
        }
        m_prevCellElement = [];
    };

    this.getRowfromGrid = function(p_GridObj, p_RowValue) {
        //Get the row from the grid object with uniquie DealID
        var l_gridRow;
        var l_rootNode = p_GridObj.getRootNode();
        var l_data = l_rootNode.data;

        for (var rowIdx in l_rootNode.childNodes) {
            if (l_rootNode.childNodes[rowIdx].data.DealID == p_RowValue || l_rootNode.childNodes[rowIdx].data.MetricsType == p_RowValue || l_rootNode.childNodes[rowIdx].data.Qualifier == p_RowValue) {
                return p_GridObj.store.getAt(rowIdx);
            }
        }
    };

    this.getRowFromSummaryGrid = function(p_GridObj, p_RowValue) {

        var l_data = VistaarDG.getDataFromDynamicGrid(m_DGSUMMARYPROPOSED);

        for (var rowIdx in l_data) {

            if (l_data[rowIdx].Metrics == p_RowValue) {

                return p_GridObj.store.getAt(rowIdx);

            }

        }

    }
    this.getRowNofromGrid = function(p_GridObj, p_RowValue) {
        //Get the row from the grid object with uniquie DealID
        var l_gridRow;
        var l_rootNode = p_GridObj.getRootNode();
        var l_data = l_rootNode.data;

        for (var rowIdx in l_rootNode.childNodes) {
            if (l_rootNode.childNodes[rowIdx].data.DealID == p_RowValue || l_rootNode.childNodes[rowIdx].data.MetricsType == p_RowValue || l_rootNode.childNodes[rowIdx].data.Qualifier == p_RowValue) {
                return rowIdx;
            }
        }
    };

    this.getColumFromGrid = function(p_GridObj, p_ColumnName) {
        var l_column;
        var l_grdColumns;
        l_grdColumns = p_GridObj.columns;

        for (var colIdx in l_grdColumns) {
            var l_column = l_grdColumns[colIdx];
            if (l_column.text == p_ColumnName) {
                return l_column;
            }
        }
    };

    this.getChildRowFrom = function(p_gridRow, p_Qualifier) {
        // body...
        for (var rowIdx in p_gridRow.childNodes) {
            if (p_gridRow.childNodes[rowIdx].data.Qualifier == p_Qualifier) {
                return rowIdx;
            }
        }
    };

    // expand proposed Net FOB - set flag and refresh grid - 1Oct15
    this.expandSummaryGrid = function() {
        var el = VistaarExtjs.getCmp(m_DGSUMMARYPROPOSED).DGObj.getEl();
        var l_str_ParentKey = "ProposedNetFOB";
        var l_index_ParentNode = getCommonFuncMgr().arrSummaryGrdParentRowInfo.indexOf(l_str_ParentKey);
        var l_objHiddenFieldInfo = getCommonFuncMgr().objSummaryGrdHiddenFieldInfo;
        if (l_index_ParentNode != -1) {
            if (l_objHiddenFieldInfo[l_str_ParentKey].hidden) {
                el.addCls(l_objHiddenFieldInfo[l_str_ParentKey].expandCls);
                l_objHiddenFieldInfo[l_str_ParentKey].hidden = false;
            }
        }
        VistaarExtjs.getCmp(m_DGSUMMARYPROPOSED).DGObj.view.refresh();
    };

    this.getElementtoaddCls = function(p_list) {
        var l_idlist = [];
        var cell = {};
        // if its summary grid - 1oct15
        if (p_list.GridName == "Summary") {
            //get grid objects
            this.setActiveGridForBestPractice(p_list.GridName);
            var l_objGrid = m_objSummaryTreeGrid;
            //get grid view
            var l_grdview = l_objGrid.getView();
            //get grid row and column object
            var l_gridRow = this.getRowFromSummaryGrid(l_objGrid, p_list.Qualifier); //l_objGrid.store.getAt(p_list.RowIdx);
            var l_gridCol = this.getColumFromGrid(l_objGrid, p_list.Column);

            //expand summary section
            this.expandSummaryGrid();

            //get cell id
            //var cell = l_grdview.getCell(l_gridRow, l_gridCol); // 20Oct15
            cell = {};
            cell.id = l_grdview.getCell(l_gridRow, l_gridCol).id;
            cell.type = p_list.type;
            l_idlist.push(cell);
        } else {
            //17Nov15 - DA Across channel
            var l_objGrid = {};
            var l_grdview = {};
            var l_rootNode = {};
            if (typeof p_list.GridName == 'object') {
                l_objGrid["OFF"] = m_objTreeGridOff;
                l_objGrid["ON"] = m_objTreeGridOn;
                l_grdview["OFF"] = l_objGrid["OFF"].getView();
                l_grdview["ON"] = l_objGrid["ON"].getView();
                l_rootNode["OFF"] = l_objGrid["OFF"].getRootNode();
                l_rootNode["ON"] = l_objGrid["ON"].getRootNode();
                l_rootNode["OFF"].collapseChildren();
                l_rootNode["ON"].collapseChildren();
            } else {
                l_objGrid[p_list.GridName] = (p_list.GridName == 'OFF' ? m_objTreeGridOff : m_objTreeGridOn);
                l_grdview[p_list.GridName] = l_objGrid[p_list.GridName].getView();
                l_rootNode[p_list.GridName] = l_objGrid[p_list.GridName].getRootNode();
                l_rootNode[p_list.GridName].collapseChildren();
            }

            if (typeof p_list.DealID == 'object') {
                for (var i = 0; i < p_list.DealID.length; i++) {
                    //17Nov15 - DA Across channel
                    if (typeof p_list.GridName == 'object') {
                        var l_grdName = p_list.GridName[i];
                    } else {
                        var l_grdName = p_list.GridName;
                    }
                    this.setActiveGridForBestPractice(l_grdName);
                    var l_gridRow = this.getRowfromGrid(l_objGrid[l_grdName], p_list.DealID[i]); // l_rootNode.getChildAt(p_list.DealID[i]);
                    //var cell = l_grdview.getCell(l_gridRow, this.getColumFromGrid(l_objGrid, p_list.Column));
                    cell = {};
                    cell.id = l_grdview[l_grdName].getCell(l_gridRow, this.getColumFromGrid(l_objGrid[l_grdName], p_list.Column)).id;
                    cell.type = p_list.type;
                    l_idlist.push(cell);
                    cell = {}
                    cell.id = l_grdview[l_grdName].getCell(l_gridRow, this.getColumFromGrid(l_objGrid[l_grdName], 'Deal Name')).id;
                    cell.type = p_list.type;
                    l_idlist.push(cell);
                };
            } else {
                var l_grdName = p_list.GridName;
                this.setActiveGridForBestPractice(l_grdName);
                var l_gridRow = this.getRowfromGrid(l_objGrid[l_grdName], p_list.DealID); // l_rootNode.getChildAt(p_list.row);
                var l_gridCol = this.getColumFromGrid(l_objGrid[l_grdName], p_list.Column);

                if (p_list.Qualifier != undefined) {
                    this.displayQualifier(p_list.Qualifier);
                    var l_dealRow = l_rootNode[l_grdName].getChildAt(this.getRowNofromGrid(l_objGrid[l_grdName], p_list.DealID));
                    l_dealRow.expand();

                    var l_childRow = this.getChildRowFrom(l_dealRow, p_list.Qualifier);
                    //var cell = l_grdview.getCell(l_dealRow.getChildAt(l_childRow), l_gridCol); // 20Oct15
                    cell = {};
                    cell.id = l_grdview[l_grdName].getCell(l_dealRow.getChildAt(l_childRow), l_gridCol).id;
                    cell.type = p_list.type;
                    l_idlist.push(cell);
                } else { // 28Oct15
                    cell = {};
                    cell.id = l_grdview[l_grdName].getCell(l_gridRow, l_gridCol).id;
                    cell.type = p_list.type;
                    l_idlist.push(cell);
                }
            }
        }
        this.addClstoElement(l_idlist);
    };
    //This function should Ideally move into PricePlanGrid.js
    this.setActiveGridForBestPractice = function(p_strGridName) {
        if (getCommonFuncMgr().isNonDeskTopView()) {
            var pnlParentCard = VistaarExtjs.getCmp('cnt_PricePlan_Grid_Card');
            if (p_strGridName.toLowerCase() == "summary") {
                pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cntPricePlanSummary"));
            } else if (p_strGridName.toLowerCase() == "on") {
                var tabOnPremise = VistaarExtjs.getCmp("tabPnlOnPremise");
                pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cnt_PricePlanOnPremise"));
                tabOnPremise.setActiveTab(0);
            } else if (p_strGridName.toLowerCase() == "off") {
                var tabOffPremise = VistaarExtjs.getCmp("tabPnlOffPremise");
                pnlParentCard.setActiveItem(VistaarExtjs.getCmp("cnt_PricePlanOffPremise"));
                tabOffPremise.setActiveTab(0);
            }
        }
    };

    this.displayQualifier = function(p_QualifierName) {
        var l_preference = getPricePlanControllerManagerObj().getPricePlanUIManager().m_UserPrefrence;
        var l_QualifierCode = this.fetchCodefromName(p_QualifierName);
        if (!l_preference[l_QualifierCode]) {
            l_preference[l_QualifierCode] = true;
            getPricePlanControllerManagerObj().getPricePlanUIManager().getPricePlanGridManager().refreshAllPricePlanGridsView();
        }
    };

    this.fetchCodefromName = function(p_QualifierName) {
        var l_arrCodeName = getPricePlanControllerManagerObj().getActivePricePlanData().UserPreference;

        for (var j = 0, length2 = l_arrCodeName.length; j < length2; j++) {
            if (l_arrCodeName[j].Name == p_QualifierName) {
                return l_arrCodeName[j].Code;
            }
        }
        return undefined;
    };

    this.PrevButtonClick = function(button, e, eOpts) {

        var currElement = m_currentPracticeList.getElement();
        var prevElement = m_currentPracticeList.getPrevElement();

        if (currElement == prevElement) {
            var l_prevPractice = this.getPreviousBestPractice(m_currentPracticeList.text);
            m_currentPracticeList = new list(l_prevPractice);
            m_currentPracticeList.pos = l_prevPractice.list.length - 1;

            prevElement = m_currentPracticeList.getElement();

            var panelInfo = m_PricePlanBestPracticePopupObject.getComponent('pnlNotificationDetailInfo');

            var l_pnlElement = panelInfo.getEl();

            l_pnlElement.removeCls('fadeInLeft');
            l_pnlElement.removeCls('fadeInRight');
            l_pnlElement.removeCls('fadeOutLeft');
            l_pnlElement.removeCls('fadeOutRight');
            l_pnlElement.addCls('fadeOutLeft');

            setTimeout(function() {
                l_pnlElement.removeCls('fadeOutLeft');
                l_pnlElement.addCls('fadeInRight');
            }, 300);

        }
        this.updateNotificationPanel();
        this.getElementtoaddCls(prevElement);
    };
 
    this.NextButtonClick = function(button, e, eOpts) {
        var currElement = m_currentPracticeList.getElement();
        var nextElement = m_currentPracticeList.getNextElement();

        if (currElement == nextElement) {
            var l_nextPractice = this.getNextBestPractice(m_currentPracticeList.text);
            m_currentPracticeList = new list(l_nextPractice);

            nextElement = m_currentPracticeList.getElement();

            var panelInfo = m_PricePlanBestPracticePopupObject.getComponent('pnlNotificationDetailInfo');
            var l_pnlElement = panelInfo.getEl();

            l_pnlElement.removeCls('fadeInLeft');
            l_pnlElement.removeCls('fadeInRight');
            l_pnlElement.removeCls('fadeOutLeft');
            l_pnlElement.removeCls('fadeOutRight');
            l_pnlElement.addCls('fadeOutRight');

            setTimeout(function() {
                l_pnlElement.removeCls('fadeOutRight');
                l_pnlElement.addCls('fadeInLeft');
            }, 300);
        }
        this.updateNotificationPanel();
        this.getElementtoaddCls(nextElement);
    };

    this.MainButtonClick = function(button, e, eOpts) {
        try {
            setWaitCursor();
            Ext.defer(function() {
                //TOGGLE BEST PRACTICES BUTTON ...................
                var btn = VistaarExtjs.getCmp("btnBestPractices");
                btn.toggle(true);
                //get position
                this.show(btn.getX(), btn.getY(), btn.getWidth(), btn.getHeight());
                this.hideBestPracticePopup();
                //IT 1052 Best Practice pop up remain open
                this.focusBestPracticeWindow();
                setDefaultCursor();
            }, 20, this);
        } catch (err) {
            setDefaultCursor();
            getCommonFuncMgr().printLog(err);
        }
    };

 
    var list = function(l_data) {

        this.pos = 0;
        this.dataStore = l_data.list;
        this.length = this.dataStore.length;
        this.text = l_data.text;
        this.type = l_data.type;
        this.isReadOnly = l_data.isReadOnly;

        this.previous = function() {
            if (this.pos > 0) {
                --this.pos;
            }
            return this.pos;
        };

       
        this.next = function() {
            // if (this.isReadOnly) { 28Oct15
            // ++this.pos;
            // }
            if (this.pos < this.dataStore.length - 1) {
                ++this.pos;
            }
            return this.pos;
        };
        
        this.getElement = function() {
            var l_element = this.dataStore[this.pos];
            l_element["type"] = this.type; // 20Oct15
            //return this.dataStore[this.pos];
            return l_element;
        };

       
         
        this.getNextElement = function() {
            var l_element = this.dataStore[this.next()];
            l_element["type"] = this.type; // 20Oct15
            return l_element;
            //return this.dataStore[this.next()];
        };

       
        this.getPrevElement = function() {
            var l_element = this.dataStore[this.previous()];
            l_element["type"] = this.type; // 20Oct15
            return l_element;
            //return this.dataStore[this.previous()];
        };

    };

    this.setCountOfBestPractice = function() {
        var l_Count = this.getCountOfBestPractice();
        this.removeCountOnBestButton();

        if (l_Count > 0) {
            var l_objCount = document.createElement('span');
            l_objCount.id = "btnPracticeCount";
            l_objCount.className = "notification-balloon-button";
            l_objCount.innerHTML = "<div class = 'balloon-button-inner'>" + l_Count + "</div>";
            var l_objParentContainer = Ext.DomQuery.selectNode('#btnBestPractices-btnEl');
            l_objParentContainer.insertBefore(l_objCount, l_objParentContainer.firstChild);
        }
    };

    this.removeCountOnBestButton = function() {
        var l_btnpractice = Ext.ComponentQuery.query('button[id=btnBestPractices]')[0];
        var l_btnEl = l_btnpractice.btnEl;

        for (var i = l_btnEl.dom.childNodes.length - 1; i >= 0; i--) {
            if (l_btnEl.dom.childNodes[i].id == 'btnPracticeCount') {
                l_btnEl.dom.removeChild(l_btnEl.dom.childNodes[i]);
            }
        };
    };

    this.getCountOfBestPractice = function() {
        var l_Count = 0;
        for (var practices in m_objlistPractices) {
            l_Count = l_Count + m_objlistPractices[practices].count;
        }
        return ('0' + l_Count).slice(-2);
    };

    this.getCountOfHardStop = function() {
        var l_Count = 0;
        for (var practices in m_objlistPractices) {
            if (m_objlistPractices[practices].type == 'HardStop') {
                l_Count = l_Count + m_objlistPractices[practices].count;
            }
        }
        return l_Count;
    };

    this.getCountOfSoftStop = function() {
        var l_Count = 0;
        for (var practices in m_objlistPractices) {
            if (m_objlistPractices[practices].type == 'SoftStop') {
                l_Count = l_Count + m_objlistPractices[practices].count;
            }
        }
        return l_Count;
    };

    this.checkBestPractices = function() {
        // get best practicce data
        var l_BestPractice = getPricePlanControllerManagerObj().getBestracticeGuidanceData();
        //check for  best practicce data
        if (l_BestPractice) {
            //this.show();
            var l_HardCount = this.getCountOfHardStop();
            var l_SoftCount = this.getCountOfSoftStop();
            if (l_HardCount > 0) {
                return 'HardStop';
            } else if (l_SoftCount > 0) {
                return 'SoftStop';
            } else {
                return false;
                this.hide();
            }
        }
        return "error";
    };

    this.showOnSubmit = function() {
        if (getCommonFuncMgr().isNonDeskTopView() && !VistaarExtjs.getCmp("btnExpandCollpseToolBar").pressed) {
            VistaarExtjs.getCmp("btnExpandCollpseToolBar").toggle(true);
            getPricePlanControllerManagerObj().getPricePlanUIManager().btn_ExpandCollapsePricePlanTabTool_Click(VistaarExtjs.getCmp("btnExpandCollpseToolBar"));
        }

        var obj_MenuViolation = Ext.getCmp("menuBestPractices");
        var l_btnpractice = Ext.ComponentQuery.query('button[id=btnBestPractices]')[0];

        l_xPosition = l_btnpractice.getX();
        l_yPostion = l_btnpractice.getY();
        l_width = l_btnpractice.getWidth();
        l_height = l_btnpractice.getHeight();

        if (m_PricePlanViolationObject == undefined) {
            m_PricePlanViolationObject = obj_MenuViolation;
            obj_MenuViolation.showAt(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6, l_yPostion + l_height - 5);
        } else {
            obj_MenuViolation.showAt(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6, l_yPostion + l_height - 5);
        }
        /**IPAD related changes**/
        obj_MenuViolation.setX(l_xPosition - ((obj_MenuViolation.width) / 2) + (l_width / 2) - 6);
        obj_MenuViolation.setY(l_yPostion + l_height - 5);
    };

    this.focusBestPracticeWindow = function() {
        var obj_MenuViolation = Ext.getCmp("menuBestPractices");
        obj_MenuViolation.focus();
    };
}
