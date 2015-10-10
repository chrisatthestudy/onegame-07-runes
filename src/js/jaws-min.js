
var jaws=(function(jaws){var title
var log_tag
jaws.title=function(value){if(value){return(title.innerHTML=value)}
return title.innerHTML}
jaws.unpack=function(){var make_global=["Sprite","SpriteList","Animation","Viewport","SpriteSheet","Parallax","TileMap","Rect","pressed"]
make_global.forEach(function(item,array,total){if(window[item]){jaws.log(item+"already exists in global namespace")}
else{window[item]=jaws[item]}});}
jaws.log=function(msg,append){if(log_tag){msg+="<br />"
if(append){log_tag.innerHTML=log_tag.innerHTML.toString()+msg}
else{log_tag.innerHTML=msg}}}
jaws.init=function(options){title=document.getElementsByTagName('title')[0]
jaws.url_parameters=jaws.getUrlParameters()
log_tag=document.getElementById('jaws-log')
if(jaws.url_parameters["debug"]){if(!log_tag){log_tag=document.createElement("div")
log_tag.id="jaws-log"
log_tag.style.cssText="overflow: auto; color: #aaaaaa; width: 300px; height: 150px; margin: 40px auto 0px auto; padding: 5px; border: #444444 1px solid; clear: both; font: 10px verdana; text-align: left;"
document.body.appendChild(log_tag)}}
jaws.canvas=document.getElementsByTagName('canvas')[0]
if(!jaws.canvas){jaws.dom=document.getElementById("canvas")}
if(jaws.canvas){jaws.context=jaws.canvas.getContext('2d');}
else if(jaws.dom){jaws.dom.style.position="relative";}
else{jaws.canvas=document.createElement("canvas")
jaws.canvas.width=options.width
jaws.canvas.height=options.height
jaws.context=jaws.canvas.getContext('2d')
document.body.appendChild(jaws.canvas)}
jaws.width=jaws.canvas?jaws.canvas.width:jaws.dom.offsetWidth
jaws.height=jaws.canvas?jaws.canvas.height:jaws.dom.offsetHeight
jaws.mouse_x=0
jaws.mouse_y=0
window.addEventListener("mousemove",saveMousePosition)}
function saveMousePosition(e){jaws.mouse_x=(e.pageX||e.clientX)
jaws.mouse_y=(e.pageY||e.clientX)
var game_area=jaws.canvas?jaws.canvas:jaws.dom
jaws.mouse_x-=game_area.offsetLeft
jaws.mouse_y-=game_area.offsetTop}
jaws.start=function(game_state,options,game_state_setup_options){if(!options)options={};var fps=options.fps||60
if(options.loading_screen===undefined)
options.loading_screen=true
if(!options.width)options.width=500;if(!options.height)options.height=300;jaws.init(options)
displayProgress(0)
jaws.log("setupInput()",true)
jaws.setupInput()
function displayProgress(percent_done){if(jaws.context&&options.loading_screen){jaws.context.save()
jaws.context.fillStyle="black"
jaws.context.fillRect(0,0,jaws.width,jaws.height);jaws.context.textAlign="center"
jaws.context.fillStyle="white"
jaws.context.font="15px terminal";jaws.context.fillText("Loading",jaws.width/2,jaws.height/2-30);jaws.context.font="bold 30px terminal";jaws.context.fillText(percent_done+"%",jaws.width/2,jaws.height/2);jaws.context.restore()}}
function assetLoaded(src,percent_done){jaws.log(percent_done+"%: "+src,true)
displayProgress(percent_done)}
function assetError(src){jaws.log("Error loading: "+src,true)}
function assetsLoaded(){jaws.log("all assets loaded",true)
jaws.switchGameState(game_state||window,{fps:fps},game_state_setup_options)}
jaws.log("assets.loadAll()",true)
if(jaws.assets.length()>0){jaws.assets.loadAll({onload:assetLoaded,onerror:assetError,onfinish:assetsLoaded})}
else{assetsLoaded()}}
jaws.switchGameState=function(game_state,options,game_state_setup_options){var fps=(options&&options.fps)||(jaws.game_loop&&jaws.game_loop.fps)||60
jaws.game_loop&&jaws.game_loop.stop()
jaws.clearKeyCallbacks()
if(jaws.isFunction(game_state)){game_state=new game_state}
jaws.previous_game_state=jaws.game_state
jaws.game_state=game_state
jaws.game_loop=new jaws.GameLoop(game_state,{fps:fps},game_state_setup_options)
jaws.game_loop.start()}
jaws.imageToCanvas=function(image){var canvas=document.createElement("canvas")
canvas.src=image.src
canvas.width=image.width
canvas.height=image.height
var context=canvas.getContext("2d")
context.drawImage(image,0,0,image.width,image.height)
return canvas}
jaws.forceArray=function(obj){return Array.isArray(obj)?obj:[obj]}
jaws.clear=function(){jaws.context.clearRect(0,0,jaws.width,jaws.height)}
jaws.isImage=function(obj){return Object.prototype.toString.call(obj)==="[object HTMLImageElement]"}
jaws.isCanvas=function(obj){return Object.prototype.toString.call(obj)==="[object HTMLCanvasElement]"}
jaws.isDrawable=function(obj){return jaws.isImage(obj)||jaws.isCanvas(obj)}
jaws.isString=function(obj){return(typeof obj=='string')}
jaws.isArray=function(obj){if(obj===undefined)return false;return!(obj.constructor.toString().indexOf("Array")==-1)}
jaws.isFunction=function(obj){return(Object.prototype.toString.call(obj)==="[object Function]")}
jaws.isOutsideCanvas=function(item){return(item.x<0||item.y<0||item.x>jaws.width||item.y>jaws.height)}
jaws.forceInsideCanvas=function(item){if(item.x<0){item.x=0}
if(item.x>jaws.width){item.x=jaws.width}
if(item.y<0){item.y=0}
if(item.y>jaws.height){item.y=jaws.height}}
jaws.getUrlParameters=function(){var vars=[],hash;var hashes=window.location.href.slice(window.location.href.indexOf('?')+1).split('&');for(var i=0;i<hashes.length;i++){hash=hashes[i].split('=');vars.push(hash[0]);vars[hash[0]]=hash[1];}
return vars;}
return jaws;})(jaws||{});var jaws=(function(jaws){var pressed_keys={}
var keycode_to_string=[]
var on_keydown_callbacks=[]
var on_keyup_callbacks=[]
var mousebuttoncode_to_string=[]
var ie_mousebuttoncode_to_string=[]
jaws.setupInput=function(){var k=[]
k[8]="backspace"
k[9]="tab"
k[13]="enter"
k[16]="shift"
k[17]="ctrl"
k[18]="alt"
k[19]="pause"
k[20]="capslock"
k[27]="esc"
k[32]="space"
k[33]="pageup"
k[34]="pagedown"
k[35]="end"
k[36]="home"
k[37]="left"
k[38]="up"
k[39]="right"
k[40]="down"
k[45]="insert"
k[46]="delete"
k[91]="leftwindowkey"
k[92]="rightwindowkey"
k[93]="selectkey"
k[106]="multiply"
k[107]="add"
k[109]="subtract"
k[110]="decimalpoint"
k[111]="divide"
k[144]="numlock"
k[145]="scrollock"
k[186]="semicolon"
k[187]="equalsign"
k[188]="comma"
k[189]="dash"
k[190]="period"
k[191]="forwardslash"
k[192]="graveaccent"
k[219]="openbracket"
k[220]="backslash"
k[221]="closebracket"
k[222]="singlequote"
var m=[]
m[0]="left_mouse_button"
m[1]="center_mouse_button"
m[2]="right_mouse_button"
var ie_m=[];ie_m[1]="left_mouse_button";ie_m[2]="right_mouse_button";ie_m[4]="center_mouse_button";mousebuttoncode_to_string=m
ie_mousebuttoncode_to_string=ie_m;var numpadkeys=["numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
var fkeys=["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
var numbers=["0","1","2","3","4","5","6","7","8","9"]
var letters=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
for(var i=0;numbers[i];i++){k[48+i]=numbers[i]}
for(var i=0;letters[i];i++){k[65+i]=letters[i]}
for(var i=0;numpadkeys[i];i++){k[96+i]=numpadkeys[i]}
for(var i=0;fkeys[i];i++){k[112+i]=fkeys[i]}
keycode_to_string=k
window.addEventListener("keydown",handleKeyDown)
window.addEventListener("keyup",handleKeyUp)
window.addEventListener("mousedown",handleMouseDown,false);window.addEventListener("mouseup",handleMouseUp,false);window.addEventListener("touchstart",handleTouchStart,false);window.addEventListener("touchend",handleTouchEnd,false);window.addEventListener("blur",resetPressedKeys,false);document.oncontextmenu=function(){return false};}
function resetPressedKeys(e){pressed_keys={};}
function handleKeyUp(e){event=(e)?e:window.event
var human_name=keycode_to_string[event.keyCode]
pressed_keys[human_name]=false
if(on_keyup_callbacks[human_name]){on_keyup_callbacks[human_name](human_name)
e.preventDefault()}
if(prevent_default_keys[human_name]){e.preventDefault()}}
function handleKeyDown(e){event=(e)?e:window.event
var human_name=keycode_to_string[event.keyCode]
pressed_keys[human_name]=true
if(on_keydown_callbacks[human_name]){on_keydown_callbacks[human_name](human_name)
e.preventDefault()}
if(prevent_default_keys[human_name]){e.preventDefault()}}
function handleMouseDown(e){event=(e)?e:window.event
var human_name=mousebuttoncode_to_string[event.button]
if(navigator.appName=="Microsoft Internet Explorer"){human_name=ie_mousebuttoncode_to_string[event.button];}
pressed_keys[human_name]=true
if(on_keydown_callbacks[human_name]){on_keydown_callbacks[human_name](human_name)
e.preventDefault()}}
function handleMouseUp(e){event=(e)?e:window.event
var human_name=mousebuttoncode_to_string[event.button]
if(navigator.appName=="Microsoft Internet Explorer"){human_name=ie_mousebuttoncode_to_string[event.button];}
pressed_keys[human_name]=false
if(on_keyup_callbacks[human_name]){on_keyup_callbacks[human_name](human_name)
e.preventDefault()}}
function handleTouchStart(e){event=(e)?e:window.event
pressed_keys["left_mouse_button"]=true
jaws.mouse_x=e.touches[0].pageX-jaws.canvas.offsetLeft;jaws.mouse_y=e.touches[0].pageY-jaws.canvas.offsetTop;}
function handleTouchEnd(e){event=(e)?e:window.event
pressed_keys["left_mouse_button"]=false
jaws.mouse_x=undefined;jaws.mouse_y=undefined;}
var prevent_default_keys=[]
jaws.preventDefaultKeys=function(array_of_strings){array_of_strings.forEach(function(item,index){prevent_default_keys[item]=true});}
jaws.pressed=function(key){return pressed_keys[key]}
jaws.on_keydown=function(key,callback){if(jaws.isArray(key)){for(var i=0;key[i];i++){on_keydown_callbacks[key[i]]=callback}}
else{on_keydown_callbacks[key]=callback}}
jaws.on_keyup=function(key,callback){if(jaws.isArray(key)){for(var i=0;key[i];i++){on_keyup_callbacks[key[i]]=callback}}
else{on_keyup_callbacks[key]=callback}}
jaws.clearKeyCallbacks=function(){on_keyup_callbacks=[]
on_keydown_callbacks=[]}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.Assets=function Assets(){if(!(this instanceof arguments.callee))return new arguments.callee();this.loaded=[]
this.loading=[]
this.src_list=[]
this.data=[]
this.bust_cache=false
this.image_to_canvas=true
this.fuchia_to_transparent=true
this.root=""
this.file_type={}
this.file_type["json"]="json"
this.file_type["wav"]="audio"
this.file_type["mp3"]="audio"
this.file_type["ogg"]="audio"
this.file_type["png"]="image"
this.file_type["jpg"]="image"
this.file_type["jpeg"]="image"
this.file_type["gif"]="image"
this.file_type["bmp"]="image"
this.file_type["tiff"]="image"
var that=this
this.length=function(){return this.src_list.length}
this.get=function(src){if(jaws.isArray(src)){return src.map(function(i){return that.data[i]})}
else{if(this.loaded[src]){return this.data[src]}
else{jaws.log("No such asset: "+src,true)}}}
this.isLoading=function(src){return this.loading[src]}
this.isLoaded=function(src){return this.loaded[src]}
this.getPostfix=function(src){postfix_regexp=/\.([a-zA-Z0-9]+)/;return postfix_regexp.exec(src)[1]}
this.getType=function(src){var postfix=this.getPostfix(src)
return(this.file_type[postfix]?this.file_type[postfix]:postfix)}
this.add=function(src){if(jaws.isArray(src)){for(var i=0;src[i];i++){this.add(src[i])}}
else{this.src_list.push(src)}
return this}
this.loadAll=function(options){this.load_count=0
this.error_count=0
this.onload=options.onload
this.onerror=options.onerror
this.onfinish=options.onfinish
for(i=0;this.src_list[i];i++){this.load(this.src_list[i])}}
this.getOrLoad=function(src,onload,onerror){if(this.data[src]){onload()}
else{this.load(src,onload,onerror)}}
this.load=function(src,onload,onerror){var asset={}
asset.src=src
asset.onload=onload
asset.onerror=onerror
this.loading[src]=true
var resolved_src=this.root+asset.src;if(this.bust_cache){resolved_src+="?"+parseInt(Math.random()*10000000)}
switch(this.getType(asset.src)){case"image":asset.image=new Image()
asset.image.asset=asset
asset.image.onload=this.assetLoaded
asset.image.onerror=this.assetError
asset.image.src=resolved_src
break;case"audio":asset.audio=new Audio(resolved_src)
asset.audio.asset=asset
this.data[asset.src]=asset.audio
asset.audio.addEventListener("canplay",this.assetLoaded,false);asset.audio.addEventListener("error",this.assetError,false);asset.audio.load()
break;default:var req=new XMLHttpRequest()
req.asset=asset
req.onreadystatechange=this.assetLoaded
req.open('GET',resolved_src,true)
req.send(null)
break;}}
this.assetLoaded=function(e){var asset=this.asset
var src=asset.src
var filetype=that.getType(asset.src)
that.loaded[src]=true
that.loading[src]=false
if(filetype=="json"){if(this.readyState!=4){return}
that.data[asset.src]=JSON.parse(this.responseText)}
else if(filetype=="image"){var new_image=that.image_to_canvas?jaws.imageToCanvas(asset.image):asset.image
if(that.fuchia_to_transparent&&that.getPostfix(asset.src)=="bmp"){new_image=fuchiaToTransparent(new_image)}
that.data[asset.src]=new_image}
else if(filetype=="audio"){asset.audio.removeEventListener("canplay",that.assetLoaded,false);that.data[asset.src]=asset.audio}
that.load_count++
that.processCallbacks(asset,true)}
this.assetError=function(e){var asset=this.asset
that.error_count++
that.processCallbacks(asset,false)}
this.processCallbacks=function(asset,ok){var percent=parseInt((that.load_count+that.error_count)/that.src_list.length*100)
if(ok){if(that.onload)that.onload(asset.src,percent);if(asset.onload)asset.onload();}
else{if(that.onerror)that.onerror(asset.src,percent);if(asset.onerror)asset.onerror(asset);}
if(percent==100){if(that.onfinish){that.onfinish()}
that.onload=null
that.onerror=null
that.onfinish=null}}}
function fuchiaToTransparent(image){canvas=jaws.isImage(image)?jaws.imageToCanvas(image):image
var context=canvas.getContext("2d")
var img_data=context.getImageData(0,0,canvas.width,canvas.height)
var pixels=img_data.data
for(var i=0;i<pixels.length;i+=4){if(pixels[i]==255&&pixels[i+1]==0&&pixels[i+2]==255){pixels[i+3]=0}}
context.putImageData(img_data,0,0);return canvas}
jaws.assets=new jaws.Assets()
return jaws;})(jaws||{});var jaws=(function(jaws){window.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback,element){window.setTimeout(callback,16.666);};})();jaws.GameLoop=function GameLoop(game_object,options,game_state_setup_options){if(!(this instanceof arguments.callee))return new arguments.callee(game_object,options);this.tick_duration=0
this.fps=0
this.ticks=0
var update_id
var paused=false
var stopped=false
var that=this
var mean_value=new MeanValue(20)
this.runtime=function(){return(this.last_tick-this.first_tick)}
this.start=function(){jaws.log("game loop start",true)
this.first_tick=(new Date()).getTime();this.current_tick=(new Date()).getTime();this.last_tick=(new Date()).getTime();if(game_object.setup){game_object.setup(game_state_setup_options)}
step_delay=1000/options.fps;if(options.fps==60){requestAnimFrame(this.loop)}
else{update_id=setInterval(this.loop,step_delay);}
jaws.log("game loop loop",true)}
this.loop=function(){that.current_tick=(new Date()).getTime();that.tick_duration=that.current_tick-that.last_tick
that.fps=mean_value.add(1000/that.tick_duration).get()
if(!stopped&&!paused){if(game_object.update){game_object.update()}
if(game_object.draw){game_object.draw()}
that.ticks++}
if(options.fps==60&&!stopped)requestAnimFrame(that.loop);that.last_tick=that.current_tick;}
this.pause=function(){paused=true}
this.unpause=function(){paused=false}
this.stop=function(){if(update_id)clearInterval(update_id);stopped=true;}}
function MeanValue(size){this.size=size
this.values=new Array(this.size)
this.value
this.add=function(value){if(this.values.length>this.size){this.values.splice(0,1)
this.value=0
for(var i=0;this.values[i];i++){this.value+=this.values[i]}
this.value=this.value/this.size}
this.values.push(value)
return this}
this.get=function(){return parseInt(this.value)}}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.Rect=function Rect(x,y,width,height){if(!(this instanceof arguments.callee))return new arguments.callee(x,y,width,height);this.x=x
this.y=y
this.width=width
this.height=height
this.right=x+width
this.bottom=y+height}
jaws.Rect.prototype.getPosition=function(){return[this.x,this.y]}
jaws.Rect.prototype.move=function(x,y){this.x+=x
this.y+=y
this.right+=x
this.bottom+=y
return this}
jaws.Rect.prototype.moveTo=function(x,y){this.x=x
this.y=y
this.right=this.x+this.width
this.bottom=this.y+this.height
return this}
jaws.Rect.prototype.resize=function(width,height){this.width+=width
this.height+=height
this.right=this.x+this.width
this.bottom=this.y+this.height
return this}
jaws.Rect.prototype.resizeTo=function(width,height){this.width=width
this.height=height
this.right=this.x+this.width
this.bottom=this.y+this.height
return this}
jaws.Rect.prototype.draw=function(){jaws.context.strokeStyle="red"
jaws.context.strokeRect(this.x,this.y,this.width,this.height)
return this}
jaws.Rect.prototype.collidePoint=function(x,y){return(x>=this.x&&x<=this.right&&y>=this.y&&y<=this.bottom)}
jaws.Rect.prototype.collideRect=function(rect){return((this.x>=rect.x&&this.x<=rect.right)||(rect.x>=this.x&&rect.x<=this.right))&&((this.y>=rect.y&&this.y<=rect.bottom)||(rect.y>=this.y&&rect.y<=this.bottom))}
jaws.Rect.prototype.toString=function(){return"[Rect "+this.x+", "+this.y+", "+this.width+", "+this.height+"]"}
return jaws;})(jaws||{});if(typeof module!=="undefined"&&('exports'in module)){module.exports=jaws.Rect}
var jaws=(function(jaws){jaws.Sprite=function Sprite(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.options=options
this.set(options)
if(options.context){this.context=options.context}
else if(options.dom){this.dom=options.dom
this.createDiv()}
if(!options.context&&!options.dom){if(jaws.context)this.context=jaws.context;else{this.dom=jaws.dom;this.createDiv()}}}
jaws.Sprite.prototype.set=function(options){this.scale_x=this.scale_y=(options.scale||1)
this.x=options.x||0
this.y=options.y||0
this.alpha=(options.alpha===undefined)?1:options.alpha
this.angle=options.angle||0
this.flipped=options.flipped||false
this.anchor(options.anchor||"top_left");if(options.anchor_x!==undefined)this.anchor_x=options.anchor_x;if(options.anchor_y!==undefined)this.anchor_y=options.anchor_y;options.image&&this.setImage(options.image);this.image_path=options.image;if(options.scale_image)this.scaleImage(options.scale_image);this.cacheOffsets()
return this}
jaws.Sprite.prototype.clone=function(object){var constructor=this._constructor?eval(this._constructor):this.constructor
var new_sprite=new constructor(this.attributes());new_sprite._constructor=this._constructor||this.constructor.name
return new_sprite}
jaws.Sprite.prototype.setImage=function(value){var that=this
if(jaws.isDrawable(value)){this.image=value
return this.cacheOffsets()}
else{if(jaws.assets.isLoaded(value)){this.image=jaws.assets.get(value);this.cacheOffsets();}
else{jaws.assets.load(value,function(){that.image=jaws.assets.get(value);that.cacheOffsets();})}}
return this}
jaws.Sprite.prototype.flip=function(){this.flipped=this.flipped?false:true;return this}
jaws.Sprite.prototype.flipTo=function(value){this.flipped=value;return this}
jaws.Sprite.prototype.rotate=function(value){this.angle+=value;return this}
jaws.Sprite.prototype.rotateTo=function(value){this.angle=value;return this}
jaws.Sprite.prototype.moveTo=function(x,y){this.x=x;this.y=y;return this}
jaws.Sprite.prototype.move=function(x,y){if(x)this.x+=x;if(y)this.y+=y;return this}
jaws.Sprite.prototype.scale=function(value){this.scale_x*=value;this.scale_y*=value;return this.cacheOffsets()}
jaws.Sprite.prototype.scaleTo=function(value){this.scale_x=this.scale_y=value;return this.cacheOffsets()}
jaws.Sprite.prototype.scaleWidth=function(value){this.scale_x*=value;return this.cacheOffsets()}
jaws.Sprite.prototype.scaleHeight=function(value){this.scale_y*=value;return this.cacheOffsets()}
jaws.Sprite.prototype.setX=function(value){this.x=value;return this}
jaws.Sprite.prototype.setY=function(value){this.y=value;return this}
jaws.Sprite.prototype.setTop=function(value){this.y=value+this.top_offset;return this}
jaws.Sprite.prototype.setBottom=function(value){this.y=value-this.bottom_offset;return this}
jaws.Sprite.prototype.setLeft=function(value){this.x=value+this.left_offset;return this}
jaws.Sprite.prototype.setRight=function(value){this.x=value-this.right_offset;return this}
jaws.Sprite.prototype.setWidth=function(value){this.scale_x=value/this.image.width;return this.cacheOffsets()}
jaws.Sprite.prototype.setHeight=function(value){this.scale_y=value/this.image.height;return this.cacheOffsets()}
jaws.Sprite.prototype.resize=function(width,height){this.scale_x=(this.width+width)/this.image.width
this.scale_y=(this.height+height)/this.image.height
return this.cacheOffsets()}
jaws.Sprite.prototype.resizeTo=function(width,height){this.scale_x=width/this.image.width
this.scale_y=height/this.image.height
return this.cacheOffsets()}
jaws.Sprite.prototype.anchor=function(value){var anchors={top_left:[0,0],left_top:[0,0],center_left:[0,0.5],left_center:[0,0.5],bottom_left:[0,1],left_bottom:[0,1],top_center:[0.5,0],center_top:[0.5,0],center_center:[0.5,0.5],center:[0.5,0.5],bottom_center:[0.5,1],center_bottom:[0.5,1],top_right:[1,0],right_top:[1,0],center_right:[1,0.5],right_center:[1,0.5],bottom_right:[1,1],right_bottom:[1,1]}
if(a=anchors[value]){this.anchor_x=a[0]
this.anchor_y=a[1]
if(this.image)this.cacheOffsets();}
return this}
jaws.Sprite.prototype.cacheOffsets=function(){if(!this.image){return}
this.width=this.image.width*this.scale_x
this.height=this.image.height*this.scale_y
this.left_offset=this.width*this.anchor_x
this.top_offset=this.height*this.anchor_y
this.right_offset=this.width*(1.0-this.anchor_x)
this.bottom_offset=this.height*(1.0-this.anchor_y)
if(this.cached_rect)this.cached_rect.resizeTo(this.width,this.height);return this}
jaws.Sprite.prototype.rect=function(){if(!this.cached_rect)this.cached_rect=new jaws.Rect(this.x,this.top,this.width,this.height)
this.cached_rect.moveTo(this.x-this.left_offset,this.y-this.top_offset)
return this.cached_rect}
jaws.Sprite.prototype.createDiv=function(){this.div=document.createElement("div")
this.div.style.position="absolute"
if(this.image){this.div.style.width=this.image.width+"px"
this.div.style.height=this.image.height+"px"
if(this.image.toDataURL){this.div.style.backgroundImage="url("+this.image.toDataURL()+")"}
else{this.div.style.backgroundImage="url("+this.image.src+")"}}
if(this.dom){this.dom.appendChild(this.div)}
this.updateDiv()}
jaws.Sprite.prototype.updateDiv=function(){this.div.style.left=this.x+"px"
this.div.style.top=this.y+"px"
var transform=""
transform+="rotate("+this.angle+"deg) "
if(this.flipped){transform+="scale(-"+this.scale_x+","+this.scale_y+")";}
else{transform+="scale("+this.scale_x+","+this.scale_y+")";}
this.div.style.MozTransform=transform
this.div.style.WebkitTransform=transform
this.div.style.OTransform=transform
this.div.style.msTransform=transform
this.div.style.transform=transform
return this}
jaws.Sprite.prototype.draw=function(){if(!this.image){return this}
if(this.dom){return this.updateDiv()}
this.context.save()
this.context.translate(this.x,this.y)
if(this.angle!=0){jaws.context.rotate(this.angle*Math.PI/180)}
this.flipped&&this.context.scale(-1,1)
this.context.globalAlpha=this.alpha
this.context.translate(-this.left_offset,-this.top_offset)
this.context.drawImage(this.image,0,0,this.width,this.height)
this.context.restore()
return this}
jaws.Sprite.prototype.scaleImage=function(factor){if(!this.image)return;this.setImage(jaws.gfx.retroScaleImage(this.image,factor))
return this}
jaws.Sprite.prototype.asCanvasContext=function(){var canvas=document.createElement("canvas")
canvas.width=this.width
canvas.height=this.height
var context=canvas.getContext("2d")
context.mozImageSmoothingEnabled=jaws.context.mozImageSmoothingEnabled
context.drawImage(this.image,0,0,this.width,this.height)
return context}
jaws.Sprite.prototype.asCanvas=function(){var canvas=document.createElement("canvas")
canvas.width=this.width
canvas.height=this.height
var context=canvas.getContext("2d")
context.mozImageSmoothingEnabled=jaws.context.mozImageSmoothingEnabled
context.drawImage(this.image,0,0,this.width,this.height)
return canvas}
jaws.Sprite.prototype.toString=function(){return"[Sprite "+this.x.toFixed(2)+", "+this.y.toFixed(2)+", "+this.width+", "+this.height+"]"}
jaws.Sprite.prototype.attributes=function(){var object=this.options
object["_constructor"]=this._constructor||"jaws.Sprite"
object["x"]=parseFloat(this.x.toFixed(2))
object["y"]=parseFloat(this.y.toFixed(2))
object["image"]=this.image_path
object["alpha"]=this.alpha
object["flipped"]=this.flipped
object["angle"]=parseFloat(this.angle.toFixed(2))
object["scale_x"]=this.scale_x;object["scale_y"]=this.scale_y;object["anchor_x"]=this.anchor_x
object["anchor_y"]=this.anchor_y
return object}
jaws.Sprite.prototype.toJSON=function(){return JSON.stringify(this.attributes())}
return jaws;})(jaws||{});if(typeof module!=="undefined"&&('exports'in module)){module.exports=jaws.Sprite}
var jaws=(function(jaws){jaws.SpriteList=function SpriteList(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.sprites=[]
this.length=0
if(options)this.load(options);}
jaws.SpriteList.prototype.at=function(index){return this.sprites[index]}
jaws.SpriteList.prototype.concat=function(){return this.sprites.concat.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.indexOf=function(searchElement,fromIndex){return this.sprites.indexOf(searchElement,fromIndex)}
jaws.SpriteList.prototype.join=function(separator){return this.sprites.join(separator)}
jaws.SpriteList.prototype.lastIndexOf=function(){return this.sprites.lastIndexOf.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.pop=function(){var element=this.sprites.pop()
this.updateLength()
return element}
jaws.SpriteList.prototype.push=function(){this.sprites.push.apply(this.sprites,arguments)
this.updateLength()
return this.length}
jaws.SpriteList.prototype.reverse=function(){this.sprites.reverse()}
jaws.SpriteList.prototype.shift=function(){var element=this.sprites.shift()
this.updateLength()
return element}
jaws.SpriteList.prototype.slice=function(start,end){return this.sprites.slice(start,end)}
jaws.SpriteList.prototype.sort=function(){this.sprites.sort.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.splice=function(){var removedElements=this.sprites.splice.apply(this.sprites,arguments)
this.updateLength()
return removedElements}
jaws.SpriteList.prototype.unshift=function(){this.sprites.unshift.apply(this.sprites,arguments)
this.updateLength()
return this.length}
jaws.SpriteList.prototype.updateLength=function(){this.length=this.sprites.length}
jaws.SpriteList.prototype.valueOf=function(){return this.toString()}
jaws.SpriteList.prototype.filter=function(){return this.sprites.filter.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.forEach=function(){this.sprites.forEach.apply(this.sprites,arguments)
this.updateLength()}
jaws.SpriteList.prototype.every=function(){return this.sprites.every.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.map=function(){return this.sprites.map.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.reduce=function(){return this.sprites.reduce.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.reduceRight=function(){return this.sprites.reduceRight.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.some=function(){return this.sprites.some.apply(this.sprites,arguments)}
jaws.SpriteList.prototype.isSpriteList=function(){return true;}
jaws.SpriteList.prototype.load=function(objects){var that=this;if(jaws.isArray(objects)){if(objects.every(function(item){return item._constructor})){parseArray(objects)}else{this.sprites=objects}}
else if(jaws.isString(objects)){parseArray(JSON.parse(objects));console.log(objects)}
this.updateLength()
function parseArray(array){array.forEach(function(data){var constructor=data._constructor?eval(data._constructor):data.constructor
if(jaws.isFunction(constructor)){jaws.log("Creating "+data._constructor+"("+data.toString()+")",true)
var object=new constructor(data)
object._constructor=data._constructor||data.constructor.name
that.push(object);}});}}
jaws.SpriteList.prototype.remove=function(obj){var index=this.indexOf(obj)
if(index>-1){this.splice(index,1)}
this.updateLength()}
jaws.SpriteList.prototype.draw=function(){this.forEach(function(ea){ea.draw()})}
jaws.SpriteList.prototype.drawIf=function(condition){this.forEach(function(ea){if(condition(ea)){ea.draw()}})}
jaws.SpriteList.prototype.update=function(){this.forEach(function(ea){ea.update()})}
jaws.SpriteList.prototype.updateIf=function(condition){this.forEach(function(ea){if(condition(ea)){ea.update()}})}
jaws.SpriteList.prototype.deleteIf=function(condition){this.removeIf(condition)}
jaws.SpriteList.prototype.removeIf=function(condition){this.sprites=this.filter(function(ea){return!condition(ea)})
this.updateLength()}
jaws.SpriteList.prototype.toString=function(){return"[SpriteList "+this.length+" sprites]"}
return jaws;})(jaws||{});var jaws=(function(jaws){function cutImage(image,x,y,width,height){var cut=document.createElement("canvas")
cut.width=width
cut.height=height
var ctx=cut.getContext("2d")
ctx.drawImage(image,x,y,width,height,0,0,cut.width,cut.height)
return cut};jaws.SpriteSheet=function SpriteSheet(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.image=jaws.isDrawable(options.image)?options.image:jaws.assets.data[options.image]
this.orientation=options.orientation||"down"
this.frame_size=options.frame_size||[32,32]
this.frames=[]
this.offset=options.offset||0
if(options.scale_image){var image=(jaws.isDrawable(options.image)?options.image:jaws.assets.get(options.image))
this.frame_size[0]*=options.scale_image
this.frame_size[1]*=options.scale_image
options.image=jaws.gfx.retroScaleImage(image,options.scale_image)}
var index=0
if(this.orientation=="down"){for(var x=this.offset;x<this.image.width;x+=this.frame_size[0]){for(var y=0;y<this.image.height;y+=this.frame_size[1]){this.frames.push(cutImage(this.image,x,y,this.frame_size[0],this.frame_size[1]))}}}
else{for(var y=this.offset;y<this.image.height;y+=this.frame_size[1]){for(var x=0;x<this.image.width;x+=this.frame_size[0]){this.frames.push(cutImage(this.image,x,y,this.frame_size[0],this.frame_size[1]))}}}}
jaws.SpriteSheet.prototype.toString=function(){return"[SpriteSheet "+this.frames.length+" frames]"}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.Parallax=function Parallax(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.scale=options.scale||1
this.repeat_x=options.repeat_x
this.repeat_y=options.repeat_y
this.camera_x=options.camera_x||0
this.camera_y=options.camera_y||0
this.layers=[]}
jaws.Parallax.prototype.draw=function(options){var layer,numx,numy,initx;for(var i=0;i<this.layers.length;i++){layer=this.layers[i]
if(this.repeat_x){initx=-((this.camera_x/layer.damping)%layer.width);}else{initx=-(this.camera_x/layer.damping)}
if(this.repeat_y){layer.y=-((this.camera_y/layer.damping)%layer.height)-layer.height;}else{layer.y=-(this.camera_y/layer.damping);}
layer.x=initx;while(layer.y<jaws.height){while(layer.x<jaws.width){if(layer.x+layer.width>=0&&layer.y+layer.height>=0){layer.draw();}
layer.x=layer.x+layer.width;if(!this.repeat_x){break;}}
layer.y=layer.y+layer.height;layer.x=initx;if(!this.repeat_y){break;}}}}
jaws.Parallax.prototype.addLayer=function(options){var layer=new jaws.ParallaxLayer(options)
layer.scale(this.scale)
this.layers.push(layer)}
jaws.Parallax.prototype.toString=function(){return"[Parallax "+this.x+", "+this.y+". "+this.layers.length+" layers]"}
jaws.ParallaxLayer=function ParallaxLayer(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.damping=options.damping||0
jaws.Sprite.call(this,options)}
jaws.ParallaxLayer.prototype=jaws.Sprite.prototype
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.Animation=function Animation(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.options=options
this.frames=options.frames||[]
this.frame_duration=options.frame_duration||100
this.index=options.index||0
this.loop=(options.loop==undefined)?1:options.loop
this.bounce=options.bounce||0
this.frame_direction=options.frame_direction||1;this.frame_size=options.frame_size
this.orientation=options.orientation||"down"
this.on_end=options.on_end||null
this.offset=options.offset||0
if(options.scale_image){var image=(jaws.isDrawable(options.sprite_sheet)?options.sprite_sheet:jaws.assets.get(options.sprite_sheet))
this.frame_size[0]*=options.scale_image
this.frame_size[1]*=options.scale_image
options.sprite_sheet=jaws.gfx.retroScaleImage(image,options.scale_image)}
if(options.sprite_sheet){var image=(jaws.isDrawable(options.sprite_sheet)?options.sprite_sheet:jaws.assets.get(options.sprite_sheet))
var sprite_sheet=new jaws.SpriteSheet({image:image,frame_size:this.frame_size,orientation:this.orientation,offset:this.offset})
this.frames=sprite_sheet.frames}
this.current_tick=(new Date()).getTime();this.last_tick=(new Date()).getTime();this.sum_tick=0}
jaws.Animation.prototype.update=function(){this.current_tick=(new Date()).getTime();this.sum_tick+=(this.current_tick-this.last_tick);this.last_tick=this.current_tick;if(this.sum_tick>this.frame_duration){this.index+=this.frame_direction
this.sum_tick=0}
if((this.index>=this.frames.length)||(this.index<0)){if(this.bounce){this.frame_direction=-this.frame_direction
this.index+=this.frame_direction*2}
else if(this.loop){if(this.index<0){this.index=this.frames.length-1;}else{this.index=0;}}
else{this.index-=this.frame_direction
if(this.on_end){this.on_end()
this.on_end=null}}}
return this}
jaws.Animation.prototype.slice=function(start,stop){var o={}
o.frame_duration=this.frame_duration
o.loop=this.loop
o.bounce=this.bounce
o.on_end=this.on_end
o.frame_direction=this.frame_direction
o.frames=this.frames.slice().slice(start,stop)
return new jaws.Animation(o)};jaws.Animation.prototype.next=function(){this.update()
return this.frames[this.index]};jaws.Animation.prototype.atLastFrame=function(){return(this.index==this.frames.length-1)}
jaws.Animation.prototype.atFirstFrame=function(){return(this.index==0)}
jaws.Animation.prototype.currentFrame=function(){return this.frames[this.index]};jaws.Animation.prototype.toString=function(){return"[Animation, "+this.frames.length+" frames]"}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.Viewport=function ViewPort(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.options=options
this.context=options.context||jaws.context
this.width=options.width||jaws.width
this.height=options.height||jaws.height
this.max_x=options.max_x||jaws.width
this.max_y=options.max_y||jaws.height
this.x=options.x||0
this.y=options.y||0
var that=this
this.move=function(x,y){x&&(this.x+=x)
y&&(this.y+=y)
this.verifyPosition()};this.moveTo=function(x,y){if(!(x==undefined)){this.x=x}
if(!(y==undefined)){this.y=y}
this.verifyPosition()};this.isOutside=function(item){return(!that.isInside(item))};this.isInside=function(item){return(item.x>=that.x&&item.x<=(that.x+that.width)&&item.y>=that.y&&item.y<=(that.y+that.height))};this.isPartlyInside=function(item){var rect=item.rect()
return(rect.right>=that.x&&rect.x<=(that.x+that.width)&&rect.bottom>=that.y&&item.y<=(that.y+that.height))};this.isLeftOf=function(item){return(item.x<that.x)}
this.isRightOf=function(item){return(item.x>(that.x+that.width))}
this.isAbove=function(item){return(item.y<that.y)}
this.isBelow=function(item){return(item.y>(that.y+that.height))}
this.centerAround=function(item){this.x=Math.floor(item.x-this.width/2);this.y=Math.floor(item.y-this.height/2);this.verifyPosition();};this.centerAroundX=function(item){this.x=Math.floor(item.x-this.width/2);this.verifyPosition();};this.centerAroundY=function(item){this.y=Math.floor(item.y-this.height/2);this.verifyPosition();};this.forceInsideVisibleArea=function(item,buffer){if(item.x<this.x+buffer){item.x=this.x+buffer}
if(item.x>this.x+jaws.width-buffer){item.x=this.x+jaws.width-buffer}
if(item.y<this.y+buffer){item.y=this.y+buffer}
if(item.y>this.y+jaws.height-buffer){item.y=this.y+jaws.height-buffer}}
this.forceInside=function(item,buffer){if(item.x<buffer){item.x=buffer}
if(item.x>this.max_x-buffer){item.x=this.max_x-buffer}
if(item.y<buffer){item.y=buffer}
if(item.y>this.max_y-buffer){item.y=this.max_y-buffer}}
this.apply=function(func){this.context.save()
this.context.translate(-this.x,-this.y)
func()
this.context.restore()};this.draw=function(obj){this.apply(function(){if(obj.forEach)obj.forEach(that.drawIfPartlyInside);else if(obj.draw)that.drawIfPartlyInside(obj);});}
this.drawTileMap=function(tile_map){var sprites=tile_map.atRect({x:this.x,y:this.y,right:this.x+this.width,bottom:this.y+this.height})
this.apply(function(){for(var i=0;i<sprites.length;i++)sprites[i].draw();});}
this.drawIfPartlyInside=function(item){if(that.isPartlyInside(item))item.draw();}
this.verifyPosition=function(){var max=this.max_x-this.width
if(this.x<0){this.x=0}
if(this.x>max){this.x=max}
var max=this.max_y-this.height
if(this.y<0){this.y=0}
if(this.y>max){this.y=max}};this.moveTo(options.x||0,options.y||0)}
jaws.Viewport.prototype.toString=function(){return"[Viewport "+this.x.toFixed(2)+", "+this.y.toFixed(2)+", "+this.width+", "+this.height+"]"}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.TileMap=function TileMap(options){if(!(this instanceof arguments.callee))return new arguments.callee(options);this.cell_size=options.cell_size||[32,32]
this.size=options.size||[100,100]
this.sortFunction=options.sortFunction
this.cells=new Array(this.size[0])
for(var col=0;col<this.size[0];col++){this.cells[col]=new Array(this.size[1])
for(var row=0;row<this.size[1];row++){this.cells[col][row]=[]}}}
jaws.TileMap.prototype.clear=function(){for(var col=0;col<this.size[0];col++){for(var row=0;row<this.size[1];row++){this.cells[col][row]=[]}}}
jaws.TileMap.prototype.sortCells=function(sortFunction){for(var col=0;col<this.size[0];col++){for(var row=0;row<this.size[1];row++){this.cells[col][row].sort(sortFunction)}}}
jaws.TileMap.prototype.push=function(obj){var that=this
if(obj.forEach){obj.forEach(function(item){that.push(item)})
return obj}
if(obj.rect){return this.pushAsRect(obj,obj.rect())}
else{var col=parseInt(obj.x/this.cell_size[0])
var row=parseInt(obj.y/this.cell_size[1])
return this.pushToCell(col,row,obj)}}
jaws.TileMap.prototype.pushAsPoint=function(obj){if(Array.isArray(obj)){for(var i=0;i<obj.length;i++){this.pushAsPoint(obj[i])}
return obj}
else{var col=parseInt(obj.x/this.cell_size[0])
var row=parseInt(obj.y/this.cell_size[1])
return this.pushToCell(col,row,obj)}}
jaws.TileMap.prototype.pushAsRect=function(obj,rect){var from_col=parseInt(rect.x/this.cell_size[0])
var to_col=parseInt((rect.right-1)/this.cell_size[0])
for(var col=from_col;col<=to_col;col++){var from_row=parseInt(rect.y/this.cell_size[1])
var to_row=parseInt((rect.bottom-1)/this.cell_size[1])
for(var row=from_row;row<=to_row;row++){this.pushToCell(col,row,obj)}}
return obj}
jaws.TileMap.prototype.pushToCell=function(col,row,obj){this.cells[col][row].push(obj)
if(this.sortFunction)this.cells[col][row].sort(this.sortFunction);return this}
jaws.TileMap.prototype.at=function(x,y){var col=parseInt(x/this.cell_size[0])
var row=parseInt(y/this.cell_size[1])
return this.cells[col][row]}
jaws.TileMap.prototype.atRect=function(rect){var objects=[]
var items
try{var from_col=parseInt(rect.x/this.cell_size[0])
if(from_col<0){from_col=0}
var to_col=parseInt(rect.right/this.cell_size[0])
if(to_col>=this.size[0]){to_col=this.size[0]-1}
var from_row=parseInt(rect.y/this.cell_size[1])
if(from_row<0){from_row=0}
var to_row=parseInt(rect.bottom/this.cell_size[1])
if(to_row>=this.size[1]){to_row=this.size[1]-1}
for(var col=from_col;col<=to_col;col++){for(var row=from_row;row<=to_row;row++){this.cells[col][row].forEach(function(item,total){if(objects.indexOf(item)==-1){objects.push(item)}})}}}
catch(e){}
return objects}
jaws.TileMap.prototype.all=function(){var all=[]
for(var col=0;col<this.size[0];col++){for(var row=0;row<this.size[1];row++){this.cells[col][row].forEach(function(element,total){all.push(element)});}}
return all}
jaws.TileMap.prototype.cell=function(col,row){return this.cells[col][row]}
jaws.TileMap.prototype.findPath=function(start_position,end_position,inverted){if(typeof inverted=='undefined'){inverted=false}
var start_col=parseInt(start_position[0]/this.cell_size[0])
var start_row=parseInt(start_position[1]/this.cell_size[1])
var end_col=parseInt(end_position[0]/this.cell_size[0])
var end_row=parseInt(end_position[1]/this.cell_size[1])
if(start_col===end_col&&start_row===end_row){return[{x:start_position[0],y:start_position[1]}]}
var col=start_col
var row=start_row
var step=0
var score=0
var max_distance=(this.size[0]*this.size[1]*2)+1
var open_nodes=new Array(this.size[0])
for(var i=0;i<this.size[0];i++){open_nodes[i]=new Array(this.size[1])
for(var j=0;j<this.size[1];j++){open_nodes[i][j]=false}}
open_nodes[col][row]={parent:[],G:0,score:max_distance}
var closed_nodes=new Array(this.size[0])
for(var i=0;i<this.size[0];i++){closed_nodes[i]=new Array(this.size[1])
for(var j=0;j<this.size[1];j++){closed_nodes[i][j]=false}}
var crowFlies=function(from_node,to_node){return Math.abs(to_node[0]-from_node[0])+Math.abs(to_node[1]-from_node[1]);}
var findInClosed=function(col,row){if(closed_nodes[col][row])
{return true}
else{return false}}
while(!(col===end_col&&row===end_row)){var left_right_up_down=[]
if(col>0){left_right_up_down.push([col-1,row])}
if(col<this.size[0]-1){left_right_up_down.push([col+1,row])}
if(row>0){left_right_up_down.push([col,row-1])}
if(row<this.size[1]-1){left_right_up_down.push([col,row+1])}
for(var i=0;i<left_right_up_down.length;i++){var c=left_right_up_down[i][0]
var r=left_right_up_down[i][1]
if(((this.cell(c,r).length===0&&!inverted)||(this.cell(c,r).length>0&&inverted))&&!findInClosed(c,r))
{score=step+1+crowFlies([c,r],[end_col,end_row])
if(!open_nodes[c][r]||(open_nodes[c][r]&&open_nodes[c][r].score>score)){open_nodes[c][r]={parent:[col,row],G:step+1,score:score}}}}
var best_node={node:[],parent:[],score:max_distance,G:0}
for(var i=0;i<this.size[0];i++){for(var j=0;j<this.size[1];j++){if(open_nodes[i][j]&&open_nodes[i][j].score<best_node.score){best_node.node=[i,j]
best_node.parent=open_nodes[i][j].parent
best_node.score=open_nodes[i][j].score
best_node.G=open_nodes[i][j].G}}}
if(best_node.node.length===0){return[]}
open_nodes[best_node.node[0]][best_node.node[1]]=false
col=best_node.node[0]
row=best_node.node[1]
step=best_node.G
closed_nodes[col][row]={parent:best_node.parent}}
var path=[]
var current_node=closed_nodes[col][row]
path.unshift({x:col*this.cell_size[0],y:row*this.cell_size[1]})
while(!(col===start_col&&row===start_row)){col=current_node.parent[0]
row=current_node.parent[1]
path.unshift({x:col*this.cell_size[0],y:row*this.cell_size[1]})
current_node=closed_nodes[col][row]}
return path}
jaws.TileMap.prototype.lineOfSight=function(start_position,end_position,inverted){if(typeof inverted=='undefined'){inverted=false}
var x0=start_position[0]
var x1=end_position[0]
var y0=start_position[1]
var y1=end_position[1]
var dx=Math.abs(x1-x0)
var dy=Math.abs(y1-y0)
var sx,sy
if(x0<x1){sx=1}else{sx=-1}
if(y0<y1){sy=1}else{sy=-1}
var err=dx-dy
var e2
while(!(x0===x1&&y0===y1))
{if(inverted){if(this.at(x0,y0).length===0){return false}}
else{if(this.at(x0,y0).length>0){return false}}
e2=2*err
if(e2>-dy)
{err=err-dy
x0=x0+sx}
if(e2<dx)
{err=err+dx
y0=y0+sy}}
return true}
jaws.TileMap.prototype.toString=function(){return"[TileMap "+this.size[0]+" cols, "+this.size[1]+" rows]"}
return jaws;})(jaws||{});if(typeof module!=="undefined"&&('exports'in module)){module.exports=jaws.TileMap}
var jaws=(function(jaws){jaws.collideOneWithOne=function(object1,object2){if(object1.radius&&object2.radius&&object1!==object2&&jaws.collideCircles(object1,object2))return true;if(object1.rect&&object2.rect&&object1!==object2&&jaws.collideRects(object1.rect(),object2.rect()))return true;return false;}
jaws.collideOneWithMany=function(object,list){return list.filter(function(item){return jaws.collideOneWithOne(object,item)})}
jaws.collideManyWithMany=function(list1,list2){var a=[]
if(list1===list2){combinations(list1,2).forEach(function(pair){if(jaws.collideOneWithOne(pair[0],pair[1]))a.push([pair[0],pair[1]]);});}
else{list1.forEach(function(item1){list2.forEach(function(item2){if(jaws.collideOneWithOne(item1,item2))a.push([item1,item2])});});}
return a;}
jaws.collideCircles=function(object1,object2){return(jaws.distanceBetween(object1,object2)<object1.radius+object2.radius)}
jaws.collideRects=function(rect1,rect2){return((rect1.x>=rect2.x&&rect1.x<=rect2.right)||(rect2.x>=rect1.x&&rect2.x<=rect1.right))&&((rect1.y>=rect2.y&&rect1.y<=rect2.bottom)||(rect2.y>=rect1.y&&rect2.y<=rect1.bottom))}
jaws.distanceBetween=function(object1,object2){return Math.sqrt(Math.pow(object1.x-object2.x,2)+Math.pow(object1.y-object2.y,2))}
function combinations(list,n){var f=function(i){if(list.isSpriteList!==undefined){return list.at(i)}else{return list[i];}};var r=[];var m=new Array(n);for(var i=0;i<n;i++)m[i]=i;for(var i=n-1,sn=list.length;0<=i;sn=list.length){r.push(m.map(f));while(0<=i&&m[i]==sn-1){i--;sn--;}
if(0<=i){m[i]+=1;for(var j=i+1;j<n;j++)m[j]=m[j-1]+1;i=n-1;}}
return r;}
function hasItems(array){return(array&&array.length>0)}
return jaws;})(jaws||{});var jaws=(function(jaws){jaws.gfx={}
jaws.gfx.retroScaleImage=function(image,factor){var canvas=jaws.isImage(image)?jaws.imageToCanvas(image):image
var context=canvas.getContext("2d")
var data=context.getImageData(0,0,canvas.width,canvas.height).data
var canvas2=document.createElement("canvas")
canvas2.width=image.width*factor
canvas2.height=image.height*factor
var context2=canvas2.getContext("2d")
var to_data=context2.createImageData(canvas2.width,canvas2.height)
var w2=to_data.width
var h2=to_data.height
for(var y=0;y<h2;y+=1){var y2=Math.floor(y/factor)
var y_as_x=y*to_data.width
var y2_as_x=y2*image.width
for(var x=0;x<w2;x+=1){var x2=Math.floor(x/factor)
var y_dst=(y_as_x+x)*4
var y_src=(y2_as_x+x2)*4
to_data.data[y_dst]=data[y_src];to_data.data[y_dst+1]=data[y_src+1];to_data.data[y_dst+2]=data[y_src+2];to_data.data[y_dst+3]=data[y_src+3];}}
context2.putImageData(to_data,0,0)
return canvas2}
return jaws;})(jaws||{});;window.addEventListener("load",function(){if(jaws.onload)jaws.onload();},false);