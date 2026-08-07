import {Tag, Tooltip} from "antd";
import {useDispatchGlobalState} from "../../../../hooks/global";
import {useAgentSelector} from "../../../../hooks/agent";
import {RefActionProps} from "./index.tsx";

const tagStyle = {cursor: "pointer", fontWeight: 'bold', transition: 'all 0.3s'};

const RenderRefParam = (props: RefActionProps) => {
  const { text } = props
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const { changeSelectedVariable } = useDispatchGlobalState();

  // 提取参数
  const match = text.match(/~refParameter\{(.*?)\}\/refParameter/);
  const param = match ? match[1] : '';
  const selectParam = agentDetail?.parameters[param];
  const handleParamClick = () => {
      changeSelectedVariable({ type: 'ref-param', data: text });
  };

  if (!selectParam) {
    return (
        <Tooltip
            title={
                "参数未配置"
            }
            mouseEnterDelay={0.3}
            mouseLeaveDelay={0.1}
        >
            <Tag color="orange" style={tagStyle} onClick={handleParamClick}>
                ${param}$
            </Tag>
        </Tooltip>
    );
  }

  return (
      <Tooltip
          title={
              selectParam.type === 'user' ? "初始化参数" : "系统参数"
          }
          mouseEnterDelay={0.3}
          mouseLeaveDelay={0.1}
      >
        <Tag color="green" onClick={handleParamClick} style={tagStyle} contentEditable={false}>
          ${param}$
        </Tag>
      </Tooltip>
  );
};

export default RenderRefParam;

