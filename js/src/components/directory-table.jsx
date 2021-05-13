import React, { useState, createRef, useEffect } from 'react';
import { Table, Input, Button, Radio, InputNumber, DatePicker, Spin, Icon, Modal, notification } from 'antd';

import i18next from 'i18next';
import moment from 'moment';

import CellEdit from './cell-edit';
import ContextMenu from './context-menu';
import FooterMenu from './footer-menu';
import DestinationModal from './destination-modal';
import ConfirmDelete from './confirm-delete';

import api from '../api/api';
import useRequest from '../hooks/use-request';
import './directory-table.css';

const { TextArea } = Input;

export default function DirectoryTable({ path, refresh, onRefreshBoth, onRefreshTree, onClick }) {
	let filterNameInput = createRef();
	let filterSizeInput = createRef();
	let filterPermissionsInput = createRef();
	let filterOwnerInput = createRef();
	let filterGroupInput = createRef();
	const [ filterSizeOperation, setFilterSizeOperation ] = useState('gt');
	const [ filterModifiedOperation, setFilterModifiedOperation ] = useState('gt');
	const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);
	const [ contextMenu, setContextMenu ] = useState({
		visible: false,
		x: 0,
		y: 0
	});
	const [ destModalVisible, setDestModalVisible] = useState(false);
	const [ delModalVisible, setDelModalVisible ] = useState(false);
	const [ oneFile, setOneFile ] = useState();
	const [ editRowName, setEditRowName ] = useState();

	const dataSource = useRequest({
		request: api.dir,
		payload: { path, refresh }
	});

	const copyClick = () => {
		setDestModalVisible(true);
	};

	const deleteClick = () => {
		setDelModalVisible(true);
	};

	const contextCopyClick = record => {
		setOneFile(record.name);
		setDestModalVisible(true);
	};

	const contextRenameClick = record => {
		setEditRowName(record.name);
	};

	const contextDeleteClick = record => {
		setOneFile(record.name);
		console.log(oneFile);
		setDelModalVisible(true);
	};

	useEffect(() => {
		setSelectedRowKeys([]);
	}, [path]);

	if (dataSource.loading) {
		return (
			<Spin size='large' style={{ position: 'relative', top: '45%', left: '50%' }} />
		);
	}

	if (dataSource.error) {
		console.log(`Error: ${ dataSource.error }`);
		return (
			<Icon type='warning' style={{ fontSize: '1.6em', color: 'red', position: 'relative', top: 25, left: 25 }} />
		);
	}

	const doCopy = destination => {
		const files = oneFile ? [oneFile] : selectedRowKeys;
		api.copy({ path, destination, files })
			.then(response => {
				const responseData = response.data;

				if (responseData.status === 'ok') {
					const { data } = responseData;
					const { successful } = data;
					const failedDirs = data.errors.dirs.map(el =>
						<li key={ el }>{ el }</li>
					);
					const failedFiles = data.errors.files.map(el =>
						<li key={ el }>{ el }</li>
					);
					notification.success({
						message: i18next.t('copied_successful'),
						description: (
							<>
								<p>{ i18next.t('copied') + successful + i18next.t('_files') }</p>
								{ failedDirs.length > 0 && (
									<>
										<p>{ i18next.t('dirs_failed') }</p>
										<ul>{ failedDirs }</ul>
									</>
								)}
								{ failedFiles.length > 0 && (
									<>
										<p>{ i18next.t('files_failed') }</p>
										<ul>{ failedFiles }</ul>
									</>
								)}
							</>
						)
					});
					setTimeout(onRefreshBoth, 5);
				} else {
					const msg = responseData.msg || i18next.t('unknown_error');
					notification.error({
						message: i18next.t('copy_fail'),
						description: msg
					});
				}
			}).catch(error => {
				notification.error({
					message: i18next.t('copy_fail'),
					description: error.message
				});
			});

		setSelectedRowKeys([]);
		setOneFile();
		return true;
	};

	const doDelete = () => {
		const files = oneFile ? [oneFile] : selectedRowKeys;
		api.delete({ path, files })
			.then(response => {
				const responseData = response.data;
				const { data } = responseData;
				const { successful } = data;

				if (responseData.status === 'ok') {
					notification.success({
						message: i18next.t('deleted_successful'),
						description: (
							<p>{ successful + i18next.t('_files_dirs_deleted_successful') }</p>								
						)
					});
					setTimeout(onRefreshBoth, 5);
				} else {
					const msg = responseData.msg || i18next.t('unknown_error');
					notification.error({
						message: i18next.t('delete_fail'),
						description: msg
					});
				}
			}).catch(error => {
				notification.error({
					message: i18next.t('delete_fail'),
					description: error.message
				});
			});

		setSelectedRowKeys([]);
		setOneFile();
		return true;
	};

	const hideDestModal = () => {
		setOneFile();
		setDestModalVisible(false);
	};

	const hideDelModal = () => {
		setOneFile();
		setDelModalVisible(false);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: keys => {
			setSelectedRowKeys(keys);
		},
		hideDefaultSelections: true,
		selections: [
			{
				key: 'all-data',
				text: i18next.t('all_data'),
				onSelect: data => {
					setSelectedRowKeys(data);
				}
			},
			{
				key: 'no-data',
				text: i18next.t('no_data'),
				onSelect: () => {
					setSelectedRowKeys([]);
				}
			},
			{
				key: 'invert-data',
				text: i18next.t('invert_data'),
				onSelect: data => {
					setSelectedRowKeys(data.filter(el => !selectedRowKeys.includes(el)));
				}
			}
		],
		columnWidth: 50
	};

	const columns = [
		{
			title: i18next.t('type'),
			dataIndex: 'type',
			key: 'type',
			sorter: (a, b) => {
				const types = ['d', 'f'];
				return types.indexOf(a.type) - types.indexOf(b.type);
			},
			filters: [
				{ text: i18next.t('dir'), value: 'd' },
				{ text: i18next.t('file'), value: 'f' }
			],
			onFilter: (value, data) => data.type.indexOf(value) === 0,
			filterMultiple: false,
			render: value => {
				let res = '';
				switch (value) {
					case 'd':
						res = <Icon type='folder' />;
						break;
					case 'f':
						res = <Icon type='file' />;
						break;
					default:
						res = <span>value</span>;
				}

				return res;
			},
			width: 90
		},
		{
			title: i18next.t('name'),
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input ref={ node => { filterNameInput = node; } } placeholder={ i18next.t('filter_name') }
						value={ selectedKeys[0] }
						onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
						onPressEnter={ confirm }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => record.name.toString().toLowerCase().includes(value.toLowerCase()),
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => filterNameInput.select());
				}
			},
			shouldCellUpdate: (record, prevRecord) => record.name !== prevRecord.name,
			render: (value, record) => {
				return value === editRowName ? (
					<CellEdit initialValue={ value } setEditRowName={ setEditRowName } path={ path } record={ record } onRefresh={ onRefreshBoth } />
				) : (
					<span>{ value }</span>
				);
			},
			eidtable: true,
			width: 230
		},
		{
			title: i18next.t('size'),
			dataIndex: 'size',
			key: 'size',
			sorter: (a, b) => a.size - b.size,
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Radio.Group value={ filterSizeOperation }
						onChange={ e => setFilterSizeOperation(e.target.value) }
						style={{ marginBottom: 8 }}
					>
						<Radio value='gt'>&gt;</Radio>
						<Radio value='lt'>&lt;</Radio>
					</Radio.Group>
					<InputNumber ref={ node => { filterSizeInput = node; } } placeholder={ i18next.t('filter_size') }
						value={ selectedKeys[0] } min={ 0 } onPressEnter={ confirm }
						onChange={ value => setSelectedKeys(value ? [ value ] : []) }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => filterSizeOperation === 'lt' ? record.size < value : record.size > value,
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => filterSizeInput.focus());
				}
			},
			width: 120
		},
		{
			title: i18next.t('modified'),
			dataIndex: 'modified',
			key: 'modified',
			sorter: (a, b) => a.modified - b.modified,
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Radio.Group value={ filterModifiedOperation }
						onChange={ e => setFilterModifiedOperation(e.target.value) }
						style={{ marginBottom: 8 }}
					>
						<Radio value='gt'>&gt;</Radio>
						<Radio value='lt'>&lt;</Radio>
					</Radio.Group>
					<DatePicker showTime placeholder={ i18next.t('filter_modified') } value={ selectedKeys[0] }
						onPressEnter={ confirm } onChange={ value => setSelectedKeys(value ? [ value ] : []) }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => filterModifiedOperation === 'lt' ? record.modified < value.unix() : record.modified > value.unix(),
			render: value => moment.unix(value).format('LLL'),
			width: 240
		},
		{
			title: i18next.t('permissions'),
			dataIndex: 'permissions',
			key: 'permissions',
			sorter: (a, b) => a.permissions.localeCompare(b.permissions),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input ref={ node => { filterPermissionsInput = node; } } placeholder={ i18next.t('filter_permissions') }
						value={ selectedKeys[0] }
						onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
						onPressEnter={ confirm }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => record.permissions.toString().toLowerCase().includes(value.toLowerCase()),
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => filterPermissionsInput.select());
				}
			},
			width: 140
		},
		{
			title: i18next.t('owner'),
			dataIndex: 'owner',
			key: 'owner',
			sorter: (a, b) => a.owner.localeCompare(b.owner),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input ref={ node => { filterOwnerInput = node; } } placeholder={ i18next.t('filter_owner') }
						value={ selectedKeys[0] }
						onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
						onPressEnter={ confirm }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => record.owner.toString().toLowerCase().includes(value.toLowerCase()),
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => filterOwnerInput.select());
				}
			},
			width: 140
		},
		{
			title: i18next.t('group'),
			dataIndex: 'group',
			key: 'group',
			sorter: (a, b) => a.group.localeCompare(b.group),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input ref={ node => { filterGroupInput = node; } } placeholder={ i18next.t('filter_group') }
						value={ selectedKeys[0] }
						onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
						onPressEnter={ confirm }
						style={{ width: 188, marginBottom: 8, display: 'block' }}
					/>
					<Button type='primary' onClick={ confirm }
						icon='filter' size='small' style={{ width: 90, marginRight: 8 }}
					>
						{ i18next.t('apply') }
					</Button>
					<Button onClick={ clearFilters } size='small' style={{ width: 90 }}>
						{ i18next.t('reset') }
					</Button>
				</div>
			),
			onFilter: (value, record) => record.group.toString().toLowerCase().includes(value.toLowerCase()),
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => filterGroupInput.select());
				}
			},
			width: 140
		}
	];

	const onRow = record => ({
		onClick: e => {
			if (e.target.classList.contains('ant-checkbox-input')) {
				return;
			}

			if (record.type === 'd') {
				onClick(`${ path ? `/${ path }` : '' }/${ record.name }/`);
				return;
			}

			let content;
			switch (record.media_type) {
				case 'text':
					api.file({ path, name: record.name })
						.then(response => {
							const responseData = response.data;
							if (responseData.status === 'ok') {
								const { data } = responseData;
								content = <TextArea autoSize={{ minRows: 4, maxRows: 16 }} value={ data.content } />;
								Modal.info({
									icon: null,
									width: '80%',
									title: i18next.t('view_') + record.name,
									content
								});
							}
						});
					break;
				case 'image':
					content = (<div><img src={ record.direct_link } alt={ record.name } style={{ maxWidth: '100%', maxHeight: '100%' }} /></div>);
					break;
				case 'audio':
					content = (<audio controls><source src={ record.direct_link } /><track kind='captions' /></audio>);
					break;
				case 'video':
					content = (<video style={{ maxWidth: '100%', maxHeight: '100%' }} controls><source src={ record.direct_link } type={ record.mime_type } /><track kind='captions' /></video>);
					break;
				case 'binary':
					content = (<Button type='dashed' block>{ i18next.t('binary_file') }</Button>);
					break;
				default:
					content = (<Button type='dashed' block>{ i18next.t('unknown_file_format') }</Button>);
					break;
			}

			if (content) {
				Modal.info({
					icon: null,
					width: '80%',
					title: i18next.t('view_') + record.name,
					content
				});
			}

		},
		onContextMenu: e => {
			e.preventDefault();
			if (!contextMenu.visible) {
				document.addEventListener(`click`, function onClickOutside() {
					setContextMenu({ visible: false, x: 0, y: 0 });
					document.removeEventListener(`click`, onClickOutside);
				});
			}
			setContextMenu({
				record,
				visible: true,
				x: e.clientX,
				y: e.clientY
			});
		}
	});

	const { record, visible, x, y } = contextMenu;

	return (
		<>
			<Table dataSource={ dataSource.data } total={ dataSource.total } columns={ columns } rowKey='name'
				scroll={{ y: 'calc(100vh - 180px)', x: true }} size='middle'
				rowSelection={ rowSelection } onRow={ onRow }
				pagination={{ showTotal: total => (
					<div>
						<FooterMenu visible={ selectedRowKeys.length > 0 } onClickRefresh={ onRefreshBoth } onClickCopy={ copyClick } onClickDelete={ deleteClick } />
						{i18next.t('total_') + total + i18next.t('_items')}
					</div>
					
				)}}
			/>
			<ContextMenu record={ record } visible={ visible } x={ x } y={ y } onCopyClick={ contextCopyClick } onRenameClick={ contextRenameClick } onDeleteClick={ contextDeleteClick } />
			<DestinationModal visible={ destModalVisible } doCopy={ doCopy } hide={ hideDestModal } refresh={ refresh } />
			<ConfirmDelete visible={ delModalVisible } count={ (oneFile ? [oneFile] : selectedRowKeys).length } doDelete={ doDelete } hide={ hideDelModal } />
		</>
	);
}
