import React, { useState } from 'react';
import { ChakraProvider, Flex, Box, Text, IconButton, HStack, Heading, Input, Button, Tooltip } from '@chakra-ui/react';
import * as feather from 'feather-icons';
import CalendarView from './CalendarView';
import JobsTable from './JobsTable';

const FeatherIcon = ({ icon, size = 24, color = 'gray.500', onClick, tooltipText }) => {
  const iconSvg = feather.icons[icon].toSvg({ width: size, height: size });
  return (
    <Tooltip label={tooltipText} placement="bottom" gutter={-50}>
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
  const [view, setView] = useState('calendar');
  const [editableYear, setEditableYear] = useState(false);
  const [editableMonth, setEditableMonth] = useState(false);
  const [error, setError] = useState('');

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

  const toggleEditableYear = () => {
    setEditableYear(!editableYear);
  };

  const toggleEditableMonth = () => {
    setEditableMonth(!editableMonth);
  };

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    if (!isNaN(year)) {
      setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    }
  };

  const handleMonthChange = (event) => {
    const monthIndex = parseInt(event.target.value);
    if (!isNaN(monthIndex)) {
      setCurrentDate(new Date(currentDate.getFullYear(), monthIndex - 1, 1));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleViewChange = () => {
    setView(view === 'calendar' ? 'jobsTable' : 'calendar');
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

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
            height="30px"
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
            <Box flex="1" ml={view === 'calendar' ? '1' : '192'}>
              <Heading as="h1" color="#ED7D31" fontWeight="500" textAlign="left">
                {view === 'calendar' ? (
                  <Text as="span" display="flex" alignItems="center" justifyContent="flex-start">
                    {editableMonth ? (
                      <select
                        name="month"
                        value={currentDate.getMonth() + 1}
                        onChange={handleMonthChange}
                        onBlur={toggleEditableMonth}
                        autoFocus
                        style={{ width: 'auto', appearance: 'textfield', border: 'none', outline: 'none', marginRight: '0.5rem' }}
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Text as="span" onClick={toggleEditableMonth} style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                        {currentDate.toLocaleString('default', { month: 'long' })}
                      </Text>
                    )}
                    {editableYear ? (
                      <Input
                        type="number"
                        value={currentDate.getFullYear()}
                        onChange={handleYearChange}
                        onBlur={toggleEditableYear}
                        autoFocus
                        style={{ appearance: 'textfield', border: 'none', outline: 'none', width: '4rem' }}
                      />
                    ) : (
                      <Text as="span" onClick={toggleEditableYear} style={{ cursor: 'pointer' }}>
                        {currentDate.getFullYear()}
                      </Text>
                    )}
                  </Text>
                ) : (
                  'Jobs List'
                )}
              </Heading>
            </Box>
            {view === 'calendar' ? (
              <HStack spacing={0} ml="auto">
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="chevron-left"
                    size={24}
                    color="gray.500"
                    onClick={handlePrevMonth}
                    tooltipText="Previous Month"
                  />
                </Box>
                <Box width="30px" height="30px" display="flex" alignItems="center" justifyContent="center">
                  <FeatherIcon
                    icon="chevron-right"
                    size={24}
                    color="gray.500"
                    onClick={handleNextMonth}
                    tooltipText="Next Month"
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
          <CalendarView currentDate={currentDate} />
        ) : (
          <JobsTable />
        )}
      </Flex>
    </ChakraProvider>
  );
};

export default App;