import React, { useState } from 'react';
import { Input, Button, Popover, notification } from 'antd';

import i18next from 'i18next';

import api from '../api/api';

export default function CellEdit({ initialValue, setEditRowName, path, record, onRefresh }) {
	const [value, setValue] = useState(initialValue);
	const [visible, setVisible] = useState(false);

	const onOkClick = () => {
		if (value === '') {
			setEditRowName(initialValue);
			return;
		}

		api.rename({ path, oldname: initialValue, newname: value })
			.then(response => {
				const responseData = response.data;

				if (responseData.status === 'ok') {
					notification.success({
						message: i18next.t('renamed_successful'),
						description: (
							<p>{ i18next.t('file_renamed_successful') }</p>								
						)
					});
					record.name = value;
					onRefresh();
				} else {
					const msg = responseData.msg || i18next.t('unknown_error');
					notification.error({
						message: i18next.t('rename_fail'),
						description: msg
					});
				}
			}).catch(error => {
				notification.error({
					message: i18next.t('rename_fail'),
					description: error.message
				});
			});
	};

	const cellEditClick = e => {
		e.stopPropagation();
	};

	const cellEditChange = e => {
		setVisible(e.target.value !== initialValue);
		setValue(e.target.value);
	};

	const cellEditCancel = () => {
		setEditRowName();
	};

	return (
		<Popover
			content={(
				<>
					<Button onMouseDown={onOkClick}>{ i18next.t('ok') }</Button>
					<Button>{ i18next.t('cancel') }</Button>
				</>
			)}
			title={ i18next.t('save_changed') }
			trigger="focus"
			visible={ visible }
		>
			<Input value={ value }
				onClick={ cellEditClick }
				onChange={ cellEditChange }
				onBlur={ cellEditCancel }
				autoFocus
			/>
		</Popover>
	);
}