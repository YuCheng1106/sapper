import {MenuItem} from '../../../types/menu.ts';
import {
    ShopOutlined,
} from "@ant-design/icons";
import {Menu} from "antd";
import {useNavigate} from "react-router-dom";

interface DiscoverSubMenuProps {
    items: MenuItem[]
    selectedKeys: string[];
    onItemClick: (key: string) => void;
}

const DiscoverSubMenu = ({items, selectedKeys, onItemClick }: DiscoverSubMenuProps) => {
    const navigate = useNavigate();

    return (
        <div className="w-[160px] bg-[#FAFAFA] border-l border-[#F2F4F7] py-3">
            <div
                className="mx-2 px-2 py-2 text-[#344054] font-medium text-sm flex items-center gap-2 cursor-pointer hover:bg-[#EAECF0] rounded-lg transition-colors duration-200"
                onClick={() => navigate(`/discover`)}
            >
                <div className="w-6 h-6 rounded-md bg-[#7F56D9] flex items-center justify-center text-white">
                    <ShopOutlined className="text-sm" />
                </div>
                <span>项目发现</span>
            </div>

            <div className="mt-2 mx-2 space-y-1">
                <Menu
                    className={`bg-[#FAFAFA]`}
                    selectedKeys={selectedKeys}
                    onClick={({key}) => onItemClick(key)}
                    items={items}
                    style={{ height: 'calc(100% - 60px)', borderRight: 0 }}
                />
            </div>
        </div>
    );
};

export default DiscoverSubMenu;