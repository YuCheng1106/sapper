import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Database, Puzzle,FileText as FileTextOutlined } from 'lucide-react';
import { useAgentSelector, useDispatchAgent } from "../../hooks/agent";
import { useDispatchKnowledgeBase, useKnowledgeBaseSelector } from "../../hooks/knowledgeBase";
import { useDispatchPlugin, usePluginSelector } from "../../hooks/plugin";
import { useDispatchUser, useUserSelector } from "../../hooks/user";
import { useNavigate } from "react-router-dom";
import {Tag, Empty, Typography, Input, Space, Pagination, Card, Button} from 'antd';
import UserfileEditModalComponent from '../../components/UserfileEditModalComponent';
import {LlmProviderCard} from "../../components";


const { Text, Title} = Typography;

const UserCenterPage = () => {
    const [activeTab, setActiveTab] = useState<'agents' | 'knowledge' | 'plugins' | 'llms'>('agents');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const dispatch = useDispatchAgent();
    const dispatchKnowledge = useDispatchKnowledgeBase();
    const dispatchPlugin = useDispatchPlugin();
    const dispatchUser = useDispatchUser();
    const navigate = useNavigate();

    // User state
    const userData = useUserSelector((state) => state.user.user);

    // Agent state
    const agents = useAgentSelector((state) => state.agent.agents);
    // const agentStatus = useAgentSelector((state) => state.agent.status);


    // Knowledge base state
    const knowledgeBases = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBases);
    // const knowledgeStatus = useKnowledgeBaseSelector((state) => state.knowledgeBase.status);


    // Plugin state
    const plugins = usePluginSelector((state) => state.plugin.plugins);
    // const pluginStatus = usePluginSelector((state) => state.plugin.status);

// 在组件状态中添加初始总数
    const [initialTotals, setInitialTotals] = useState({
        agents: 0,
        knowledge: 0,
        plugins: 0
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
    });

    // 修改初始数据获取
    useEffect(() => {
        dispatchUser.fetchUser();

        // 获取初始总数（不包含搜索条件）
        dispatch.getAgentList({ page: 1, size: 1 }).then(action => {
            setInitialTotals(prev => ({ ...prev, agents: action.payload.total || 0 }));
        });
        dispatchKnowledge.getKnowledgeBaseList({ page: 1, size: 1 }).then(action => {
            setInitialTotals(prev => ({ ...prev, knowledge: action.payload.total || 0 }));
        });
        dispatchPlugin.getPluginList({ page: 1, size: 1 }).then(action => {
            setInitialTotals(prev => ({ ...prev, plugins: action.payload.total || 0 }));
        });

        // 获取第一页数据
        dispatch.getAgentList({ page: 1, size: pagination.pageSize });

    }, []);

    // Handle active tab content updates
    useEffect(() => {
        if (activeTab === 'agents') {
            dispatch.getAgentList({
                page: pagination.current,
                size: pagination.pageSize,
                name: searchTerm
            });
        } else if (activeTab === 'knowledge') {
            dispatchKnowledge.getKnowledgeBaseList({
                page: pagination.current,
                size: pagination.pageSize,
                name: searchTerm
            });
        } else if (activeTab === 'plugins') {
            dispatchPlugin.getPluginList({
                page: pagination.current,
                size: pagination.pageSize,
                name: searchTerm
            });
        }
    }, [activeTab, pagination.current, pagination.pageSize, searchTerm]);

    const handleAgentEdit = (agentUuid: string) => {
        navigate(`/agent/display/${agentUuid}`);
    };

    const handleKnowledgeEdit = (id: string) => {
        navigate(`/workspace/knowledge/${id}`);
    };

    const handlePluginEdit = (pluginUuid: string) => {
        navigate(`/workspace/plugin/${pluginUuid}`);
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination({
            current: page,
            pageSize: pageSize || pagination.pageSize,
        });
    };

    const handleSearch = (value: string) => {
        if (value !== searchTerm) {
            setSearchTerm(value);
        }
    };

    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={userData?.avatar || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}
                                alt={userData?.nickname}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-[#1D2939]">{userData?.nickname || "加载中..."}</h1>
                                <p className="text-[#667085] mt-2 h-[45px] line-clamp-2">{"暂无简介"}</p>
                                <div className="flex gap-8 mt-6">
                                    <div className="text-center px-6 py-3 bg-[#F9FAFB] rounded-2xl">
                                        <p className="text-2xl font-bold text-[#1D2939]">{initialTotals.agents}</p>
                                        <p className="text-[#667085] mt-1">智能体</p>
                                    </div>
                                    <div className="text-center px-6 py-3 bg-[#F9FAFB] rounded-2xl">
                                        <p className="text-2xl font-bold text-[#1D2939]">{initialTotals.knowledge}</p>
                                        <p className="text-[#667085] mt-1">知识库</p>
                                    </div>
                                    <div className="text-center px-6 py-3 bg-[#F9FAFB] rounded-2xl">
                                        <p className="text-2xl font-bold text-[#1D2939]">{initialTotals.plugins}</p>
                                        <p className="text-[#667085] mt-1">插件</p>
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleEditProfile}
                                className="px-6 py-3 bg-[#7F56D9] text-white rounded-2xl hover:bg-[#6941C6] transition-colors shadow-sm"
                            >
                                编辑资料
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="mt-8">
                        <div className="flex gap-6 border-b border-gray-200 mb-8">
                            <button
                                onClick={() => setActiveTab('agents')}
                                className={`px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'agents'
                                        ? 'text-[#7F56D9] border-b-2 border-[#7F56D9]'
                                        : 'text-[#667085] hover:text-[#1D2939]'
                                }`}
                            >
                                <Bot className="inline-block w-5 h-5 mr-2" />
                                智能体
                            </button>
                            <button
                                onClick={() => setActiveTab('knowledge')}
                                className={`px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'knowledge'
                                        ? 'text-[#7F56D9] border-b-2 border-[#7F56D9]'
                                        : 'text-[#667085] hover:text-[#1D2939]'
                                }`}
                            >
                                <Database className="inline-block w-5 h-5 mr-2" />
                                知识库
                            </button>
                            <button
                                onClick={() => setActiveTab('plugins')}
                                className={`px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'plugins'
                                        ? 'text-[#7F56D9] border-b-2 border-[#7F56D9]'
                                        : 'text-[#667085] hover:text-[#1D2939]'
                                }`}
                            >
                                <Puzzle className="inline-block w-5 h-5 mr-2" />
                                插件
                            </button>
                            <button
                                onClick={() => setActiveTab('llms')}
                                className={`px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'llms'
                                        ? 'text-[#7F56D9] border-b-2 border-[#7F56D9]'
                                        : 'text-[#667085] hover:text-[#1D2939]'
                                }`}
                            >
                                <Puzzle className="inline-block w-5 h-5 mr-2" />
                                模型配置
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Search Bar */}
                            <div className="flex justify-between">
                                <Space>
                                    {((activeTab === 'agents' && agents.items.length > 0) ||
                                        (activeTab === 'knowledge' && knowledgeBases.items.length > 0) ||
                                        (activeTab === 'plugins' && plugins.items.length > 0) ||
                                        searchTerm !== "") && (
                                        <Input.Search
                                            placeholder={`搜索${activeTab === 'agents' ? '智能体' : activeTab === 'knowledge' ? '知识库' : '插件'}...`}
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-80"
                                            allowClear
                                            enterButton
                                        />
                                    )}
                                </Space>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-100 ">
                                {activeTab === 'agents' && (
                                    agents.items.length === 0 ? (
                                        <div className="col-span-3 ">
                                            <Empty
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                                description={<Text className="text-[#667085]">暂无智能体</Text>}
                                            />
                                        </div>
                                    ) : (
                                        agents.items.map(agent => (
                                            <motion.div
                                                key={agent.uuid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
                                                onClick={() => handleAgentEdit(agent.uuid)}
                                            >

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-[#1D2939] line-clamp-1">{agent.name}</h3>
                                                    <p className="text-[#667085] mt-2 h-[45px] line-clamp-2">{agent.description}</p>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <Tag color="purple" className="bg-[#F9F5FF] text-[#7F56D9] border-[#7F56D9] text-sm px-3 py-0.5 flex items-center">
                                                            {agent.type === 0 ? '管理类' : '工具类'}
                                                        </Tag>
                                                        <Text className="text-[#667085] text-sm">
                                                            最近编辑: {new Date(agent.updated_time || agent.created_time).toLocaleDateString()}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}

                                {activeTab === 'knowledge' && (
                                    knowledgeBases.items.length === 0 ? (
                                        <div className="col-span-3">
                                            <Empty
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                                description={<Text className="text-[#667085]">暂无知识库</Text>}
                                            />
                                        </div>
                                    ) : (
                                        knowledgeBases.items.map(knowledge => (
                                            <motion.div
                                                key={knowledge.uuid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300"
                                                onClick={() => handleKnowledgeEdit(knowledge.uuid)}
                                            >
                                                <h3 className="text-xl font-bold text-[#1D2939] line-clamp-1">{knowledge.name}</h3>
                                                <p className="text-[#667085] mt-2  h-[45px] line-clamp-2">{knowledge.description || '暂无描述'}</p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <Tag icon={<FileTextOutlined className="w-4 h-4 mr-1" />} className="bg-[#F0F7FF] text-[#175CD3] border-[#D1E0FF] text-sm px-3 py-0.5 flex items-center">
                                                        文档库
                                                    </Tag>
                                                    <Text className="text-[#667085] text-sm">
                                                        最后更新: {new Date(knowledge.updated_time || knowledge.created_time).toLocaleDateString()}
                                                    </Text>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}

                                {activeTab === 'plugins' && (
                                    plugins.items.length === 0 ? (
                                        <div className="col-span-3">
                                            <Empty
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                                description={<Text className="text-[#667085]">暂无插件</Text>}
                                            />
                                        </div>
                                    ) : (
                                        plugins.items.map(plugin => (
                                            <motion.div
                                                key={plugin.uuid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300"
                                                onClick={() => handlePluginEdit(plugin.uuid)}
                                            >
                                                <h3 className="text-xl font-bold text-[#1D2939] line-clamp-1">{plugin.name}</h3>
                                                <p className="text-[#667085] mt-2  h-[45px] line-clamp-2">{plugin.description}</p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <Tag
                                                        icon={<Puzzle className="w-4 h-4 mr-1" />}
                                                        className="bg-[#ECFDF3] text-[#027A48] border-[#027A48] text-sm px-3 py-1 flex items-center"
                                                    >
                                                        插件
                                                    </Tag>
                                                    <Text className="text-[#667085] text-sm">
                                                        最后更新: {new Date(plugin.updated_time || plugin.created_time).toLocaleDateString()}
                                                    </Text>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}
                            </div>

                            {activeTab === 'llms' && (
                                <Card
                                    className="shadow-sm border-0 w-full"
                                >
                                    <div className="p-6 border-b border-gray-200">
                                        <Space align="center" className="w-full justify-between">
                                            <div>
                                                <Title level={4} className="mb-1">AI 服务配置</Title>
                                                <Text type="secondary">配置您的AI模型服务提供商</Text>
                                            </div>
                                            <Button
                                                type="primary"
                                                icon={<FileTextOutlined/>}
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = '/user.pdf';
                                                    link.download = '使用文档.pdf';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                下载使用文档
                                            </Button>
                                        </Space>
                                    </div>
                                    <div className="p-6">
                                        <LlmProviderCard />
                                    </div>
                                </Card>
                            )}

                            {/* Pagination */}
                            {((activeTab === 'agents' && agents.items.length > 0) ||
                                (activeTab === 'knowledge' && knowledgeBases.items.length > 0) ||
                                (activeTab === 'plugins' && plugins.items.length > 0)) && (
                                <div className="mt-8 flex justify-center">
                                    <Pagination
                                        current={pagination.current}
                                        pageSize={pagination.pageSize}
                                        total={
                                            activeTab === 'agents'
                                                ? agents.total
                                                : activeTab === 'knowledge'
                                                    ? knowledgeBases.total
                                                    : plugins.total
                                        }
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        showQuickJumper
                                        showTotal={(total) => `共 ${total} 个${
                                            activeTab === 'agents'
                                                ? '智能体'
                                                : activeTab === 'knowledge'
                                                    ? '知识库'
                                                    : '插件'
                                        }`}
                                        pageSizeOptions={['12', '24', '36', '48']}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UserfileEditModalComponent
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialValues={{
                    nickname: userData?.nickname,
                    avatar: userData?.avatar,
                    description: ""
                }}
            />
            {/*<UserfileEditModalComponent*/}
            {/*    open={isEditModalOpen}*/}
            {/*    onClose={() => setIsEditModalOpen(false)}*/}
            {/*    initialValues={{*/}
            {/*        nickname: userData?.nickname,*/}
            {/*        avatar: userData?.avatar,*/}
            {/*        introduction: userData?.introduction*/}
            {/*    }}*/}
            {/*/>*/}
        </div>
    );
};

export default UserCenterPage;