
/**
 * Mantob Website Management System
 *
 * @since		version 2.0.0
 * @author		mantob <kefu@mantob.com>
 * @license     http://www.mantob.com/license
 * @copyright   Copyright (c) 2011 - 9999, mantob.Com, Inc.
 * @filesource	svn://www.mantob.com/v2/static/js/validate.js
 */

// 表单提示
function d_tips(name, status, code) {
	var obj = $("#man_"+name+"_tips");
	if (code) obj.html(code);
	if (status) {
		obj.attr("class", "onCorrect");
	} else {
		obj.attr("class", "onError");
		$("#man_"+name).focus();
	}
	top.$('.page-loading').remove();
}

function check_title() {
	var val = $("#man_title").val();
	var mod = $("#man_module").val();
	var id = $("#man_id").val();
	$.get(memberpath+'index.php?c=api&m=checktitle&title='+val+'&module='+mod+'&id='+id+'&rand='+Math.random(), function(data){
		if (data) {
			$("#man_title_tips").html(data);
			$("#man_title_tips").attr("class", "onError");
		} else {
			$("#man_title_tips").html(" &nbsp;");
			$("#man_title_tips").attr("class", "onCorrect");
		}
	});
}

function get_keywords(to) {
	var title = $("#man_title").val();
	if ($("#man_"+to).val()) return false;
	$.get(memberpath+'index.php?c=api&m=getkeywords&title='+title+'&rand='+Math.random(), function(data){
		$("#man_"+to).val(data);
	});
}

// 转换拼音
function d_topinyin(name, from, letter) {
	var val = $("#man_"+from).val();
	if ($("#man_"+name).val()) return false;
	$.get(memberpath+'index.php?c=api&m=pinyin&name='+val+'&rand='+Math.random(), function(data){
		$("#man_"+name).val(data);
		if (letter) {
			$("#man_letter").val(data.substr(0, 1));
		}
	});
}

// 验证是否为空
function d_required(name) {
	if ($("#man_"+name).val() == '') {
		d_tips(name, false);
		return true;
	} else {
		d_tips(name, true);
		return false;
	}
}

// 验证email
function d_isemail(name) {
	var val	= $("#man_"+name).val();
	var reg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
	if (reg.test(val)) {
		d_tips(name, true);
		return false;
	} else {
		d_tips(name, false);
		return true;
	}
}

// 验证url
function d_isurl(name) {
	var val	= $("#man_"+name).val();
	var reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/; 
	var Exp = new RegExp(reg);
	if (Exp.test(val) == true) {
		d_tips(name, true);
		return false;
	} else {
		d_tips(name, false);
		return true;
	}
}

// 验证domain
function d_isdomain(name) {
	var val	= $("#man_"+name).val();
	if (val.indexOf('/') > 0) {
		d_tips(name, false);
		return true;
	} else {
		d_tips(name, true);
		return false;
	}
}