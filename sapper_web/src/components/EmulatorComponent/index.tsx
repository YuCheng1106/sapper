import React, { useState, useRef } from 'react';
import { Button, message, Input, Skeleton } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import ChatComponent from "./ChatComponent";
import InitParamsComponent from "./InitParamsComponent";
// import VoiceChatComponent from "./VoiceChatComponent";
import { useDispatchConversation } from "../../hooks/conversation";
import { AgentDetail } from "../../types/agentType";
import { ConversationDetail, MessageContent } from "../../types/conversationType";
import {createConversationAPI, queryConversationDetail} from "../../api/sapper/conversation.ts";
import { useNavigate } from "react-router-dom";

interface EmulatorComponentProps {
    loading?: boolean;
    conversation: ConversationDetail | null | undefined;
    agent?: AgentDetail | null;
    isNewConversation?: boolean;
}

const EmulatorComponent: React.FC<EmulatorComponentProps> = ({ loading = false, conversation, agent, isNewConversation = false }) => {
    const conversationDispatch = useDispatchConversation();
    const [generating, setGenerating] = useState<boolean>(false);
    const [isConfigureVisible, setIsConfigureVisible] = useState<boolean>(false);
    const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const navigate = useNavigate();

    const handleToggleVoiceMode = () => {
        setIsVoiceMode(prev => !prev);
    };

    const handleSendMessage = async (query: MessageContent[]) => {
        if (!query || query.length === 0 || query[0].content.trim() === "") {
            message.info("请输入查询内容");
            return;
        }
        abortControllerRef.current = new AbortController();
        if (isNewConversation && agent) {
            const createReg = {
                name: '新会话',
                agent_uuid: agent.uuid,
            };
            let conversation_data = await createConversationAPI(createReg);
            conversation_data = await queryConversationDetail(conversation_data.uuid)
            conversationDispatch.setConversationStatePartialInfo({isNewConversation: false, query: query});
            try {
                setGenerating(true);
                navigate(`/agent/display/${agent.uuid}?chat=${conversation_data.uuid}`);
                await conversationDispatch.generateAgentAnswer(
                    agent.uuid,
                    {
                        query: query,
                        conversation_uuid: conversation_data.uuid
                    },
                    abortControllerRef.current
                );
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    message.error("生成回答失败");
                    console.error("生成错误:", error);
                }
            } finally {
                setGenerating(false);
            }

        }
        if (isNewConversation) return;
        if (!agent || !conversation) return;

        try {
            setGenerating(true);
            conversationDispatch.setConversationPartialInfo({
                suggestions: [],
                chat_history: [
                    ...(conversation?.chat_history || []),
                    { role: "user", contents: query },
                    { role: "system", units: [] }
                ]
            });
            await conversationDispatch.generateAgentAnswer(
                agent.uuid,
                {
                    query: query,
                    conversation_uuid: conversation.uuid
                },
                abortControllerRef.current
            );
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                message.error("生成回答失败");
                console.error("生成错误:", error);
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleNewConversation = async () => {
        if (!conversation) return;

        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const resetData = { chat_history: [], long_memory: '', short_memory: '' };
            conversationDispatch.setConversationPartialInfo(resetData);
            await conversationDispatch.updateConversationInfo(conversation.uuid, resetData);
        } catch (error) {
            message.error("重置会话失败");
            console.error("重置错误:", error);
        }
    };

    const handleChatParamSave = async (values: Record<string, string>) => {
        if (!conversation) return;

        try {
            conversationDispatch.setConversationPartialInfo({ chat_parameters: values });
            await conversationDispatch.updateConversationInfo(conversation.uuid, { chat_parameters: values });
            setIsConfigureVisible(false);
            message.success("参数设置成功！");
        } catch (error) {
            message.error("参数设置失败！");
            console.error("保存错误:", error);
        }
    };

    const sampleQueries = agent?.sample_query || conversation?.agent?.sample_query || [];
    const parameters = agent?.parameters || conversation?.agent?.parameters || {};
    const chatParameters = conversation?.chat_parameters || {};

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
            {isConfigureVisible ? (
                <InitParamsComponent
                    initParameters={parameters}
                    chatParameters={chatParameters}
                    onChange={handleChatParamSave}
                />
            ) : loading ? (
                // 加载状态：显示骨架屏
                <div className="flex flex-col h-full max-w-4xl w-full m-auto">
                    <div className="px-2 py-1 border-b border-gray-100">
                        <Skeleton.Input active style={{ width: '100%', height: 32 }} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <Skeleton active paragraph={{ rows: 4, width: ['80%', '60%', '90%', '70%'] }} />
                        <Skeleton active paragraph={{ rows: 2, width: ['50%', '70%'] }} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="px-2 py-1 backdrop-blur border-b border-gray-100 max-w-4xl w-full m-auto">
                        <div className="flex items-center justify-center">
                            <Button
                                size="small"
                                icon={<SettingOutlined />}
                                onClick={() => setIsConfigureVisible(true)}
                                className="hover:bg-gray-50"
                                disabled={loading} // 禁用按钮在加载时
                            />
                            <Input
                                value={conversation?.name || '新会话'}
                                variant="borderless"
                                readOnly
                                className="font-medium text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                            <ChatComponent
                                agentAvatar={agent?.cover_image || 'default-image.jpg'}
                                agentName={agent?.name || '未命名代理'}
                                outputChaining={agent?.output_chaining}
                                welcomeInfo={agent?.welcome_info}
                                messages={conversation?.chat_history || []}
                                sampleQueries={sampleQueries}
                                sendMessage={handleSendMessage}
                                onNewConversation={handleNewConversation}
                                generating={generating}
                                abortControllerRef={abortControllerRef}
                                onToggleVoiceMode={handleToggleVoiceMode}
                                isVoiceMode={isVoiceMode}
                                suggestions={conversation?.suggestions || []}
                                isNewConversation={isNewConversation}
                                onStop={() => {
                                    setGenerating(false);
                                    abortControllerRef.current?.abort();
                                    if (conversation?.uuid) {
                                        const history = conversation.chat_history || [];
                                        if (history.length > 0) {
                                            const last = history[history.length - 1] as any;
                                            if (last?.role === 'system' && Array.isArray(last?.units) && last.units.length > 0) {
                                                conversationDispatch.updateConversationInfo(conversation.uuid, { chat_history: history });
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmulatorComponent;