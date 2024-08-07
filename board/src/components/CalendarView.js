import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td, Flex, Tooltip, useToast, ChakraProvider, IconButton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Info } from 'react-feather';
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

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const fetchJobs = async () => {
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
      toast({
        title: "Error",
        description: "Unable to fetch jobs.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
          return { color: 'green.500', label: 'Vinyl' };
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
        borderWidth="1px"
        borderRadius="md"
        p={2}
        m={0.5}
        opacity={isWeekend ? 0.6 : 0.9}
        bg={isWeekend ? '#F0F0F0' : 'white'}
        width="255px"
        height="auto"
        border={isToday ? '1px solid' : '1px solid gray'}
        borderColor={isToday ? 'blue.200' : 'gray.200'}
        textAlign="left"
        paddingTop={0}
        position="relative"
      >
        <Text fontSize='22px' fontWeight={isToday ? '500' : 'normal'} color={isToday ? '#2B6CB0' : (isWeekend ? 'gray.400' : 'inherit')}>
          {dayDate.toLocaleString('default', { month: 'short' })} {dayDate.getDate()}
        </Text>
        <Text
          position="absolute"
          top="2px"
          right="2px"
          fontSize="14px"
          fontWeight="500"
          color={totalJobValue === 0 ? "transparent" : totalJobValue < 15000 ? "red.500" : "green.500"}
        >
          ${totalJobValue.toFixed(2)}
        </Text>
        {allJobsForDay.length > 0 && (
          <Box mt={2}>
            {allJobsForDay.map(job => (
              <Box
                key={job.JobNumber}
                border="1px solid"
                borderRadius="md"
                p={2}
                mb={2}
                bg={job.Schedule.some(date => date.includes('(Test Fit)') && new Date(date).toDateString() === new Date(dayString).toDateString()) ? '#E6E6FA' : 'gray.100'}
                borderColor="gray.100"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Text fontWeight="bold" fontSize="14px" color="blue.800">{job.JobNumber}</Text>
                    <Tooltip label={facilityColor(job.Facility).label} fontSize="md">
                      <Box w="8px" h="8px" borderRadius="full" bg={facilityColor(job.Facility).color} ml={1}></Box>
                    </Tooltip>
                    {job.TestFit === 'yes' && (
                      <Tooltip label={job.Schedule.some(date => date.includes('(Test Fit)')) ? "Test Fit Scheduled" : "Requires Test Fit"} fontSize="md">
                        <Box w="8px" h="8px" borderRadius="full" bg={job.Schedule.some(date => date.includes('(Test Fit)')) ? 'purple.500' : 'purple.500'} position="relative" ml={1}>
                        </Box>
                      </Tooltip>
                    )}
                    {job.Rush === 'yes' && (
                      <Tooltip label="Rush" fontSize="md">
                        <Box w="8px" h="8px" borderRadius="full" bg='pink.500' ml={1}></Box>
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
              </Box>
            ))}
          </Box>
        )}
        <Button mt={2} onClick={() => handleOpenModal(dayDate)}>+ Add Jobs</Button>
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

  return (
    <ChakraProvider>
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {dayNames.map(day => (
          <Box key={day} textAlign="center" fontWeight="500" p={1}>{day}</Box>
        ))}
        {days}
      </Grid>
      <Box m={5}>
        <Modal key={modalKey} isOpen={isModalOpen} onClose={handleCloseModal} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select Jobs for {selectedDate ? selectedDate.toDateString() : ''}
              <Tooltip
                label={
                  <Box>
                    <Text>• Single-click to schedule an installation.</Text>
                    <Text>• Double-click to schedule a test fit.</Text>
                    <Text>• Scheduling a test fit does not add the job value to the total value for a given day.</Text>
                    <Text>• Jobs scheduled for at least one day appear lighter but are still selectable.</Text>
                    <Text>• Multiple jobs can be selected.</Text>
                    <Text>• The monetary value of a job is evenly divided across all dates it is scheduled for.</Text>
                  </Box>
                }
                fontSize="md"
                fontWeight="400"
                placement="bottom"
                isOpen={isTooltipVisible}
              >
                <IconButton
                  aria-label="Information"
                  icon={<Info size={16} />}
                  variant="ghost"
                  size="sm"
                  ml={2}
                  color="gray.500"
                  onMouseEnter={() => setIsTooltipVisible(true)}
                  onMouseLeave={() => setIsTooltipVisible(false)}
                />
              </Tooltip>
            </ModalHeader>
            <ModalBody>
              <Box maxHeight="650px" overflowY="auto">
                <Table>
                  <Thead>
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
                    {jobs.map(job => (
                      <Tr
                        key={job.JobNumber}
                        onClick={() => handleSingleClick(job.JobNumber)}
                        onDoubleClick={() => handleRowDoubleClick(job.JobNumber)}
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