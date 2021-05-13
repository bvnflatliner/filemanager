import React from 'react';
import { Menu, Icon, Modal, Input } from 'antd';

import i18next from 'i18next';

export default function ContextMenu({ record, visible, x, y, onCopyClick, onRenameClick, onDeleteClick }) {
	if (!visible) {
		return <div />;
	}

	const showLink = () => {
		Modal.info({
			icon: null,
			title: i18next.t('direct_link_for_') + record.name,
			content: <Input	value={ record.direct_link } readOnly />
		});
	};

	const menu = (
		<Menu>
			{record.type === 'f' && <Menu.Item key='getLink' onClick={ showLink }><Icon type='link' />{i18next.t('get_direct_link')}</Menu.Item>}
			<Menu.Item key='copy' onClick={ () => onCopyClick(record) }><Icon type='copy' />{i18next.t('copy')}</Menu.Item>
			<Menu.Item key='rename' onClick={ () => onRenameClick(record) }><Icon type='edit' />{i18next.t('rename')}</Menu.Item>
			<Menu.Item key='delete' onClick={ () => onDeleteClick(record) }><Icon type='delete' />{i18next.t('delete')}</Menu.Item>
		</Menu>
	);

	return (
		<div style={{ left: `${ x }px`, top: `${ y }px`, position: 'absolute' }}>
			{ menu }
		</div>
	);
}
