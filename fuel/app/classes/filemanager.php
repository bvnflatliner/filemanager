<?php

class Filemanager
{

	protected static $_instance = null;

	protected $_default_config = [
		'upload_dir' => 'uploads'
	];

	protected $_config = [];

	public static function forge(array $config = [])
	{
		if (static::$_instance) {
			if ($config) {
				static::$_instance->set_config($config);
			}
		} else {
			static::$_instance = new static($config);
		}

		return static::$_instance;
	}

	public function set_config(array $config)
	{
		$this->_config = array_merge($this->_default_config, $config);
	}

	public function tree()
	{
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$area = \File::forge($config);

		$files = \File::read_dir('', 0, ['!^.' => 'file'], $area);

		$results = [
			'title'    => '/',
			'key'      => '/',
			'value'    => '/',
			'children' => $this->_build_tree('/', $files)
		];

		return $results;
	}

	public function dir($path)
	{
		$path = $path ? rtrim($path, '/').'/' : '';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$area = \File::forge($config);

		$files = \File::read_dir($path, 1, null, $area);

		$results = [];
		foreach ($files as $dir => $file) {
			$is_file = is_numeric($dir);
			$name = $is_file ? $file : rtrim($dir, '/');
			$fullpath = $area->get_path($path.$name);
			$handle = \File::get($fullpath, [], $area);
			$file_info = $is_file ? \File::file_info($path.$name, $area) : ['mimetype' => 'directory'];

			$results[] = [
				'type'        => $is_file ? 'f' : 'd',
				'mime_type'   => $file_info['mimetype'],
				'media_type'  => $this->_get_media_type($file_info['mimetype']),
				'name'        => $name,
				'direct_link' => \Uri::base().$upload_dir.$path.$name,
				'size'        => $is_file ? $handle->get_size() : 4096,
				'modified'    => $handle->get_time('modified'),
				'permissions' => $handle->get_permissions(),
				'owner'       => $this->_get_username(fileowner($fullpath)),
				'group'       => $this->_get_group(filegroup($fullpath))
			];
		}

		return $results;
	}

	public function upload($path)
	{
		// possibliy we need to change memory limit here or in php.ini
		//ini_set('memory_limit', '4096M');
		$path = rtrim($path, '/').'/';
		$config = $this->_config;
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config['path'] = $upload_dir.$path;

		\Upload::process($config);

		$results = [
			'uploaded' => [],
			'failed'   => []
		];
		if (\Upload::is_valid()) {
			\Upload::save();
			$results['uploaded'] = \Upload::get_files();
		}
		$results['failed'] = \Upload::get_errors();

		return $results;
	}

	public function newfolder($path, $folderName)
	{
		$path = rtrim($path, '/').'/';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$area = \File::forge($config);

		$result = $area->create_dir($path, $folderName);

		return $result;
	}

	public function file($path, $name)
	{
		$path = rtrim($path, '/').'/';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$area = \File::forge($config);

		$file_info = \File::file_info($path.$name, $area);
		$content = \File::read($path.$name, true, $area);
		$mimetype = $file_info['mimetype'];
		$media_type = $this->_get_media_type($mimetype);
		
		switch ($media_type) {
			case 'text':
				// leave content unchanged, simplify type
				break;
			case 'image':
			case 'audio':
			case 'video':
				// encode content with base64, leave type unchanged
				$content = 'data:'.$mimetype.';base64,'. base64_encode($content);
				break;
			case 'binary':
			default:
				// set fake content for all untreatable types
				$content = 'Binary file';
		}

		$result = [
			'direct_link' => \Uri::base().$upload_dir.$path.$name,
			'mimetype'    => $mimetype,
			'media_type'  => $media_type,
			'content'     => $content
		];

		return $result;
	}

	public function copy($path, $destination, array $files)
	{
		$path = rtrim($path, '/').'/';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$errors = [
			'dirs'  => [],
			'files' => []
		];
		$scenario = [];
		$successful = 0;

		$area = \File::forge($config);
		// prepare scenario
		foreach ($files as $file) {
			$fullpathfrom = $area->get_path($path.$file);
			$fullpathto =  $area->get_path($destination.$file);
			if (is_dir($fullpathfrom)) {
				$scenario[$fullpathto] = '.';
				$this->_make_scenario_for_dir($scenario, $fullpathfrom, $fullpathto.'/');
			} else {
				$scenario[$fullpathto] = $fullpathfrom;
			}
		}

		if ($scenario) {
			foreach ($scenario as $destination => $source) {
				if ($source == '.') {
					$basepath = dirname($destination);
					$name = basename($destination);
					try {
						\File::create_dir($basepath, $name, 0775);
						$successful++;
					} catch (\Exception $e) {
						\Log::error('Create dir error: '.$e->getMessage());
						$errors['dirs'][] = $destination;
					}
				} else {
					try {
						\File::copy($source, $destination);
						$successful++;
					} catch (\Exception $e) {
						\Log::error('Copy file error: '.$e->getMessage());
						$errors['files'][] = $source;
					}
				}
			}
		}

		$result = [
			'successful' => $successful,
			'errors'     => $errors
		];

		return $result;
	}

	public function rename($path, $oldname, $newname)
	{
		$path = rtrim($path, '/').'/';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$area = \File::forge($config);

		$result = \File::rename($path.$oldname, $path.$newname, $area, $area);

		return $result;
	}

	public function delete($path, array $files)
	{
		$path = rtrim($path, '/').'/';
		$upload_dir = rtrim($this->_config['upload_dir'], '/').'/';
		$config = [
			'basedir'   => $upload_dir,
			'use_locks' => true
		];

		$successful = 0;

		$area = \File::forge($config);

		foreach ($files as $file) {
			$fullpath = $area->get_path($path.$file);
			if (is_dir($fullpath)) {
				if (\File::delete_dir($fullpath, true, true, $area)) $successful++;
			} else {
				if (\File::delete($fullpath, $area)) $successful++;
			}
		}

		$result = [
			'successful' => $successful
		];

		return $result;
	}

	private function _build_tree($key, $files)
	{
		$results = [];
		foreach ($files as $dir => $children) {
			$item = [
				'title' => rtrim($dir, '/'),
				'key'   => $key.$dir,
				'value' => $key.$dir
			];
			if (is_array($children)) {
				$item['children'] = $this->_build_tree($item['key'], $children);
			}
			$results[] = $item;
		}

		return $results;
	}

	private function _get_username($uid)
	{
		$user_info = posix_getpwuid($uid);

		return $user_info ? $user_info['name'] : 'NA';
	}

	private function _get_group($gid)
	{
		$group_info = posix_getgrgid($gid);

		return $group_info ? $group_info['name'] : 'NA';
	}

	private function _get_media_type($mimetype)
	{
		$media_type = explode('/', $mimetype)[0];

		switch ($media_type) {
			case 'text':
			case 'message':
				$media_type = 'text';
				break;
			case 'image':
			case 'audio':
			case 'video':
				// leave type unchanged
				break;
			case 'application':
			case 'example':
			case 'font':
			case 'model':
			case 'multipart':
			default:
				// set fake type
				$media_type = 'binary';
		}

		return $media_type;
	}

	private function _make_scenario_for_dir(&$scenario, $dir, $fullpathto)
	{
		function _parse_one_level(&$scenario, $files, $prefix, $fullpathto)
		{
			foreach ($files as $dir => $file) {
				$is_file = is_numeric($dir);
				if ($is_file) {
					$scenario[$fullpathto.$file] = $prefix.$file;
				} else {
					$scenario[$fullpathto.$dir] = '.';
					_parse_one_level($scenario, $file, $prefix.$dir, $fullpathto.$dir);
				}
			}
		}

		$files = \File::read_dir($dir);

		_parse_one_level($scenario, $files, $dir.'/', $fullpathto);
	}

	final private function __construct(array $config = [])
	{
		$config_file = \Config::load('filemanager', true);
		if ($config_file) {
			$config = array_merge($config_file, $config);
		}

		if ($config) {
			$this->set_config($config);
		} else {
			$this->_config = $this->_default_config;
		}

		return $this;
	}

}