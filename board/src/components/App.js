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
  const [navigationDirection, setNavigationDirection] = useState('current');
  const [isAnimating, setIsAnimating] = useState(false);

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
    setNavigationDirection('prev');
    setIsAnimating(true);
  };

  const handleNextWeek = () => {
    setNavigationDirection('next');
    setIsAnimating(true);
  };

  const handleCurrentWeek = () => {
    setNavigationDirection('current');
    setIsAnimating(true);
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
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = 'Enter password'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
            mb={25}
            height="38px"
            width="240px"
            borderColor="lightgrey"
            borderWidth="2px"
            borderRadius="4px"
            _focus={{ placeholder: '' }}
            _active={{ placeholder: '' }}
            _placeholder={{ color: "grey" }}
            textAlign="center"
            fontSize="18px"
            style={{
              border: '2px solid grey',
            }}
          />
          <Button
            onClick={handleLogin}
            bg="#ED7D31"
            color="white"
            _hover={{ bg: "#F1995D" }}
            _active={{ bg: "#ED7D31" }}
            borderRadius="4px"
            border="none"
            fontSize="18px"
            height="36px"
            width="120px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            pt="2px"
            type="submit"
          >
            Login
          </Button>
          {error && (
            <Text color="red" mt={15}>
              {error}
            </Text>
          )}
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Flex direction="column" align="left" justify="center" minH="100vh">
        <Box w="100%" bg="white" p={2} mb={8} boxShadow="none">
          <Flex justifyContent="space-between" alignItems="left" w="95%">
            <Box flex="1" ml={view === 'calendar' ? '1' : '192'} mt={view === 'calendar' ? '1' : '5'}>
              <Heading as="h1" color="#ED7D31" fontWeight="500" textAlign="left">
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
              <HStack mr={-100}>
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
        {view === 'calendar' ? (
          <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} weekNumber={weekNumber} handlePrevWeek={handlePrevWeek} handleNextWeek={handleNextWeek} handleCurrentWeek={handleCurrentWeek} navigationDirection={navigationDirection} isAnimating={isAnimating} setIsAnimating={setIsAnimating} />
        ) : (
          <JobsTable />
        )}
      </Flex>
    </ChakraProvider>
  );
};

export default App;