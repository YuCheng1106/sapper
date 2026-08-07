import { useState, useEffect} from 'react';
import {
  Layout,
  Menu,
  Button,
  Tabs,
} from 'antd';
import { FolderOutlined, FileTextOutlined, LeftOutlined } from '@ant-design/icons';
import './index.css';
import { useLocation, useNavigate } from "react-router-dom";
import {useDispatchKnowledgeBase, useKnowledgeBaseSelector} from "../../hooks/knowledgeBase";
import {KnowledgeSearchComponent, KnowledgeDisplayComponent, KnowledgeConfigComponent} from "../../components";
import CollectionDisplayComponent from "../../components/CollectionDisplayComponent";
const {  Sider } = Layout;
const { TabPane } = Tabs;

const KnowledgeBaseWorkspacePage = () => {
  const dispatch = useDispatchKnowledgeBase();
  const knowledgeBaseDetail = useKnowledgeBaseSelector((state) => state.knowledgeBase.knowledgeBaseDetail);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('collection');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('currentTab') || 'collection';
    setActiveTab(currentTab);
  }, [location.search]);

  useEffect(() => {
    const lastPartOfPath = location.pathname.split("/").pop()
    if (lastPartOfPath)
      dispatch.getKnowledgeBaseDetail(lastPartOfPath);
    return () => {
      dispatch.resetKnowledgeBase();
    };
  }, [location.pathname]);

  const [selectedCollection, setSelectedCollection] = useState<number>(-1)
  const handleTabChange = async (key: string, collection_id?: number) => {
    setActiveTab(key);
    if(collection_id)
      setSelectedCollection(collection_id);
  };

  return (
    <Layout className="experience-base-page">
      <Sider className="sidebar" theme="light">
        <div className="back-button">
          <Button icon={<LeftOutlined />} onClick={() => navigate('/workspace/knowledge')}>全部知识库</Button>
        </div>
        <div className="exbase-info">
          <h5>{knowledgeBaseDetail ? knowledgeBaseDetail.name : '加载中...'}</h5>
        </div>
        <Menu mode="inline" selectedKeys={[activeTab]}>
          <Menu.Item key="collection" icon={<FileTextOutlined />} onClick={() => handleTabChange('collection')}>
            数据集
          </Menu.Item>
          <Menu.Item disabled key="search" icon={<FolderOutlined />} onClick={() => handleTabChange('search')}>
            搜索测试
          </Menu.Item>
          <Menu.Item key="config" icon={<FileTextOutlined />} onClick={() => handleTabChange('config')}>
            配置
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="experience-content-layout">
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="experience-tabs" tabBarStyle={{ margin: 0, padding: 0, height: '0' }}>
          <TabPane key="collection">
            <KnowledgeDisplayComponent onTabChange={handleTabChange} />
          </TabPane>
          <TabPane key="search">
            <KnowledgeSearchComponent/>
          </TabPane>
          <TabPane key="config">
            <KnowledgeConfigComponent/>
          </TabPane>
          <TabPane key="text_block">
            <CollectionDisplayComponent onTabChange={handleTabChange} text_collection_id={selectedCollection}/>
          </TabPane>
        </Tabs>
      </Layout>

    </Layout>
  );
};

export default KnowledgeBaseWorkspacePage;
