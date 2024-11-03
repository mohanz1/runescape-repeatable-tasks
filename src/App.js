import React, { useState, useEffect } from 'react';
import data from './data.json';
import {
  Container,
  Typography,
  CssBaseline,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import ChecklistSection from './ChecklistSection/ChecklistSection';
import styles from './App.module.css'; // Import CSS module for App styling

function App() {
  // Initialize darkMode from localStorage or default to true
  const [darkMode, setDarkMode] = useState(() => {
    const savedPreference = localStorage.getItem('darkMode');
    return savedPreference !== null ? JSON.parse(savedPreference) : true;
  });

  // Save darkMode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  const handleThemeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" className={styles.container}>
        <Card className={styles.appCard}>
          <CardContent>
            <div className={styles.header}>
              <Typography variant="h4" gutterBottom>
                RuneScape Task Checklist
              </Typography>
              <IconButton onClick={handleThemeToggle} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </div>

            {/* Daily Tasks */}
            <ChecklistSection
              title="Daily Tasks"
              tasks={data.daily.tasks}
              storageKey="dailyTasks"
              resetConfig={data.daily.reset}
              isSharedReset={true}
            />

            {/* Weekly Tasks - Fixed Day */}
            <ChecklistSection
              title="Weekly Tasks (Fixed Day)"
              tasks={data.weekly.fixedDay.tasks}
              storageKey="weeklyTasksFixedDay"
              resetConfig={data.weekly.fixedDay.reset}
              isSharedReset={true}
            />

            {/* Weekly Tasks - After Completion */}
            <ChecklistSection
              title="Weekly Tasks (After Completion)"
              tasks={data.weekly.afterCompletion.tasks}
              storageKey="weeklyTasksAfterCompletion"
              resetConfig={data.weekly.afterCompletion.reset}
              isSharedReset={false}
            />

            {/* Monthly Tasks */}
            <ChecklistSection
              title="Monthly Tasks"
              tasks={data.monthly.tasks}
              storageKey="monthlyTasks"
              resetConfig={data.monthly.reset}
              isSharedReset={true}
            />
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}

export default App;
