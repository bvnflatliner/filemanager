import React, { useState } from 'react';

import { ConfigProvider, Layout, Row, Col } from 'antd';
import enUS from 'antd/es/locale/en_US';
import ukUA from 'antd/es/locale/uk_UA';
import 'antd/dist/antd.css';

import 'moment/locale/uk';

import i18next from 'i18next';
import moment from 'moment';
import en from './locale/en.json';
import uk from './locale/uk.json';

import useLang from './hooks/use-lang';

import DirectoryTable from './components/directory-table';
import DirectoryTree from './components/directory-tree';
import DirectoryBreadcrumb from './components/directory-breadcrumb';
import UploadModal from './components/upload-modal';
import NewFolderModal from './components/new-folder-modal';
import './app.css';

const { Header, Sider, Content } = Layout;

function App() {
	const [currentPath, setCurrentPath] = useState('');
	const [selectedKey, setSelectedKey] = useState('/');
	const [refreshTable, setRefreshTable] = useState(moment().unix());
	const [refreshTree, setRefreshTree] = useState(moment().unix());

	const lang = useLang({ en, uk }, 'en');
	let locale;

	moment.locale(lang);

	switch (lang) {
		case 'uk':
			locale = ukUA;
			break;
		case 'en':
		default:
			locale = enUS;
	}

	const onDirectoryClick = key => {
		setSelectedKey(key);
		const path = key.replace(/^\/+|\/+$/g, '');
		setCurrentPath(path);
	};

	const refreshBoth = () => {
		setRefreshTable(moment().unix());
		setRefreshTree(moment().unix());
	}

	const onUploadFinished = () => {
		refreshBoth();
	};

	const onFolderCreated = () => {
		refreshBoth();
	};

	const onTreeSelect = keys => {
		let key = keys.shift();
		setSelectedKey(key);
		key = key.replace(/^\/+|\/+$/g, '');
		setCurrentPath(key);
	};

	return (
		<ConfigProvider locale={ locale }>
			<div className='app'>
				<Layout className='layout'>
					<Header className='header'>
						<Row>
							<Col span={ 4 }>
								{ i18next.t('file_manager') }
							</Col>
							<Col span={ 14 }>
								<DirectoryBreadcrumb path={ currentPath } onClick={ onDirectoryClick } />
							</Col>
							<Col className='pull-right' span={ 6 }>
								<UploadModal path={ currentPath } onUploadFinished={ onUploadFinished } />
								<NewFolderModal path={ currentPath } onFolderCreated={ onFolderCreated } />
							</Col>
						</Row>
					</Header>
					<Layout>
						<Sider className='sider'>
							<DirectoryTree onSelect={ onTreeSelect } selectedKeys={ [ selectedKey ] } refresh={ refreshTree } />
						</Sider>
						<Layout>
							<Content className='content'>
								<DirectoryTable path={ currentPath } refresh={ refreshTable } onRefreshBoth={ refreshBoth } onRefreshTree={ setRefreshTree } onClick={ onDirectoryClick } />
							</Content>
						</Layout>
					</Layout>
				</Layout>
			</div>
		</ConfigProvider>
	);
}

export default App;
