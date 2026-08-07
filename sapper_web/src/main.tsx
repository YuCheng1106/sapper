import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import store from "./stores";  // 引入中文包
import '@ant-design/v5-patch-for-react-19';
import './assets/css/tailwind.css'

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={zhCN}
                theme={{
                    components: {
                        Splitter: {
                            splitBarSize: 10
                        },
                    },
                }}
            >
                <App />
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
);

