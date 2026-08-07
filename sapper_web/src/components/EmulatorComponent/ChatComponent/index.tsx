import React, { FC } from 'react';
import ChatContainerComponent from "./MessageContainerComponent";
import MessageInputComponent from "./MessageInputComponent";
import { ChatMessageItem, MessageContent } from "../../../types/conversationType.ts";
import {Typography, Avatar} from "antd";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;

interface ChatComponentProps {
    welcomeInfo?: string;
    agentAvatar?: string;
    agentName?: string;
    messages: ChatMessageItem[];
    sampleQueries?: string[];
    onMessagesChange?: (messages: ChatMessageItem[]) => void;
    sendMessage: (contents: MessageContent[]) => void;
    onNewConversation?: () => void;
    generating: boolean;
    abortControllerRef: React.RefObject<AbortController | null>;
    onToggleVoiceMode?: () => void;
    isVoiceMode?: boolean;
    isNewConversation?: boolean;
    outputChaining?: boolean;
    suggestions?: string[];
    onStop?: () => void;
}

const ChatComponent: FC<ChatComponentProps> = (
    {
        agentAvatar,
        agentName = 'AI助手',
        welcomeInfo = '我可以回答你的问题，帮助你完成各种任务。有什么我可以帮你的吗？',
        messages = [],
        sendMessage,
        onNewConversation,
        generating,
        abortControllerRef,
        onToggleVoiceMode,
        isVoiceMode = false,
        isNewConversation = false,
        outputChaining = false,
        suggestions = [],
        onStop
    }) => {

    return (
        <div className={`flex flex-col h-full bg-white`}>
            {/* Header for new conversation */}
            {isNewConversation && (
                <div className="px-6 py-8 text-center max-w-3xl mx-auto w-full">
                    <div className="flex flex-col items-center mb-6">
                        <div className={`mb-2`}>
                            <Avatar
                                src={`${agentAvatar}`}
                                size={120}
                                className="border-2 border-white shadow-sm"
                            />
                        </div>
                        <Title level={3}>
                            你好，我是{agentName}
                        </Title>
                        <Text type="secondary" className={`text-left`}>
                            <ReactMarkdown
                                children={welcomeInfo}
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({children }) => <p style={{ marginBottom: '10px' }}>{children}</p >,
                                }}
                            />
                        </Text>
                    </div>
                </div>
            )}

            {/* Chat container */}
            {!isNewConversation && (
                <ChatContainerComponent
                    agentAvatar={agentAvatar}
                    welcomeInfo={welcomeInfo}
                    messages={messages}
                    generating={generating}
                    sendMessage={sendMessage}
                    outputChaining={outputChaining}
                    suggestions={suggestions}
                />
            )}

            {/* Input component */}
            <div className="sticky bottom-0 bg-white  mx-3 pb-2">
                <MessageInputComponent
                    sendMessage={sendMessage}
                    generating={generating}
                    abortControllerRef={abortControllerRef}
                    onNewConversation={onNewConversation}
                    showClearButton={messages.length > 0}
                    onToggleVoiceMode={onToggleVoiceMode}
                    isVoiceMode={isVoiceMode}
                    onStop={onStop}
                />
                <Text type="secondary" className="block text-xs text-center ">
                    {agentName}可能会犯错，请核实重要信息
                </Text>
            </div>
        </div>
    );
};

export default ChatComponent;