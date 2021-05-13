<?php

class Controller_Welcome extends Controller
{
	/**
	 * The basic welcome message
	 *
	 * @access  public
	 * @return  Response
	 */
	public function action_index()
	{
		$lang = \Input::param('lang');
		if (!in_array($lang, ['en', 'uk'])) {
			$lang = 'en';
		}

		return Response::forge(View::forge('welcome/index', ['lang' => $lang]));
	}

}
