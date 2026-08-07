import { MenuProps } from "antd";

export type MenuItem = Required<MenuProps>['items'][number] & {
    sideLabel?: string;
    path?: string;
    hasSubMenu?: boolean;
    customChildren?: MenuItem[];
};
