import React, {useEffect, useRef} from 'react';
import {List, Button, Tooltip, Spin, Avatar} from 'antd';
import {DownloadOutlined, RedoOutlined} from "@ant-design/icons";
import {
    ChatMessageItem,
    MessageContent, SystemMessageContent
} from "../../../../types/conversationType.ts";
import { SystemMessageComponent, UserMessageComponent } from "./RenderMessageComponent";
import {mdToDocxAPI} from "../../../../api/util.ts";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

interface ChatContainerProps {
    agentAvatar?: string;
    welcomeInfo?: string;
    messages: ChatMessageItem[];
    onMessagesChange?: (messages: ChatMessageItem[]) => void;
    sendMessage: (contents: MessageContent[]) => void;
    generating: boolean;
    outputChaining?: boolean;
    suggestions?: string[];
}

const ChatContainerComponent: React.FC<ChatContainerProps> = (
    {
      agentAvatar,
      welcomeInfo = '',
      messages = [],
      generating,
      outputChaining = false,
      suggestions = [],
      sendMessage
    }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollToBottom();
    }, [messages, generating]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSuggestionClick = (suggestion: string) => {
        const newMessage: MessageContent[] = [{type: "text", content: suggestion}];
        sendMessage(newMessage);
    }

    const handleMessageSave = async (message: SystemMessageContent[]) => {
        try {
            // 1. 拼接所有消息内容
            let note = '';
            message.forEach((unit) => {
                unit.output.forEach((item) => {
                    note += item.content;
                });
            });

            // 2. 调用API转换为docx
            const res = await mdToDocxAPI(note);
            if (!res?.url) {
                throw new Error('Failed to generate document: No URL returned');
            }

            // 3. 创建隐藏的下载链接
            // 替换第2步后的逻辑
            const a = document.createElement('a');
            a.href = res.url;
            a.download = 'filename.docx'; // 强制下载属性
            a.target = '_blank'; // 可选：在新标签打开（某些浏览器需要）
            a.click();

            // 4. 触发下载
            document.body.appendChild(a);
            a.click();

            // 5. 清理DOM
            setTimeout(() => {
                document.body.removeChild(a);
                // 可选：释放Blob URL（如果是Blob URL）
                if (res.url.startsWith('blob:')) {
                    URL.revokeObjectURL(res.url);
                }
            }, 100);

            return { success: true, url: res.url };
        } catch (error) {
            console.error('Document save failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    };

    return (
        <div
            className="h-full p-0 overflow-y-auto scroll-smooth bg-[#fff] "
            ref={chatContainerRef}
        >
            <div className="px-4 max-w-4xl mx-auto">
                {welcomeInfo && (
                    <div className="py-2"
                         style={{
                             justifyContent: 'flex-start',
                             display: 'flex',
                             padding: '10px 0'
                         }}
                    >
                        <div className={`max-w-full flex`}>
                            <Avatar
                                src={`${agentAvatar}`}
                                size={35}
                                className="border-2 border-white shadow-sm mx-1"
                            />
                            <div className={`flex-1`}>
                                <div className="bg-gray-100 text-black text-sm p-2 rounded-xl">
                                    <ReactMarkdown
                                        children={welcomeInfo}
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({children }) => <p style={{ marginBottom: '10px' }}>{children}</p >,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {messages.length > 0 && (
                    <List
                        dataSource={messages}
                        renderItem={(item: ChatMessageItem, itemIndex: number) => (
                            <div
                                style={{
                                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                                    display: 'flex',
                                    padding: '10px 0'
                                }}
                            >
                                <div className={`max-w-full flex-col `}>
                                    <div>
                                        {item.role === 'user' && (
                                            <>
                                                <div
                                                    className={'rounded-xl flex-1 flex-col bg-[#95ec69] text-black p-2'}>
                                                    <UserMessageComponent message={item}/>
                                                </div>
                                            </>

                                        )}

                                        {item.role === 'system' && (
                                            <div className={`flex`}>
                                                <Avatar
                                                    src={`${agentAvatar}`}
                                                    size={35}
                                                    className="border-2 border-white shadow-sm mx-1"
                                                />
                                                <div className={`flex-1 flex-col`}>
                                                    <div
                                                        className={`rounded-xl flex-1 flex-col bg-gray-100 text-black p-2`}>
                                                        <SystemMessageComponent message={item} outputChaining={outputChaining}/>
                                                        {messages.length - 1 === itemIndex && generating && (
                                                            <div className="flex items-center gap-2 m-1">
                                                                <Spin size="small"/>
                                                                <span
                                                                    className="text-xs">思考中...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!generating && <div className={`py-1`}>
                                                        <Tooltip title="重新生成" placement="right">
                                                            <Button
                                                                type="text"
                                                                icon={<RedoOutlined style={{color: '#1890ff'}}/>}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip
                                                            placement="right"
                                                            title="导出为Word文档"
                                                            mouseEnterDelay={0.3}
                                                        >
                                                            <Button
                                                                type="text"
                                                                icon={<DownloadOutlined style={{color: '#1890ff'}}/>}
                                                                onClick={() => handleMessageSave(item.units)}
                                                                aria-label="export-document"
                                                            />
                                                        </Tooltip>
                                                    </div>}
                                                    {suggestions.length > 0 && itemIndex === messages.length - 1 && (
                                                        <List
                                                            itemLayout={"vertical"}
                                                            dataSource={suggestions}
                                                            renderItem={(item: string) => (
                                                                <div style={{paddingBottom: '10px'}}>
                                                                    <Button onClick={() => handleSuggestionClick(item)}>
                                                                        {item}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}
                    />
                )}

                {(messages.length > 0 && messages[messages.length - 1].role !== 'system' && generating) && (
                    <div className="py-2"
                         style={{
                             justifyContent: 'flex-start',
                             display: 'flex',
                             padding: '10px 0'
                         }}
                    >
                        <div className={`max-w-full flex`}>
                            <Avatar
                                src={`${agentAvatar}`}
                                size={35}
                                className="border-2 border-white shadow-sm mx-1"
                            />
                            <div className={`flex-1`}>
                                <div className="bg-gray-100 text-black text-sm p-2 rounded-xl">
                                    <div className="flex items-center gap-2 m-1">
                                        <Spin size="small"/>
                                        <span
                                            className="text-xs">思考中...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>
        </div>
    );
};

export default ChatContainerComponent;