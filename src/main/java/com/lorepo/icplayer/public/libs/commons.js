(function(e){var a={validateBoolean:function(a){return"True"===a},validateInteger:function(b){var c={isValid:!1,value:NaN};if(a.isStringEmpty(b))return c;b=parseInt(b,10);if(isNaN(b))return c;c.isValid=!0;c.value=b;return c},validatePositiveInteger:function(a){a=this.validateInteger(a);return!a.isValid?a:1>a.value?{isValid:!1}:a},validateIntegerInRange:function(a,c,d){a=this.validateInteger(a);if(!a.isValid)return a;d||(d=0);return a.value<d||a.value>c?{isValid:!1}:a},validateFloat:function(b,c){var d=
{isValid:!1,value:NaN,parsedValue:NaN};if(a.isStringEmpty(b))return d;var f=parseFloat(b);if(isNaN(f))return d;c||(c=2);d.isValid=!0;d.value=f.toFixed(c);d.parsedValue=parseFloat(d.value);return d},validateFloatInRange:function(a,c,d,f){f||(f=2);a=this.validateFloat(a,f);if(!a.isValid)return a;d||(d=0);d=parseFloat(d.toFixed(f));c=parseFloat(c.toFixed(f));return a.value<d||a.value>c?{isValid:!1}:a},validateOption:function(a,c){for(var d in a)if(Object.prototype.hasOwnProperty.call(a,d)&&d===c)return a[d];
return a[a.DEFAULT]},validateColor:function(a,c){c||(c="#FFFFFF");if(!a)return{isValid:!1,color:c};var d=a.match(/#[0-9a-fA-F]+/),f;return(f=(f=!d||null===d||1!=d.length)||7!=d[0].length)?{isValid:!1,color:c}:{isValid:!0,color:a}},isStringEmpty:function(a){return void 0===a||""===a},isStringWithPrefixEmpty:function(b,c){return a.isStringEmpty(b)?!0:b===c},isArrayElementEmpty:function(b){if(!b)return!0;for(var c in b)if(Object.prototype.hasOwnProperty.call(b,c)&&!a.isStringEmpty(b[c]))return!1;return!0},
isArrayEmpty:function(b){return!b?!0:1===b.length&&a.isArrayElementEmpty(b[0])},removeDuplicatesFromArray:function(a){if(0===a.length)return[];for(var c=[],d=0;d<a.length-1;d++)a[d+1]!==a[d]&&c.push(a[d]);c.push(a[a.length-1]);return c}};e.ModelValidationUtils=a})(window);(function(e){e.LoadingScreen={screens:[],create:function(a){if(a){var a=$(a),b=a.width(),c=a.height(),d=Math.floor(1E3*Math.random())+"-"+Math.floor(1E3*Math.random()),f=$(document.createElement("img"));f.attr({src:"http://www.lorepo.com/media/images/loading.gif",alt:"Loading...",id:d,position:"absolute",display:"none",border:0,padding:0,margin:0});a.append(f);f.show();f.css({top:(c-f.height())/2+"px",left:(b-f.width())/2+"px"}).hide();this.screens.push({id:d,$element:f,counter:0});return d}},getScreen:function(a){for(var b=
0,c=this.screens.length;b<c;b++)if(this.screens[b].id===a)return b;return-1},show:function(a){a=this.getScreen(a);-1!==a&&(this.screens[a].counter++,this.screens[a].$element.show())},hide:function(a){a=this.getScreen(a);-1!==a&&(0<this.screens[a].counter&&this.screens[a].counter--,0===this.screens[a].counter&&this.screens[a].$element.hide())}}})(window);(function(e){e.DOMOperationsUtils={getOuterDimensions:function(a){a=$(a);return{border:{top:parseInt(a.css("border-top-width"),10),bottom:parseInt(a.css("border-bottom-width"),10),left:parseInt(a.css("border-left-width"),10),right:parseInt(a.css("border-right-width"),10)},margin:{top:parseInt(a.css("margin-top"),10),bottom:parseInt(a.css("margin-bottom"),10),left:parseInt(a.css("margin-left"),10),right:parseInt(a.css("margin-right"),10)},padding:{top:parseInt(a.css("padding-top"),10),bottom:parseInt(a.css("padding-bottom"),
10),left:parseInt(a.css("padding-left"),10),right:parseInt(a.css("padding-right"),10)}}},calculateOuterDistances:function(a){var b=a.border.top+a.border.bottom,b=b+(a.margin.top+a.margin.bottom),b=b+(a.padding.top+a.padding.bottom),c=a.border.left+a.border.right,c=c+(a.margin.left+a.margin.right),c=c+(a.padding.left+a.padding.right);return{vertical:b,horizontal:c}},calculateReducedSize:function(a,b){var c=DOMOperationsUtils.getOuterDimensions(b),c=DOMOperationsUtils.calculateOuterDistances(c);return{width:$(a).width()-
c.horizontal,height:$(a).height()-c.vertical}},setReducedSize:function(a,b){var c=DOMOperationsUtils.calculateReducedSize(a,b);$(b).css({width:c.width+"px",height:c.height+"px"});return c},showErrorMessage:function(a,b,c){$(a).html(b[c])},getResourceFullPath:function(a,b){return!a||!b?void 0:a.getStaticFilesPath()+b}}})(window);(function(e){e.Serialization={serialize:function(a){if(a){var b="";$.each(a,function(a,d){var f=typeof d;if("object"===f&&$.isArray(d)){var f="array",e="";$.each(d,function(a){e+=this+"-"+typeof d[a]+","});d=e=e.slice(0,-1)}b+="["+a+":"+f+":"+d+"]"});return b}},deserialize:function(a){if(a){var b={};if(a=a.match(/[\w]+:[\w-]+:[\w,.\- ]+/g)){for(var c=0;c<a.length;c++){var d=a[c].split(":");b[d[0]]=this.convert(d[2],d[1])}return b}}},convert:function(a,b){if(a&&b)switch(b){case "string":return a;case "number":return this.isInteger(a)?
parseInt(a):parseFloat(a);case "boolean":return"true"==a;case "array":return this.convertArray(a);default:return"This type of value is unrecognized."}},convertArray:function(a){for(var a=a.split(","),b=[],c=0;c<a.length;c++){var d=a[c].split("-");b.push(this.convert(d[0].trim(),d[1]))}return b},isInteger:function(a){return 0===a%1&&null!=a}}})(window);(function(e){e.Watermark={defaultOptions:{size:100,opacity:1,color:"#000000"},validateOptions:function(a){if(!a)return $.extend({},this.defaultOptions);var b=$.extend({},a);ModelValidationUtils.validatePositiveInteger(a.size).isValid||(b.size=this.defaultOptions.size);ModelValidationUtils.validateFloatInRange(a.opacity,1,0,2).isValid||(b.opacity=this.defaultOptions.opacity);ModelValidationUtils.validateColor(a.color,this.defaultOptions.color).isValid||(b.color=this.defaultOptions.color);return b},
draw:function(a,b){var c=$(a),d=$(document.createElement("canvas"));c.html(d);b=this.validateOptions(b);d.attr({width:b.size,height:b.size});d.rotateCanvas({x:b.size/2,y:b.size/2,angle:90}).drawArc({strokeWidth:1,strokeStyle:b.color,fillStyle:b.color,x:b.size/2,y:b.size/2,radius:b.size/2-1,opacity:b.opacity}).drawLine({strokeWidth:1,strokeStyle:"#FFF",fillStyle:"#FFF",rounded:!0,x1:b.size/2,y1:0.17*b.size,x2:b.size-0.2*b.size,y2:b.size-0.33*b.size,x3:0.2*b.size,y3:b.size-0.33*b.size,x4:b.size/2,y4:0.17*
b.size,opacity:b.opacity})}}})(window);(function(e){e.Helpers={splitLines:function(a){return a.split(/[\n\r]+/)},alertErrorMessage:function(a,b){var c=b+"\n\n";a.name&&(c+="["+a.name+"] ");c+=a.message?a.message:a;alert(c)}}})(window);(function(e){e.Commands={dispatch:function(a,b,c,d){var f,e;for(e in a)Object.prototype.hasOwnProperty.call(a,e)&&e.toLowerCase()===b&&a[e]&&(f=a[e].call(d,c));return f}};e.CommandsQueueFactory={create:function(a){return new e.CommandsQueue(a)}};e.CommandsQueueTask=function(a,b){this.name=a;this.params=b};e.CommandsQueue=function(a){this.module=a;this.queue=[]};e.CommandsQueue.prototype.addTask=function(a,b){var c=new e.CommandsQueueTask(a,b);this.queue.push(c)};e.CommandsQueue.prototype.getTask=
function(){return this.isQueueEmpty()?null:this.queue.splice(0,1)[0]};e.CommandsQueue.prototype.getAllTasks=function(){return this.queue};e.CommandsQueue.prototype.executeTask=function(){var a=this.getTask();a&&this.module.executeCommand(a.name.toLowerCase(),a.params)};e.CommandsQueue.prototype.executeAllTasks=function(){for(;!this.isQueueEmpty();)this.executeTask()};e.CommandsQueue.prototype.getTasksCount=function(){return this.queue.length};e.CommandsQueue.prototype.isQueueEmpty=function(){return 0===
this.queue.length}})(window);(function(e){e.ImageViewer={validateSound:function(a){var b=[];if(a&&$.isArray(a))for(var c=0;c<a.length;c++){var d=ModelValidationUtils.isStringWithPrefixEmpty(a[c]["MP3 sound"],"/file/"),e=ModelValidationUtils.isStringWithPrefixEmpty(a[c]["AAC sound"],"/file/"),g=ModelValidationUtils.isStringWithPrefixEmpty(a[c]["OGG sound"],"/file/");b.push({AAC:e?"":a[c]["AAC sound"],OGG:g?"":a[c]["OGG sound"],MP3:d?"":a[c]["MP3 sound"],isEmpty:d&&e&&g})}return{sounds:b}},loadSounds:function(a,b){var c=[];if(!buzz.isSupported()||
!a||!b)return c;for(var d=0;d<b;d++)d>a.length-1||a[d].isEmpty?c[d]=null:(c[d]=""!==a[d].MP3&&buzz.isMP3Supported()?new buzz.sound(a[d].MP3):""!==a[d].OGG&&buzz.isOGGSupported()?new buzz.sound(a[d].OGG):new buzz.sound(a[d].AAC),c[d].load());return c},convertFramesList:function(a,b,c){if(ModelValidationUtils.isStringEmpty(a))return{isError:!0,errorCode:"FL01"};var d=a.match(/[0-9a-zA-Z,-]+/);if(null===d||a.length!==d[0].length)return{isError:!0,errorCode:"FL02"};for(var d=[],a=a.split(","),e=0;e<a.length;e++){if(ModelValidationUtils.isStringEmpty(a[e]))return{isError:!0,
errorCode:"FL04"};if(-1!==a[e].search("-")){var g=a[e].split("-")[1],h=ModelValidationUtils.validateIntegerInRange(g,c,b);if(!h.isValid)return{isError:!0,errorCode:"FL05"};var i=a[e].split("-")[0],g=ModelValidationUtils.validateIntegerInRange(i,g.value,b);if(!g.isValid||g.value>h.value)return{isError:!0,errorCode:"FL05"};for(g=g.value;g<=h.value;g++)d.push(g)}else{h=ModelValidationUtils.validateIntegerInRange(a[e],c,b);if(!h.isValid)return{isError:!0,errorCode:"FL03"};d.push(h.value)}}d.sort();d=
ModelValidationUtils.removeDuplicatesFromArray(d);return{isError:!1,list:d}}}})(window);
/**
 * Lorepo Addons Commons library
 * @version 1.6.10
 * Components:
 * - Model Validation Utils
 * - Loading Screen
 * - DOM Operations
 * - States Serialization
 * - Watermark
 * - Commands
 * - Image Viewer (partial)
 * - Helpers
 */