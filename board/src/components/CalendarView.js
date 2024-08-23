import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td, Flex, Tooltip, useToast, ChakraProvider, IconButton, Skeleton, Input,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Info, Plus, Search, Zap, Clipboard, CheckCircle } from 'react-feather';
import axios from 'axios';

const MotionBox = motion(Box);

const CalendarView = ({ currentDate, weekNumber, setCurrentDate, isAnimating, setIsAnimating }) => {
  const toast = useToast();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkedJobs, setCheckedJobs] = useState([]);
  const [modalKey, setModalKey] = useState(0);
  const [totalJobValue, setTotalJobValue] = useState(0);
  const [doubleClickedJob, setDoubleClickedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const fetchJobs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/jobdetails`);
      setJobs(res.data);

      const initialSelectedJobs = {};
      res.data.forEach(job => {
        job.Schedule.forEach(date => {
          if (!initialSelectedJobs[date]) {
            initialSelectedJobs[date] = [];
          }
          initialSelectedJobs[date].push(job);
        });
      });
      setSelectedJobs(initialSelectedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setErrorMessage("Unable to fetch jobs. Please reload the app or try again later.");
      toast({
        title: "Error",
        description: "Unable to fetch jobs.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [toast]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setCurrentDate(new Date());
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    if (selectedDate) {
      const selectedDateString = selectedDate.toDateString();
      const jobsForDay = selectedJobs[selectedDateString] || [];
      const totalValue = jobsForDay.reduce((sum, job) => {
        const numDates = job.Schedule.length;
        return sum + (job.JobValue / (numDates > 0 ? numDates : 1));
      }, 0);
      setTotalJobValue(totalValue);
    }
  }, [selectedDate, selectedJobs, jobs]);

  useEffect(() => {
    if (selectedDate) {
      const selectedDateString = selectedDate.toDateString();
      const jobsForDay = checkedJobs.map(jobNumber => jobs.find(job => job.JobNumber === jobNumber));
      const totalValue = jobsForDay.reduce((sum, job) => {
        const numDates = job.Schedule.length;
        return sum + (job.JobValue / (numDates > 0 ? numDates : 1));
      }, 0);
      setTotalJobValue(totalValue);
    }
  }, [checkedJobs, selectedDate, jobs]);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const isToday = dayDate.toDateString() === new Date().toDateString();

    const facilityColor = (facility) => {
      switch (facility) {
        case 'Aluminum':
          return { color: 'blue.500', label: 'Aluminum' };
        case 'Steel':
          return { color: 'red.500', label: 'Steel' };
        case 'Vinyl':
          return { color: 'yellow.500', label: 'Vinyl' };
        default:
          return { color: 'gray.500', label: 'Unknown' };
      }
    };

    const dayString = dayDate.toDateString();
    const jobsForDay = selectedJobs[dayString] || [];
    const jobsWithTestFits = jobs.filter(job => job.Schedule.includes(`${dayString} (Test Fit)`));
    const allJobsForDay = [...jobsForDay, ...jobsWithTestFits];

    const totalJobValue = jobsForDay.reduce((sum, job) => {
      const numDates = job.Schedule.filter(date => !date.includes('(Test Fit)')).length;
      return sum + (job.JobValue / (numDates > 0 ? numDates : 1));
    }, 0);

    days.push(
      <MotionBox
        key={i}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.1 }}
        p={2}
        m={0.5}
        opacity={isWeekend ? 0.6 : 0.9}
        bg={isToday ? '#E3F2FD' : (isWeekend ? '#F0F0F0' : 'white')}
        width="255px"
        height="auto"
        textAlign="left"
        paddingTop={0}
        position="relative"
        boxShadow="md"
        borderRadius="md"
        border="1px"
        borderColor="gray.100"
      >
        {isLoading ? (
          <>
            <Skeleton height="30px" width="70px" mt={2} mb={3} pt={2} borderRadius="md" />
            <Skeleton height="100px" width="100%" borderRadius="md" mb={2} boxShadow="md" />
            <Skeleton height="100px" width="100%" borderRadius="md" mb={2} boxShadow="md" />
            <Skeleton height="40px" width="20%" borderRadius="md" mt={4} />
          </>
        ) : (
          <>
            <Text fontSize='22px' fontWeight={isToday ? '600' : 'normal'} color={isToday ? 'blue.800' : (isWeekend ? 'gray.400' : 'gray.700')}>
              {dayDate.toLocaleString('default', { month: 'short' })} {dayDate.getDate()}
            </Text>
            <Text
              position="absolute"
              top="3px"
              right="8px"
              fontSize="14px"
              fontWeight="500"
              color={totalJobValue === 0 ? "transparent" : totalJobValue < 15000 ? "red.500" : "green.500"}
            >
              ${totalJobValue.toFixed(2)}
            </Text>
            {allJobsForDay.length > 0 && (
              <Box mt={2}>
                {allJobsForDay.map(job => {
                  const otherScheduledDates = jobs
                    .filter(j => j.JobNumber === job.JobNumber && j.Schedule.length > 1)
                    .flatMap(j => j.Schedule.filter(date => date !== dayString));
                  const formattedDates = otherScheduledDates.map(date => {
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    return date.includes('(Test Fit)') ? `${formattedDate} (Test Fit)` : formattedDate;
                  }).filter(date => !date.includes(new Date(dayString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })));
                  const tooltipLabel = formattedDates.length > 0 ? `Also scheduled for: ${formattedDates.join('; ')}` : '';

                  const isTestFitDate = job.Schedule.some(date => date.includes('(Test Fit)') && date.includes(dayString));

                  return (
                    <MotionBox
                      key={job.JobNumber}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      p={2}
                      mb={2}
                      bg={isTestFitDate ? '#E6E6FA' : 'gray.100'}
                      borderRadius="md"
                      boxShadow="md"
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Tooltip label={<Text fontWeight="normal" fontSize="sm">{tooltipLabel}</Text>} isDisabled={!tooltipLabel}>
                            <Text fontWeight="bold" fontSize="14px" color="blue.800" style={{ cursor: 'default' }}>
                              {job.JobNumber}
                            </Text>
                          </Tooltip>
                          <Tooltip label={<Text fontWeight="normal" fontSize="sm">{facilityColor(job.Facility).label}</Text>} isDisabled={false}>
                            <Box w="9px" h="9px" borderRadius="full" bg={facilityColor(job.Facility).color} ml={1}></Box>
                          </Tooltip>
                          {job.TestFit === 'yes' && (
                            <Tooltip label={<Text fontWeight="normal" fontSize="sm">{job.Schedule.some(date => date.includes('(Test Fit)')) ? "Test Fit Scheduled" : "Requires Test Fit"}</Text>} isDisabled={false}>
                              <Box ml={1}>
                                {job.Schedule.some(date => date.includes('(Test Fit)')) ? (
                                  <CheckCircle size={10} style={{ color: '#9B59B6' }} />
                                ) : (
                                  <Clipboard size={10} style={{ color: '#9B59B6' }} />
                                )}
                              </Box>
                            </Tooltip>
                          )}
                          {job.Rush === 'yes' && (
                            <Tooltip label={<Text fontWeight="normal" fontSize="sm">Rush</Text>} isDisabled={false}>
                              <Box ml={1}>
                                <Zap size={10} style={{ color: '#D53F8C' }} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                        <Text fontSize="14px" color={job.JobValue > 0 ? "blue.800" : "green.500"} fontWeight="400">
                          {job.JobValue > 0 ? `$${job.JobValue}` : 'SERVICE'}
                        </Text>
                      </Flex>
                      <Text fontSize="14px" color="blue.800">{job.Client}</Text>
                      <Text fontSize="14px" color="blue.800">{job.Color}</Text>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontSize="14px" color="blue.800">Pieces: {job.Pieces}</Text>
                        <Text fontSize="14px" color="blue.800">Due: {new Date(job.RequiredByDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</Text>
                      </Flex>
                    </MotionBox>
                  );
                })}
              </Box>
            )}
            <Button mt={2} onClick={() => handleOpenModal(dayDate)} color="gray.600" aria-label={`Add jobs for ${dayDate.toDateString()}`}>
              <Plus size={16} />
            </Button>
          </>
        )}
      </MotionBox>
    );
  }

  const handleOpenModal = (dayDate) => {
    setSelectedDate(dayDate);
    const dateKey = dayDate.toDateString();
    setCheckedJobs(selectedJobs[dateKey] ? selectedJobs[dateKey].map(job => job.JobNumber) : []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    setCheckedJobs([]);
    setIsModalOpen(false);
    fetchJobs();
  };

  let clickTimeout = null;

  const handleRowClick = (jobNumber) => {
    const job = jobs.find(j => j.JobNumber === jobNumber);
    const selectedDateString = selectedDate.toDateString();
    const testFitDate = `${selectedDateString} (Test Fit)`;

    if (job.Schedule.includes(selectedDateString)) {
      job.Schedule = job.Schedule.filter(date => date !== selectedDateString);
      axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/remove-from-schedule`, {
        date: selectedDateString
      });
      setCheckedJobs(checkedJobs.filter(jobNum => jobNum !== jobNumber));
      toast({
        title: "Job Unscheduled",
        description: `Job ${job.JobNumber} has been unscheduled.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } else if (job.Schedule.includes(testFitDate)) {
      job.Schedule = job.Schedule.filter(date => date !== testFitDate);
      axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/remove-from-schedule`, {
        date: testFitDate
      });
      setCheckedJobs(checkedJobs.filter(jobNum => jobNum !== jobNumber));
      toast({
        title: "Test Fit Unscheduled",
        description: `Test fit for job ${job.JobNumber} has been unscheduled.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } else {
      setCheckedJobs([...checkedJobs, jobNumber]);
      job.Schedule.push(selectedDateString);
      axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/add-to-schedule`, {
        date: selectedDateString
      });
      toast({
        title: "Job Scheduled",
        description: `Job ${job.JobNumber} has been scheduled.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRowDoubleClick = (jobNumber) => {
    clearTimeout(clickTimeout);
    const job = jobs.find(j => j.JobNumber === jobNumber);
    const selectedDateString = selectedDate.toDateString();
    const testFitDate = `${selectedDateString} (Test Fit)`;

    if (job.TestFit === 'yes') {
      if (!job.Schedule.includes(testFitDate) && !job.Schedule.includes(selectedDateString)) {
        job.Schedule.push(testFitDate);
        axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/add-to-schedule`, {
          date: testFitDate
        });
        toast({
          title: "Test Fit Scheduled",
          description: `Test fit for job ${job.JobNumber} has been scheduled.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setDoubleClickedJob(jobNumber);
      }
    } else {
      toast({
        title: "Test Fit Not Required",
        description: `Job ${job.JobNumber} does not require a test fit.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (doubleClickedJob !== null) {
      setDoubleClickedJob(null);
    }
  }, [doubleClickedJob]);

  const handleSingleClick = (jobNumber) => {
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      handleRowClick(jobNumber);
    }, 300);
  };

  useEffect(() => {
    if (selectedDate) {
      const selectedDateString = selectedDate.toDateString();
      const jobsForDay = checkedJobs.map(jobNumber => jobs.find(job => job.JobNumber === jobNumber));
      const totalValue = jobsForDay.reduce((sum, job) => {
        const numDates = job.Schedule.filter(date => !date.includes('(Test Fit)')).length;
        return sum + (job.JobValue / (numDates > 0 ? numDates : 1));
      }, 0);
      setTotalJobValue(totalValue);
    }
  }, [checkedJobs, selectedDate, jobs]);

  const handleConfirmSelection = async () => {
    if (selectedDate) {
      const selectedDateString = selectedDate.toDateString();
      const updatedSelectedJobs = {
        ...selectedJobs,
        [selectedDateString]: checkedJobs.map(jobNumber => jobs.find(job => job.JobNumber === jobNumber))
      };

      setSelectedJobs(updatedSelectedJobs);

      for (let job of jobs) {
        if (job.Schedule.includes(selectedDateString) && !checkedJobs.includes(job.JobNumber)) {
          try {
            await axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/remove-from-schedule`, {
              date: selectedDateString
            });
          } catch (error) {
            console.error(`Error updating schedule for job ${job.JobNumber}:`, error);
            toast({
              title: "Error",
              description: `Unable to update schedule for job ${job.JobNumber}.`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      }

      for (let jobNumber of checkedJobs) {
        const job = jobs.find(j => j.JobNumber === jobNumber);
        if (job && !job.Schedule.includes(selectedDateString)) {
          try {
            await axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${job.JobNumber}/add-to-schedule`, {
              date: selectedDateString
            });
            setCheckedJobs([...checkedJobs]);
          } catch (error) {
            console.error(`Error updating schedule for job ${jobNumber}:`, error);
            toast({
              title: "Error",
              description: `Unable to update schedule for job ${jobNumber}.`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      }

      const jobsForDay = updatedSelectedJobs[selectedDateString] || [];
      const totalValue = jobsForDay.reduce((sum, job) => {
        const numDates = job.Schedule.length;
        return sum + (job.JobValue / (numDates > 0 ? numDates : 1));
      }, 0);
      setTotalJobValue(totalValue);
    }

    setModalKey(prevKey => prevKey + 1);
    handleCloseModal();
  };

  const filteredJobs = jobs
    .filter(job => (job.Archive === 'no' || job.Archive === null) && (
      job.JobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.Client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.Facility.toLowerCase().includes(searchQuery.toLowerCase())
    ));

  return (
    <ChakraProvider>
      {errorMessage && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="rgba(0, 0, 0, 0.7)"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          textAlign="center"
          p={4}
        >
          <Text fontSize="lg">{errorMessage}</Text>
        </Box>
      )}
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(7, 1fr)" }}
        gap={2}
      >
        {days.map((day, index) => (
          <Box key={index}>
            <Box textAlign="center" fontWeight="500" color="gray.600" p={1}>
              {dayNames[index]}
            </Box>
            <Box display="flex" justifyContent="center">
              {day}
            </Box>
          </Box>
        ))}
      </Grid>
      <Box m={5}>
        <Modal key={modalKey} isOpen={isModalOpen} onClose={handleCloseModal} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Select Jobs for {selectedDate ? selectedDate.toDateString() : ''}
              <Popover isOpen={isTooltipVisible} placement="bottom" closeOnBlur={true} zIndex={4000}>
                <PopoverTrigger>
                  <IconButton
                    aria-label="Information about job scheduling"
                    icon={<Info size={16} />}
                    variant="ghost"
                    size="sm"
                    ml={2}
                    color="gray.500"
                    onMouseEnter={() => setIsTooltipVisible(true)}
                    onMouseLeave={() => setIsTooltipVisible(false)}
                  />
                </PopoverTrigger>
                <PopoverContent zIndex={4000} boxShadow="lg" borderRadius="md" p={4} bg="gray.50" width="400px" portalProps={{ containerRef: document.body }}>
                  <PopoverArrow />
                  <Box>
                    <Text fontWeight="bold" mb={2} color="gray.600">Job Scheduling Instructions</Text>
                    <Text fontSize="sm" color="gray.600">• Single-click to schedule an installation.</Text>
                    <Text fontSize="sm" color="gray.600">• Double-click to schedule a test fit.</Text>
                    <Text fontSize="sm" color="gray.600">• Scheduling a test fit does not add the job value to the total value for a given day.</Text>
                    <Text fontSize="sm" color="gray.600">• Jobs scheduled for at least one day appear lighter but are still selectable.</Text>
                    <Text fontSize="sm" color="gray.600">• Multiple jobs can be selected.</Text>
                    <Text fontSize="sm" color="gray.600">• The monetary value of a job is evenly divided across all dates it is scheduled for.</Text>
                  </Box>
                </PopoverContent>
              </Popover>
            </ModalHeader>
            <ModalBody>
              <Box mb="20px" display="flex" justifyContent="flex-end">
                <Box position="relative" width="300px">
                  <Box position="absolute" left="10px" top="50%" transform="translateY(-50%)">
                    <Search size="18px" color="gray" />
                  </Box>
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    pl="35px"
                  />
                </Box>
              </Box>
              <Box maxHeight="570px" overflowY="auto">
                <Table>
                  <Thead position="sticky" top="0" bg="white" boxShadow="sm">
                    <Tr>
                      <Th>Job Number</Th>
                      <Th>Client</Th>
                      <Th>Job Value</Th>
                      <Th>Facility</Th>
                      <Th>Test Fit</Th>
                      <Th>Rush</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredJobs.map(job => (
                      <Tr
                        key={job.JobNumber}
                        onClick={() => handleSingleClick(job.JobNumber)}
                        onDoubleClick={() => handleRowDoubleClick(job.JobNumber)}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSingleClick(job.JobNumber); }}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: job.Schedule.some(date =>
                            date.includes('(Test Fit)') && selectedDate && new Date(date).toDateString() === selectedDate.toDateString()
                          ) ? '#E6E6FA' : (
                            job.Schedule.some(date =>
                              selectedDate && new Date(date).toDateString() === selectedDate.toDateString()
                            ) ? '#EDF2F7' : 'transparent'
                          ),
                          color: job.Schedule.length > 0 ? '#5A6F77' : 'inherit'
                        }}
                      >
                        <Td>{job.JobNumber}</Td>
                        <Td>{job.Client}</Td>
                        <Td>{job.JobValue > 0 ? `$${job.JobValue}` : 'SERVICE'}</Td>
                        <Td>{job.Facility}</Td>
                        <Td>{job.TestFit}</Td>
                        <Td>{job.Rush}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Text fontSize="lg" mt="30px" color={totalJobValue < 15000 ? "red" : "green"}>
                Total Value: ${totalJobValue.toFixed(2)}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleConfirmSelection} mr={3}>Done</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default CalendarView;