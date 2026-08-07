import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DraggableAttributes
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Row, Col, List, message, ConfigProvider, Empty } from "antd";
import FormCardComponent from "../FormCardComponent";
import FormButtonComponent from "./FormButtonComponent";
import "./index.css";
import {AgentSPLFormSection} from "../../types/agentType.ts";
import {SyntheticListenerMap} from "@dnd-kit/core/dist/hooks/utilities";
import type {DragEndEvent} from "@dnd-kit/core/dist/types";

const SPLFormComponent = ({ splForm, onChange, loading}: {splForm: AgentSPLFormSection[], onChange?: (data: AgentSPLFormSection[]) => void, loading?: boolean}) => {
    if(!onChange)
        onChange = (data: AgentSPLFormSection[]) => {console.log(data)};
    // 处理拖拽结束
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = splForm.findIndex((item) => item.sectionId === active.id);
            const newIndex = splForm.findIndex((item) => item.sectionId === over.id);
            const reorderedItems = arrayMove(splForm, oldIndex, newIndex);
            onChange(reorderedItems);
        }
    };

    // 处理删除
    const handleRemove = (id: string) => {
        const updatedFormData = splForm.filter((field) => field.sectionId !== id);
        onChange(updatedFormData);
    };

    // 处理内容变化
    const handleChange = (sectionData: AgentSPLFormSection) => {
        const contentId = sectionData.sectionId;
        const updatedSection = splForm.map((section) => {
            if (section.sectionId === contentId) {
                return sectionData;
            }
            return section;
        });
        onChange(updatedSection);
    };

    // 处理添加
    const handleAppend = async (section: AgentSPLFormSection) => {
        const sectionType = section.sectionType;
        if (splForm.some((f) => f.sectionType === sectionType) && sectionType !== "Instruction") {
            message.info(`You can't add ${sectionType} repeatedly`);
            return;
        }
        const updatedFormData = [...splForm, section];
        onChange(updatedFormData);
    };

    // 配置传感器
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <React.Fragment>
            <Row gutter={16} style={{ height: "100%", padding: "5px", backgroundColor: "white" }}>
                <Col span={24}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={splForm.map((item) => item.sectionId)}>
                            <ConfigProvider
                                renderEmpty={() => (
                                    <Empty
                                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                        description={
                                            <span>
                        Get started with your agent creation by clicking <b>'+Add Section'</b>
                      </span>
                                        }
                                    />
                                )}
                            >
                                <List
                                    loading={loading}
                                    dataSource={splForm}
                                    renderItem={(section, index) => (
                                        <SortableItem key={section.sectionId} id={section.sectionId}>
                                            {(listeners: SyntheticListenerMap, attributes: DraggableAttributes) => (
                                                <FormCardComponent
                                                    index={index}
                                                    sectionData={section}
                                                    onRemove={() => handleRemove(section.sectionId)}
                                                    onChange={handleChange}
                                                    listeners={listeners}
                                                    attributes={attributes}
                                                />
                                            )}
                                        </SortableItem>
                                    )}
                                />
                            </ConfigProvider>
                        </SortableContext>
                    </DndContext>
                    <FormButtonComponent onChange={handleAppend} />
                </Col>
            </Row>
        </React.Fragment>
    );
};

// 可排序项组件
// 可排序项组件
const SortableItem = ({
                          id,
                          children
                      }: {
    id: string;
    children: (
        listeners: SyntheticListenerMap,
        attributes: DraggableAttributes
    ) => React.ReactNode;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    if(listeners)
        return (
            <div ref={setNodeRef} style={style}>
                {/* 内容 */}
                {children(listeners, attributes)}
            </div>
        );
};

export default SPLFormComponent;