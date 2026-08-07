import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Tooltip, Avatar, Typography, Card, } from 'antd';
import {AudioOutlined, AudioMutedOutlined, LoadingOutlined, RobotOutlined, CloseOutlined} from '@ant-design/icons';
import AudioVisualizerComponent from '../AudioVisualizerComponent';
import './index.css';
import { MessageContent } from '../../../types/conversationType';
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;

// 在VoiceChatProps接口中添加onClose回调
interface VoiceChatProps {
    sendMessage: (content: MessageContent[]) => void;
    generating: boolean;
    abortControllerRef: React.RefObject<AbortController | null>;
    isActive: boolean;
    systemResponse?: string;
    onClose?: () => void; // 新增的关闭回调
}

const VoiceChatComponent: React.FC<VoiceChatProps> = ({
                                                          sendMessage,
                                                          generating,
                                                          abortControllerRef,
                                                          isActive,
                                                          systemResponse,
                                                          onClose
                                                      }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [transcript, setTranscript] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const timerRef = useRef<number | null>(null);
    const animationRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // 语音朗读系统回复
    useEffect(() => {
        if (!isActive || !systemResponse || generating) return;

        const speak = () => {
            if (!('speechSynthesis' in window)) {
                message.warning('您的浏览器不支持语音朗读功能');
                return;
            }

            if (!systemResponse.trim()) return;

            window.speechSynthesis.cancel();

            const sentences = systemResponse.split(/([。！？])/).filter(Boolean);
            let currentIndex = 0;

            const speakNextChunk = () => {
                if (currentIndex >= sentences.length || !isActive) {
                    setIsSpeaking(false);
                    return;
                }

                const chunk = sentences[currentIndex] + (sentences[currentIndex + 1] || '');
                currentIndex += 2;

                const utterance = new SpeechSynthesisUtterance(chunk);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.9;
                utterance.pitch = 1.1;

                utterance.onend = () => {
                    if (currentIndex < sentences.length) {
                        speakNextChunk();
                    } else {
                        setIsSpeaking(false);
                    }
                };

                utterance.onerror = (event) => {
                    if (event.error !== 'interrupted') {
                        console.error('语音朗读错误:', event);
                        message.error('语音朗读失败');
                    }
                    setIsSpeaking(false);
                };

                window.speechSynthesis.speak(utterance);
            };

            setIsSpeaking(true);
            speakNextChunk();
        };

        const timer = setTimeout(speak, 300);

        return () => {
            clearTimeout(timer);
            window.speechSynthesis.cancel();
        };
    }, [systemResponse, isActive, generating]);

    // 音频分析设置
    const setupAudioAnalyzer = (stream: MediaStream) => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const analyzeAudio = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const level = Math.max(...dataArray) / 255;
            setAudioLevel(level);
            animationRef.current = requestAnimationFrame(analyzeAudio);
        };

        animationRef.current = requestAnimationFrame(analyzeAudio);
    };
    type MessageBubbleProps = {
        content: string;
        isUser: boolean;
        isMarkdown?: boolean;
    };

    const MessageBubble: React.FC<MessageBubbleProps> = ({ content, isUser, isMarkdown = false }) => {
        const bubbleStyle: React.CSSProperties = {
            padding: '12px 16px',
            borderRadius: '18px',
            margin: '8px 0',
            lineHeight: 1.5,
            maxWidth: '85%',
            wordBreak: 'break-word',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.3s ease',
            backgroundColor: isUser ? '#1890ff' : '#f5f5f5',
            color: isUser ? 'white' : '#333',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            borderBottomRightRadius: isUser ? '4px' : '18px',
            borderBottomLeftRadius: isUser ? '18px' : '4px'
        };

        return (
            <div style={bubbleStyle}>
                {isMarkdown ? (
                    <ReactMarkdown
                        children={content}
                        components={{
                            p: ({ node, ...props }) => <p style={{ margin: '0.5em 0' }} {...props} />,
                            code: ({ node, ...props }) => (
                                <code
                                    style={{
                                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                        fontFamily: 'monospace'
                                    }}
                                    {...props}
                                />
                            ),
                            pre: ({ node, ...props }) => (
                                <pre
                                    style={{
                                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                        margin: '0.5em 0'
                                    }}
                                    {...props}
                                />
                            )
                        }}
                    />
                ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
                )}
            </div>
        );
    };
    // Initialize speech recognition
    useEffect(() => {
        if (!isActive) return;

        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'zh-CN';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                message.error('语音识别错误: ' + event.error);
                stopRecording();
            };
        } else {
            message.warning('您的浏览器不支持语音识别功能');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [isActive]);

    // Clean up when component is inactive
    useEffect(() => {
        if (!isActive && isRecording) {
            stopRecording();
        }
    }, [isActive]);

    // Handle recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setRecordingTime(0);
            setAudioLevel(0);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const startRecording = async () => {
        if (isSpeaking && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            setupAudioAnalyzer(stream);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingStatus('recording');
            setTranscript('');

            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            message.success('开始录音');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            message.error('无法访问麦克风，请检查权限设置');
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current || !audioStream) return;

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordingStatus('processing');

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        audioStream.getTracks().forEach(track => track.stop());

        mediaRecorderRef.current.onstop = () => {
            if (transcript.trim()) {
                setRecordingStatus('idle');
                sendVoiceMessage(transcript.trim());
            } else {
                message.info('未检测到语音内容');
                setRecordingStatus('idle');
            }
        };

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };

    const sendVoiceMessage = (text: string) => {
        sendMessage([{ type: 'text', content: text }]);
        setTranscript('');
    };

    const handleAbort = () => {
        abortControllerRef.current?.abort();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const getStatusText = () => {
        if (isSpeaking) return 'AI 正在回复...';
        if (generating) return '正在处理您的请求...';
        if (isRecording) return '正在录音...';
        if (recordingStatus === 'processing') return '正在处理语音...';
        return '点击麦克风开始说话';
    };

    const getButtonGlowStyle = () => {
        if (isRecording) {
            const intensity = Math.min(1, audioLevel * 2 + 0.2);
            return {
                boxShadow: `0 0 15px rgba(24, 144, 255, ${intensity})`,
                transform: `scale(${1 + audioLevel * 0.1})`
            };
        }
        return {};
    };

    return (
        <Card className="voice-chat-container" bordered={false} >
            <div className="voice-header"  style={{ position: 'relative' }}>
                <Button
                    type="text"
                    shape="circle"
                    icon={<CloseOutlined />}
                    onClick={() => onClose?.()}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        color: '#999',
                        zIndex: 1
                    }}
                    className="close-button"
                />
                <Avatar
                    size={80}
                    icon={<RobotOutlined/>}
                    className="voice-avatar"
                    style={{
                        backgroundColor: '#1890ff',
                        boxShadow: '0 0 20px rgba(24, 144, 255, 0.5)'
                    }}
                />
                <Title level={3} style={{margin: '16px 0 8px', fontWeight: 500}}>AI 语音助手</Title>
                <Text type="secondary" className="voice-status">
                    <span className="status-indicator"></span>
                    {getStatusText()}
                </Text>
            </div>

            <div className="voice-visualization-area">
                {audioStream && isRecording ? (
                    <div className="recording-visualizer">
                        <AudioVisualizerComponent
                            audioStream={audioStream}
                            isRecording={isRecording}
                            audioLevel={audioLevel}
                        />
                        <div className="voice-timer">{formatTime(recordingTime)}</div>
                    </div>
                ) : (
                    <div className="voice-content-display">
                        {systemResponse ? (
                            <MessageBubble content={systemResponse} isUser={false} isMarkdown={true}/>
                        ) : (
                            <div className="voice-placeholder">
                                {recordingStatus === 'processing' ? (
                                    <div className="processing-animation">
                                        <LoadingOutlined style={{fontSize: 32, color: '#1890ff'}} spin/>
                                        <div className="processing-text">处理中...</div>
                                    </div>
                                ) : (
                                    <div className="welcome-message">
                                        <div className="welcome-icon">
                                            <AudioOutlined style={{fontSize: 32, color: '#1890ff'}}/>
                                        </div>
                                        <div className="welcome-text">点击下方按钮开始语音对话</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="voice-controls">
                {isSpeaking ? (
                    <Tooltip title="停止朗读" placement="top">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            className="control-button stop-button"
                            icon={<AudioMutedOutlined style={{fontSize: 24}}/>}
                            onClick={stopSpeaking}
                            style={{
                                width: 60,
                                height: 60,
                                minWidth: 60,

                            }}
                        />
                    </Tooltip>
                ) : generating ? (
                    <Tooltip title="停止生成回答" placement="top">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            className="control-button stop-button"
                            icon={<AudioMutedOutlined style={{fontSize: 24}}/>}
                            onClick={handleAbort}
                            style={{
                                width: 60,
                                height: 60,
                                minWidth: 60,

                            }}
                        />
                    </Tooltip>
                ) : isRecording ? (
                    <Tooltip title="停止录音" placement="top">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            className="control-button recording-button"
                            style={getButtonGlowStyle()}
                            icon={<AudioMutedOutlined style={{fontSize: 24}}/>}
                            onClick={stopRecording}
                            style={{
                                width: 60,
                                height: 60,
                                minWidth: 60,

                            }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title="开始录音" placement="top">
                        <Button
                            type="primary"
                            shape="circle"
                            className="control-button mic-button"
                            icon={<AudioOutlined style={{fontSize: 24}}/>}
                            onClick={startRecording}
                            disabled={recordingStatus === 'processing' || !isActive}
                            style={{
                                width: 60,
                                height: 60,
                                minWidth: 60,
                            }}
                        />
                    </Tooltip>
                )}
            </div>
        </Card>
    );
};

export default VoiceChatComponent;