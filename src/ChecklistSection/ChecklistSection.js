// src/ChecklistSection.js

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { calculateResetTime, formatTimeRemaining } from './utils';
import styles from './ChecklistSection.module.css'; // Import CSS module

function ChecklistSection({
  title,
  tasks,
  storageKey,
  resetConfig,
  isSharedReset,
}) {
  const [checkedItems, setCheckedItems] = useState(() => {
    const savedCheckedItems = JSON.parse(
      localStorage.getItem(`${storageKey}_checkedItems`)
    ) || {};
    return savedCheckedItems;
  });

  const [sectionResetTime, setSectionResetTime] = useState(() => {
    const savedResetTime = localStorage.getItem(`${storageKey}_resetTime`);
    return savedResetTime ? parseInt(savedResetTime, 10) : null;
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Initialize section reset time if shared reset and not already set
  useEffect(() => {
    if (isSharedReset && !sectionResetTime) {
      const resetTime = calculateResetTime(resetConfig);
      setSectionResetTime(resetTime);
    }
  }, [isSharedReset, sectionResetTime, resetConfig]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      `${storageKey}_checkedItems`,
      JSON.stringify(checkedItems)
    );
    if (isSharedReset && sectionResetTime) {
      localStorage.setItem(
        `${storageKey}_resetTime`,
        sectionResetTime.toString()
      );
    }
  }, [checkedItems, sectionResetTime, storageKey, isSharedReset]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Reset logic for shared reset times
  useEffect(() => {
    if (isSharedReset && sectionResetTime) {
      if (currentTime >= sectionResetTime) {
        // Reset all checked items
        setCheckedItems({});
        // Calculate next reset time
        const nextResetTime = calculateResetTime(resetConfig);
        setSectionResetTime(nextResetTime);
      }
    }
  }, [currentTime, sectionResetTime, isSharedReset, resetConfig]);

  // Reset logic for individual reset times
  useEffect(() => {
    if (!isSharedReset) {
      const newCheckedItems = { ...checkedItems };
      let hasChanges = false;

      for (const [taskId, item] of Object.entries(checkedItems)) {
        if (item.resetTime <= currentTime) {
          delete newCheckedItems[taskId];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setCheckedItems(newCheckedItems);
      }
    }
  }, [currentTime, checkedItems, isSharedReset]);

  const handleToggle = (taskId) => () => {
    setCheckedItems((prev) => {
      const newCheckedItems = { ...prev };
      if (newCheckedItems[taskId]) {
        // Task is currently checked, so uncheck it
        delete newCheckedItems[taskId];
      } else {
        // Task is not checked, so check it
        if (isSharedReset) {
          newCheckedItems[taskId] = true; // No need to store resetTime
        } else {
          // Calculate resetTime for individual tasks
          const resetTime = calculateResetTime(resetConfig);
          newCheckedItems[taskId] = { resetTime };
        }
      }
      return newCheckedItems;
    });
  };

  // Calculate section time remaining for shared resets
  let sectionTimeRemaining = null;
  if (isSharedReset && sectionResetTime) {
    sectionTimeRemaining = sectionResetTime - currentTime;
  }

  return (
    <Card className={styles.card}>
      <CardContent>
        <div className={styles.sectionHeader}>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          {isSharedReset && sectionTimeRemaining != null && sectionTimeRemaining > 0 && (
            <Typography variant="body2" color="textSecondary">
              Resets in {formatTimeRemaining(sectionTimeRemaining)}
            </Typography>
          )}
        </div>
        <List>
          {tasks.map((task) => {
            const isChecked = !!checkedItems[task.id];
            let timeRemaining = null;

            if (isChecked && !isSharedReset) {
              const taskResetTime = checkedItems[task.id].resetTime;
              timeRemaining = taskResetTime - currentTime;
            }

            return (
              <ListItem key={task.id} disablePadding className={styles.listItem}>
                <FormControlLabel
                  className={styles.checkboxLabel}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleToggle(task.id)}
                    />
                  }
                  label={
                    <div className={styles.taskName}>
                      {task.name}
                      {!isSharedReset && isChecked && timeRemaining != null && timeRemaining > 0 && (
                        <Typography variant="body2" className={styles.resetTimer}>
                          Resets in {formatTimeRemaining(timeRemaining)}
                        </Typography>
                      )}
                    </div>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}

export default ChecklistSection;
