import React from "react";
import {  Row, Col, Typography, Button } from "antd";
import {SectionDescription, SectionDescriptionTran, SectionIcon} from "../../../constants/constants";
import RefInput from "./RefInput.js";
import { CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const GenericContentSection = ({ contentData, onChange, onRemove, active, listeners, attributes }) => {
  const handleChange = (newContent) => {
    onChange({ ...contentData, content: newContent });
  };

  const handleRemove = () => {
    onRemove();
  };

  const IconComponent = SectionIcon[contentData.subSectionType];

  return (
    <div style={{ backgroundColor: "white", padding: "5px" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Row align="middle" {...listeners} {...attributes} style={{ cursor: "grab" }}>
            {active && <IconComponent/>}
            <Text style={{ marginLeft: 8 }} className={`subsection-title`}>{SectionDescriptionTran[contentData.subSectionType]}</Text>
            <div className="hint-text" style={{ marginLeft: 8 }}>
              {SectionDescription[contentData.subSectionType]}
            </div>
          </Row>
        </Col>
        <Col>
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={handleRemove}
          />
        </Col>
      </Row>
      <RefInput
        value={contentData.content}
        onChange={(e) => handleChange(e)}
        active={active}
      />
    </div>
  );
};

export default GenericContentSection;
