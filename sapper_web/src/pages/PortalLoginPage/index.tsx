import { useCallback, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatchUser } from "../../hooks/user";
import { RootState } from "../../stores";
import { LoginData } from "../../types/userType";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Zap, Shield, Bot, Globe, Check } from "lucide-react";

const PortalLoginPage: React.FC = () => {
    // 原有登录逻辑状态
    const captchaSrc = useSelector((state: RootState) => state.user.captcha);
    const captchaId = useSelector((state: RootState) => state.user.captcha_id);
    const { status } = useSelector((state: RootState) => state.user);
    const { login, getCaptcha } = useDispatchUser();
    const hasFetchedCaptcha = useRef(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // 新界面状态
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        captcha: '',
        remember: false
    });


    // 动态背景状态
    const [gradientPosition, setGradientPosition] = useState({
        x: 0,
        y: 0
    });
    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth) * 100;
        const y = (clientY / window.innerHeight) * 100;
        setGradientPosition({ x, y });
    };
    const refreshCaptcha = useCallback(() => {
        getCaptcha();
    }, [getCaptcha]);

    useEffect(() => {
        if (!hasFetchedCaptcha.current) {
            refreshCaptcha();
            hasFetchedCaptcha.current = true;
        }
    }, [refreshCaptcha]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loginData: LoginData = {
            ...formData,
            captcha_id: captchaId
        };
        await login(loginData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const featureCards = [
        {
            icon: <Zap className="h-8 w-8 text-indigo-600" />,
            title: "快速部署",
            description: "几分钟内完成智能体的创建和部署",
            gradient: "from-indigo-500/20 to-purple-500/20"
        },
        {
            icon: <Shield className="h-8 w-8 text-indigo-600" />,
            title: "安全可靠",
            description: "企业级安全保障，数据加密存储",
            gradient: "from-blue-500/20 to-cyan-500/20"
        },
        {
            icon: <Bot className="h-8 w-8 text-indigo-600" />,
            title: "智能对话",
            description: "基于大语言模型的自然对话体验",
            gradient: "from-green-500/20 to-emerald-500/20"
        },
        {
            icon: <Globe className="h-8 w-8 text-indigo-600" />,
            title: "全平台支持",
            description: "支持多种平台接入，随处可用",
            gradient: "from-orange-500/20 to-amber-500/20"
        }
    ];

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* 动态渐变背景 */}
            <div
                className="absolute inset-0 -z-10 transition-all duration-1000 ease-out"
                style={{
                    // 替换原来的background简写属性
                    backgroundImage: `
          radial-gradient(
            circle at ${gradientPosition.x}% ${gradientPosition.y}%,
            rgba(99, 102, 241, 0.15) 0%,
            rgba(168, 85, 247, 0.1) 30%,
            rgba(236, 72, 153, 0.05) 60%,
            rgba(255, 255, 255, 1) 100%
          ),
          linear-gradient(
            135deg,
            rgba(224, 231, 255, 0.8) 0%,
            rgba(237, 233, 254, 0.8) 50%,
            rgba(253, 242, 248, 0.8) 100%
          )
        `,
                    backgroundColor: 'transparent', // 显式设置背景色
                    backgroundSize: '200% 200%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    animation: 'gradientFlow 15s ease infinite alternate'
                }}
            />

            {/* 背景装饰元素 */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-indigo-100/30 blur-xl"
                    initial={{
                        width: `${Math.random() * 200 + 100}px`,
                        height: `${Math.random() * 200 + 100}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
            ))}
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <motion.h1
                            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Sapper
                        </motion.h1>
                        {/*<nav className="hidden md:flex space-x-6">*/}
                        {/*    {['产品','文档'].map((item) => (*/}
                        {/*        <motion.a*/}
                        {/*            key={item}*/}
                        {/*            href="#"*/}
                        {/*            className="text-gray-600 hover:text-gray-900 relative"*/}
                        {/*            whileHover={{y: -2}}*/}
                        {/*        >*/}
                        {/*            {item}*/}
                        {/*            <motion.span*/}
                        {/*                className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"*/}
                        {/*                initial={{scaleX: 0}}*/}
                        {/*                whileHover={{scaleX: 1}}*/}
                        {/*                transition={{duration: 0.2}}*/}
                        {/*            />*/}
                        {/*        </motion.a>*/}
                        {/*    ))}*/}
                        {/*</nav>*/}
                    </div>

                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto flex items-center">
                    {/* Left Side - Product Info */}
                    <motion.div
                        className="hidden lg:block w-1/2 pr-12"
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6}}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            让每个好想法都能变成
                            <motion.span
                                className="text-indigo-600 block mt-2"
                                animate={{
                                    backgroundPosition: ["0% 0%", "100% 100%"],
                                    color: ["#4f46e5", "#7c3aed"]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                AI智能体
                            </motion.span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-12">
                            无需代码，快速打造AI智能体，一键生成，即时开启高效沟通
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {featureCards.map((card, index) => (
                                <motion.div
                                    key={card.title}
                                    className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl backdrop-blur-sm border border-white/20`}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: index * 0.1}}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <motion.div
                                        initial={{scale: 1}}
                                        whileHover={{scale: 1.1, rotate: 5}}
                                        transition={{type: "spring", stiffness: 400, damping: 10}}
                                    >
                                        {card.icon}
                                    </motion.div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{card.title}</h3>
                                    <p className="text-gray-600">{card.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Login Form */}
                    <motion.div
                        className="w-full lg:w-1/2 lg:pl-12"
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6}}
                    >
                        <motion.div
                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8"
                            whileHover={{boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)"}}
                        >
                            <motion.h2
                                className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                initial={{y: -20}}
                                animate={{y: 0}}
                                transition={{type: "spring", stiffness: 300, damping: 20}}
                            >
                                登录Sapper智能体平台
                            </motion.h2>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        用户名
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}

                                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                            placeholder="请输入用户名"
                                            required
                                        />

                                        <AnimatePresence>
                                            {formData.username && (
                                                <motion.div
                                                    initial={{opacity: 0, scale: 0.5}}
                                                    animate={{opacity: 1, scale: 1}}
                                                    exit={{opacity: 0, scale: 0.5}}
                                                    className="absolute right-3 top-1/3 -translate-y-1/2"
                                                >
                                                    <Check className="h-5 w-5 text-green-500"/>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        密码
                                    </label>
                                    <div className="relative">
                                        <input

                                            type={passwordVisible ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}

                                            className="hide-password-toggle block w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 pr-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                            placeholder="请输入密码"
                                            required
                                        />

                                        <motion.button
                                            type="button"
                                            whileHover={{scale: 1.1}}
                                            whileTap={{scale: 0.9}}
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/3 text-gray-400 hover:text-gray-600"
                                        >
                                            {passwordVisible ? <EyeOff className="h-5 w-5"/> :
                                                <Eye className="h-5 w-5"/>}
                                        </motion.button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        验证码
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                name="captcha"
                                                value={formData.captcha}
                                                onChange={handleChange}

                                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                                placeholder="请输入验证码"
                                                required
                                            />
                                        </div>
                                        <motion.div
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                            onClick={refreshCaptcha}
                                            className="cursor-pointer"
                                        >
                                            <img
                                                src={captchaSrc}
                                                alt="验证码"
                                                className="h-12 rounded-lg border border-gray-200"
                                            />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <motion.input
                                            whileTap={{scale: 0.9}}
                                            type="checkbox"
                                            name="remember"
                                            checked={formData.remember}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            记住我
                                        </label>
                                    </div>
                                    <motion.a
                                        href="#"
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                    >
                                        忘记密码？
                                    </motion.a>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="relative w-full flex justify-center items-center px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden group"
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                    disabled={status === 'loading'}
                                >
            <span className="relative z-10 flex items-center">
                {status === 'loading' ? '登录中...' : '登录'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
            </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700"
                                        initial={{x: "-100%"}}
                                        whileHover={{x: 0}}
                                        transition={{duration: 0.3}}
                                    />
                                </motion.button>

                                <div className="text-center text-sm">
                                    <span className="text-gray-500">还没有账号？</span>
                                    <Link to="/register">
                                        <motion.a
                                            className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
                                            whileHover={{scale: 1.05}}
                                            whileTap={{scale: 0.95}}
                                        >
                                            立即注册
                                        </motion.a>
                                    </Link>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Sapper智能体平台. 保留所有权利
                        </p>
                        <div className="mt-4 space-x-6">
                            {['隐私政策', '服务条款', '联系我们'].map((item) => (
                                <motion.a
                                    key={item}
                                    href="#"
                                    className="text-sm text-gray-500 hover:text-gray-900"
                                    whileHover={{y: -2}}
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default PortalLoginPage;