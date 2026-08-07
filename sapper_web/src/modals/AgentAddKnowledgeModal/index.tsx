import React, { useEffect, useState } from "react";
import {Modal, Card, Avatar, Row, Col, Divider, Tooltip, Button, Tag} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useKnowledgeBaseSelector } from "../../hooks/knowledgeBase";
import { useAgentSelector, useDispatchAgent } from "../../hooks/agent";
import { KnowledgeBaseRes } from "../../types/knowledgeBaseType";

const AgentAddKnowledgeModal = () => {
  const agentDispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const knowledgeBases = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBases);
  const [visible, setVisible] = useState(false);
  const [agentKnowledgeBase, setAgentKnowledgeBase] = useState<KnowledgeBaseRes[]>([]);  // 更新为类型化

  // Update agentKnowledgeBase when agentDetail changes
  useEffect(() => {
    if (agentDetail?.knowledge_bases) {
      setAgentKnowledgeBase(agentDetail.knowledge_bases);
    }
  }, [agentDetail?.knowledge_bases]);

  // Open and close modal
  const onClose = () => setVisible(false);
  const onOpen = () => setVisible(true);

  // Select or deselect knowledge base
  const handleSelect = (knowledge: KnowledgeBaseRes) => {
    if (agentKnowledgeBase.some((item) => item.uuid === knowledge.uuid)) {
      setAgentKnowledgeBase(agentKnowledgeBase.filter((item) => item.uuid !== knowledge.uuid));
    } else {
      setAgentKnowledgeBase([...agentKnowledgeBase, knowledge]);
    }
  };

  // Delete selected knowledge base
  const handleDelete = (uuid: string) => {
    setAgentKnowledgeBase(agentKnowledgeBase.filter((selected) => selected.uuid !== uuid));
  };

  // Confirm the selected knowledge bases
  const handleOk = () => {
    if(agentDetail)
      agentDispatch.resetKnowledgeBases(agentDetail.uuid, agentKnowledgeBase);
    onClose();
  };

  // Available knowledge bases that are not selected yet
  const availableKnowledgeBases = knowledgeBases.items.filter(
      (knowledge) => !agentKnowledgeBase.some((item) => item.uuid === knowledge.uuid)
  );

  return (
      <>
        <Button size="small" icon={<PlusOutlined />} onClick={onOpen}>
          选择
        </Button>

        <Modal
            title="选择知识库"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            width="70%"
        >
          <div style={{ height: "65vh", overflowY: "auto", padding: "0 10px" }}>
            <Row gutter={[16, 16]}>
              {agentKnowledgeBase.map((knowledge) => (
                  <Col span={8} key={knowledge.uuid}>
                    <Card style={{ marginBottom: 16, border: "2px solid #1890ff" }}>
                      <Card.Meta avatar={<Avatar src={knowledge.cover_image} />} title={knowledge.name} />
                      <Button
                          type="text"
                          style={{ float: "right" }}
                          onClick={() => handleDelete(knowledge.uuid)}
                      >
                        <DeleteOutlined />
                      </Button>
                    </Card>
                  </Col>
              ))}
            </Row>
            <Divider orientation="left" orientationMargin="0">
              <Tag bordered={false} color="blue">请在下方选择要关联的知识库</Tag>
            </Divider>
            <Row gutter={[16, 16]}>
              {availableKnowledgeBases.map((knowledge) => (
                  <Col span={8} key={knowledge.uuid}>
                    <Tooltip title="选择该经验库">
                      <Card hoverable onClick={() => handleSelect(knowledge)}>
                        <Card.Meta
                            avatar={<Avatar src={knowledge.cover_image} />}
                            title={knowledge.name}
                            description={`@ ${knowledge.embedding_model}`}
                        />
                      </Card>
                    </Tooltip>
                  </Col>
              ))}
            </Row>
          </div>
        </Modal>
      </>
  );
};

export default AgentAddKnowledgeModal;
