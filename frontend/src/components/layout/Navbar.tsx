import { Flex, Heading, Button } from "@chakra-ui/react";
import { NavButton } from "../ui/NavButton";
import { LuCpu, LuMemoryStick, LuHardDrive, LuLogOut, LuLogIn, LuLayoutDashboard } from "react-icons/lu";
import { useState, useEffect } from "react";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");
        setIsLoggedIn(!!(token && userData));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        window.location.href = "/login";
    };

    const navItems = [
        { to: "/process", label: "Process", icon: LuCpu },
        { to: "/memory", label: "Memory", icon: LuMemoryStick },
        { to: "/disk", label: "Disk", icon: LuHardDrive },
    ];

    const loggedInNavItems = [
        { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
        ...navItems,
    ];

    return (
        <Flex
            as="nav"
            p={{ base: 1, md: 4 }}
            borderBottom={{
                base: "2px solid #e5e7eb",
                md: "5px solid #e5e7eb",
            }}
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "space-between" }}
            gap={{ base: 2, md: 0 }}
            justify="space-between"
            bg="#f0f0f0"
        >
            <Heading
                size={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                color="#111827"
            >
                OS Sim
            </Heading>

            <Flex direction={{ base: "column", md: "row" }}>
                {(isLoggedIn ? loggedInNavItems : navItems).map((item) => (
                    <NavButton key={item.to} {...item} />
                ))}
                {isLoggedIn ? (
                    <Button
                        variant="ghost"
                        _hover={{
                            bg: "#e5e7eb",
                        }}
                        onClick={handleLogout}
                    >
                        <Flex align="center" w="full" gap="2">
                            <LuLogOut />
                            <Flex flex="1" justify="center">
                                <span>Logout</span>
                            </Flex>
                        </Flex>
                    </Button>
                ) : (
                    <NavButton to="/login" label="Login" icon={LuLogIn} />
                )}
            </Flex>
        </Flex>
    );
}