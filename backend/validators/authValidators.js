export const validateRegistration = (data) => {
    const { name, email, password, confirmPassword } = data;
    const errors = [];

    if (!name || !email || !password || !confirmPassword) {
        errors.push("All fields are required");
    }

    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    if (password && password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    if (name && (name.length < 2 || name.length > 50)) {
        errors.push("Name must be between 2 and 50 characters");
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push("Please provide a valid email address");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateLogin = (data) => {
    const { email, password } = data;
    const errors = [];

    if (!email || !password) {
        errors.push("Email and password are required");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateForgotPassword = (data) => {
    const { email } = data;
    const errors = [];

    if (!email) {
        errors.push("Email is required");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateResetPassword = (data) => {
    const { token, newPassword, confirmPassword } = data;
    const errors = [];

    if (!token || !newPassword || !confirmPassword) {
        errors.push("Token, new password, and confirm password are required");
    }

    if (newPassword !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    if (newPassword && newPassword.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateAccountDeletion = (data) => {
    const { password, confirmDeletion } = data;
    const errors = [];

    if (!password) {
        errors.push("Password is required to delete account");
    }

    if (confirmDeletion !== "DELETE MY ACCOUNT") {
        errors.push("Please type 'DELETE MY ACCOUNT' to confirm deletion");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};