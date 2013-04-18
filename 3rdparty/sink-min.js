var Sink=this.Sink=function(global){function Sink(readFn,channelCount,bufferSize,sampleRate){var i,sinks=Sink.sinks.list;for(i=0;sinks.length>i;i++)if(sinks[i].enabled)try{return new sinks[i](readFn,channelCount,bufferSize,sampleRate)}catch(e1){}throw Sink.Error(2)}function SinkClass(){}function sinks(type,constructor,prototype,disabled,priority){prototype=prototype||constructor.prototype,constructor.prototype=new Sink.SinkClass,constructor.prototype.type=type,constructor.enabled=!disabled;var k;for(k in prototype)prototype.hasOwnProperty(k)&&(constructor.prototype[k]=prototype[k]);sinks[type]=constructor,sinks.list[priority?"unshift":"push"](constructor)}return Sink.SinkClass=SinkClass,SinkClass.prototype=Sink.prototype={sampleRate:44100,channelCount:2,bufferSize:4096,writePosition:0,previousHit:0,ringOffset:0,channelMode:"interleaved",isReady:!1,start:function(readFn,channelCount,bufferSize,sampleRate){this.channelCount=isNaN(channelCount)||null===channelCount?this.channelCount:channelCount,this.bufferSize=isNaN(bufferSize)||null===bufferSize?this.bufferSize:bufferSize,this.sampleRate=isNaN(sampleRate)||null===sampleRate?this.sampleRate:sampleRate,this.readFn=readFn,this.activeRecordings=[],this.previousHit=+new Date,Sink.EventEmitter.call(this),Sink.emit("init",[this].concat([].slice.call(arguments)))},process:function(soundData,channelCount){if(this.emit("preprocess",arguments),this.ringBuffer&&("interleaved"===this.channelMode?this.ringSpin:this.ringSpinInterleaved).apply(this,arguments),"interleaved"===this.channelMode)this.emit("audioprocess",arguments),this.readFn&&this.readFn.apply(this,arguments);else{var soundDataSplit=Sink.deinterleave(soundData,this.channelCount),args=[soundDataSplit].concat([].slice.call(arguments,1));this.emit("audioprocess",args),this.readFn&&this.readFn.apply(this,args),Sink.interleave(soundDataSplit,this.channelCount,soundData)}this.emit("postprocess",arguments),this.previousHit=+new Date,this.writePosition+=soundData.length/channelCount},getPlaybackTime:function(){return this.writePosition-this.bufferSize},ready:function(){this.isReady||(this.isReady=!0,this.emit("ready",[]))}},Sink.sinks=Sink.devices=sinks,Sink.sinks.list=[],Sink.singleton=function(){var sink=Sink.apply(null,arguments);return Sink.singleton=function(){return sink},sink},global.Sink=Sink,Sink}(function(){return this}());void function(Sink){function EventEmitter(){var k;for(k in EventEmitter.prototype)EventEmitter.prototype.hasOwnProperty(k)&&(this[k]=EventEmitter.prototype[k]);this._listeners={}}EventEmitter.prototype={_listeners:null,emit:function(name,args){if(this._listeners[name])for(var i=0;this._listeners[name].length>i;i++)this._listeners[name][i].apply(this,args);return this},on:function(name,listener){return this._listeners[name]=this._listeners[name]||[],this._listeners[name].push(listener),this},off:function(name,listener){if(this._listeners[name]){if(!listener)return delete this._listeners[name],this;for(var i=0;this._listeners[name].length>i;i++)this._listeners[name][i]===listener&&this._listeners[name].splice(i--,1);this._listeners[name].length||delete this._listeners[name]}return this}},Sink.EventEmitter=EventEmitter,EventEmitter.call(Sink)}(this.Sink),void function(Sink){Sink.doInterval=function(callback,timeout){function create(noWorker){Sink.inlineWorker.working&&!noWorker?(timer=Sink.inlineWorker('setInterval(function (){ postMessage("tic"); }, '+timeout+");"),timer.onmessage=function(){callback()},kill=function(){timer.terminate()}):(timer=setInterval(callback,timeout),kill=function(){clearInterval(timer)})}var timer,kill;return Sink.inlineWorker.ready?create():Sink.inlineWorker.on("ready",function(){create()}),function(){kill?kill():Sink.inlineWorker.ready||Sink.inlineWorker.on("ready",function(){kill&&kill()})}}}(this.Sink),void function(Sink){var _Blob,_BlobBuilder,_URL,_btoa;void function(prefixes,urlPrefixes){function find(name,prefixes){var b,a=prefixes.slice();for(b=a.shift();b!==void 0;b=a.shift())if(b=Function("return typeof "+b+name+'=== "undefined" ? undefined : '+b+name)())return b}_Blob=find("Blob",prefixes),_BlobBuilder=find("BlobBuilder",prefixes),_URL=find("URL",urlPrefixes),_btoa=find("btoa",[""])}(["","Moz","WebKit","MS"],["","webkit"]);var createBlob=_Blob&&_URL&&function(content,type){return _URL.createObjectURL(new _Blob([content],{type:type}))},createBlobBuilder=_BlobBuilder&&_URL&&function(content,type){var bb=new _BlobBuilder;return bb.append(content),_URL.createObjectURL(bb.getBlob(type))},createData=_btoa&&function(content,type){return"data:"+type+";base64,"+_btoa(content)},createDynURL=createBlob||createBlobBuilder||createData;createDynURL&&(createBlob&&(createDynURL.createBlob=createBlob),createBlobBuilder&&(createDynURL.createBlobBuilder=createBlobBuilder),createData&&(createDynURL.createData=createData),_Blob&&(createDynURL.Blob=_Blob),_BlobBuilder&&(createDynURL.BlobBuilder=_BlobBuilder),_URL&&(createDynURL.URL=_URL),Sink.createDynURL=createDynURL,Sink.revokeDynURL=function(url){return"string"==typeof url&&0===url.indexOf("data:")?!1:_URL.revokeObjectURL(url)})}(this.Sink),void function(Sink){function SinkError(code){if(!SinkError.hasOwnProperty(code))throw SinkError(1);if(!(this instanceof SinkError))return new SinkError(code);var k;for(k in SinkError[code])SinkError[code].hasOwnProperty(k)&&(this[k]=SinkError[code][k]);this.code=code}SinkError.prototype=Error(),SinkError.prototype.toString=function(){return"SinkError 0x"+this.code.toString(16)+": "+this.message},SinkError[1]={message:"No such error code.",explanation:"The error code does not exist."},SinkError[2]={message:"No audio sink available.",explanation:"The audio device may be busy, or no supported output API is available for this browser."},SinkError[16]={message:"Buffer underflow.",explanation:"Trying to recover..."},SinkError[17]={message:"Critical recovery fail.",explanation:"The buffer underflow has reached a critical point, trying to recover, but will probably fail anyway."},SinkError[18]={message:"Buffer size too large.",explanation:"Unable to allocate the buffer due to excessive length, please try a smaller buffer. Buffer size should probably be smaller than the sample rate."},Sink.Error=SinkError}(this.Sink),void function(Sink){function terminate(){return define(this,"terminate",this._terminate),Sink.revokeDynURL(this._url),delete this._url,delete this._terminate,this.terminate()}function inlineWorker(script){function wrap(type,content,typeName){try{var url=type(content,"text/javascript"),worker=new Worker(url);return define(worker,"_url",url),define(worker,"_terminate",worker.terminate),define(worker,"terminate",terminate),inlineWorker.type?worker:(inlineWorker.type=typeName,inlineWorker.createURL=type,worker)}catch(e){return null}}var createDynURL=Sink.createDynURL;if(!createDynURL)return null;var worker;return inlineWorker.createURL?wrap(inlineWorker.createURL,script,inlineWorker.type):(worker=wrap(createDynURL.createBlob,script,"blob"))?worker:(worker=wrap(createDynURL.createBlobBuilder,script,"blobbuilder"))?worker:worker=wrap(createDynURL.createData,script,"data")}var define=Object.defineProperty?function(obj,name,value){Object.defineProperty(obj,name,{value:value,configurable:!0,writable:!0})}:function(obj,name,value){obj[name]=value};Sink.EventEmitter.call(inlineWorker),inlineWorker.test=function(){function ready(success){inlineWorker.ready||(inlineWorker.ready=!0,inlineWorker.working=success,inlineWorker.emit("ready",[success]),inlineWorker.off("ready"),success&&worker&&worker.terminate(),worker=null)}inlineWorker.ready=inlineWorker.working=!1,inlineWorker.type="",inlineWorker.createURL=null;var worker=inlineWorker("this.onmessage=function(e){postMessage(e.data)}"),data="inlineWorker";worker?(worker.onmessage=function(e){ready(e.data===data)},worker.postMessage(data),setTimeout(function(){ready(!1)},1e3)):setTimeout(function(){ready(!1)},0)},Sink.inlineWorker=inlineWorker,inlineWorker.test()}(this.Sink),void function(Sink){Sink.sinks("audiodata",function(){function bufferFill(){if(tail){if(written=audioDevice.mozWriteAudio(tail),currentWritePosition+=written,tail.length>written)return tail=tail.subarray(written);tail=null}if(currentPosition=audioDevice.mozCurrentSampleOffset(),available=Number(currentPosition+(prevPos!==currentPosition?self.bufferSize:self.preBufferSize)*self.channelCount-currentWritePosition),currentPosition===prevPos&&self.emit("error",[Sink.Error(16)]),available>0||prevPos===currentPosition){self.ready();try{soundData=new Float32Array(prevPos===currentPosition?self.preBufferSize*self.channelCount:self.forceBufferSize?2*self.bufferSize>available?2*self.bufferSize:available:available)}catch(e){return self.emit("error",[Sink.Error(18)]),self.kill(),void 0}self.process(soundData,self.channelCount),written=self._audio.mozWriteAudio(soundData),soundData.length>written&&(tail=soundData.subarray(written)),currentWritePosition+=written}prevPos=currentPosition}var written,currentPosition,available,soundData,prevPos,self=this,currentWritePosition=0,tail=null,audioDevice=new Audio;self.start.apply(self,arguments),self.preBufferSize=isNaN(arguments[4])||null===arguments[4]?this.preBufferSize:arguments[4],audioDevice.mozSetup(self.channelCount,self.sampleRate),this._timers=[],this._timers.push(Sink.doInterval(function(){+new Date-self.previousHit>2e3&&(self._audio=audioDevice=new Audio,audioDevice.mozSetup(self.channelCount,self.sampleRate),currentWritePosition=0,self.emit("error",[Sink.Error(17)]))},1e3)),this._timers.push(Sink.doInterval(bufferFill,self.interval)),self._bufferFill=bufferFill,self._audio=audioDevice},{bufferSize:24576,preBufferSize:24576,forceBufferSize:!1,interval:100,kill:function(){for(;this._timers.length;)this._timers.shift()();this.emit("kill")},getPlaybackTime:function(){return this._audio.mozCurrentSampleOffset()/this.channelCount}},!1,!0),Sink.sinks.moz=Sink.sinks.audiodata}(this.Sink),void function(Sink){var cubeb;try{cubeb=require("cubeb")}catch(e){return}var getContext=function(){var ctx;return function(){return ctx=new cubeb.Context("sink.js "+process.pid+" "+new Date),getContext=function(){return ctx},ctx}}(),streamCount=0;Sink.sinks("cubeb",function(){var self=this;self.start.apply(self,arguments),self._ctx=getContext(),self._stream=new cubeb.Stream(self._ctx,self._ctx.name+" "+streamCount++,cubeb.SAMPLE_FLOAT32LE,self.channelCount,self.sampleRate,self.bufferSize,self._latency,function(frameCount){var buffer=new Buffer(4*frameCount*self.channelCount),soundData=new Float32Array(buffer);self.process(soundData,self.channelCount),self._stream.write(buffer),self._stream.release()},function(){}),self._stream.start()},{_ctx:null,_stream:null,_latency:250,bufferSize:4096,kill:function(){this._stream.stop(),this.emit("kill")},getPlaybackTime:function(){return this._stream.position}})}(this.Sink),void function(Sink){Sink.sinks("dummy",function(){function bufferFill(){var soundData=new Float32Array(self.bufferSize*self.channelCount);self.process(soundData,self.channelCount)}var self=this;self.start.apply(self,arguments),self._kill=Sink.doInterval(bufferFill,1e3*(self.bufferSize/self.sampleRate)),self._callback=bufferFill},{kill:function(){this._kill(),this.emit("kill")}},!0)}(this.Sink),function(Sink,sinks){function newAudio(src){var audio=document.createElement("audio");return src&&(audio.src=src),audio}function wavAudio(){var self=this;self.currentFrame=newAudio(),self.nextFrame=newAudio(),self._onended=function(){self.samples+=self.bufferSize,self.nextClip()}}sinks=Sink.sinks,sinks("wav",function(){function bufferFill(){self._audio.hasNextFrame||(self.ready(),Sink.memcpy(zeroData,0,soundData,0),self.process(soundData,self.channelCount),self._audio.setSource("data:audio/wav;base64,"+btoa(audioLib.PCMData.encode({data:soundData,sampleRate:self.sampleRate,channelCount:self.channelCount,bytesPerSample:self.quality}))),self._audio.currentFrame.src||self._audio.nextClip())}var self=this,audio=new sinks.wav.wavAudio,PCMData=PCMData===void 0?audioLib.PCMData:PCMData;self.start.apply(self,arguments);var soundData=new Float32Array(self.bufferSize*self.channelCount),zeroData=new Float32Array(self.bufferSize*self.channelCount);if(!newAudio().canPlayType("audio/wav; codecs=1")||!btoa)throw 0;self.kill=Sink.doInterval(bufferFill,40),self._bufferFill=bufferFill,self._audio=audio},{quality:1,bufferSize:22050,getPlaybackTime:function(){var audio=this._audio;return(audio.currentFrame?audio.currentFrame.currentTime*this.sampleRate:0)+audio.samples}}),wavAudio.prototype={samples:0,nextFrame:null,currentFrame:null,_onended:null,hasNextFrame:!1,nextClip:function(){var curFrame=this.currentFrame;this.currentFrame=this.nextFrame,this.nextFrame=curFrame,this.hasNextFrame=!1,this.currentFrame.play()},setSource:function(src){this.nextFrame.src=src,this.nextFrame.addEventListener("ended",this._onended,!0),this.hasNextFrame=!0}},sinks.wav.wavAudio=wavAudio}(this.Sink),function(sinks,fixChrome82795){var AudioContext="undefined"==typeof window?null:window.webkitAudioContext||window.AudioContext;sinks("webaudio",function(){function bufferFill(e){var i,n,outputBuffer=e.outputBuffer,channelCount=outputBuffer.numberOfChannels,l=outputBuffer.length,channels=(outputBuffer.size,Array(channelCount));for(self.ready(),soundData=soundData&&soundData.length===l*channelCount?soundData:new Float32Array(l*channelCount),zeroBuffer=zeroBuffer&&zeroBuffer.length===soundData.length?zeroBuffer:new Float32Array(l*channelCount),soundData.set(zeroBuffer),i=0;channelCount>i;i++)channels[i]=outputBuffer.getChannelData(i);for(self.process(soundData,self.channelCount),i=0;l>i;i++)for(n=0;channelCount>n;n++)channels[n][i]=soundData[i*self.channelCount+n]}var self=this,context=sinks.webaudio.getContext(),node=null,soundData=null,zeroBuffer=null;self.start.apply(self,arguments),node=context.createJavaScriptNode(self.bufferSize,self.channelCount,self.channelCount),self.sampleRate=context.sampleRate,node.onaudioprocess=bufferFill,node.connect(context.destination),self._context=context,self._node=node,self._callback=bufferFill,fixChrome82795.push(node)},{kill:function(){this._node.disconnect(0);for(var i=0;fixChrome82795.length>i;i++)fixChrome82795[i]===this._node&&fixChrome82795.splice(i--,1);this._node=this._context=null,this.emit("kill")},getPlaybackTime:function(){return this._context.currentTime*this.sampleRate}},!1,!0),sinks.webkit=sinks.webaudio,sinks.webaudio.fix82795=fixChrome82795,sinks.webaudio.getContext=function(){var context=new AudioContext;return sinks.webaudio.getContext=function(){return context},context}}(this.Sink.sinks,[]),function(Sink){Sink.sinks("worker",function(){function mspBufferFill(e){self.isReady||self.initMSP(e),self.ready();var n,i,channelCount=self.channelCount,l=e.audioLength;for(soundData=soundData&&soundData.length===l*channelCount?soundData:new Float32Array(l*channelCount),outBuffer=outBuffer&&outBuffer.length===soundData.length?outBuffer:new Float32Array(l*channelCount),zeroBuffer=zeroBuffer&&zeroBuffer.length===soundData.length?zeroBuffer:new Float32Array(l*channelCount),soundData.set(zeroBuffer),outBuffer.set(zeroBuffer),self.process(soundData,self.channelCount),n=0;channelCount>n;n++)for(i=0;l>i;i++)outBuffer[n*e.audioLength+i]=soundData[n+i*channelCount];e.writeAudio(outBuffer)}function waBufferFill(e){self.isReady||self.initWA(e),self.ready();var i,n,outputBuffer=e.outputBuffer,channelCount=outputBuffer.numberOfChannels,l=outputBuffer.length,channels=(outputBuffer.size,Array(channelCount));for(soundData=soundData&&soundData.length===l*channelCount?soundData:new Float32Array(l*channelCount),zeroBuffer=zeroBuffer&&zeroBuffer.length===soundData.length?zeroBuffer:new Float32Array(l*channelCount),soundData.set(zeroBuffer),i=0;channelCount>i;i++)channels[i]=outputBuffer.getChannelData(i);for(self.process(soundData,self.channelCount),i=0;l>i;i++)for(n=0;channelCount>n;n++)channels[n][i]=soundData[i*self.channelCount+n]}var self=this,global=function(){return this}(),soundData=null,outBuffer=null,zeroBuffer=null;self.start.apply(self,arguments),importScripts(),global.onprocessmedia=mspBufferFill,global.onaudioprocess=waBufferFill,self._mspBufferFill=mspBufferFill,self._waBufferFill=waBufferFill},{ready:!1,initMSP:function(e){this.channelCount=e.audioChannels,this.sampleRate=e.audioSampleRate,this.bufferSize=e.audioLength*this.channelCount,this.ready=!0,this.emit("ready",[])},initWA:function(e){var b=e.outputBuffer;this.channelCount=b.numberOfChannels,this.sampleRate=b.sampleRate,this.bufferSize=b.length*this.channelCount,this.ready=!0,this.emit("ready",[])}})}(this.Sink),function(Sink){Sink.deinterleave=function(buffer,channelCount){var i,n,l=buffer.length,size=l/channelCount,ret=[];for(i=0;channelCount>i;i++)for(ret[i]=new Float32Array(size),n=0;size>n;n++)ret[i][n]=buffer[n*channelCount+i];return ret},Sink.interleave=function(buffers,channelCount,buffer){channelCount=channelCount||buffers.length;var i,n,l=buffers[0].length,bufferCount=buffers.length;for(buffer=buffer||new Float32Array(l*channelCount),i=0;bufferCount>i;i++)for(n=0;l>n;n++)buffer[i+n*channelCount]=buffers[i][n];return buffer},Sink.mix=function(buffer){var l,i,c,buffers=[].slice.call(arguments,1);for(c=0;buffers.length>c;c++)for(l=Math.max(buffer.length,buffers[c].length),i=0;l>i;i++)buffer[i]+=buffers[c][i];return buffer},Sink.resetBuffer=function(buffer){var i,l=buffer.length;for(i=0;l>i;i++)buffer[i]=0;return buffer},Sink.clone=function(buffer,result){var i,l=buffer.length;for(result=result||new Float32Array(l),i=0;l>i;i++)result[i]=buffer[i];return result},Sink.createDeinterleaved=function(length,channelCount){var i,result=Array(channelCount);for(i=0;channelCount>i;i++)result[i]=new Float32Array(length);return result},Sink.memcpy=function(src,srcOffset,dst,dstOffset,length){if(src=src.subarray||src.slice?src:src.buffer,dst=dst.subarray||dst.slice?dst:dst.buffer,src=srcOffset?src.subarray?src.subarray(srcOffset,length&&srcOffset+length):src.slice(srcOffset,length&&srcOffset+length):src,dst.set)dst.set(src,dstOffset);else for(var i=0;src.length>i;i++)dst[i+dstOffset]=src[i];return dst},Sink.memslice=function(buffer,offset,length){return buffer.subarray?buffer.subarray(offset,length):buffer.slice(offset,length)},Sink.mempad=function(buffer,out,offset){return out=out.length?out:new buffer.constructor(out),Sink.memcpy(buffer,0,out,offset),out},Sink.linspace=function(start,end,out){var l,i,n,step;for(out=out.length?(l=out.length)&&out:Array(l=out),step=(end-start)/--l,n=start+step,i=1;l>i;i++,n+=step)out[i]=n;return out[0]=start,out[l]=end,out},Sink.ftoi=function(input,bitCount,output){var i,mask=Math.pow(2,bitCount-1);for(output=output||new input.constructor(input.length),i=0;input.length>i;i++)output[i]=~~(mask*input[i]);return output}}(this.Sink),function(Sink){function Proxy(bufferSize,channelCount){Sink.EventEmitter.call(this),this.bufferSize=isNaN(bufferSize)||null===bufferSize?this.bufferSize:bufferSize,this.channelCount=isNaN(channelCount)||null===channelCount?this.channelCount:channelCount;var self=this;this.callback=function(){return self.process.apply(self,arguments)},this.resetBuffer()}Proxy.prototype={buffer:null,zeroBuffer:null,parentSink:null,bufferSize:4096,channelCount:2,offset:null,resetBuffer:function(){this.buffer=new Float32Array(this.bufferSize),this.zeroBuffer=new Float32Array(this.bufferSize)},process:function(buffer){null===this.offset&&this.loadBuffer();for(var i=0;buffer.length>i;i++)this.offset>=this.buffer.length&&this.loadBuffer(),buffer[i]=this.buffer[this.offset++]},loadBuffer:function(){this.offset=0,Sink.memcpy(this.zeroBuffer,0,this.buffer,0),this.emit("audioprocess",[this.buffer,this.channelCount])}},Sink.Proxy=Proxy,Sink.prototype.createProxy=function(bufferSize){var proxy=new Sink.Proxy(bufferSize,this.channelCount);return proxy.parentSink=this,this.on("audioprocess",proxy.callback),proxy}}(this.Sink),function(Sink){(function(){function interpolation(name,method){return name&&method?interpolation[name]=method:name&&interpolation[name]instanceof Function&&(Sink.interpolate=interpolation[name]),interpolation[name]}Sink.interpolation=interpolation,interpolation("linear",function(arr,pos){var first=Math.floor(pos),second=first+1,frac=pos-first;return second=arr.length>second?second:0,arr[first]*(1-frac)+arr[second]*frac}),interpolation("nearest",function(arr,pos){return pos>=arr.length-.5?arr[0]:arr[Math.round(pos)]}),interpolation("linear")})(),Sink.resample=function(buffer,fromRate,fromFrequency,toRate,toFrequency){var i,n,argc=arguments.length,speed=2===argc?fromRate:3===argc?fromRate/fromFrequency:toRate/fromRate*toFrequency/fromFrequency,l=buffer.length,length=Math.ceil(l/speed),newBuffer=new Float32Array(length);for(i=0,n=0;l>i;i+=speed)newBuffer[n++]=Sink.interpolate(buffer,i);return newBuffer}}(this.Sink),void function(Sink){function Recording(bindTo){this.boundTo=bindTo,this.buffers=[],bindTo.activeRecordings.push(this)}Sink.on("init",function(sink){sink.activeRecordings=[],sink.on("postprocess",sink.recordData)}),Sink.prototype.activeRecordings=null,Sink.prototype.record=function(){var recording=new Sink.Recording(this);return this.emit("record",[recording]),recording},Sink.prototype.recordData=function(buffer){var i,activeRecs=this.activeRecordings,l=activeRecs.length;for(i=0;l>i;i++)activeRecs[i].add(buffer)},Recording.prototype={add:function(buffer){this.buffers.push(buffer)},clear:function(){this.buffers=[]},stop:function(){var i,recordings=this.boundTo.activeRecordings;for(i=0;recordings.length>i;i++)recordings[i]===this&&recordings.splice(i--,1)},join:function(){var newArray,n,i,bufferLength=0,bufPos=0,buffers=this.buffers,l=buffers.length;for(i=0;l>i;i++)bufferLength+=buffers[i].length;for(newArray=new Float32Array(bufferLength),i=0;l>i;i++){for(n=0;buffers[i].length>n;n++)newArray[bufPos+n]=buffers[i][n];bufPos+=buffers[i].length}return newArray}},Sink.Recording=Recording}(this.Sink),void function(Sink){function processRingBuffer(){this.ringBuffer&&("interleaved"===this.channelMode?this.ringSpin:this.ringSpinInterleaved).apply(this,arguments)}Sink.on("init",function(sink){sink.on("preprocess",processRingBuffer)}),Sink.prototype.ringBuffer=null,Sink.prototype.ringSpin=function(buffer){var i,ring=this.ringBuffer,l=buffer.length,m=ring.length,off=this.ringOffset;for(i=0;l>i;i++)buffer[i]+=ring[off],off=(off+1)%m;this.ringOffset=off},Sink.prototype.ringSpinDeinterleaved=function(buffer){var i,n,ring=this.ringBuffer,l=buffer.length,ch=ring.length,m=ring[0].length,off=this.ringOffset;for(i=0;l>i;i+=ch){for(n=0;ch>n;n++)buffer[i+n]+=ring[n][off];off=(off+1)%m}this.ringOffset=n}}(this.Sink),void function(Sink,proto){proto=Sink.prototype,Sink.on("init",function(sink){sink.asyncBuffers=[],sink.syncBuffers=[],sink.on("preprocess",sink.writeBuffersSync),sink.on("postprocess",sink.writeBuffersAsync)}),proto.writeMode="async",proto.asyncBuffers=proto.syncBuffers=null,proto.writeBuffersAsync=function(buffer){var buf,bufLength,i,n,offset,buffers=this.asyncBuffers,l=buffer.length;if(buffers)for(i=0;buffers.length>i;i++){for(buf=buffers[i],bufLength=buf.b.length,offset=buf.d,buf.d-=Math.min(offset,l),n=0;l>n+offset&&bufLength>n;n++)buffer[n+offset]+=buf.b[n];buf.b=buf.b.subarray(n+offset),i>=bufLength&&buffers.splice(i--,1)}},proto.writeBuffersSync=function(buffer){for(var buffers=this.syncBuffers,l=buffer.length,i=0,soff=0;l>i&&buffers.length;i++)buffer[i]+=buffers[0][soff],soff>=buffers[0].length?(buffers.splice(0,1),soff=0):soff++;buffers.length&&(buffers[0]=buffers[0].subarray(soff))},proto.writeBufferAsync=function(buffer,delay){buffer="deinterleaved"===this.mode?Sink.interleave(buffer,this.channelCount):buffer;var buffers=this.asyncBuffers;return buffers.push({b:buffer,d:isNaN(delay)?~~((+new Date-this.previousHit)/1e3*this.sampleRate):delay}),buffers.length},proto.writeBufferSync=function(buffer){buffer="deinterleaved"===this.mode?Sink.interleave(buffer,this.channelCount):buffer;var buffers=this.syncBuffers;return buffers.push(buffer),buffers.length},proto.writeBuffer=function(){return this["async"===this.writeMode?"writeBufferAsync":"writeBufferSync"].apply(this,arguments)},proto.getSyncWriteOffset=function(){var i,buffers=this.syncBuffers,offset=0;for(i=0;buffers.length>i;i++)offset+=buffers[i].length;return offset}}(this.Sink);