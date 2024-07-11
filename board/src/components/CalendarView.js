import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td, Flex, Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);

const CalendarView = ({ currentDate, weekNumber, setCurrentDate, navigationDirection, isAnimating, setIsAnimating }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkedJobs, setCheckedJobs] = useState([]);

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
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        if (navigationDirection === 'next') {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
        } else if (navigationDirection === 'prev') {
          setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
        } else if (navigationDirection === 'current') {
          setCurrentDate(new Date());
        }
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

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
        m={1}
        opacity={isWeekend ? 0.6 : 0.9}
        bg={isWeekend ? '#F0F0F0' : 'white'}
        width="250px"
        height="auto"
        border={isToday ? '1px solid #ED7D31' : '1px solid gray'}
        textAlign="left"
        paddingTop={0}
        position="relative"
      >
        <Text fontSize='22px' fontWeight={isToday ? '500' : 'normal'} color={isToday ? '#ED7D31' : (isWeekend ? 'gray.400' : 'inherit')}>
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
              <Box key={job.JobNumber} border="1px solid #ED7D31" borderRadius="md" p={2} mb={2} bg="#FFF5E5">
                <Flex justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Text fontWeight="bold" fontSize="14px">{job.JobNumber}</Text>
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
                  <Text fontSize="14px">${job.JobValue}</Text>
                </Flex>
                <Text fontSize="14px">{job.Client}</Text>
                <Text fontSize="14px">{job.Color}</Text>
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontSize="14px">Pieces: {job.Pieces}</Text>
                  <Text fontSize="14px">Due: {new Date(job.RequiredByDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</Text>
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
          }
        }
      }

      for (let jobNumber of checkedJobs) {
        try {
          await axios.put(`http://localhost:5000/jobdetails/${jobNumber}/add-to-schedule`, {
            date: selectedDateString
          });
        } catch (error) {
          console.error(`Error updating schedule for job ${jobNumber}:`, error);
        }
      }

      setIsModalOpen(false);
    }
  };

  return (
    <motion.div
      key={weekNumber}
      initial={{ opacity: 0, x: navigationDirection === 'next' ? 100 : -100 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: navigationDirection === 'next' ? -100 : 100 }}
      transition={{ duration: 0.6 }}
      layout
    >
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
          <Box key={day} fontWeight="500" textAlign="center" color={index >= 5 ? '#9B9B9B' : '#5C5C5C'}>
            {day}
          </Box>
        ))}
        {days}
      </Grid>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent
          bg="rgba(255, 255, 255, 0.6)"
          backdropFilter="blur(5px)"
          mt="10vh"
          boxShadow="0px 4px 24px rgba(0, 0, 0, 0.1)"
          borderRadius="10px"
          maxW="1200px"
          mx="auto"
          p="30px"
          textAlign="center"
        >
          <ModalHeader display="flex" alignItems="center" justifyContent="center" pb="20px" position="relative">
            <Box fontWeight="600" fontSize="20px">Select Jobs to Schedule</Box>
            <Box position="absolute" top="1px" right="1px">
              <Box
                as="span"
                fontSize="24px"
                color="black"
                onClick={handleCloseModal}
                cursor="pointer"
                aria-label="Close"
                _hover={{ opacity: 0.7 }}
                transition="opacity 0.3s ease"
              >
                &times;
              </Box>
            </Box>
          </ModalHeader>

          <ModalBody maxHeight="70vh" overflowY="auto">
            <Table colorScheme="gray" size="sm">
              <Thead>
                <Tr>
                  <Th>Job Number</Th>
                  <Th>Client</Th>
                  <Th>Facility</Th>
                  <Th>Job Value</Th>
                  <Th>Pieces</Th>
                  <Th>Required By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {jobs.map(job => (
                  <Tr
                    key={job.JobNumber}
                    onClick={() => handleRowClick(job.JobNumber)}
                    bg={checkedJobs.includes(job.JobNumber) ? 'orange.100' : 'transparent'}
                    color="gray.800"
                    cursor="pointer"
                    _hover={{ bg: 'orange.50' }}
                  >
                    <Td>{job.JobNumber}</Td>
                    <Td>{job.Client}</Td>
                    <Td>{job.Facility}</Td>
                    <Td>{job.JobValue}</Td>
                    <Td>{job.Pieces}</Td>
                    <Td>{new Date(job.RequiredByDate).toLocaleDateString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#ED7D31"
              color="white"
              _hover={{ bg: "#F1995D" }}
              _active={{ bg: "#ED7D31" }}
              borderRadius="4px"
              border="none"
              fontSize="18px"
              height="36px"
              width="120px"
              onClick={handleConfirmSelection}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default CalendarView;