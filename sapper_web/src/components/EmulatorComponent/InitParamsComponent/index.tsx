import { useState, useEffect } from 'react';
import { List, Input, Select, Button, Typography } from 'antd';
import {AgentParameter} from "../../../types/agentType.ts";
const { Title } = Typography;
const { Option } = Select;

interface InitParamsComponentProps {
    initParameters: Record<string, AgentParameter>;
    chatParameters: Record<string, string>;
    onChange: (interaction: Record<string, string>) => void;
}

const InitParamsComponent: React.FC<InitParamsComponentProps> = ({
                                                                     initParameters,
                                                                     chatParameters,
                                                                     onChange,
                                                                 }) => {
    const [parameters, setParameters] = useState<Record<string, AgentParameter>>({});
    const [interaction, setInteraction] = useState<Record<string, string>>({});
    useEffect(() => {
        // 初始化 interaction，确保所有 initParameters 的键都存在
        const updatedInteraction: Record<string, string> = { ...chatParameters };
        const user_params: Record<string, AgentParameter> = {};

        Object.keys(initParameters).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(updatedInteraction, key) && initParameters[key].type === 'user') {
                updatedInteraction[key] = '';
            }
            if (initParameters[key].type === 'user') {
                user_params[key] = initParameters[key];
            }
        });

        Object.keys(updatedInteraction).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(initParameters, key)) {
                delete updatedInteraction[key];
            }
        });

        setParameters(user_params);
        setInteraction(updatedInteraction);
    }, [initParameters, chatParameters]);

    const handleInputChange = (name: string, value: string) => {
        setInteraction((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setInteraction((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOk = () => {
        onChange(interaction);
    };

    return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100%', width: '100%'}}>
            <Title level={4} style={{ textAlign: 'center' }}>
                请配置智能体参数
            </Title>
            <List
                dataSource={Object.entries(parameters)}
                renderItem={([param, value]) => (
                    <List.Item key={param}>
                        <div style={{ marginBottom: '10px', width: '100%' }}>
                            <div>{value.description}</div>
                            {value.fill_type === 'cloze' ? (
                                <Input
                                    placeholder={value.placeholder}
                                    value={interaction[param] || ''}
                                    onChange={(e) => handleInputChange(param, e.target.value)}
                                />
                            ) : (
                                <Select
                                    value={interaction[param] || ''}
                                    style={{ width: '300px' }}
                                    onChange={(value) => handleSelectChange(param, value)}
                                >
                                    {value.options?.map((option, index) => (
                                        <Option value={option} key={index}>
                                            {option.value}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </List.Item>
                )}
            />
            <Button type="primary" style={{ marginTop: '20px' }} onClick={handleOk}>
                确定
            </Button>
        </div>
    );
};

export default InitParamsComponent;