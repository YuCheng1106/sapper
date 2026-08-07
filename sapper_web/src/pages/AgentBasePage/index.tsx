import { useEffect, useState } from 'react';
import {
    List,
    Button,
    Card,
    Space,
    Dropdown,
    Menu,
    Popconfirm,
    Tag,
    Pagination,
    Empty,
    Typography,
    Input,
    Tooltip,
    Skeleton,
} from 'antd';
import { useNavigate } from "react-router-dom";
import AgentCreateModal from "../../modals/AgentCreateModal";
import { useAgentSelector, useDispatchAgent } from "../../hooks/agent";
import { AgentCreateReq, AgentRes, keyToTagMap } from "../../types/agentType";
import {
    ClearOutlined,
    DeleteOutlined,
    DownloadOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    CrownOutlined,
    ToolOutlined
} from "@ant-design/icons";
import { useDispatchGlobalState } from "../../hooks/global.ts";
import './index.css'

const { Text } = Typography;

const AgentBasePage = () => {
    const dispatch = useDispatchAgent();
    const dispatchGlobal = useDispatchGlobalState();
    const agents = useAgentSelector((state) => state.agent.agents);
    const status = useAgentSelector((state) => state.agent.status);
    const loading = !["succeeded", 'failed'].includes(status);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
    });

    useEffect(() => {
        dispatch.getAgentList({
            page: pagination.current,
            size: pagination.pageSize,
            name: searchTerm
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, searchTerm]);

    const navigate = useNavigate();
    const [createModelVisibility, setCreateModelVisibility] = useState(false);

    const handleSearch = (value: string) => {
        if (value !== searchTerm) {
            setSearchTerm(value);
            setPagination({ ...pagination, current: 1 });
        }
    };

    const handleAgentEdit = (agentUuid: string) => {
        navigate(`/agent/display/${agentUuid}`);
    };

    const handleAgentCreate = async (data: AgentCreateReq) => {
        try {
            const result = await dispatch.addAgent(data).unwrap();
            navigate(`/workspace/agent/${result.uuid}`);
            dispatchGlobal.setSPLFormGenerating(true);
            dispatch.setAgentStatePartialInfo({ generating: true });
            dispatch.getAgentList({
                page: pagination.current,
                size: pagination.pageSize
            });
        } catch (error) {
            console.error('创建 Agent 失败:', error);
        }
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination({
            current: page,
            pageSize: pageSize || pagination.pageSize,
        });
    };

    const renderAgentActions = (agent: AgentRes) => (
        <Dropdown
            overlay={
                <Menu className="rounded-lg shadow-lg border border-gray-100">
                    <Menu.Item
                        key="download"
                        icon={<DownloadOutlined className="text-[#7F56D9]" />}
                        onClick={(e) => {
                            e.domEvent.stopPropagation();
                            dispatch.downloadAgentInfo(agent.uuid);
                        }}
                        className="hover:bg-[#F9F5FF] hover:text-[#7F56D9]"
                    >
                        下载
                    </Menu.Item>
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
                            title="确定要删除此智能体吗？"
                            onConfirm={async (e) => {
                                e?.stopPropagation();
                                await dispatch.removeAgent(agent.id);
                                dispatch.getAgentList({
                                    page: pagination.current,
                                    size: pagination.pageSize
                                });
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
                className="hover:bg-[#F9F5FF] hover:text-[#7F56D9]"
            />
        </Dropdown>
    );

    return (
        <div className="p-2 h-full w-full">
            <div className="flex justify-between items-center mb-3 mt-2">
                <Space>
                    {(agents.items.length !== 0 || searchTerm !== "") && (
                        <Input.Search
                            placeholder="搜索智能体..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-80"
                            size="middle"
                            allowClear
                            prefix={<SearchOutlined className="text-[#667085] text-sm" />}
                            enterButton={
                                <Button
                                    type="primary"
                                    className="bg-[#7F56D9] hover:bg-[#6941C6] h-[35px]"
                                >
                                    <span className="text-sm">搜索</span>
                                </Button>
                            }
                        />
                    )}
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModelVisibility(true)}
                    className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg px-3 h-[35px] flex items-center"
                    size="middle"
                >
                    <span className="text-sm">创建智能体</span>
                </Button>
            </div>

            <div className="h-[calc(100%-90px)] overflow-y-auto">
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
                ) : agents.items.length === 0 && searchTerm === "" ? (
                    <div
                        className="flex flex-col items-center justify-center h-full"
                    >
                        <Empty
                            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            styles={{ image: { height: '120px' } }}
                            description={
                                <Text className="text-[#667085] text-lg">
                                    开始创建您的第一个智能体
                                </Text>
                            }
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setCreateModelVisibility(true)}
                                className="bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg px-6 h-[42px] flex items-center"
                                size="large"
                            >
                                <span className="text-base">创建智能体</span>
                            </Button>
                        </Empty>
                    </div>
                ) : agents.items.length === 0 && searchTerm !== "" ? (
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        description={
                            <Text className="text-[#667085]">
                                未找到相关智能体
                            </Text>
                        }
                    >
                        <Button
                            icon={<ClearOutlined />}
                            onClick={() => setSearchTerm("")}
                            className="mt-4 hover:bg-[#F9F5FF] hover:text-[#7F56D9] border-[#E9D7FE]"
                        >
                            清空筛选
                        </Button>
                    </Empty>
                ) : (
                    <List
                        grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
                        dataSource={agents.items}
                        renderItem={agent => (
                            <List.Item>
                                <Card
                                    className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full min-w-[250px] max-w-[500px] hover:border-[#7F56D9]"
                                    styles={{
                                        body: { padding: 0 },
                                        header: { borderBottom: 0 }
                                    }}
                                    hoverable
                                    onClick={() => handleAgentEdit(agent.uuid)}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex p-4 pb-2">
                                            <div
                                                className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                                <img
                                                    src={agent.cover_image || 'default-image.jpg'}
                                                    alt={agent.name || '未命名智能体'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-lg font-semibold text-[#1D2939] truncate">
                                                        {agent.name || '未命名智能体'}
                                                    </p>
                                                    <div
                                                        style={{
                                                            transition: 'opacity 0.2s'
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {renderAgentActions(agent)}
                                                    </div>
                                                </div>
                                                <Text
                                                    className="text-[#667085] mb-2 text-sm line-clamp-2 h-[3em]">
                                                    {agent.description || '暂无描述'}
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="mt-auto p-4 pt-2 border-t border-gray-100 bg-gray-50">
                                            <div className="flex justify-between items-center text-xs text-[#667085]">
                                                <div>
                                                    <Tooltip title={agent.type === 0 ? '管理类' : '工具类'}>
                                                        <Tag
                                                            title={agent.type === 0 ? '管理类' : '工具类'}
                                                            icon={agent.type === 0 ? <CrownOutlined /> : <ToolOutlined />}
                                                            color="purple"
                                                        />
                                                    </Tooltip>
                                                    {agent.tags.map((tag) =>
                                                        <Tag color="green" key={tag}>
                                                            {keyToTagMap[tag] || tag}
                                                        </Tag>
                                                    )}
                                                </div>
                                                <span>
                                                    最后更新: {new Date(agent.updated_time || agent.created_time).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>

            {agents.items.length > 0 && !loading && (
                <div className="flex justify-center mt-1">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={agents.total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `共 ${total} 个智能体`}
                        pageSizeOptions={['12', '24', '36', '48']}
                        className="text-[#667085]"
                    />
                </div>
            )}

            <AgentCreateModal
                visible={createModelVisibility}
                onClose={() => setCreateModelVisibility(false)}
                onCreate={handleAgentCreate}
            />
        </div>
    );
};

export default AgentBasePage;