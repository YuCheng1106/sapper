import { useState} from 'react';
import {Button, Input, message, Space, Card, Alert, Switch, Popconfirm} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {useEffect} from "react";
import {useDispatchGlobalState, useGlobalStateSelector} from "../../../../hooks/global.js";
import {useAgentSelector, useDispatchAgent} from "../../../../hooks/agent.js";
import {parseRefString} from "../../../../utils/parseRefString.ts";

interface APIParams {
  [key: string]: any;
}

interface ParameterField {
  name: string;
  description?: string;
  type: string;
  location: string;
  required: boolean;
  default?: any;
  properties?: ParameterField[];
  items?: ParameterField;
}

const ConfigAPIComponent = () => {
  const { selectedVariable } = useGlobalStateSelector((state) => state.global);
  const dispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);

  const { changeIsVariableShow } = useDispatchGlobalState();

  const [uuid, setUuid] = useState('');
  const [APIParam, setAPIParam] = useState<APIParams>({});
  const [APIOutput, setAPIOutput] = useState('');
  const [inputParameters, setInputParameters] = useState<ParameterField[]>([]);

  const selectedAPI = agentDetail?.plugins.find((api) => api.uuid === uuid);

  useEffect(() => {
    const { uuid, query, outputVariable } = parseRefString(selectedVariable.data);
    console.log('query:', query, 'outputVariable:', outputVariable);
    setUuid(uuid);
    setAPIOutput(outputVariable);

    if (selectedAPI) {
      setInputParameters(selectedAPI.input_parameters || []);
      // 直接使用 query 作为初始值
      setAPIParam(query || {});
    }
  }, [selectedVariable, selectedAPI]);

  // 更新参数值
  const handleParameterInput = (paramName: string, value: any) => {
    setAPIParam(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // 更新嵌套对象的值
  const handleNestedParameterInput = (parentKey: string, fieldName: string, value: any) => {
    setAPIParam(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [fieldName]: value
      }
    }));
  };

  // 更新数组中的对象
  const handleArrayItemInput = (arrayKey: string, index: number, fieldName: string, value: any) => {
    setAPIParam(prev => {
      const currentArray = Array.isArray(prev[arrayKey]) ? [...prev[arrayKey]] : [];
      if (currentArray[index]) {
        currentArray[index] = {
          ...currentArray[index],
          [fieldName]: value
        };
      }
      return {
        ...prev,
        [arrayKey]: currentArray
      };
    });
  };

  // 添加数组元素
  const handleAddArrayItem = (arrayKey: string) => {
    setAPIParam(prev => {
      const currentArray = Array.isArray(prev[arrayKey]) ? [...prev[arrayKey]] : [];

      // 找到对应的数组定义
      const arrayParam = inputParameters.find(p => p.name === arrayKey);
      if (!arrayParam?.items) return prev;

      // 创建新的数组元素
      const newItem = createDefaultArrayItem(arrayParam.items);

      return {
        ...prev,
        [arrayKey]: [...currentArray, newItem]
      };
    });
  };

  // 删除数组元素
  const handleDeleteArrayItem = (arrayKey: string, index: number) => {
    setAPIParam(prev => {
      const currentArray = Array.isArray(prev[arrayKey]) ? [...prev[arrayKey]] : [];
      const newArray = currentArray.filter((_, i) => i !== index);

      return {
        ...prev,
        [arrayKey]: newArray
      };
    });
  };

  // 创建数组元素的默认值
  const createDefaultArrayItem = (itemDefinition: ParameterField): any => {
    if (itemDefinition.type === 'object' && itemDefinition.properties) {
      // 对象类型的默认值
      const defaultItem: any = {};
      itemDefinition.properties.forEach(prop => {
        defaultItem[prop.name] = prop.default !== undefined ? prop.default : '';
      });
      return defaultItem;
    } else {
      // 基本类型的默认值
      return itemDefinition.default !== undefined ? itemDefinition.default : '';
    }
  };

  // 渲染参数输入字段
  const renderParameterField = (param: ParameterField): React.ReactNode => {
    const value = APIParam[param.name];

    if (param.type === 'object' && param.properties) {
      const nestedValue = value || {};

      return (
          <Card
              key={param.name}
              size="small"
              title={`对象: ${param.name}`}
              style={{ marginBottom: '12px' }}
          >
            {param.properties.map(prop => (
                <div key={prop.name} style={{ marginBottom: '12px' }}>
                  <Space style={{ width: '100%' }} align="center">
                    <div style={{
                      width: '120px',
                      fontSize: '12px',
                      color: '#666',
                      wordBreak: 'break-word'
                    }}>
                      {prop.name}
                      {prop.required && <span style={{ color: 'red' }}> *</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      {renderBasicInput(prop, nestedValue[prop.name], (val) =>
                          handleNestedParameterInput(param.name, prop.name, val)
                      )}
                    </div>
                  </Space>
                  {prop.description && (
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px',
                        marginLeft: '120px'
                      }}>
                        {prop.description}
                      </div>
                  )}
                </div>
            ))}
          </Card>
      );
    }

    if (param.type === 'array' && param.items) {
      const arrayValue = Array.isArray(value) ? value : [];

      return (
          <Card
              key={param.name}
              size="small"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>数组: {param.name}</span>
                  <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddArrayItem(param.name)}
                  >
                    添加元素
                  </Button>
                </div>
              }
              style={{ marginBottom: '12px' }}
          >
            {arrayValue.map((item: any, index: number) => (
                <Card
                    key={index}
                    size="small"
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>元素 {index + 1}</span>
                        <Popconfirm
                            title="确定要删除这个元素吗？"
                            onConfirm={() => handleDeleteArrayItem(param.name, index)}
                            okText="确定"
                            cancelText="取消"
                        >
                          <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    }
                    style={{ marginBottom: '8px' }}
                >
                  {param.items?.type === 'object' && param.items.properties ? (
                      // 数组元素是对象
                      param.items.properties.map(prop => (
                          <div key={prop.name} style={{ marginBottom: '12px' }}>
                            <Space style={{ width: '100%' }} align="center">
                              <div style={{
                                width: '120px',
                                fontSize: '12px',
                                color: '#666',
                                wordBreak: 'break-word'
                              }}>
                                {prop.name}
                                {prop.required && <span style={{ color: 'red' }}> *</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                {renderBasicInput(prop, item?.[prop.name], (val) =>
                                    handleArrayItemInput(param.name, index, prop.name, val)
                                )}
                              </div>
                            </Space>
                            {prop.description && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#999',
                                  marginTop: '4px',
                                  marginLeft: '120px'
                                }}>
                                  {prop.description}
                                </div>
                            )}
                          </div>
                      ))
                  ) : (
                      // 数组元素是基本类型
                      <div style={{ marginBottom: '12px' }}>
                        <Space style={{ width: '100%' }} align="center">
                          <div style={{
                            width: '120px',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            值
                          </div>
                          <div style={{ flex: 1 }}>
                            {renderBasicInput(param.items!, item, (val) =>
                                handleArrayItemInput(param.name, index, 'value', val)
                            )}
                          </div>
                        </Space>
                      </div>
                  )}
                </Card>
            ))}

            {arrayValue.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', padding: '16px' }}>
                  暂无元素，点击"添加元素"按钮添加
                </div>
            )}
          </Card>
      );
    }

    // 基本类型字段
    return (
        <div key={param.name} style={{ marginBottom: '12px' }}>
          <Space style={{ width: '100%' }} align="center">
            <div style={{
              width: '120px',
              fontSize: '12px',
              color: '#666',
              wordBreak: 'break-word'
            }}>
              {param.name}
              {param.required && <span style={{ color: 'red' }}> *</span>}
            </div>
            <div style={{ flex: 1 }}>
              {renderBasicInput(param, value, (val) => handleParameterInput(param.name, val))}
            </div>
          </Space>
          {param.description && (
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px',
                marginLeft: '120px'
              }}>
                {param.description}
              </div>
          )}
        </div>
    );
  };

  // 渲染基本输入组件
  const renderBasicInput = (param: ParameterField, value: any, onChange: (value: any) => void) => {
    switch (param.type) {
      case 'boolean':
        return (
            <Switch
                checked={!!value}
                onChange={onChange}
            />
        );

      case 'integer':
      case 'number':
        return (
            <Input
                type="number"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`请输入${param.description || param.name}`}
                style={{ width: '100%' }}
            />
        );

      default:
        return (
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`请输入${param.description || param.name}`}
                style={{ width: '100%' }}
            />
        );
    }
  };

  const handleOk = async () => {
    if (agentDetail && selectedAPI) {
      // 简单的必填字段验证
      const hasMissingRequired = inputParameters.some(param => {
        if (param.required) {
          const value = APIParam[param.name];
          if (param.type === 'array') {
            return !value || value.length === 0;
          }
          return !value && value !== 0 && value !== false;
        }
        return false;
      });

      if (hasMissingRequired) {
        message.error('请填写所有必填参数！');
        return;
      }

      const state = `~refAPI{${selectedAPI.uuid}}[${JSON.stringify(APIParam)}][\${${APIOutput}}$]/refAPI`;
      const spl_text = JSON.stringify(agentDetail.spl_form);
      const search_text = JSON.stringify(selectedVariable.data).slice(1, -1);
      const replace_text = JSON.stringify(state).slice(1, -1);

      function escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      const regex = new RegExp(escapeRegExp(search_text), 'g');
      const new_spl = spl_text.replace(regex, replace_text);

      dispatch.setAgentPartialInfo({ spl_form: [...JSON.parse(new_spl)] });
      message.success("参数设置成功！");
      changeIsVariableShow();
    }
  };

  return (
      <div style={{
        padding: "16px",
        height: '100%',
        overflowY: "auto",
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <Alert
            message="参数设置提示"
            description="请根据参数类型填写相应的值，带 * 的为必填参数"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
        />

        {inputParameters.length > 0 && (
            <Card
                size="small"
                title={<span style={{ fontSize: '14px' }}>插件参数配置</span>}
                style={{ marginBottom: '16px' }}
            >
              {inputParameters.map(param => renderParameterField(param))}
            </Card>
        )}

        <Card
            size="small"
            title={<span style={{ fontSize: '14px' }}>API输出设置</span>}
            style={{ marginBottom: '16px' }}
        >
          <Input
              placeholder="请输入输出变量名称，例如: output_data"
              value={APIOutput}
              onChange={(e) => setAPIOutput(e.target.value)}
              allowClear
          />
        </Card>

        <Button
            type="primary"
            size="middle"
            block
            style={{
              marginTop: '16px',
              height: '40px',
              fontWeight: '500'
            }}
            onClick={handleOk}
        >
          确认设置
        </Button>
      </div>
  );
};

export default ConfigAPIComponent;