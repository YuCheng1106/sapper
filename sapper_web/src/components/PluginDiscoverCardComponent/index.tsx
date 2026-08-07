import { Card, Tag, Typography, Space } from 'antd';
import { motion } from "framer-motion";
import { Puzzle } from 'lucide-react';
import { PluginRes } from "../../types/pluginType";

const { Title } = Typography;

interface PluginDiscoverCardProps {
    pluginData: PluginRes | null;
    onClick?: () => void;
}

const PluginDiscoverCard = ({ pluginData, onClick }: PluginDiscoverCardProps) => {
    return (
        <Card
            className="min-w-[280px] max-w-[400px]"
            size={"small"}
            hoverable
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="flex gap-4 group">
                    {/* Left cover */}
                    <div className="relative w-[120px] h-[96px] md:w-[140px] md:h-[110px] bg-[#f5f5f5] overflow-hidden rounded-lg flex-shrink-0 border border-[#F2F4F7]">
                        {pluginData?.cover_image ? (
                            <img
                                alt={pluginData?.name}
                                src={`${pluginData?.cover_image}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-[#F4EBFF] to-[#E9D7FE] flex items-center justify-center">
                                <Puzzle className="w-8 h-8 text-[#7F56D9]" />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 md:p-3 bg-gradient-to-t from-black/60 to-transparent">
                            <Tag className="rounded-lg font-semibold border-none backdrop-blur-md bg-[rgba(127,86,217,0.3)] text-white px-2 py-[2px] md:px-[10px] md:py-[4px] text-[11px] md:text-xs uppercase tracking-wider">
                                插件
                            </Tag>
                        </div>
                    </div>

                    {/* Right content */}
                    <div className="flex-1">
                        {/* Title */}
                        <div className="mb-2">
                            <Title
                                level={4}
                                className="!m-0 !text-inherit text-lg md:text-xl font-bold text-[#344054] tracking-[-0.5px]"
                            >
                                {pluginData?.name}
                            </Title>
                        </div>

                        {/* Description */}
                        <div className="mb-2 h-[40px]">
                            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                {pluginData?.description || '暂无描述'}
                            </Typography.Paragraph>
                        </div>
                    </div>
                </div>

                {/* Bottom row: update time and CTA */}
                <div className="border-t border-[#F2F4F7] pt-2 mt-2 flex justify-between items-center">
                    <Space size={15}>
                        <Typography.Text type="secondary">
                            最近更新: {new Date(pluginData?.updated_time || pluginData?.created_time || Date.now()).toLocaleDateString()}
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
            </div>
        </Card>
    );
};

export default PluginDiscoverCard;