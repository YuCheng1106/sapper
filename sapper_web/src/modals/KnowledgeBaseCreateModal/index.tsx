import { Modal, Form, Input, message } from 'antd';
import {KnowledgeBaseCreateReq} from "../../types/knowledgeBaseType.ts";

interface KnowledgeBaseCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (knowledge: KnowledgeBaseCreateReq) => void;
}

const EBInfoCreateModal = ({ visible, onClose, onCreate } : KnowledgeBaseCreateModalProps) => {
  const [form] = Form.useForm();
  form.setFieldsValue({ cover_image: "knowledge base avatar" });
  form.setFieldsValue({ status: 1 });

  const handleCreate = () => {
    form.validateFields()
      .then(values => {
        form.resetFields();
        onCreate(values);
        onClose();
      })
      .catch(info => {
        message.error('请检查输入内容', info);
      });
  };

  return (
    <Modal
      title="新建经验库"
      open={visible}
      onOk={handleCreate}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EBInfoCreateModal;
