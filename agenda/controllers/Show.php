<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Mantob Website Management System
 *
 * @since		version 2.0.2
 * @author		mantob <kefu@mantob.com>
 * @license     http://www.mantob.com/license
 * @copyright   Copyright (c) 2013 - 9999, mantob.Com, Inc.
 */

class Show extends M_Controller {

    /**
     * 构造函数
     */
    public function __construct() {
        parent::__construct();
    }
	
	/**
     * 内容
     */
    public function index($id = 0, $page = 0, $return = FALSE) {
		$id = $id ? $id : (int)$this->input->get('id');
		$page = $page ? $page : max(1, (int)$this->input->get('page'));
        return $this->_show($id, $page, $return);
    }
	
	/**
     * 创建html
     */
    public function create_html() {
        $this->_create_show_file((int)$this->input->get('id'), FALSE);
    }
	
	/**
     * 生成html
     */
    public function html() {
        $this->_show_html();
    }
}