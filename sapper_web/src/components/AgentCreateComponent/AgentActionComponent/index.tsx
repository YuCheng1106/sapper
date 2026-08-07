import {Card, Checkbox, Col, Divider, Input, message, Row, Tag, Tooltip, Typography} from "antd";
import {useAgentSelector, useDispatchAgent} from "../../../hooks/agent.ts";
import AgentAddKnowledgeModal from "../../../modals/AgentAddKnowledgeModal";
import AgentAddPluginModal from "../../../modals/AgentAddPluginModal";
import {
    CheckCircleFilled,
    DatabaseFilled,
    WalletOutlined
} from "@ant-design/icons";
import CheckableTag from "antd/es/tag/CheckableTag";
import {AgentTagType, keyToTagMap} from "../../../types/agentType.ts";

const { Text } = Typography;

const AgentActionComponent = () => {
    const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
    const dispatchAgent = useDispatchAgent();

    const handleMemorySet = (type: number) =>{
        if (agentDetail){
            if(type === 1){
                dispatchAgent.setAgentPartialInfo({has_short_memory: !agentDetail.has_short_memory});
            }else{
                dispatchAgent.setAgentPartialInfo({has_long_memory: !agentDetail.has_long_memory});
            }
        }
    }

    const handleSuggestionSet = () =>{
        if (agentDetail){
            dispatchAgent.setAgentPartialInfo({suggestion: !agentDetail.suggestion});
        }
    }

    const handleOutputChainingSet = () =>{
        if (agentDetail){
            dispatchAgent.setAgentPartialInfo({output_chaining: !agentDetail.output_chaining});
        }
    }

    const handleWelcomeInfoSet = (value: string) =>{
        if (agentDetail){
            dispatchAgent.setAgentPartialInfo({welcome_info: value});
        }
    }

    return (
        <Card className="rounded-xl mx-2 p-2 bg-gray-50 border-1duration-300">
            {/* 插件调用部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <div className="flex items-center gap-2">
                        <Tag
                            icon={<WalletOutlined />}
                            className="
                              flex items-center px-3 py-1 rounded-md
                              bg-green-100 text-green-600 border-0
                            "
                        >
                            插件调用
                        </Tag>
                        <AgentAddPluginModal />
                    </div>
                </Divider>
                <Row gutter={[16, 16]} className="px-2">
                    {agentDetail?.plugins?.map((plugin, index) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={index}>
                            <Tooltip title={`点击查看 ${plugin.name} 详情`} placement="top">
                                <Card
                                    className="
                                      rounded-lg overflow-hidden border border-gray-100
                                      hover:border-blue-400 transition-all duration-300
                                      hover:-translate-y-1 shadow-sm hover:shadow-md
                                    "
                                    hoverable
                                    onClick={() => window.open(`/workspace/plugin/${plugin.uuid}`, '_blank')}
                                >
                                    <Card.Meta
                                        title={
                                            <Text ellipsis className="font-medium">
                                                {plugin.name}
                                            </Text>
                                        }
                                        description={
                                            <Text
                                                type="secondary"
                                                ellipsis
                                                className="text-xs"
                                            >
                                                {plugin.description || '暂无描述'}
                                            </Text>
                                        }
                                    />
                                </Card>
                            </Tooltip>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 关联知识库部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <div className="flex items-center gap-2">
                        <Tag
                            icon={<DatabaseFilled/>}
                            className="
                              flex items-center px-3 py-1 rounded-md
                              bg-pink-100 text-pink-600 border-0
                            "
                        >
                            关联知识库
                        </Tag>
                        <AgentAddKnowledgeModal/>
                    </div>
                </Divider>
                <Row gutter={[16, 16]} className="px-2">
                    {agentDetail?.knowledge_bases?.map((knowledge, index) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={index}>
                            <Tooltip title={`点击查看 ${knowledge.name} 详情`} placement="top">
                                <Card
                                    className="
                                        rounded-lg overflow-hidden border border-gray-100
                                        hover:border-blue-400 transition-all duration-300
                                        hover:-translate-y-1 shadow-sm hover:shadow-md
                                    "
                                    hoverable
                                    onClick={() => window.open(`/workspace/knowledge/${knowledge.uuid}`, '_blank')}
                                >
                                    <Card.Meta
                                        title={
                                            <Text ellipsis className="font-medium">
                                                {knowledge.name}
                                            </Text>
                                        }
                                        description={
                                            <Text
                                                type="secondary"
                                                ellipsis
                                                className="text-xs"
                                            >
                                                {knowledge.description || '暂无描述'}
                                            </Text>
                                        }
                                    />
                                </Card>
                            </Tooltip>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 开场白部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <Tag
                        icon={<CheckCircleFilled />}
                        className="
              flex items-center px-3 py-1 rounded-md
              bg-purple-100 text-purple-600 border-0
            "
                    >
                        开场白
                    </Tag>
                </Divider>
                <Row gutter={[24, 16]} align="middle" className="px-2">
                    <Col span={24}>
                        <Input.TextArea
                            value={agentDetail?.welcome_info}
                            onChange={(e) =>handleWelcomeInfoSet(e.target.value)}
                            autoSize={{maxRows: 4, minRows: 1}}
                        />
                    </Col>
                </Row>
            </div>

            {/* 猜你想问部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <Tag
                        icon={<CheckCircleFilled />}
                        className="
              flex items-center px-3 py-1 rounded-md
              bg-purple-100 text-purple-600 border-0
            "
                    >
                        猜你想问
                    </Tag>
                </Divider>
                <Row gutter={[24, 16]} align="middle" className="px-2">
                    <Col span={12}>
                        <div className="
                              p-4 rounded-lg bg-white hover:bg-gray-50
                              transition-all duration-200 cursor-pointer
                              border border-transparent hover:border-gray-200
                            ">
                            <Checkbox
                                checked={agentDetail?.suggestion}
                                className="flex items-center gap-2"
                                onClick={handleSuggestionSet}
                            >
                                <Text strong>问题预测</Text>
                                <Text type="secondary" className="text-xs ml-1">(智能体将在每次会话结束时自动生成3个相关潜在问题)</Text>
                            </Checkbox>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* 思维链部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <Tag
                        icon={<CheckCircleFilled />}
                        className="
              flex items-center px-3 py-1 rounded-md
              bg-purple-100 text-purple-600 border-0
            "
                    >
                        思维链
                    </Tag>
                </Divider>
                <Row gutter={[24, 16]} align="middle" className="px-2">
                    <Col span={12}>
                        <div className="
                              p-4 rounded-lg bg-white hover:bg-gray-50
                              transition-all duration-200 cursor-pointer
                              border border-transparent hover:border-gray-200
                            ">
                            <Checkbox
                                checked={agentDetail?.output_chaining}
                                className="flex items-center gap-2"
                                onClick={handleOutputChainingSet}
                            >
                                <Text strong>链式输出</Text>
                                <Text type="secondary" className="text-xs ml-1">(智能体生成回复的时候展示思维链)</Text>
                            </Checkbox>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* 记忆设置部分 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <Tag
                        icon={<CheckCircleFilled />}
                        className="
              flex items-center px-3 py-1 rounded-md
              bg-purple-100 text-purple-600 border-0
            "
                    >
                        记忆设置
                    </Tag>
                </Divider>
                <Row gutter={[24, 16]} align="middle" className="px-2">
                    <Col span={12}>
                        <div className="
                              p-4 rounded-lg bg-white hover:bg-gray-50
                              transition-all duration-200 cursor-pointer
                              border border-transparent hover:border-gray-200
                            ">
                            <Checkbox
                                disabled
                                checked={agentDetail?.has_long_memory}
                                className="flex items-center gap-2"
                                onClick={() => handleMemorySet(0)}
                            >
                                <Text strong>长期记忆</Text>
                                <Text type="secondary" className="text-xs ml-1">(根据聊天内容生成用户偏好等行为数据)</Text>
                            </Checkbox>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="
                          p-4 rounded-lg bg-white hover:bg-gray-50
                          transition-all duration-200 cursor-pointer
                          border border-transparent hover:border-gray-200
                        ">
                            <Checkbox
                                checked={agentDetail?.has_short_memory}
                                className="flex items-center gap-2"
                                onClick={() => handleMemorySet(1)}
                            >
                                <Text strong>短期记忆</Text>
                                <Text type="secondary" className="text-xs ml-1">(保留当前会话历史记录)</Text>
                            </Checkbox>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* 分类设置 */}
            <div>
                <Divider orientation="left" orientationMargin={0}>
                    <Tag
                        icon={<CheckCircleFilled/>}
                        className="flex items-center px-3 py-1 rounded-md bg-purple-100 text-purple-600 border-0"
                    >
                        分类设置 (最多选择2个)
                    </Tag>
                </Divider>

                <Row gutter={[24, 16]} align="middle" className="px-2">
                    {(Object.keys(keyToTagMap) as AgentTagType[]).map((key) => {
                        const label = keyToTagMap[key];
                        return (
                            <Col key={key}>
                                <CheckableTag
                                    checked={(agentDetail?.tags || []).includes(key)}
                                    onChange={(checked) => {
                                        if (!agentDetail) return;
                                        if (checked && agentDetail?.tags.length >= 2) {
                                            message.warning('最多只能选择2个分类');
                                            return;
                                        }
                                        const checkTags = checked
                                            ? [...agentDetail.tags, key]
                                            : agentDetail.tags.filter(tagKey => tagKey !== key);

                                        dispatchAgent.setAgentPartialInfo({ tags: checkTags });
                                    }}
                                    className="text-sm px-3 py-1"
                                >
                                    {label}
                                </CheckableTag>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </Card>
    );
};

export default AgentActionComponent;