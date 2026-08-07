import React, { useState } from "react";
import { Button, Input, message, Modal, Form, Upload, Space, Select } from "antd";
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { uploadFile } from "../../api/upload";
import { AgentCreateReq } from "../../types/agentType.ts";
import { HttpError } from "../../api/interceptor.ts";


interface AgentCreateModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (data: AgentCreateReq) => Promise<void> | void;
}

const AgentCreateModal: React.FC<AgentCreateModalProps> = ({ visible, onClose, onCreate }) => {
    const [form] = Form.useForm<AgentCreateReq>();
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("https://sapper3701-1316534880.cos.ap-nanjing.myqcloud.com/1773534d-834d-422a-971e-ea820ab60dd1/3bc10fc7bf0a92e052b82d61ce084e9.jpg");

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const agentCreateData: AgentCreateReq = {
                ...values,
                cover_image: imageUrl,
                status: 1,
            };

            await onCreate(agentCreateData);
            form.resetFields();
            setImageUrl("");
            onClose();
        } catch (error) {
            console.error("表单验证失败:", error);
        }
    };

    const handleImageUpload = async ({ file }: {file: string | Blob}) => {
        setUploading(true);
        try {
            const image = await uploadFile(file);
            if (image?.url) {
                setImageUrl(image.url);
                form.setFieldsValue({ cover_image: image.url });
                message.success('头像上传成功');
            } else {
                message.error('头像上传失败');
            }
        } catch (error: unknown) {
            const httpError = error as HttpError;
            message.error(httpError.msg || '上传失败');
        } finally {
            setUploading(false);
        }
    };

    const handleModalClose = () => {
        form.resetFields();
        setImageUrl("");
        onClose();
    };

    return (
        <Modal
            title="创建智能体"
            open={visible}
            onCancel={handleModalClose}
            footer={[
                <Button key="cancel" onClick={handleModalClose}>
                    取消
                </Button>,
                <Button
                    type="primary"
                    key="submit"
                    onClick={handleSubmit}
                    loading={uploading}
                >
                    创建
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: '',
                    capability: '',
                    type: 1,
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item
                        label="名称"
                        name="name"
                        rules={[{ required: true, message: '请输入智能体名称' }]}
                    >
                        <Input placeholder="请输入智能体名称" />
                    </Form.Item>

                    <Form.Item
                        label="设定描述"
                        name="capability"
                        rules={[{ required: true, message: '请输入简介' }]}
                    >
                        <Input.TextArea
                            showCount
                            autoSize={{ minRows: 3 }}
                            placeholder="示例：一位高中英语读后续写批改助手，专注于帮助中学生提升写作能力，可以批改学生的读后续写，批改过程中首先对学生作文的题目要求进行深入分析，明确读后续写的作文类型，并全面理解写作的核心任务。"
                        />
                    </Form.Item>

                    <Form.Item
                        label="类型"
                        name="type"
                        rules={[{ required: true, message: '请选择类型' }]}
                    >
                        <Select placeholder="请选择类型">
                            <Select.Option value={0}>管理类智能体</Select.Option>
                            <Select.Option value={1}>工具类智能体</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="头像"
                        name="cover_image"
                    >
                        <Upload
                            name="cover_image"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            customRequest={handleImageUpload}
                        >
                            {imageUrl ? (
                                <img
                                    src={`${imageUrl}`}
                                    alt="avatar"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div>
                                    {uploading ? <LoadingOutlined /> : <UploadOutlined />}
                                    <div style={{ marginTop: 8 }}>上传头像</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );
};

export default AgentCreateModal;