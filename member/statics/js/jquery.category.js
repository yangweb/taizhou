(function($){
	$.fn.ld = function(options){
		var opts;
		var DATA_NAME = "ld";
		//返回API
		if(typeof options == 'string'){
			 if(options == 'api'){
			 	return $(this).data(DATA_NAME);
			 }
		}
		else{
			var options = options || {};
			//覆盖参数
			opts = $.extend(true, {}, $.fn.ld.defaults, options);
		}
		if($(this).size() > 0){
			var ld = new yijs.Ld(opts);
			ld.$applyTo = $(this);
			ld.render();
			$(this).data(DATA_NAME,ld);
		}
		return $(this);			
	}
	var yijs = yijs || {};
	yijs.Ld = function(options){	
		//参数
		this.options = options;
		//起作用的对象
		this.$applyTo  = this.options.applyTo && $(this.options.applyTo) || null;
		//缓存前缀
		this.cachePrefix = "data_";
		//写入到选择框的option的样式名	
		this.OPTIONS_CLASS = "ld-option";
		//缓存，为一个对象字面量。
		this.cache = {};				
	}
	yijs.Ld.prototype = {
		/**
		 * 运行
		 * @return {Object} this
		 */
		render: function(){
			var _that = this;
			var _opts = this.options;			
			if (this.$applyTo != null && this.size() > 0) {
				_opts.style != null && this.css(_opts.style);
				//加载默认数据，向第一个选择框填充数据
				this.load(_opts.defaultLoadSelectIndex, _opts.defaultParentId);
				_opts.texts.length > 0 && this.selected(_opts.texts);
				//给每个选择框绑定change事件
				this.$applyTo.each(function(i){
					$(this).bind(_opts.drevent+".ld",{target:_that,index:i},_that.onchange);
				})					
			}
			return this;	
		},
		texts : function(ts){
			var that = this;
			var $select = this.$applyTo;
			var _arr = [];
			var txt = null;
			var $options;
			$select.each(function(){
				txt = $(this).children('.'+that.OPTIONS_CLASS+':selected').text();
				_arr.push(txt);
			})
			return _arr;
		},
		/**
		 * 获取联动选择框的数量
		 * @return {Number} 选择框的数量
		 */
		size : function(){
			return this.$applyTo.size();
		},
		/**
		 * 设置选择框的样式
		 * @param {Object} style 样式
		 * @return {Object} this
		 */
		css : function(style){
			style && this.$applyTo.css(style);
			return this;
		},
		/**
		 * 读取数据，并写入到选择框
		 * @param {Number} selectIndex 选择框数组的索引值
		 * @param {String} parent_id  父级id
		 */
		load : function(selectIndex, parent_id, callback){
			var _that = this;
			if (parent_id.length == 0) {
				$("#load_layer").hide();
				return;
			}
			//清理index以下的选择框的选项
			for (var i = selectIndex ; i< _that.size();i++){
				_that.removeOptions(i);
			}						
			//存在缓存数据,直接使用缓存数据生成选择框的子项；不存在，则请求数据
			var _ajaxOptions = this.options.ajaxOptions;
			var _d = _ajaxOptions.data;	
			var _parentIdField = this.options.field['parent_id'];
			_d[_parentIdField] = parent_id;	
			//传递给后台的参数
			_ajaxOptions.data = _d;
			//ajax获取数据成功后的回调函数
			_ajaxOptions.success = function(data){
				$("#load_layer").hide();
				//遍历栏目隐藏后部栏目
				$(".Mantob-select-category").each(function(){
					if ($(this).attr('iid') > selectIndex) {
						$(this).hide();
					}
				});
				//遍历数据，获取html字符串
				if (data.length > 0) { //本菜单有内容才显示，否者隐藏(mantob添加)
					_that.$applyTo.eq(selectIndex).show(); 
					$("#man_post_submit").hide();
				} else {
					_that.$applyTo.eq(selectIndex).hide();
					if ($("#man_catid_"+parent_id).attr('child') == 1) {
						man_tips('此栏目无法发布或者权限不够');
						return;
					}
					// 显示发布按钮
					$("#man_post_submit").show();
					return;
				}
				var _h = _that._getOptionsHtml(data);
				_that._create(_h,selectIndex);
				_that.$applyTo.eq(selectIndex).trigger("afterLoad.ld");
				if(callback) {
					callback.call(this);
				}
			} 
			$.ajax(_ajaxOptions);
		},
		/**
		 * 删除指定index索引值的选择框下的选择项
		 * @param {Number} index 选择框的索引值
		 * @return {Object} this
		 */
		removeOptions : function(index){
			this.$applyTo.eq(index).children("."+this.OPTIONS_CLASS).remove();
			return this;
		},
		selected : function(t,completeCallBack){
			var _that = this;
			if(t && typeof t == "object" && t.length > 0){
				var $select = this.$applyTo;
				_load(_that.options.defaultLoadSelectIndex, _that.options.defaultParentId);
			}
			/**
			 * 递归获取选择框数据
			 * @param {Number} selectIndex 选择框的索引值
			 * @param {Number} parent_id   id
			 */
			function _load(selectIndex, parent_id){
				_that.load(selectIndex, parent_id, function(){
					var id = _selected(selectIndex, t[selectIndex]);
					selectIndex ++;
					if(selectIndex > _that.size()-1) {
						if(completeCallBack) completeCallBack.call(this);
						return;
					}
					_load(selectIndex, id);
				});
			}
			/**
			 * 选中包含指定文本的选择项
			 * @param {Number} index 选择框的索引值
			 * @param {String} text  选择框的value值 (mantob修改为按id匹配)
			 * @return {Number} 该选择框的value值
			 */
			function _selected(index,text){
				var id = 0;
				_that.$applyTo.eq(index).children().each(function(){
					if(text && text.toString() == $(this).attr("value")){
						$(this).attr("class", "onbox man_catid_"+(index+1));
						id = $(this).attr("value");
						return;
					}
				})
				return id;
			}
			return this;
		},
		/**
		 * 选择框的值改变后触发的事件
		 * @param {Object} e 事件
		 */
		onchange : function(e){
			//实例化后的对象引用
			var _that = e.data.target;
			//选择框的索引值
			var index = e.data.index;
			//目标选择框
			var $target = $(e.target);
			var _parentId = $target.val();
			var _i = index+1;
			$(".man_catid_"+_i).attr("class", "man_catid_"+_i);
			$("#man_catid_"+_parentId).attr("class", "onbox man_catid_"+_i);
			$("#load_layer").show();
			$("#man_post_catid").val($("#man_catid_"+_parentId).attr("value"));
            _that.load(_i, _parentId);									   		
		},			
		/**
		 * 将数据源（json或xml）转成html
		 * @param {Object} data
		 * @return {String} html代码字符串
		 */
		_getOptionsHtml : function(data){
			var _that = this;
			var ajaxOptions = this.options.ajaxOptions;
			var dataType = ajaxOptions.dataType;
			var field = this.options.field; 
			var _h = "";
			_h = _getOptions(data,dataType,field).join("");;
			/**
			 * 获取选择框项html代码数组
			 * @param {Object | Array} data 数据
			 * @param {String} dataType 数据类型
			 * @param {Object} field 字段
			 * @return {Array} aStr 
			 */
			function _getOptions(data,dataType,field){
				var optionClass = _that.OPTIONS_CLASS;
				var aStr = [];
				var id,name,child;
				$.each(data,function(i){
					id = data[i][field.region_id];
					name = data[i][field.region_name];
					child = data[i][field.region_child];
					var _option = "<li id='man_catid_"+id+"' style='"+(child == 1 ? '' : 'background-image:none')+"' value='"+id+"' child='"+child+"'>"+name+"</li>";
					aStr.push(_option);						
				});
				return aStr;
			}
			return _h;
		},
		/**
		 * 向选择框添加html
		 * @param {String} _h html代码
		 * @param {Number} index 选择框的索引值
		 */
		_create : function(_h,index){
			var _that = this;
			this.removeOptions(index);
			this.$applyTo.eq(index).html(_h);									
		}
	}
	$.fn.ld.defaults = {
		/**选择框对象数组*/
        selects : null,
        drevent : 'change',
		/**ajax配置*/
		ajaxOptions : {
			url : null,
			type : 'get',
			data : {},
			dataType : 'json',
			success : function(){},
			beforeSend : function(){}				
		},
		/**默认父级id*/
		defaultParentId : 0,
		/**默认读取数据的选择框*/
		defaultLoadSelectIndex : 0,
		/**默认选择框中的选中项*/
		texts : [],
		/**选择框的样式*/
		style : null,
		/**选择框值改变时的回调函数*/
		change : function(){},
		field : {
			parent_id : "parent_id",
			region_id : "region_id",
			region_name : "region_name",
			region_child : "region_child"
		}
	
	} 
})(jQuery);