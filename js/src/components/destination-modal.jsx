import React, { useState } from 'react';
import { Modal, TreeSelect } from 'antd';

import i18next from 'i18next';

import api from '../api/api';
import useRequest from '../hooks/use-request';

export default function DestinationModal({ visible, doCopy, hide, refresh }) {
	const [ destination, setDestination ] = useState('');

	const dataSource = useRequest({
		request: api.tree,
		payload: { refresh }
	});

	if (dataSource.loading) {
		return null;
	}

	if (dataSource.error) {
		console.log(`Error: ${ dataSource.error }`);
		return null;
	}

	const onSelect = data => {
		setDestination(data);
	};

	const onCancel = () => {
		setDestination('');
		hide();
	};

	const onOk = () => {
		doCopy(destination);
		setDestination('');
		hide();
	};

	return (
		<Modal
			title={ i18next.t('copy_destination') }
			visible={ visible }
			onOk={ onOk }
			onCancel={ onCancel }
		>
			<TreeSelect value={ destination } treeData={ [ dataSource.data ] } onSelect={ onSelect } treeDefaultExpandAll dropdownStyle={{ height: 300 }} style={{ width: 400 }} />
		</Modal>
	);
}
