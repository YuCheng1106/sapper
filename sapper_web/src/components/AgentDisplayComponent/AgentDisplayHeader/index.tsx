import { motion } from "framer-motion";
import {
    Avatar, Button, Space, Typography, Skeleton
} from 'antd';
import {
    EditOutlined, DeleteOutlined, MenuUnfoldOutlined
} from "@ant-design/icons";
import {AgentRes} from "../../../types/agentType.ts";
import {useNavigate} from "react-router-dom";
const { Title, Text } = Typography;

interface AgentDisplayHeaderProps {
    agentData: AgentRes | null
    status?: boolean
    onDelete?: () => void
    onMenuFold?: () => void
    agentEditable?: boolean
}

const AgentDisplayHeader = (props: AgentDisplayHeaderProps) => {
    const { agentData, status, agentEditable, onDelete, onMenuFold} = props;
    const cozeSecondary = 'bg-[#F0EBFF] text-[#6E38F7] border-[#F0EBFF]';
    const cozeDark = 'text-[#1A1A1A]';
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/workspace/agent/${agentData?.uuid}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between w-100`}
        >
            <div className="flex items-center gap-4">
                <Button
                    type={"text"}
                    icon={<MenuUnfoldOutlined/>}
                    onClick={onMenuFold}
                />

                {status ? (
                    <Skeleton.Avatar active size={40} />
                ) : (
                    <Avatar
                        src={`${agentData?.cover_image}`}
                        size={40}
                        className="border-2 border-white shadow-sm"
                    />
                )}

                <div>
                    <Title level={4} className={`mb-0 ${cozeDark}`}>
                        {status ? <Skeleton.Input active size="small" /> : agentData?.name}
                        <Text> @{agentData?.creator?.nickname}</Text>
                    </Title>

                </div>
            </div>

            <Space>
                {agentEditable && (
                    <>
                        <Button
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                            className={`rounded-lg ${cozeSecondary}`}
                        >
                            编辑
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onDelete}
                            className="rounded-lg"
                        >
                            删除
                        </Button>

                    </>
                )}
            </Space>
        </motion.div>
    );
};

export default AgentDisplayHeader;