import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/core/Navbar";
import { Process } from "./components/core/Process";
import { Memory } from "./components/core/Memory";
import { Disk } from "./components/core/Disk";
import { Login } from "./components/core/Login";
import { Register } from "./components/core/Register";
import { ForgotPassword } from "./components/core/ForgotPassword";
import { ResetPassword } from "./components/core/ResetPassword";
import { Dashboard } from "./components/core/Dashboard";
import { DeleteAccount } from "./components/core/DeleteAccount";
import { ProtectedRoute } from "./components/core/ProtectedRoute";
import { Box } from "@chakra-ui/react";

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
        </Box>
    );
}

export default App;
