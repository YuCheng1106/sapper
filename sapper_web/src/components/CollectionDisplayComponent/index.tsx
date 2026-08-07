import {useEffect, useState} from 'react';
import {Layout, Button, Input, Card, Row, Col, Typography, Modal, message, Pagination} from 'antd';
import {
  LeftOutlined,
  FileTextOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {useCollectionSelector} from "../../hooks/collection";
import {useDispatchTextBlock, useTextBlockSelector} from "../../hooks/textBlock.ts";
import './index.css';
import {TextBlockCreateModal, TextBlockEditModal} from "../../modals";

const { Header, Content } = Layout;
const { Text, Paragraph } = Typography;

const CollectionDisplayComponent = ({ onTabChange, text_collection_id}: {onTabChange: (tab: string) => void, text_collection_id: number}) => {
  const collectionDetail = useCollectionSelector((state) => state.collection.collectionDetail);
  const textBlocks = useTextBlockSelector((state) => state.textBlock.textBlocks);
  const dispatchTextBlock = useDispatchTextBlock();
  const [searchTerm, setSearchTerm] = useState("");
  const [isTextBlockEditOpen, setIsTextBlockEditOpen] = useState(false);
  const [isTextBlockCreateOpen, setIsTextBlockCreateOpen] = useState(false);
  const [selectedTextBlock, setSelectedTextBlock] = useState<number>(-1);
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
  });

  useEffect(() => {
    dispatchTextBlock.getTextBlockList({
      page: pagination.current,
      size: pagination.pageSize,
      content: searchTerm,
      text_collection_id: text_collection_id
    });
    return () => {
      dispatchTextBlock.resetTextBlock()
    };
  }, [pagination.current, pagination.pageSize, text_collection_id, searchTerm]);

  const handleEmbedDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个嵌入数据吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await dispatchTextBlock.removeTextBlock(id);
        message.success('删除成功');
        await dispatchTextBlock.getTextBlockList({
          page: pagination.current,
          size: pagination.pageSize,
          content: searchTerm,
          text_collection_id: text_collection_id
        });
      }
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  const handleTextBlockCreate = () => {
    dispatchTextBlock.getTextBlockList({
      page: pagination.current,
      size: pagination.pageSize,
      content: searchTerm,
      text_collection_id: text_collection_id
    });
  }
  const handleTextBlockEditOpen = async (text_block_id: number) => {
    await dispatchTextBlock.getTextBlockDetail(text_block_id);
    setSelectedTextBlock(text_block_id);
    setIsTextBlockEditOpen(true);
  };

  return (
    <Layout className="file-edit-page">
      <Header className="file-edit-header">
        <div className="header-left">
          <Button icon={<LeftOutlined />} onClick={() => onTabChange("collection")} />
          <div className="header-info">
            <Text strong><FileTextOutlined /> {`${collectionDetail?.name}`}</Text>
            <Text style={{ marginLeft: 16 }}>{`共 ${textBlocks.total} 组`}</Text>
          </div>
        </div>
        <div className="header-right">
          <Input.Search
            placeholder="搜索相关数据"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type={"primary"} style={{ marginLeft: 16 }} onClick={() => setIsTextBlockCreateOpen(true)}>插入</Button>
        </div>
      </Header>

      <Content className="file-edit-content" style={{overflowY: "auto", height: 'calc(100vh - 120px)'}}>
        <Row gutter={[16, 16]}>
          {textBlocks.items.map((item, index) => (
              <Col span={6} key={index}>
                <Card
                    style={{backgroundColor: "#f6f8f9"}}
                    size={"small"}
                    title={`#${index}`}
                    extra={<Button type="text" icon={<DeleteOutlined/>} onClick={async (e) => {
                      e.preventDefault()
                      await handleEmbedDelete(item.id)
                    }}/>}
                    hoverable={true}
                >
                  <Paragraph ellipsis={{rows: 6, expandable: false}} style={{height: "130px"}} onClick={() => handleTextBlockEditOpen(item.id)}>
                    {item.content}
                  </Paragraph>
                </Card>
              </Col>
          ))}
        </Row>
        <div style={{
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px'
        }}>
          <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={textBlocks.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              pageSizeOptions={['12', '24', '36', '48']}
          />
        </div>
      </Content>
      <TextBlockEditModal
        open={isTextBlockEditOpen}
        text_block_id={selectedTextBlock}
        onCancel={() => setIsTextBlockEditOpen(false)}
      />
      {collectionDetail && <TextBlockCreateModal
          open={isTextBlockCreateOpen}
          collection_id={collectionDetail.id}
          onCancel={() => setIsTextBlockCreateOpen(false)}
          onSuccess={handleTextBlockCreate}
      />}
    </Layout>
  );
};

export default CollectionDisplayComponent;
