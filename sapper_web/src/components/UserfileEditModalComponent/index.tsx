import React, { useEffect } from 'react';
import { Modal, Form, Input, Upload, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useDispatchUser } from "../../hooks/user";

// interface UserfileEditModalProps {
//     open: boolean;
//     onClose: () => void;
//     initialValues: {
//         nickname?: string;
//         avatar?: string;
//         description?: string;
//     };
// }
interface UserfileEditModalProps {
    open: boolean;
    onClose: () => void;
    initialValues: {
        nickname?: string;
        avatar?: string;
        description?: string;
    };
}

const UserfileEditModalComponent: React.FC<UserfileEditModalProps> = ({
                                                               open,
                                                               onClose,
                                                               initialValues
                                                           }) => {
    const [form] = Form.useForm();
    const dispatchUser = useDispatchUser();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await dispatchUser.updateUser(values.nickname, {
                nickname: values.nickname,

            });
            message.success('个人资料更新成功');
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            message.error('更新失败，请重试');
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件！');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片大小不能超过 2MB！');
            return false;
        }
        return true;
    };

    return (
        <AnimatePresence>
            {open && (
                <Modal
                    title={
                        <div className="text-[#1D2939] text-xl font-semibold">
                            编辑个人资料
                        </div>
                    }
                    open={open}
                    onCancel={onClose}
                    onOk={handleSubmit}
                    okButtonProps={{
                        className: 'bg-[#7F56D9] hover:bg-[#6941C6]'
                    }}
                    okText="保存"
                    cancelText="取消"
                    width={520}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="py-4"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            className="space-y-6"
                        >
                            <Form.Item
                                label="头像"
                                name="avatar"
                                className="mb-6"
                            >
                                <Upload
                                    name="avatar"
                                    listType="picture-circle"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    className="flex justify-center"
                                >
                                    {initialValues.avatar ? (
                                        <div className="relative group">
                                            <img
                                                src={initialValues.avatar}
                                                alt="头像"
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center border-2 border-dashed border-[#E4E7EC]">
                                            <Camera className="w-6 h-6 text-[#667085]" />
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                label="昵称"
                                name="nickname"
                                rules={[{ required: true, message: '请输入昵称' }]}
                            >
                                <Input
                                    placeholder="请输入昵称"
                                    className="rounded-lg border-[#E4E7EC] focus:border-[#7F56D9] focus:shadow-[0_0_0_4px_rgba(127,86,217,0.1)]"
                                />
                            </Form.Item>

                            <Form.Item
                                label="个人简介"
                                name="description"
                            >
                                <Input.TextArea
                                    placeholder="介绍一下自己吧"
                                    rows={4}
                                    className="rounded-lg border-[#E4E7EC] focus:border-[#7F56D9] focus:shadow-[0_0_0_4px_rgba(127,86,217,0.1)]"
                                />
                            </Form.Item>
                        </Form>
                    </motion.div>
                </Modal>
            )}
        </AnimatePresence>
    );
};

export default UserfileEditModalComponent;