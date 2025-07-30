import { LuCpu, LuMemoryStick, LuHardDrive } from "react-icons/lu"

import type { NavItem } from "../types/Navbar";

export const navItems: NavItem[] = [
    { to: "/process", label: "Process", icon: LuCpu },
    { to: "/memory", label: "Memory", icon: LuMemoryStick },
    { to: "/disk", label: "Disk", icon: LuHardDrive },
    { to: "/login", label: "Login" },
];