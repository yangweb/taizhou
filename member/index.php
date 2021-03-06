<?php

/**
 * Mantob Website Management System
 *
 * @since		version 2.0.0
 * @author		mantob <kefu@mantob.com>
 * @license     http://www.mantob.com/license
 * @copyright   Copyright (c) 2013 - 9999, mantob.Com, Inc.
 * @filesource	svn://www.mantob.com/v2/member/index.php
 */

define('IS_MEMBER', TRUE); // 项目标识
define('FCPATH', dirname(dirname(__FILE__)).'/'); // 网站根目录
// 判断s参数,“应用程序”文件夹目录
if (isset($_GET['s']) && preg_match('/^[a-z]+$/i', $_GET['s']) && $_GET['s'] != 'member') {
	if (is_dir(FCPATH.$_GET['s'])) { // 模块
		define('APPPATH', FCPATH.$_GET['s'].'/');
		define('APP_DIR', $_GET['s']); // 模块目录名称
		$_GET['d'] = 'member'; // 将项目标识作为directory
	} elseif (is_dir(FCPATH.'app/'.$_GET['s'].'/')) { // 应用
		define('APPPATH', FCPATH.'app/'.$_GET['s'].'/');
		define('APP_DIR', $_GET['s']); // 应用目录名称
		$_GET['d'] = 'member'; // 将项目标识作为directory
	}
}
if (!defined('APPPATH')) define('APPPATH', dirname(__FILE__).'/'); // “应用程序”文件夹目录
require FCPATH.'index.php'; // 引入主文件