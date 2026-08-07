import React from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import {SectionDescriptionTran, SPLFormDefaultValue} from "../../../constants/constants";

const ButtonSection = ({
  sectionData,
  onChange
}) => {
  const defaultValues = SPLFormDefaultValue[sectionData.sectionType];

  const handleChange = (type) => {
    const defaultValue = defaultValues[type];
    const newContent = { subSectionId: 'S' + Date.now().toString(), subSectionType: type, content: defaultValue };
    onChange(newContent);
  };

  // 使用`items`属性来定义菜单项
  const menuItems = Object.keys(defaultValues).map((type) => ({
    key: type,
    label: SectionDescriptionTran[type],
    onClick: () => handleChange(type)
  }));

  return (
    <div style={{ textAlign: "right" }}>
      {/* 使用`menu`属性替代`overlay`来传递Menu组件 */}
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button icon={<DownOutlined />}>
          添加子模块
        </Button>
      </Dropdown>
    </div>
  );
};

export default ButtonSection;
