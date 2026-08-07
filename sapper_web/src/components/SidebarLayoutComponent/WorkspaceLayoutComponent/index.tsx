import {MenuItem} from '../../../types/menu.ts';
import {
    ProjectOutlined,
} from "@ant-design/icons";
import {Menu} from "antd";

interface WorkspaceSubMenuProps {
    items: MenuItem[]
    selectedKeys: string[];
    onItemClick: (key: string) => void;
}

const WorkspaceSubMenu = ({ items, selectedKeys, onItemClick }: WorkspaceSubMenuProps) => {

    return (
        <div className="py-3 h-100">
            <div className="px-4 py-2 text-[#344054] font-medium text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#7F56D9] flex items-center justify-center text-white">
                    <ProjectOutlined className="text-sm"/>
                </div>
                <span>工作空间</span>
            </div>

            <div className="mt-2 mx-2 space-y-1">
                <Menu
                    className={`bg-[#FAFAFA]`}
                    selectedKeys={selectedKeys}
                    onClick={({key}) => onItemClick(key)}
                    items={items}
                    style={{height: 'calc(100% - 60px)', borderRight: 0}}
                />
            </div>
        </div>
    );
};

export default WorkspaceSubMenu;