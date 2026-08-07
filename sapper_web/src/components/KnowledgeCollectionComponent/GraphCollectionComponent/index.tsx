import {useEffect, useState} from 'react';
import {
    Input,
    Button,
    Table,
    Empty,
    Switch,
    Space,
    Dropdown,
    Menu,
    Popconfirm,
    message,
    Modal,
    Form,
    Tag,
    Typography,
    Pagination
} from 'antd';
import {
    EditOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { CollectionRes } from "../../../types/collectionType.ts";
import {useDispatchGraphCollection, useGraphCollectionSelector} from "../../../hooks/graphCollection.ts";

const { Text } = Typography;

const GraphCollectionComponent = ({ knowledge_base_uuid, searchTerm }: { knowledge_base_uuid: string, searchTerm: string }) => {
    // State and hooks
    const dispatchGraphCollection = useDispatchGraphCollection();
    const graphCollections = useGraphCollectionSelector((state) => state.graphCollection.graphCollections);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
    });

    useEffect(() => {
        dispatchGraphCollection.getGraphCollectionList({
            page: pagination.current,
            size: pagination.pageSize,
            knowledge_base_uuid: knowledge_base_uuid,
            name: searchTerm,
            description: searchTerm,
        })
    }, [knowledge_base_uuid, searchTerm, pagination]);

    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [renameId, setRenameId] = useState<number | null>(null);


    // Handlers
    const handleTextCollectionRename = (id: number, name: string) => {
        setRenameId(id);
        setRenameValue(name);
        setRenameModalVisible(true);
    };

    const handleRenameSubmit = async () => {
        if (!renameId) return;
        await dispatchGraphCollection.updateGraphCollectionInfo(renameId, { name: renameValue });
        message.success(`图谱 ${renameValue} 已重命名`);
        setRenameModalVisible(false);
    };

    const handleDeleteConfirm = async (id: number) => {
        await dispatchGraphCollection.removeGraphCollection(id);
        message.success('图谱删除成功');
    };

    const handleSwitchChange = async (checked: boolean, name: string, id: number) => {
        await dispatchGraphCollection.updateGraphCollectionInfo(id, { status: checked ? 1 : 0 });
        message.success(`图谱 ${name} 已${checked ? '启用' : '禁用'}`);
    };

    // Menu dropdown
    const renderMenu = (id: number, name: string) => (
        <Menu>
            <Menu.Item
                key="rename"
                icon={<EditOutlined />}
                onClick={() => handleTextCollectionRename(id, name)}
            >
                重命名
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
            >
                <Popconfirm
                    title="确定要删除这个图谱吗？"
                    description="删除后将无法恢复"
                    onConfirm={() => handleDeleteConfirm(id)}
                    okText="确认"
                    cancelText="取消"
                >
                    删除
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

    // Table columns
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Text
                    strong
                    onClick={() => message.info("不能编辑")}
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                >
                    {text}
                </Text>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (enabled: number) => (
                <Tag color={enabled === 1 ? 'success' : 'error'}>
                    {enabled === 1 ? '已启用' : '已禁用'}
                </Tag>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created_time',
            key: 'createdAt',
            width: 180,
            render: (text: string) => <Text type="secondary">{text}</Text>,
        },
        {
            title: '更新时间',
            dataIndex: 'updated_time',
            key: 'updatedAt',
            width: 180,
            render: (text: string) => <Text type="secondary">{text}</Text>,
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (record: CollectionRes) => (
                <Space size="small">
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={record.status === 1}
                        onChange={(checked) => handleSwitchChange(checked, record.name, record.id)}
                    />
                    <Dropdown overlay={renderMenu(record.id, record.name)} trigger={['click']}>
                        <Button
                            type="text"
                            icon={<EllipsisOutlined />}
                            size="small"
                        />
                    </Dropdown>
                </Space>
            ),
        }
    ];

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination({
            current: page,
            pageSize: pageSize || pagination.pageSize,
        });
    };

    return (
        <div>
            {graphCollections.items.length > 0 ? (
                <>
                    <Table
                        dataSource={graphCollections.items}
                        columns={columns}
                        rowKey="uuid"
                        pagination={false}
                        size="middle"
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={graphCollections.total}
                            onChange={handlePageChange}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total) => `共 ${total} 条`}
                            pageSizeOptions={['6', '12', '24', '36', '48']}
                        />
                    </div>
                </>
            ) : (
                <Empty
                    description={searchTerm ? "没有找到匹配的图谱" : "暂无图谱数据"}
                    style={{ padding: '40px 0' }}
                />
            )}

            <Modal
                title="重命名图谱"
                open={renameModalVisible}
                onOk={handleRenameSubmit}
                onCancel={() => setRenameModalVisible(false)}
                okText="确认"
                cancelText="取消"
                destroyOnClose
            >
                <Form layout="vertical">
                    <Form.Item label="新名称">
                        <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder="请输入新的图谱名称"
                            autoFocus
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GraphCollectionComponent;