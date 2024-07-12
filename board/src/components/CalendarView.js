import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td, Flex, Tooltip, useToast, ChakraProvider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);

const CalendarView = ({ currentDate, weekNumber, setCurrentDate, isAnimating, setIsAnimating }) => {
  const toast = useToast();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkedJobs, setCheckedJobs] = useState([]);
  const [totalJobValue, setTotalJobValue] = useState(0);

  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/jobdetails');
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
        return sum + (job.JobValue / numDates);
      }, 0);
      setTotalJobValue(totalValue);
    }
  }, [checkedJobs, selectedDate, selectedJobs]);

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

    const jobsForDay = selectedJobs[dayDate.toDateString()] || [];
    const totalJobValue = jobsForDay.reduce((sum, job) => {
      const numDates = job.Schedule.length;
      return sum + (job.JobValue / numDates);
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
        <Text fontSize='22px' fontWeight={isToday ? '500' : 'normal'} color={isToday ? 'blue.500' : (isWeekend ? 'gray.400' : 'inherit')}>
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
        {jobsForDay.length > 0 && (
          <Box mt={2}>
            {jobsForDay.map(job => (
              <Box key={job.JobNumber} border="1px solid" borderRadius="md" p={2} mb={2} bg="gray.100" borderColor="gray.100">
                <Flex justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Text fontWeight="bold" fontSize="14px" color="blue.800">{job.JobNumber}</Text>
                    <Tooltip label={facilityColor(job.Facility).label} fontSize="md">
                      <Box w="8px" h="8px" borderRadius="full" bg={facilityColor(job.Facility).color} ml={1}></Box>
                    </Tooltip>
                    {job.TestFit === 'yes' && (
                      <Tooltip label="Requires Test Fit" fontSize="md">
                        <Box w="8px" h="8px" borderRadius="full" bg='purple.500' ml={1}></Box>
                      </Tooltip>
                    )}
                    {job.Rush === 'yes' && (
                      <Tooltip label="Rush" fontSize="md">
                        <Box w="8px" h="8px" borderRadius="full" bg='pink.500' ml={1}></Box>
                      </Tooltip>
                    )}
                  </Box>
                  <Text fontSize="14px" color="blue.800">${job.JobValue}</Text>
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
        <Button mt={2} onClick={() => handleOpenModal(dayDate)}>Add Jobs</Button>
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
  };

  const handleRowClick = (jobNumber) => {
    if (checkedJobs.includes(jobNumber)) {
      setCheckedJobs(checkedJobs.filter(job => job !== jobNumber));
    } else {
      setCheckedJobs([...checkedJobs, jobNumber]);
    }
  };

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
            await axios.put(`http://localhost:5000/jobdetails/${job.JobNumber}/remove-from-schedule`, {
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
            await axios.put(`http://localhost:5000/jobdetails/${job.JobNumber}/add-to-schedule`, {
              date: selectedDateString
            });
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
    }

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
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="5xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select Jobs for {selectedDate ? selectedDate.toDateString() : ''}</ModalHeader>
            <ModalBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Job Number</Th>
                    <Th>Client</Th>
                    <Th>Job Value</Th>
                    <Th>Facility</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {jobs.map(job => (
                    <Tr key={job.JobNumber} onClick={() => handleRowClick(job.JobNumber)} style={{ cursor: 'pointer', backgroundColor: checkedJobs.includes(job.JobNumber) ? '#EDF2F7' : 'transparent' }}>
                      <Td>{job.JobNumber}</Td>
                      <Td>{job.Client}</Td>
                      <Td>{job.JobValue}</Td>
                      <Td>{job.Facility}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleConfirmSelection} mr={3}>Confirm</Button>
              <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default CalendarView;