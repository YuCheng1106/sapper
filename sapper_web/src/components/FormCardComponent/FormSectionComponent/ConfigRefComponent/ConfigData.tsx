import { useState } from 'react';
import {Button, Select, Card, Alert, Input} from 'antd';
import {useEffect} from "react";
import {useDispatchGlobalState, useGlobalStateSelector} from "../../../../hooks/global.js";
import {useAgentSelector, useDispatchAgent} from "../../../../hooks/agent.js";
import {parseRefString} from "../../../../utils/parseRefString";
const { Option } = Select;

const ConfigDataComponent = ({ readOnly = false }) => {
  const { selectedVariable } = useGlobalStateSelector((state) => state.global);
  const dispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const [queryParam, setQueryParam] = useState('');
  const [uuid, setUuid] = useState('');
  const [outputParam, setOutputParam] = useState('');
  const {changeIsVariableShow } = useDispatchGlobalState();

  const selectedKnowledge = agentDetail?.knowledge_bases.find((knowledge) => knowledge.uuid === uuid) ;

  useEffect(() => {
    const {uuid, query, outputVariable} = parseRefString(selectedVariable.data)
    setUuid(uuid)
    setQueryParam(query.query)
    setOutputParam(outputVariable)
  }, [selectedVariable]);

  const handleOk = async () => {
    if(agentDetail){
        const spl_text = JSON.stringify(agentDetail.spl_form);
        const parameter = selectedVariable.data.match(/\[(\{.*?\})\]/)?.[1];
        if(parameter && selectedKnowledge){
            const state = `~refData{${selectedKnowledge.uuid}}[${JSON.stringify({"query": `\${${queryParam}}$`})}][\${${outputParam}}$]/refData`;
            const search_text = JSON.stringify(selectedVariable.data).slice(1, -1);
            const replace_text =  JSON.stringify(state).slice(1, -1);
            // 辅助函数：转义正则表达式中的特殊字符
            function escapeRegExp(string: string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
            // 使用正则表达式进行全局替换
            const regex = new RegExp(escapeRegExp(search_text), 'g');
            const new_spl = spl_text.replace(regex, replace_text);
            dispatch.setAgentPartialInfo({spl_form: [...JSON.parse(new_spl)]});
            changeIsVariableShow();
        }
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
        {/* 标题区域 */}
        <Alert
            message="知识库设置提示"
            description="请仔细填写以下参数信息，确保能够正确查询数据库"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
        />

        {/* 参数选择区域 */}
        <Card
            size="small"
            style={{ marginBottom: '16px' }}
            title={
              <span style={{
                fontSize: '14px'
              }}>
                为该知识库选择一个智能体参数作为查询变量：
              </span>
            }
        >
          <Select
              size="middle"
              value={queryParam}
              disabled={readOnly}
              onChange={(value) => setQueryParam(value)}
              style={{ width: '100%' }}
              placeholder="请选择查询参数"
              dropdownStyle={{
                borderRadius: '8px',
                boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
              }}
          >
            {Object.keys(agentDetail?.parameters || {}).map((param) => (
                <Option key={param} value={param}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {param}
                  </div>
                </Option>
            ))}
          </Select>
        </Card>

        {/* API输出名称区域 */}
        <Card
          size="small"
          title={<span style={{ fontSize: '14px' }}>知识库输出设置</span>}
          style={{ marginBottom: '16px' }}
        >
          <Input
              placeholder="请输入输出名称，例如: output_data"
              value={outputParam}
              onChange={(e) => setOutputParam(e.target.value)}
              allowClear
          />
        </Card>
        {/* 确认按钮 */}
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

export default ConfigDataComponent;
