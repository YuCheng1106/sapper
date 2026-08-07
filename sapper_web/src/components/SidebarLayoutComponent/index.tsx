import { useState, useEffect } from 'react';
import {ConfigProvider, Layout, Menu} from 'antd';
import {
    AuditOutlined,
    BookOutlined,
    CodeOutlined,
    CrownOutlined, CustomerServiceOutlined, LogoutOutlined,
    ProjectOutlined,
    ReadOutlined,
    ShopOutlined, SmileOutlined,
    ThunderboltOutlined,
    TrophyOutlined, UserOutlined, ProductOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Database, Puzzle } from "lucide-react";
import WorkspaceSubMenu from './WorkspaceLayoutComponent';
import DiscoverSubMenu from "./DiscoverLayoutComponent";
import { MenuItem } from "../../types/menu";
import ContactModal from "./ContactModal";
import {useDispatchUser} from "../../hooks/user.ts";

const { Sider, Content } = Layout;

const menuItems: MenuItem[] = [
    {
        key: 'discover',
        icon: <ShopOutlined />,
        label: '智能体商店',
        sideLabel: 'discover',
        path: '/discover',
        customChildren: [
            {
                key: 'tools',
                icon: <ThunderboltOutlined />,
                label: '效率工具',
                path: '/discover/tools'
            },
            {
                key: 'services',
                icon: <AuditOutlined />,
                label: '商业服务',
                path: '/discover/services'
            },
            {
                key: 'education',
                icon: <ReadOutlined />,
                label: '学习教育',
                path: '/discover/education'
            },
            {
                key: 'code',
                icon: <CodeOutlined />,
                label: '代码助手',
                path: '/discover/code'
            },
            {
                key: 'lifestyle',
                icon: <SmileOutlined />,
                label: '生活方式',
                path: '/discover/life'
            },
            {
                key: 'game',
                icon: <TrophyOutlined />,
                label: '竞技游戏',
                path: '/discover/games'
            }
        ]
    },
    {
        key: 'plugin-discovery',
        icon: <ProductOutlined />,
        label: '插件商店',
        path: '/plugins'
    },
    {
        key: 'workspace',
        icon: <ProjectOutlined />,
        label: '工作间',
        sideLabel: 'workspace',
        path: '/workspace/agent',
        customChildren: [
            { key: 'myAgent', icon: <Bot />, label: '智能体', path: '/workspace/agent' },
            { key: 'knowledge', icon: <Database />, label: '知识库', path: '/workspace/knowledge' },
            { key: 'plugin', icon: <Puzzle />, label: '插件库', path: '/workspace/plugin' },
        ]
    },
    {
        key: 'tutorial',
        icon: <BookOutlined />,
        label: '教程',
        sideLabel: 'tutorial',
        path: '/tutorial'
    },
    {
        key: 'case',
        icon: <CrownOutlined />,
        sideLabel: 'case',
        label: '案例',
        path: '/case'
    }
];


const SidebarLayoutComponent = () => {
    const { logoutUser } = useDispatchUser();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [selectedChildKeys, setSelectedChildKeys] = useState<string[]>([]);
    const [currentSubMenu, setCurrentSubMenu] = useState<MenuItem | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false)

    // 处理主菜单点击
    const handleLogout = () => {
        logoutUser();
    };

    const items: MenuItem[] = [
        {
            icon: <UserOutlined />,
            label: '个人主页',
            key: 'usercenter',
            path: '/usercenter',
        },
        {
            icon: <CustomerServiceOutlined />,
            label: '联系我们',
            key: 'contract',
            onClick: () => {setIsContactModalOpen(true)}
        },
        {
            icon: <LogoutOutlined />,
            label: '退出登录',
            key: 'logout',
            onClick: handleLogout
        },
    ];

    // 处理主菜单点击
    const handleMenuItemClick = ( key: string ) => {
        const item = menuItems.concat(items).find(menuItem => menuItem.key === key);
        if (!item) return;

        setCurrentSubMenu(item);

        if (item.path) {
            navigate(item.path);
            setSelectedKeys([key]);

            // 如果有子菜单且当前路径匹配子菜单，设置选中的子菜单项
            if (item.customChildren) {
                const childItem = item.customChildren.find(child =>
                    child?.path && location.pathname.startsWith(child?.path)
                );
                console.log(childItem)
                if (childItem && childItem.key) {
                    setSelectedChildKeys([childItem.key.toString()]);
                }
            }
        }
    };

    // 处理子菜单点击
    const handleChildMenuClick = (key: string) => {
        if(!currentSubMenu) return;
        const item = currentSubMenu.customChildren?.find(menuItem => menuItem.key === key);

        if (item && item.path) {
            navigate(item.path);
            setSelectedChildKeys([key]);
        }
    };

    // 根据当前路径设置选中的菜单项
    useEffect(() => {

        // 查找匹配的主菜单项
        const currentItem = menuItems.find(item =>
            item?.sideLabel && location.pathname.includes(item?.sideLabel)
        );

        if (currentItem && currentItem.key) {
            setSelectedKeys([currentItem.key.toString()]);
            setCurrentSubMenu(currentItem);

            // 查找匹配的子菜单项
            if (currentItem.customChildren && currentItem.customChildren.length > 0) {
                const childItem = currentItem.customChildren.find(child =>
                    child?.path && location.pathname.startsWith(child?.path)
                );
                if (childItem && childItem.key) {
                    setSelectedChildKeys([childItem.key.toString()]);
                }
                else {
                    const childItem = currentItem.customChildren[0]
                    if(currentItem.customChildren.length > 0 && childItem?.key?.toString()){
                        setSelectedChildKeys([childItem?.key?.toString()]);
                    }
                }
            }
        }
    }, [location.pathname]);

    // 渲染子菜单
    const renderSubMenu = () => {
        if (!currentSubMenu) return null;
        switch (currentSubMenu.key) {
            case 'workspace':
                return (
                    <WorkspaceSubMenu
                        items={currentSubMenu.customChildren || []}
                        selectedKeys={selectedChildKeys}
                        onItemClick={handleChildMenuClick}
                    />
                );
            case 'discover':
                return (
                    <DiscoverSubMenu
                        items={currentSubMenu.customChildren || []}
                        selectedKeys={selectedChildKeys}
                        onItemClick={handleChildMenuClick}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemSelectedColor: '#7F56D9',
                        itemHoverColor: '#7F56D9',
                        itemSelectedBg: '#ececfb',
                    },
                    Layout: {
                        headerBg: '#f6f6ff',
                        bodyBg: '#f6f6ff',
                        siderBg: '#fff'
                    }
                },
            }}
        >
            <Layout className="h-screen">
                <Layout className="flex flex-row">
                    {/* 主菜单侧边栏 */}
                    <Sider
                        width={160}
                        className="border-r p-2 bg-white"
                    >
                        <div className="flex items-center gap-3 p-2">
                            <motion.h1
                                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sapper
                            </motion.h1>
                        </div>
                        <Menu
                            selectedKeys={selectedKeys}
                            onClick={({key}) => handleMenuItemClick(key)}
                            items={menuItems}
                            style={{ height: 'calc(100% - 180px)', borderRight: 0 }}
                        />
                        <Menu
                            selectedKeys={selectedKeys}
                            onClick={({key}) => handleMenuItemClick(key)}
                            items={items}
                            style={{ borderRight: 0 }}
                        />
                    </Sider>

                    {/* 子菜单侧边栏 */}
                    {currentSubMenu?.customChildren && (
                        <Sider
                            width={165}
                            className="bg-[#FAFAFA] border-r"
                            theme="light"
                        >
                            {renderSubMenu()}
                        </Sider>
                    )}

                    {/* 内容区域 */}
                    <Content className="overflow-auto" id="scrollableDiv">
                        <div className="rounded-lg p-1 h-full">
                            <Outlet />
                        </div>
                    </Content>
                </Layout>
                <ContactModal open={isContactModalOpen} onCancel={() => setIsContactModalOpen(false)}/>
            </Layout>
        </ConfigProvider>
    );
};

export default SidebarLayoutComponent;