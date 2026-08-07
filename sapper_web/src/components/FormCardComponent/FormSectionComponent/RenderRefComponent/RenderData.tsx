import {Tooltip, Tag} from "antd";
import {useKnowledgeBaseSelector} from "../../../../hooks/knowledgeBase";
import {useAgentSelector} from "../../../../hooks/agent";
import {useDispatchGlobalState} from "../../../../hooks/global";
import {RefActionProps} from "./index.tsx";


const RenderRefData = (props: RefActionProps) => {
  const { text } = props
  const { changeSelectedVariable } = useDispatchGlobalState();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const knowledgeBases = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBases);
  const uuid = text.match(/~refData\{(.*?)\}/)?.[1];
  let parameterKey = "";
  try {
    const jsonString = text.match(/\[(\{.*?\})\]/)?.[1] || `{"query": ""}`;
    parameterKey = JSON.parse(jsonString)["query"].replace(`\${`, '').replace('}$', '');
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    parameterKey = "";
  }
  console.log(parameterKey);
  const tagStyle = {cursor: "pointer", fontWeight: 'bold', transition: 'all 0.3s'};

  // 辅助函数：查找经验库
  const selectedKnowledge = knowledgeBases?.items.find((knowledge) => knowledge.uuid === uuid);
  const associateKnowledge = agentDetail?.knowledge_bases.find((knowledge) => knowledge.uuid === uuid);


  const handleDataClick = () => {
    changeSelectedVariable({type: 'ref-data', data: text})
  }

  // 渲染提示标签
  const renderErrorTag = (tooltipMessage:string, label: string) => (
    <Tooltip title={tooltipMessage} mouseEnterDelay={0.3} mouseLeaveDelay={0.1}>
      <Tag color="red" style={tagStyle}>
        {label}
      </Tag>
    </Tooltip>
  );

    // 渲染提示标签
  const renderWarnTag = (tooltipMessage:string, label: string) => (
    <Tooltip title={tooltipMessage} mouseEnterDelay={0.3} mouseLeaveDelay={0.1}>
        <Tag color="orange" style={tagStyle} onClick={handleDataClick}>
            {label}
        </Tag>
    </Tooltip>
  );

  if (!uuid) {
    return renderErrorTag("未选择经验库！", text);
  }

  if (!selectedKnowledge) {
    return renderErrorTag("该经验库不存在！", text);
  }

  if (!associateKnowledge) {
    return renderErrorTag("该经验库未被关联！", `~refData{${selectedKnowledge.name}}`);
  }


  if (agentDetail && parameterKey !== 'UserRequest' && ! Object.keys(agentDetail.parameters || {}).includes(parameterKey || '')) {
    return renderWarnTag("参数设置错误！", `~refData{${selectedKnowledge.name}}`);
  }

  return (
      <Tooltip
          title={
              <div>
                  <div>查询参数: {parameterKey}</div>
              </div>
          }
      >
          <Tag
            color="blue"
            style={tagStyle}
            onClick={handleDataClick}
          >
              {`~refData{${selectedKnowledge?.name}}`}
          </Tag>
      </Tooltip>
  );
};

export  default RenderRefData;
