<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Mantob Website Management System
 *
 * @since		version 2.3.0
 * @author		mantob <kefu@mantob.com>
 * @license     http://www.mantob.com/license
 * @copyright   Copyright (c) 2013 - 9999, mantob.Com, Inc.
 */

class Field extends M_Controller {

	public $data;
	public $module;
	public $backuri;
	public $cacheuri;
	public $relatedid;
	public $relatedname;
	
    /**
     * 构造函数
     */
    public function __construct() {
		parent::__construct();
        $iscategory = $ismain = $issearch = 0;
		$this->relatedid = (int)$this->input->get('rid');
		$this->relatedname = $this->input->get('rname'); // 字段来源相关表
		$this->load->model('field_model');
		$this->module = NULL;
		switch($this->relatedname) {
			case 'module': // 模块字段
				$ismain = 0;
				$this->load->model('module_model');
				$this->data = $this->module_model->get($this->relatedid);
                // 当前模型没有可用站点
				if (!$this->data['site'][SITE_ID]['use']) {
                    $this->admin_msg(lang('096'));
                }
				$this->backuri = 'admin/module/index'; // 返回uri地址
				$this->cacheuri = 'module'; // 缓存文件标示名称
				$this->module = $this->data['dirname'];
				break;
			case 'member': // 会员字段
				$ismain = 1;
				$this->backuri = 'member/admin/home/index'; // 返回uri地址
                $this->cacheuri = 'member'; // 缓存文件标示名称
				break;
			case 'spacetable': // 会员空间字段
				$ismain = 1;
				$this->backuri = 'member/admin/space/index'; // 返回uri地址
                $this->cacheuri = 'member'; // 缓存文件标示名称
				break;
			case 'space': // 会员空间字段
				$ismain = 1;
				$this->data = $this->get_cache('space-model', $this->relatedid);
				$this->backuri = 'member/admin/model/index'; // 返回uri地址
                $this->cacheuri = 'space-model'; // 缓存文件标示名称
				if (!$this->data) {
                    $this->admin_msg(lang('159'));
                }
				break;
            case 'page': // 单网页字段
                $ismain = 1;
                $this->backuri = 'admin/page/index'; // 返回uri地址
                $this->cacheuri = 'page'; // 缓存文件标示名称
                break;
			default: 
				if (strpos($this->relatedname, 'form') === 0) {
					// 表单字段
					$ismain = 1;
					$this->data = $this->get_cache($this->relatedname, $this->relatedid);
					$this->backuri = 'admin/form/index'; // 返回uri地址
                    $this->cacheuri = 'form'; // 缓存文件标示名称
					if (!$this->data) {
                        $this->admin_msg(lang('247'));
                    }
				} elseif (strpos($this->relatedname, 'category') === 0) {
					// 栏目字段
					$ismain = 1;
					$this->data = $this->get_cache($this->relatedname, $this->relatedid);
					$this->backuri = 'admin/module/index'; // 返回uri地址
                    $this->cacheuri = 'module'; // 缓存文件标示名称
					if (!$this->data) {
                        $this->admin_msg(lang('247'));
                    }
				} elseif (strpos($this->relatedname, 'extend') === 0) {
					// 内容扩展字段
					$ismain = 0;
					$this->load->model('module_model');
					$this->data = $this->module_model->get($this->relatedid);
                    // 当前模型没有可用站点
                    if (!$this->data['site'][SITE_ID]['use']) {
                        $this->admin_msg(lang('096'));
                    }
					$this->backuri = 'admin/module/index'; // 返回uri地址
                    $this->cacheuri = 'module'; // 缓存文件标示名称
					$this->module = $this->data['dirname'];
				} elseif (strpos($this->relatedname, 'mform') === 0) {
					// 模块表单字段
					$ismain = 1;
					$this->load->model('module_model');
					list($a, $module) = explode('-', $this->relatedname);
					$this->data = $this->get_cache('module-'.SITE_ID.'-'.$module);
                    // 当前模型没有可用站点
                    if (!$this->data['site'][SITE_ID]['use']) {
                        $this->admin_msg(lang('096'));
                    }
					$this->backuri = 'admin/mform/index/dir/'.$this->data['dirname']; // 返回uri地址
                    $this->cacheuri = 'module'; // 缓存文件标示名称
					$this->module = $this->data['dirname'];
				} else {
					// 模块栏目
					$ismain = 0;
					$issearch = 1;
                    $iscategory = 1;
					list($module, $siteid) = explode('-', $this->relatedname);
					$MOD = $this->get_cache('module-'.SITE_ID.'-'.$module);
                    // 当前模型没有可用站点
					if (!$MOD['category'][$this->relatedid]) {
                        $this->admin_msg(lang('117'));
                    }
					$this->data = $MOD['category'][$this->relatedid];
					$this->data['siteid'] = $siteid;
					$this->data['module'] = $module;
					$this->backuri = $module.'/admin/category/index'; // 返回uri地址
                    $this->cacheuri = 'module'; // 缓存文件标示名称
					$this->module = $module;
				}
				break;
		}
		$this->load->library('Dfield', array($this->module));
		$this->template->assign(array(
			'menu' => $this->get_menu(array(
				lang('back') => $this->backuri,
				lang('097') => 'admin/field/index/rname/'.$this->relatedname.'/rid/'.$this->relatedid,
				lang('add') => 'admin/field/add/rname/'.$this->relatedname.'/rid/'.$this->relatedid,
			)),
			'rid' => $this->relatedid,
			'rname' => $this->relatedname,
			'module' => $this->module,
			'ismain' => $ismain,
			'issearch' => $issearch,
			'iscategory' => $iscategory,
		));
    }
	
	/**
     * 管理
     */
    public function index() {

		if (IS_POST) {
			if ($this->input->post('action') == 'del') {
				$this->field_model->del($this->input->post('ids'));
				exit(man_json(1, lang('014')));
			} else {
				$_ids = $this->input->post('ids');
				$_data = $this->input->post('data');
				foreach ($_ids as $id) {
					$this->db->where('id', $id)->update('field',  $_data[$id]);
				}
				unset($_ids, $_data);
				exit(man_json(1, lang('014')));
			}
		}

		$data = $this->field_model->get_data();
		$group = array();
		if ($data) {
			foreach ($data as $t) {
				if ($t['fieldtype'] == 'Group' && preg_match_all('/\{(.+)\}/U', $t['setting']['option']['value'], $value)) {
					$group[$t['fieldname']] = man_random_color();
					foreach ($value[1] as $v) {
						$group[$v] = $group[$t['fieldname']];
					}
				}
			}
		}

		$this->template->assign(array(
			'list' => $data,
			'group' => $group
		));
		$this->template->display('field_index.html');
	}
	
	/**
     * 添加
     */
    public function add() {

		// 初始化部分值
		$page = max((int)$this->input->post('page'), 0);
		$result	= $code = $data['fieldtype'] = $data['setting']['option'] = '';
		$data['setting']['validate']['required'] = $id = 0;
		// 可用字段类别
		$ftype = $this->dfield->type($this->module);

		// 提交表单
		if (IS_POST) {
			$data = $this->input->post('data');
			$field = $this->dfield->get($data['fieldtype']);
			if (!$field) {
				$page = 0;
				$result	= lang('098');
			} elseif (empty($data['name'])) {
				$page = 0;
				$code = 'name';
			} elseif (!preg_match('/^[a-z]+[a-z0-9_\-]+$/i', $data['fieldname'])) {
				$page = 0;
				$code = 'fieldname';
			} elseif ($this->field_model->exitsts($data['fieldname'])) {
				$page = 0;
				$code = 'fieldname';
				$result	= lang('099');
			} else {
                $this->clear_cache($this->cacheuri);
				$this->field_model->add($data, $field->create_sql($data['fieldname'], $data['setting']['option']));
				$this->admin_msg(lang('014'), man_url('field/index', array('rname' => $this->relatedname, 'rid' => $this->relatedid)), 1);
			}

		}
		$this->template->assign(array(
			'id' => $id,
			'page' => $page,
			'code' => $code,
			'data' => $data,
			'ftype' => $ftype,
			'result' => $result,
			'relatedid' => $this->relatedid,
			'relatedname' => $this->relatedname,
		));
		$this->template->display('field_add.html');
	}
	
	/**
     * 修改
     */
    public function edit() {

		$id = (int)$this->input->get('id');
		$data = $this->field_model->get($id);
		if (!$data) {
            $this->admin_msg(lang('019'));
        }

		$page = max((int)$this->input->post('page'), 0);
		$ftype = $this->dfield->type();
		$result	= $code = '';

		if (IS_POST) {
			$_data = $data;
			$data = $this->input->post('data');
			$field = $this->dfield->get($_data['fieldtype']);
			if (!$field) {
				$page = 0;
				$result	= lang('098');
			} elseif (!$data['name']) {
				$page = 0;
				$code = 'name';
			} else {
                $this->clear_cache($this->cacheuri);
				$this->field_model->edit($_data, $data, $field->alter_sql($_data['fieldname'], $data['setting']['option']));
				$this->admin_msg(lang('014'), man_url('field/index', array('rname' => $this->relatedname, 'rid' => $this->relatedid)), 1);
			
			}
			$data['fieldname'] = $_data['fieldname'];
			$data['fieldtype'] = $_data['fieldtype'];
			
		}

		$this->template->assign(array(
			'id' => $id,
			'page' => $page,
			'code' => $code,
			'data' => $data,
			'ftype' => $ftype,
			'result' => $result,
			'relatedid' => $this->relatedid,
			'relatedname' => $this->relatedname,
		));
		$this->template->display('field_add.html');
	}
	
	/**
     * 禁用/可用
     */
    public function disabled() {

		if ($this->is_auth($this->uripre.'/edit')) {
			$id = (int)$this->input->get('id');
			$data = $this->db
                         ->select('disabled')
						 ->where('id', $id)
						 ->limit(1)
						 ->get('field')
						 ->row_array();
			$value = $data['disabled'] == 1 ? 0 : 1;
			$this->db
				 ->where('id', $id)
				 ->update('field', array('disabled' => $value));
            $this->clear_cache($this->cacheuri);
		}
        
		exit(man_json(1, lang('014')));
    }
	
	/**
     * 删除
     */
    public function del() {
		$this->field_model->del(array((int)$this->input->get('id')));
        $this->clear_cache($this->cacheuri);
		exit(man_json(1, lang('014')));
    }
}