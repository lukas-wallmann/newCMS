var cssjsEditor={

  firstcode:true,
  cache:[],
  currentID:0,

  init:function(){
    cssjsEditor.getParts("","","",true);
    $("button.add").click(function(){
      cssjsEditor.cmd(
        '<label class="mr-3">'+consts.name+'</label><input>',
        function(){cssjsEditor.getParts("new",$(".cmd input").val())},
        function(){$(".cmd input").focus()}
      )
    });
    $(document).bind('keydown', function(e) {
      if(e.ctrlKey && (e.which == 83)) {
        e.preventDefault();
        cssjsEditor.save();
        return false;
      }
    });
    $(".save").click(function(){
      cssjsEditor.save();
    });
  },

  save:function(){
    cssjsEditor.saveTemp();
    var data={};
    data.cache=JSON.stringify(cssjsEditor.cache);
    $.ajax({type:"POST",data:data,url:"?m=settings/themes&f=apicssjs&no=1&mode="+mode}).done(function(){
      alert("done");
    })
  },

  getParts:function(action="",name="",id=0, clickfirst=false){
    var data={};
    var type="GET";
    if(action!="")type="POST";
    if(action=="new"){
      data.name=name;
    }
    if(action=="delete"){
      data.deleteID=id;
    }
    if(action=="rename"){
      data.newName=name;
      data.renameID=id;
    }
    $.ajax(
      {
        type:type,
        data:data,
        url:"?m=settings/themes&f=apicssjs&no=1&mode="+mode+"&ID="+ID
      }
    ).done(function(d){
      var data=JSON.parse(d);
      $(".menu").html("");
      for(var i=0; i<data.length; i++){
        $(".menu").append('<div data-id="'+data[i].ID+'"><span class="name">'+data[i].Name+'</span><span class="edit ml-3"><i class="fas fa-pen-square"></i></span><span class="delete ml-1"><i class="fas fa-trash-alt"></i></span></div>');
      }
      $(".menu .edit").click(function(){
        var tmpname=$(this).parent().text();
        var tmpID=$(this).parent().attr("data-id");
        cssjsEditor.cmd(
          '<label class="mr-3">'+consts.name+'</label><input value="'+tmpname+'">',
          function(){cssjsEditor.getParts("rename",$(".cmd input").val(),tmpID)},
          function(){$(".cmd input").focus()}
        )
      });
      $(".menu .name").click(function(){
        $(".selected").removeClass("selected");
        $(this).parent().addClass("selected");
        cssjsEditor.getCode($(this).parent().attr("data-id"));
      });
      $(".menu .delete").click(function(){
        var r=confirm(consts.delete+": "+$(this).parent().text());
        var clickfirst=false;
        if(cssjsEditor.currentID==$(this).parent().attr("data-id"))clickfirst=true;
        if(r)cssjsEditor.getParts("delete","",$(this).parent().attr("data-id"),clickfirst);
      });
      if(clickfirst){
        $(".menu .name").first().click();
      }
    })
  },

  saveTemp:function(){
    if(cssjsEditor.firstcode){
      cssjsEditor.firstcode=false;
    }else{
      var found=false;
      for(var i=0; i<cssjsEditor.cache.length; i++){
        if(cssjsEditor.cache[i][0]==cssjsEditor.currentID){
          found=true;
          cssjsEditor.cache[i][1]=editor.getValue();
        }
      }
      if(!found)cssjsEditor.cache.push([cssjsEditor.currentID,editor.getValue()]);
    }
  },

  getCode:function(id){

    cssjsEditor.saveTemp();
    cssjsEditor.currentID=id;
    var found=false;
    for(var i=0; i<cssjsEditor.cache.length; i++){
      if(cssjsEditor.cache[i][0]==id){
        found=true;
        editor.setValue(cssjsEditor.cache[i][1]);
      }
    }
    if(!found){
      var url="?m=settings/themes&f=apicssjs&no=1&code=1&mode="+mode+"&ID="+id;
      $.ajax({url:url}).done(function(d){
        editor.setValue(d);
      });
    }

  },

  cmd:function(html,onfinish,oninit=function(){}){
    html+="<div class='ctrl'><button class='btn btn-primary ok' type='submit'>"+consts.save+"</button><button class='btn btn-warning cancel'>"+consts.cancel+"</button></div>";
    html='<div class="cmd"><div class="inner"><form>'+html+'</form></div></div>';
    $("body").append(html);
    oninit();
    $(".cmd form").submit(function(e){
      onfinish();
      $(".cmd").remove();
      e.preventDefault();
    });
    $(".cmd .ctrl .cancel").click(function(){
      $(".cmd").remove();
    });
  }
}

$(document).ready(cssjsEditor.init);
