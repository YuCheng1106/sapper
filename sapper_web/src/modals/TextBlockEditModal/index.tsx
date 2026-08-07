import { useEffect, useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { PageLoading } from "@ant-design/pro-components";
import { useDispatchTextBlock, useTextBlockSelector } from "../../hooks/textBlock.ts";

interface TextBlockEditModalProps {
    text_block_id: number;
    open: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

const TextBlockEditModal = ({
                                   text_block_id,
                                   open,
                                   onCancel,
                                   onSuccess
                               }: TextBlockEditModalProps) => {
    const dispatch = useDispatchTextBlock();
    const [textBlockContent, setTextBlockContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const textBlockDetail = useTextBlockSelector((state) => state.textBlock.textBlockDetail);

    useEffect(() => {
        if (textBlockDetail?.content) {
            setTextBlockContent(textBlockDetail.content);
        }
    }, [text_block_id, open]);


    const handleOk = async () => {
        if (!textBlockContent.trim()) {
            message.warning('Please enter some content');
            return;
        }

        try {
            setLoading(true);
            await dispatch.updateTextBlockInfo(text_block_id, { content: textBlockContent });
            message.success('文本块更新成功');
            onSuccess?.(); // Call success callback if provided
            onCancel();
        } catch (error) {
            message.error('文本块更新失败');
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
            title="编辑文本块"
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
            {loading && !textBlockDetail ? (
                <PageLoading />
            ) : (
                <Input.TextArea
                    rows={10}
                    value={textBlockContent}
                    onChange={handleContentChange}
                    placeholder="Enter your text content here..."
                    disabled={loading}
                />
            )}
        </Modal>
    );
};

export default TextBlockEditModal;