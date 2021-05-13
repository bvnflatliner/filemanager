import React, { useState } from 'react';
import { Button, Modal, Upload, Icon, notification } from 'antd';

import i18next from 'i18next';

import api from '../api/api';

export default function UploadModal({ path, onUploadFinished }) {
	const [modalVisible, setModalVisible] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [uploading, setUploading] = useState(false);

	const showModal = () => {
		setModalVisible(true);
	};

	const hideModal = () => {
		setModalVisible(false);
	};

	const okModal = () => {
		if (fileList.length === 0) {
			return false;
		}
		setUploading(true);

		api.upload(fileList, path)
			.then(response => {
				const responseData = response.data;

				if (responseData.status === 'ok') {
					const { data } = responseData;
					const uploadedFileList = data.uploaded.map(el =>
						<li key={ el.name }>{ el.name }</li>
					);
					if (uploadedFileList.length !== 0) {
						notification.success({
							message: i18next.t('files_upload_success'),
							description: <ul>{ uploadedFileList }</ul>
						});
					}
					const failedFileList = data.failed.map(el =>
						<li key={ el.name }>{ `${ el.name }: ${ el.errors[0].message }` }</li>
					);
					if (failedFileList.length !== 0) {
						notification.error({
							message: i18next.t('files_upload_fail'),
							description: <ul>{ failedFileList }</ul>
						});
					}
					// reload dir
					onUploadFinished();
					setFileList([]);
					hideModal();
				} else {
					const msg = responseData.msg || i18next.t('unknown_error');
					notification.error({
						message: i18next.t('files_upload_fail'),
						description: msg
					});
				}
				setUploading(false);
			}).catch(error => {
				notification.error({
					message: i18next.t('files_upload_fail'),
					description: error.message
				});
				setUploading(false);
			});

		return true;
	};

	const cancelModal = () => {
		setFileList([]);
		hideModal();
	};

	const beforeUpload = file => {
		setFileList([ ...fileList, file ]);
		return false;
	};

	const removeFile = file => {
		const index = fileList.indexOf(file);
		const newFileList = fileList.slice();
		newFileList.splice(index, 1);
		setFileList(newFileList);
	};

	return (
		<>
			<Button type='primary' icon='upload' onClick={ showModal }>
				{ i18next.t('upload') }
			</Button>
			<Modal title={ i18next.t('upload_files') } visible={ modalVisible } onOk={ okModal }
				onCancel={ cancelModal } okText={ uploading ? (<Icon type='loading' />) : i18next.t('ok') } cancelText={ i18next.t('cancel') }>
				<Upload fileList={ fileList } beforeUpload={ beforeUpload } onRemove={ removeFile }>
					<Button>
						<Icon type='upload' />{i18next.t('upload')}
					</Button>
				</Upload>
			</Modal>
		</>
	);
}
