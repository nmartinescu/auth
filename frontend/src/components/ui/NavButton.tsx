import { Button, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { ButtonProps } from "@chakra-ui/react";
import type { NavItem } from "../../types/Navbar";

const navButtonStyle: ButtonProps = {
    asChild: true,
    variant: "ghost",
    _hover: {
        bg: "#e5e7eb",
    },
};

export function NavButton({ to, label, icon: Icon }: NavItem) {
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