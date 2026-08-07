import { useState, useEffect} from 'react';
import {List, Card, Layout, message, Empty, Tag, Button, Input,
    Image, Alert, Progress, Divider, Space} from 'antd';
import SPLFormComponent from "../SPLFormComponent";
import {
    DeleteOutlined,
    BugTwoTone,
    SettingOutlined
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import './index.css'
import {useAgentSelector} from "../../hooks/agent";
import {AgentSPLFormSection} from "../../types/agentType.ts";
import {ChatMessage, MessageContent} from "../../types/conversationType.ts";
import {generateDebugAnswerStream} from "../../api/sapper/agent.ts";
const { Sider, Content } = Layout;
const { Meta } = Card;

interface DebugChatMessage extends ChatMessage {
    "breakpoint": boolean;
}
const AgentDebugComponent = () => {
  const [isConfigureVisible, setIsConfigureVisible] = useState(false);
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const AIChain = agentDetail?.spl_chain.workflow || []
  const [currentSPLForm, setCurrentSPLForm] = useState(AIChain[0].unit_des || []);
  const [currentIndex, setCurrentIndex] = useState(0); // 默认为第一个元素
  const [messages, setMessages] = useState<DebugChatMessage[]>([{
      "role": "user",
      "contents": [
        { "type": "text", "content": "" }
      ],
      "breakpoint": false
  }]);
  
  useEffect(() => {
    // 当 AIChain 更新时，设置默认的 currentSPLForm 和 currentIndex
    if (AIChain && AIChain.length > 0) {
      const createMessage = (role: "user" | "system", content = ""): DebugChatMessage => ({
          role,
          "contents": [
            { "type": "text", content }
          ],
          "breakpoint": false
      });

     const message = [];
     
     for (let i = 0; i < AIChain.length; i++) {
          message.push(createMessage("user"));
          message.push(createMessage("system"));
     }

     setMessages(message)
      // setCurrentIndex(0);
    }
  }, [AIChain.length]);

  const handleItemClick = (SourcePartial_SplPrompts: AgentSPLFormSection[], index: number) => {
    setCurrentSPLForm(SourcePartial_SplPrompts);
    setCurrentIndex(index);
  };

  const handleGenerateAnswer = async (uuid: string, index: number, data) => {
      const response = await generateDebugAnswerStream(uuid, index, data);

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder("utf-8");  // 用于解码字节为字符串
      let current_content = ''
      let current_result = [{type: 'text', content: ''}]
      let new_item = false
      while (true) {
          const { done, value } = await reader.read();
          if (done) break;  // 如果流结束，退出循环
          const str_chunk = textDecoder.decode(value, { stream: true });
          let chunk_list = str_chunk.split('\n');
          chunk_list = chunk_list.filter(chunk => !/^\s*$/.test(chunk));
          for (let chunk of chunk_list) {
              chunk = chunk.replace('data: ', '')
              try {
                  const parsedData = JSON.parse(chunk);
                  current_result = current_result.filter(chunk => chunk.type !== 'progress');
                  if (parsedData.type === 'image') {
                      // 提取出类似 '[image]: [显示的文本](你的URL)' 中的 URL
                      current_result.push(parsedData);
                      new_item = true;
                  }else if(parsedData.type === 'progress'){
                      current_result = current_result.filter(chunk => chunk.type !== 'progress');
                      current_result.push(parsedData);
                      new_item = true;
                  }else {
                      if(new_item){
                          new_item = false
                          current_content = ''
                          current_result.push({type: 'text', content: ''});
                      }
                      current_content += parsedData.content
                      current_result.pop()
                      current_result.push({type: 'text', content: current_content});
                  }
                  const newMessage = [...messages]
                  newMessage[index*2 + 1].contents = [...current_result]
                  newMessage[index*2 + 2].contents = [...current_result]

                  console.log(current_result)
                  console.log(messages)
                  setMessages(newMessage)
                  // setMessages(prevMessages => {
                  //     prevMessages[index*2 + 1] = {...prevMessages[index*2 + 1], ...current_result}
                  //     prevMessages[index*2 + 2] = {...prevMessages[index*2 + 2], ...current_result, role: 'system'}
                  //     return [...prevMessages];
                  // });
              } catch (error) {
                  // 处理解析错误的情况
                  console.log('error', chunk, error)
              }
          }

      }

  }

  const handleSendMessage = async (query: MessageContent[], index: number, nextFlag = false, proceedFlag = false) => {
    if(query && query[0].content === ""){
        message.info("The query is empty")
        return;
    }

    if(AIChain && AIChain.length === 0){
        message.info("Compile the agent form first.")
        return
    }

    if (agentDetail?.uuid) {
        const queryInput = {message: query}
        let handleNext = (data: MessageContent[]) =>{}
        if((proceedFlag || nextFlag) && index + 1 < AIChain.length ){
            handleNext = (query: MessageContent[]) => {
                // 加上半秒的休眠
                if(proceedFlag && !messages[(index + 1)*2].breakpoint){
                    setTimeout(() => {
                        handleSendMessage(query, index + 1, false, true);
                    }, 500); // 500毫秒后执行
                }else {
                    setCurrentIndex(index + 1);
                }
            };
        }
        await handleGenerateAnswer(agentDetail.uuid, index, queryInput);
    }
  }

  const deleteFileMessage = (index: number) => {
    // 创建一个新数组，其中不包含要删除的文件
    messages[currentIndex*2]['contents'] = messages[currentIndex*2]['contents'].filter((_, idx) => idx !== index);
    setMessages([...messages])
  };

  const renderFileContent = (content: MessageContent, index: number) => {
      switch (content.type) {
          case 'image':
            return <div className="input-image-container">
                        <Image
                            style={{ borderRadius: '10px' }}
                            width={50}
                            src={content.content}
                        />
                        <DeleteOutlined className={`delete-icon`} onClick={() => deleteFileMessage(index)} />
                    </div>;
          // ... 其他类型的内容处理逻辑
          default:
            return null;
      }
  };

  const setInputText = (text: string) => {
      // 先克隆messages数组以避免直接修改状态
      const updatedMessages = [...messages];

      // 获取最后一条消息
      const lastMessage = updatedMessages[currentIndex*2];

      // 检查是否存在最后一条消息及其contents
      if (lastMessage && lastMessage.contents) {
        // 遍历最后一条消息的contents，只修改type为'text'的项目
        lastMessage.contents.forEach(item => {
          if (item.type === 'text') {
            item.content = text; // 在原有的content后追加text
          }
        });
      }
      console.log('updatedMessages', updatedMessages)
      // 更新messages状态
      setMessages(updatedMessages);
  }

  const renderContent = (content: MessageContent, role = '') => {
    switch (content.type) {
        case 'text':
            return role === 'user' ?
                <div style={{ whiteSpace: 'pre-wrap'}}>{content.content}</div> :
                <ReactMarkdown children={content.content}
                    components={{
                        p: ({node, ...props}) => <p style={{ margin: 0 }} {...props} />
                      }}
                />;
        case 'image':
          return <Image src={content.content} />
        case 'video':
          return <video src={content.content} controls />;
        case 'audio':
          return <audio src={content.content} controls />;
        case 'code':
          // 这里您可以使用一个代码高亮库
          return <pre style={{ whiteSpace: 'normal' , backgroundColor: 'red'}} >{content.content}</pre>;
        case 'error':
          return <Alert
                message="Error"
                description={content.content}
                type="error"
                showIcon
          />
        case 'progress':
            return <div style={{padding: '5px'}}><Progress type="circle" percent={parseInt(content.content)} format={(percent) => `${percent}%`} size={35}/></div>
        default:
          return <p>{content.content}</p>;
    }
  };

  const setBreakPoint = (index: number) => {
      const newMessage = [...messages]
      newMessage[index*2].breakpoint = !newMessage[index*2].breakpoint
      setMessages(newMessage)
  }

  return (
  <div>
      <Layout style={{height: `calc(100vh - 150px)`}}>
        <Sider width="120px" theme="light" style={{overflow: "auto", padding: '0 5px 0 5px'}}>
          <List
            dataSource={AIChain}
            renderItem={(item, index) => (
              <List.Item>
                <Card hoverable
                  style={{ backgroundColor: currentIndex === index ? '#e6f7ff' : 'white' }}
                  extra={
                       <Button type="text"
                         onClick={() => setBreakPoint(index)}
                         icon={<BugTwoTone twoToneColor={`${messages[index*2]?.breakpoint && "#eb2f96"}`}/>
                      } title={"设置断点"}/>
                  }
                >
                  <div onClick={() => handleItemClick(item.unit_des, index)}>
                      <Meta
                          title={`步骤 ${index + 1}`}
                      />
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Sider>
        <Content style={{width: `calc(1500px - ${600}px)`, backgroundColor: 'white', position: 'relative', height: '100%', paddingTop: '20px'}}>
          {AIChain && AIChain.length > 0 ?
          <>
          <div style={{ overflowY: "auto", height: `calc(100% - 20px)`, padding: '0 10px 0 10px'}}> {/* 添加一个容器以及适当的外边距 */}
            <SPLFormComponent splForm={currentSPLForm}/>
          </div>
          </> : <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                style={{ height: 60 }}
                description={<span>Click <b>'Compile'</b> to process the agent form and obtain the AI chain.</span>}
              />}
        </Content>

        <Content style={{width: '500px', backgroundColor: 'whitesmoke', position: 'relative', height: '100%', padding: '25px 10px 0 10px'}}>
          { !isConfigureVisible ?<>
            <Space.Compact>
              <Button icon={<SettingOutlined/>} onClick={()=>setIsConfigureVisible(!isConfigureVisible)}/>
              <Button onClick={() => handleSendMessage(messages[currentIndex*2]['contents'], currentIndex, true)}>下一步</Button>
              <Button onClick={() => handleSendMessage(messages[currentIndex*2]['contents'], currentIndex, false, true)}>下一个断点</Button>
            </Space.Compact>
            <div style={{backgroundColor: "#f0f0f0"}}>
              <Divider orientation="left" orientationMargin="0" style={{margin: "0"}}>
                <Tag bordered={false} color="blue">输入</Tag>
              </Divider>
              <div className={`d-flex w-100`}>
                {messages[currentIndex*2]['contents']?.map((fileContent, index) => (
                    <div key={index}>{renderFileContent(fileContent, index)}</div>
                ))}
              </div>
              {/* 文本输入区 */}
              <Input.TextArea
                placeholder="Enter your question here and press Shift+Enter to send it, Enter to add a new line"
                value={
                  messages[currentIndex*2]['contents']
                    .find(content => content.type === 'text')?.content
                }
                variant={"borderless"}
                autoSize={{ maxRows: 5, minRows: 5 }}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        setInputText(messages[currentIndex*2]['contents']
                    .find(content => content.type === 'text')?.content + '\n');
                    } else if (e.key === "Enter" && e.shiftKey) {
                        e.preventDefault();
                        await handleSendMessage(messages[currentIndex*2]['contents'], currentIndex)
                    }
                }}
              />
              <div className="d-flex w-100" style={{padding:"5px"}}>
                <Space.Compact>
                    <Button onClick={() => handleSendMessage(messages[currentIndex*2]['contents'], currentIndex)}>生成</Button>
                </Space.Compact>
              </div>
            </div>
            <Divider orientation="left" orientationMargin="0" style={{margin: "0"}}>
                <Tag bordered={false} color="blue">输出</Tag>
            </Divider>
            <div style={{overflowY: 'auto', height: `calc(100% - 250px)`, backgroundColor: "#f0f0f0"}}>
              {messages[currentIndex*2 + 1]?.contents.map((content, contentIndex) => (
                <div key={contentIndex}>{renderContent(content)}</div>
              ))}
            </div>
          </> : <div/>}
        </Content>
      </Layout>
  </div>
);
};

export default AgentDebugComponent;
