import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import {Progress, Row, Col, Spin} from "antd";
import SPLFormComponent from "../SPLFormComponent";
import CompileInfoComponent from "./CompileInfoComponent";
import {useAgentSelector, useDispatchAgent} from "../../hooks/agent";
import AgentActionComponent from "./AgentActionComponent";
import {AgentSPLFormSection} from "../../types/agentType.ts";
import {useDispatchGlobalState, useGlobalStateSelector} from "../../hooks/global.ts";

const AgentCreateComponent = () => {
  const dispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const dispatchGlobal = useDispatchGlobalState()
  const generateProcess = useAgentSelector((state) => state.agent.processing);
  const compileInfo = useAgentSelector((state) => state.agent.compileInfo);
  const status = useAgentSelector((state) => state.agent.status);
  const { generating } = useGlobalStateSelector((state) => state.global);

  if(agentDetail && agentDetail.spl_form?.length === 0 && generating){
    dispatch.generateAgentSplForm(agentDetail.uuid);
    dispatch.setAgentStatePartialInfo({generating: false, processing: 0})
    dispatchGlobal.setSPLFormGenerating(false);
  }

  const handleSPLFormChange = (value: Array<AgentSPLFormSection>) => {
    if(agentDetail)
      dispatch.setAgentPartialInfo({spl_form: value});
  };

  const handleCompileInfoClean = () => {
    if(agentDetail)
      dispatch.setAgentStatePartialInfo({compileInfo: ''});
  };
  
  return (
    <div style={{height: '100%', backgroundColor: 'white', padding: '10px', borderRadius: '15px'}}>
         {/*Buttons and Progress */}
        <Row gutter={16} >
          <Col span={24}>
            {(generating || generateProcess !== null)  && (
              <Progress percent={generateProcess || 0} style={{ marginTop: "10px" }} />
            )}
          </Col>
        </Row>

        {/* Main Content */}
        <Spin spinning={(generateProcess === 0 || generating)}>
            <Row gutter={16}>
                <Col span={24}>
                    <SPLFormComponent splForm={agentDetail?.spl_form || []} onChange={handleSPLFormChange}
                                      loading={status === 'loading'}/>
                </Col>
                <Col span={24}>
                    {agentDetail?.spl_form?.length !== 0 && <AgentActionComponent/>}
                </Col>
                <Col span={24}>
                    {compileInfo && <CompileInfoComponent Info={compileInfo} clearInfo={handleCompileInfoClean}/>}
                </Col>
            </Row>
        </Spin>
    </div>
  );
};

export default AgentCreateComponent;
