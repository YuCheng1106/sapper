import React, {useState} from 'react';
import {Container, Image, Navbar} from "react-bootstrap";
import {message, Modal, Input, MenuProps, Menu} from "antd";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

const logoImage = process.env.PUBLIC_URL + '/logo.png';
const userImage = "https://sapper3701-1316534880.cos.ap-nanjing.myqcloud.com/user_new.png";

const BlueFont = {
    color: '#1890ff',
    cursor: 'pointer',
}

const TopNavBar = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [keyInput, setKeyInput] = useState('');


    // 检查用户是否已登录
    const isLoggedIn = !!localStorage.getItem('userEmail');

    const handleLogout = () => {
        // 清除用户信息（在这种情况下，清除用户邮箱）
        localStorage.removeItem('userEmail');
        // 执行注销操作（例如，向服务器发送注销请求）
        message.success("Successful logout");
        window.location.href = `/login`;
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        // You can handle the key submission here
        console.log(keyInput);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleKeyChange = (e) => {
        setKeyInput(e.target.value);
    };

    return (
        <Navbar style={{height: "50px", backgroundColor: '#e2ebf0', border: '1px solid white'}}>
            <Navbar.Brand href="/sapper/introduce">
                {/*<Image*/}
                {/*  alt="logo"*/}
                {/*  src={logoImage}*/}
                {/*  width="35"*/}
                {/*  height="35"*/}
                {/*  className="d-inline-block align-top"*/}
                {/*/>{' '}*/}
                Prompt Sapper
            </Navbar.Brand>
            <div className="information">
                <div className="img-box">
                    <Image
                        alt="logo"
                        src={userImage}
                        width="35"
                        height="35"
                    />
                    <div className="menu">
                        <div className="menu-item">
                            <a></a>
                        </div>
                        {isLoggedIn ? (<div className="menu-item">
                            <a href="/usercenter">UserCenter</a>
                        </div>) : (<div className="menu-item">
                            <a href="/login">UserCenter</a>
                        </div>)}
                        <div className="menu-item">
                            <a style={BlueFont} onClick={showModal}>Key</a>
                            <Modal title="Enter Your Key" visible={isModalVisible} onOk={handleOk}
                                   onCancel={handleCancel}>
                                <Input type="password" placeholder="Fill in your key" value={keyInput}
                                       onChange={handleKeyChange}/>
                            </Modal>
                        </div>
                        <div className="menu-item">
                            {isLoggedIn ? (
                                // 如果用户已登录，则显示退出登录按钮
                                <a style={BlueFont} onClick={handleLogout}>LoginOut</a>
                            ) : (
                                // 如果用户未登录，则显示注册和登录按钮
                                <>
                                    <a href="/login">Login/Register</a>
                                </>)}
                        </div>
                    </div>
                </div>
            </div>
        </Navbar>
    );
};

const BottomNavBar = () => {
    return (
        <Navbar fixed="bottom" bg="dark" variant="dark">
            <Container>
                <Navbar.Text>
                    &copy; {new Date().getFullYear()} Your Company Name
                </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export {BottomNavBar, TopNavBar};
