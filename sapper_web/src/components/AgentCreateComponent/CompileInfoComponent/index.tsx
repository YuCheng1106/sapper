import React from "react";
import { Divider, Tag } from "antd";
import {CloseCircleOutlined} from "@ant-design/icons";

interface CompileInfoProps {
    Info: string;
    clearInfo: () => void;
}

const CompileInfo: React.FC<CompileInfoProps> = ({ Info, clearInfo }: {Info: string, clearInfo: () => void}) => {
    return (
        <div
            className="card"
            style={{
                margin: '10px',
                padding: "10px",
                border: '2px solid #9bc5c3',
                backgroundColor: "white"
            }}
        >
            <div
                className="d-flex justify-content-between align-items-center"
                style={{ alignItems: 'center' }}
            >
                <div className="d-flex" style={{ textAlign: 'left' }}>
                    <Divider
                        orientation="left"
                        orientationMargin="0"
                        style={{ padding: "0", margin: "0 0 5px 0" }}
                    >
                        <Tag bordered={false} color="blue">控制台</Tag>
                    </Divider>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <CloseCircleOutlined onClick={clearInfo} />
                </div>
            </div>
            <div>
                <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {Info}
                </div>
            </div>
        </div>
    );
};

export default CompileInfo;