import React, { useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex } from '@chakra-ui/react';
import { Plus } from 'react-feather';
import JobForm from './JobForm';

const JobsTable = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);

  const handleAddJob = () => {
    setIsJobFormOpen(true);
  };

  const handleCloseJobForm = () => {
    setIsJobFormOpen(false);
  };

  const jobs = [
    {
      id: 1,
      jobNumber: 'JN001',
      client: 'Client A',
      facility: 'Facility X',
      jobValue: '$1000',
      pieces: 10,
      date: '2024-07-04',
      color: 'Red',
      testFit: 'Yes',
      rush: 'No'
    },
    {
      id: 2,
      jobNumber: 'JN002',
      client: 'Client B',
      facility: 'Facility Y',
      jobValue: '$2000',
      pieces: 20,
      date: '2024-07-05',
      color: 'Blue',
      testFit: 'No',
      rush: 'Yes'
    },
    // Add more jobs here...
  ];

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
            <Tr key={job.id}>
              <Td border="1px solid" borderColor="gray.200">{job.jobNumber}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.client}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.facility}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.jobValue}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.pieces}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.date}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.color}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.testFit}</Td>
              <Td border="1px solid" borderColor="gray.200">{job.rush}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <JobForm isOpen={isJobFormOpen} onClose={handleCloseJobForm} />
    </Box>
  );
};

export default JobsTable;
