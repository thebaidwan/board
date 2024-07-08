import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Checkbox, IconButton, Input, Select, Spinner } from '@chakra-ui/react';
import { Plus, Trash2, Edit, X, Save } from 'react-feather';
import axios from 'axios';
import JobForm from './JobForm';

const JobsTable = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobs, setEditingJobs] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  const fetchJobs = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get('http://localhost:5000/jobdetails');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = () => {
    setIsJobFormOpen(true);
  };

  const handleCloseJobForm = async () => {
    setIsJobFormOpen(false);
    try {
      await fetchJobs();
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSelectedJobs([]);
    setEditingJobs({});
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs((prevSelected) =>
      prevSelected.includes(jobId)
        ? prevSelected.filter((id) => id !== jobId)
        : [...prevSelected, jobId]
    );
  };

  const handleDeleteJobs = async () => {
    try {
      await Promise.all(selectedJobs.map((jobId) => {
        return axios.delete(`http://localhost:5000/jobdetails/${jobId}`);
      }));
      const response = await axios.get('http://localhost:5000/jobdetails');
      setJobs(response.data);
      setSelectedJobs([]);
    } catch (error) {
      console.error('Error deleting jobs:', error);
    }
  };

  const handleInputChange = (jobId, field, value) => {
    setEditingJobs((prevEditingJobs) => ({
      ...prevEditingJobs,
      [jobId]: {
        ...prevEditingJobs[jobId],
        [field]: value,
      },
    }));
  };

  const handleSaveEdits = async () => {
    try {
      await Promise.all(
        Object.keys(editingJobs).map((jobId) => {
          const updatedJob = editingJobs[jobId];
          return axios.put(`http://localhost:5000/jobdetails/${jobId}`, updatedJob);
        })
      );
      const response = await axios.get('http://localhost:5000/jobdetails');
      setJobs(response.data);
      setIsEditing(false);
      setEditingJobs({});
    } catch (error) {
      console.error('Error saving job edits:', error);
    }
  };

  const duplicateJobNumbers = jobs
    .map((job) => job.JobNumber)
    .filter((jobNumber, index, self) => self.indexOf(jobNumber) !== self.lastIndexOf(jobNumber));

  return (
    <Box w="80%" m="auto" mt="5">
      <Flex mb="5" justifyContent="flex-end">
        <Button
          leftIcon={<Box as={Plus} size="18px" color="#CC5500" />}
          onClick={handleAddJob}
          variant="outline"
          borderColor="#CC5500"
          color="#CC5500"
          _hover={{ bg: "#F1995D", borderColor: "#F1995D" }}
          _active={{ bg: "#CC5500", borderColor: "#CC5500" }}
          borderRadius="4px"
          fontSize="18px"
          height="36px"
          width="120px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          pr="12px"
          pt="2px"
          mr="2"
        >
          Add Job
        </Button>
        <Button
          leftIcon={<Box as={isEditing ? X : Edit} size="18px" color="#3182CE" />}
          onClick={handleEditToggle}
          variant="outline"
          borderColor="#3182CE"
          color="#3182CE"
          _hover={{ bg: "#63B3ED", borderColor: "#63B3ED" }}
          _active={{ bg: "#3182CE", borderColor: "#3182CE" }}
          borderRadius="4px"
          fontSize="18px"
          height="36px"
          width="120px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          pr="12px"
          pt="2px"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        {isEditing && (
          <>
            {selectedJobs.length > 0 && (
              <IconButton
                icon={<Trash2 size="18px" />}
                onClick={handleDeleteJobs}
                variant="outline"
                borderColor="red.600"
                color="red.600"
                _hover={{ bg: "red.400", borderColor: "red.400" }}
                _active={{ bg: "red.600", borderColor: "red.400" }}
                borderRadius="4px"
                fontSize="18px"
                height="36px"
                width="36px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                ml="2"
              />
            )}
            <Button
              leftIcon={<Box as={Save} size="18px" color="#4CAF50" />}
              onClick={handleSaveEdits}
              variant="outline"
              borderColor="#4CAF50"
              color="#4CAF50"
              _hover={{ bg: "#6DD171", borderColor: "#6DD171" }}
              _active={{ bg: "#4CAF50", borderColor: "#4CAF50" }}
              borderRadius="4px"
              fontSize="18px"
              height="36px"
              width="120px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              ml="2"
            >
              Save
            </Button>
          </>
        )}
      </Flex>
      {isFetching ? (
        <Spinner
          thickness="4px"
          speed="0.65s"
          color="blue.500"
          size="xl"
          alignSelf="center"
        />
      ) : (
        <Table variant="striped" colorScheme="gray" size="sm" border="1px" borderColor="gray.200" borderRadius="md">
          <Thead>
            <Tr>
              <Th border="1px solid" borderColor="gray.200" w="100px">Job Number</Th>
              <Th border="1px solid" borderColor="gray.200" w="350px">Client</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Facility</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Job Value</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Pieces</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Required By</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Color</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Test Fit</Th>
              <Th border="1px solid" borderColor="gray.200" w="100px">Rush</Th>
            </Tr>
          </Thead>
          <Tbody>
            {jobs.map((job) => (
              <Tr
                key={job._id}
                bg={duplicateJobNumbers.includes(job.JobNumber) ? 'red.100' : 'white'}
              >
                <Td border="1px solid" borderColor="gray.200" position="relative">
                  {isEditing && (
                    <Checkbox
                      isChecked={selectedJobs.includes(job._id)}
                      onChange={() => handleSelectJob(job._id)}
                      position="absolute"
                      top="50%"
                      left="-5"
                      transform="translate(-50%, -50%)"
                    />
                  )}
                  {isEditing ? (
                    <Input
                      value={editingJobs[job._id]?.JobNumber || job.JobNumber}
                      onChange={(e) => handleInputChange(job._id, 'JobNumber', e.target.value)}
                      size="sm"
                    />
                  ) : (
                    job.JobNumber
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Input
                      value={editingJobs[job._id]?.Client || job.Client}
                      onChange={(e) => handleInputChange(job._id, 'Client', e.target.value)}
                      size="sm"
                    />
                  ) : (
                    job.Client
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Select
                      value={editingJobs[job._id]?.Facility || job.Facility}
                      onChange={(e) => handleInputChange(job._id, 'Facility', e.target.value)}
                      size="sm"
                    >
                      <option value="Aluminum">Aluminum</option>
                      <option value="Steel">Steel</option>
                      <option value="Vinyl">Vinyl</option>
                    </Select>
                  ) : (
                    job.Facility
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Input
                      value={editingJobs[job._id]?.JobValue || job.JobValue}
                      onChange={(e) => handleInputChange(job._id, 'JobValue', e.target.value)}
                      size="sm"
                    />
                  ) : (
                    `$${job.JobValue}`
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Input
                      value={editingJobs[job._id]?.Pieces || job.Pieces}
                      onChange={(e) => handleInputChange(job._id, 'Pieces', e.target.value)}
                      size="sm"
                    />
                  ) : (
                    job.Pieces
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Input
                      type="date"
                      value={new Date(editingJobs[job._id]?.RequiredByDate || job.RequiredByDate).toISOString().split('T')[0]}
                      onChange={(e) => handleInputChange(job._id, 'RequiredByDate', new Date(e.target.value).getTime())}
                      size="sm"
                    />
                  ) : (
                    new Date(job.RequiredByDate).toLocaleDateString()
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Input
                      value={editingJobs[job._id]?.Color || job.Color}
                      onChange={(e) => handleInputChange(job._id, 'Color', e.target.value)}
                      size="sm"
                    />
                  ) : (
                    job.Color
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Select
                      value={editingJobs[job._id]?.TestFit || job.TestFit}
                      onChange={(e) => handleInputChange(job._id, 'TestFit', e.target.value)}
                      size="sm"
                    >
                      <option value="yes">yes</option>
                      <option value="no">no</option>
                    </Select>
                  ) : (
                    job.TestFit
                  )}
                </Td>
                <Td border="1px solid" borderColor="gray.200">
                  {isEditing ? (
                    <Select
                      value={editingJobs[job._id]?.Rush || job.Rush}
                      onChange={(e) => handleInputChange(job._id, 'Rush', e.target.value)}
                      size="sm"
                    >
                      <option value="yes">yes</option>
                      <option value="no">no</option>
                    </Select>
                  ) : (
                    job.Rush
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <JobForm isOpen={isJobFormOpen} onClose={handleCloseJobForm} />
    </Box>
  );


};

export default JobsTable;