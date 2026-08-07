import {Card, List, Tag} from 'antd';

const UseCasePage = () => {
    const tutorials = [
        {
            index: 1,
            title: "Sapper:创造高质量智能体，引领机器人智能升级",
            description: "Sapper: 创造高质量智能体，引领机器人智能升级打造英语口语交流新标杆",
            videoLink: "//player.bilibili.com/player.html?aid=1153551713&bvid=BV1iZ421n7w4&cid=1519469390&p=1&autoplay=0"
        },
        {
            index: 4,
            title: "未来课堂:实时数字人引领的双师外语教学革命",
            description: "未来课堂:实时数字人引领的双师外语教学革命",
            videoLink: "//player.bilibili.com/player.html?aid=1504473758&bvid=BV1oD421w7B6&cid=1542597255&p=1&autoplay=0"
        },
        {
            index: 5,
            title: "Sapper赋能纸曰团队非遗现代化转译项目",
            description: "Sapper赋能纸曰团队非遗现代化转译项目",
            videoLink: "//player.bilibili.com/player.html?aid=1153872099&bvid=BV1yZ421J7RE&cid=1527696156&p=1&autoplay=0"
        },
        {
            index: 3,
            title: "Sapper开发智能体基于数据构建知识图谱",
            description: "",
            videoLink: "//player.bilibili.com/player.html?aid=1204699173&bvid=BV1yf42117ME&cid=1543796289&p=1&autoplay=0"
        },
        {
            index: 2,
            title: "教小案——专注于教案生成的AI虚拟团队",
            description: "",
            videoLink: "//player.bilibili.com/player.html?aid=1104398361&bvid=BV1iw4m1972q&cid=1543786574&p=1&autoplay=0"
        },
        {
            index: 6,
            title: "多智能体协作教学：以AI教师分身为例",
            description: "",
            videoLink: "//player.bilibili.com/player.html?isOutside=true&aid=1154948019&bvid=BV15Z421x7Yr&cid=1561421828&p=1&autoplay=0"
        },
        {
            index: 7,
            title: "Sapper打造未来产业案例与技术搜索平台",
            description: "",
            videoLink: "//player.bilibili.com/player.html?isOutside=true&aid=113345864731174&bvid=BV1ary5Y7ESx&cid=26399343805&p=1&autoplay=0"
        }
    ];

    return (
        <div style={{ padding: '20px', height: "100%", overflowY: "auto"}}>
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={tutorials}
                renderItem={(item, index) => (
                    <List.Item>
                        <Card title={<div><Tag>{index + 1}</Tag>{item.title}</div>}>
                            <iframe
                                src={item.videoLink}
                                scrolling="no"
                                frameBorder="no"
                                allowFullScreen={true}
                                style={{ width: '100%', height: '200px' }}
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}

export default UseCasePage;
