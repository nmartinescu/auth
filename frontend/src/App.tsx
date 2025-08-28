import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Process } from "./components/features/Process";
import { Memory } from "./components/features/Memory";
import { Disk } from "./components/features/Disk";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { Dashboard } from "./components/dashboard/Dashboard";
import { DeleteAccount } from "./components/auth/DeleteAccount";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { Box } from "@chakra-ui/react";
import TestContainer from "./components/TestContainer";

function App() {
    return (
        <Box minH="100vh">
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/process" element={<Process />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/disk" element={<Disk />} />
                <Route path="/test" element={<TestContainer />} />
                
                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/delete-account"
                    element={
                        <ProtectedRoute>
                            <DeleteAccount />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/process" replace />} />
            </Routes>
            
            {/* Theme Toggle - Fixed position in bottom right */}
            <ThemeToggle />
        </Box>
    );
}

export default App;
