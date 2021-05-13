<?php

class Base_Controller extends \Controller_Rest
{

	public function before()
	{
		parent::before();

		$this->format = 'json';
	}

}
