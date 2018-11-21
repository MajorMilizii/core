PROJECT.APP=function(on_start)
{//конструктор
    var here=this;
    var preloading=null;
    var actions=[];
    var first_click=false;

    here.on_start=on_start;
    here.on_resize_functions=[];
    here.on_update_functions=[];
    here.custom_types={};
    here.busy=0;
    here.on_first_click=null;
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------    
    function AVK_REQ()
	{//запрос
		var loc=this;

		function get_req()
		{
			var xmlhttp;
			try
			{
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e)
			{
				try
				{
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (E)
				{
					xmlhttp = false;
				}
			}
			if (!xmlhttp && typeof XMLHttpRequest != 'undefined')
			{
				xmlhttp = new XMLHttpRequest();
			}
			return xmlhttp;
		}

		function on_complete (data)
		{
			if (loc.xmlhttp.readyState == 4)
			{
				if (loc.xmlhttp.status == 200)
				{
					var response = loc.xmlhttp.responseText;
					if (loc.on_back!=null)
						loc.on_back(response);
					loc.on_back=null;
					loc.active=false;
				}
			}
		}

		loc.xmlhttp = get_req();
		loc.on_back=null;
		loc.active=false;
		loc.xmlhttp.onreadystatechange = on_complete;

		loc.save=function(php,info,str,on_back)
		{
			loc.on_back=on_back;
			loc.xmlhttp.open('POST', php, true);
			loc.xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			loc.xmlhttp.send("data="+str+"&info="+info);
			loc.active=true;
		}

		loc.load=function(path,on_back)
		{
			loc.active=true;
			loc.on_back=on_back;
			loc.xmlhttp.open('GET', path, true);
			loc.xmlhttp.send(null);
		}
	}

	var requests=[];

	function get_request()
	{
		for (var i=0;i<requests.length;i++)
			if (!requests[i].active)
				break;

		if (i<requests.length)
			return requests[i];

		requests.push(new AVK_REQ());
		return requests[i];
    }

    here.save=function(php,info,str,on_back)
    {
        get_request().save(php,info,str,on_back);
    }

    here.load=function(path,on_back)
    {
        get_request().load(path,on_back);
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------    
    here.application = new PIXI.Application(PROJECT.DAT.width, PROJECT.DAT.height, {backgroundColor : PROJECT.DAT.color});
    document.body.appendChild(here.application.view);
    here.application.view.style.position = "absolute";
    here.application.view.style["z-index"] = "1";
    
    here.shadow=new PIXI.Graphics();
    here.shadow.beginFill(0,0.75);
    here.shadow.drawRect(0,0,PROJECT.DAT.width,PROJECT.DAT.height);
    here.shadow.endFill();
    here.shadow.interactive=true;

    here.preloader_gfx=new PIXI.Container();
    here.up_gfx=new PIXI.Container();
    here.msg_up_gfx=new PIXI.Container();
    here.msg_down_gfx=new PIXI.Container();
    here.middle_gfx=new PIXI.Container();
    here.down_gfx=new PIXI.Container();
    here.application.stage.addChild(here.down_gfx);
    here.application.stage.addChild(here.middle_gfx);
    here.application.stage.addChild(here.msg_down_gfx);
    here.application.stage.addChild(here.shadow);
    here.application.stage.addChild(here.msg_up_gfx);
    here.application.stage.addChild(here.up_gfx);
    here.application.stage.addChild(here.preloader_gfx);

    here.shadow.visible=false;
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------    
    function on_vis_change(data)
    {
        if (document.hidden)
            PIXI.sound.pauseAll();
        else
            PIXI.sound.resumeAll();
    }

    here.on_resize=function()
    {//обработчик ресайза
        var width = window.innerWidth || document.body.clientWidth;
        var height = window.innerHeight || document.body.clientHeight;
		if (width<1)
            width=1;
		if (height<1)
            height=1;

        var project_hw=PROJECT.DAT.height/PROJECT.DAT.width;
        var view_hw=height/width;

        if (view_hw<project_hw)
        {
            var view_w=Math.floor(height/project_hw);
            var view_h=height;
        }else
        {
            var view_w=width;
            var view_h=Math.floor(width*project_hw);
        }

        here.dx=Math.floor((width-view_w)/2);
        here.dy=Math.floor((height-view_h)/2);
        here.scale=view_h/PROJECT.DAT.height;

		here.application.view.style.width = view_w+"px";
        here.application.view.style.height = view_h+"px";
        here.application.view.style.left = here.dx+"px";
        here.application.view.style.top = here.dy+"px";
		
        for (var i=0;i<here.on_resize_functions.length;i++)
            here.on_resize_functions[i]();

		window.scrollTo(0, 1);
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.hide_preloader=function(on_hided)
    {
        PROJECT.PRELOADER.hide(on_hided);
    }

    function on_preloading(delta)
    {
        PROJECT.PRELOADER.set_progress(PIXI.loader.progress/100);
    }
    
    function on_preloader_loaded(loader,res)
    {
        PROJECT.PRELOADER.show(here);

        PIXI.loader.reset();
        for(var key in PROJECT.DAT.assets)
            PIXI.loader.add(key, PROJECT.DAT.assets[key]);
        
        
        for(key in PROJECT.DAT.sounds)
            PIXI.loader.add(key, PROJECT.DAT.sounds[key]); 
            
        PIXI.loader.load(on_loaded);

        here.preloader_cnt=0;
        preloading=new PIXI.ticker.Ticker();
        preloading.add(on_preloading);
        preloading.start();
    }

    document.addEventListener('visibilitychange',on_vis_change, false);
    window.addEventListener('resize', here.on_resize);
    window.onorientationchange = here.on_resize;
    here.on_resize();
    setTimeout(function(){window.scrollTo(0,1);},10);

    for (var i=0;i<PROJECT.DAT.preloader.length;i++)
        PIXI.loader.add(PROJECT.DAT.preloader[i],PROJECT.DAT.gfx_folder+PROJECT.DAT.preloader[i]+".png");

    PIXI.loader.load(on_preloader_loaded);
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    function on_update(delta)
    {
        var time = (new Date()).getTime();
        /*if (time-200>here.last_time)
            here.last_time=time-200;*/

        for (var i=0;i<here.on_update_functions.length;i++)
            here.on_update_functions[i](time-here.last_time);

        here.last_time=time;
    }

    function on_loaded(loader,res)
    {
        preloading.destroy();
        PROJECT.PRELOADER.set_progress(1);                
        build_gui();
        here.on_start();
        here.application.ticker.add(on_update);
        here.last_time = (new Date()).getTime();
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
here.windows=[];
here.current_wnd=null;

here.show=function(obj)
{
    for (var i=0;i<here.windows.length;i++)
        if (here.windows[i].parent)
            here.windows[i].parent.removeChild(here.windows[i]);

    here.current_wnd=obj.copy(here.middle_gfx,true);
    here.windows.push(here.current_wnd);
    return here.current_wnd;
}

here.hide=function()
{
    if (here.windows.length==0)
        return false;

    here.current_wnd=null;
    here.windows.pop().free();

    if (here.windows.length==0)
        return true;

    here.current_wnd=here.messages[here.windows.length-1];
    here.middle_gfx.addChild(here.current_wnd);
    return true;
}
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.messages=[];
    here.current_msg=null;

    here.show_msg=function(obj)
    {
        for (var i=0;i<here.messages.length;i++)
            if (here.messages[i].parent)
                here.messages[i].parent.removeChild(here.messages[i]);

        for (var i=0;i<here.messages.length;i++)
            here.msg_down_gfx.addChild(here.messages[i]);

        here.current_msg=obj.copy(here.msg_up_gfx,true);
        here.messages.push(here.current_msg);
        here.shadow.visible=true;
        here.shadow.alpha=0;

        function on_progress(obj,progress,current_tk,action)
        {
            obj.alpha=progress;
        }

        if (here.messages.length<2)
            here.start(here.shadow,0,200,null,on_progress);

        return here.current_msg;
    }

    here.hide_msg=function()
    {
        if (here.messages.length==0)
            return false;

        here.current_msg=null;
        here.messages.pop().free();
        here.shadow.visible=(here.messages.length>0);

        if (here.messages.length==0)
            return true;

        for (var i=0;i<here.messages.length;i++)
            if (here.messages[i].parent)
                here.messages[i].parent.removeChild(here.messages[i]);
       
        for (i=0;i<here.messages.length-1;i++)
            here.msg_down_gfx.addChild(here.messages[i]);

        here.current_msg=here.messages[i];
        here.msg_up_gfx.addChild(here.current_msg);
        return true;
    }

    here.hide_all_msg=function()
    {
        while (here.messages.length>0)
        {
            here.current_msg=null;
            here.messages.pop().free();
            here.shadow.visible=(here.messages.length>0);

            if (here.messages.length==0)
                return true;

            for (var i=0;i<here.messages.length;i++)
                if (here.messages[i].parent)
                    here.messages[i].parent.removeChild(here.messages[i]);
        
            for (i=0;i<here.messages.length-1;i++)
                here.msg_down_gfx.addChild(here.messages[i]);

            here.current_msg=here.messages[i];
            here.msg_up_gfx.addChild(here.current_msg);
        }
        return true;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.get_copy=function(obj,parent,put_down)
    {
        if (!obj.copied)
            obj.copied=[];
        
        for (var i=0;i<obj.copied.length;i++)
            if (!obj.copied[i].is_active)
                return obj.copied[i].setup(parent,put_down);

        if (obj.pic!="")
        {
            if (obj.col==0)
                var spr=PIXI.Sprite.fromFrame(obj.pic);
            else
            {
                var arr = [];

                for (var i=0;i<obj.col;i++)
                    arr.push(PIXI.Texture.fromFrame(obj.pic + "_anim_" + i));

                var spr=new PIXI.extras.AnimatedSprite(arr);
            }
        }else if (obj.type=="txt")
        {
            var spr=new PIXI.extras.BitmapText((obj.properties.str?PROJECT.STR.get(obj.properties.str):''),{font: Math.floor(0.9*obj.h*(obj.properties.sz?obj.properties.sz:1))+"px "+(obj.properties.fnt?obj.properties.fnt:"main"), align: (obj.properties.align?obj.properties.align:"center"),tint:(obj.properties.tint?obj.properties.tint:0xffffff)});

            if (typeof(obj.properties.sz)!="undefined")
                spr.maxWidth=obj.w;
            switch (spr.align) 
            {
                case "right":
                    spr.anchor.x=1;
                    spr.anchor.y=0.5;
                    break;
                case "left":
                    spr.anchor.x=0;
                    spr.anchor.y=0.5;
                    break;
            
                default:
                    spr.anchor.x=spr.anchor.y=0.5;
                    break;
            }
        }else
            var spr=new PIXI.Container();

        obj.copied.push(spr);
        spr.p=obj;
        spr.properties={};

        spr.centered=function()
        {//центрируем
            var spr=this;
            spr.x=spr.p_cx;
            spr.y=spr.p_cy;
            spr.anchor.x=spr.anchor.y=0.5;
        }

        spr.setup=function(parent,put_down)
        {
            var spr=this;
            spr.visible=true;
            spr.scale.x=spr.scale.y=1;
            spr.alpha=1;
            spr.rotation=0;

            spr.is_active=true;
            spr.p_properties=spr.p.properties;
            spr.p_name=spr.p.name;
            spr.p_type=spr.p.type;
            spr.p_x=spr.x=spr.p.x;
            spr.p_y=spr.y=spr.p.y;
            spr.p_cx=spr.p.x+spr.p.w/2;
            spr.p_cy=spr.p.y+spr.p.h/2;
            spr.p_w=spr.p.w;
            spr.p_h=spr.p.h;
            spr.p_c=spr.p.col;

            if (!spr.properties)
                spr.properties={};
            
            if ((spr.p_type=="txt")||(spr.p_type=="btn"))
            {//sz,str,align,tint
                spr.text=(spr.p_properties.str?PROJECT.STR.get(spr.p_properties.str):'');
                spr.font=Math.floor(0.9*spr.p_h*(spr.p_properties.sz?spr.p_properties.sz:1))+"px "+(spr.p_properties.fnt?spr.p_properties.fnt:"main");
                spr.align=(spr.p_properties.align?spr.p_properties.align:"center");
                spr.tint=((typeof(spr.p_properties.tint)!="undefined")?1*spr.p_properties.tint:0xffffff);

                switch (spr.align) 
                {
                    case "right":
                        spr.x=spr.p_x+spr.p_w;
                        spr.y=spr.p_cy;
                        spr.anchor.x=1;
                        spr.anchor.y=0.5;
                        break;
                    case "left":
                        spr.x=spr.p_x;
                        spr.y=spr.p_cy;
                        spr.anchor.x=0;
                        spr.anchor.y=0.5;
                        break;
                
                    default:
                        spr.x=spr.p_cx;
                        spr.y=spr.p_cy;
                        spr.anchor.x=spr.anchor.y=0.5;
                        break;
                }
                
            }else if (spr.anchor)
            {
                spr.anchor.x=spr.anchor.y=0;
                spr.x=spr.p_x;
                spr.y=spr.p_y;
            }
    
            for (var key in spr.p_properties)
            {
                spr.properties[key]=spr.p_properties[key];
                if(spr.properties[key]=="true")
                    spr.properties[key]=true;
                if(spr.properties[key]=="false")
                    spr.properties[key]=false;
            }

            if (parent)
            {
                if (put_down)
                    parent.addChildAt(spr,0);
                else parent.addChild(spr);
            }

            here.set_type(spr,spr.p_type);
            return spr;
        }

        spr.setup(parent,put_down);

        for (var key in obj.children)
            spr[key]=obj.children[key].copy(spr,true);

        for (key in obj.children)
        {
            if (spr[key].properties.prnt)
            {
                var pnt1=spr[key].getGlobalPosition();
                spr[spr[key].properties.prnt].addChild(spr[key]);
                var pnt2=spr[key].getGlobalPosition();

                spr[key].x=spr[key].x-(pnt2.x-pnt1.x);
                spr[key].y=spr[key].y-(pnt2.y-pnt1.y);

                spr[key].p_x=spr[key].x;
                spr[key].p_y=spr[key].y;
                spr[key].p_cx=spr[key].p_x+spr[key].p_w/2;
                spr[key].p_cy=spr[key].p_y+spr[key].p_h/2;
            }
        }

        spr.free=function()
        {
            if (spr.parent)
                spr.parent.removeChild(spr);

            spr.is_active=false;
            spr.visible=false;
        }

        spr.copy=function(parent,put_down)
        {
            return here.get_copy(this.p,parent,put_down)
        }

        spr.alarmed=false;
        spr.set_alarm=function(val)
        {
            if (val)
            {
                if (!spr.alarmed)
                {
                    spr.prev_tint=spr.tint;
                    spr.tint=0xff0000;
                    spr.alarmed=val;
                }
            }else
            {
                if (spr.alarmed)
                {
                    spr.tint=spr.prev_tint;
                    spr.alarmed=val;
                }
            }
        }

        return spr;
    }

    function fill_custom_type(children,type)
    {
        for (var key in type.children)
        {
            children[key]={name:type.children[key].name,type:type.children[key].type,x:type.children[key].x,y:type.children[key].y,w:type.children[key].w,h:type.children[key].h,properties:{},col:(type.children[key].col?type.children[key].col:0),pic:type.children[key].pic,children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            
            for (var key1 in type.children[key].properties)
                children[key].properties[key1]=type.children[key].properties[key1];
        }
    }

    function verify_local_groups(obj)
    {
        for (var key in obj.children)
        {
            if ((here.custom_types[obj.children[key].type])&&(Object.keys(obj.children[key].children).length==0))
                fill_custom_type(obj.children[key].children,here.custom_types[obj.children[key].type]);

            verify_local_groups(obj.children[key]);
        }
    }

    function prepare_groups(parent,groups)
    {
        for(var i=0;i<groups.length;i++)
        {//сначала создаем
            var window=groups[i];
            parent.children[window.name]={name:window.name,type:window.type,x:window.x,y:window.y,w:window.w,h:window.h,properties:{},col:(window.col?window.col:0),pic:(window.pic?window.pic:""),children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            
            for (var n=0;n<window.properties.length;n++)
                parent.children[window.name].properties[window.properties[n].name]=window.properties[n].val;

            if (window.groups.length>0)
            {
                prepare_groups(parent.children[window.name],window.groups);
                here.custom_types[window.type]=parent.children[window.name];
            }
        }
    }

    function build_gui()
    {//создаем 
        for(var i=0;i<PROJECT.GUI.length;i++)
        {//сначала создаем
            var window=PROJECT.GUI[i];
            PROJECT.WND[window.name]={name:window.name,type:"wnd",x:0,y:0,w:PROJECT.DAT.width,h:PROJECT.DAT.height,properties:{},pic:"",children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            prepare_groups(PROJECT.WND[window.name],window.groups);
        }

        for(i=0;i<PROJECT.GUI.length;i++)
        {//изаполняем кустомные типы
            verify_local_groups(PROJECT.WND[PROJECT.GUI[i].name]);
        }
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.interactive_off=function(obj)
    {
        obj.interactive = false;
        obj.buttonMode = false;
        obj.mousedown=null;
        obj.touchstart=null;
        obj.mousemove=null;
        obj.touchmove=null;
        obj.mouseup=null;
        obj.mouseupoutside=null;
        obj.touchend=null;
        obj.touchendoutside=null;
    }

    here.interactive_on=function(obj,mouse_up,mouse_down,mouse_move,btn)
    {
        obj.interactive = true;
        obj.buttonMode = btn;
        obj.mousedown=mouse_down;
        obj.touchstart=mouse_down;
        obj.mousemove=mouse_move;
        obj.touchmove=mouse_move;
        obj.mouseup=mouse_up;
        obj.mouseupoutside=mouse_up;
        obj.touchend=mouse_up;
        obj.touchendoutside=mouse_up;
    }

    here.shadow_interactive_off=function()
    {
        here.shadow.buttonMode = false;
        here.shadow.mousedown=null;
        here.shadow.touchstart=null;
        here.shadow.mousemove=null;
        here.shadow.touchmove=null;
        here.shadow.mouseup=null;
        here.shadow.mouseupoutside=null;
        here.shadow.touchend=null;
        here.shadow.touchendoutside=null;
    }

    here.shadow_interactive_on=function(mouse_up,mouse_down,mouse_move,btn)
    {
        here.shadow.buttonMode = btn;
        here.shadow.mousedown=mouse_down;
        here.shadow.touchstart=mouse_down;
        here.shadow.mousemove=mouse_move;
        here.shadow.touchmove=mouse_move;
        here.shadow.mouseup=mouse_up;
        here.shadow.mouseupoutside=mouse_up;
        here.shadow.touchend=mouse_up;
        here.shadow.touchendoutside=mouse_up;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.start=function(object,pause,time,on_start,on_progress,on_finish,is_busy)
    {
        function stop()
        {
            if ((this.pause>0)&&(this.tk>this.life))
            {
                if (this.on_start)
                    this.on_start(this.obj,this,true);
            }

           if (this.on_finish)
                this.on_finish(this.obj,this,true);

            if (this.busy)
                here.busy--;

            this.tk=0;
            this.is_active=false;
        }
        
        for (var i=0;i<actions.length;i++)
            if (!actions[i].is_active)
                break;        

        if (i==actions.length)
            actions.push({obj:null,is_active:false,tk:0,pause:0,life:0,on_start:null,on_progress:null,on_finish:null,is_busy:false,is_working:false,stop:stop});

        if (typeof(on_start)=="undefined")
            on_start=null;

        if (typeof(on_progress)=="undefined")
            on_progress=null;

        if (typeof(on_finish)=="undefined")
            on_finish=null;

        if (typeof(is_busy)=="undefined")
            is_busy=false;

        if (is_busy)
            here.busy++;
        
        actions[i].obj=object;
        actions[i].is_active=true;
        actions[i].tk=pause+time;
        actions[i].pause=pause;
        actions[i].life=time;
        actions[i].on_start=on_start;
        actions[i].on_progress=on_progress;
        actions[i].on_finish=on_finish;
        actions[i].is_busy=is_busy;
        actions[i].is_working=false;

        return actions[i];
    }

    function update_actions(tk)
    {
        for (var i=0;i<actions.length;i++)
            actions[i].is_working=actions[i].is_active;

        for (i=0;i<actions.length;i++)
        {
            var action=actions[i];
            if ((action.is_working)&&(action.is_active))
            {
                var not_started=((action.pause>0)&&(action.tk>action.life));
                var current_tk=(action.tk<tk?action.tk:tk);
                
                action.tk-=current_tk;
                
                if ((not_started)&&(action.tk<=action.life)&&(action.on_start))
                    action.on_start(action.obj,action,false);

                if(action.tk<=action.life)
                {
                    if (action.on_progress)
                        action.on_progress(action.obj,(action.life-action.tk)/action.life,current_tk,action);

                    if (action.tk==0)
                    {
                        if (action.on_finish)
                            action.on_finish(action.obj,action,false);

                        if (action.is_busy)
                            here.busy--;
                        action.is_active=false;
                    }
                }
            }
        }
    }

    here.on_update_functions.push(update_actions);
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.isMobile =
    {
        Android:function(){return navigator.userAgent.match(/Android/i);},
        BlackBerry:function(){return navigator.userAgent.match(/BlackBerry/i);},
        iOS:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
        Opera:function(){return navigator.userAgent.match(/Opera Mini/i);},
        Windows:function(){return navigator.userAgent.match(/IEMobile/i);},
        any:function(){return (here.isMobile.Android() || here.isMobile.BlackBerry() || here.isMobile.iOS() || here.isMobile.Opera() || here.isMobile.Windows());}
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.remove_from_resize_functions=function(fnc)
    {
        for (var i=0;i<here.on_resize_functions.length;i++)
        {
            if (here.on_resize_functions[i]==fnc)
            {
                for (var n=i;n<here.on_resize_functions.length-1;n++)
                    here.on_resize_functions[n]=here.on_resize_functions[n+1];

                here.on_resize_functions.pop();
                return;
            }
        }
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    function AVK_IMG(path,x,y,width,height)
    {//конструктор
        var loc=this;
        loc.p_x=x;
        loc.p_y=y;
        loc.p_w=width;
        loc.p_h=height;
        loc.div=document.createElement('div');
        loc.div.innerHTML = "<img src='"+path+"' width='100%' height='100%'>";
        loc.div.style="position:absolute; z-index:2; -moz-user-select:none; -webkit-user-select:none; -ms-user-select:none; user-select:none;";
        document.body.appendChild(loc.div);

        loc.free=function()
        {
            document.body.removeChild(loc.div);
            loc.div.remove();
            loc.div=null;
            here.remove_from_resize_functions(loc.refresh);
        }

        loc.refresh=function()
        {
            loc.div.style.left=(here.dx+Math.floor(here.scale*loc.p_x))+'px';
            loc.div.style.top=(here.dy+Math.floor(here.scale*loc.p_y))+'px';
            loc.div.style.width=Math.floor(here.scale*loc.p_w)+'px';
            loc.div.style.height=Math.floor(here.scale*loc.p_h)+'px';
        }

        loc.refresh();
    }

    Object.defineProperty(AVK_IMG.prototype, 'width', 
    {
        get:function() 
            {
                return this.p_w;
            },
        set:function(value) 
            {
                this.p_w=value;
                this.refresh();
            }
    });

    Object.defineProperty(AVK_IMG.prototype, 'height', 
    {
        get:function() 
            {
                return this.p_h;
            },
        set:function(value) 
            {
                this.p_h=value;
                this.refresh();
            }
    });

    Object.defineProperty(AVK_IMG.prototype, 'x', 
    {
        get:function() 
            {
                return this.p_x;
            },
        set:function(value) 
            {
                this.p_x=value;
                this.refresh();
            }
    });

    Object.defineProperty(AVK_IMG.prototype, 'y', 
    {
        get:function() 
            {
                return this.p_y;
            },
        set:function(value) 
            {
                this.p_y=value;
                this.refresh();
            }
    });

    Object.defineProperty(AVK_IMG.prototype, 'visible', 
    {
        get:function() 
            {
                return  this.div.style.visibility=='visible';
            },
        set:function(value) 
            {
                if (value)
                    this.div.style.visibility='visible';
                else
                    this.div.style.visibility='hidden';
            }
    });

    here.get_image=function(path,x,y,width,height)
    {
        var im=new AVK_IMG(path,x,y,width,height);
        here.on_resize_functions.push(im.refresh);
        return im;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
here.convert=function(value)
    {
        var s = "";
        var t = 0;
        value=""+value;

        for (var i = value.length - 1; i >= 0; i--)
        {
            if (t == 3)
            {
                t = 0;
                s = " " + s;
            }

            if ((value.charAt(i) != "0") && (value.charAt(i) != "1") && (value.charAt(i) != "2") && (value.charAt(i) != "3") && (value.charAt(i) != "4") && (value.charAt(i) != "5") && (value.charAt(i) != "6") && (value.charAt(i) != "7") && (value.charAt(i) != "8") && (value.charAt(i) != "9"))
                return value;

            s = value.charAt(i) + s;
            t++;
        }

        return s;
    }

    here.get_time=function(tk,without_sec)
    {
        tk=Math.floor(tk/1000);
        var ch=Math.floor(tk/3600);
        tk-=ch*3600;
        var m=Math.floor(tk/60);
        tk-=m*60;
        var ss=""+tk;
        var sm=""+m;

        if (without_sec)
        {
            if (ch>0)
            {
                if (sm.length<2)
                    sm="0"+sm;
                return ch+":"+sm;
            }

            if (m>0)
            {
                if (sm.length<2)
                    sm="0"+sm;
                return "0:"+sm;
            }

            if (ss.length<2)
                ss="0"+ss;
            return ss;
        }else
        {
            if (ch>0)
            {
                if (ss.length<2)
                    ss="0"+ss;
                if (sm.length<2)
                    sm="0"+sm;
                return ch+":"+sm+":"+ss;
            }

            if (m>0)
            {
                if (ss.length<2)
                    ss="0"+ss;
                return sm+":"+ss;
            }

            return ss;

            if (ss.length<2)
                ss="0"+ss;

            if (ss.length=2)
                ss="0:"+ss;
        }

        return ss;
    }

    here.rad_in_rad=function(ox,oy,or,lx,ly,lr)
    {
        var l=here.get_length(ox-lx,oy-ly);
        if (l>or+lr)
            return -1;
        else return or+lr-l;
    }

    here.line_in_rad=function(ox,oy,or,lx0,ly0,lx1,ly1)
    {
        var l=here.get_length(lx1-lx0,ly1-ly0);
        var r=Math.abs(((ly0-ly1)*ox+(lx1-lx0)*oy+(lx0*ly1-lx1*ly0))/l);//Кратчайшее расстояние до прямой

        if (r<or)//расстояние до отрезка меньше радиуса, но остался вопрос с краями
        {//Возможно касание
            var l1=(lx0-ox)*(lx0-ox)+(ly0-oy)*(ly0-oy);//расстояние от точки до центра круга в квадрате
            var l2=(lx1-ox)*(lx1-ox)+(ly1-oy)*(ly1-oy);//расстояние от точки до центра круга в квадрате

            var l3=Math.sqrt(l1-r*r);
            var l4=Math.sqrt(l2-r*r);

            if ((l3<l)&&(l4<l))//Расстояния до точки проекции от концов отрезка меньше длины отрезка
            {//Значит мы посередине между точками отрезка.Точно влетели
                return or-r;
            }else
            {//Осталась еще возможность, что конец отрезка все равно в круг попал
                l1=Math.sqrt(l1);
                l2=Math.sqrt(l2);

                if (l1<or)
                {//Точно влетели
                    return or-r;
                } else if (l2<or)
                {//Точно влетели
                    return or-r;
                }
            }
        }

        return -1;
    }

    here.get_length=function(dx,dy)
    {//return len
        var l=Math.sqrt(dx*dx+dy*dy);
        if (l==0)
            l=0.0000001;
        return l;
    }

    here.get_angle=function(dx,dy)
    {
        var l=here.get_length(dx,dy);
        var a = Math.acos(dx/l);
        if (dy<0)
            a = 2 * Math.PI - a;
        return a;//Math.floor(a*180/Math.PI);
    }

    here.del_array=function(ar,el)
	{//вспомогательная функция
		for (var i=0;i<ar.length;i++)
		{
			if (ar[i]==el)
			{
				for (var n=i;n<ar.length-1;n++)
					ar[n]=ar[n+1];

				ar.pop();
			}
		}
	}
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.set_type=function(obj,type)
    {
        if (!obj.objs)
            obj.objs={};//типовой функционал

        if (obj.objs[type])
            return;

        switch(type)
        {
            case "btn":
                obj.objs[type]=new app_btn_type(obj);
                break;
            case "mask":
                obj.objs[type]=new app_mask_type(obj);
                break;
            case "bar":
                obj.objs[type]=new app_bar_type(obj);
                break;
            case "slider":
                obj.objs[type]=new app_slider_type(obj);
                break;
        }

        function app_bar_type(spr)
        {
            var loc=this;
            loc.spr=spr;
            
            spr.align=(spr.p_properties.align?spr.p_properties.align:'l');
            spr.clr=(typeof(spr.p_properties.clr)!="undefined"?spr.p_properties.clr:0);//0-не работает,1-красное на минимуме,2-красное на максимуме
            spr.progress=0;
            spr.mask=new PIXI.Graphics();
            spr.mask.x=-spr.anchor.x*spr.p_w;
            spr.mask.y=-spr.anchor.y*spr.p_h;
            spr.mask.beginFill(0,1);
            spr.addChild(spr.mask);

            spr.set_progress=function(val)
            {
                if (val<0)
                    val=0;
                else if (val>1)
                    val=1;
                loc.spr.progress=val;
                
                if (loc.spr.clr>0)
                {
                    if (loc.spr.clr==1)
                        var p=val;
                    else var p=1-val;
        
                    var g=1;
                    if (p<0.5)
                        g=p*2;
                    
                    loc.spr.tint=256*256*255+256*Math.floor(255*g)+255*g;
                }else loc.spr.tint=0xffffff;
                
                loc.spr.mask.clear();
                loc.spr.mask.beginFill(0,1);
    
                switch (loc.spr.align) 
                {
                    case "l":
                        loc.spr.mask.drawRect(0,0,loc.spr.p_w*val,loc.spr.p_h);
                        break;
                    case "r":
                        loc.spr.mask.drawRect(loc.spr.p_w*(1-val),0,loc.spr.p_w*val,loc.spr.p_h);
                        break;
                    case "u":
                        loc.spr.mask.drawRect(0,0,loc.spr.p_w,loc.spr.p_h*val);
                        break;
                    case "d":
                        loc.spr.mask.drawRect(0,loc.spr.p_h*(1-val),loc.spr.p_w,loc.spr.p_h*val);
                        break;
                    case "c"://заполняется по часовой стрелке
                    case "cc"://заполняется против часовой стрелки
                        loc.spr.mask.lineStyle(0,0,0);
                        var w_rad=loc.spr.p_w/2;
                        var h_rad=loc.spr.p_h/2;
                        var path=[w_rad,h_rad,w_rad,-2*h_rad];

                        if (loc.spr.align=="cc")
                        {
                            path.push(-2*w_rad);
                            path.push(-2*h_rad);

                            if (val>0.25)
                            {
                                path.push(-2*w_rad);
                                path.push(4*h_rad);
                            }
                            if (val>0.5)
                            {
                                path.push(4*w_rad);
                                path.push(4*h_rad);
                            }
                            if (val>0.75)
                            {
                                path.push(4*w_rad);
                                path.push(-2*h_rad);
                            }

                            path.push(w_rad-2*w_rad*Math.cos(2*Math.PI*val-Math.PI/2));
                        }else
                        {
                            path.push(4*w_rad);
                            path.push(-2*h_rad);

                            if (val>0.25)
                            {
                                path.push(4*w_rad);
                                path.push(4*h_rad);
                            }
                            if (val>0.5)
                            {
                                path.push(-2*w_rad);
                                path.push(4*h_rad);
                            }
                            if (val>0.75)
                            {
                                path.push(-2*w_rad);
                                path.push(-2*h_rad);
                            }

                            path.push(w_rad+2*w_rad*Math.cos(2*Math.PI*val-Math.PI/2));
                        }

                        path.push(h_rad+2*h_rad*Math.sin(2*Math.PI*val-Math.PI/2));
                        loc.spr.mask.drawPolygon(path);
                        break;
                }

                loc.spr.mask.endFill();
            }
        }

        function app_mask_type(spr)
        {
            var loc=this;
            loc.spr=spr;
            
            spr.mask=new PIXI.Graphics();
            spr.mask.beginFill(0,1);
            spr.mask.drawRect(0,0,spr.p_w,spr.p_h);
            spr.mask.endFill();
            spr.addChild(spr.mask);
        }

        function app_btn_type(spr)
        {
            var loc=this;
            loc.spr=spr;
            spr.enabled=true;
            spr.hitArea = new PIXI.Rectangle(-spr.p_w/2, -spr.p_h/2, spr.p_w, spr.p_h);
            if (spr.centered)
                spr.centered();

            function mouse_up(data)
            {
                if ((here.target_button)&&(loc.spr!=here.target_button))
                {
                    if (here.target_function)
                        here.target_function("up");

                    return;
                }

                loc.spr.scale.x=loc.spr.scale.y=1;
                if (loc.spr.on_up!=null)
                    loc.spr.on_up(loc.spr);

                if ((here.target_button)&&(loc.spr==here.target_button))
                {
                    if (here.target_ok_function)
                        here.target_ok_function("up");
                }
            }

            function mouse_down(data)
            {
                if ((here.target_button)&&(loc.spr!=here.target_button))
                {
                    if (here.target_function)
                        here.target_function("down");

                    return;
                }

                if (!first_click)
                {//первый клик
                    first_click=true;
                    if (here.on_first_click)
                        here.on_first_click();
                }

                loc.tk=500;
                if ((here.busy>0)||(!loc.spr.enabled))
                    loc.spr.scale.x=loc.spr.scale.y=1;
                else
                    loc.spr.scale.x=loc.spr.scale.y=0.98;

                if (loc.spr.on_down!=null)
                    loc.spr.on_down(loc.spr);

                if ((here.target_button)&&(loc.spr==here.target_button))
                {
                    if (here.target_ok_function)
                        here.target_ok_function("down");
                    }
            }

            function on_click(data)
            {
                if ((here.target_button)&&(loc.spr!=here.target_button))
                {
                    if (here.target_function)
                        here.target_function("click");

                    return;
                }

                if ((here.busy>0)||(!loc.spr.enabled))
                    return;

                if (loc.spr.on_click!=null)
                    loc.spr.on_click(loc.spr);

                if ((here.target_button)&&(loc.spr==here.target_button))
                {
                    if (here.target_ok_function)
                        here.target_ok_function("click");
                }
            }

            if (here.isMobile.any())
                spr.on('tap',on_click);
            else
                spr.on('click',on_click);

            here.interactive_on(loc.spr,mouse_up,mouse_down,null,true);

            function btn_update(tk)
            {
                if (loc.spr.multi)
                {
                    if ((loc.spr.scale.x<1)&&(loc.spr.enabled))
                    {
                        loc.tk-=tk;
                        if (loc.tk<=0)
                        {
                            loc.tk=25;
                            if (loc.spr.on_click!=null)
                                loc.spr.on_click(loc.spr);
                        }
                    }
                }
            }

            loc.tk=0;
            loc.spr.multi=false;
            here.on_update_functions.push(btn_update);
        }

        function app_slider_type(spr)
        {
            var loc=this;
            var mouse_x=0;
            var mouse_y=0;
            var mouse_down=false;
            var prnt=null;
            var mask_wnd=null;
            var view_wnd=null;
            var max_x=spr.p_cx;
            var min_x=spr.p_cx;
            var max_y=spr.p_cy;
            var min_y=spr.p_cy;
            var on_event=null;

            loc.spr=spr;
            spr.enabled=true;
            spr.hitArea = new PIXI.Rectangle(-spr.p_w/2, -spr.p_h/2, spr.p_w, spr.p_h);
            spr.centered();
            
            spr.refresh=function()
            {//обновляем после заполнения
                if(prnt)
                {
                    if (min_x!=max_x)
                    {
                        if ((view_wnd)&&(mask_wnd))
                        {
                            var dx=view_wnd.p_w-view_wnd.width;
                            prnt.visible=loc.spr.visible=(dx<0);
                        }
                    }else
                    {
                        if ((view_wnd)&&(mask_wnd))
                        {
                            var dy=view_wnd.p_h-view_wnd.height;
                            prnt.visible=loc.spr.visible=(dy<0);
                        }
                    }
                }
            }

            spr.reset=function(save_position)
            {//нулевое положение
                if (!save_position)
                {
                    loc.spr.x=min_x;
                    loc.spr.y=min_y;
                    loc.spr.refresh();
                    move(0,0);
                }else
                {
                    if((prnt)&&(view_wnd)&&(mask_wnd))
                    {
                        if (min_x!=max_x)
                        {
                            var dx=view_wnd.p_w-view_wnd.width;
                            if (dx>0)
                            {
                                dx=0;
                                var progress=0;
                            }else progress=(view_wnd.x-view_wnd.p_x)/dx;

                            loc.spr.x=progress*(max_x-min_x)+min_x;
                        }else
                        {
                            var dy=view_wnd.p_h-view_wnd.height;
                            if (dy>0)
                            {
                                dy=0;
                                var progress=0;
                            }else var progress=(view_wnd.y-view_wnd.p_y)/dy;

                            loc.spr.y=progress*(max_y-min_y)+min_y;
                        }
                    }
                    loc.spr.refresh();
                    move(0,0);
                }
            }

            spr.set_scroll=function(scroll,hor,mask,view,on_progress)
            {
                prnt=scroll;
                view_wnd=view;
                mask_wnd=mask;
                on_event=on_progress;

                if (hor)
                {
                    min_x=scroll.x;
                    max_x=scroll.x+scroll.p_w;
                }else
                {
                    min_y=scroll.y;
                    max_y=scroll.y+scroll.p_h;
                }
            }

            function move(dx,dy)
            {
                loc.spr.x+=dx;
                loc.spr.y+=dy;

                if (loc.spr.x<min_x)
                    loc.spr.x=min_x;
                if (loc.spr.x>max_x)
                    loc.spr.x=max_x;
                if (loc.spr.y<min_y)
                    loc.spr.y=min_y;
                if (loc.spr.y>max_y)
                    loc.spr.y=max_y;

                if(prnt)
                {
                    if (min_x!=max_x)
                    {
                        var progress=(loc.spr.x-min_x)/(max_x-min_x);
                        if ((view_wnd)&&(mask_wnd))
                        {
                            var dx=view_wnd.p_w-view_wnd.width;
                            if (dx>0)
                                dx=0;
                            view_wnd.x=view_wnd.p_x+dx*progress;
                        }
                    }else
                    {
                        var progress=(loc.spr.y-min_y)/(max_y-min_y);
                        if ((view_wnd)&&(mask_wnd))
                        {
                            var dy=view_wnd.p_h-view_wnd.height;
                            if (dy>0)
                                dy=0;
                            view_wnd.y=view_wnd.p_y+dy*progress;
                        }
                    }

                    if (on_event)
                        on_event(progress);
                }
            }

            function on_mouse_move(data)
            {
                if (mouse_down)
                {
                    move(data.data.global.x-mouse_x,data.data.global.y-mouse_y);
                    mouse_x=data.data.global.x;
                    mouse_y=data.data.global.y;
                }
            }

            function on_mouse_up(data)
            {
                mouse_down=false;
            }

            function on_mouse_down(data)
            {
                mouse_x=data.data.global.x;
                mouse_y=data.data.global.y;
                mouse_down=true;
            }

                //(obj,mouse_up,mouse_down,mouse_move,btn)
            here.interactive_on(loc.spr,on_mouse_up,on_mouse_down,on_mouse_move,true);
        }
    }
}