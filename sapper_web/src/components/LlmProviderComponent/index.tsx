import { useEffect, useState, useRef } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Select,
    message,
    List,
    Row,
    Col,
    Tag,
    Switch,
    Layout,
    Menu,
    Spin,
    Card,
    Avatar,
    Tabs,
    Space,
    Divider,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ApiOutlined,
    CloudServerOutlined,
    RobotOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import './index.css'
import { useDispatchLLMProvider, useLLMProviderSelector } from "../../hooks/llmProvider.ts";
import { useDispatchLLMModel, useLLMModelSelector } from "../../hooks/llmModel.ts";
import {LLMModelRes} from "../../types/llmModelType.ts";
import {Link} from "react-router-dom";
import axios from 'axios';
import { validateLlmProvider } from "../../api/llm/provider.ts"

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Sider, Content, Header } = Layout;

const LlmProviderComponent = () => {
    const [form] = Form.useForm();
    const [selectedProviderId, setSelectedProviderId] = useState<number>(null);
    const [showProviderForm, setShowProviderForm] = useState(false);
    const [showModelCreateForm, setShowModelCreateForm] = useState(false);
    const [showModelUpdateForm, setShowModelUpdateForm] = useState(false);
    const [currentModel, setCurrentModel] = useState<LLMModelRes | null>(null);
    const [activeTab, setActiveTab] = useState('config');

    // Redux状态管理
    const dispatch = useDispatchLLMProvider();
    const modelDispatch = useDispatchLLMModel();
    const { providers, status } = useLLMProviderSelector(state => state.llmProvider);
    const providerDetail = useLLMProviderSelector(state => state.llmProvider.providerDetail);
    const { models } = useLLMModelSelector(state => state.llmModel);

    // 验证用户LLM配置
    const checkConfigValidation = async () => {
        try {
            await validateLlmProvider();
        } catch (error) {
            console.error('配置验证失败:', error);
        }
    };

    useEffect(() => {
        dispatch.getLLMProviderList();
        checkConfigValidation();
    }, []);

    useEffect(() => {
        if (providers.items.length > 0 && selectedProviderId === null) {
            const enabledProvider = providers.items.find(p => p.status === 1);
            if (enabledProvider) {
                handleSelectProvider(enabledProvider.id);
            } else {
                const firstProvider = providers.items[0];
                handleSelectProvider(firstProvider.id);
            }
        }
    }, [providers.items]);

    useEffect(() => {
        if (providerDetail) {
            form.setFieldsValue({
                api_key: providerDetail.api_key,
                api_url: providerDetail.api_url,
                document_url: providerDetail.document_url,
                model_url: providerDetail.llm_model_url
            });
        }
    }, [providerDetail, form]);

    const loadProviderDetail = (id: number) => {
        dispatch.getLLMProviderDetail(id);
        modelDispatch.getLLMModelList({
            provider_id: selectedProviderId,
        });
    };

    const providerMenuItems = [...providers.items]
        .sort((a, b) => b.status - a.status)
        .map(p => ({
            key: p.id,
            label: (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${p.status === 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <ApiOutlined className={`text-lg ${p.status === 1 ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                            <div className={`font-medium ${p.status === 1 ? 'text-blue-700' : 'text-gray-600'}`}>
                                {p.name}
                            </div>
                        </div>
                    </div>
                    <Tag
                        color={p.status === 1 ? 'green' : 'red'}
                        className={`px-2 py-0.5 rounded-md text-xs ${p.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        icon={p.status === 1 ? <CheckCircleOutlined /> : <WarningOutlined />}
                    >
                        {p.status === 1 ? '运行中' : '已停用'}
                    </Tag>
                </div>
            )
        }));

    const handleProviderSubmit = async (values: any) => {
        try {
            if (providerDetail) {
                await dispatch.updateLLMProviderInfo(providerDetail.id, values);
                message.success('配置更新成功');
                // 重新验证配置
                await checkConfigValidation();
            }
        } catch (error) {
            message.error('配置更新失败');
        }
    };

    const [testloading, setTestloading] = useState(false);
    const handleTestConfig = async () => {
        const values = form.getFieldsValue();
        const { api_key, api_url } = values;
        const status = providerDetail ? providerDetail.status : 0;
        const activeModel = models.items.find(model => model.status === 1);

        if (!status) {
            message.error('请先启用服务商');
            return;
        }
        if (!api_key) {
            message.error('请输入API密钥');
            return;
        }
        if (!api_url) {
            message.error('请输入API地址');
            return;
        }
        if (!activeModel) {
            message.error('请先启用至少一个模型');
            return;
        }

        setTestloading(true);
        try {
            const response = await axios.get('/api/v1/llm/model/test', {
                params: {
                    base_url: api_url,
                    api_key: api_key,
                    model_name: activeModel.name,
                },
            });
            // if (response.message === "api_key test successfully.") {
            //     message.success("配置测试通过，服务可用");
            // } else {
            //     message.error("配置测试失败，请检查API设置");
            // }
        } catch (error) {
            message.error('配置测试失败，请检查网络连接和配置');
        } finally {
            setTestloading(false);
        }
    };

    const handleAddModel = async (values: any) => {
        try {
            await modelDispatch.addLLMModel({
                ...values,
                status: 0,
                provider_id: selectedProviderId
            });
            message.success('模型添加成功');
            setShowModelCreateForm(false);
        } catch (error) {
            message.error('模型添加失败');
        }
    };

    const contentRef = useRef<HTMLDivElement>(null);

    const handleUpdateModel = async (values: any) => {
        if(!currentModel) return;
        try {
            await modelDispatch.updateLLMModelInfo(currentModel.id, {
                ...values,
            });
            message.success('模型更新成功');
            setShowModelUpdateForm(false);
        } catch (error) {
            message.error('模型更新失败');
        }
    };

    const handleUpdateClick = async (values: LLMModelRes) => {
        setCurrentModel(values);
        setShowModelUpdateForm(true);
    };

    useEffect(() => {
        if (contentRef.current && models.items) {
            const enabledModel = models.items.find(model => model.status === 1);
            if (enabledModel) {
                setTimeout(() => {
                    contentRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }
    }, [models.items]);

    const handleSelectProvider = (id: number) => {
        setSelectedProviderId(id);
        form.resetFields();
        loadProviderDetail(id);
    };

    const menuRef = useRef<HTMLDivElement>(null);

    const handleProviderStatusChange = async (checked: boolean) => {
        if (providerDetail) {
            if (checked) {
                if (menuRef.current) {
                    menuRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                const openProvider = providers.items.find((item) => item.status === 1 && item.id !== providerDetail.id);
                if (openProvider) {
                    message.info(`请先关闭 ${openProvider.name} 服务`);
                    return;
                }
            }

            dispatch.updateLLMProviderInfo(providerDetail.id, {
                status: checked ? 1 : 0
            });
        }
    };

    const handleModelStatusChange = async (model_id: string, checked: boolean) => {
        if(models){
            if (checked) {
                const openModel = models.items.find((item) => item.status === 1 && item.id !== model_id);
                if (openModel) {
                    message.info(`请先关闭 ${openModel.name} 模型`);
                    return;
                }
            }
            modelDispatch.updateLLMModelInfo(model_id, {status:  checked ? 1 : 0})
        }
    };

    const sortedModels = [...models.items].sort((a, b) => b.status - a.status);

    return (
        <Layout className="h-[60vh] bg-gray-50">
            {/* Left Provider List */}
            <Sider width="35%" className="bg-white h-full shadow-sm rounded-l-lg border-r border-gray-200">
                <div className="provider-list h-full flex flex-col">
                    <div className="list-header px-6 py-4 border-b border-gray-200">
                        <Title level={4} className="text-gray-800 mb-1">AI 服务商</Title>
                        <Text type="secondary" className="text-xs">选择或配置您的AI服务提供商</Text>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto p-2"
                        ref={menuRef}
                    >
                        <Menu
                            mode="inline"
                            selectedKeys={[selectedProviderId]}
                            items={providerMenuItems}
                            onSelect={({ key }) => handleSelectProvider(key)}
                            className="border-r-0"
                        />
                    </div>
                </div>
            </Sider>

            {/* Right Configuration Panel */}
            <Layout className="h-full bg-white rounded-r-lg shadow-sm">
                <Header className="bg-white px-6 py-4 border-b border-gray-200 h-auto">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space size="middle">
                                <CloudServerOutlined className="text-blue-600 text-xl" />
                                <Title level={4} className="mb-1">
                                    {providerDetail?.name || '服务商配置'}
                                </Title>
                                <Tag color={providerDetail?.status ? 'green' : 'red'} className="ml-2">
                                    {providerDetail?.status ? '已启用' : '已禁用'}
                                </Tag>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Text strong className="text-sm mr-2">
                                    {providerDetail?.status ? '运行中' : '已停用'}
                                </Text>
                                <Switch
                                    checked={!!providerDetail?.status}
                                    onChange={checked => handleProviderStatusChange(checked)}
                                    checkedChildren="启用"
                                    unCheckedChildren="禁用"
                                    className="bg-blue-600"
                                />
                            </Space>
                        </Col>
                    </Row>
                </Header>
                <Content
                    className="p-6 flex-1 overflow-y-auto"
                    ref={contentRef}
                >
                    {status === 'loading' ? (
                        <Spin tip="加载中..." className="flex justify-center items-center h-full" />
                    ) : (
                        <>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="mb-6"
                            >
                                <TabPane tab="基础配置" key="config" />
                                <TabPane tab="模型管理" key="models" />
                            </Tabs>

                            {activeTab === 'config' && providerDetail && (
                                <div className="space-y-6">
                                    {/* 配置状态提示 */}


                                    <Card
                                        title="API 配置"
                                        bordered={false}
                                        className="shadow-sm"
                                    >
                                        <Form
                                            form={form}
                                            initialValues={providerDetail}
                                            onFinish={handleProviderSubmit}
                                            layout="vertical"
                                        >
                                            <Row gutter={24}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="API密钥"
                                                        name="api_key"
                                                        rules={[{ required: true, message: '请输入API密钥' }]}
                                                    >
                                                        <Input.Password
                                                            placeholder="replace-with-your-api-key"
                                                            className="hover:border-blue-400 focus:border-blue-500"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="API地址"
                                                        name="api_url"
                                                        rules={[{required: true, type: 'url', message: '请输入有效的API地址'}]}
                                                    >
                                                        <Input
                                                            placeholder="https://api.example.com/v1"
                                                            className="hover:border-blue-400 focus:border-blue-500"

                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Divider />

                                            <Space>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    保存配置
                                                </Button>
                                                <Button
                                                    type="default"
                                                    className="bg-gray-100 hover:bg-gray-200"
                                                    onClick={handleTestConfig}
                                                    loading={testloading}
                                                >
                                                    测试连接
                                                </Button>
                                            </Space>
                                        </Form>
                                    </Card>

                                    <Card
                                        title="文档与资源"
                                        bordered={false}
                                        className="shadow-sm"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <Text strong className="block mb-2">官方文档</Text>
                                                <Link
                                                    to={providerDetail.document_url || ''}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                                >
                                                    <LinkOutlined className="mr-1" />
                                                    {providerDetail.name} 官方文档
                                                </Link>
                                            </div>
                                            <div>
                                                <Text strong className="block mb-2">模型列表</Text>
                                                <Link
                                                    to={providerDetail.llm_model_url || ''}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                                >
                                                    <LinkOutlined className="mr-1" />
                                                    查看支持的模型
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'models' && (
                                <Card
                                    title="模型管理"
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => setShowModelCreateForm(true)}
                                        >
                                            添加模型
                                        </Button>
                                    }
                                >
                                    <List
                                        dataSource={sortedModels}
                                        renderItem={model => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleUpdateClick(model)}
                                                        className="text-blue-600"
                                                    />,
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => modelDispatch.removeLLMModel(model.id)}
                                                    />
                                                ]}
                                                className={`p-4 rounded-lg ${model.status === 1 ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"}`}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            size="large"
                                                            icon={<RobotOutlined />}
                                                            className={`${model.status === 1 ? 'bg-green-500' : 'bg-gray-300'} text-white`}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong className={model.status === 1 ? "text-green-600" : ""}>
                                                                {model.name}
                                                            </Text>
                                                            {model.status === 1 && (
                                                                <Tag color="green" icon={<CheckCircleOutlined />}>使用中</Tag>
                                                            )}
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space size="small">
                                                            <Tag className="bg-gray-100">{model.type}</Tag>
                                                            {model.group_name && (
                                                                <Tag color="blue">{model.group_name}</Tag>
                                                            )}
                                                        </Space>
                                                    }
                                                />
                                                <Switch
                                                    checked={model.status === 1}
                                                    onChange={checked => handleModelStatusChange(model.id, checked)}
                                                    checkedChildren="启用"
                                                    unCheckedChildren="禁用"
                                                    className={model.status === 1 ? 'bg-green-500' : 'bg-gray-300'}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            )}
                        </>
                    )}
                </Content>
            </Layout>

            {/* Modals */}
            <ProviderFormModal
                visible={showProviderForm}
                onClose={() => setShowProviderForm(false)}
            />

            <ModelCreateFormModal
                visible={showModelCreateForm}
                onClose={() => setShowModelCreateForm(false)}
                onSubmit={handleAddModel}
            />

            <ModelUpdateFormModal
                visible={showModelUpdateForm}
                initialValues={currentModel}
                onClose={() => {
                    setShowModelUpdateForm(false);
                    setCurrentModel(null);
                }}
                onSubmit={handleUpdateModel}
            />
        </Layout>
    );
};


// 服务商表单模态框组件
const ProviderFormModal = ({ visible, onClose } : {visible: boolean, onClose : () => void}) => {
    const [form] = Form.useForm();
    const dispatch = useDispatchLLMProvider();

    const handleSubmit = async (values: any) => {
        try {
            await dispatch.addLLMProvider(values);
            message.success('服务商创建成功');
            onClose();
        } catch (error) {
            message.error('创建失败');
        }
    };

    return (
        <Modal
            title="新建服务商"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="服务商名称" name="name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// 模型表单模态框组件
const ModelUpdateFormModal = ({ visible, initialValues, onClose, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) form.setFieldsValue(initialValues);
    }, [initialValues]);

    return (
        <Modal
            title={initialValues ? '编辑模型' : '添加模型'}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item label="模型名称" name="name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="模型类型" name="type" rules={[{ required: true }]}>
                    <Select options={[
                        { label: '文本生成', value: 'text-generation' },
                        { label: '图像生成', value: 'image-generation' },
                        { label: '视频生成', value: 'video-generation' },
                        { label: '文本嵌入', value: 'text-embedding' },
                    ]} />
                </Form.Item>
                <Form.Item label="分组名称" name="group_name">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// 模型表单模态框组件
const ModelCreateFormModal = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    return (
        <Modal
            title={'添加模型'}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item label="模型名称" name="name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="模型类型" name="type" rules={[{ required: true }]}>
                    <Select options={[
                        { label: '文本生成', value: 'text-generation' },
                        { label: '图像生成', value: 'image-generation' },
                        { label: '视频生成', value: 'video-generation' },
                        { label: '文本嵌入', value: 'text-embedding' },
                    ]} />
                </Form.Item>
                <Form.Item label="分组名称" name="group_name">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LlmProviderComponent;
