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
} from '@ant-design/icons';
import { Puzzle } from 'lucide-react';
import { PluginCreateModal } from "../../modals";

import { useNavigate } from "react-router-dom";
import { useDispatchPlugin, usePluginSelector } from "../../hooks/plugin";
import {PluginCreateReq, PluginRes} from "../../types/pluginType";

const { Text, Title } = Typography;

const PluginBasePage = () => {
    const dispatch = useDispatchPlugin();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const plugins = usePluginSelector((state) => state.plugin.plugins);
    const status = usePluginSelector((state) => state.plugin.status);
    const loading = !["succeeded", 'failed'].includes(status);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
    });

    useEffect(() => {
        dispatch.getPluginList({
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

    const handlePluginCreate = async (plugin: PluginCreateReq) => {
        await dispatch.addPlugin(plugin);
        dispatch.getPluginList({
            page: pagination.current,
            size: pagination.pageSize
        });
    };

    const navigate = useNavigate();

    const handleEdit = (id: string) => {
        navigate(`/workspace/plugin/${id}`);
    };

    const handlePluginDelete = async (id: number) => {
        await dispatch.removePlugin(id);
        dispatch.getPluginList({
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

    const renderPluginActions = (plugin: PluginRes) => (
        <Dropdown
            overlay={
                <Menu className="rounded-lg shadow-lg border border-gray-100">
                    <Menu.Item
                        key="delete"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={(e) => {
                            e.domEvent.stopPropagation();
                        }}
                        className="hover:bg-red-50"
                    >
                        <Popconfirm
                            title="确定要删除此插件吗？"
                            onConfirm={async (e) => {
                                e?.stopPropagation();
                                await handlePluginDelete(plugin.id);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                        >
                            删除
                        </Popconfirm>
                    </Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button
                type="text"
                icon={<MoreOutlined className="text-[#667085]" />}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 hover:bg-[#F9F5FF] hover:text-[#7F56D9]"
            />
        </Dropdown>
    );

    return (
        <div className="p-2 h-full">
            <div className="flex justify-between items-center mb-3 mt-2">
                <Space>
                    {(plugins.items.length !== 0 || searchTerm !== "") && (
                        <Input.Search
                            placeholder="搜索插件..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-80"
                            size="middle"
                            allowClear
                            prefix={<SearchOutlined className="text-[#64748B] text-base"/>}
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
                    icon={<PlusOutlined/>}
                    onClick={() => setIsCreateModalVisible(true)}
                    className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg px-3 h-[35px] flex items-center"
                    size="middle"
                >
                    <span className="text-sm">新建插件</span>
                </Button>
            </div>

            <div className="h-[calc(100%-120px)] overflow-y-auto">
                {loading ? (
                    // 加载状态：显示骨架屏
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
                ): plugins.items.length === 0 && searchTerm === "" ? (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="flex flex-col items-center justify-center h-full"
                    >
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            styles={{
                                image: {height: 120}
                            }}
                            description={
                                <Text className="text-[#667085] text-lg">
                                    开始创建您的第一个插件
                                </Text>
                            }
                        >
                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                                className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg px-6 h-10 mt-4"
                                icon={<PlusOutlined/>}
                            >
                                创建插件
                            </Button>
                        </Empty>
                    </motion.div>
                ) : plugins.items.length === 0 && searchTerm !== "" ? (
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                        description={
                            <Text className="text-[#667085]">
                                未找到相关插件
                            </Text>
                        }
                    >
                        <Button
                            icon={<ClearOutlined/>}
                            onClick={() => setSearchTerm("")}
                            className="mt-4 hover:bg-[#F9F5FF] hover:text-[#7F56D9] border-[#E9D7FE]"
                        >
                            清空筛选
                        </Button>
                    </Empty>
                ): (
                    <List
                        grid={{gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4}}
                        dataSource={plugins.items}
                        loading={status === 'loading'}
                        renderItem={plugin => (
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                whileHover={{y: -5}}
                                className="relative"
                                onMouseEnter={() => setHoveredCard(plugin.uuid)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <List.Item>
                                    <Card
                                        className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all h-full min-w-[250px] max-w-[500px] duration-300 hover:border-[#7F56D9] relative"
                                        styles={{ body: { padding: 0, height: '100%' } }}
                                        onClick={() => handleEdit(plugin.uuid)}
                                        onMouseEnter={() => setHoveredCard(plugin.uuid)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <div className="flex flex-col h-full">
                                            {/* Top content section */}
                                            <div className="p-4 pb-2 flex-grow">
                                                <Title
                                                    level={4}
                                                    className="mb-2 text-[#1E293B] font-light text-base truncate"
                                                >
                                                    {plugin.name}
                                                </Title>
                                                <div

                                                    style={{
                                                        opacity: hoveredCard === plugin.uuid ? 1 : 0,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {renderPluginActions(plugin)}
                                                </div>
                                                <Text
                                                    className="text-[#64748B] text-sm block mb-1 line-clamp-3 min-h-[3em]"
                                                >
                                                    {plugin.description || '暂无描述'}
                                                </Text>
                                            </div>

                                            {/* Gray bottom section */}
                                            <div className="mt-auto p-4 pt-2 border-t border-gray-100 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <Tag
                                                        icon={<Puzzle className="w-4 h-4 mr-1"/>}
                                                        className="bg-[#ECFDF3] text-[#027A48] border-[#027A48] text-sm px-3 py-0.5 flex items-center"
                                                    >
                                                        插件
                                                    </Tag>
                                                    <Text className="text-[#667085] text-xs">
                                                        最后更新: {new Date(plugin.updated_time || plugin.created_time).toLocaleDateString()}
                                                    </Text>
                                                </div>
                                            </div>

                                            {/* Hover actions */}

                                        </div>
                                    </Card>
                                </List.Item>
                            </motion.div>
                        )}
                    />
                )}
            </div>

            {plugins.items.length > 0 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={plugins.total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `共 ${total} 个插件`}
                        pageSizeOptions={['12', '24', '36', '48']}
                        className="text-[#667085]"
                    />
                </div>
            )}

            <PluginCreateModal
                open={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onCreate={handlePluginCreate}
            />
        </div>
    );
};

export default PluginBasePage;