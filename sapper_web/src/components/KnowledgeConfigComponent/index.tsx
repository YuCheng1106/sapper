import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Card } from 'antd';
import {useDispatchKnowledgeBase, useKnowledgeBaseSelector} from "../../hooks/knowledgeBase.ts";
import { QuestionCircleOutlined} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
    uuid: string;
    embeddingModel: string;
    name: string;
    description: string;
}

const MODEL_OPTIONS = [
    { value: 'Dmeta-embedding-zh', label: 'Dmeta-embedding-zh' },
    // { value: 'text-embedding-ada-002', label: 'OpenAI Ada' , disabled: true },
    // { value: 'text-embedding-3-small', label: 'OpenAI 3 Small', disabled: true },
    // { value: 'text-embedding-3-large', label: 'OpenAI 3 Large', disabled: true  },
];

const EBConfigComponent = () => {
    const [form] = Form.useForm<FormValues>();
    const knowledgeBaseDetail = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBaseDetail);
    const dispatch = useDispatchKnowledgeBase();
    const [submitting, setSubmitting] = useState(false);

    // Initialize form with knowledge base details
    useEffect(() => {
        if (knowledgeBaseDetail) {
            form.setFieldsValue({
                uuid: knowledgeBaseDetail.uuid,
                embeddingModel: knowledgeBaseDetail.embedding_model || 'Dmeta-embedding-zh',
                name: knowledgeBaseDetail.name,
                description: knowledgeBaseDetail.description,
            });
        }
    }, [knowledgeBaseDetail, form]);

    const onFinish = async (values: FormValues) => {
        setSubmitting(true);
        try {
            if (knowledgeBaseDetail)
                dispatch.updateKnowledgeBaseInfo(knowledgeBaseDetail.uuid, values);
            message.success('知识库信息更新成功');
        } catch (error) {
            console.error('Update failed:', error);
            message.error('知识库信息更新失败');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Card
            title="知识库配置"
            variant={"borderless"}
            style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    embeddingModel: 'Dmeta-embedding-zh',
                }}
            >
                <Form.Item
                    label="知识库 ID"
                    name="uuid"
                    tooltip="知识库的唯一标识符"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="知识库名称"
                    name="name"
                    rules={[
                        { required: true, message: '请输入知识库名称' },
                        { max: 50, message: '名称不能超过50个字符' }
                    ]}
                >
                    <Input placeholder="请输入知识库名称" />
                </Form.Item>

                <Form.Item
                    label="索引模型"
                    name="embeddingModel"
                    tooltip={{
                        title: '选择用于文本嵌入的模型',
                        icon: <QuestionCircleOutlined />,
                    }}
                >
                    <Select>
                        {MODEL_OPTIONS.map(model => (
                            <Option key={model.value} value={model.value}>
                                {model.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="介绍"
                    name="description"
                    rules={[
                        { max: 500, message: '介绍不能超过500个字符' }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="请输入知识库的简要介绍"
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 32 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        style={{ marginRight: 16 }}
                    >
                        保存配置
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EBConfigComponent;