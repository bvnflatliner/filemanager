import React from 'react';
import { Modal } from 'antd';

import i18next from 'i18next';

export default function ConfirmDelete({ visible, count, doDelete, hide }) {
	const onOk = () => {
		doDelete();
		hide();
	};

	return (
		<Modal
			title={ i18next.t('confirm_deletion') }
			visible={ visible }
			okText={ i18next.t('yes') }
			okType="danger"
			cancelText={ i18next.t('no') }
			onOk={ onOk }
			onCancel={ hide }
		>
			<p>{ i18next.t('are_you_sure_to_delete_') + count + i18next.t('_files_dirs') + '?' }</p>
		</Modal>
	);
}