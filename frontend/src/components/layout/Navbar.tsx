import { Flex, Heading, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { NavButton } from "../ui/NavButton";
import { useColorModeValue } from "../ui/color-mode";
import { LuCpu, LuMemoryStick, LuHardDrive, LuLogOut, LuLogIn, LuLayoutDashboard, LuFileText } from "react-icons/lu";
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
        { to: "/test", label: "Test", icon: LuFileText },
    ];

    const loggedInNavItems = [
        { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
        ...navItems,
    ];

    const navBg = useColorModeValue("#f0f0f0", "#2D3748");
    const borderColor = useColorModeValue("#e5e7eb", "#4A5568");
    const titleColor = useColorModeValue("#111827", "#F7FAFC");
    const buttonHoverBg = useColorModeValue("#e5e7eb", "#4A5568");

    return (
        <Flex
            as="nav"
            p={{ base: 1, md: 4 }}
            borderBottom={{
                base: `2px solid ${borderColor}`,
                md: `5px solid ${borderColor}`,
            }}
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "space-between" }}
            gap={{ base: 2, md: 0 }}
            justify="space-between"
            bg={navBg}
        >
            <Heading
                as={RouterLink}
                size={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                color={titleColor}
                _hover={{ textDecoration: "none", opacity: 0.8 }}
                transition="opacity 0.2s"
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
                        color={titleColor}
                        _hover={{
                            bg: buttonHoverBg,
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