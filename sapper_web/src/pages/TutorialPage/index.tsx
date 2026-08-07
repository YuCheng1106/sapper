import {Card, List, Tag, Typography} from 'antd';

const TutorialPage = () => {
    const tutorials = [
        {
            index: 1,
            title: "获取 OpenAI API 密钥",
            description: "在开始创建智能体之前，您需要先获取一个 OpenAI API 密钥。这个视频将详细演示如何获取该密钥的步骤。",
            videoLink: "//player.bilibili.com/player.html?aid=1454233368&bvid=BV1hi421k7ku&cid=1531598236&p=1&autoplay=0"
        },
        {
            index: 2,
            title: "创建单个智能体：以创意总监为例",
            description: "这个视频详细演示了如何创建一个工具类智能体，以创意总监为例，展示了完整的创建流程。",
            videoLink: "//player.bilibili.com/player.html?aid=1054047795&bvid=BV1mH4y1V7ZM&cid=1531598802&p=1&autoplay=0"
        },
        {
            index: 3,
            title: "创建单个智能体并使用文生图：以美术总监为例",
            description: "这个视频详细演示了如何创建一个工具类智能体，以美术总监为例，展示了完整的创建流程，并演示了如何使用文生图插件。",
            videoLink: "//player.bilibili.com/player.html?aid=1304244921&bvid=BV1iM4m1d7Nq&cid=1531598960&p=1&autoplay=0"
        },
        {
            index: 4,
            title: "创建单个智能体并使用图生文：以文案总监为例",
            description: "这个视频详细演示了如何创建一个工具类智能体，以文案总监为例，展示了完整的创建流程，并演示了如何使用图生文插件。",
            videoLink: "//player.bilibili.com/player.html?aid=1954082367&bvid=BV1DC41177nS&cid=1531599057&p=1&autoplay=0"
        },
        {
            index: 5,
            title: "多智能体协作：以设计部部长为例",
            description: "这个视频详细演示了如何创建一个管理类智能体，以广告设计部部长为例，展示了完整的创建流程，并完成了对创意总监、美术总监和文案总监的管理使用。",
            videoLink: "//player.bilibili.com/player.html?aid=1454143592&bvid=BV1Ai421k7pJ&cid=1531599231&p=1&autoplay=0"
        },
        {
            index: 6,
            title: "调用外部插件：以维基百科插件为例",
            description: "这个视频详细演示了如何在插件库中导入外部插件，以维基百科插件为例。同时，它演示了如何将该插件应用于创意总监智能体。",
            videoLink: "//player.bilibili.com/player.html?aid=1454136576&bvid=BV1Fi421k7Ca&cid=1533060353&p=1&autoplay=0"
        },
        {
            index: 7,
            title: "基础RAG应用：以广告库文本数据为例",
            description: "这个视频演示了基础RAG应用，如何上传非结构化纯文本数据，并创建数据视图以供智能体使用。以广告库文本数据为例，视频展示了如何将这些数据应用于创意总监智能体，使其能够检索数据并根据数据完成回答。",
            videoLink: "//player.bilibili.com/player.html?aid=1204183922&bvid=BV1tf421U7q2&cid=1533060613&p=1&autoplay=0"
        },
        {
            index: 8,
            title: "高级RAG应用：以广告库表格数据为例",
            description: "这个视频演示了高级RAG应用，如何上传结构化表格数据，并创建数据视图以供智能体使用。以广告库表格数据为例，视频展示了如何将这些数据应用于创意总监智能体，使其能够检索数据并根据数据完成回答。",
            videoLink: "//player.bilibili.com/player.html?aid=1304153112&bvid=BV1qM4m1Z7uk&cid=1533060913&p=1&autoplay=0"
        },
        {
            index: 9,
            title: "设置智能体初始化参数：以个性化美术总监为例",
            description: "这个视频演示了如何设置智能体的初始化参数，以实现个性化的智能体效果。以个性化美术总监为例，视频展示了如何设置\"面向受众\"的初始化参数，使其能够根据不同群体生成不同效果的广告图。",
            videoLink: "//player.bilibili.com/player.html?aid=1004077969&bvid=BV14x4y1q7uM&cid=1533061208&p=1&autoplay=0"
        },
        {
            index: 10,
            title: "将智能体植入代码",
            description: "这个视频演示了如何将智能体以API的形式集成到代码中。它通过展示如何下载已创建的智能体，并安装 Python 库 sapperchain 进行调用，帮助您轻松地将智能体整合到您的项目中。",
            videoLink: "//player.bilibili.com/player.html?aid=1554642849&bvid=BV1S1421q7Cd&cid=1543798276&p=1&autoplay=0"
        },
        {
            index: 11,
            title: "将智能体微信小程序",
            description: "这个视频演示了如何将智能体以API的形式集成到微信小程序中。它展示了将已创建的智能体发布为API插件的过程，并演示了如何在小程序中以 POST 请求的形式调用该智能体。",
            videoLink: "//player.bilibili.com/player.html?aid=1154387194&bvid=BV1fZ421j7bB&cid=1542699455&p=1&autoplay=0"
        },
        {
            index: 12,
            title: "将智能体植入机器人",
            description: "这个视频演示了如何将智能体以API的形式集成到机器人中。它展示了将已创建的智能体发布为API插件的过程，并演示了如何在机器人中以 POST 请求的形式调用该智能体。",
            videoLink: "//player.bilibili.com/player.html?isOutside=true&aid=1254710094&bvid=BV1iJ4m1A7AJ&cid=1546082722&p=1&autoplay=0"
        }
    ];

    return (
        <div style={{padding: '20px', height: "100%", overflowY: "auto"}}>
            <List
                grid={{gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4}}
                dataSource={tutorials}
                renderItem={(item, index) => (
                    <List.Item>
                        <Card title={<div><Tag>{index + 1}</Tag>{item.title}</div>}>
                            <Typography.Paragraph
                                ellipsis={{
                                    rows: 2,
                                    expandable: 'collapsible',
                                }}
                            >
                                {item.description}
                            </Typography.Paragraph>
                            <iframe
                                src={item.videoLink}
                                scrolling="no"
                                frameBorder="no"
                                allowFullScreen={true}
                                style={{width: '100%', height: '200px'}}
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}

export default TutorialPage;
