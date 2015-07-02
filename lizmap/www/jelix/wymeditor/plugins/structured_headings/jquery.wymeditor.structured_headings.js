"use strict";if(typeof(WYMeditor)==='undefined'){WYMeditor={};WYMeditor.HEADING_ELEMENTS=["h1","h2","h3","h4","h5","h6"];WYMeditor.KEY={BACKSPACE:8,ENTER:13,DELETE:46}}if(typeof(WYMeditor.editor)==='undefined'){WYMeditor.editor={};WYMeditor.editor.prototype={}}WYMeditor.STRUCTURED_HEADINGS_POLYFILL_REQUIRED=jQuery.browser.msie&&parseInt(jQuery.browser.version,10)<8.0;WYMeditor.STRUCTURED_HEADINGS_START_NODE_CLASS='wym-structured-headings-start';WYMeditor.STRUCTURED_HEADINGS_LEVEL_CLASSES=['wym-structured-heading-level1','wym-structured-heading-level2','wym-structured-heading-level3','wym-structured-heading-level4','wym-structured-heading-level5','wym-structured-heading-level6'];WYMeditor.STRUCTURED_HEADINGS_NUMBERING_SPAN_CLASS='wym-structured-heading-numbering';WYMeditor.STRUCTURED_HEADINGS_POTENTIAL_HEADING_MODIFICATION_KEYS=[WYMeditor.KEY.BACKSPACE,WYMeditor.KEY.DELETE,WYMeditor.KEY.ENTER];function getHeadingLevel(heading){return parseInt(heading.nodeName.slice(-1),10)}function StructuredHeadingsManager(options,wym){var shm=this;options=jQuery.extend({headingIndentToolSelector:"li.wym_tools_indent a",headingOutdentToolSelector:"li.wym_tools_outdent a",enableFixHeadingStructureButton:false,fixHeadingStructureButtonHtml:String()+'<li class="wym_tools_fix_heading_structure">'+'<a name="fix_heading_structure" href="#" title="Fix Heading Structure" '+'style="background-image: '+"url('"+wym._options.basePath+"plugins/structured_headings/ruler_arrow.png')"+'">'+'Fix Heading Structure'+'</a>'+'</li>',fixHeadingStructureSelector:"li.wym_tools_fix_heading_structure a",headingContainerPanelHtml:String()+'<li class="wym_containers_heading">'+'<a href="#" name="HEADING">Heading</a>'+'</li>',headingContainerPanelSelector:"li.wym_containers_heading a",highestAllowableHeadingLevel:1,lowestAllowableHeadingLevel:6},options);shm._headingElements=WYMeditor.HEADING_ELEMENTS.slice(options.highestAllowableHeadingLevel-1,options.lowestAllowableHeadingLevel);shm._limitedHeadingSel=shm._headingElements.join(", ");shm._fullHeadingSel=WYMeditor.HEADING_ELEMENTS.join(", ");shm._options=options;shm._wym=wym;shm.init()}StructuredHeadingsManager.prototype.init=function(){var shm=this;shm.createUI();shm.bindEvents();shm.addCssStylesheet();if(WYMeditor.STRUCTURED_HEADINGS_POLYFILL_REQUIRED){shm.enableIE7Polyfill()}};StructuredHeadingsManager.prototype.createUI=function(){var shm=this,wym=shm._wym,$tools=jQuery(wym._box).find(wym._options.toolsSelector+wym._options.toolsListSelector),$containerItems,$containerLink,i;if(shm._options.enableFixHeadingStructureButton){$tools.append(shm._options.fixHeadingStructureButtonHtml)}$containerItems=jQuery(wym._box).find(wym._options.containersSelector).find('li');for(i=0;i<$containerItems.length;++i){$containerLink=$containerItems.eq(i).find('a');if(jQuery.inArray($containerLink[0].name.toLowerCase(),WYMeditor.HEADING_ELEMENTS)>-1){$containerItems.eq(i).remove()}}$containerItems.eq(0).after(shm._options.headingContainerPanelHtml)};StructuredHeadingsManager.prototype.bindEvents=function(){var shm=this,wym=shm._wym,$box=jQuery(wym._box),sel;$box.find(shm._options.headingOutdentToolSelector).click(function(){sel=wym.selection();shm.changeSelectedHeadingsLevel(sel,"up")});$box.find(shm._options.headingIndentToolSelector).click(function(){sel=wym.selection();shm.changeSelectedHeadingsLevel(sel,"down")});if(shm._options.enableFixHeadingStructureButton){$box.find(shm._options.fixHeadingStructureSelector).click(function(){shm.fixHeadingStructure()})}$box.find(shm._options.headingContainerPanelSelector).click(function(){shm.switchToHeading(wym.mainContainer())})};StructuredHeadingsManager.prototype.addCssStylesheet=function(){var shm=this,wym=shm._wym,iframeHead=jQuery(wym._doc).find('head')[0],stylesheetHref,cssLink,cssRequest;cssLink=wym._doc.createElement('link');cssLink.rel='stylesheet';cssLink.type='text/css';if(WYMeditor.STRUCTURED_HEADINGS_POLYFILL_REQUIRED){stylesheetHref='/plugins/structured_headings/'+'structured_headings_ie7_editor.css';cssLink.href='../..'+stylesheetHref;iframeHead.appendChild(cssLink);stylesheetHref=stylesheetHref.replace(/editor.css$/,'user.css')}else{stylesheetHref='/plugins/structured_headings/structured_headings.css';cssLink.href='../..'+stylesheetHref;iframeHead.appendChild(cssLink)}cssRequest=new XMLHttpRequest();cssRequest.open('GET',wym._options.basePath+stylesheetHref,false);cssRequest.send('');WYMeditor.structuredHeadingsCSS=cssRequest.responseText};StructuredHeadingsManager.prototype.canRaiseHeadingLevel=function(heading){var shm=this,headingLevel=getHeadingLevel(heading),headingLevelDifference,nextHeading,nextHeadingLevel;if(headingLevel===shm._options.highestAllowableHeadingLevel){return false}nextHeading=jQuery(heading).nextAll(shm._fullHeadingSel)[0];if(nextHeading){nextHeadingLevel=getHeadingLevel(nextHeading);headingLevelDifference=headingLevel-nextHeadingLevel;if(headingLevelDifference<0){return false}}return true};StructuredHeadingsManager.prototype.canLowerHeadingLevel=function(heading){var shm=this,headingLevel=getHeadingLevel(heading),headingLevelDifference,prevHeading,prevHeadingLevel;if(headingLevel===shm._options.lowestAllowableHeadingLevel){return false}prevHeading=jQuery(heading).prevAll(shm._fullHeadingSel)[0];if(prevHeading){prevHeadingLevel=getHeadingLevel(prevHeading);headingLevelDifference=prevHeadingLevel-headingLevel;if(headingLevelDifference<0){return false}}return true};StructuredHeadingsManager.prototype.changeSelectedHeadingsLevel=function(selection,upOrDown){var shm=this,wym=shm._wym,shouldRaise=(upOrDown==='up'),i,iStart=(shouldRaise?selection.rangeCount-1:0),iLimit=(shouldRaise?-1:selection.rangeCount),iterChange=(shouldRaise?-1:1),range,heading,headingList,j,jStart,jLimit,headingNodeFilter;headingNodeFilter=function(testNode){return jQuery(testNode).is(shm._fullHeadingSel)};for(i=iStart;i!==iLimit;i+=iterChange){range=selection.getRangeAt(i);if(range.collapsed){heading=wym.findUp(range.startContainer,WYMeditor.HEADING_ELEMENTS);shm.changeHeadingLevel(heading,upOrDown)}else{headingList=range.getNodes(false,headingNodeFilter);if(!headingList.length&&range.getNodes().length){headingList=[wym.findUp(range.getNodes()[0],WYMeditor.HEADING_ELEMENTS)]}jStart=(shouldRaise?headingList.length-1:0);jLimit=(shouldRaise?-1:headingList.length);for(j=jStart;j!==jLimit;j+=iterChange){shm.changeHeadingLevel(headingList[j],upOrDown)}}}};StructuredHeadingsManager.prototype.changeHeadingLevel=function(heading,upOrDown){var shm=this,wym=shm._wym,changeLevelUp=(upOrDown==="up"),levelAdjustment=(changeLevelUp?-1:1),headingLevel;if(!heading){return}headingLevel=getHeadingLevel(heading);if(changeLevelUp&&!shm.canRaiseHeadingLevel(heading)){return}if(!changeLevelUp&&!shm.canLowerHeadingLevel(heading)){return}wym.switchTo(heading,'h'+(headingLevel+levelAdjustment));if(WYMeditor.STRUCTURED_HEADINGS_POLYFILL_REQUIRED){shm.numberHeadingsIE7()}};StructuredHeadingsManager.prototype.switchToHeading=function(node){var shm=this,wym=shm._wym,$prevHeading;if(!node){return}$prevHeading=jQuery(node).prev(shm._fullHeadingSel);if($prevHeading.length){wym.switchTo(node,$prevHeading[0].nodeName)}else{wym.switchTo(node,'h'+shm._options.highestAllowableHeadingLevel)}if(WYMeditor.STRUCTURED_HEADINGS_POLYFILL_REQUIRED){shm.numberHeadingsIE7()}};StructuredHeadingsManager.prototype.fixHeadingStructure=function(){var shm=this,wym=shm._wym,$headings=wym.$body().find(shm._limitedHeadingSel),heading,headingLevel,prevHeadingLevel,i;if(!$headings.length){return}prevHeadingLevel=getHeadingLevel($headings[0]);for(i=1;i<$headings.length;++i){heading=$headings[i];headingLevel=getHeadingLevel(heading);if(headingLevel-prevHeadingLevel>1){wym.switchTo(heading,'h'+(prevHeadingLevel+1));++prevHeadingLevel}else{prevHeadingLevel=headingLevel}}};StructuredHeadingsManager.prototype.enableIE7Polyfill=function(){var shm=this,wym=shm._wym,$body=wym.$body(),$containersPanelLinks=jQuery(wym._box).find(wym._options.containersSelector+' li > a'),prevHeadingTotal=0,prevSpanCharTotal=0;$body.keyup(function(evt){var headingTotal,spanCharTotal;if(jQuery.inArray(evt.which,WYMeditor.STRUCTURED_HEADINGS_POTENTIAL_HEADING_MODIFICATION_KEYS)>-1){headingTotal=$body.find(shm._limitedHeadingSel).length;spanCharTotal=0;$body.find('.'+WYMeditor.STRUCTURED_HEADINGS_NUMBERING_SPAN_CLASS).each(function(){var span=this;spanCharTotal+=span.innerHTML.length});if(headingTotal!==prevHeadingTotal||spanCharTotal!==prevSpanCharTotal){prevSpanCharTotal=shm.numberHeadingsIE7()}prevHeadingTotal=headingTotal}});$containersPanelLinks.click(function(){shm.numberHeadingsIE7()})};function numberHeadingsIE7(doc,addClass){doc=typeof doc!=='undefined'?doc:document;var $doc=jQuery(doc),$startNode=$doc.find('.'+WYMeditor.STRUCTURED_HEADINGS_START_NODE_CLASS),startHeadingLevel,headingSel=WYMeditor.HEADING_ELEMENTS.join(', '),$allHeadings,$heading,headingLabel,span,spanCharTotal=0,counters=[0,0,0,0,0,0],counterIndex,i,j;if(addClass){$startNode=$doc.find(headingSel);if($startNode.length){$startNode=$startNode.eq(0);$startNode.addClass(WYMeditor.STRUCTURED_HEADINGS_START_NODE_CLASS)}}if(!$startNode.length){return}startHeadingLevel=getHeadingLevel($startNode[0]);$allHeadings=$startNode.nextAll(headingSel).add($startNode);$doc.find('.'+WYMeditor.STRUCTURED_HEADINGS_NUMBERING_SPAN_CLASS).remove();for(i=0;i<$allHeadings.length;++i){$heading=$allHeadings.eq(i);counterIndex=getHeadingLevel($heading[0])-startHeadingLevel;if(counterIndex<0){break}++counters[counterIndex];headingLabel='';for(j=0;j<=counterIndex;++j){if(j===counterIndex){headingLabel+=counters[j]}else{headingLabel+=counters[j]+'.'}}if(addClass){$heading.addClass(WYMeditor.STRUCTURED_HEADINGS_LEVEL_CLASSES[counterIndex])}span=doc.createElement('span');span.innerHTML=headingLabel;span.className=WYMeditor.STRUCTURED_HEADINGS_NUMBERING_SPAN_CLASS;if(addClass){span.className+=' '+WYMeditor.EDITOR_ONLY_CLASS}$heading.prepend(span);spanCharTotal+=(counterIndex*2)+1;for(j=counterIndex+1;j<counters.length;++j){counters[j]=0}}return spanCharTotal}StructuredHeadingsManager.prototype.numberHeadingsIE7=function(){var shm=this;numberHeadingsIE7(shm._wym._doc,true)};WYMeditor.printStructuredHeadingsCSS=function(){WYMeditor.console.log(WYMeditor.structuredHeadingsCSS)};WYMeditor.editor.prototype.structuredHeadings=function(options){var wym=this,structuredHeadingsManager=new StructuredHeadingsManager(options,wym);wym.structuredHeadingsManager=structuredHeadingsManager;return structuredHeadingsManager};