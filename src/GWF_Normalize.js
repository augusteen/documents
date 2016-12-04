importPackage(org.json);
importPackage(java.lang);
importPackage(java.io);
importPackage(java.util);

/**
 * @module GWF_Normalize
 */

/**
 * GWF_Normalize function to convert the Price Plan document to Normalized structure that will be inputed to BRMS
 * @function
 * @memberof module:GWF_Normalize
 * @param {object}  structureObject       Price Plan structured object
 * @param {object}  docProvider           Document Provider
 * @param {object}  userConnInfo          User connection info
 * @param {Boolean} isPermissionCheckOnly Price Plan Permission check 
 */
function GWF_Normalize(structureObject, docProvider, userConnInfo, isPermissionCheckOnly){
	println("GWF_Normalize Start");
	
	
	if(isPermissionCheckOnly != undefined){
		if(isPermissionCheckOnly == true){
			var normalizeResult = '[{"Level" : "Summary","Summary" : "Summary","isPermissionCheckOnly" : true}]';
			return normalizeResult;
		}
	}
	
	var startTime = new Date();
	//CustomeToTemplate
	var transObj = new transformBADataStructure();
	var secondaryKeyMap = new JSONObject();
	secondaryKeyMap.put("Sizes", "SizeMemberCode");
	secondaryKeyMap.put("Channels", "ChannelMemberCode");
	secondaryKeyMap.put("TimeLines", "TimeMemberCode");
	secondaryKeyMap.put("Version", "VersionMemberCode");
	secondaryKeyMap.put("Exclusions", "ExclTypeMemberCode");
	var structureKeys = new JSONArray();
	structureKeys.put("DealContainer");
	structureKeys.put("PricePlan");

	transObj.customToTemplate(structureObject, secondaryKeyMap, structureKeys);
	
	var dealContainerJSON = structureObject.get("DealContainer");
	var pricePlanJSON = structureObject.get("PricePlan");
	
	var ppSizes = pricePlanJSON.get("Sizes");
	var priceStructureJSON = new JSONObject();
	priceStructureJSON.put("Facts_Data", new JSONObject());
	priceStructureJSON.put("scope", structureObject.get("scope"));
	
	//Fetching External Attributes
	var geographyCode = structureObject.get("scope").get("Geography");
	var time = structureObject.get("scope").get("Time");
	var productCode = structureObject.get("scope").get("Product");
	var inputJSON = new JSONObject();
	inputJSON.put("scope", new JSONObject());
	inputJSON.get("scope").put("Geography Code", geographyCode);
	inputJSON.get("scope").put("Product Code", productCode);
	inputJSON.get("scope").put("Time", time);

	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize Get Call : Execution Time (milliseconds) : " + executionTime);
	
	var l_start = new Date();
	var l_loadAddOnPSProcessingDataObj = new LoadAddOnPSProcessingData();
	//println("userConnInfo >> " +userConnInfo);
	l_loadAddOnPSProcessingDataObj.init(inputJSON, docProvider, userConnInfo);
	var l_endTime = new Date();
	var l_executionTime = l_endTime - l_start;
	println("#### GWF_Normalize LoadAddOnPSProcessingData Init Call : Execution Time (milliseconds) : " + l_executionTime);
	
	var l_start = new Date();
	var onYearLevelAttribute = l_loadAddOnPSProcessingDataObj.getGlobalAttributes();
	var l_endTime = new Date();
	var l_executionTime = l_endTime - l_start;
	println("#### GWF_Normalize LoadAddOnPSProcessingData getGlobalAttributes Call : Execution Time (milliseconds) : " + l_executionTime);
	
	var startTime = new Date();
	getAttributesForYearLvl(onYearLevelAttribute, dealContainerJSON);
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize getAttributesForYearLvl Call : Execution Time (milliseconds) : " + executionTime);
	
	priceStructureJSON.get("Facts_Data").put("Data", dealContainerJSON.get("Data"));
	
	var sizeArr = new JSONArray();
	var dcSizes = dealContainerJSON.get("Sizes");
	
	var startTime = new Date();
	//Processing PricePlan JSON to get channel and data information.
	var channelDealArr = new JSONArray();
	var outputArr = new JSONArray();
	for(var sz1=0; sz1<ppSizes.length(); sz1++){
		for(var ppc=0; ppc<ppSizes.get(sz1).get("Channels").length(); ppc++){
			var chDealLevel = ppSizes.get(sz1).get("Channels").get(ppc).get("DealLevel");
			var channels = ppSizes.get(sz1).get("Channels").get(ppc).get("Channels");
			
			for(var chDeal=0; chDeal<chDealLevel.length(); chDeal++){
				var isDealExist = false;
				chDealLevel.get(chDeal).get("Data").put("Channels", channels);
				/*
				for(var c=0; c<channelDealArr.length(); c++){
					var existingDealID = channelDealArr.get(c).get("Data").get("DealID");
					var currentDealID = chDealLevel.get(chDeal).get("Data").get("DealID");
					if(existingDealID == currentDealID){
						channelDealArr.get(c).get("Data").put("Channels", "ALL");
						isDealExist = true;
						break;
					}
				}
				*/
				//if(isDealExist == false){
					channelDealArr.put(chDealLevel.get(chDeal));
					//outputArr.put(chDealLevel.get(chDeal));
					outputArr.put(new org.json.JSONObject((chDealLevel.get(chDeal)).toString()));
					//new JSONObject((channelDealArr.get(chd)).toString());
				//}
			}
		}
	}
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize First For loop Call : Execution Time (milliseconds) : " + executionTime);
	

	var startTime = new Date();
	var stime1 =0;
	var stime2 =0;
	for(var sz=0; sz<dcSizes.length(); sz++){
		var sizeData = dcSizes.get(sz).get("Data");
		var sizes = dcSizes.get(sz).get("Sizes");
		var sizeTimeLines = dcSizes.get(sz).get("TimeLines");

		//Loop over TimeLines
		var sizeTimeLinesLen = sizeTimeLines.length();
		for(var stl=0; stl<sizeTimeLinesLen; stl++){
			var sizeTimeMemberCode = sizeTimeLines.get(stl).get("TimeLines");
			var channelArr = new JSONArray();
			var timeLineJSON = new JSONObject();
			timeLineJSON.put("TimeLines", sizeTimeMemberCode);
			timeLineJSON.put("Version", sizeTimeLines.get(stl).get("Version"));
			timeLineJSON.put("Data", sizeData);
			timeLineJSON.put("DealLevel", new JSONArray());
			timeLineJSON.put("Size", sizes);
			
			var sizeDealLevel = dcSizes.get(sz).get("DealLevel");
			var sizeDealLeveLen = sizeDealLevel.length();
				var index = 0;
				var outputArrLen = outputArr.length();
				for(var chd=0; chd<outputArrLen; chd++){
					var dealID = outputArr.get(chd).get("Data").get("DealID");
					for(var sdl=0; sdl<sizeDealLeveLen; sdl++){
					if(sizeDealLevel.get(sdl).get("DealLevel") != "Allocated PG"){
						var dealTimeLines = sizeDealLevel.get(sdl).get("TimeLines");
						var dealData = sizeDealLevel.get(sdl).get("Data");
						if (dealData.has("IsDeleted") && !dealData.isNull("IsDeleted") && dealData.get("IsDeleted") == true) //ET588
						{
							println("skiped deal ID "+dealID);
							continue;
						} 
	
						if(dealData.get("DealID") == dealID){
							var channelValue = outputArr.get(chd).get("Data").get("Channels");
							sizeDealLevel.get(sdl).get("Data").put("Channels", channelValue);
							var dataValue = sizeDealLevel.get(sdl).get("Data");
							var timeLineValue = sizeDealLevel.get(sdl).get("TimeLines");
							channelDealArr.get(chd).put("Data", dataValue);
							channelDealArr.get(chd).put("TimeLines", timeLineValue);
							
							var verArr = outputArr.get(chd).get("Version");
							for(var v=0; v<verArr.length(); v++){
								verArr.get(v).put("Data", new JSONObject());
								
								if(verArr.get(v).get("Version") == "Proposed"){
									var verTimelineArr = verArr.get(v).get("TimeLines");
									var starttime1 = new Date();
									for(var vt=0; vt<verTimelineArr.length(); vt++){
										var channelTimeline = verTimelineArr.get(vt).get("TimeLines");
										if(sizeTimeMemberCode == channelTimeline){
											var dealMixPerc = verTimelineArr.get(vt).get("Data").get("Deal_Mix_PERC");
											channelDealArr.get(chd).get("Data").put("Deal_Mix_PERC", dealMixPerc);
										}
									}
									var endtime1 = new Date();
									var tTime1 = ((endtime1 - starttime1)/1000);
									stime1 += tTime1;
								}
								
							}
							
							var starttime2 = new Date();
							//var strChannelDealArr = (channelDealArr.get(chd)).toString();
							for(var dtl=0; dtl<dealTimeLines.length(); dtl++){
								var dealTimeMemberCode = dealTimeLines.get(dtl).get("TimeLines");

								if(sizeTimeMemberCode == dealTimeMemberCode){
									//var channelDealObj = new JSONObject(channelDealArr.get(chd), JSONObject.getNames(channelDealArr.get(chd)));
									var channelDealObj =  new JSONObject((channelDealArr.get(chd)).toString());
									timeLineJSON.get("DealLevel").put(channelDealObj);
									break;
								}
							}
							var endtime2 = new Date();
							var tTime2 = ((endtime2 - starttime2)/1000);
							stime2 += tTime2;
							
							break;
						}
					}
					}
				}
			sizeArr.put(timeLineJSON);
		}	
	}
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize Second For loop Call : stime1 : " + stime1);
	println("#### GWF_Normalize Second For loop Call : stime2 : " + stime2);
	println("#### GWF_Normalize Second For loop Call : Execution Time (milliseconds) : " + executionTime);
	
	/*
	var fileToWrite = new File("/home/cloud_es1/nshetye/workflow/sizeArr.json");
	var FW = new FileWriter(fileToWrite);
	FW.write(sizeArr);
	FW.close();
	*/
	
	var startTime = new Date();
	priceStructureJSON.get("Facts_Data").put("Size", sizeArr);
	priceStructureJSON.get("Facts_Data").put("Version", new JSONArray());
	
	//Creating Fact Version arr.
	var factsVersionJSON = new JSONObject();
	factsVersionJSON.put("Data", new JSONObject());
	factsVersionJSON.put("Version", "Current");
	priceStructureJSON.get("Facts_Data").get("Version").put(factsVersionJSON);
	var factsVersionJSON = new JSONObject();
	factsVersionJSON.put("Data", new JSONObject());
	factsVersionJSON.put("Version", "Proposed");
	priceStructureJSON.get("Facts_Data").get("Version").put(factsVersionJSON);
	
	priceStructureJSON.get("Facts_Data").get("Data").put("isPermissionCheckOnly", isPermissionCheckOnly);
	
	//Altering PriceStructureJSON
	var psFacts = priceStructureJSON.get("Facts_Data");
	var psSize = new JSONArray((psFacts.get("Size")).toString());
	
	var psLength = psSize.length();
	var minNetFOB="", minNetList="";
	var totalRAB=0, totalNetFOB=0, dealCount=0;
	
	var channelJSON = new JSONArray();
	channelJSON.put("ON");channelJSON.put("OFF");
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize JSON Edit Call : Execution Time (milliseconds) : " + executionTime);
	
	var startTime = new Date();
	
	for(var ch=0; ch<channelJSON.length(); ch++){
		for(var ps=0; ps < psLength; ps++){
			//External Attribute Call
			var timeline = psSize.get(ps).get("TimeLines");
			var size = psSize.get(ps).get("Size");
			var month = getMonthValue(timeline);
			var sizeData = psSize.get(ps).get("Data");

			var l_sizeMonthAttributes = l_loadAddOnPSProcessingDataObj.getSizeLevelAttributes(size, timeline);
			var onSizeLevelAttributeJSON = new JSONObject(l_sizeMonthAttributes);

			for(var attributeItr = onSizeLevelAttributeJSON.keys(); attributeItr.hasNext();) {
				var factType = attributeItr.next();
				sizeData.put(factType, onSizeLevelAttributeJSON.get(factType));
			}
			//getAttributesForMonthLvl(onSizeMonthLevelAttribute, dealContainerJSON);
			//..
		
			var psDeal = psSize.get(ps).get("DealLevel");
			//var timeline = psSize.get(ps).get("TimeLines");
			var psdLength = psDeal.length();
			for(var psd=0; psd<psdLength; psd++){
				var dealData = psDeal.get(psd).get("Data");
				dealData.put("Month", timeline);
				if(psDeal.get(psd).has("TimeLines")){
					var timelineArr = psDeal.get(psd).get("TimeLines");
					for(var tl=0; tl < timelineArr.length(); tl++){
						var timelineValue = timelineArr.get(tl).get("TimeLines");
						if(timeline == timelineValue){
							var tlVersion = timelineArr.get(tl).get("Version");
							psDeal.get(psd).put("Version", tlVersion);
							break;
						}
					}
				psDeal.get(psd).remove("TimeLines");
				}
				
				if(dealData.get("Channels") == channelJSON.get(ch)){
					//Modify priceStructureJSON for adding MinCurrentNetFOB and MinCurrentNetList
					var dealVersion = psDeal.get(psd).get("Version");
					for(var dlv=0; dlv<dealVersion.length(); dlv++){
						var versionType = dealVersion.get(dlv).get("Version");
						if(versionType == "Current"){
							var versionData = dealVersion.get(dlv).get("Data");
							var currentNetFOB = versionData.get("Net_FOB");
							var currentNetList = versionData.get("Net_List_ATAX");
							
							if(currentNetFOB == ""){
								currentNetFOB = 0;
							}
							
							if(currentNetList == ""){
								currentNetList = 0;
							}
							
							if(minNetFOB != ""){
								if(currentNetFOB < minNetFOB){
									minNetFOB = currentNetFOB;
								}
							}else{
								minNetFOB = currentNetFOB;
							}
							if(minNetList != ""){
								if(currentNetList < minNetList){
									minNetList = currentNetList;
								}
							}else{
								minNetList = currentNetList;
							}
						}else{
							//Calculate AvgRAB attribute
							var versionData = dealVersion.get(dlv).get("Data");
							var RAB = versionData.get("RAB");
							var Net_FOB = versionData.get("Net_FOB");
							
							totalRAB = Number(totalRAB) + Number(RAB);
							totalNetFOB = Number(totalNetFOB) + Number(Net_FOB);
							dealCount = dealCount + 1;
						}
					}
				}
			}
		}
		psFacts.get("Data").get(channelJSON.get(ch)).put("MinCurrentNetFOB", minNetFOB);
		psFacts.get("Data").get(channelJSON.get(ch)).put("MinCurrentNetList", minNetList);
	}
	psFacts.remove("Size");
	psFacts.put("Size",psSize);
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize Third For loop Call : Execution Time (milliseconds) : " + executionTime);
	
	//var avgRAB = (Number(totalRAB) / Number(dealCount));
	//var avgNetFOB = (Number(totalNetFOB) / Number(dealCount));
	
	//psFacts.get("Data").put("AvgRAB", avgRAB);
	//psFacts.get("Data").put("AvgYearNetFOB", avgNetFOB);
	//psFacts.get("Data").put("MinCurrentNetFOB", minNetFOB);
	//psFacts.get("Data").put("MinCurrentNetList", minNetList);

	var startTime = new Date();
	println("Normalize_Main Called");
	var result = Normalize_Main(priceStructureJSON);
	
	var endTime = new Date();
	var executionTime = endTime - startTime;
	println("#### GWF_Normalize Normalize_Main Call : Execution Time (milliseconds) : " + executionTime);
	/*
	var fileToWrite = new File("/home/cloud_es1/nshetye/workflow/target.out");
	var FW = new FileWriter(fileToWrite);
	FW.write(priceStructureJSON);
	FW.close();
	
	
	var fileToWrite = new File("/home/cloud_es1/nshetye/workflow/normalize.out");
	var FW = new FileWriter(fileToWrite);
	FW.write(result);
	FW.close();
	
	
	var fileToWrite = new File("/home/cloud_es1/nshetye/workflow/outputArr.json");
	var FW = new FileWriter(fileToWrite);
	FW.write(outputArr);
	FW.close();
	*/
	return result;
}

function getAttributesForYearLvl(onYearLevelAttribute, dealContainerJSON){
	var attributeJSON = new JSONObject(onYearLevelAttribute);
	for(var attributeItr = attributeJSON.keys(); attributeItr.hasNext();) {
		var factType = attributeItr.next();
		dealContainerJSON.get("Data").put(factType, attributeJSON.get(factType));
	}
}

function getAttributesForMonthLvl(onSizeLevelAttribute, dealContainerJSON){
	var onSizeLevelAttributeJSON = new JSONObject(onSizeLevelAttribute);
	
	var dcSizes = dealContainerJSON.get("Sizes");
	for(var sz=0; sz<dcSizes.length(); sz++){
		var size = dcSizes.get(sz).get("Sizes");
		var sizeData = dcSizes.get(sz).get("Data");
		for(var attributeItr = onSizeLevelAttributeJSON.keys(); attributeItr.hasNext();) {
			var factType = attributeItr.next();
			if(size == onSizeLevelAttributeJSON.get(factType)){
				sizeData.put(factType, onSizeLevelAttributeJSON.get(factType));
			}
		}
		/*
		var sizeDealLevel = dcSizes.get(sz).get("DealLevel");
		for(var dl=0; dl<sizeDealLevel.length(); dl++){
			var dealData = sizeDealLevel.get(dl).get("Data");
			for(var attributeItr = monthArrttributeJSON.keys(); attributeItr.hasNext();) {
				var factType = attributeItr.next();
				dealData.put(factType, monthArrttributeJSON.get(factType));
			}
		}
		*/
	}
}

function getMonthValue(date){
	var dateArr = date.split("");
	
	var months = new JSONArray();
	months.put("Jan");months.put("Feb");months.put("Mar");months.put("Apr");months.put("May");months.put("Jun");months.put("Jul");months.put("Aug");
	months.put("Sept");months.put("Oct");months.put("Nov");months.put("Dec");
	
	var actualDate = dateArr[1] + dateArr[2] + dateArr[3] + dateArr[4] + "/" + dateArr[5] + dateArr[6] + "/" + dateArr[7] + dateArr[8];
	var dateObj = new Date(actualDate);
    var monthNumber = dateObj.getMonth();
	var monthName = months.get(monthNumber);
	return monthName;
}
