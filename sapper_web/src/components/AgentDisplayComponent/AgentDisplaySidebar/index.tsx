import { useState } from 'react';
import { Button, Typography, Space, Rate, Skeleton } from 'antd';
import {
    PlusOutlined, MenuFoldOutlined, HeartFilled, HeartOutlined, LeftOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationRes } from '../../../types/conversationType';
import { AgentRes } from "../../../types/agentType.ts";
import { ConversationMenu } from "../../index.ts";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

interface AgentDisplaySidebarProps {
    loading: boolean;
    agentData: AgentRes | null;
    agentEditable: boolean;
    conversations: ConversationRes[];
    selectedConversationId: string;
    onConversationClick: (uuid: string) => void;
    onConversationCreate: () => void;
    onConversationDelete: (id: number) => void;
    onConversationRename: (uuid: string, name: string) => void;
    onExpand?: () => void;
    onFavorite?: (uuid: string, favorite: boolean) => void;
    onRating?: (uuid: string, rating_value: number) => void;
}

const AgentDisplaySidebar = (props: AgentDisplaySidebarProps) => {
    const {
        loading,
        agentEditable,
        agentData,
        selectedConversationId,
        conversations,
        onConversationClick,
        onConversationCreate,
        onConversationDelete,
        onConversationRename,
        onExpand,
        onFavorite,
        onRating,
    } = props;

    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const handleAgentRating = (value: number) => {
        if (agentData && onRating) {
            onRating(agentData.uuid, value);
        }
    };

    const handleAgentFavorite = () => {
        if (agentData && onFavorite) {
            onFavorite(agentData.uuid, !agentData.user_interaction.is_favorite);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#FAFAFA] border-r border-gray-200 flex flex-col h-full rounded-br-lg overflow-y-auto"
            >
                {/* Top Navigation */}
                <div className="flex px-4 py-2 w-full">
                    <div className="flex items-center justify-between mb-2 w-full">
                        <Space size={15}>
                            <Button
                                icon={<LeftOutlined />}
                                onClick={() => navigate(`${agentEditable ? '/workspace/agent' : '/discover'}`)}
                                className="rounded-lg hover:bg-[#F0EBFF] border-0"
                                disabled={loading} // 禁用按钮在加载时
                            />
                        </Space>
                        <Button
                            type="text"
                            icon={<MenuFoldOutlined />}
                            onClick={onExpand}
                            disabled={loading} // 禁用按钮在加载时
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-2">
                    {loading ? (
                        // 加载状态：显示骨架屏
                        <div className="space-y-4">
                            <Skeleton
                                active
                                avatar={{ shape: 'square', size: 64 }}
                                title={{ width: '60%' }}
                                paragraph={{ rows: 1, width: ['40%'] }}
                            />
                            <Skeleton active paragraph={{ rows: 2, width: ['80%', '60%'] }} />
                            <Skeleton.Button active block />
                            <Skeleton active paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }} />
                        </div>
                    ) : (
                        // 正常内容
                        <>
                            {/* Agent Info Card */}
                            <div className="pb-2">
                                <div className="flex justify-between pb-3">
                                    {/* 封面图片 */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                        <img
                                            src={agentData?.cover_image || 'default-image.jpg'}
                                            alt={agentData?.name || 'Agent'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* 主要内容区域 */}
                                    <div className="flex-1">
                                        <Typography.Title level={4}>
                                            {agentData?.name || '未命名代理'}
                                        </Typography.Title>
                                        <Typography.Text type="secondary">
                                            {agentData?.creator?.nickname || '未知'} @{agentData?.creator?.username || '未知'}
                                        </Typography.Text>
                                    </div>
                                </div>
                                <Space size={30}>
                                    <Typography.Title level={4}>
                                        {agentData?.unique_users || 0} <br />
                                        <Typography.Text type="secondary">使用</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={4}>
                                        {agentData?.total_usage || 0} <br />
                                        <Typography.Text type="secondary">运行</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={4}>
                                        {agentData?.total_favorites || 0} <br />
                                        <Typography.Text type="secondary">收藏</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={4}>
                                        {agentData?.rating_count && agentData.rating_count >= 10
                                            ? agentData.total_rating
                                            : '暂无'}{' '}
                                        <br />
                                        <Typography.Text type="secondary">
                                            {agentData?.rating_count && agentData.rating_count >= 10
                                                ? '总分'
                                                : '评分未满10人'}
                                        </Typography.Text>
                                    </Typography.Title>
                                </Space>
                                <div className="pb-2 flex items-center">
                                    <Text type="secondary">使用评分：</Text>
                                    <Rate
                                        allowHalf
                                        value={agentData?.user_interaction?.rating_value || 0}
                                        onChange={handleAgentRating}
                                        disabled={!agentData || !onRating} // 禁用评分在无数据时
                                    />
                                </div>
                                <div className="pb-2 flex items-center">
                                    <Text type="secondary">收藏：</Text>
                                    <Button
                                        type="text"
                                        icon={
                                            agentData?.user_interaction?.is_favorite ? (
                                                <HeartFilled style={{ color: 'red' }} />
                                            ) : (
                                                <HeartOutlined style={{ color: '#666' }} />
                                            )
                                        }
                                        onClick={handleAgentFavorite}
                                        disabled={!agentData || !onFavorite} // 禁用收藏在无数据时
                                    />
                                </div>
                                <Paragraph
                                    ellipsis={{
                                        rows: 5,
                                        expandable: 'collapsible',
                                        expanded,
                                        onExpand: (_, info) => setExpanded(info.expanded),
                                    }}
                                >
                                    {agentData?.description || '暂无描述'}
                                </Paragraph>
                            </div>

                            {/* Conversation */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Text strong className="text-base">会话记录</Text>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={onConversationCreate}
                                        className="w-full"
                                        disabled={loading} // 禁用新建会话按钮在加载时
                                    >
                                        新建会话
                                    </Button>
                                    {conversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full p-4">
                                            <Text type="secondary" className="mb-2">
                                                暂无会话记录
                                            </Text>
                                        </div>
                                    ) : (
                                        <ConversationMenu
                                            onClick={onConversationClick}
                                            selectedConversationId={selectedConversationId}
                                            conversations={conversations}
                                            onDelete={onConversationDelete}
                                            onRename={onConversationRename}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AgentDisplaySidebar;