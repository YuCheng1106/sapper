import { useState } from 'react';
import { Card, Modal, Radio, RadioChangeEvent } from 'antd';
import './index.css';

interface CollectionCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onOk: (tab_key: string) => void;
}

const UPLOAD_OPTIONS = [
  {
    value: 'files',
    title: '本地文件',
    description: '上传 PDF、TXT、DOCX、CSV、XLSX、HTML、MD等格式的文件'
  },
  {
    value: 'graphs',
    title: '知识图谱',
    description: '上传 unigraph 中导出的图谱数据'
  }
];

const CollectionCreateModal = ({ visible, onClose, onOk }: CollectionCreateModalProps) => {
  const [uploadType, setUploadType] = useState<string>('file');

  const handleRadioChange = (e: RadioChangeEvent) => {
    setUploadType(e.target.value);
  };

  const handleSubmit = () => {
    onOk(uploadType);
    onClose();
  };

  return (
      <Modal
          title="选择数据来源"
          open={visible}
          onOk={handleSubmit}
          onCancel={onClose}
          width={500}
          okText="确认"
          cancelText="取消"
          centered
          className="collection-create-modal"
      >
        <Radio.Group
            onChange={handleRadioChange}
            value={uploadType}
            className="upload-type-radio-group"
        >
          {UPLOAD_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value} className="upload-type-option">
                <Card
                    title={option.title}
                    style={{marginTop: '15px'}}
                    className="upload-type-card"
                    styles={{
                      header: { padding: '0 16px', fontWeight: 'normal' },
                      body: { padding: '16px' }
                    }}
                >
                  {option.description}
                </Card>
              </Radio>
          ))}
        </Radio.Group>
      </Modal>
  );
};

export default CollectionCreateModal;