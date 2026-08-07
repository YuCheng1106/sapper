import { Button, Card, Col, Form, Input, Row, Select, Space, Tooltip, Switch } from 'antd';
import { MinusOutlined, PlusOutlined, ApiOutlined, SettingOutlined, BranchesOutlined, ProfileOutlined } from "@ant-design/icons";
import { PluginDetail } from "../../types/pluginType.ts";
import { useEffect } from "react";
import './index.css';
const { Item } = Form;

const { Option } = Select;


const PluginFormComponent = ({ plugin_data, handleChange }: { plugin_data?: PluginDetail, handleChange: (values: PluginDetail) => void }) => {
    const [form] = Form.useForm();
    // Default form structure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initFormData = {
        name: '',
        description: '',
        server_url: "",
        method: 'POST' as PluginDetail['method'],
        parse_path: [],
        input_parameters: [] as PluginDetail['input_parameters'],
        request_body: { mode: 'none', content_type: 'application/json' },
        auth_config: { type: 'none' },
        headers: [],
        output_parameters: [],
        responses: [],
        category: undefined
    };

    // Initialize form
    useEffect(() => {
        // 使用后端数据或空表单结构进行初始化
        const base = plugin_data ?? initFormData;
        const initialValues = {
            ...initFormData,
            ...base,
            input_parameters: base?.input_parameters ?? []
        } as never;
        form.setFieldsValue(initialValues);
    }, [form]);

    const onValuesChange = (_: any, allValues: never) => {
        // 直接传递最新值（使用新的字段结构）
        handleChange(allValues as PluginDetail);
    };
    
    return (
        <div className="coze-container">
            <div className="coze-main">
                <Form
                    form={form}
                    className="coze-form"
                    layout="vertical"
                    onValuesChange={onValuesChange}
                    initialValues={plugin_data ?? initFormData}
                >
                    <Card size="small" className="coze-card"  title={<span><ProfileOutlined style={{ marginRight: 6 }} />基础信息</span>}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label="名称" name="name">
                                    <Input placeholder="请输入插件名称" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="服务器URL" name="server_url">
                                    <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} placeholder="https://api.example.com/endpoint" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label="分类" name="category">
                                    <Select placeholder="选择分类">
                                        <Option value="hardware">智能硬件</Option>
                                        <Option value="tools">实用工具</Option>
                                        <Option value="websearch">网页搜索</Option>
                                        <Option value="data">数据分析</Option>
                                        <Option value="integration">系统集成</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label="描述" name="description">
                            <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="用一句话说明插件的用途与能力" />
                        </Form.Item>
                    </Card>

                    <Card size="small" className="coze-card" title={<span><SettingOutlined style={{ marginRight: 6 }} />接口配置</span>}>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item label="请求方法" name="method">
                                    <Select placeholder="选择 HTTP 方法">
                                        {['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS'].map((m) => (
                                            <Option key={m} value={m}>{m}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="请求体模式" name={["request_body", "mode"]}>
                                    <Select placeholder="选择 Body 模式">
                                        {['formdata','urlencoded','raw','binary','graphql','none'].map((mode) => (
                                            <Option key={mode} value={mode}>{mode}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="内容类型" name={["request_body", "content_type"]}>
                                    <Select placeholder="选择 Content-Type">
                                        {[
                                            'application/json',
                                            'application/x-www-form-urlencoded',
                                            'multipart/form-data',
                                            'text/plain',
                                            'application/octet-stream'
                                        ].map((ct) => (
                                            <Option key={ct} value={ct}>{ct}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card size="small" className="coze-card" title={<span><SettingOutlined style={{ marginRight: 6 }} />认证配置</span>}>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item label="认证类型" name={["auth_config", "type"]}>
                                    <Select placeholder="选择认证类型">
                                        {['bearer','basic','apikey','oauth2','none'].map((t) => (
                                            <Option key={t} value={t}>{t}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        {/* 分类型输入 */}
                        {(() => {
                            const authType = form.getFieldValue(['auth_config','type']);
                            if (authType === 'bearer') {
                                return (
                                    <Form.Item label="令牌" name={["auth_config","token"]}>
                                        <Input placeholder="Bearer Token" />
                                    </Form.Item>
                                );
                            }
                            if (authType === 'basic') {
                                return (
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item label="用户名" name={["auth_config","username"]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item label="密码" name={["auth_config","password"]}>
                                                <Input.Password />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                );
                            }
                            if (authType === 'apikey') {
                                return (
                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="API Key" name={["auth_config","api_key"]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="位置" name={["auth_config","api_key_location"]}>
                                                <Select placeholder="位置">
                                                    {['query','header','path','body','cookie'].map((loc) => (
                                                        <Option key={loc} value={loc}>{loc}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="字段名" name={["auth_config","api_key_name"]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                );
                            }
                            if (authType === 'oauth2') {
                                return (
                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="Token URL" name={["auth_config","token_url"]}>
                                                <Input placeholder="https://..." />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="Client ID" name={["auth_config","client_id"]}>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="Client Secret" name={["auth_config","client_secret"]}>
                                                <Input.Password />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                );
                            }
                            return null;
                        })()}
                    </Card>

                    <Card size="small" className="coze-card" title={<span><SettingOutlined style={{ marginRight: 6 }} />请求头</span>}>
                        <Form.List name="headers">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Item key={key} className="coze-param-row">
                                            <Space wrap style={{ width: '100%' }} size="small">
                                                <Form.Item {...restField} name={[name, 'name']} style={{ flex: 1, minWidth: 180 }} label="名称">
                                                    <Input placeholder="Header 名称" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'value']} style={{ flex: 2, minWidth: 240 }} label="值">
                                                    <Input placeholder="Header 值" />
                                                </Form.Item>
                                                <Tooltip title="删除头部">
                                                    <Button icon={<MinusOutlined />} onClick={() => remove(name)} />
                                                </Tooltip>
                                            </Space>
                                        </Item>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: '', value: '' })}>
                                        新增请求头
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Card size="small" className="coze-card" title={<span><ApiOutlined style={{ marginRight: 6 }} />输入参数</span>}>
                        <Form.List name="input_parameters">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Item key={key} className="coze-param-row">
                                            <Space wrap style={{ width: '100%' }} size="small">
                                                <Form.Item {...restField} name={[name, 'name']} style={{ flex: 1, minWidth: 160 }} label="参数名称">
                                                    <Input placeholder="如：query" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'description']} style={{ flex: 2, minWidth: 240 }} label="参数描述">
                                                    <Input placeholder="参数用途说明" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'type']} style={{ width: 200 }} label="参数类型">
                                                    <Select placeholder="选择类型">
                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'location']} style={{ width: 180 }} label="传入位置">
                                                    <Select placeholder="选择位置">
                                                        {['query','header','path','body','cookie'].map((loc) => (
                                                            <Option key={loc} value={loc}>{loc}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'required']} valuePropName="checked" style={{ width: 120 }} label="必填">
                                                    <Switch />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                    <Switch />
                                                </Form.Item>
                                                <Tooltip title="删除参数">
                                                    <Button icon={<MinusOutlined />} onClick={() => remove(name)} />
                                                </Tooltip>
                                            </Space>
                                            {/* 输入参数嵌套：对象属性与数组元素 */}
                                            {(() => {
                                                const paramType = form.getFieldValue(['input_parameters', name, 'type']);
                                                if (paramType === 'object') {
                                                    return (
                                                        <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="对象属性">
                                                            <Form.List name={[name, 'properties']}>
                                                                {(propFields, { add: addProp, remove: removeProp }) => (
                                                                    <>
                                                                        {propFields.map(({ key: pkey, name: pname, ...propRest }) => (
                                                                            <Item key={pkey} className="coze-param-row">
                                                                                <Space wrap style={{ width: '100%' }} size="small">
                                                                                    <Form.Item {...propRest} name={[pname, 'name']} style={{ flex: 1, minWidth: 160 }} label="属性名称">
                                                                                        <Input />
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'description']} style={{ flex: 2, minWidth: 240 }} label="属性描述">
                                                                                        <Input />
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'type']} style={{ width: 200 }} label="属性类型">
                                                                                        <Select placeholder="选择类型">
                                                                                            {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                <Option key={opt} value={opt}>{opt}</Option>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'location']} style={{ width: 180 }} label="传入位置">
                                                                                        <Select placeholder="选择位置">
                                                                                            {['query','header','path','body','cookie'].map((loc) => (
                                                                                                <Option key={loc} value={loc}>{loc}</Option>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'required']} valuePropName="checked" style={{ width: 120 }} label="必填">
                                                                                        <Switch />
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                        <Switch />
                                                                                    </Form.Item>
                                                                                    <Tooltip title="删除属性">
                                                                                        <Button icon={<MinusOutlined />} onClick={() => removeProp(pname)} />
                                                                                    </Tooltip>
                                                                                </Space>
                                                                                {/* 属性为对象时的第二层嵌套：子属性 */}
                                                                                {form.getFieldValue(['input_parameters', name, 'properties', pname, 'type']) === 'object' && (
                                                                                    <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="子属性">
                                                                                        <Form.List name={[pname, 'properties']}>
                                                                                            {(subFields, { add: addSub, remove: removeSub }) => (
                                                                                                <>
                                                                                                    {subFields.map(({ key: skey, name: sname, ...subRest }) => (
                                                                                                        <Item key={skey} className="coze-param-row">
                                                                                                            <Space wrap style={{ width: '100%' }} size="small">
                                                                                                                <Form.Item {...subRest} name={[sname, 'name']} style={{ flex: 1, minWidth: 160 }} label="子属性名称">
                                                                                                                    <Input />
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'description']} style={{ flex: 2, minWidth: 240 }} label="子属性描述">
                                                                                                                    <Input />
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'type']} style={{ width: 200 }} label="子属性类型">
                                                                                                                    <Select placeholder="选择类型">
                                                                                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                                                                                        ))}
                                                                                                                    </Select>
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'location']} style={{ width: 180 }} label="传入位置">
                                                                                                                    <Select placeholder="选择位置">
                                                                                                                        {['query','header','path','body','cookie'].map((loc) => (
                                                                                                                            <Option key={loc} value={loc}>{loc}</Option>
                                                                                                                        ))}
                                                                                                                    </Select>
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'required']} valuePropName="checked" style={{ width: 120 }} label="必填">
                                                                                                                    <Switch />
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                                                    <Switch />
                                                                                                                </Form.Item>
                                                                                                                <Tooltip title="删除子属性">
                                                                                                                    <Button icon={<MinusOutlined />} onClick={() => removeSub(sname)} />
                                                                                                                </Tooltip>
                                                                                                            </Space>
                                                                                                        </Item>
                                                                                                    ))}
                                                                                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => addSub({ name: '', description: '', type: 'string', location: 'body', required: false, enabled: true })}>
                                                                                                        新增子属性
                                                                                                    </Button>
                                                                                                </>
                                                                                            )}
                                                                                        </Form.List>
                                                                                    </Card>
                                                                                )}
                                                                            </Item>
                                                                        ))}
                                                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => addProp({ name: '', description: '', type: 'string', location: 'body', required: false, enabled: true })}>
                                                                            新增属性
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Form.List>
                                                        </Card>
                                                    );
                                                }
                                                if (paramType === 'array') {
                                                    const itemType = form.getFieldValue(['input_parameters', name, 'items', 'type']);
                                                    return (
                                                        <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="数组元素定义">
                                                            <Space wrap style={{ width: '100%' }} size="small">
                                                                <Form.Item name={[name, 'items', 'name']} style={{ flex: 1, minWidth: 160 }} label="元素名称">
                                                                    <Input />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'description']} style={{ flex: 2, minWidth: 240 }} label="元素描述">
                                                                    <Input />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'type']} style={{ width: 200 }} label="元素类型">
                                                                    <Select placeholder="选择类型">
                                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'location']} style={{ width: 180 }} label="传入位置">
                                                                    <Select placeholder="选择位置">
                                                                        {['query','header','path','body','cookie'].map((loc) => (
                                                                            <Option key={loc} value={loc}>{loc}</Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'required']} valuePropName="checked" style={{ width: 120 }} label="必填">
                                                                    <Switch />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                    <Switch />
                                                                </Form.Item>
                                                            </Space>
                                                            {itemType === 'object' && (
                                                                <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="元素对象属性">
                                                                    <Form.List name={[name, 'items', 'properties']}>
                                                                        {(itemProps, { add: addItemProp, remove: removeItemProp }) => (
                                                                            <>
                                                                                {itemProps.map(({ key: ikey, name: iname, ...itemRest }) => (
                                                                                    <Item key={ikey} className="coze-param-row">
                                                                                        <Space wrap style={{ width: '100%' }} size="small">
                                                                                            <Form.Item {...itemRest} name={[iname, 'name']} style={{ flex: 1, minWidth: 160 }} label="属性名称">
                                                                                                <Input />
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'description']} style={{ flex: 2, minWidth: 240 }} label="属性描述">
                                                                                                <Input />
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'type']} style={{ width: 200 }} label="属性类型">
                                                                                                <Select placeholder="选择类型">
                                                                                                    {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                        <Option key={opt} value={opt}>{opt}</Option>
                                                                                                    ))}
                                                                                                </Select>
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'location']} style={{ width: 180 }} label="传入位置">
                                                                                                <Select placeholder="选择位置">
                                                                                                    {['query','header','path','body','cookie'].map((loc) => (
                                                                                                        <Option key={loc} value={loc}>{loc}</Option>
                                                                                                    ))}
                                                                                                </Select>
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'required']} valuePropName="checked" style={{ width: 120 }} label="必填">
                                                                                                <Switch />
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                                <Switch />
                                                                                            </Form.Item>
                                                                                            <Tooltip title="删除属性">
                                                                                                <Button icon={<MinusOutlined />} onClick={() => removeItemProp(iname)} />
                                                                                            </Tooltip>
                                                                                        </Space>
                                                                                    </Item>
                                                                                ))}
                                                                                <Button type="dashed" icon={<PlusOutlined />} onClick={() => addItemProp({ name: '', description: '', type: 'string', location: 'body', required: false, enabled: true })}>
                                                                                    新增属性
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </Form.List>
                                                                </Card>
                                                            )}
                                                        </Card>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </Item>
                                    ))}
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => add({ name: `param_${Date.now()}`, description: '', type: 'string', location: 'query', required: false, enabled: true })}
                                    >
                                        新增输入参数
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Card size="small" className="coze-card" title={<span><ApiOutlined style={{ marginRight: 6 }} />输出参数</span>}>
                        <Form.List name="output_parameters">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Item key={key} className="coze-param-row">
                                            <Space wrap style={{ width: '100%' }} size="small">
                                                <Form.Item {...restField} name={[name, 'name']} style={{ flex: 1, minWidth: 160 }} label="参数名称">
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'description']} style={{ flex: 2, minWidth: 240 }} label="参数描述">
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'type']} style={{ width: 200 }} label="参数类型">
                                                    <Select placeholder="选择类型">
                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                    <Switch />
                                                </Form.Item>
                                                <Tooltip title="删除参数">
                                                    <Button icon={<MinusOutlined />} onClick={() => remove(name)} />
                                                </Tooltip>
                                            </Space>
                                            {/* 输出参数嵌套：对象属性 */}
                                            {(() => {
                                                const paramType = form.getFieldValue(['output_parameters', name, 'type']);
                                                if (paramType === 'object') {
                                                    return (
                                                        <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="对象属性">
                                                            <Form.List name={[name, 'properties']}>
                                                                {(propFields, { add: addProp, remove: removeProp }) => (
                                                                    <>
                                                                        {propFields.map(({ key: pkey, name: pname, ...propRest }) => (
                                                                            <Item key={pkey} className="coze-param-row">
                                                                                <Space wrap style={{ width: '100%' }} size="small">
                                                                                    <Form.Item {...propRest} name={[pname, 'name']} style={{ flex: 1, minWidth: 160 }} label="属性名称">
                                                                                        <Input />
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'description']} style={{ flex: 2, minWidth: 240 }} label="属性描述">
                                                                                        <Input />
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'type']} style={{ width: 200 }} label="属性类型">
                                                                                        <Select placeholder="选择类型">
                                                                                            {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                <Option key={opt} value={opt}>{opt}</Option>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Form.Item {...propRest} name={[pname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                        <Switch />
                                                                                    </Form.Item>
                                                                                    <Tooltip title="删除属性">
                                                                                        <Button icon={<MinusOutlined />} onClick={() => removeProp(pname)} />
                                                                                    </Tooltip>
                                                                                </Space>
                                                                                {/* 属性为对象时的第二层嵌套：属性的属性 */}
                                                                                {form.getFieldValue(['output_parameters', name, 'properties', pname, 'type']) === 'object' && (
                                                                                    <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="子属性">
                                                                                        <Form.List name={[pname, 'properties']}>
                                                                                            {(subFields, { add: addSub, remove: removeSub }) => (
                                                                                                <>
                                                                                                    {subFields.map(({ key: skey, name: sname, ...subRest }) => (
                                                                                                        <Item key={skey} className="coze-param-row">
                                                                                                            <Space wrap style={{ width: '100%' }} size="small">
                                                                                                                <Form.Item {...subRest} name={[sname, 'name']} style={{ flex: 1, minWidth: 160 }} label="子属性名称">
                                                                                                                    <Input />
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'description']} style={{ flex: 2, minWidth: 240 }} label="子属性描述">
                                                                                                                    <Input />
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'type']} style={{ width: 200 }} label="子属性类型">
                                                                                                                    <Select placeholder="选择类型">
                                                                                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                                                                                        ))}
                                                                                                                    </Select>
                                                                                                                </Form.Item>
                                                                                                                <Form.Item {...subRest} name={[sname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                                                    <Switch />
                                                                                                                </Form.Item>
                                                                                                                <Tooltip title="删除子属性">
                                                                                                                    <Button icon={<MinusOutlined />} onClick={() => removeSub(sname)} />
                                                                                                                </Tooltip>
                                                                                                            </Space>
                                                                                                        </Item>
                                                                                                    ))}
                                                                                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => addSub({ name: '', description: '', type: 'string', enabled: true })}>
                                                                                                        新增子属性
                                                                                                    </Button>
                                                                                                </>
                                                                                            )}
                                                                                        </Form.List>
                                                                                    </Card>
                                                                                )}
                                                                            </Item>
                                                                        ))}
                                                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => addProp({ name: '', description: '', type: 'string', enabled: true })}>
                                                                            新增属性
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Form.List>
                                                        </Card>
                                                    );
                                                }
                                                if (paramType === 'array') {
                                                    const itemType = form.getFieldValue(['output_parameters', name, 'items', 'type']);
                                                    return (
                                                        <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="数组元素定义">
                                                            <Space wrap style={{ width: '100%' }} size="small">
                                                                <Form.Item name={[name, 'items', 'name']} style={{ flex: 1, minWidth: 160 }} label="元素名称">
                                                                    <Input />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'description']} style={{ flex: 2, minWidth: 240 }} label="元素描述">
                                                                    <Input />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'type']} style={{ width: 200 }} label="元素类型">
                                                                    <Select placeholder="选择类型">
                                                                        {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                            <Option key={opt} value={opt}>{opt}</Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'items', 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                    <Switch />
                                                                </Form.Item>
                                                            </Space>
                                                            {itemType === 'object' && (
                                                                <Card size="small" className="coze-subcard" style={{ marginTop: 12 }} title="元素对象属性">
                                                                    <Form.List name={[name, 'items', 'properties']}>
                                                                        {(itemProps, { add: addItemProp, remove: removeItemProp }) => (
                                                                            <>
                                                                                {itemProps.map(({ key: ikey, name: iname, ...itemRest }) => (
                                                                                    <Item key={ikey} className="coze-param-row">
                                                                                        <Space wrap style={{ width: '100%' }} size="small">
                                                                                            <Form.Item {...itemRest} name={[iname, 'name']} style={{ flex: 1, minWidth: 160 }} label="属性名称">
                                                                                                <Input />
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'description']} style={{ flex: 2, minWidth: 240 }} label="属性描述">
                                                                                                <Input />
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'type']} style={{ width: 200 }} label="属性类型">
                                                                                                <Select placeholder="选择类型">
                                                                                                    {['string','integer','number','boolean','array','object','file'].map((opt) => (
                                                                                                        <Option key={opt} value={opt}>{opt}</Option>
                                                                                                    ))}
                                                                                                </Select>
                                                                                            </Form.Item>
                                                                                            <Form.Item {...itemRest} name={[iname, 'enabled']} valuePropName="checked" style={{ width: 120 }} label="启用">
                                                                                                <Switch />
                                                                                            </Form.Item>
                                                                                            <Tooltip title="删除属性">
                                                                                                <Button icon={<MinusOutlined />} onClick={() => removeItemProp(iname)} />
                                                                                            </Tooltip>
                                                                                        </Space>
                                                                                    </Item>
                                                                                ))}
                                                                                <Button type="dashed" icon={<PlusOutlined />} onClick={() => addItemProp({ name: '', description: '', type: 'string', enabled: true })}>
                                                                                    新增属性
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </Form.List>
                                                                </Card>
                                                            )}
                                                        </Card>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </Item>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: '', description: '', type: 'string', enabled: true })}>
                                        新增输出参数
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Card size="small" className="coze-card" title={<span><BranchesOutlined style={{ marginRight: 6 }} />返回值类型</span>}>
                        <Form.Item name="return_value_type">
                            <Select
                                placeholder="请选择返回值类型"
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="text">text</Select.Option>
                                <Select.Option value="image">image</Select.Option>
                                <Select.Option value="video">video</Select.Option>
                                <Select.Option value="audio">audio</Select.Option>
                                <Select.Option value="audio_base64">audio_base64</Select.Option>
                                <Select.Option value="video_base64">video_base64</Select.Option>
                                <Select.Option value="image_base64">image_base64</Select.Option>
                            </Select>
                        </Form.Item>
                    </Card>


                </Form>
                {/* 试运行弹窗已迁移至工作间页面顶部 */}
            </div>
            {/* 右侧预览区域已移除 */}
        </div>
    );
};

export default PluginFormComponent;