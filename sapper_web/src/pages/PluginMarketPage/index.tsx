import { useEffect, useState } from 'react';
import {Divider, Skeleton, Empty, List, Segmented, Typography, Space, message} from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from "react-router-dom";
import { PluginRes } from "../../types/pluginType";
import { queryPublicPluginList} from "../../api/sapper/plugin";
import PluginDiscoverCard from "../../components/PluginDiscoverCardComponent";
import { StarFilled, RobotOutlined, ToolOutlined, SearchOutlined, BarChartOutlined, BranchesOutlined } from '@ant-design/icons';
import './index.css';

const PAGE_SIZE = 12;
const { Title } = Typography;

const CATEGORIES = [
    { key: 'recommend', label: (<Space size={8}><StarFilled style={{ color: '#F59E0B' }} /> 推荐</Space>) },
    { key: 'hardware', label: (<Space size={8}><RobotOutlined style={{ color: '#22C55E' }} /> 智能硬件</Space>) },
    { key: 'tools', label: (<Space size={8}><ToolOutlined style={{ color: '#3B82F6' }} /> 实用工具</Space>) },
    { key: 'websearch', label: (<Space size={8}><SearchOutlined style={{ color: '#EF4444' }} /> 网页搜索</Space>) },
    { key: 'data', label: (<Space size={8}><BarChartOutlined style={{ color: '#A855F7' }} /> 数据分析</Space>) },
    { key: 'integration', label: (<Space size={8}><BranchesOutlined style={{ color: '#10B981' }} /> 系统集成</Space>) },
];

// 英文键到中文分类名的映射，用于前端本地过滤
const CATEGORY_VALUE_MAP: Record<string, string> = {
    hardware: '智能硬件',
    tools: '实用工具',
    websearch: '网页搜索',
    data: '数据分析',
    integration: '系统集成',
};


const PluginMarketPage = () => {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].key);
    const [plugins, setPlugins] = useState<PluginRes[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const navigate = useNavigate();

    const handlePluginClick = (uuid: string) => {
        // 暂时跳转到工作间详情（若后续有独立展示页可替换）
        // navigate(`/workspace/plugin/${uuid}`);
        message.info("查看功能更新中，可在智能体中直接使用体验")
    };

    const resetAndLoadData = async () => {
        setPlugins([]);
        setPage(1);
        setHasMore(true);
        await loadMoreData(true);
    };

    const loadMoreData = async (isInitialLoad = false) => {
        if (loading) return;
        setLoading(true);
        if (isInitialLoad) setInitialLoading(true);

        try {
            const nextPage = isInitialLoad ? 1 : page + 1;
            const params: { page: number; size: number; category: string } = {
                page: nextPage,
                size: PAGE_SIZE,
                category: activeCategory
            };
            const res = await queryPublicPluginList(params);
            const items = (res.items || []) as (PluginRes & { category?: string })[];
            const filteredItems =
                activeCategory === 'recommend'
                    ? items
                    : items.filter((p) => {
                        const cat = (p.category ?? '').trim();
                        // 支持两种存储：英文键（hardware/tools/...）与中文名（智能硬件/实用工具/...）
                        const targetZh = CATEGORY_VALUE_MAP[activeCategory];
                        return cat === activeCategory || cat === targetZh;
                    });

            setPlugins(prev => isInitialLoad ? filteredItems : [...prev, ...filteredItems]);
            setHasMore(nextPage < (res.total_pages || 0));
            if (!isInitialLoad) setPage(nextPage);
        } finally {
            setLoading(false);
            if (isInitialLoad) setInitialLoading(false);
        }
    };

    useEffect(() => {
        resetAndLoadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory]);

    const renderLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 4 }} />
            ))}
        </div>
    );

    const renderEmpty = () => (
        <Empty className="mt-12" description="暂无发布的插件" />
    );

    return (
        <div className="w-full mx-auto px-4 min-h-screen">
            {/* 顶部分类栏（仿 Coze 主题，灰底、淡紫字、居中、无阴影） */}
            <div className="sticky top-0 left-0 right-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 eborder-b border-gray-200">
                <div className="max-w-screen-lg flex flex-col items-start justify-start gap-3 py-4 text-left">
                    <Title level={4} className="!m-0 !text-[#A78BFA]">插件体验区</Title>
                    <Segmented
                        size="large"
                        options={CATEGORIES.map(c => ({ label: c.label, value: c.key }))}
                        value={activeCategory}
                        className="segmented-full"
                        onChange={(val) => setActiveCategory(val as string)}
                    />
                </div>
            </div>
            <InfiniteScroll
                dataLength={plugins.length}
                style={{height:'calc( 100vh - 250px'}}
                next={loadMoreData}
                hasMore={hasMore && !loading}
                loader={
                    <div className="p-4">
                        <Skeleton paragraph={{ rows: 1 }} active />
                    </div>
                }
                endMessage={
                    plugins.length > 0 && (
                        <Divider plain>没有更多内容了</Divider>
                    )
                }
                scrollableTarget="scrollableDiv"
            >
                {initialLoading && renderLoader()}
                {plugins.length === 0 && !initialLoading ? (
                    renderEmpty()
                ) : (
                    <List
                        grid={{
                            gutter: 24,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 3,
                            xl: 3,
                            xxl: 4
                        }}
                        loading={loading}
                        // className="max-w-screen-lg mx-auto"
                        dataSource={plugins}
                        renderItem={(plugin) => (
                            <List.Item key={plugin.uuid} className="mb-6 md:mb-8 w-full max-w-4xl mt-4">
                                <PluginDiscoverCard pluginData={plugin} onClick={() => handlePluginClick(plugin.uuid)} />
                            </List.Item>
                        )}
                    />
                )}
            </InfiniteScroll>
        </div>
    );
};

export default PluginMarketPage;