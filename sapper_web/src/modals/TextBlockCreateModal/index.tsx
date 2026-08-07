import { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { useDispatchTextBlock} from "../../hooks/textBlock.ts";

interface TextBlockCreateModalProps {
    collection_id: number;
    open: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

const TextBlockCreateModal = ({
                                collection_id,
                                open,
                                onCancel,
                                onSuccess
                            }: TextBlockCreateModalProps) => {
    const dispatch = useDispatchTextBlock();
    const [textBlockContent, setTextBlockContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const handleOk = async () => {
        if (!textBlockContent.trim()) {
            message.warning('请输入内容！');
            return;
        }

        try {
            setLoading(true);
            await dispatch.addTextBlock({text_collection_id: collection_id, content: textBlockContent });
            message.success('添加成功');
            setTextBlockContent("")
            onSuccess?.();
            onCancel();
        } catch (error) {
            message.error('添加失败');
            console.error('Error updating text block:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextBlockContent(e.target.value);
    };

    return (
        <Modal
            width='90%'
            title="创建文本块"
            open={open}
            onCancel={onCancel}
            confirmLoading={loading}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleOk}
                >
                    保存
                </Button>,
            ]}
        >
            <Input.TextArea
                rows={10}
                value={textBlockContent}
                onChange={handleContentChange}
                placeholder="在这里输入文本块的内容"
                disabled={loading}
            />
        </Modal>
    );
};

export default TextBlockCreateModal;