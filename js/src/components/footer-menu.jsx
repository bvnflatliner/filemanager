import React from 'react';
import { Button, Icon } from 'antd';

import i18next from 'i18next';

export default function FooterMenu({ visible, onClickRefresh, onClickCopy, onClickDelete }) {

	return (
		<div style={{ position: 'fixed', left: 210 }}>
			<Button size='small' onClick={ onClickRefresh } title={ i18next.t('refresh') }><Icon type='reload' /></Button>
			{visible && (
				<Button size='small' onClick={ onClickCopy } title={ i18next.t('copy') } style={{ marginLeft: 5 }}><Icon type='copy' /></Button>
			)}
			{visible && (
				<Button size='small' onClick={ onClickDelete } title={ i18next.t('delete') } style={{ marginLeft: 5 }}><Icon type='delete' /></Button>
			)}
		</div>
	);
}
