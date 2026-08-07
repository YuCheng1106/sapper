import React, {useEffect, useState} from 'react';
import {Form, Input, Tooltip, Button, Upload, Image, message} from 'antd';
import {MinusOutlined, PlusOutlined, LoadingOutlined, UploadOutlined} from '@ant-design/icons';
import { useAgentSelector, useDispatchAgent } from '../../hooks/agent';
import {AgentDetail} from "../../types/agentType.ts";
import {uploadFile} from "../../api/upload";

const { Item } = Form;
const { TextArea } = Input;

const ConfigureComponent = () => {
    const [form] = Form.useForm();
    const agentDispatch = useDispatchAgent();
    const agentDetail = useAgentSelector((state) => state.agent.agentDetail);
    const [uploading, setUploading] = useState(false);

    // 初始化表单数据
    useEffect(() => {
        if (agentDetail) {
            form.setFieldsValue({
                name: agentDetail.name,
                cover_image: agentDetail.cover_image,
                description: agentDetail.description,
                welcome_info: agentDetail.welcome_info,
                sample_query: agentDetail.sample_query || [],
            });
        }
    }, [agentDetail, form]);

    // 处理表单项变化
    const onValuesChange = (changedValues: Partial<AgentDetail>) => {
        if(changedValues.cover_image) {return}
        agentDispatch.setAgentPartialInfo(changedValues);
    };

    const handleImageUpload = async ({ file }: {file: string | Blob}) => {
        setUploading(true);
        try {
            const image = await uploadFile(file);
            if (image?.url) {
                form.setFieldsValue({ cover_image: image?.url });
                agentDispatch.setAgentPartialInfo({cover_image: image?.url});
                message.success('头像上传成功');
            } else {
                message.error('头像上传失败');
            }
        } catch {
            message.error('头像上传过程中发生错误');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Form
            form={form}
            onValuesChange={onValuesChange}
            initialValues={{
                name: '',
                cover_image: '',
                description: '',
                welcome_info: '',
                sample_query: [],
            }}
            style={{ flex: '1' , minWidth: '300px', height: '100%', overflowY: 'auto', padding: '10px'}}
        >
            <Item name="name" label={'名称'}>
                <Input />
            </Item>
            <Item name="cover_image" label={'图片'}>
                <Upload
                    name="cover_image"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                >
                    {form.getFieldValue('cover_image') ? (
                        <Image preview={false} src={`${form.getFieldValue('cover_image')}`} alt="avatar" style={{ width: '100%' }} />
                    ) : (
                        <div>
                            {uploading ? <LoadingOutlined /> : <UploadOutlined />}
                            <div style={{ marginTop: 8 }}>上传头像</div>
                        </div>
                    )}
                </Upload>
            </Item>
            <Item name="description" label={"介绍"}>
                <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
            </Item>
            <div style={{ paddingTop: '10px', display: 'none'}}>
                <div>
                    使用示例
                </div>
                <Form.List name="sample_query">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Item {...restField} name={[name]}>
                                    <div key={key} style={{display: 'flex', alignItems: 'center'}}>
                                        <TextArea
                                            autoSize={{maxRows: 2, minRows: 1}}
                                        />
                                        <Tooltip title={'Remove Item'}>
                                            <Button type="text" icon={<MinusOutlined/>} onClick={() => remove(name)}/>
                                        </Tooltip>
                                    </div>
                                </Item>
                            ))}
                            <Tooltip title={'Add Item'}>
                                <Button type="text" icon={<PlusOutlined />} onClick={() => add('')} />
                            </Tooltip>
                        </>
                    )}
                </Form.List>
            </div>
        </Form>
    );
};

export default ConfigureComponent;