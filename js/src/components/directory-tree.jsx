import React from 'react';
import { Tree, Spin, Icon } from 'antd';

import api from '../api/api';
import useRequest from '../hooks/use-request';

export default function DirectoryTree({ onSelect, selectedKeys, refresh }) {

	const dataSource = useRequest({
		request: api.tree,
		payload: { refresh }
	});

	if (dataSource.loading) {
		return (
			<Spin style={{ position: 'relative', top: '40%', left: '45%' }} />
		);
	}

	if (dataSource.error) {
		console.log(`Error: ${ dataSource.error }`);
		return (
			<Icon type='warning' style={{ fontSize: '1.4em', color: 'red', position: 'relative', top: 15, left: 15 }} />
		);
	}

	return <Tree treeData={ [ dataSource.data ] } onSelect={ onSelect } selectedKeys={ selectedKeys } defaultExpandAll />;
}
