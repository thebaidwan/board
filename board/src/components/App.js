import React, { useState, useEffect } from 'react';
import { ChakraProvider, Flex, Box, Text, IconButton, HStack, Heading, Input, Button, Tooltip, Grid, Table, Tbody, Tr, Td, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';
import * as feather from 'feather-icons';
import CalendarView from './CalendarView';
import JobsTable from './JobsTable';
import { AnimatePresence, motion } from 'framer-motion';
import { Clipboard, CheckCircle, Zap } from 'react-feather';

const MotionGrid = motion(Grid);

const FeatherIcon = ({ icon, size = 24, color = 'gray.300', onClick, tooltipText }) => {
  const iconSvg = feather.icons[icon].toSvg({ width: size, height: size });
  return (
    <Tooltip label={tooltipText} placement="bottom">
      <Box
        as="span"
        onClick={onClick}
        cursor={onClick ? 'pointer' : 'default'}
        display="inline-block"
        width={`${size}px`}
        height={`${size}px`}
        transition="color 0.3s"
        color={color}
        _hover={{ color: 'gray.800' }}
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
          <Box
            p={6}
            borderRadius="md"
            boxShadow="md"
            bg="white"
            maxW="400px"
            w="full"
          >
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={handlePasswordChange}
              mb={4}
              size="lg"
              isFullWidth
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
              w="40%"
              mb={4}
              type="submit"
              display="block"
              margin="0 auto"
            >
              Login
            </Button>
            {error && (
              <Text color="red.500">
                {error}
              </Text>
            )}
          </Box>
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
              <Flex align="center">
                <Heading as="h1" color="#2B6CB0" fontWeight="500" textAlign="left">
                  {view === 'calendar' ? (
                    <Flex align="center">
                      <Text fontSize="30px" fontWeight="bold" color="blue.800" bg="gray.100" p={2} borderRadius="md">
                        {currentDate.getFullYear()} <span style={{ margin: '0 4px' }}>•</span> Week{' '}
                        {editableWeek ? (
                          <Tooltip label="Edit Week" aria-label="Edit Week">
                            <Text
                              as="input"
                              type="number"
                              value={weekNumber}
                              onChange={handleWeekChange}
                              onBlur={handleBlur}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              style={{
                                width: '50px',
                                height: '28px',
                                appearance: 'textfield',
                                border: 'none',
                                outline: 'none',
                                background: 'gray.100',
                                color: 'blue.800',
                                fontWeight: 'bold',
                                fontSize: '30px',
                                padding: '2px',
                                borderRadius: 'md',
                                marginRight: '0.5rem',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip label="Edit Week" aria-label="Edit Week">
                            <Text
                              as="span"
                              onClick={toggleEditableWeek}
                              style={{
                                cursor: 'pointer',
                                marginRight: '0.5rem',
                                background: 'gray.100',
                                color: 'blue.800',
                                fontWeight: 'bold',
                                fontSize: '30px',
                                padding: '2px',
                                borderRadius: 'md',
                              }}
                            >
                              {weekNumber}
                            </Text>
                          </Tooltip>
                        )}
                      </Text>
                      <Popover trigger="hover" placement="bottom">
                        <PopoverTrigger>
                          <Box as="span" ml={2} cursor="pointer">
                            <FeatherIcon icon="info" size={24} color="gray.400" />
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent border="none" boxShadow="none" bg="transparent">
                          <PopoverBody p={0}>
                            <Box p={4} borderRadius="md" bg="gray.50" boxShadow="lg">
                              <Text fontWeight="bold" mb={4} color="gray.600" fontSize='20px'>Icon Legend</Text>
                              <Table variant="simple" size="sm" p={2}>
                                <Tbody>
                                  <Tr>
                                    <Td>
                                      <Box w="12px" h="12px" borderRadius="full" bg="blue.500" display="inline-block" />
                                    </Td>
                                    <Td color="gray.600">Aluminum</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <Box w="12px" h="12px" borderRadius="full" bg="red.500" display="inline-block" />
                                    </Td>
                                    <Td color="gray.600">Steel</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <Box w="12px" h="12px" borderRadius="full" bg="yellow.500" display="inline-block" />
                                    </Td>
                                    <Td color="gray.600">Vinyl</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <Box w="12px" h="12px" borderRadius="full" bg="gray.500" display="inline-block" />
                                    </Td>
                                    <Td color="gray.600">Unknown</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <Clipboard size={14} style={{ color: '#9B59B6' }} />
                                    </Td>
                                    <Td color="gray.600">Test Fit Required</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <CheckCircle size={14} style={{ color: '#9B59B6' }} />
                                    </Td>
                                    <Td color="gray.600">Test Fit Scheduled</Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <Zap size={14} style={{ color: '#D53F8C' }} />
                                    </Td>
                                    <Td color="gray.600">Rush</Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </Box>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Flex>
                  ) : (
                    <Text fontSize="30px" fontWeight="bold" color="blue.800" bg="gray.100" p={2} borderRadius="md" display="inline-block">
                      Jobs
                    </Text>
                  )}
                </Heading>
              </Flex>
            </Box>
            {view === 'calendar' ? (
              <HStack
                spacing={4}
                mr={0}
                ml={{ base: 4, md: 0 }}
                mt={2}
                justifyContent={{ base: "flex-end", md: "flex-end" }}
                position={{ base: "relative", md: "absolute" }}
                right={{ base: "0", md: "0" }}
              >
                <FeatherIcon
                  icon="chevron-left"
                  size={24}
                  color="gray.400"
                  onClick={handlePrevWeek}
                  tooltipText="Previous Week"
                />
                <FeatherIcon
                  icon="chevron-right"
                  size={24}
                  color="gray.400"
                  onClick={handleNextWeek}
                  tooltipText="Next Week"
                />
                <FeatherIcon
                  icon="calendar"
                  size={24}
                  color="gray.400"
                  onClick={handleCurrentWeek}
                  tooltipText="Current Week"
                />
                <FeatherIcon
                  icon="list"
                  size={24}
                  color="gray.400"
                  onClick={handleViewChange}
                  tooltipText="Jobs"
                />
              </HStack>
            ) : (
              <Box mt={1}>
                <FeatherIcon
                  icon="x"
                  size={24}
                  color="gray.400"
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
            <motion.div
              key="jobsTable"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Grid>
                <JobsTable />
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
        <Box
          position="fixed"
          bottom="50%"
          left="4"
          zIndex="1000"
          opacity={0}
          transition="opacity 0.3s"
          className="fab-left"
          transform="translateY(50%)"
        >
          <IconButton
            icon={<FeatherIcon icon="chevron-left" />}
            aria-label="Previous Week"
            onClick={handlePrevWeek}
            size="lg"
            borderRadius="full"
            boxShadow="md"
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
          />
        </Box>
        <Box
          position="fixed"
          bottom="50%"
          right="4"
          zIndex="1000"
          opacity={0}
          transition="opacity 0.3s"
          className="fab-right"
          transform="translateY(50%)"
        >
          <IconButton
            icon={<FeatherIcon icon="chevron-right" />}
            aria-label="Next Week"
            onClick={handleNextWeek}
            size="lg"
            borderRadius="full"
            boxShadow="md"
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
          />
        </Box>
      </Flex>
      <style jsx>{`
        .fab-left:hover, .fab-right:hover {
          opacity: 1 !important;
        }
        .fab-left:hover ~ .fab-left, .fab-right:hover ~ .fab-right {
          opacity: 1 !important;
        }
      `}</style>
    </ChakraProvider>
  );
};

export default App;