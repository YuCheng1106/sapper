import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    Button,
    List,
    Popconfirm,
    Dropdown,
    Menu,
    Tag,
    Typography,
    Pagination,
    Space,
    Input,
    Empty,
    Skeleton
} from 'antd';
import {
    DeleteOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    ClearOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { KnowledgeBaseCreateModal } from "../../modals";
import './index.css';
import { useNavigate } from "react-router-dom";
import { useDispatchKnowledgeBase, useKnowledgeBaseSelector } from "../../hooks/knowledgeBase";
import {KnowledgeBaseCreateReq, KnowledgeBaseRes} from "../../types/knowledgeBaseType";

const { Text, Title } = Typography;

const KnowledgeBasePage = () => {
    const dispatch = useDispatchKnowledgeBase();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const knowledgeBases = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBases);
    const status = useKnowledgeBaseSelector((state) => state.knowledgeBase.status);
    const loading = !["succeeded", 'failed'].includes(status);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
    });
    console.log(knowledgeBases);
    useEffect(() => {
        dispatch.getKnowledgeBaseList({
            page: pagination.current,
            size: pagination.pageSize,
            name: searchTerm
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, searchTerm]);

    const handleSearch = (value: string) => {
        if(value !== searchTerm)
            setSearchTerm(value);
    };

    const handleKnowledgeCreate = async (knowledge: KnowledgeBaseCreateReq) => {
        await dispatch.addKnowledgeBase(knowledge);
        dispatch.getKnowledgeBaseList({
            page: pagination.current,
            size: pagination.pageSize
        });
    };

    const navigate = useNavigate();

    const handleEdit = (id: string) => {
        navigate(`/workspace/knowledge/${id}`);
    };

    const handleKnowledgeDelete = async (uuid: number) => {
        await dispatch.removeKnowledgeBase(uuid);
        dispatch.getKnowledgeBaseList({
            page: pagination.current,
            size: pagination.pageSize
        });
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination({
            current: page,
            pageSize: pageSize || pagination.pageSize,
        });
    };

    const renderKnowledgeActions = (knowledge: KnowledgeBaseRes) => (
        <Dropdown
            overlay={
                <Menu className="rounded-lg shadow-lg border border-gray-100">
                    <Menu.Item
                        key="delete"
                        icon={<DeleteOutlined className="text-base" />}
                        danger
                        onClick={(e) => {
                            e.domEvent.stopPropagation();
                        }}
                        className="hover:bg-red-50 py-2"
                    >
                        <Popconfirm
                            title="确定要删除此知识库吗？"
                            onConfirm={async (e) => {
                                e?.stopPropagation();
                                await handleKnowledgeDelete(knowledge.id);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                        >
                            <span className="text-sm">删除</span>
                        </Popconfirm>
                    </Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button
                type="text"
                icon={<MoreOutlined className="text-[#667085] text-lg" />}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 hover:bg-[#F9F5FF] hover:text-[#7F56D9]"
            />
        </Dropdown>
    );

    return (
        <div className="p-2 h-full">
            <div className="flex justify-between items-center mb-3 mt-2">
                <Space>
                    {(knowledgeBases.items.length !== 0 || searchTerm !== "") && (
                        <Input.Search
                            placeholder="搜索知识库..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-80"
                            size="middle"
                            allowClear
                            prefix={<SearchOutlined className="text-[#64748B] text-base" />}
                            enterButton={
                                <Button
                                    type="primary"
                                    className="bg-[#7F56D9] hover:bg-[#6941C6] h-10"
                                >
                                    <span className="text-sm">搜索</span>
                                </Button>
                            }
                        />
                    )}
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined className="text-sm" />}
                    onClick={() => setIsCreateModalVisible(true)}
                    className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg px-3 h-[35px] flex items-center"
                    size="middle"
                >
                    <span className="text-sm">新建知识库</span>
                </Button>
            </div>

            <div className="h-[calc(100%-120px)] overflow-y-auto">
                {loading ? (// 加载状态：显示骨架屏
                    <List
                        grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
                        dataSource={Array(4).fill({})} // 模拟12个卡片
                        renderItem={() => (
                            <List.Item>
                                <Card
                                    className="border border-gray-200 shadow-sm h-full min-w-[250px] max-w-[500px]"
                                    styles={{ body: { padding: 0 } }}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex p-4 pb-2">
                                            <Skeleton.Avatar active shape="square" size={64} className="mr-3" />
                                            <div className="flex-1">
                                                <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 2, width: ['80%', '60%'] }} />
                                            </div>
                                        </div>
                                        <div className="mt-auto p-4 pt-2 border-t border-gray-100 bg-gray-50">
                                            <Skeleton active paragraph={{ rows: 1, width: ['100%'] }} />
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                ): knowledgeBases.items.length === 0 && searchTerm === "" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full"
                    >
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            styles={{
                                image: {height: 120}
                            }}
                            description={
                                <Text className="text-[#64748B] text-lg">
                                    开始创建您的第一个知识库
                                </Text>
                            }
                        >
                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                                className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-md px-6 h-10 mt-4"
                                size="middle"
                                icon={<PlusOutlined className="text-sm" />}
                            >
                                <span className="text-sm">创建知识库</span>
                            </Button>
                        </Empty>
                    </motion.div>
                ): knowledgeBases.items.length === 0 && searchTerm !== "" ? (
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        description={
                            <Text className="text-[#64748B] text-lg">
                                未找到相关知识库
                            </Text>
                        }
                    >
                        <Button
                            icon={<ClearOutlined className="text-sm" />}
                            onClick={() => setSearchTerm("")}
                            className="mt-4 hover:bg-[#F9F5FF] hover:text-[#7F56D9] border-[#E9D7FE] h-10"
                            size="middle"
                        >
                            <span className="text-sm">清空筛选</span>
                        </Button>
                    </Empty>
                ):(
                    <List
                        grid={{ gutter: 20, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                        dataSource={knowledgeBases.items}
                        loading={status === 'loading'}
                        renderItem={knowledge => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="relative"
                                onMouseEnter={() => setHoveredCard(knowledge.uuid)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <List.Item>
                                    <Card
                                        className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full min-w-[250px] max-w-[500px] hover:border-[#7F56D9]"
                                        styles={{
                                            body: { padding: 0, height: '100%' },
                                        }}
                                        onClick={() => handleEdit(knowledge.uuid)}
                                    >
                                        <div className="flex flex-col h-full">
                                            {/* Top content section */}
                                            <div className="p-4 pb-2 flex-grow">
                                                <Title
                                                    level={4}
                                                    className="mb-2 text-[#1E293B] font-light text-base truncate"
                                                >
                                                    {knowledge.name}
                                                </Title>
                                                <div
                                                    style={{
                                                        opacity: hoveredCard === knowledge.uuid ? 1 : 0,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {renderKnowledgeActions(knowledge)}
                                                </div>
                                                <Text
                                                    className="text-[#64748B] text-sm block mb-1 line-clamp-3 min-h-[3em]"
                                                >
                                                    {knowledge.description || '暂无描述'}
                                                </Text>
                                            </div>

                                            {/* Gray bottom section */}
                                            <div className="mt-auto p-4 pt-2 border-t border-gray-100 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <Tag
                                                        icon={<FileTextOutlined className="text-base mr-1"/>}
                                                        className="bg-[#F0F7FF] text-[#175CD3] border-[#D1E0FF] text-sm px-3 py-0.5 flex items-center"
                                                    >
                                                        文档库
                                                    </Tag>
                                                    <Text className="text-[#64748B] text-xs">
                                                        最后更新: {new Date(knowledge.updated_time || knowledge.created_time).toLocaleDateString()}
                                                    </Text>
                                                </div>
                                            </div>


                                        </div>
                                    </Card>

                                </List.Item>
                            </motion.div>
                        )}
                    />
                )}
            </div>

            {knowledgeBases.items.length > 0 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={knowledgeBases.total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `共 ${total} 个知识库`}
                        pageSizeOptions={['12', '24', '36', '48']}
                        className="text-[#64748B] text-sm"
                    />
                </div>
            )}

            <KnowledgeBaseCreateModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onCreate={handleKnowledgeCreate}
            />
        </div>
    );
};

export default KnowledgeBasePage;