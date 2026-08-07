import {Button, Dropdown, Menu, Popconfirm, Typography, Input, MenuProps, ConfigProvider} from 'antd';
import { DeleteOutlined, EditFilled, MoreOutlined } from '@ant-design/icons';
import { ConversationRes } from '../../types/conversationType';
import { useState } from 'react';
import {MenuItemType} from "antd/es/menu/interface";


interface ConversationMenuProps {
    selectedConversationId: string;
    conversations: ConversationRes[];
    onClick: (uuid: string) => void;
    onDelete: (id: number) => void;
    onRename: (uuid: string, name: string) => void;
}

const ConversationMenuComponent = (props: ConversationMenuProps) => {
    const {selectedConversationId, conversations, onClick, onDelete, onRename } = props;
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    /**
     * 获取操作菜单项
     */
    const getActionMenuItems = (conversation: ConversationRes): MenuProps['items'] => [
        {
            key: 'rename',
            label: '重命名',
            icon: <EditFilled />,
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleStartEdit(conversation);
            }
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title="确定要删除此会话吗？"
                    onConfirm={(e) => {
                        e?.stopPropagation();
                        onDelete(conversation.id);
                    }}
                    onCancel={(e?: React.MouseEvent) => e?.stopPropagation()}
                    okText="确定"
                    cancelText="取消"
                >
                    <div onClick={(e) => e.stopPropagation()}>删除</div>
                </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            onClick: (e) => e.domEvent.stopPropagation()
        }
    ];

    /**
     * 开始编辑
     */
    const handleStartEdit = (conversation: ConversationRes) => {
        setEditingId(conversation.uuid);
        setEditedName(conversation.name);
    };

    /**
     * 结束编辑
     */
    const handleEndEdit = () => {
        setEditingId(null);
    };

    /**
     * 提交重命名
     */
    const handleRenameSubmit = (uuid: string) => {
        if (editedName.trim() && editedName !== conversations.find(c => c.uuid === uuid)?.name) {
            onRename(uuid, editedName.trim());
        }
        handleEndEdit();
    };

    /**
     * 渲染菜单项内容
     */
    const renderMenuItemContent = (conversation: ConversationRes) => {
        if (editingId === conversation.uuid) {
            return (
                <Input
                    autoFocus
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => handleRenameSubmit(conversation.uuid)}
                    onPressEnter={() => handleRenameSubmit(conversation.uuid)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '100%' }}
                    maxLength={50}
                />
            );
        }

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                }}
                onMouseEnter={() => setHoveredItem(conversation.id)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <Typography.Text
                    ellipsis={{ tooltip: conversation.name }}
                    style={{ flex: 1 }}
                >
                    {conversation.name}
                </Typography.Text>
                <Dropdown
                    menu={{ items: getActionMenuItems(conversation) }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="更多操作"
                        style={{
                            opacity: hoveredItem === conversation.id ? 1 : 0,
                            transition: 'opacity 0.2s'
                        }}
                    />
                </Dropdown>
            </div>
        );
    };

    /**
     * 生成菜单项
     */
    const menuItems: MenuItemType[] = conversations.map((conversation) => ({
        key: conversation.uuid,
        label: renderMenuItemContent(conversation),
        className: "group hover:bg-gray-100",
        onClick: () => {
            if (editingId !== conversation.uuid) {
                onClick(conversation.uuid);
            }
        }
    }));

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemSelectedColor: '#7F56D9',
                        itemHoverColor: '#7F56D9',
                        itemSelectedBg: '#ececfb',
                    }
                },
            }}
        >
            <Menu
                selectedKeys={[selectedConversationId.toString()]}
                items={menuItems}
                mode="vertical"
                className="border-0 bg-[#FAFAFA]"
            />
        </ConfigProvider>
    );
};

export default ConversationMenuComponent;