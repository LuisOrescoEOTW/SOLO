import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { MenuItems } from "./MenuItems";

const drawerWidth = 240;
const collapsedWidth = 70;

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ collapsed, mobileOpen, onMobileClose }: Props) => {
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const drawerContent = (
    <Box>
      <Toolbar />

      <List>
        {MenuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={collapsed ? item.text : ""}
            placement="right"
            arrow
          >
            <Box>
              {item.text == "Usuarios" && <Divider component="li" />}
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                onClick={onMobileClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: {
                        xs: 1,
                        md: collapsed ? 0 : 1,
                      },

                      display: {
                        xs: "block",
                        md: collapsed ? "none" : "block",
                      },

                      transition: "opacity 0.2s ease",
                    }}
                  />
                )}
              </ListItemButton>
            </Box>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* MOBILE */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DESKTOP */}

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },

          width: currentWidth,

          flexShrink: 0,

          transition: "all 0.3s ease",

          "& .MuiDrawer-paper": {
            width: currentWidth,

            boxSizing: "border-box",

            overflowX: "hidden",

            transition: "all 0.3s ease",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
