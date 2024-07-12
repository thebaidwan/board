import React, { useState, useEffect } from 'react';
import { ChakraProvider, Flex, Box, Text, IconButton, HStack, Heading, Input, Button, Tooltip, Grid } from '@chakra-ui/react';
import * as feather from 'feather-icons';
import CalendarView from './CalendarView';
import JobsTable from './JobsTable';
import { AnimatePresence, motion } from 'framer-motion';

const MotionGrid = motion(Grid);

const FeatherIcon = ({ icon, size = 24, color = 'gray.500', onClick, tooltipText }) => {
  const iconSvg = feather.icons[icon].toSvg({ width: size, height: size });
  return (
    <Tooltip label={tooltipText} placement="bottom" gutter={-60}>
      <Box
        as="span"
        onClick={onClick}
        cursor={onClick ? 'pointer' : 'default'}
        display="inline-block"
        width={size}
        height={size}
        transition="opacity 0.3s"
        _hover={{ opacity: 0.8 }}
        marginTop={20}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    </Tooltip>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editableWeek, setEditableWeek] = useState(false);
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(currentDate));
  const [view, setView] = useState('calendar');
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setWeekNumber(getWeekNumber(currentDate));
  }, [currentDate]);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    if (password === 'GB') {
      setIsAuthenticated(true);
    } else {
      setError('Invalid password');
    }
  };

  const handlePrevWeek = () => {
    setIsAnimating(true);
    setAnimationKey(prevKey => prevKey + 1);
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getTime());
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNextWeek = () => {
    setIsAnimating(true);
    setAnimationKey(prevKey => prevKey + 1);
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getTime());
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCurrentWeek = () => {
    setIsAnimating(true);
    setAnimationKey(prevKey => prevKey + 1);
    setCurrentDate(new Date());
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleViewChange = () => {
    setView(view === 'calendar' ? 'jobsTable' : 'calendar');
  };

  const handleWeekChange = (e) => {
    setWeekNumber(parseInt(e.target.value));
  };

  const toggleEditableWeek = () => {
    setEditableWeek(!editableWeek);
  };

  const handleBlur = () => {
    setEditableWeek(false);
    setCurrentDate(getDateFromWeekNumber(weekNumber, currentDate.getFullYear()));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  function getWeekNumber(date) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    var weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return weekNumber;
  }

  function getDateFromWeekNumber(week, year) {
    var janFirst = new Date(year, 0, 1);
    var daysOffset = 1 - janFirst.getDay();
    var weekStart = new Date(year, 0, janFirst.getDate() + daysOffset + (week - 1) * 7);
    return weekStart;
  }

  if (!isAuthenticated) {
    return (
      <ChakraProvider>
        <Flex direction="column" align="center" justify="center" minH="100vh">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={handlePasswordChange}
            mb={6}
            size="lg"
            maxW="400px"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />
          <Button
            onClick={handleLogin}
            colorScheme="blue"
            size="lg"
            mt={6}
            type="submit"
          >
            Login
          </Button>
          {error && (
            <Text color="red.500" mt={4}>
              {error}
            </Text>
          )}
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Flex direction="column" align="left" justify="flex-start" minH="100vh">
        <Box w="100%" bg="white" p={2} mb={8} boxShadow="none">
          <Flex justifyContent="space-between" alignItems="left" w="95%">
            <Box flex="1" ml={view === 'calendar' ? '0' : '192'} mt={view === 'calendar' ? '1' : '5'}>
              <Heading as="h1" color="blue.500" fontWeight="500" textAlign="left">
                {view === 'calendar' ? (
                  <Flex align="center">
                    <Text>
                      {currentDate.getFullYear()} | Week&nbsp;
                    </Text>
                    {editableWeek ? (
                      <Input
                        type="number"
                        value={weekNumber}
                        onChange={handleWeekChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyPress}
                        autoFocus
                        style={{ width: 'auto', appearance: 'textfield', border: 'none', outline: 'none', marginRight: '0.5rem' }}
                      />
                    ) : (
                      <Text onClick={toggleEditableWeek} style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                        {weekNumber}
                      </Text>
                    )}
                  </Flex>
                ) : (
                  'Jobs List'
                )}
              </Heading>
            </Box>
            {view === 'calendar' ? (
              <HStack mr={-90}>
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="chevron-left"
                    size={24}
                    color="gray.500"
                    onClick={handlePrevWeek}
                    tooltipText="Previous Week"
                  />
                </Box>
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="chevron-right"
                    size={24}
                    color="gray.500"
                    onClick={handleNextWeek}
                    tooltipText="Next Week"
                  />
                </Box>
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="calendar"
                    size={24}
                    color="gray.500"
                    onClick={handleCurrentWeek}
                    tooltipText="Current Week"
                  />
                </Box>
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="list"
                    size={24}
                    color="gray.500"
                    onClick={handleViewChange}
                    tooltipText="Jobs List"
                  />
                </Box>
              </HStack>
            ) : (
              <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                <FeatherIcon
                  icon="x"
                  size={24}
                  color="gray.500"
                  onClick={handleViewChange}
                  tooltipText="Close"
                />
              </Box>
            )}
          </Flex>
        </Box>
        <AnimatePresence mode='wait'>
          {view === 'calendar' ? (
            <MotionGrid
              key={animationKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                weekNumber={weekNumber}
                handleViewChange={handleViewChange}
                handlePrevWeek={handlePrevWeek}
                handleNextWeek={handleNextWeek}
                handleCurrentWeek={handleCurrentWeek}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
              />
            </MotionGrid>
          ) : (
            <Grid key="jobsTable">
              <JobsTable />
            </Grid>
          )}
        </AnimatePresence>
      </Flex>
    </ChakraProvider>
  );
};

export default App;