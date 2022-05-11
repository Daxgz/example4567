if (self.CavalryLogger) { CavalryLogger.start_js_script(document.currentScript); }/*FB_PKG_DELIM*/ __d("BanzaiConsts",[],(function(a,b,c,d,e,f){a={SEND:"Banzai:SEND",OK:"Banzai:OK",ERROR:"Banzai:ERROR",SHUTDOWN:"Banzai:SHUTDOWN",BASIC:"basic",VITAL:"vital",BASIC_WAIT:6e4,BASIC_WAIT_COMET:2e3,VITAL_WAIT:1e3,BATCH_SIZE_LIMIT:64e3,EXPIRY:864e5,BATCH_TIMEOUT:1e4,LAST_STORAGE_FLUSH:"banzai:last_storage_flush",STORAGE_FLUSH_INTERVAL:12*60*6e4,POST_READY:0,POST_INFLIGHT:1,POST_SENT:2};b=a;f["default"]=b}),66); __d("BanzaiUtils",["BanzaiConsts","CurrentUser","FBLogger","WebSession","performanceAbsoluteNow"],(function(a,b,c,d,e,f){"use strict";var g,h,i={canSend:function(a){return a[2]>=(g||(g=b("performanceAbsoluteNow")))()-(h||(h=b("BanzaiConsts"))).EXPIRY},filterPost:function(a,c,d,e){if(e.overlimit)return!0;if(!e.sendMinimumOnePost&&a[4]+e.currentSize>(h||(h=b("BanzaiConsts"))).BATCH_SIZE_LIMIT)return!0;var f=a.__meta;if(f.status!=null&&f.status>=(h||(h=b("BanzaiConsts"))).POST_SENT||!i.canSend(a))return!1;if(f.status!=null&&f.status>=(h||(h=b("BanzaiConsts"))).POST_INFLIGHT)return!0;var g=f.compress!=null?f.compress:!0,j=(f.webSessionId!=null?f.webSessionId:"null")+(f.userID!=null?f.userID:"null")+(f.appID!=null?f.appID:"null")+(g?"compress":""),k=e.wadMap.get(j);k||(k={app_id:f.appID,needs_compression:g,posts:[],user:f.userID,webSessionId:f.webSessionId},e.wadMap.set(j,k),c.push(k));f.status=(h||(h=b("BanzaiConsts"))).POST_INFLIGHT;Array.isArray(k.posts)?k.posts.push(a):b("FBLogger")("banzai").mustfix("Posts were a string instead of array");d.push(a);e.currentSize+=a[4];e.currentSize>=(h||(h=b("BanzaiConsts"))).BATCH_SIZE_LIMIT&&(e.overlimit=!0);return e.keepRetryable&&Boolean(f.retry)},resetPostStatus:function(a){a.__meta.status=(h||(h=b("BanzaiConsts"))).POST_READY},retryPost:function(a,c,d){var e=a;e.__meta.status=(h||(h=b("BanzaiConsts"))).POST_READY;e[3]=(e[3]||0)+1;e.__meta.retry!==!0&&c>=400&&c<600&&d.push(a)},wrapData:function(a,c,d,e,f){d=[a,c,d,0,(a=f)!=null?a:c?JSON.stringify(c).length:0];d.__meta={appID:b("CurrentUser").getAppID(),retry:e===!0,status:(h||(h=b("BanzaiConsts"))).POST_READY,userID:b("CurrentUser").getPossiblyNondxUserID(),webSessionId:b("WebSession").getId()};return d}};e.exports=i}),null); __d("SetIdleTimeoutAcrossTransitions",["NavigationMetrics","cancelIdleCallback","clearTimeout","nullthrows","requestIdleCallbackAcrossTransitions","setTimeoutAcrossTransitions"],(function(a,b,c,d,e,f,g){"use strict";var h=!1,i=new Map();function b(a,b){if(h){var d=c("setTimeoutAcrossTransitions")(function(){var b=c("requestIdleCallbackAcrossTransitions")(function(){a(),i["delete"](b)});i.set(d,b)},b);return d}else return c("setTimeoutAcrossTransitions")(a,b)}function d(a){c("clearTimeout")(a),i.has(a)&&(c("cancelIdleCallback")(c("nullthrows")(i.get(a))),i["delete"](a))}c("NavigationMetrics").addRetroactiveListener(c("NavigationMetrics").Events.EVENT_OCCURRED,function(b,c){c.event==="all_pagelets_loaded"&&(h=!!a.requestIdleCallback)});g.start=b;g.clear=d}),98); __d("BanzaiStorage",["BanzaiConsts","BanzaiUtils","CurrentUser","FBJSON","SetIdleTimeoutAcrossTransitions","WebSession","WebStorage","WebStorageMutex","isInIframe","performanceAbsoluteNow"],(function(a,b,c,d,e,f){"use strict";var g,h,i,j="bz:",k=b("isInIframe")(),l,m=!1,n=null;function o(){var a="check_quota";try{var b=p();if(!b)return!1;b.setItem(a,a);b.removeItem(a);return!0}catch(a){return!1}}function p(){m||(m=!0,l=(g||(g=b("WebStorage"))).getLocalStorage());return l}a={flush:function(a){if(k)return;var c=p();if(c){n==null&&(n=parseInt(c.getItem((h||(h=b("BanzaiConsts"))).LAST_STORAGE_FLUSH),10));var d=n&&(i||(i=b("performanceAbsoluteNow")))()-n>=(h||(h=b("BanzaiConsts"))).STORAGE_FLUSH_INTERVAL;d&&a();(d||!n)&&(n=(i||(i=b("performanceAbsoluteNow")))(),(g||(g=b("WebStorage"))).setItemGuarded(c,(h||(h=b("BanzaiConsts"))).LAST_STORAGE_FLUSH,n.toString()))}},restore:function(a){if(k)return;var c=p();if(!c)return;var d=function(d){var e=[];for(var f=0;f<c.length;f++){var g=c.key(f);typeof g==="string"&&g.indexOf(j)===0&&g.indexOf("bz:__")!==0&&e.push(g)}e.forEach(function(d){var e=c.getItem(d);c.removeItem(d);if(e==null||e==="")return;d=b("FBJSON").parse(e);d.forEach(function(c){if(!c)return;var d=c.__meta=c.pop(),e=b("BanzaiUtils").canSend(c);if(!e)return;e=b("CurrentUser").getPossiblyNondxUserID();(d.userID===e||e==="0")&&(b("BanzaiUtils").resetPostStatus(c),a(c))})});d&&d.unlock()};o()?new(b("WebStorageMutex"))("banzai").lock(d):b("SetIdleTimeoutAcrossTransitions").start(d,0)},store:function(a){if(k)return;var c=p(),d=a.filter(function(a){return a.__meta.status!==(h||(h=b("BanzaiConsts"))).POST_SENT});if(!c||d.length<=0)return;d=d.map(function(a){return[a[0],a[1],a[2],a[3]||0,a[4],a.__meta]});a.splice(0,a.length);(g||(g=b("WebStorage"))).setItemGuarded(c,j+b("WebSession").getId()+"."+(i||(i=b("performanceAbsoluteNow")))(),b("FBJSON").stringify(d))}};e.exports=a}),null); __d("QueryString",[],(function(a,b,c,d,e,f){function g(a){var b=[];Object.keys(a).sort().forEach(function(c){var d=a[c];if(d===void 0)return;if(d===null){b.push(c);return}b.push(encodeURIComponent(c)+"="+encodeURIComponent(String(d)))});return b.join("&")}function a(a,b){b===void 0&&(b=!1);var c={};if(a==="")return c;a=a.split("&");for(var d=0;d<a.length;d++){var e=a[d].split("=",2),f=decodeURIComponent(e[0]);if(b&&Object.prototype.hasOwnProperty.call(c,f))throw new URIError("Duplicate key: "+f);c[f]=e.length===2?decodeURIComponent(e[1]):null}return c}function b(a,b){return a+(a.indexOf("?")!==-1?"&":"?")+(typeof b==="string"?b:g(b))}c={encode:g,decode:a,appendToUrl:b};f["default"]=c}),66); __d("BanzaiAdapter",["invariant","BanzaiConsts","BanzaiStorage","CurrentUser","DTSG","DTSGUtils","LSD","MBanzaiConfig","MRequest","MRequestConfig","QueryString","Run","SprinkleConfig","Stratcom","TimeSlice","Visibility","ZeroCategoryHeader","isInIframe","lowerdxDomain"],(function(a,b,c,d,e,f,g,h){var i="/a/bz",j=c("isInIframe")(),k=[];function l(a){if(!a)return{};a=d("DTSG").getCachedToken();var b={fb_dtsg:a,__a:c("MRequestConfig").ajaxResponseToken.encrypted,__user:c("CurrentUser").getID(),__fbbk:"1"};c("LSD").token&&(b.lsd=c("LSD").token);c("SprinkleConfig").param_name&&(a?b[c("SprinkleConfig").param_name]=d("DTSGUtils").getNumericValue(a):c("LSD").token&&(b[c("SprinkleConfig").param_name]=d("DTSGUtils").getNumericValue(c("LSD").token)));return b}var m={config:c("MBanzaiConfig"),useBeacon:Boolean(c("MBanzaiConfig").gks&&c("MBanzaiConfig").gks.mtouch_use_beacon),inform:function(a){c("Stratcom").invoke(a)},subscribe:function(a,b){return c("Stratcom").listen(a,null,b)},wrapInTimeSlice:function(a,b){return c("TimeSlice").guard(function(){a()},b,{propagationType:c("TimeSlice").PropagationType.ORPHAN})},cleanup:function(){var a=k;k=[];a.forEach(function(a){a.abort()})},send:function(a,b,d,e){var f=m.getEndPointUrl(!1),g=new(c("MRequest"))(f);g.setAutoProcess(!1);g.setRawData(a);g.setRequestHeader("X_FB_BACKGROUND_STATE",1);b&&g.listen("done",b);e||g.listen("done",function(a){m.inform(c("BanzaiConsts").OK)});g.listen("error",function(a){a.isHandled=!0;a=g.getTransport().status;d&&d(a);e||m.inform(c("BanzaiConsts").ERROR)});c("MRequestConfig").cleanFinishedRequest&&g.listen("finally",function(){var a=k.indexOf(g);a>=0&&k.splice(a,1)});k.push(g);g.send()},preferredCompressionMethod:function(){return"snappy_base64"},readyToSend:function(){return navigator.onLine},setHooks:function(a){c("Visibility").addListener("hidden",a._store),c("Visibility").addListener("visible",a._restore),window.addEventListener("pagehide",a._store),window.addEventListener("pageshow",a._restore),window.addEventListener("blur",a._store),window.addEventListener("focus",a._restore)},setUnloadHook:function(a){d("Run").onUnload(a._unload)},onUnload:function(a){d("Run").onUnload(a)},getEndPointUrl:function(a){a=l(a);a=c("QueryString").appendToUrl(i,a);a.length<=2e3||h(0,21850,a);return a},getStorage:function(){return c("BanzaiStorage")},getTopLevel:function(){return j&&c("lowerdxDomain").isValidDocumentDomain()?window.top:null},isOkToSendViaBeacon:function(){return Boolean(!c("ZeroCategoryHeader").value&&d("DTSG").getCachedToken())}};a=m;g["default"]=a}),98); /** * License: https://www.dx1.com/legal/license/WRsJ32R7YJG/ */ __d("SnappyCompress",[],(function(a,b,c,d,e,f){"use strict";function g(){return typeof process==="object"&&(typeof process.versions==="object"&&typeof process.versions.node!=="undefined")?!0:!1}function h(a){return a instanceof Uint8Array&&(!g()||!Buffer.isBuffer(a))}function i(a){return a instanceof ArrayBuffer}function j(a){return!g()?!1:Buffer.isBuffer(a)}var k="Argument compressed must be type of ArrayBuffer, Buffer, or Uint8Array";function a(a){if(!h(a)&&!i(a)&&!j(a))throw new TypeError(k);var b=!1,c=!1;h(a)?b=!0:i(a)&&(c=!0,a=new Uint8Array(a));a=new A(a);var d=a.readUncompressedLength();if(d===-1)throw new Error("Invalid Snappy bitstream");if(b){b=new Uint8Array(d);if(!a.uncompressToBuffer(b))throw new Error("Invalid Snappy bitstream")}else if(c){b=new ArrayBuffer(d);c=new Uint8Array(b);if(!a.uncompressToBuffer(c))throw new Error("Invalid Snappy bitstream")}else{b=Buffer.alloc(d);if(!a.uncompressToBuffer(b))throw new Error("Invalid Snappy bitstream")}return b}function b(a){if(!h(a)&&!i(a)&&!j(a))throw new TypeError(k);var b=!1,c=!1;h(a)?b=!0:i(a)&&(c=!0,a=new Uint8Array(a));a=new x(a);var d=a.maxCompressedLength(),e,f,g;b?(e=new Uint8Array(d),g=a.compressToBuffer(e)):c?(e=new ArrayBuffer(d),f=new Uint8Array(e),g=a.compressToBuffer(f)):(e=Buffer.alloc(d),g=a.compressToBuffer(e));if(!e.slice){f=new Uint8Array(Array.prototype.slice.call(e,0,g));if(b)return f;else if(c)return f.buffer;else throw new Error("not implemented")}return e.slice(0,g)}c=16;var l=1<<c,m=14,n=new Array(m+1);function o(a,b){return a*506832829>>>b}function p(a,b){return a[b]+(a[b+1]<<8)+(a[b+2]<<16)+(a[b+3]<<24)}function q(a,b,c){return a[b]===a[c]&&a[b+1]===a[c+1]&&a[b+2]===a[c+2]&&a[b+3]===a[c+3]}function r(a,b,c,d,e){var f;for(f=0;f<e;f++)c[d+f]=a[b+f]}function s(a,b,c,d,e){c<=60?(d[e]=c-1<<2,e+=1):c<256?(d[e]=60<<2,d[e+1]=c-1,e+=2):(d[e]=61<<2,d[e+1]=c-1&255,d[e+2]=c-1>>>8,e+=3);r(a,b,d,e,c);return e+c}function t(a,b,c,d){if(d<12&&c<2048){a[b]=1+(d-4<<2)+(c>>>8<<5);a[b+1]=c&255;return b+2}else{a[b]=2+(d-1<<2);a[b+1]=c&255;a[b+2]=c>>>8;return b+3}}function u(a,b,c,d){while(d>=68)b=t(a,b,c,64),d-=64;d>64&&(b=t(a,b,c,60),d-=60);return t(a,b,c,d)}function v(a,b,c,d,e){var f=1;while(1<<f<=c&&f<=m)f+=1;f-=1;var g=32-f;typeof n[f]==="undefined"&&(n[f]=new Uint16Array(1<<f));f=n[f];var h;for(h=0;h<f.length;h++)f[h]=0;h=b+c;var i=b,j=b,k,l,r,t,v,w=!0,x=15;if(c>=x){c=h-x;b+=1;x=o(p(a,b),g);while(w){t=32;l=b;do{b=l;k=x;v=t>>>5;t+=1;l=b+v;if(b>c){w=!1;break}x=o(p(a,l),g);r=i+f[k];f[k]=b-i}while(!q(a,b,r));if(!w)break;e=s(a,j,b-j,d,e);do{v=b;k=4;while(b+k<h&&a[b+k]===a[r+k])k+=1;b+=k;l=v-r;e=u(d,e,l,k);j=b;if(b>=c){w=!1;break}t=o(p(a,b-1),g);f[t]=b-1-i;v=o(p(a,b),g);r=i+f[v];f[v]=b-i}while(q(a,b,r));if(!w)break;b+=1;x=o(p(a,b),g)}}j<h&&(e=s(a,j,h-j,d,e));return e}function w(a,b,c){do b[c]=a&127,a=a>>>7,a>0&&(b[c]+=128),c+=1;while(a>0);return c}function x(a){this.array=a}x.prototype.maxCompressedLength=function(){var a=this.array.length;return 32+a+Math.floor(a/6)};x.prototype.compressToBuffer=function(a){var b=this.array,c=b.length,d=0,e=0,f;e=w(c,a,e);while(d<c)f=Math.min(c-d,l),e=v(b,d,f,a,e),d+=f;return e};var y=[0,255,65535,16777215,4294967295];function r(a,b,c,d,e){var f;for(f=0;f<e;f++)c[d+f]=a[b+f]}function z(a,b,c,d){var e;for(e=0;e<d;e++)a[b+e]=a[b-c+e]}function A(a){this.array=a,this.pos=0}A.prototype.readUncompressedLength=function(){var a=0,b=0,c,d;while(b<32&&this.pos<this.array.length){c=this.array[this.pos];this.pos+=1;d=c&127;if(d<<b>>>b!==d)return-1;a|=d<<b;if(c<128)return a;b+=7}return-1};A.prototype.uncompressToBuffer=function(a){var b=this.array,c=b.length,d=this.pos,e=0,f,g,h,i;while(d<b.length){f=b[d];d+=1;if((f&3)===0){g=(f>>>2)+1;if(g>60){if(d+3>=c)return!1;h=g-60;g=b[d]+(b[d+1]<<8)+(b[d+2]<<16)+(b[d+3]<<24);g=(g&y[h])+1;d+=h}if(d+g>c)return!1;r(b,d,a,e,g);d+=g;e+=g}else{switch(f&3){case 1:g=(f>>>2&7)+4;i=b[d]+(f>>>5<<8);d+=1;break;case 2:if(d+1>=c)return!1;g=(f>>>2)+1;i=b[d]+(b[d+1]<<8);d+=2;break;case 3:if(d+3>=c)return!1;g=(f>>>2)+1;i=b[d]+(b[d+1]<<8)+(b[d+2]<<16)+(b[d+3]<<24);d+=4;break;default:break}if(i===0||i>e)return!1;z(a,e,i,g);e+=g}}return!0};e.exports.uncompress=a;e.exports.compress=b}),null); __d("SnappyCompressUtil",["SnappyCompress"],(function(a,b,c,d,e,f){"use strict";var g={compressUint8ArrayToSnappy:function(c){if(c==null)return null;var d=null;try{d=b("SnappyCompress").compress(c)}catch(a){return null}c="";for(var e=0;e<d.length;e++)c+=String.fromCharCode(d[e]);return a.btoa(c)},compressStringToSnappy:function(b){if(a.Uint8Array===void 0||a.btoa===void 0)return null;var c=new a.Uint8Array(b.length);for(var d=0;d<b.length;d++){var e=b.charCodeAt(d);if(e>127)return null;c[d]=e}return g.compressUint8ArrayToSnappy(c)},compressStringToSnappyBinary:function(c){if(a.Uint8Array===void 0)return null;var d=null;if(a.TextEncoder!==void 0)d=new TextEncoder().encode(c);else{d=new a.Uint8Array(c.length);for(var e=0;e<c.length;e++){var f=c.charCodeAt(e);if(f>127)return null;d[e]=f}}f=null;try{f=b("SnappyCompress").compress(d)}catch(a){return null}return f}};e.exports=g}),null); __d("BanzaiCompressionUtils",["FBLogger","Promise","SnappyCompressUtil","once","performanceNow"],(function(a,b,c,d,e,f){"use strict";var g,h=b("once")(function(){if(a.CompressionStream==null)return!1;if(a.Response==null)return!1;try{new a.CompressionStream("deflate")}catch(a){return!1}return!0}),i={compressWad:function(a,c){if(a.needs_compression!==!0){delete a.needs_compression;return}if(c==="deflate"){i.compressWad(a,"snappy");return}var d=(g||(g=b("performanceNow")))(),e=JSON.stringify(a.posts),f;switch(c){case"snappy":f=b("SnappyCompressUtil").compressStringToSnappyBinary(e);break;case"snappy_base64":f=b("SnappyCompressUtil").compressStringToSnappy(e);break;default:break}f!=null&&f.length<e.length?(a.posts=f,a.compression=c,a.snappy_ms=Math.ceil((g||(g=b("performanceNow")))()-d),a.snappy_ms<0&&b("FBLogger")("BanzaiCompressionUtils").warn("Expected positive snappy_ms but got %s",a.snappy_ms)):a.compression="";delete a.needs_compression},compressWadAsync:function(c,d){if(d!=="deflate"){i.compressWad(c,"snappy");return b("Promise").resolve()}if(!h())return i.compressWadAsync(c,"snappy");var e=(g||(g=b("performanceNow")))(),f=JSON.stringify(c.posts),j=new Response(f).body;if(!j){c.compression="";delete c.needs_compression;return b("Promise").resolve()}j=j.pipeThrough(new a.CompressionStream("deflate"));return new Response(j).arrayBuffer().then(function(a){a.byteLength<f.length?(c.posts=new Uint8Array(a),c.compression=d,c.snappy_ms=Math.ceil((g||(g=b("performanceNow")))()-e),c.snappy_ms<0&&b("FBLogger")("BanzaiCompressionUtils").warn("Expected positive snappy_ms but got %s",c.snappy_ms)):c.compression="",delete c.needs_compression})["catch"](function(){c.compression="",delete c.needs_compression})},outOfBandsPosts:function(a){var b=0,c={};for(var d=0;d<a.length;d++){var e=a[d],f=e.compression==="snappy"||e.compression==="deflate";if(f){f=new Blob([e.posts],{type:"application/octet-stream"});e.posts=String(b);c["post_"+String(b)]=f;b++}}return c}};e.exports=i}),null); __d("BanzaiBase",["BanzaiAdapter","BanzaiCompressionUtils","BanzaiConsts","BanzaiLazyQueue","BanzaiUtils","CurrentUser","ErrorGuard","ExecutionEnvironment","FBLogger","NavigationMetrics","SetIdleTimeoutAcrossTransitions","Visibility","WebSession","performanceAbsoluteNow"],(function(a,b,c,d,e,f){var g,h,i,j,k,l=[],m=null,n={_clearPostBuffer:function(){l=[]},_gatherWadsAndPostsFromBuffer:function(a,c,d,e,f){var g={currentSize:0,keepRetryable:d,overlimit:!1,sendMinimumOnePost:f,wadMap:new Map()};d=e.filter(function(d,e){return b("BanzaiUtils").filterPost(d,a,c,g)});g.overlimit&&d.length&&n._schedule(0);return d},_getEventTime:function(){return(g||(g=b("performanceAbsoluteNow")))()},_getWebSessionId:function(){return b("WebSession").getId()},_getPostBuffer:function(){return l},_getUserId:function(){return b("CurrentUser").getPossiblyNondxUserID()},_getAppId:function(){return b("CurrentUser").getAppID()},_initialize:function(){b("ExecutionEnvironment").canUseDOM&&(n.adapter.useBeacon&&b("Visibility").isSupported()?(b("Visibility").addListener(b("Visibility").HIDDEN,function(){n._getPostBuffer().length>0&&(n._tryToSendViaBeacon()||n._store(!1))}),n.isEnabled("enable_client_logging_clear_on_visible")&&b("Visibility").addListener(b("Visibility").VISIBLE,function(){n._tryToSendViaBeacon()||n._restore(!1)})):n.adapter.setHooks(n),n.adapter.setUnloadHook(n),b("NavigationMetrics").addListener(b("NavigationMetrics").Events.NAVIGATION_DONE,function(a,c){if(c.pageType!=="normal")return;n._restore(!1);b("NavigationMetrics").removeCurrentListener()}))},_sendBeacon:function(b,c){return a.navigator.sendBeacon(b,c)},_prepForTransit:function(a){var c=new FormData();c.append("ts",String(Date.now()));var d=b("BanzaiCompressionUtils").outOfBandsPosts(a);Object.keys(d).forEach(function(a){c.append(a,d[a])});c.append("q",JSON.stringify(a));return c},_prepWadForTransit:function(a){b("BanzaiCompressionUtils").compressWad(a,b("BanzaiAdapter").preferredCompressionMethod())},_processCallbacksAndSendViaBeacon:function(){var a=[],c=[],d=[];n._gatherWadsAndPostsFromBuffer(c,d,!0,a,!1);if(c.length>0){c[0].send_method="beacon";c.map(n._prepWadForTransit);d=n._prepForTransit(c);a=b("BanzaiAdapter").getEndPointUrl(!0);c=n._sendBeacon(a,d);c||b("FBLogger")("banzai").warn("Error sending beacon")}},_restore:function(a){a=b("BanzaiAdapter").getStorage();var c=function(a){l.push(a)};(h||(h=b("ErrorGuard"))).applyWithGuard(a.restore,a,[c]);n._schedule(b("BanzaiAdapter").config.RESTORE_WAIT||(i||(i=b("BanzaiConsts"))).VITAL_WAIT)},_schedule:function(a){var c=n._getEventTime()+a;if(!k||c<k){k=c;b("SetIdleTimeoutAcrossTransitions").clear(j);j=b("SetIdleTimeoutAcrossTransitions").start(b("BanzaiAdapter").wrapInTimeSlice(n._sendWithCallbacks,"Banzai.send"),a);return!0}return!1},_sendWithCallbacks:function(a,c){k=null;n._schedule(n.BASIC.delay);if(!b("BanzaiAdapter").readyToSend()){c&&c();return}if(n.isEnabled("flush_storage_periodically")){var d=b("BanzaiAdapter").getStorage(),e=function(){n._restore(!1)};(h||(h=b("ErrorGuard"))).applyWithGuard(d.flush,d,[e])}b("BanzaiAdapter").inform((i||(i=b("BanzaiConsts"))).SEND);d=[];var f=[];l=n._gatherWadsAndPostsFromBuffer(d,f,!0,l,!0);if(d.length<=0){b("BanzaiAdapter").inform((i||(i=b("BanzaiConsts"))).OK);a&&a();return}d[0].trigger=m;m=null;d[0].send_method="ajax";d.map(n._prepWadForTransit);b("BanzaiAdapter").send(n._prepForTransit(d),function(){f.forEach(function(a){a=a;a.__meta.status=(i||(i=b("BanzaiConsts"))).POST_SENT;a.__meta.callback&&a.__meta.callback()}),a&&a()},function(a){f.forEach(function(c){b("BanzaiUtils").retryPost(c,a,l)}),c&&c()})},_store:function(a){a=b("BanzaiAdapter").getStorage();(h||(h=b("ErrorGuard"))).applyWithGuard(a.store,a,[l])},_testState:function(){return{postBuffer:l,triggerRoute:m}},_tryToSendViaBeacon:function(){if(!(navigator&&navigator.sendBeacon&&b("BanzaiAdapter").isOkToSendViaBeacon()))return!1;var a=[],c=[];l=n._gatherWadsAndPostsFromBuffer(a,c,!1,l,!1);if(a.length<=0)return!1;a[0].send_method="beacon";a.map(n._prepWadForTransit);a=n._prepForTransit(a);var d=b("BanzaiAdapter").getEndPointUrl(!0);d=n._sendBeacon(d,a);if(!d){c.forEach(function(a){l.push(a)});return!1}return!0},_unload:function(){if(b("BanzaiAdapter").config.disabled)return;navigator&&navigator.sendBeacon&&b("BanzaiAdapter").isOkToSendViaBeacon()&&n._processCallbacksAndSendViaBeacon();b("BanzaiAdapter").cleanup();b("BanzaiAdapter").inform((i||(i=b("BanzaiConsts"))).SHUTDOWN);l.length>0&&((!n.adapter.useBeacon||!n._tryToSendViaBeacon())&&n._store(!1))},BASIC:{delay:b("BanzaiAdapter").config.MAX_WAIT||(i||(i=b("BanzaiConsts"))).BASIC_WAIT},BASIC_WAIT:(i||(i=b("BanzaiConsts"))).BASIC_WAIT,ERROR:i.ERROR,OK:i.OK,SEND:i.SEND,SHUTDOWN:i.SHUTDOWN,VITAL:{delay:b("BanzaiAdapter").config.MIN_WAIT||(i||(i=b("BanzaiConsts"))).VITAL_WAIT},VITAL_WAIT:i.VITAL_WAIT,adapter:b("BanzaiAdapter"),canUseNavigatorBeacon:function(){return Boolean(navigator&&navigator.sendBeacon&&b("BanzaiAdapter").isOkToSendViaBeacon())},flush:function(a,c){b("SetIdleTimeoutAcrossTransitions").clear(j),n._sendWithCallbacks(a,c)},isEnabled:function(a){return Boolean(b("BanzaiAdapter").config.gks&&b("BanzaiAdapter").config.gks[a]&&!b("BanzaiAdapter").config.disabled)},post:function(a,c,d){a||b("FBLogger")("banzai").mustfix("Banzai.post called without specifying a route");b("BanzaiLazyQueue").flushQueue().forEach(function(a){return n.post.apply(n,a)});var e=a.split(":");if((b("BanzaiAdapter").config.known_routes||[]).indexOf(e[0])===-1){b("BanzaiAdapter").config.should_log_unknown_routes===!0&&b("FBLogger")("banzai").blameToPreviousFrame().mustfix("Attempted to post to invalid Banzai route '"+a+"'. This call site should be cleaned up.");if(b("BanzaiAdapter").config.should_drop_unknown_routes===!0)return}var f="";try{var g;f=(g=JSON.stringify(c))!=null?g:""}catch(c){b("FBLogger")("banzai").catching(c).addToCategoryKey(a).mustfix("Could not JSON.stringify banzai data for route %s",a);return}var h=d==null?void 0:d.retry;if(b("BanzaiAdapter").config.disabled)return;if(!b("ExecutionEnvironment").canUseDOM&&!b("ExecutionEnvironment").isInWorker)return;var j=n.adapter.getTopLevel();if(j){var k;try{k=j.require("Banzai")}catch(a){k=null}if(k){k.post.apply(k,arguments);return}}var o=b("BanzaiAdapter").config.blacklist;if(o&&(o.indexOf&&(typeof o.indexOf=="function"&&o.indexOf(a)!=-1)))return;var p=f.length,q=b("BanzaiUtils").wrapData(a,c,n._getEventTime(),h,p),r=q;(d==null?void 0:d.callback)&&(r.__meta.callback=d==null?void 0:d.callback);(d==null?void 0:d.compress)!=null&&(r.__meta.compress=d==null?void 0:d.compress);var s=d==null?void 0:d.delay;s==null&&(s=(i||(i=b("BanzaiConsts"))).BASIC_WAIT);if(d==null?void 0:d.signal){r.__meta.status=(i||(i=b("BanzaiConsts"))).POST_INFLIGHT;var t=[{user:n._getUserId(),webSessionId:n._getWebSessionId(),app_id:n._getAppId(),posts:[q],trigger:a}];b("BanzaiAdapter").send(n._prepForTransit(t),function(){r.__meta.status=(i||(i=b("BanzaiConsts"))).POST_SENT,r.__meta.callback&&r.__meta.callback()},function(a){b("BanzaiUtils").retryPost(q,a,l)},!0);if(!h)return}l.push(q);(n._schedule(s)||!m)&&(m=a)},subscribe:b("BanzaiAdapter").subscribe};n._initialize();e.exports=n}),null);