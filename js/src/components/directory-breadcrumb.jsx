import React from 'react';
import { Breadcrumb, Icon } from 'antd';

export default function DirectoryBreadcrumb({ path, onClick }) {
	const items = path.split('/');
	items.unshift('');

	const renderBreadcrumbItems = data => {
		let currentKey = '';
		return data.map((item, idx) => {
			currentKey += `${ item }/`;
			const arg = currentKey;
			if (idx === 0) {
				return (
					<Breadcrumb.Item key={ currentKey } onClick={ () => onClick(arg) }><Icon type='home' /></Breadcrumb.Item>
				);
			}

			return (
				<Breadcrumb.Item key={ currentKey } onClick={ () => onClick(arg) }>{ item }</Breadcrumb.Item>
			);
		});
	};

	return (
		<Breadcrumb className='breadcrumb'>{ renderBreadcrumbItems(items) }</Breadcrumb>
	);
}
