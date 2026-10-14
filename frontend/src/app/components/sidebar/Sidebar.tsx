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
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { useState } from "react";

const drawerWidth = 240;
const collapsedWidth = 70;

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ collapsed, mobileOpen, onMobileClose }: Props) => {
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;
  const location = useLocation();
  const sectoresaprobados = useSelector((state: RootState) => state.auth.user);

  // Para saber si el acordeón debe estar abierto por ruta actual
  const isUsuarioActive = ["/usuario", "/perfil", "/item", "/item_perfil"].some(
    (p) => location.pathname.startsWith(p),
  );

  const [openUsuario, setOpenUsuario] = useState(isUsuarioActive);

  const filteredItems = MenuItems.filter((item) => {
    // si tiene hijos, mostrarlo si al menos 1 hijo está permitido
    if (item.children) {
      return item.children.some(
        (child) => sectoresaprobados?.items?.includes(child.text) ?? false,
      );
    }
    return sectoresaprobados?.items?.includes(item.text) ?? false;
  });

  const drawerContent = (
    <Box>
      <Toolbar />
      <List>
        {filteredItems.map((item) => {
          // ITEM CON HIJOS = ACORDEÓN
          if (item.children) {
            const visibleChildren = item.children.filter(
              (c) => sectoresaprobados?.items?.includes(c.text) ?? false,
            );

            return (
              <Box key={item.text}>
                <Tooltip
                  title={collapsed ? item.name : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    onClick={() => {
                      if (collapsed) return; // no expandir si está colapsado
                      setOpenUsuario(!openUsuario);
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.name} />
                        {openUsuario ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                <Collapse
                  in={collapsed ? false : openUsuario}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {visibleChildren.map((child) => (
                      <ListItemButton
                        key={child.text}
                        component={Link}
                        to={child.path}
                        onClick={onMobileClose}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
                {item.divider && (
                  <Divider component="li" sx={{ borderColor: "grey.700" }} />
                )}
              </Box>
            );
          }

          // ITEM NORMAL
          return (
            <Tooltip
              key={item.text}
              title={collapsed ? item.name : ""}
              placement="right"
              arrow
            >
              <Box>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={onMobileClose}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.name} />}
                </ListItemButton>
                {item.divider && (
                  <Divider component="li" sx={{ borderColor: "grey.700" }} />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: currentWidth,
          flexShrink: 0,
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
