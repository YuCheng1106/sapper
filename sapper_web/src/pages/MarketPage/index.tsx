import { useState, useEffect } from 'react';
import { Divider, Skeleton, Empty, message, List } from 'antd';
import { useLocation, useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import RecommendedAgentComponent from "../../components/RecommendedAgentComponent";
import { AgentDiscoverCard } from "../../components";
import { queryPublicAgentList } from "../../api/sapper/agent.ts";
import {AgentRes, keyToTagMap, AgentTagType } from "../../types/agentType.ts";


const PAGE_SIZE = 12;

const MarketPage = () => {
    const [agents, setAgents] = useState<AgentRes[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [tag, setTag] = useState<AgentTagType | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    // 提取标签
    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        const newTag = pathSegments.length >= 3 ? pathSegments[pathSegments.length - 1] : null;
        if (newTag !== tag) {
            setTag(newTag as AgentTagType);
            resetAndLoadData(newTag as AgentTagType);
        }
    }, [location.pathname]);

    const handleAgentClick = (uuid: string) => {
        navigate(`/agent/display/${uuid}`);
    };

    const resetAndLoadData = async (tag: string) => {
        setAgents([]);
        setPage(1);
        setHasMore(true);
        await loadMoreData(true, tag);
    }

    const loadMoreData = async (isInitialLoad = false, tag: string | null = null) => {
        if (loading) return;
        setLoading(true);
        if (isInitialLoad) setInitialLoading(true);

        try {
            const query = tag ? { tag } : {};
            const res = await queryPublicAgentList({
                ...query,
                page: isInitialLoad ? 1 : page + 1,
                size: PAGE_SIZE
            });

            setAgents(prev => isInitialLoad ? res.items : [...prev, ...res.items]);
            setHasMore(res.items.length === PAGE_SIZE);
            if (!isInitialLoad) setPage(prev => prev + 1);
        } catch (error) {
            message.error('加载数据失败，请稍后重试');
            console.error('加载数据失败:', error);
        } finally {
            setLoading(false);
            if (isInitialLoad) setInitialLoading(false);
        }
    }

    useEffect(() => {
        resetAndLoadData(tag as AgentTagType);
    }, [tag]);

    const renderLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 4 }} />
            ))}
        </div>
    );

    const renderEmpty = () => (
        <Empty
            className="mt-12"
            description={tag ? `没有找到与${keyToTagMap[tag]}相关的Agent` : "暂无Agent数据"}
        />
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6" >
            <InfiniteScroll
                dataLength={agents.length}
                next={loadMoreData}
                hasMore={hasMore && !loading}
                loader={
                    <div className="p-4">
                        <Skeleton paragraph={{ rows: 1 }} active />
                    </div>
                }
                endMessage={
                    agents.length > 0 && (
                        <Divider plain>没有更多内容了</Divider>
                    )
                }
                scrollableTarget="scrollableDiv"
            >
                <RecommendedAgentComponent />
                {initialLoading && (
                    renderLoader()
                )}
                {agents.length === 0 && !initialLoading ? (
                    renderEmpty()
                ):
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
                        dataSource={agents}
                        renderItem={(agent) => (
                            <List.Item key={agent.uuid} className="mb-6 md:mb-8 w-full max-w-4xl">
                                <AgentDiscoverCard agentData={agent} onClick={() => handleAgentClick(agent.uuid)}/>
                            </List.Item>
                        )}
                    />
                }
            </InfiniteScroll>
        </div>
    );
};

export default MarketPage;