import React, { useState } from 'react';
import { Button, Modal, Icon, Input, notification } from 'antd';

import i18next from 'i18next';

import api from '../api/api';

export default function NewFolderModal({ path, onFolderCreated }) {
	const [modalVisible, setModalVisible] = useState(false);
	const [folder, setFolder] = useState('');
	const [creating, setCreating] = useState(false);

	const showModal = () => {
		setModalVisible(true);
	};

	const hideModal = () => {
		setModalVisible(false);
	};

	const okModal = () => {
		if (folder === '') {
			return false;
		}
		setCreating(true);

		api.newfolder({ path, folder })
			.then(response => {
				const responseData = response.data;

				if (responseData.status === 'ok') {
					const { data } = responseData;
					notification.success({
						message: i18next.t('new_folder_success'),
						description: <p>{ data.folder }</p>
					});
					// reload tree
					onFolderCreated();
					setFolder('');
					hideModal();
				} else {
					const msg = responseData.msg || i18next.t('unknown_error');
					notification.error({
						message: i18next.t('new_folder_fail'),
						description: msg
					});
				}
				setCreating(false);
			}).catch(error => {
				notification.error({
					message: i18next.t('new_folder_fail'),
					description: error.message
				});
				setCreating(false);
			});

		return true;
	};

	const cancelModal = () => {
		setFolder('');
		hideModal();
	};

	const onChangeName = e => {
		setFolder(e.target.value);
	};

	return (
		<>
			<Button type='primary' icon='folder-add' onClick={ showModal } style={{ marginLeft: 10 }}>
				{ i18next.t('new_folder') }
			</Button>
			<Modal title={ i18next.t('new_folder') } visible={ modalVisible } onOk={ okModal }
				onCancel={ cancelModal } okText={ creating ? (<Icon type='loading' />) : i18next.t('ok') } cancelText={ i18next.t('cancel') }>
				<Input placeholder={i18next.t('folder_name')} value={ folder } onChange={ onChangeName } autoFocus />
			</Modal>
		</>
	);
}
