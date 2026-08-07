import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {Input, Tooltip, Button, Col, Row, Typography, List, Tag, Popover, message} from 'antd';
import { PlusOutlined, MinusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { SectionDescription, SectionDescriptionTran, SectionIcon } from '../../../constants/constants';
import RefInput from './RefInput.js';
import MagicWandIcon from "../../Icons/MagicWandOutlined/index.js";

const { Text } = Typography;

const GenericMultipleSection = ({ contentData, onChange, onRemove, active, listeners, attributes, ...props }) => {
  // 处理子项变化
  const handleItemsChange = (index, value) => {
    const updatedItems = [...contentData.content];
    updatedItems[index] = value;
    onChange({ ...contentData, content: updatedItems });
  };

  // 处理删除子项
  const handleRemoveItems = (index) => {
    const updatedItems = [...contentData.content];
    updatedItems.splice(index, 1);
    onChange({ ...contentData, content: updatedItems });
  };

  // 处理添加子项
  const handleAddItems = () => {
    const updatedItems = [...contentData.content];
    updatedItems.push('');
    onChange({ ...contentData, content: updatedItems });
  };

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = contentData.content.findIndex((item) => item === active.id);
      const newIndex = contentData.content.findIndex((item) => item === over.id);
      const updatedItems = arrayMove(contentData.content, oldIndex, newIndex);
      onChange({ ...contentData, content: updatedItems });
    }
  };

  // 处理删除整个部分
  const handleRemove = () => {
    onRemove();
  };

  // 配置传感器
  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
  );

  const IconComponent = SectionIcon[contentData.subSectionType];

  return (
      <div style={{ backgroundColor: 'white' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Row align="middle" {...listeners} {...attributes} style={{ cursor: "grab" }}>
              {active && <IconComponent />}
              <Text style={{ marginLeft: 8 }} className={`subsection-title`}>
                {SectionDescriptionTran[contentData.subSectionType]}
              </Text>
              <div className="hint-text" style={{ marginLeft: 8 }}>
                {SectionDescription[contentData.subSectionType]}
              </div>
            </Row>
          </Col>
          <Col>
            <Button
                type="text"
                icon={<MagicWandIcon />}  // 使用自定义图标
                onClick={() => message.info("魔法棒功能即将推出！")}
                style={{ marginRight: 8 }}
            />
            <Button type="text" icon={<CloseCircleOutlined />} onClick={handleRemove} />
          </Col>
        </Row>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={contentData.content}>
            <List
                dataSource={contentData.content}
                renderItem={(item, index) => (
                    <SortableItem key={index} id={item}>
                      {(listeners, attributes) => ( // 将 listeners 和 attributes 传递给子组件
                          <List.Item
                              style={{ padding: '5px 0 0 0', alignItems: 'flex-start', width: '100%' }}
                              className="d-flex"
                          >
                            {active && (
                                <Tag
                                    style={{ cursor: 'grab' }} // 添加拖拽手柄样式
                                    {...listeners} // 绑定拖拽逻辑
                                    {...attributes} // 绑定拖拽属性
                                >
                                  {index + 1}
                                </Tag>
                            )}
                            <RefInput value={item} onChange={(e) => handleItemsChange(index, e)} active={active} />
                            {active && (
                                <Tooltip title="Remove Item">
                                  <Button type="text" icon={<MinusOutlined />} onClick={() => handleRemoveItems(index)} />
                                </Tooltip>
                            )}
                          </List.Item>
                      )}
                    </SortableItem>
                )}
            />
            {active && (
                <Tooltip title="Add Item">
                  <Button type="text" icon={<PlusOutlined />} onClick={handleAddItems} />
                </Tooltip>
            )}
          </SortableContext>
        </DndContext>
      </div>
  );
};

// 可排序项组件
const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
      <div ref={setNodeRef} style={style}>
        {children(listeners, attributes)} {/* 将 listeners 和 attributes 传递给子组件 */}
      </div>
  );
};

export default GenericMultipleSection;