import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex } from '@chakra-ui/react';
import { Plus } from 'react-feather';
import axios from 'axios';
import JobForm from './JobForm';

const JobsTable = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/jobdetails');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleAddJob = () => {
    setIsJobFormOpen(true);
  };

  const handleCloseJobForm = () => {
    setIsJobFormOpen(false);
  };

  return (
    <Box w="80%" m="auto" mt="5">
      <Flex mb="5" justifyContent="flex-end">
        <Button
          leftIcon={<Box as={Plus} size="18px" />}
          onClick={handleAddJob}
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
          pr="12px"
          pt="2px"
        >
          Add Job
        </Button>
      </Flex>
      <Table variant="striped" colorScheme="gray" size="sm" border="1px" borderColor="gray.200" borderRadius="md">
        <Thead>
          <Tr>
            <Th border="1px solid" borderColor="gray.200" w="100px">Job Number</Th>
            <Th border="1px solid" borderColor="gray.200" w="350px">Client</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Facility</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Job Value</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Pieces</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Date</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Color</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Test Fit</Th>
            <Th border="1px solid" borderColor="gray.200" w="100px">Rush</Th>
          </Tr>
        </Thead>
        <Tbody>
          {jobs.map((job) => (
            <Tr key={job._id}>
              <Td border="1px solid" borderColor="gray.200">{job.JobNumber}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.Client}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.Facility}</Td>
              <Td border="1px solid" borderColor="gray.200">${job.JobValue}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.Pieces}</Td>
              <Td border="1px solid" borderColor="gray.200">{new Date(job.RequiredByDate).toLocaleDateString()}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.Color}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.TestFit}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.Rush}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <JobForm isOpen={isJobFormOpen} onClose={handleCloseJobForm} />
    </Box>
  );
};

export default JobsTable;