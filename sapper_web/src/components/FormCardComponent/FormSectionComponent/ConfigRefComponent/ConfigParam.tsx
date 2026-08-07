import { useState, useEffect } from "react";
import { Alert, Button, Card, Input,  Select, Space, Form, Switch } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useGlobalStateSelector } from "../../../../hooks/global.js";
import { useAgentSelector, useDispatchAgent } from "../../../../hooks/agent.js";

type ParamFillType = 'cloze' | 'select';

const ConfigParamComponent = () => {
    const [form] = Form.useForm();
    const agentDispatch = useDispatchAgent();
    const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
    const { selectedVariable } = useGlobalStateSelector((state) => state.global);
    const [fillType, setFillType] = useState<ParamFillType>('cloze');
    const match = selectedVariable.data.match(/~refParameter\{(.*?)\}\/refParameter/);
    const param = match ? match[1] : '';
    const currentParam = agentDetail?.parameters[param];
    // 初始化表单数据
    useEffect(() => {
        if (agentDetail && selectedVariable.data) {
            if (currentParam) {
                const placeholder = currentParam.placeholder === '' ? '请输入参数值' : currentParam.placeholder;
                form.setFieldsValue({
                    type: currentParam.type || 'user',
                    valueType:currentParam.value_type || 'text',
                    fillType: currentParam.fill_type || 'cloze',
                    placeholder: placeholder || '',
                    options: currentParam.options || [''],
                    required: currentParam.required,
                    description: currentParam.description,
                    content: currentParam.content
                });
                setFillType(currentParam.fill_type || 'cloze');
            }
        }
    }, [selectedVariable, agentDetail, form]);


    const handleSave = () => {
        form.validateFields().then(values => {
            if (agentDetail && currentParam) {
                const newAgentParameters = { ...agentDetail.parameters };
                newAgentParameters[param] = {
                    type: form.getFieldValue('type'),
                    value_type: values.valueType,
                    fill_type: values.fillType,
                    placeholder: values.placeholder,
                    options: values.fillType !== 'cloze' ? values.options : undefined,
                    content: values.content || '',
                    required: values.required,
                    description: values.description
                };
                agentDispatch.setAgentPartialInfo({ parameters: newAgentParameters });
            }
        });
    };

    const handleConvertToSystemParam = () => {
        const param_type = form.getFieldValue('type') === 'user' ? 'system' : 'user'
        form.setFieldValue('type', param_type)
        handleSave()
    };

    return (
        <div style={{
            padding: "16px",
            height: 'calc(100% - 30px)',
            overflowY: "auto",
            background: '#f8f9fa',
            borderRadius: '8px'
        }}>
            <Alert
                message="参数设置提示"
                description="请仔细填写以下参数信息，确保用户能够正确输入"
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
                action={
                    <Button
                        type="primary"
                        size="small"
                        onClick={handleConvertToSystemParam}
                        style={{ marginTop: '8px' }}
                    >
                        {form.getFieldValue('type') === 'user' ? '更改为系统参数': '更改为初始化参数'}
                    </Button>
                }
            />

            <Form form={form} layout="vertical" style={{display: form.getFieldValue('type') === 'user' ? 'block' : 'none'}}>
                {/* 基本信息 */}
                <Card size="small" title="基本信息" style={{ marginBottom: '16px' }}>
                    <Form.Item
                        name="valueType"
                        label="参数类型"
                        // rules={[{ required: true, message: '请选择参数类型' }]}
                    >
                        <Select>
                            <Select.Option value="text">文本</Select.Option>
                            <Select.Option value="image">图片</Select.Option>
                            <Select.Option value="number">数字</Select.Option>
                            <Select.Option value="boolean">布尔值</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="fillType"
                        label="填写类型"
                        // rules={[{ required: true, message: '请选择填写类型' }]}
                    >
                        <Select onChange={(value: ParamFillType) => setFillType(value)}>
                            <Select.Option value="cloze">填空</Select.Option>
                            <Select.Option value="select">单选</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="required"
                        label="是否必填"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Card>

                {/* 参数描述 */}
                <Card size="small" title="参数描述" style={{ marginBottom: '16px' }}>
                    <Form.Item
                        name="placeholder"
                        label="占位符文本"
                        // rules={[{ required: true, message: '请输入占位符文本' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="详细描述"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Card>

                {/* 选项设置 */}
                {fillType === 'select' && (
                    <Card
                        size="small"
                        title="选项设置"
                        style={{ marginBottom: '16px' }}
                    >
                        <Form.List name="options">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex'}} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name]}
                                                rules={[{ required: true, message: '请输入选项内容' }]}
                                                style={{ flex: 1 }}
                                            >
                                                <Input placeholder="请输入选项内容" />
                                            </Form.Item>
                                            <MinusOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Button
                                        type="dashed"
                                        size="small"
                                        onClick={() => add('')}
                                        icon={<PlusOutlined />}
                                    >
                                        添加选项
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                )}

                {/* 默认值 */}
                <Card size="small" title="默认值设置" style={{ marginBottom: '16px' }}>
                    <Form.Item name="content" label="默认值">
                        <Input />
                    </Form.Item>
                </Card>

                {/* 保存按钮 */}
                <Button
                    type="primary"
                    size="middle"
                    block
                    style={{
                        marginTop: '16px',
                        height: '40px',
                        fontWeight: '500'
                    }}
                    onClick={handleSave}
                >
                    确认保存
                </Button>
            </Form>
        </div>
    );
};

export default ConfigParamComponent;