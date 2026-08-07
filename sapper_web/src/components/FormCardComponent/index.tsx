import React, { useState, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DraggableAttributes
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {Card, List, Tooltip, Button, Col, Row, message, Space, Divider} from 'antd';
import {CaretRightOutlined, DeleteOutlined, DragOutlined} from '@ant-design/icons';
import ButtonSection from './FormSectionComponent/ButtonSection';
import { SectionDescription, mapTypeToColor, SectionDescriptionTran } from '../../constants/constants';
import './index.css';
import FormSectionComponent from "./FormSectionComponent/index.jsx";
import {AgentSPLFormSection, AgentSPLFormSubSection} from "../../types/agentType.ts";
import {SyntheticListenerMap} from "@dnd-kit/core/dist/hooks/utilities";

interface FormCardComponentProps {
    index: number;
    sectionData: AgentSPLFormSection;
    onChange: (data: AgentSPLFormSection) => void;
    onRemove: () => void;
    listeners: SyntheticListenerMap
    attributes: DraggableAttributes
}

const FormCardComponent = ({ index, sectionData, onChange, onRemove, listeners, attributes}: FormCardComponentProps) => {
  const [isActive, setIsActive] = useState(false); // 新增状态变量
  const handleSectionClick = () => {
    setIsActive(true); // 如果点击在组件内部，显示图标和按钮
  };

  const sectionRef = useRef(null); // 创建一个 ref

  const handleClickOutside = (event) => {
    // 检查点击是否在sectionRef组件外部
    if (sectionRef.current && !sectionRef.current.contains(event.target)) {
        // 检查点击是否在Popover内容外部
        let isInsidePopover = false;
        // 递归检查点击的元素和其父元素是否有.ant-popover类
        for (let el = event.target; el && el !== document; el = el.parentNode) {
            if (el.matches('.ant-modal-content') || el.matches('.ant-popover') || el.matches('.ant-select') || el.matches('.ant-dropdown') ||
                el.matches('.ant-select-dropdown') || el.matches('.ant-select-item-option-content')) {
                isInsidePopover = true;
                break;
            }
        }

        if (!isInsidePopover) {
            setIsActive(false); // 如果点击在组件和Popover内容外面，隐藏图标和按钮
        }
    }
  };


  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // 清除事件监听器
    };
  }, []);

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sectionData.section.findIndex((item) => item.subSectionId === active.id);
      const newIndex = sectionData.section.findIndex((item) => item.subSectionId === over.id);
      const updatedSections = arrayMove(sectionData.section, oldIndex, newIndex);
      onChange({ ...sectionData, section: updatedSections });
    }
  };

  // 处理添加子项
  const handleSectionAppend = (content) => {
    const updatedSections = [...sectionData.section];
    if (content.subSectionType === 'Name') {
      updatedSections.splice(0, 0, content);
    } else {
      updatedSections.push(content);
    }
    onChange({ ...sectionData, section: updatedSections });
  };

  // 处理子项变化
  const handleSectionChange = (contentData: AgentSPLFormSubSection) => {
    const contentId = contentData.subSectionId;
    const updatedSection = sectionData.section.map((section) => {
      if (section.subSectionId === contentId) {
        return contentData;
      }
      return section;
    });
    onChange({ ...sectionData, section: updatedSection });
  };

  // 处理删除子项
  const handleSectionRemove = (id: string) => {
    const updatedSections = sectionData.section.filter((content) => content.subSectionId !== id);
    onChange({ ...sectionData, section: updatedSections });
  };

  // 配置传感器
  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
  );

  return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} >
        <div
            ref={sectionRef}
            className={`generic-multiple-section ${isActive ? 'active' : ''}`}
            onClick={handleSectionClick}
            style={{ backgroundColor: 'white', padding: '5px' }}
        >
            <Card
                style={{
                    backgroundColor: 'white',
                    border: `2px solid ${mapTypeToColor(sectionData.sectionType)}`,
                    marginBottom: '5px',
                    position: 'relative',
                    minWidth: '300px',
                }}
                size={'small'}
            >
                {isActive && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            zIndex: 1,
                            width: '5px',
                            backgroundColor: mapTypeToColor(sectionData.sectionType),
                            animation: 'expandBarVertical 0.25s ease-out forwards', // 应用垂直展开动画
                        }}
                    />
                )}
                <Row className="form-group-nav d-flex justify-content-between align-items-center mb-1">
                    <Col className="nav-left d-flex align-items-center">
                        <div
                            {...listeners} {...attributes}
                            style={{
                                cursor: "grab",
                                width: '25px',
                                height: '25px',
                                borderRadius: '50%',
                                backgroundColor: `${mapTypeToColor(sectionData.sectionType)}`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '15px',
                                color: '#000',
                            }}
                        >
                            {index + 1}
                        </div>
                        <div className={`card-title`}>{SectionDescriptionTran[sectionData.sectionType]}</div>
                        <div className="hint-text">{SectionDescription[sectionData.sectionType]}</div>
                    </Col>
                    <Col className="nav-right d-flex justify-content-end">
                        <div {...listeners} {...attributes} style={{display: `${isActive ? 'flex' : 'none'}`, cursor: 'grab'}}>
                            <Button
                                type={"text"}
                                icon={<DragOutlined />}
                            />
                        </div>
                    </Col>
                    <Col className="nav-right d-flex justify-content-end">
                        <Space>
                            {sectionData.sectionType === 'Instruction' && <Tooltip title="单元测试">
                                <Button
                                    type={"text"}
                                    style={{color: 'red'}}
                                    icon={<CaretRightOutlined/>}
                                    onClick={() => message.info("单元测试即将推出！")}
                                />
                            </Tooltip>}
                            <Tooltip title="删除模块">
                                <Button type="text" icon={<DeleteOutlined/>} onClick={onRemove}/>
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
                <SortableContext items={sectionData.section.map((item) => item.subSectionId)}>
                    <List
                        dataSource={sectionData.section}
                        renderItem={(item) => (
                            <SortableItem key={item.subSectionId} id={item.subSectionId}>
                                {(listeners, attributes) => (
                                    <div className={`w-100`} style={{paddingBottom: '5px', fontSize: '24px'}}>
                                        {React.createElement(FormSectionComponent[item.subSectionType], {
                                            contentData: item,
                                            onChange: handleSectionChange,
                                            onRemove: () => handleSectionRemove(item.subSectionId),
                                            active: isActive,
                                            listeners: listeners,
                                            attributes: attributes
                                        })}
                                        <hr/>
                                    </div>
                                )}
                            </SortableItem>
                        )}
                    />
                </SortableContext>
                {isActive && <ButtonSection sectionData={sectionData} onChange={handleSectionAppend}/>}
            </Card>
        </div>
      </DndContext>
  );
};

// 可排序项组件
const SortableItem = ({id, children}) => {
    const {attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
  };

  return (
      <div ref={setNodeRef} style={style}>
          {children(listeners, attributes)}
      </div>
  );
};

export default FormCardComponent;