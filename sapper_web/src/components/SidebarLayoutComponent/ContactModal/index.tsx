import { Modal } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';


interface ContactModalProps {
    open: boolean;
    onCancel: () => void;
}

const ContactModal = ({open, onCancel}: ContactModalProps) => {

    return (
        <AnimatePresence>
            <Modal
                open={open}
                onCancel={onCancel}
                footer={null}
                width={400}
                centered
                className="[&_.ant-modal-content]:p-6"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        联系我们
                    </h3>

                    <div className="relative">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-2xl mb-6"
                        >
                            <img
                                src="https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg"
                                alt="联系我们"
                                className="w-48 h-48 mx-auto rounded-lg shadow-lg"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 text-sm"
                        >
                            <p className="mb-2">扫描上方二维码添加客服微信</p>
                            <p className="text-gray-400">工作时间：周一至周五 9:00-18:00</p>
                        </motion.div>
                    </div>
                </motion.div>
            </Modal>
        </AnimatePresence>
    );
};

export default ContactModal;