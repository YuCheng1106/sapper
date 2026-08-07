import { Card, Tag, Typography, Space } from 'antd';
import { motion } from "framer-motion";
import { MessageOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { AgentRes } from "../../types/agentType.ts";

const { Title } = Typography;

interface AgentDiscoverCardProps {
    agentData: AgentRes | null;
    onClick?: () => void;
}

const AgentDiscoverCard = ({ agentData, onClick }: AgentDiscoverCardProps) => {
    return (
        <Card
            className="min-w-[280px] max-w-[400px]"
            size={"small"}
            hoverable
            onClick={onClick}
            cover={
                <div className="relative h-[160px] bg-[#f5f5f5] overflow-hidden">
                    {agentData?.cover_image ? (
                        <img
                            alt={agentData?.name}
                            src={`${agentData?.cover_image}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#F4EBFF] to-[#E9D7FE] flex items-center justify-center">
                            <UserOutlined className="text-[36px]" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-3 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <Tag className="rounded-lg font-semibold border-none backdrop-blur-md bg-[rgba(127,86,217,0.3)] text-white px-3 py-1 md:px-[14px] md:py-[6px] text-xs md:text-sm uppercase tracking-wider">
                            {agentData?.type === 0 ? '管理类' : '工具类'}
                        </Tag>
                    </div>
                </div>
            }
        >
            {/* Title and User Info */}
            <div className="mb-3">
                <Title
                    level={4}
                    className="!m-0 !text-inherit text-xl md:text-2xl font-bold text-[#344054] tracking-[-0.5px]"
                >
                    {agentData?.name}
                </Title>

                {/* User info below the title */}
                <div className="flex items-center mt-2">
                    {/* User avatar */}
                    {agentData?.creator?.avatar ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 mr-2">
                            <img
                                src={agentData?.creator.avatar}
                                alt="用户头像"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-2">
                            <UserOutlined className="text-gray-400 text-xs" />
                        </div>
                    )}

                    {/* Username */}
                    <span className="text-xs text-gray-500 truncate">
                        {agentData?.creator?.username || '未知用户'}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="mb-2 h-[45px]">
                <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                    {agentData?.description || '暂无描述'}
                </Typography.Paragraph>
            </div>

            {/* Tags and CTA */}
            <div className="border-t border-[#F2F4F7] pt-2 flex flex-wrap justify-between items-center">
                <Space size={15}>
                    <Typography.Text type="secondary">
                        <UserOutlined/> {agentData?.unique_users}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                        <MessageOutlined/> {agentData?.total_usage}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                        <StarOutlined/> {agentData?.total_favorites}
                    </Typography.Text>
                </Space>
                <motion.div
                    className="text-[#7F56D9] font-semibold text-sm md:text-[15px] cursor-pointer hover:text-[#6941C6] flex items-center gap-1 whitespace-nowrap"
                    initial={{opacity: 0, x: -20}}
                    animate={{
                        opacity: 1,
                        x: 0,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut"
                        }
                    }}
                >
                    立即体验 →
                </motion.div>
            </div>
        </Card>
    );
};

export default AgentDiscoverCard;