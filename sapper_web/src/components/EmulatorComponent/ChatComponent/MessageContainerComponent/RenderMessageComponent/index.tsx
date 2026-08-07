import React from 'react';
import {Typography} from 'antd';
import {MessageContent, SystemChatMessage, UserChatMessage} from "../../../../../types/conversationType.ts";
import ReactMarkdown from "react-markdown";
import {Alert, Image} from "antd";
import {getFileIcon} from "../../../../../utils/MessageFileRender.ts";
import { ThoughtChain } from '@ant-design/x';
import type { ThoughtChainProps } from '@ant-design/x';
import 'katex/dist/katex.min.css';
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
const { Text } = Typography;
const renderContent = (content: MessageContent, role: 'user' | 'system') => {
    console.log(content)
    switch (content.type) {
        case 'text':
            return role === 'user' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{content.content}</div>
            ) : (
                <ReactMarkdown
                    children={content.content}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]} // 添加数学公式渲染
                    components={{
                        p: ({children }) => <p style={{ marginBottom: '10px' }}>{children}</p >,
                    }}
                />
            );
        case 'image':
            return <Image src={content.content} alt="Chat image" />;
        case 'video':
            return <video src={content.content} controls />;
        case 'audio':
            return <audio src={content.content} controls />;
        case 'code':
            return (
                <pre style={{
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '4px',
                    overflowX: 'auto'
                }}>
                        {content.content}
                    </pre>
            );
        case 'error':
            return (
                <Alert
                    message="Error"
                    description={content.content}
                    type="error"
                    showIcon
                />
            );
        case 'progress':
            return <div style={{ padding: '5px' }}>{content.content}</div>;
        case 'file':
        {
            const displayName = content.content.split('/').pop() || 'file';
            return <div style={{padding: '5px'}}>
                <div className="input-file-container">
                    <div style={{display: 'flex', alignItems: 'center'}}>
                                <span style={{marginRight: 8, fontSize: '1.2em'}}>
                                    {getFileIcon(content.content)}
                                </span>
                        <div
                            className="file-name"
                            title={displayName}
                        >
                            <a
                                href={content.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-link"
                            >
                                {displayName}
                            </a>
                        </div>
                    </div>
                </div>
            </div>;
        }
        default:
            return <p>{content.content}</p>;
    }
};


export const UserMessageComponent : React.FC<{message: UserChatMessage}> = ({message}) => {
    return  message.contents.map((content, contentIndex) => (
        <div key={contentIndex} className="content-item">
            {renderContent(content, message.role)}
        </div>
    ))
}


interface SystemMessageComponentProps {
    message: SystemChatMessage;
    outputChaining?: boolean;
}

export const SystemMessageComponent: React.FC<SystemMessageComponentProps> = ({
                                                                                  message,
                                                                                  outputChaining = true
                                                                              }) => {
    if (!message.units?.length) return null;

    const renderUnitContent = (unit: typeof message.units[0]) => (
        <div className="space-y-3 w-full overflow-x-auto">
            {unit.output?.length ? (
                unit.output.map((content, contentIndex) => (
                    <div
                        key={`content-${contentIndex}`}
                        className="p-3 rounded-lg overflow-x-auto"
                    >
                        {renderContent(content, message.role)}
                    </div>
                ))
            ) : (
                <Text type="secondary">暂无内容输出</Text>
            )}
        </div>
    );

    // Generate AntD Collapse items
    const items: ThoughtChainProps['items'] = message.units.map((unit, index) => ({
        key: String(index),
        title: unit.unit_name,
        content: renderUnitContent(unit),
        status: unit.status === 'running' ? 'pending' : unit.status
    }));

    return (
        <div className="w-full">
            {outputChaining ? (
                <ThoughtChain
                    items={items}
                    collapsible
                    styles={{
                        itemContent: { overflowX: 'auto' }
                    }}
                />
            ) : (
                <div className="space-y-4">
                    {message.units.map((unit, index) => (
                        <React.Fragment key={`unit-${index}`}>
                            {renderUnitContent(unit)}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};