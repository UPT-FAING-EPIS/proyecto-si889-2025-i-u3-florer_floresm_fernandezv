import React from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Toolbar, ListItemButton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';

interface SidebarMenuProps {
  onSelect: (option: string) => void;
  open: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onSelect, open, onClose }) => (
  <Drawer anchor="left" open={open} onClose={onClose}>
    <Toolbar />
    <List sx={{ width: 250 }}>
      <ListItemButton onClick={() => { onSelect('main-menu'); onClose(); }}>
        <ListItemIcon><HomeIcon /></ListItemIcon>
        <ListItemText primary="Menú principal" />
      </ListItemButton>
      <ListItemButton onClick={() => { onSelect('version-history'); onClose(); }}>
        <ListItemIcon><HistoryIcon /></ListItemIcon>
        <ListItemText primary="Historial de versiones" />
      </ListItemButton>
    </List>
  </Drawer>
);

export default SidebarMenu;
