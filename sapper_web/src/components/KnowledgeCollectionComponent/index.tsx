import {useState} from 'react';
import { Input, Button, Layout, Tabs} from 'antd';
import {
    FileTextOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { useKnowledgeBaseSelector } from "../../hooks/knowledgeBase.ts";
import TextCollectionComponent from "./TextCollectionComponent";
import GraphCollectionComponent from "./GraphCollectionComponent";
import './index.css'
import {CollectionCreateModal, GraphCollectionCreateModal, TextCollectionCreateModal} from "../../modals";
const { Header, Content } = Layout;
const { TabPane } = Tabs;

type TabKey = 'collections' | 'graphs';

const KnowledgeCollectionComponent = ({onTabChange}: {onTabChange: (tab: string) => void}) => {
    // State management
    const knowledgeBaseDetail = useKnowledgeBaseSelector(
        (state) => state.knowledgeBase.knowledgeBaseDetail
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('collections');
    const [isCollectionCreateModalOpen, setIsCollectionCreateModalOpen] = useState(false);
    const [isGraphCollectionCreateModalOpen, setIsGraphCollectionCreateModalOpen] = useState(false);
    const [isTextCollectionCreateModalOpen, setIsTextCollectionCreateModalOpen] = useState(false);

    const handleCollectionTypeSelected = (tab_key: string) => {
        if(tab_key === 'graphs') {
            setIsGraphCollectionCreateModalOpen(true);
        }
        if(tab_key === 'files') {
            setIsTextCollectionCreateModalOpen(true);
        }
    }
    // Event handlers
    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key as TabKey);
    };

    const handleUploadClick = () => {
        setIsCollectionCreateModalOpen(true);
    };

    return (
        <Layout className="knowledge-collection-container">
            <Header className="collection-header">
                <div >
                    <div className="title-section">
                        <h2 className="header-title">
                            知识库管理
                        </h2>
                        {/*<span className="file-count">*/}
                        {/*  <FileTextOutlined /> 文档: {collectionCount} | 图谱: {graphCount}*/}
                        {/*</span>*/}
                    </div>

                    <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}}>
                        <Input.Search
                            placeholder="搜索文档或图谱..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="search-input"
                            allowClear
                            enterButton
                        />

                        <div>
                            <Button
                                type="primary"
                                icon={<ShareAltOutlined />}
                                onClick={handleUploadClick}
                            >
                                新建上传
                            </Button>
                        </div>
                    </div>
                </div>
            </Header>

            <Content className="collection-content" style={{height: '100vh - 200px'}}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    className="collection-tabs"
                >
                    <TabPane
                        tab={
                            <span>
                                <FileTextOutlined />
                                文档集合
                              </span>
                        }
                        key="collections"
                    >
                        {knowledgeBaseDetail && <TextCollectionComponent searchTerm={searchTerm} knowledge_base_uuid={knowledgeBaseDetail?.uuid} onTabChange={onTabChange} />}
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <ShareAltOutlined />
                                知识图谱
                              </span>
                        }
                        key="graphs"
                    >
                        {knowledgeBaseDetail && <GraphCollectionComponent searchTerm={searchTerm} knowledge_base_uuid={knowledgeBaseDetail?.uuid}/> }
                    </TabPane>
                </Tabs>
            </Content>

            <CollectionCreateModal visible={isCollectionCreateModalOpen} onClose={() => setIsCollectionCreateModalOpen(false)} onOk={handleCollectionTypeSelected} />
            {knowledgeBaseDetail && <GraphCollectionCreateModal visible={isGraphCollectionCreateModalOpen} onClose={() => setIsGraphCollectionCreateModalOpen(false)} knowledge_base_uuid={knowledgeBaseDetail?.uuid} />}
            {knowledgeBaseDetail && <TextCollectionCreateModal visible={isTextCollectionCreateModalOpen} onClose={() => setIsTextCollectionCreateModalOpen(false)} knowledge_base_uuid={knowledgeBaseDetail?.uuid} />}
        </Layout>
    );
};

export default KnowledgeCollectionComponent;