// 重新初始化
$(document).on('click', ".reset", function(e) {
    localStorage.removeItem("roleName");
    localStorage.removeItem("background");
    localStorage.removeItem("baseUrl");
    localStorage.removeItem("orgId");
    localStorage.removeItem("devIp");
    window.location.reload();
});

// 第一步骤的下一步
$(document).on('click', "button.process1.next", function(e) {
     // 如果输入IP或端口，其余项需要校验
     var icpWebIp = $("#icpWebIp").val();
     var port = $("#port").val();
     var context = $("#context").val() || "";
     if (icpWebIp || port) {
        if(!icpWebIp){
            showEmptyTargetWord($("#icpWebIp"));
            return;
        }
        if(!port){
            showEmptyTargetWord($("#port"));
            return;
        }
     }

     // 隐藏第一步
     $(".process1").hide();
     $("body .emptyTip").hide();

	if(ip && port){
	// 跳入第二步骤
        $(".formList.process2").css("display", "flex");
        $("button.process2").show();
        if($("#court")[0].options.length == 1){
            // 获取法院
            $.ajax({
                url: "http://"+ icpWebIp +":"+ port + context +"/etc/querycourtlist",
                dataType: "json",
                type: "get",
                success: function (resp) {
                    if (!resp || resp.result == '96') {
                        showEmptyTargetWord($("select[name='court']"),"系统异常,获取法院失败");
                        return;
                    }
                    if (resp.result == '6') {
                        showEmptyTargetWord($("select[name='court']"),"法院列表为空");
                        return;
                    }
                    // 法院数据
                    var courtHTML = '<option value="">---</option>';
                    var courtList = resp.object;
                    $.each(courtList, function(index, item){
                         courtHTML += '<option value="'+ item.orgId + '" title="'+ item.orgName +'">'+ item.orgName +'</option>';
                    });
                    $('#court').html(courtHTML);
                },
                error: function(e) {
                    showEmptyTargetWord($("select[name='court']"),"网络异常,获取法院失败");
                    console.error("网络异常,获取法院失败",e);
                }
            });
            // 场地列表
            $('#court').change(function(){
                $("body .emptyTip").hide();
                $('#org').html('<option value="">---</option>');
                var courtId = $(this).val();
                $.ajax({
                    url: "http://"+ icpWebIp +":"+ port + context +"/etc/queryorglist",
                    dataType: "json",
                    type: "post",
                    data: {
                        "courtId":courtId
                    },
                    success: function (resp) {
                        if (!resp || resp.result == '96') {
                            showEmptyTargetWord($("select[name='org']"),"系统异常,获取场地失败");
                            return;
                        }
                        if (resp.result == '6') {
                            showEmptyTargetWord($("select[name='org']"),"场地列表为空");
                            return;
                        }
                        // 法庭数据
                        var orgList = resp.object;
                        var orgHTML = '<option value="">---</option>';
                        $.each(orgList, function(index, item){
                             orgHTML += '<option value="'+ item.orgId + '" title="'+ item.orgName +'">'+ item.orgName +'</option>';
                        });
                        $('#org').html(orgHTML);
                    },
                    error: function(e) {
                        showEmptyTargetWord($("select[name='org']"),"网络异常,获取场地失败");
                        console.error("网络异常,获取场地失败",e);
                    }
                })
            });
        }
	}else{
	// 非联网情况下，直接跳入第三步骤
        $(".formList.process3").css("display", "flex");
        $(".formList.ip.process3").hide();
        $("button.process3").show();
	}
});

// 第二步骤的下一步
$(document).on('click', "button.process2.next", function(e) {
     // 校验
     if (!$("select[name='court']").val()) {
        showEmptyTargetWord($("select[name='court']"))
        return
     }
     if (!$("select[name='org']").val()) {
        showEmptyTargetWord($("select[name='org']"))
        return
     }

     // 隐藏第二步
     $(".process2").hide();
     $("body .emptyTip").hide();
     // 显示第三步
     $('#roleName').html('<option value="">---</option>');
     $(".formList.process3").css("display", "flex");
     $("button.process3").show();
     // 联网下，隐藏背景，由书记员端设置
     var icpWebIp = $("#icpWebIp").val();
     if(icpWebIp){
          $(".formList.background.process3").hide();
     }

     // 设备Ip, 从安桌获取到
     var devIp = localStorage.getItem("devIp");
     $("#ip").val(devIp);
     // 获取诉讼地位
     if($("#roleName")[0].options.length == 1){
        var port = $("#port").val();
        var context = $("#context").val();
        $.ajax({
            url: "http://"+ icpWebIp +":"+ port + context +"/etc/queryrolelist",
            dataType: "json",
            type: "get",
            success: function (resp) {
                if (!resp) {
                    showEmptyTargetWord($("select[name='roleName']"),"系统异常,获取诉讼地位失败");
                    return;
                }
                if (resp.result == '6') {
                    showEmptyTargetWord($("select[name='roleName']"),"诉讼地位列表为空");
                    return;
                }
                var roleNameHTML = '<option value="">---</option>';
                var roleList = resp.object;
                $.each(roleList, function(index, item){
                     roleNameHTML += '<option value="'+ item.paramName + '" title="'+ item.paramName +'">'+ item.paramName +'</option>';
                });
                $('#roleName').html(roleNameHTML);
            },
            error: function(e) {
                showEmptyTargetWord($("select[name='court']"),"网络异常,获取诉讼地位失败");
                console.error("网络异常,获取诉讼地位失败",e);
            }
        });
    }
});

// 第二步骤的上一步
$(document).on('click', "button.process2.prev", function(e) {
	// 隐藏第二步
    $(".process2").hide();
    $("body .emptyTip").hide();
    // 显示第一步
    $(".formList.process1").css("display", "flex")
    $("button.process1").show()
})

// 第三步骤的上一步
$(document).on('click', "button.process3.prev", function(e) {
	// 隐藏第三步
    $(".process3").hide();
    $("body .emptyTip").hide();

    var icpWebIp = $("#icpWebIp").val();
    if(icpWebIp){
    // 联网下，显示第二步
        $(".formList.process2").css("display", "flex")
        $("button.process2").show()
    }else{
    // 非联网下，显示第一步
        $(".formList.process1").css("display", "flex")
        $("button.process1").show()
    }

})

$(document).on('click', ".background span", function(e) {
	$(this).addClass("choice").siblings().removeClass("choice");
})

// 确定
$(document).on('click', "button.sumbit", function(e) {
    // 校验
	if (!$("select[name='roleName']").val()) {
		showEmptyTargetWord($("select[name='roleName']"));
		return;
	}
	// 联网下，需要填写设备IP
	var icpWebIp = $("#icpWebIp").val();
    var devIp = $("#ip").val();
    if(icpWebIp && !devIp){
        showEmptyTargetWord($("#ip"));
        return;
    }
    // 非联网下，需要选择背景
    var background = $(".formList.background span[class='choice']").attr("target");
    if (!icpWebIp && !background) {
		showEmptyTargetWord($("#background"));
		return;
	}

    var port = $("#port").val();
    if(icpWebIp && port){
        // 场地
        var orgId = $("#org").val();
        var context = $("#context").val() || "/";
        // 注册电子桌牌信息
        $.ajax({
            url: "http://"+ icpWebIp +":"+ port + context +"/elecTableCard/saveInfo",
            dataType: "json",
            type: "post",
            data:{
                 "orgId": orgId,
                 "ip": devIp,
                 "roleName": $("#roleName").val()
            },
            success: function (resp) {
                if (!resp || resp.result != '0') {
                    console.error("系统异常,注册电子桌牌信息失败.", resp);
                    showEmptyTargetWord($("#ip"), "注册电子桌牌信息失败");
                    $("#ip")
                    return;
                }
                var baseUrl = "http://"+ icpWebIp +":"+ port + context;
                afterSaveHandle(orgId, devIp, baseUrl);
            },
            error: function(e) {
                console.error("网络异常,注册电子桌牌信息失败",e);
                showEmptyTargetWord($("#ip"), "注册电子桌牌信息失败");
            }
        });
    }else{
       afterSaveHandle();
    }
})

// 保存后续处理
function afterSaveHandle(orgId, devIp, baseUrl){
    // 存入本地存储
    // 诉讼地位
    var roleName = $("#roleName").val();
    localStorage.setItem("roleName", roleName);
    // 背景
	var background = $(".formList.background span[class='choice']").attr("target");
    localStorage.setItem("background", background);
    // 场地
    if(orgId){
        localStorage.setItem("orgId", orgId);
    }
    // 设备IP
    if(devIp){
        localStorage.setItem("devIp", devIp);
    }
    // icp-web地址
    if(baseUrl){
        localStorage.setItem("baseUrl", baseUrl);
    }

    // 隐藏初始化界面
    $("body .emptyTip").hide();
    $(".login-container").hide();
    // 显示电子桌牌界面
    $(".card-container").show();
    $(".background").hide();
    var txtLength = roleName.length;
    $(".card-container .bg" + background).addClass("f"+ txtLength).html(roleName).show();
    // 联网下， 每隔5秒钟，轮询服务端，查询书记员端的电子桌牌设置
    pollRemoteSet();
}


function showEmptyTargetWord(target, errorMsg) {
//	$("body .emptyTip").remove()
//	let dom = target[0]
//	let left = dom.getBoundingClientRect().x - 90
//	let top = dom.getBoundingClientRect().bottom + 10
//	let style = "left:" + left +"px; top:" + top + "px;"
//	var msg = errorMsg == undefined?target.attr("data-error"):errorMsg;
//	let errorTip = "<p class='emptyTip' style='" + style + "'>" + msg + "</p>"
//	$("body").append(errorTip)
	$(".emptyTip").hide()
	var msg = errorMsg == undefined?target.attr("data-error"):errorMsg;
	target.next().show().html(msg);
}

// 联网下， 每隔5秒钟，轮询服务端，查询书记员端的电子桌牌设置
function pollRemoteSet(){
    var baseUrl = localStorage.getItem("baseUrl");
    if(baseUrl){
        var orgId = localStorage.getItem("orgId");
        var devIp = localStorage.getItem("devIp");
        setInterval(function(){
            $.ajax({
                url: baseUrl +"/elecTableCard/getInfo",
                dataType: "json",
                type: "post",
                data:{
                    "orgId": orgId,
                    "ip": devIp
                },
                success: function (resp) {
                    if (!resp || resp.result != '0' || !resp.object) {
                        console.error("系统异常,查询书记员端的电子桌牌设置失败.", resp);
                        return;
                    }
                    var data = resp.object;
                    if(!data["roleName"] || !data["backGroundName"]){
                        console.error("查询书记员端的电子桌牌返回的数据不合法.", resp);
                        return;
                    }
                    var roleName = localStorage.getItem("roleName");
                    var background = localStorage.getItem("background");
                    // 诉讼地位变化
                    if(roleName != data["roleName"]){
                        var oldTxtLength = roleName.length;
                        roleName = data["roleName"];
                        var newTxtLength = roleName.length;
                        localStorage.setItem("roleName", roleName);
                        // 切换背景
                        if(background != data["backGroundName"]){
                            background = data["backGroundName"];
                            localStorage.setItem("background", background);
                            $(".background").hide();
                            $(".card-container .bg" + background).show();
                        }
                        // 字体样式切换
                        if(oldTxtLength != newTxtLength){
                            var classes = $(".card-container .bg" + background).attr("class").split(" ");
                            var oldFontClass;
                            for(var i = 0; i < classes.length; i++){
                                if(/^f/.test(classes[i])){
                                    oldFontClass = classes[i];
                                    break;
                                }
                            }
                            if(oldFontClass){
                                console.log("===>oldFontClass: ", oldFontClass);
                                $(".card-container .bg" + background).removeClass(oldFontClass);
                            }
                            $(".card-container .bg" + background).addClass("f"+ newTxtLength);
                        }else if(!$(".card-container .bg" + background).hasClass("f"+ newTxtLength)){
                            $(".card-container .bg" + background).addClass("f"+ newTxtLength);
                        }
                        // 诉讼地位
                        $(".card-container .bg" + background).html(roleName);
                    }else if(background != data["backGroundName"]){
                    // 仅背景切换
                        var txtLength = roleName.length;
                        background = data["backGroundName"];
                        localStorage.setItem("background", background);
                        $(".background").hide();
                        $(".card-container .bg" + background).show().html(roleName);
                        // 字体样式
                        if(!$(".card-container .bg" + background).hasClass("f"+ txtLength)){
                            $(".card-container .bg" + background).addClass("f"+ txtLength);
                        }
                    }
                },
                error: function(e) {
                    console.error("网络异常,查询书记员端的电子桌牌设置失败",e);
                }
            });
        },5000);
    }
}


$(function(){
	// 判断本地存储是否经设置过诉讼地位，直接跳到诉讼地位
    var roleName = localStorage.getItem("roleName");
    var background = localStorage.getItem("background");
	console.log('--------roleName-------', roleName, background)
    if(roleName && background){
	    $(".login-container").hide();
	    $(".card-container").show();
	    var txtLength = roleName.length;
        $(".card-container .bg" + background).addClass("f"+ txtLength).html(roleName).show();
        // 联网下， 每隔5秒钟，轮询服务端，查询书记员端的电子桌牌设置
        pollRemoteSet();
    }
})