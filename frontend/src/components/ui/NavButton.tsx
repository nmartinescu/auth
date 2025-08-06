import { Button, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useColorModeValue } from "./color-mode";
import type { ButtonProps } from "@chakra-ui/react";
import type { NavItem } from "../../types/Navbar";

export function NavButton({ to, label, icon: Icon }: NavItem) {
    const textColor = useColorModeValue("#111827", "#F7FAFC");
    const hoverBg = useColorModeValue("#e5e7eb", "#4A5568");

    const navButtonStyle: ButtonProps = {
        asChild: true,
        variant: "ghost",
        color: textColor,
        _hover: {
            bg: hoverBg,
        },
    };

    return (
        <Button {...navButtonStyle}>
            <Link to={to}>
                <Flex align="center" w="full" gap="2">
                    {Icon && <Icon />}
                    <Flex flex="1" justify="center">
                        <span>{label}</span>
                    </Flex>
                </Flex>
            </Link>
        </Button>
    );
}