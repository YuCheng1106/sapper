import { useEffect, useState, useRef } from 'react';
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
import { useCollectionSelector, useDispatchCollection } from "../../../hooks/collection.ts";
import { CollectionRes } from "../../../types/collectionType.ts";

const { Text } = Typography;

const TextCollectionComponent = ({ knowledge_base_uuid, searchTerm, onTabChange }: { knowledge_base_uuid: string, searchTerm: string, onTabChange: (tab: string, id?: number) => void }) => {
    // State and hooks
    const dispatchCollection = useDispatchCollection();
    const collections = useCollectionSelector((state) => state.collection.collections);
    const refreshIntervalRef = useRef<number | null>(null);  // 修改这里

    const startAutoRefresh = () => {
        if (!refreshIntervalRef.current) {
            refreshIntervalRef.current = window.setInterval(() => {  // 添加 window. 前缀
                fetchCollections();
            }, 1000);
        }
    };

    const stopAutoRefresh = () => {
        if (refreshIntervalRef.current) {
            window.clearInterval(refreshIntervalRef.current);  // 添加 window. 前缀
            refreshIntervalRef.current = null;
        }
    };

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
    });

    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [renameId, setRenameId] = useState<number | null>(null);

    const fetchCollections = () => {
        dispatchCollection.getCollectionList({
            page: pagination.current,
            size: pagination.pageSize,
            knowledge_base_uuid: knowledge_base_uuid,
            name: searchTerm,
            description: searchTerm,
        });
    };

    useEffect(() => {
        fetchCollections();

        return () => {
            dispatchCollection.resetCollection();
            stopAutoRefresh();
        };
    }, [knowledge_base_uuid, searchTerm, pagination]);

    // Auto-refresh logic
    useEffect(() => {
        const hasProcessingItems = collections.items?.some(item => item.status === 2);

        if (hasProcessingItems) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }

        return () => {
            stopAutoRefresh();
        };
    }, [collections.items]);


    // Handlers
    const handleTextCollectionRename = (id: number, name: string) => {
        setRenameId(id);
        setRenameValue(name);
        setRenameModalVisible(true);
    };

    const handleRenameSubmit = async () => {
        if (!renameId) return;
        await dispatchCollection.updateCollectionInfo(renameId, { name: renameValue });
        message.success(`文件 ${renameValue} 已重命名`);
        setRenameModalVisible(false);
    };

    const handleDeleteConfirm = async (id: number) => {
        await dispatchCollection.removeCollection(id);
        message.success('文件删除成功');
    };

    const handleSwitchChange = async (checked: boolean, name: string, id: number) => {
        await dispatchCollection.updateCollectionInfo(id, { status: checked ? 1 : 0 });
        message.success(`文件 ${name} 已${checked ? '启用' : '禁用'}`);
    };

    const handleTextCollectionClick = async (id: number) => {
        await dispatchCollection.getCollectionDetail(id);
        onTabChange('text_block',  id);
    };

    const statusMap = {
        0: "已禁用",
        1: "已启用",
        2: "处理中",
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
                    title="确定要删除这个文件吗？"
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
            render: (text: string, record: CollectionRes) => (
                <Text
                    strong
                    onClick={() => handleTextCollectionClick(record.id)}
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
            render: (status: number) => {
                const color = status === 1 ? 'success' : status === 2 ? 'processing' : 'error';
                return (
                    <Tag color={color}>
                        {statusMap[status as keyof typeof statusMap]}
                    </Tag>
                );
            },
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
                        disabled={record.status === 2}
                    />
                    <Dropdown overlay={renderMenu(record.id, record.name)} trigger={['click']}>
                        <Button
                            type="text"
                            icon={<EllipsisOutlined />}
                            size="small"
                            disabled={record.status === 2}
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
            {collections.items?.length > 0 ? (
                <>
                    <Table
                        dataSource={collections.items}
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
                            total={collections.total}
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
                    description={searchTerm ? "没有找到匹配的文档" : "暂无文档数据"}
                    style={{ padding: '40px 0' }}
                />
            )}

            <Modal
                title="重命名文档"
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
                            placeholder="请输入新的文档名称"
                            autoFocus
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TextCollectionComponent;