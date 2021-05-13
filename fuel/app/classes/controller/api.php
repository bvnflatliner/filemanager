<?php

class Controller_Api extends Base_Controller
{
	public function before()
	{
		parent::before();

		$this->filemanager = \Filemanager::forge();

		$response = $this->response();
		$response->set_headers([
			'Access-Control-Allow-Origin' => '*'
		]);
	}

	public function get_tree()
	{
		// check permissions here

		$data = $this->filemanager->tree();

		sleep(1);

		try {
			$this->response(['status' => 'ok', 'data' => $data]);
		} catch (\Exception $e) {
			\Log::error('Tree error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}
	}

	public function post_dir()
	{
		// check permissions here

		$path = \Input::post('path');

		$data = $this->filemanager->dir($path);

		sleep(2);

		try {
			$this->response(['status' => 'ok', 'data' => $data, 'total' => count($data)]);
		} catch (\Exception $e) {
			\Log::error('Dir error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}
	}

	public function post_upload()
	{
		// check permissions here

		$path = \Input::post('path');

		try {
			$data = $this->filemanager->upload($path);
		} catch (\Exception $e) {
			\Log::error('Upload error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => $data]);
	}

	public function get_newfolder()
	{
		// check permissions here

		$path = \Input::get('path');
		$folder = \Input::get('folder');

		try {
			$this->filemanager->newfolder($path, $folder);
		} catch (\Exception $e) {
			\Log::error('New folder error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => ['folder' => $folder]]);
	}

	public function get_file()
	{
		// check permissions here

		$path = \Input::get('path');
		$name = \Input::get('name');

		try {
			$data = $this->filemanager->file($path, $name);
		} catch (\Exception $e) {
			\Log::error('Get file error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => $data]);
	}

	public function post_copy()
	{
		// check permissions here

		$path = \Input::post('path');
		$destination = \Input::post('destination');
		$files = explode(',', \Input::post('files'));

		if (!$files) {
			\Log::error('Copy error: files are required');
			return $this->response(['status' => 'error', 'msg' => 'Files are required']);
		}

		try {
			$data = $this->filemanager->copy($path, $destination, $files);
		} catch (\Exception $e) {
			\Log::error('Copy error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => $data]);
	}

	public function post_rename()
	{
		// check permissions here

		$path = \Input::post('path');
		$oldname = \Input::post('oldname');
		$newname = \Input::post('newname');

		if (!$oldname || !$newname) {
			\Log::error('Rename error: names are required');
			return $this->response(['status' => 'error', 'msg' => 'Names are required']);
		}

		try {
			$data = $this->filemanager->rename($path, $oldname, $newname);
		} catch (\Exception $e) {
			\Log::error('Rename error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => $data]);
	}

	public function post_delete()
	{
		// check permissions here

		$path = \Input::post('path');
		$files = explode(',', \Input::post('files'));

		if (!$files) {
			\Log::error('Delete error: files are required');
			return $this->response(['status' => 'error', 'msg' => 'Files are required']);
		}

		try {
			$data = $this->filemanager->delete($path, $files);
		} catch (\Exception $e) {
			\Log::error('Delete error: '.$e->getCode().' - '.$e->getMessage());
			return $this->response(['status' => 'error', 'msg' => $e->getMessage()]);
		}

		$this->response(['status' => 'ok', 'data' => $data]);
	}
}