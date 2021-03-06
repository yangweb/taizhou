/**
 * Created by mantob on 14-8-7.
 */
(function($) {
    $.fn
        .extend({
            insertContent : function(myValue, t) {
                var $t = $(this)[0];
                if (document.selection) { // ie
                    this.focus();
                    var sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                    sel.moveStart('character', -l);
                    var wee = sel.text.length;
                    if (arguments.length == 2) {
                        var l = $t.value.length;
                        sel.moveEnd("character", wee + t);
                        t <= 0 ? sel.moveStart("character", wee - 2 * t
                            - myValue.length) : sel.moveStart(
                            "character", wee - t - myValue.length);
                        sel.select();
                    }
                } else if ($t.selectionStart
                    || $t.selectionStart == '0') {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos)
                        + myValue
                        + $t.value.substring(endPos,
                        $t.value.length);
                    this.focus();
                    $t.selectionStart = startPos + myValue.length;
                    $t.selectionEnd = startPos + myValue.length;
                    $t.scrollTop = scrollTop;
                    if (arguments.length == 2) {
                        $t.setSelectionRange(startPos - t,
                            $t.selectionEnd + t);
                        this.focus();
                    }
                } else {
                    this.value += myValue;
                    this.focus();
                }
            }
        })
})(jQuery);
// 插入表情
function man_emotion(value) {
    $("#man_content").insertContent(' ['+value+'] ');
}
// 显示表情
function man_get_face() {
    $("#emotions").show(200);
}
// 插入@
function man_insert_user(value) {
    $("#man_content").insertContent(' @'+value+' ');
}
//过滤html标签
function strip_tags (input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
// 添加话题
function man_huati_add(){
    var name = strip_tags($('#huati_name').val());
    if (!name || name=='') {
        man_tips('话题不能为空！');
        $('#huati_name').focus();
        return;
    }
    $("#man_content").insertContent(' #'+name+'# ');
    $('#huati_name').val('');
}

/**
 * 微博多图插入Js核心插件
 */
man_multimage = {
    /**
     * 工厂模式调用初始化
     * @param object attrs 初始化参数对象
     * @return void
     */
    _init: function (attrs) {
        if (attrs.length === 4) {
            core.multimage.init(attrs[1], attrs[2], attrs[3]);
        } else if (attrs.length === 3) {
            core.multimage.init(attrs[1], attrs[2]);
        } else if (attrs.length === 2) {
            core.multimage.init(attrs[1]);
        } else {
            return false;
        }
    },
    /**
     * 初始化操作执行
     * @param object obj 点击的DOM节点对象
     * @param object textarea 输入框DOM对象
     * @param object postbtn 发布按钮DOM对象
     * @return {[type]}          [description]
     */
    init: function (obj, textarea, postbtn) {
        this.obj = obj;
        this.textarea = textarea;
        this.postbtn = postbtn;
        // 创建显示弹窗DIV
        core.multimage.createDiv();
    },
    /**
     * 创建图片显示DIV弹窗
     * @return void
     */
    createDiv: function () {
        var _this = this;
        // 判断弹窗是否存在
        if ($('#multi_image').length > 0) {
            return false;
        }
        $('.attach-file').remove();
        // body点击事件绑定
        $('body').bind('click',function(event){
            var obj = ('undefined' !== typeof event.srcElement) ? event.srcElement : event.target;
            if ($(obj).attr('event-node') === 'insert_file') {
                core.multimage.removeDiv();
            }
        });
    },
    /**
     * 移除多图窗口
     * @return void
     */
    removeDiv: function () {
        var multiImageNode = $('#multi_image')[0];
        if (multiImageNode != null) {
            multiImageNode.parentNode.removeChild(multiImageNode);
        }
        $('#attach_ids').remove();
    },
    /**
     * 移除图片接口
     * @param string unid ID的字符串
     * @param integer index 索引数
     * @param integer attachId 附件ID
     * @return void
     */
    removeImage: function (unid, index, attachId) {
        // 移除附件ID数据
        man_multimage.upAttachVal('del', attachId);
        // 移除图像
        $('#li_'+unid+'_'+index).remove();
        // 移除附件ID项
        ($('#ul_'+unid).find('li').length - 1 === 0) && $('#attach_ids').remove();
        // 动态设置数目
        man_multimage.upNumVal(unid, 'dec');
    },
    /**
     * 更新附件表单值
     * @return void
     */
    upAttachVal: function (type, attachId) {
        var attachVal = $('#attach_ids').val();
        var attachArr = attachVal.split('|');
        var newArr = [];
        type === 'add' && attachArr.push(attachId);
        for (var i in attachArr) {
            if (attachArr[i] !== '' && attachArr[i] !== attachId.toString()) {
                newArr.push(attachArr[i]);
            }
        }
        $('#attach_ids').val('|' + newArr.join('|') + '|');
    },
    /**
     * 更新上传显示数目
     * @param string unid 唯一ID
     * @param string type 更新类型，inc增加；dec减少
     * @return void
     */
    upNumVal: function (unid, type) {
        var $uploadNum = $('#upload_num_'+unid),
            $totalNum = $('#total_num_'+unid);
        switch (type) {
            case 'inc':
                // 动态设置数目 - 增加
                $uploadNum.html(parseInt($uploadNum.html()) + 1);
                $totalNum.html(parseInt($totalNum.html()) - 1);
                break;
            case 'dec':
                // 动态设置数目 - 减少
                $uploadNum.html(parseInt($uploadNum.html()) - 1);
                $totalNum.html(parseInt($totalNum.html()) + 1);
                break;
        }
    },
    /**
     * 添加loading效果
     * @param string unid 唯一ID
     * @return void
     */
    addLoading: function (unid) {
        var loadingHtml = '<li id="loading_'+unid+'" class="load"><span><img src="'+THEME_URL+'sns/loading.gif" /></span></li>';
        $('#btn_'+unid).before(loadingHtml);
    },
    /**
     * 移除loading效果
     * @param string unid 唯一ID
     * @return void
     */
    removeLoading: function (unid) {
        $('#loading_'+unid).remove();
    }
};

// 搜索好友
function man_find_user(gid) {
    $("#group-2").html('加载中...');
    $("#groups li").attr('class', '');
    $("#man_group_"+gid).attr('class', 'current');
    $.get(memberpath+"index.php?c=sns&m=select_user&gid="+gid, function(data){
        if (data) {
            $("#group-2").html(data);
        } else {
            $("#group-2").html('没有了');
        }
    });
}

// 发布微博
function man_post() {
    var content = $('#man_content').val();
    if (!content || content == '') {
        man_tips('请填写内容');
        $('#man_content').focus();
        return false;
    }
    $.post(memberpath+"index.php?c=sns&m=post", {content:content, attach: $('#attach_ids').val()}, function(data){
        if (data.status == 1) {
            man_tips('发布成功', 2, 1);
            $('#man_content').val('');
            $('#upload_num_weibo').html('0');
            $('#total_num_weibo').html('9');
            $('#attach_ids').val('');
            $('.man_row_li').remove();
            $.get(moreurl+'&more=1', function(data){
                $("#feed-lists").html(data);
                $("#man_page").val(2);
            });
        } else {
            man_tips(data.code);
            $('#man_content').focus();
        }
    }, 'json');
}

// 转发
function man_sns_repost(id) {
    // 创建窗口
    var throughBox = $.dialog.through;
    var man_Dialog = throughBox({
        title: '转发',
        opacity: 0.1
    });
    var url = memberpath+'index.php?c=sns&m=repost&id='+id;
    // ajax调用窗口内容
    $.ajax({type: "GET", url:url, dataType:'text', success: function (text) {
        var win = $.dialog.top;
        man_Dialog.content(text);
        // 添加按钮
        man_Dialog.button({name: '转发', callback:function() {
            var content = win.$("#man_content").val();
            $.ajax({type: "POST",dataType:"json", url: url, data: {content: content}, success: function(data) {
                    if (data.status == 1) {
                        man_tips(data.code, 3, 1);
                        $.get(moreurl+'&more=1', function(data){
                            $("#feed-lists").html(data);
                            $("#man_page").val(2);
                        });
                    } else {
                        man_tips(data.code);
                        win.$('#man_content').focus();
                    }
                },
                error: function(HttpRequest, ajaxOptions, thrownError) {

                }
            });
            },
            focus: true
        });
        },
        error: function(HttpRequest, ajaxOptions, thrownError) {

        }
    });
    return;
}

// 提交评论
function man_sns_comment_post(id) {
    var content = strip_tags($('#comment_content_'+id).val());
    if (!content || content == '') {
        man_tips('请填写评论内容');
        return false;
    }
    $.post(memberpath+"index.php?c=sns&m=comment&id="+id, {content:content}, function(data){
        if (data.status == 1) {
            man_tips('评论成功', 2, 1);
            man_sns_list_comment(id, 1);
            $("#man_comment_"+id).toggle();
        } else {
            man_tips(data.code);
        }
    }, 'json');
}

// 列表评论
function man_sns_list_comment(id, page) {
    $("#man_comment_"+id).toggle();
    $('#comment_content_'+id).val('');
    $.get(memberpath+'index.php?c=sns&m=comment_list&more=1&id='+id+'&page='+page, function(data){
        $('#commentlist_'+id).html(data);
    });
}


// 回复评论
function man_recomment(id, username) {
    $('#comment_content_'+id).focus();
    $('#comment_content_'+id).val('@'+username+' ');
}

// 赞
function man_sns_digg(id) {
    $.get(memberpath+'index.php?c=sns&m=digg&id='+id, function(data){
        $('#man_digg_'+id).html(data);
    });
}

// 收藏
function man_sns_favorite(id) {
    $.get(memberpath+'index.php?c=sns&m=favorite&id='+id, function(data){
        $('#man_favorite_'+id).html(data);
    });
}

// 删除动态
function man_sns_delete(id) {
    art.dialog.confirm("<font color=red><b>你确认要删除吗？</b></font>", function(){
        $.ajax({type: "POST",dataType:"json", url: memberpath+'index.php?c=sns&m=delete&id='+id, success: function(data) {
            if (data.status == 1) {
                man_tips(data.code, 3, 1);
                $("#man_row_"+id).remove();
            } else {
                man_tips(data.code);
            }
            art.dialog.close();
            return false;
        },
            error: function(HttpRequest, ajaxOptions, thrownError) {

            }
        });
        return true;
    });
    return false;
}

// 删除动态
function man_sns_delete(id) {
    art.dialog.confirm("<font color=red><b>你确认要删除吗？</b></font>", function(){
        $.ajax({type: "POST",dataType:"json", url: memberpath+'index.php?c=sns&m=delete&id='+id, success: function(data) {
            if (data.status == 1) {
                man_tips(data.code, 3, 1);
                $("#man_row_"+id).remove();
            } else {
                man_tips(data.code);
            }
            art.dialog.close();
            return false;
        },
            error: function(HttpRequest, ajaxOptions, thrownError) {

            }
        });
        return true;
    });
    return false;
}

// 删除动态2
function man_sns_delete2(id) {
    art.dialog.confirm("<font color=red><b>你确认要删除吗？</b></font>", function(){
        $.ajax({type: "POST",dataType:"json", url: memberpath+'index.php?c=sns&m=delete&id='+id, success: function(data) {
            if (data.status == 1) {
                man_tips(data.code, 3, 1);
                setTimeout('window.location.href="'+memberpath+'index.php?c=sns&m=index"', 2000);
            } else {
                man_tips(data.code);
            }
            art.dialog.close();
            return false;
        },
            error: function(HttpRequest, ajaxOptions, thrownError) {

            }
        });
        return true;
    });
    return false;
}

// 删除评论
function man_sns_delete_comment(id) {
    art.dialog.confirm("<font color=red><b>你确认要删除吗？</b></font>", function(){
        $.ajax({type: "POST",dataType:"json", url: memberpath+'index.php?c=sns&m=delete_comment&id='+id, success: function(data) {
            if (data.status == 1) {
                man_tips(data.code, 3, 1);
                $("#man_row_comment_"+id).remove();
            } else {
                man_tips(data.code);
            }
            art.dialog.close();
            return false;
        },
            error: function(HttpRequest, ajaxOptions, thrownError) {

            }
        });
        return true;
    });
    return false;
}

// 监听会员资料
$(function(){
    $('a[event-node="face_card"]').mouseenter(function(){
        $('.face_card').hide();
        var uid = $(this).attr('uid');
        var obj = $(this);
        man_facecard.init();
        man_facecard.show(obj, uid);
    });
    $('a[event-node="face_card"]').mouseleave(function(){
        man_facecard.hide();
    });
    $('a[event-node="face_card"]').blur(function(){
        man_facecard.hide();
    });
    //
});

/**
 * 小名片JS模型
 */
man_facecard ={
    //给工厂调用的接口
    _init:function(attrs){
        this.init();
    },
    init:function(){
        if("undefined" != typeof(this.face_box)){
            //return false;
        }
        var html = '<div id="face_card" class="wrap-layer face_card" style="position:absolute;left:10%;background-color:#fff;display:none;z-index:99999">'+
            '<div class="content-layer">'+
            '<div class="layer-content" >'+
            '<div class="name-card clearfix">'+
            '<div class="loading"> 加载中... </div></div></div>'+
            '<div class="arrow arrow-l" ></div></div></div>';
        this.face_box = $(html);
        $('body').append(this.face_box);
        this.user_info = new Array();
    },
    show:function(obj,uid){
        this.obj = obj;
        $(obj).attr('show','yes');
        var _this = this;
        var _show = function(){
            //设置默认框的位置
            if($(obj).attr('show') != 'yes'){
                return false;
            }
            _this.setCss(obj);
            if("undefined" != typeof(_this.user_info[uid]) || _this.user_info[uid] == ''){
                _this.face_box.find('.name-card').html(_this.user_info[uid]);
                _this.setCss(obj); //重设高宽
            }else{
                $.post(memberpath+'index.php?c=sns&m=member', {uid:uid},function(msg){
                    _this.face_box.find('.name-card').html(msg);
                    _this.setCss(obj); //重设高宽
                    _this.user_info[uid] = msg;
                });
            }
        };
        setTimeout(_show,800);

        $(obj).mouseover(function(){
            $(this).attr('show','yes');
        });
        $(obj).mouseout(function(){
            $(this).attr('show','no');
        });
    },
    deleteUser:function(uid){
        if("undefined" != this.user_info[uid]){
            this.user_info[uid] = '';
            delete this.user_info[uid];
        }
    },
    setCss:function(obj){	//计算位置
        var p =$(obj).offset();
        var bh = $('body').height();
        var ww = $(window).width();
        var scrollHeight = $(window).scrollTop();
        var fw = this.face_box.width(); //可以设定 小名片的宽度
        var fh = this.face_box.height(); //可以设定 小名片的高度

//			var left = p.left+$(obj).width()+5; //默认当前的left
//			var top = p.top - 20;
//			var className = 'arrow-l';
        var top = p.top - fh - 5;
        var className = 'arrow-b';
        var left = p.left - 18;


        if(ww-p.left < fw ){
            left = p.left -fw - 5;
            className = 'arrow-r';
            top = p.top - 5;
        }
        if(p.top - scrollHeight < 40+fh){
            //向下
            //重设left
            top = p.top + $(obj).height() + 5;
            left = p.left - 15;
            className = 'arrow-t';
        }
        if(bh-p.top < fh ||  ( $(window).height() +  scrollHeight - p.top) < fh ){
            //向上
            top = p.top - fh - 5;
            className = 'arrow-b';
            left = p.left - 18;
        }

        var arrow = this.face_box.find('.arrow');
        arrow.removeClass('arrow-r');
        arrow.removeClass('arrow-l');
        arrow.removeClass('arrow-b');
        arrow.removeClass('arrow-t');
        arrow.addClass(className);

        this.face_box.css({'left':left+'px','top':top+'px'})
        this.face_box.show();
        var _this = this;
        this.face_box.mouseover(function(){
            _this.boxOn = true;
        });
        this.face_box.mouseout(function(){
            _this.boxOn = false;
            _this.hide();
        });
    },
    hide:function(){
        //隐藏弹窗，清空人信息
        var _this = this;
        var hidden = function(){
            if(_this.boxOn || $(_this.obj).attr('show') == 'yes'){
                return false;
            }
            _this.face_box.hide();
            //_this.face_box.find('.name-card').html('');
            $(_this.obj).attr('show','no');
        };
        setTimeout(hidden,250);
    },
    dohide:function(){//强制隐藏
        var _this = this;
        _this.face_box.hide();
        $(_this.obj).attr('show','no');
    }
};

