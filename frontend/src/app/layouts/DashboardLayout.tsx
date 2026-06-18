import { Box, CssBaseline, Toolbar } from "@mui/material";

import { Outlet } from "react-router-dom";

import { Navbar } from "../components/navbar/Navbar";
import { Sidebar } from "../components/sidebar/Sidebar";
import { useState } from "react";

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Navbar
        onToggleSidebar={handleToggleSidebar}
        onMobileOpen={handleMobileOpen}
      />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
};
