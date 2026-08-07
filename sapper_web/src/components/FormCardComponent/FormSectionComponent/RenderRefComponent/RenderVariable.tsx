import { useEffect, useState } from "react";
import { Input, Menu, Tag, Modal, Typography, Divider } from "antd";
import { PlusOutlined, DatabaseOutlined, AppstoreOutlined, ShakeOutlined } from "@ant-design/icons";
import {useAgentSelector, useDispatchAgent} from "../../../../hooks/agent";
import { RefActionProps } from "./index.tsx";

const { Text } = Typography;
export interface RefItemType {
  name: string;
  uuid: string;
  key: string;
}

const RenderRefVar = (props: RefActionProps) => {
  const { onChange } = props;
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const agentDispatch = useDispatchAgent()
  const [APISuggestions, setAPISuggestions] = useState<RefItemType[]>([]);
  const [DataSuggestions, setDataSuggestions] = useState<RefItemType[]>([]);
  const [ParamSuggestions, setParamSuggestions] = useState<RefItemType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleMenuSelect = (type: string, item: { name: string; uuid: string }) => {
    let updatedText = `${type}:${item.name}`;
    if (type === 'ref-data') {
      updatedText = `~refData{${item.uuid}}[{"query": ""}][]/refData`;
    } else if (type === 'ref-api') {
      updatedText = `~refAPI{${item.uuid}}[][]/refAPI`;
    } else if (type === 'ref-param') {
      updatedText = `~refParameter{${item.name}}/refParameter`;
    }
    onChange(updatedText, type);
  };

  const handleParamAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    // Trim input and check if empty
    if (!inputValue.trim()) {
      Modal.error({
        title: '参数名称不能为空',
        content: '请输入有效的参数名称。',
      });
      return;
    }

    // Validate parameter name format (only English, numbers, and Chinese characters allowed)
    const isValidName = /^[\w\u4e00-\u9fa5]+$/u.test(inputValue);
    if (!isValidName) {
      Modal.error({
        title: '参数名称格式错误',
        content: '参数名称只能包含英文、数字和中文，不能有特殊符号或空格。',
      });
      return;
    }

    // Check if parameter already exists
    const param_base = agentDetail?.parameters ? { ...agentDetail.parameters } : {};
    if (Object.keys(param_base).includes(inputValue)) {
      Modal.info({
        title: '该参数已经存在',
        content: '请输入其他的参数名称。',
      });
      return;
    }

    // Add new parameter
    param_base[inputValue] = { value_type: 'text', placeholder: `请输入${inputValue}的内容`, content: '', type: 'user', };
    agentDispatch.setAgentPartialInfo({ parameters: param_base });
    onChange(`~refParameter{${inputValue}}/refParameter`, 'ref-param');

    // Reset state
    setIsModalOpen(false);
    setInputValue('');
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setInputValue('');
  };

  useEffect(() => {
    if (!agentDetail) return;
    const filteredKnowledge = agentDetail.knowledge_bases
        .map(item => ({ ...item, key: item.uuid }));
    setDataSuggestions(filteredKnowledge);

    const filteredAPIs = agentDetail.plugins
        .map(item => ({ ...item, key: item.uuid }));
    setAPISuggestions(filteredAPIs);

    const filteredParams = Object.keys(agentDetail.parameters).map((name, index) => ({
      name,
      uuid: `param-${index}`,
      key: `param-${index}`,
    }));
    setParamSuggestions(filteredParams);
  }, [agentDetail]);

  const menu = (
      <Menu style={{ maxHeight: '300px', overflow: 'auto', padding: '2px' }}>
        <Divider orientation="left" style={{ fontSize: '12px', color: '#888' }}>
          <Tag color="green">参数</Tag>
        </Divider>
        <Menu.Item key={"param-add"} onClick={handleParamAdd} style={{ display: 'flex', alignItems: 'center' }}>
          <PlusOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
          <Text>添加新参数</Text>
        </Menu.Item>
        {ParamSuggestions.map((param) => (
            <Menu.Item key={param.key} onClick={() => handleMenuSelect("ref-param", param)} style={{ display: 'flex', alignItems: 'center' }}>
              <ShakeOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              {param.name}
            </Menu.Item>
        ))}

        {DataSuggestions.length > 0 && (
            <>
              <Divider orientation="left" style={{ fontSize: '12px', color: '#888' }}>
                <Tag color="#1890ff">知识库</Tag>
              </Divider>
              {DataSuggestions.map((data) => (
                  <Menu.Item key={data.key} onClick={() => handleMenuSelect("ref-data", data)} style={{ display: 'flex', alignItems: 'center' }}>
                    <DatabaseOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    {data.name}
                  </Menu.Item>
              ))}
            </>
        )}

        {APISuggestions.length > 0 && (
            <>
              <Divider orientation="left" style={{ fontSize: '12px', color: '#888' }}>
                <Tag color="purple">插件</Tag>
              </Divider>
              {APISuggestions.map((api) => (
                  <Menu.Item key={api.key} onClick={() => handleMenuSelect("ref-api", api)} style={{ display: 'flex', alignItems: 'center' }}>
                    <AppstoreOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
                    {api.name}
                  </Menu.Item>
              ))}
            </>
        )}
      </Menu>
  );

  return (
      <div>
        {menu}
        <Modal
            title="添加新参数"
            open={isModalOpen}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="确认"
            cancelText="取消"
        >
          <Input
              placeholder="输入参数名称"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
          />
        </Modal>
      </div>
  );
};

export default RenderRefVar;