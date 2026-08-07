import { useState } from 'react';
import { Layout, Upload, Button, Table, message, Modal, Progress, Spin } from 'antd';
import {
    UploadOutlined,
    DeleteOutlined,
    FileTextOutlined,
    CheckOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { uploadFile } from "../../api/upload";
import { useDispatchGraphCollection } from "../../hooks/graphCollection.ts";
import type { UploadFile, UploadProps } from 'antd';

const { Content } = Layout;

interface GraphCollectionCreateComponentProps {
    knowledge_base_uuid: string;
    visible: boolean;
    onClose: () => void;
}

const GraphCollectionCreateComponent = ({
                                            knowledge_base_uuid,
                                            visible,
                                            onClose
                                        }: GraphCollectionCreateComponentProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const dispatchGraphCollection = useDispatchGraphCollection();

    const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        console.log(file)
        const uploadedFile = file as File;
        try {

            const imageUrl = await uploadFile(uploadedFile);

            setFileList(prev => [...prev, {
                uid: uploadedFile.name,
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.type,
                url: imageUrl.url,
                status: 'done',
                percent: 100
            }]);

            onSuccess?.({}, uploadedFile);
        } catch (error) {
            console.error('Upload failed:', error);
            onError?.(new Error('Upload failed'));
            message.error(`文件 ${uploadedFile.name} 上传失败`);
        }
    };


    const handleRemove = (file: UploadFile) => {
        setFileList(prev => prev.filter(item => item.uid !== file.uid));
    };

    const handleFileProcess = async () => {
        if (fileList.length === 0) {
            message.warning('请先上传需要处理的文件');
            return;
        }

        setProcessing(true);
        setProgress({});

        try {
            const results = await Promise.allSettled(
                fileList.map(async (file) => {
                    try {
                        // Update progress for this file
                        setProgress(prev => ({ ...prev, [file.uid]: 10 }));

                        await dispatchGraphCollection.addGraphCollection({
                            knowledge_base_uuid,
                            file_url: file.url || '',
                            name: file.name || '未命名文件',
                            status: 1,
                        });

                        setProgress(prev => ({ ...prev, [file.uid]: 100 }));
                        return { success: true, file };
                    } catch (error) {
                        console.error(`处理文件 ${file.name} 失败:`, error);
                        return { success: false, file, error };
                    }
                })
            );

            // Process results
            const successFiles = results.filter(r => r.status === 'fulfilled' && r.value.success);
            const failedFiles = results.filter(r => r.status === 'rejected' || !r.value?.success);

            if (failedFiles.length > 0) {
                message.warning(
                    `成功处理 ${successFiles.length} 个文件，${failedFiles.length} 个文件处理失败`
                );
            } else {
                message.success(`成功处理全部 ${fileList.length} 个文件`);
            }
        } catch (error) {
            console.error('处理过程发生意外错误:', error);
            message.error('处理文件时发生错误');
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        {
            title: '文件名',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: UploadFile) => (
                <div className="file-name-cell">
                    {record.status === 'done' ? (
                        <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    ) : record.status === 'error' ? (
                        <ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                    ) : (
                        <FileTextOutlined style={{ marginRight: 8 }} />
                    )}
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            key: 'size',
            render: (size: number) => (
                <span>{size ? `${(size / (1024 * 1024)).toFixed(2)} MB` : '未知'}</span>
            ),
        },
        {
            title: '进度',
            key: 'progress',
            render: (record: UploadFile) => (
                <Progress
                    percent={progress[record.uid] || 0}
                    size="small"
                    status={
                        record.status === 'error' ? 'exception' :
                            record.status === 'done' ? 'success' : 'active'
                    }
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (record: UploadFile) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(record)}
                    disabled={processing}
                />
            ),
        },
    ];

    return (
        <Modal
            title="上传知识图谱文件"
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="back" onClick={onClose}>
                    取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleFileProcess}
                    disabled={fileList.length === 0 || processing}
                    loading={processing}
                >
                    {processing ? '处理中...' : '开始处理'}
                </Button>,
            ]}
            centered
        >
            <Content className="file-upload-content">
                <Upload.Dragger
                    fileList={fileList}
                    customRequest={customRequest}
                    multiple
                    accept=".json,.graph,.txt"
                    disabled={processing}
                    beforeUpload={(file) => {
                        const isLt10M = file.size / 1024 / 1024 < 100;
                        if (!isLt10M) {
                            message.error('文件大小不能超过100MB');
                        }
                        return isLt10M;
                    }}
                    className="upload-dragger"
                    showUploadList={false}
                >
                    <p className="ant-upload-drag-icon">
                        {processing ? <Spin /> : <UploadOutlined />}
                    </p>
                    <p className="ant-upload-text">
                        {processing ? '文件处理中...' : '点击或拖动文件到此处上传'}
                    </p>
                    <p className="ant-upload-hint">
                        支持从unigraph中导出的图谱文件 (.json, .graph)
                    </p>
                </Upload.Dragger>

                <div className="file-list-container">
                    <Table
                        dataSource={fileList}
                        columns={columns}
                        rowKey="uid"
                        pagination={false}
                        scroll={{ y: 240 }}
                        loading={processing}
                        locale={{
                            emptyText: '暂无文件，请上传文件'
                        }}
                    />
                </div>
            </Content>
        </Modal>
    );
};

export default GraphCollectionCreateComponent;