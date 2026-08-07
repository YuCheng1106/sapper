import { useState } from 'react';
import {Input, Button, Select, List, Slider, Row, Col, InputNumber, Divider, Tag} from 'antd';


const { Option } = Select;

const KnowledgeSearchComponent = () => {
    const [inputValue, setInputValue] = useState('');
    const [testHistory, setTestHistory] = useState([]);
    const [searchEmbeddings, setSearchEmbeddings] = useState([]);

    const handleTest = async () => {
        if (inputValue.trim() !== '') {
            const sortedEmbeddings = await fetchEmbeddingsByQuery(currentExbase.uuid, inputValue, topK);
            setSearchEmbeddings(sortedEmbeddings);
            const newEntry = { text: inputValue, time: new Date().toLocaleTimeString() };
            setTestHistory([...testHistory, newEntry]);
        }
    };

    const [topK, setTopK] = useState(3);

    const onChange = (newValue) => {
        setTopK(newValue);
    };

    return (
        <div style={{ display: 'flex', padding: '20px', height: "calc(100vh - 40px)" }}>
            {/* 左边 固定 width 400px */}
            <div style={{ width: '400px', marginRight: '20px', height: "calc(100% - 20px)" }}>
                <div style={{height: '100%'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <Select defaultValue="" style={{ width: '150px' }}>
                            <Option value="">单个文本测试</Option>
                        </Select>
                        <div>
                            <Tag>语义检索</Tag>
                            <Button type="primary" onClick={handleTest} style={{marginLeft: "10px"}} >
                                测试
                            </Button>
                        </div>

                    </div>
                    <Divider orientation="left">TopK</Divider>
                    <Row>
                        <Col span={13}>
                            <Slider
                                min={1}
                                max={20}
                                onChange={onChange}
                                value={topK}
                            />
                        </Col>
                        <Col span={3}>
                            <InputNumber
                                min={1}
                                max={20}
                                style={{ margin: '0 16px' }}
                                value={topK}
                                onChange={onChange}
                            />
                        </Col>
                    </Row>
                    <Input.TextArea
                        placeholder="输入需要测试的文本"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{ borderRadius: '4px', height: 'calc(100% - 100px)', flex: 1 , resize: 'none'}}
                    />
                </div>
            </div>


            {/* 右边 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px dashed #e8e8e8' }}>
                {/*<Tag style={{ margin: "10px 0" }}>测试结果</Tag>*/}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <List
                        itemLayout="vertical"
                        size="large"
                        dataSource={searchEmbeddings}
                        renderItem={item => (
                            <List.Item key={item.uuid}>
                                {item.data}
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default KnowledgeSearchComponent;
