import type { IconType } from "react-icons";

export interface NavItem {
    to: string;
    label: string;
    icon?: IconType;
}