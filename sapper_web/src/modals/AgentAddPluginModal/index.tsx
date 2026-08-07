import { useEffect, useState } from "react";
import {Modal, Card,  Row, Col, Divider, Tooltip, Button, Tag} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { usePluginSelector } from "../../hooks/plugin";
import { useAgentSelector, useDispatchAgent } from "../../hooks/agent";
import { PluginRes } from "../../types/pluginType";

const AgentAddPluginModal = () => {
  const agentDispatch = useDispatchAgent();
  const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
  const plugins = usePluginSelector((state) => state.plugin.plugins);
  const publicPlugins = usePluginSelector((state) => state.plugin.publicPlugins);
  const [visible, setVisible] = useState(false);
  const [agentPlugin, setAgentPlugin] = useState<PluginRes[]>([]);  // 更新为类型化

  // Update agentPlugin when agentDetail changes
  useEffect(() => {
    if (agentDetail?.plugins) {
      setAgentPlugin(agentDetail.plugins);
    }
  }, [agentDetail?.plugins]);

  // Open and close modal
  const onClose = () => setVisible(false);
  const onOpen = () => setVisible(true);

  // Select or deselect plugin
  const handleSelect = (plugin: PluginRes) => {
    if (agentPlugin.some((item) => item.uuid === plugin.uuid)) {
      setAgentPlugin(agentPlugin.filter((item) => item.uuid !== plugin.uuid));
    } else {
      setAgentPlugin([...agentPlugin, plugin]);
    }
  };

  // Delete selected plugin
  const handleDelete = (uuid: string) => {
    setAgentPlugin(agentPlugin.filter((selected) => selected.uuid !== uuid));
  };

  // Confirm the selected plugins
  const handleOk = () => {
    console.log("Selected Plugins:", agentPlugin);
    if(agentDetail)
      agentDispatch.resetPlugins(agentDetail.uuid, agentPlugin)
    onClose();
  };

  const handleCancel = () => {
    setAgentPlugin([])
    onClose();
  };

  // Available plugins that are not selected yet
  const allPlugins = [...plugins.items, ...publicPlugins.items];
  console.log("publicPlugins.items]", publicPlugins.items);
  const uniquePlugins = allPlugins.filter((plugin, index, array) =>
      array.findIndex(p => p.uuid === plugin.uuid) === index
  );

  const availablePlugins = uniquePlugins.filter(plugin =>
      !agentPlugin.some(item => item.uuid === plugin.uuid)
  );

  return (
      <>
        <Button size="small" icon={<PlusOutlined />} onClick={onOpen}>
          选择
        </Button>

        <Modal
            title="选择插件"
            open={visible}
            onCancel={handleCancel}
            onOk={handleOk}
            width="70%"
        >
          <div style={{ height: "65vh", overflowY: "auto", padding: "0 10px" }}>
            <Row gutter={[16, 16]}>
              {agentPlugin.map((plugin) => (
                  <Col span={8} key={plugin.uuid}>
                    <Card size={"small"} style={{ marginBottom: 16, border: "2px solid #1890ff" }}>
                      <Card.Meta
                          className="description"
                          title={plugin.name}
                          description={plugin.description}
                      />
                      <Button
                          type="text"
                          style={{ float: "right" }}
                          onClick={() => handleDelete(plugin.uuid)}
                      >
                        <DeleteOutlined />
                      </Button>
                    </Card>
                  </Col>
              ))}
            </Row>
            <Divider orientation="left" orientationMargin="0">
              <Tag bordered={false} color="blue">请在下方选择要调用的插件</Tag>
            </Divider>
            <Row gutter={[16, 16]}>
              {availablePlugins.map((plugin) => (
                  <Col span={8} key={plugin.uuid}>
                    <Tooltip title="选择该插件">
                      <Card size={"small"} hoverable onClick={() => handleSelect(plugin)}>
                        <Card.Meta
                            className="description"
                            title={plugin.name}
                            description={plugin.description}
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

export default AgentAddPluginModal;
