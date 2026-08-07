import React, { useState, useRef, FC } from 'react';
import { Input, Button, Tooltip, Image, message } from 'antd';
import {
    SendOutlined,
    UploadOutlined,
    CloseOutlined,
    ClearOutlined,
    MessageOutlined,
    PhoneOutlined,
} from "@ant-design/icons";

import { uploadFile } from "../../../../api/upload";
import { MessageContent } from "../../../../types/conversationType.ts";
import {getFileIcon} from "../../../../utils/MessageFileRender.ts";

interface FileMessageContent extends MessageContent {
    fileName?: string;
    fileType: 'image' | 'file'; // Only these two types
}

interface MessageInputComponentProps {
    sendMessage: (content: MessageContent[]) => void;
    generating: boolean;
    abortControllerRef: React.RefObject<AbortController | null>;
    onNewConversation?: () => void;
    showClearButton?: boolean;
    onToggleVoiceMode?: () => void; // 新增
    isVoiceMode?: boolean; // 新增
    onStop?: () => void;
}

const MessageInputComponent: FC<MessageInputComponentProps> = ({
                                                                   sendMessage,
                                                                   generating,
                                                                   abortControllerRef,
                                                                   onNewConversation,
                                                                   showClearButton = false,
                                                                   onToggleVoiceMode,
                                                                   isVoiceMode = false,
                                                                   onStop
                                                               }) => {
    const [content, setContent] = useState<FileMessageContent[]>([]);
    const [inputText, setInputText] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Supported file types
    const supportedFileTypes = [
        'image/*', // All image types
        '.txt',    // Text files
        '.doc',    // Word documents
        '.docx',
        '.md',     // Markdown
        '.xlsx',   // Excel
        '.pdf',    // PDF files
        '.mp3'
    ];

    const uploadFileMessage = () => {
        if (!fileInputRef.current) {
            fileInputRef.current = document.createElement('input');
            fileInputRef.current.type = 'file';
            fileInputRef.current.accept = supportedFileTypes.join(',');
            fileInputRef.current.multiple = false;
            fileInputRef.current.onchange = handleFileChange;
        }
        fileInputRef.current.click();
    };

    const handleFileChange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        // Check file extension
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const isSupported = supportedFileTypes.some(type => {
            return type.endsWith('/*') ? file.type.startsWith(type.split('/*')[0])
                : type.startsWith('.') ? `.${fileExtension}` === type
                    : file.type === type;
        });

        if (!isSupported) {
            message.error(`Unsupported file type. Please upload: ${supportedFileTypes.join(', ')}`);
            return;
        }

        try {
            const uploadedFileUrl = await uploadFile(file);
            const fileType = file.type.startsWith('image/') ? 'image' : 'file';

            setContent(prev => [
                ...prev,
                {
                    type: fileType,
                    fileType,
                    content: `${uploadedFileUrl.url}`,
                    fileName: file.name
                }
            ]);
        } catch (error) {
            message.error("File upload failed");
            console.error("Upload error:", error);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const deleteFileMessage = (index: number) => {
        setContent(prev => prev.filter((_, idx) => idx !== index));
    };

    const renderFileContent = (content: FileMessageContent, index: number) => {
        if (content.fileType === 'image') {
            return (
                <div className="relative inline-block mr-2" key={index}>
                    <Image
                        className="rounded-lg"
                        height={50}
                        src={content.content}
                        alt="Uploaded content"
                    />
                    <CloseOutlined
                        size={5}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => deleteFileMessage(index)}
                    />
                </div>
            );
        }

        // For non-image files
        const displayName = content.fileName || content.content.split('/').pop() || 'file';
        return (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mr-2 mb-2 " key={index}>
                <div className="flex items-center">
                    <span className="mr-2 text-lg">
                        {getFileIcon(content.content)}
                    </span>
                    <div className="max-w-xs truncate" title={displayName}>
                        <a
                            href={content.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                        >
                            {displayName}
                        </a>
                    </div>
                </div>
                <CloseOutlined
                    className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={() => deleteFileMessage(index)}
                />
            </div>
        );
    };

    const handleSendMessage = () => {
        if (!inputText.trim() && content.length === 0) {
            message.info("Please enter your query");
            return;
        }

        const messageContent: MessageContent[] = [
            ...content,
            { type: "text", content: inputText }
        ];
        setInputText("");
        setContent([]);
        sendMessage(messageContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleResponseStop = () => {
        onStop?.();
        abortControllerRef.current?.abort("User manually stopped the request");
    };

    return (
        <div className="w-full max-w-4xl m-auto bg-[#fff]">
            {/* 新增的清空会话记录按钮 */}
            {showClearButton && onNewConversation && (
                <div className="flex justify-center pt-2 mb-2">
                    <Button
                        type="primary"
                        onClick={onNewConversation}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 mr-3 flex items-center text-sm"
                        icon={<ClearOutlined className="text-xs" />}
                    >
                        清空会话记录
                    </Button>
                    <Button
                        style={{display: 'none'}}
                        type={isVoiceMode ? "primary" : "default"}
                        onClick={onToggleVoiceMode}
                        className={` px-4 py-1 flex items-center text-sm ${
                            isVoiceMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        icon={isVoiceMode ? <MessageOutlined /> : <PhoneOutlined />}
                    >
                        {isVoiceMode ? "语音模式" : "打电话"}
                    </Button>
                </div>
            )}

            <div className="px-2 bg-[#E3E8EE] border border-gray-300 rounded-xl hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ease-in-out">
                {/* File preview area with smooth animation */}
                {content.length > 0 && (
                    <div className="flex flex-wrap gap-2  transition-all duration-200 ease-in-out mt-2">
                        {content.map((fileContent, index) => (
                            renderFileContent(fileContent, index)
                        ))}
                    </div>
                )}

                {/* Enhanced text input area */}
                <Input.TextArea
                    className="flex-grow"
                    placeholder="请输入你的问题..."
                    value={inputText}
                    variant="borderless"
                    autoSize={{maxRows: 6, minRows: 2}}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={generating}
                    style={{lineHeight: '1.5rem'}}
                />

                {/* Refined action buttons */}
                <div className="flex gap-2 mb-1.5 justify-content-between">
                    <Tooltip title="上传文件" placement="top">
                        <Button
                            className="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            onClick={uploadFileMessage}
                            disabled={generating}
                            icon={<UploadOutlined className="text-gray-600"/>}
                        />
                    </Tooltip>

                    {generating ? (
                        <Tooltip title="停止生成" placement="top">
                            <Button
                                danger
                                className="flex items-center justify-center rounded-lg transition-colors duration-200"
                                onClick={handleResponseStop}
                                icon={<CloseOutlined/>}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="发送" placement="top">
                            <Button
                                type="primary"
                                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-200"
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() && content.length === 0}
                                icon={<SendOutlined className="text-white"/>}
                            />
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageInputComponent;