import { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import {Button, message, Modal, Segmented, Space, Typography, Avatar} from 'antd';
import {  Splitter } from 'antd';
import AgentCreateComponent from "../../components/AgentCreateComponent";
import { LeftOutlined, SaveOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {ConfigureComponent, ConfigVariableComponent, EmulatorComponent, AgentDebugComponent} from "../../components";
import {useAgentSelector, useDispatchAgent} from "../../hooks/agent";
import {useDispatchKnowledgeBase} from "../../hooks/knowledgeBase";
import {useDispatchPlugin} from "../../hooks/plugin";
import {useGlobalStateSelector} from "../../hooks/global";
import {useConversationSelector, useDispatchConversation} from "../../hooks/conversation";
import './index.css';
const {Text} = Typography;

const AgentWorkspacePage = () => {
  const agentDispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const conversationDetail = useConversationSelector((state) => state.conversation.conversationDetail);
  const dispatchConversation = useDispatchConversation();
  const dispatchKnowledgeBase = useDispatchKnowledgeBase();
  const dispatchPlugin = useDispatchPlugin();
  const isVariableShow = useGlobalStateSelector((state) => state.global.isVariableShow);
  const agentStatus = useAgentSelector((state) => state.agent.status);
  const loading = !["succeeded", 'failed'].includes(agentStatus)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lastPartOfPath = location.pathname.split("/").pop() as string;
    agentDispatch.getAgentWorkspaceDetail(lastPartOfPath);
    dispatchKnowledgeBase.getKnowledgeBaseList({size: 100})
    dispatchPlugin.getPluginList({size: 100})
    dispatchPlugin.getAllPublicPlugins({size: 100})

    return () => {
      agentDispatch.resetAgent()
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if(agentDetail && agentDetail?.emulator_conversation)
      dispatchConversation.getConversationDetail(agentDetail?.emulator_conversation.uuid);

    return () => {
      dispatchConversation.resetConversation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentDetail?.emulator_conversation?.uuid]);

  const [activeSection, setActiveSection] = useState('Skills');

  const handleAgentSave = async (uuid: string) => {
    if(agentDetail){
      await agentDispatch.updateAgentInfo(uuid, agentDetail);
      message.success("智能体保存成功！");
      if(agentDetail.spl_form.length !== 0){
        message.success("正在编译智能体！");
        agentDispatch.generateAgentSplChain(agentDetail.uuid);
      }
    }
  }

  const [isDebugModalVisible, setIsDebugModalVisible] = useState(false);

  const handleAgentPublish = async () => {
    navigate(`/workspace/agent/${agentDetail?.uuid}/publish`)
  };

  return (
    <div className="d-flex flex-column WorkPage" style={{ position: "relative"}}>
      <div className={`d-flex justify-content-between align-items-center`} style={{backgroundColor: 'white', padding: '5px', borderBottom: '1px solid hsl(214.3 31.8% 91.4%)', height: '60px'}}>
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => navigate(`/agent/display/${agentDetail?.uuid}`)} type="text" />
          <Avatar
              style={{ width: '30px', height: '30px' }}
              shape={'square'}
              src={`${agentDetail?.cover_image}`}
          />
          <Text>
            {agentDetail?.name}
          </Text>
          <Segmented
            options={[
              { value: 'Skills', label: '表单' },
              { value: 'Configure', label: '配置' }
            ]}
            defaultValue="Skills"
            onChange={(value) => setActiveSection(value)}
            style={{
              paddingBottom: '2px',
            }}
          />
          <Space.Compact>
            <Button onClick={()=>handleAgentSave(agentDetail?.uuid || '')} icon={<SaveOutlined />}>
              保存
            </Button>
            {/*<Button icon={<BugFilled />} disabled onClick={()=>message.info("暂未开放")} style={{display: 'none'}}>*/}
            {/*  调试*/}
            {/*</Button>*/}
          </Space.Compact>
        </Space>
        <Space>
          <Button style={{background: 'linear-gradient(135deg, #6a11cb, #2575fc)', color: '#fff',}} onClick={handleAgentPublish}>
            发布
          </Button>
        </Space>
      </div>
      <Splitter className={`flex-grow-1 overflow-hidden`} style={{ }}>
        <Splitter.Panel defaultSize="60%" min="50%" max="100%" style={{ overflow: "auto", padding: "10px 10px 20px 10px"}}>
          <div style={{ display: `${activeSection === 'Skills' ? 'block' : 'none'}`}}>
            <AgentCreateComponent />
          </div>
          <div style={{ display: `${activeSection === 'Configure' ? 'block' : 'none'}` , height: "100%"}}>
            <ConfigureComponent/>
          </div>
        </Splitter.Panel>
        {isVariableShow && <Splitter.Panel
            defaultSize={"30%"}
            style={{
              overflow: 'hidden',
              backgroundColor: 'white',
            }}
        >
          <div style={{ overflow: "hidden", height: "100%"}}>
            <ConfigVariableComponent/>
          </div>
        </Splitter.Panel>}
        <Splitter.Panel defaultSize="40%" style={{ overflow: "hidden", backgroundColor: 'white'}} collapsible={true}>
          <div style={{ overflow: "hidden", height: "100%"}}>
            <EmulatorComponent loading={loading} conversation={conversationDetail} agent={agentDetail}/>
          </div>
        </Splitter.Panel>
      </Splitter>
      <Modal title="调试" width={'100%'} style={{ top: 20 }}
             open={isDebugModalVisible} onCancel={() => setIsDebugModalVisible(false)} footer={null}>
        <AgentDebugComponent />
      </Modal>
    </div>
  );
}

export default AgentWorkspacePage;
