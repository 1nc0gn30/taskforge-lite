import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  Paper, 
  useTheme, 
  useMediaQuery, 
  AppBar, 
  Toolbar, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import Users from './components/Users';
import Tasks from './components/Tasks';
import Comments from './components/Comments';
import ResetButton from './components/ResetButton';
import api from './services/api';

function App() {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [counts, setCounts] = useState({
    users: 0,
    tasks: 0,
    comments: 0
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleChange = (_, newValue) => {
    setTab(newValue);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // In a real app, you would change the theme here
    // using a theme provider from MUI or your own solution
  };

  // Fetch data counts for badges
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, tasksRes, commentsRes] = await Promise.all([
          api.get('/users/count'),
          api.get('/tasks/count'),
          api.get('/comments/count')
        ]);
        
        setCounts({
          users: usersRes.data.count || 0,
          tasks: tasksRes.data.count || 0,
          comments: commentsRes.data.count || 0
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    
    fetchCounts();
    // Set up a refresh interval - in a real app you might want to use websockets instead
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabContent = [
    <Users key="users" />,
    <Tasks key="tasks" />,
    <Comments key="comments" />,
  ];
  
  const drawerWidth = 240;
  
  const tabItems = [
    { label: 'Users', icon: <PeopleIcon />, count: counts.users },
    { label: 'Tasks', icon: <AssignmentIcon />, count: counts.tasks },
    { label: 'Comments', icon: <CommentIcon />, count: counts.comments }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: darkMode ? 'rgb(18, 18, 18)' : 'rgb(245, 245, 245)',
      transition: 'background-color 0.3s ease'
    }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          bgcolor: darkMode ? 'rgb(30, 30, 30)' : 'primary.main',
          boxShadow: 3
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              TaskForge Lite
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Box sx={{ ml: 2 }}>
            <ResetButton />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar / Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: darkMode ? 'rgb(30, 30, 30)' : 'background.paper',
            color: darkMode ? 'white' : 'inherit',
          },
        }}
      >
        <Toolbar />
        
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        
        <Divider />
        
        <List sx={{ mt: 2 }}>
          {tabItems.map((item, index) => (
            <ListItem 
              button 
              key={item.label} 
              selected={tab === index}
              onClick={() => handleChange(null, index)}
              sx={{ 
                mb: 1, 
                borderRadius: '0 20px 20px 0', 
                ml: 1, 
                pl: 2,
                '&.Mui-selected': {
                  bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <ListItemIcon sx={{ color: tab === index ? 'primary.main' : 'grey' }}>
                <Badge badgeContent={item.count} color="primary" max={999}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: tab === index ? 'bold' : 'normal',
                  color: tab === index ? '#087445' : 'grey'
                }} 
              />
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            TaskForge Lite v1.0
          </Typography>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              bgcolor: darkMode ? 'rgb(40, 40, 40)' : 'white',
              color: darkMode ? 'white' : 'inherit',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: darkMode ? 'white' : 'black' }}>
              {tabItems[tab].label}
            </Typography>
            
            {!isMobile && (
              <Tabs
                value={tab}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                variant="fullWidth"
                sx={{mb: 4, color: darkMode ? 'white' : 'black'}}
              >
                {tabItems.map((item) => (
                  <Tab 
                    key={item.label} 
                    label={item.label} 
                    icon={item.icon} 
                    iconPosition="start"
                    sx={{color: darkMode ? 'white' : 'black'}}
                  />
                ))}
              </Tabs>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: '50vh' }}
              >
                <Box>{tabContent[tab]}</Box>
              </motion.div>
            </AnimatePresence>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default App;