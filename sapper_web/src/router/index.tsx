import {Route, Routes, Outlet, Navigate} from 'react-router-dom';
import { BrowserRouter as Router } from "react-router-dom";
import {isLogin} from "../utils/auth/";
import SidebarLayout from '../components/SidebarLayoutComponent';
import {
    KnowledgeBasePage,
    PluginBasePage,
    AgentBasePage,
    MarketPage,
    AgentWorkspacePage,
    AgentDisplayPage,
    KnowledgeBaseWorkspacePage,
    PluginWorkspacePage,
    TutorialPage,
    UseCasePage,
    UserCenterPage,
    AgentPublishPage,
    PortalPage,
    PortalLoginPage,
    PortalRegisterPage,
    AuthCallbackPage, PluginMarketPage
} from '../pages';
import React from "react";


interface ProtectedRouteProps {
    isLoggedIn: boolean;
    redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isLoggedIn }) => {
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
    // return <Outlet />
};

const AppRouter = () => {
    // Check if the user is logged in by verifying token
    const isLoggedIn = isLogin();

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<PortalLoginPage />} />
                <Route path="/register" element={<PortalRegisterPage />} />
                <Route path="/" element={<PortalPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                {/* Protected routes */}
                <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
                    <Route element={<SidebarLayout />}>
                        <Route path="/workspace/knowledge" element={<KnowledgeBasePage />} />
                        <Route path="/workspace/plugin" element={<PluginBasePage />} />
                        <Route path="/workspace/agent" element={<AgentBasePage />} />
                        <Route path="/workspace" element={<AgentBasePage />} />

                        <Route path="/usercenter" element={<UserCenterPage />} />
                        <Route path="/sapper" element={<AgentBasePage />} />
                        <Route path="/discover" element={<MarketPage />} />
                        <Route path="/discover/:tag" element={<MarketPage />} />
                        <Route path="/plugins" element={<PluginMarketPage />} />
                    </Route>
                    <Route path="/agent/display/:id" element={<AgentDisplayPage />} />

                    <Route path="/workspace/agent/:id" element={<AgentWorkspacePage />} />
                    <Route path="/workspace/knowledge/:id" element={<KnowledgeBaseWorkspacePage />} />
                    <Route path="/workspace/plugin/:id" element={<PluginWorkspacePage />} />

                    <Route path="/workspace/agent/:id/publish" element={<AgentPublishPage />} />
                </Route>

                <Route element={<SidebarLayout />}>
                    {/* Other routes outside protected area */}
                    <Route path="/tutorial" element={<TutorialPage />} />
                    <Route path="/case" element={<UseCasePage />} />
                </Route>

            </Routes>
        </Router>
    );
};

export default AppRouter;