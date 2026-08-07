import React, {useEffect, useState} from 'react';
import {Modal, Button, Segmented, Tooltip, Tag, Divider, Radio} from 'antd';
import {handleCopyToClipboard} from "../../utils/tool.ts";
import {useContext} from "react";
import {AgentCreateContext} from "../../contexts/AgentCreateContext";
import PluginFormComponent from "../../components/PluginFormComponent";

const AgentDeployModal = ({ visible, onClose, agentData, disable=false}) => {
  const agentApiBaseUrl = import.meta.env.VITE_AGENT_API_BASE_URL || 'http://localhost:8007/api/v1/sapper/sapperchain/api/'
  const {embedAgentData, state, updateAgentServer} = useContext(AgentCreateContext);
  const [publish, setPublish] = useState(agentData.publish)
  useEffect(()=>{
      setPublish(agentData.publish)
  }, [agentData])

  const handleAgentPublish =() =>{
      if(!disable){
          updateAgentServer(JSON.stringify({publish: publish}), agentData.uuid)
      }

      onClose()
  }

  const initAPIData = {
    uuid: agentData.uuid,
    WorkName: agentData.name,
    Description: agentData.description,
    Type: "URL_API",
    Server_Url: `${agentApiBaseUrl}${agentData.uuid}`,
    Content_Type: 'application/json',
    Authorization: "",
    ReturnValue_Type: "Text",
    Parse_Path: ["data"],
    API_Parameter: {"content": "${UserRequest}$"}
  }
  const [APIData, setAPIData] = useState(initAPIData)
  useEffect(() => {
      let newAPIData = {
        uuid: agentData.uuid,
        WorkName: agentData.name,
        Description: agentData.description,
        Type: "URL_API",
        Server_Url: `${agentApiBaseUrl}${agentData.uuid}`,
        Content_Type: 'application/json',
        Authorization: "",
        ReturnValue_Type: "Text",
        Parse_Path: ["data"],
        API_Parameter: {"content": "${UserRequest}$"}
      }
      let newAPIParam = {query: "${query}$"}
      const agentParam = JSON.parse(agentData.parameter || "{}")
      Object.keys(agentParam).forEach((key)=>{
          newAPIParam[key] = `\$\{${key}\}\$`
      })
      newAPIData.API_Parameter = newAPIParam
      setAPIData(newAPIData)
  }, [agentData]);
  return (
    <Modal
      title="部署成插件"
      open={visible}
      width='90%'
      onCancel={onClose}
      footer={[
        <Button key="ok" type="primary" onClick={handleAgentPublish}>
          Ok
        </Button>
      ]}
    >
     <div style={{height: '80vh'}}>
         {!disable && <Divider orientation="left" orientationMargin="0">
             <Tag bordered={false} color="blue">发布为可访问的插件</Tag>
         </Divider>}
         {!disable && <Radio checked={publish} onClick={() => setPublish(!publish)}>发布</Radio>}
         <div style={{overflowY: "auto", height: 'calc(100% - 50px)'}}>
             <PluginFormComponent APIData={APIData} handleChange={() =>{}} />
             <Divider orientation="left" orientationMargin="0">
                <Tag bordered={false} color="blue">使用示例</Tag>
             </Divider>
             <Segmented
                options={[
                  { value: 'Web', label: 'Web' },
                  { value: 'WeChat', label: 'WeChat' },
                  { value: 'Robot', label: 'Robot' }
                ]}
                defaultValue="Web"
                onChange={(value) => embedAgentData(value, agentData)}
                size={"small"}
             /><Tooltip placement="rightTop" title={"copy"}>
                <i className="fa fa-clone Icon" onClick={() => handleCopyToClipboard(state.embedCode)} style={{paddingLeft: '5px'}}>
                </i>
              </Tooltip>
             {(publish || disable)&& <div>
                  <pre style={{maxHeight: `calc(80vh - 255px)`, overflowY: "auto"}}>
                    <code>
                      {state.embedCode}
                    </code>
                  </pre>
             </div>}
         </div>
     </div>
    </Modal>
  );
};

export default AgentDeployModal;
