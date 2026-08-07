import React, { useState, useEffect } from 'react';
import { Layout, Menu, Modal, Form, Input, Button, Typography, Row, Col, Tabs, Card } from 'antd';
import { BarChartOutlined, FileSearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { Sider, Content } = Layout;
const { TabPane } = Tabs;

/*
currentCollection.data = {
main: "",
supplementary: "",
index: [],
}
*/

const CollectionEditModal = ({ visible, onClose, onOk, currentName, currentItem }) => {
  const [mainContent, setMainContent] = useState('');
  const [supplementaryContent, setSupplementaryContent] = useState('');
  const [customIndices, setCustomIndices] = useState([]);
  const [currentTab, setCurrentTab] = useState('1');

  useEffect(() => {
    if (currentItem) {
      setMainContent(currentItem.content);
      setSupplementaryContent(currentItem.index);
      // setCustomIndices(currentItem.index || []);
    }
  }, [currentItem]);

  const handleConfirm = () => {
    onOk({
      index: supplementaryContent,
      data: mainContent
    });
  };

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  const handleAddIndex = () => {
    setCustomIndices([...customIndices, '']);
  };

  const handleDeleteIndex = (index) => {
    setCustomIndices(customIndices.filter((_, idx) => idx !== index));
  };

  const handleIndexChange = (value, index) => {
    const updatedIndices = [...customIndices];
    updatedIndices[index] = value;
    setCustomIndices(updatedIndices);
  };

  return (
    <Modal
      title={<Typography.Link href="#" style={{ color: 'black' }}>
              <FileSearchOutlined style={{ marginRight: '8px' }} />
                {currentName}
            </Typography.Link>}
      open={visible}
      onCancel={onClose}
      maskClosable={false}
      style={{ top: "10vh" }}
      width={"60%"}
      footer={[
        <Button key="back" onClick={onClose}>
          关闭
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm}>
          确认更新
        </Button>,
      ]}
    >
      <Layout style={{ minHeight: '70vh' }}>
        <Sider width={200} style={{borderRight: "1px solid gray"}}>
          <Menu
            mode="inline"
            defaultSelectedKeys={[currentTab]}
            selectedKeys={[currentTab]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" onClick={() => setCurrentTab('1')} icon={<BarChartOutlined />}>
              数据内容
            </Menu.Item>
            {/*<Menu.Item key="2" onClick={() => setCurrentTab('2')} icon={<FileSearchOutlined />}>*/}
            {/*  数据索引 ({customIndices.length})*/}
            {/*</Menu.Item>*/}
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ padding: '12px', margin: 0, minHeight: 280, background: '#fff' }}>
            <Tabs className={"experience-tabs"} activeKey={currentTab} onChange={handleTabChange}>
              <TabPane key="1">
                <Form layout="vertical" style={{ height: "65vh", overflowY: "auto", overflowX: "hidden", padding: "0 15px" }}>
                  <Row gutter={24}>
                    {/*<Col span={12}>*/}
                    {/*  <Form.Item*/}
                    {/*    label={<Text strong>搜索索引</Text>}*/}
                    {/*    tooltip="搜索索引"*/}
                    {/*    style={{ marginBottom: '24px' }}*/}
                    {/*  >*/}
                    {/*    <TextArea*/}
                    {/*      rows={15}*/}
                    {/*      value={supplementaryContent}*/}
                    {/*      onChange={(e) => setSupplementaryContent(e.target.value)}*/}
                    {/*    />*/}
                    {/*  </Form.Item>*/}
                    {/*</Col>*/}
                    <Col span={24}>
                      <Form.Item
                        label={<Text strong>主要内容</Text>}
                        tooltip="主要内容"
                        style={{ marginBottom: '24px' }}
                      >
                        <TextArea
                          rows={15}
                          value={mainContent}
                          onChange={(e) => setMainContent(e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              {/*<TabPane key="2">*/}
              {/*  <div style={{ padding: '24px' }}>*/}
              {/*    <Row gutter={16}>*/}
              {/*      <Col span={12}>*/}
              {/*        <Card title="默认索引" bordered={false} style={{ backgroundColor: '#f0f5ff' }}>*/}
              {/*          <Typography.Link>默认索引</Typography.Link>*/}
              {/*          <p>无法编辑，默认索引会使用【相关数据内容】与【辅助数据】的文本直接生成索引。</p>*/}
              {/*        </Card>*/}
              {/*      </Col>*/}
              {/*      {customIndices.map((item, idx) => (*/}
              {/*        <Col span={12} key={idx}>*/}
              {/*          <Card*/}
              {/*            title={`自定义索引${idx + 1}`}*/}
              {/*            bordered={false}*/}
              {/*            size={"small"}*/}
              {/*            extra={<Button icon={<DeleteOutlined />} onClick={() => handleDeleteIndex(idx)} />}*/}
              {/*          >*/}
              {/*            <TextArea*/}
              {/*              rows={5}*/}
              {/*              placeholder="输入索引文本内容"*/}
              {/*              value={item}*/}
              {/*              onChange={(e) => handleIndexChange(e.target.value, idx)}*/}
              {/*            />*/}
              {/*          </Card>*/}
              {/*        </Col>*/}
              {/*      ))}*/}
              {/*    </Row>*/}
              {/*    <Button type="dashed" style={{ width: '100%', marginTop: '24px' }} onClick={handleAddIndex}>*/}
              {/*      <PlusOutlined /> 新增自定义索引*/}
              {/*    </Button>*/}
              {/*  </div>*/}
              {/*</TabPane>*/}
            </Tabs>
          </Content>
        </Layout>
      </Layout>
    </Modal>
  );
};

export default CollectionEditModal;
