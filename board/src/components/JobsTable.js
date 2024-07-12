import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Checkbox, IconButton, Input, Select, Spinner, Tooltip, useToast, ChakraProvider } from '@chakra-ui/react';
import { Plus, Trash2, Edit, X, Save, RefreshCw } from 'react-feather';
import axios from 'axios';
import JobForm from './JobForm';

const JobsTable = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobs, setEditingJobs] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const toast = useToast();

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
    toast({
      title: 'Job Form Opened',
      description: 'You can now add a new job.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
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
      await fetchJobs();
      setSelectedJobs([]);
      toast({
        title: 'Jobs Deleted',
        description: 'Selected jobs have been deleted successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting jobs:', error);
      toast({
        title: 'Error Deleting Jobs',
        description: 'An error occurred while deleting jobs.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
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
      await fetchJobs();
      setIsEditing(false);
      setEditingJobs({});
      toast({
        title: 'Edits Saved',
        description: 'Changes have been saved successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving job edits:', error);
      toast({
        title: 'Error Saving Edits',
        description: 'An error occurred while saving changes.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return `${year}-${month}-${day}`;
  };

  const duplicateJobNumbers = jobs
  .map((job) => job.JobNumber)
  .filter((jobNumber, index, self) => {
    const isDuplicate = self.indexOf(jobNumber) !== self.lastIndexOf(jobNumber);
    if (isDuplicate) {
      toast({
        title: "Duplicate Job Number",
        description: `The job number ${jobNumber} is already added.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    return isDuplicate;
  });
 
  return (
    <ChakraProvider>
      <Box w="80%" m="auto" mt="5">
        <Flex mb="5" justifyContent="flex-end">
          <Tooltip label="Refresh Table" aria-label="Refresh Table">
            <Box
              width="30px"
              height="30px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={fetchJobs}
              mr={3}
              mt={1}
            >
              <RefreshCw size={24} />
            </Box>
          </Tooltip>
          <Button
            leftIcon={<Box as={Plus} size="18px" />}
            onClick={handleAddJob}
            variant="outline"
            _hover={{ bg: "gray.200" }}
            _active={{ bg: "gray.300" }}
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
            leftIcon={<Box as={isEditing ? X : Edit} size="18px" />}
            onClick={handleEditToggle}
            variant="outline"
            _hover={{ bg: "gray.200" }}
            _active={{ bg: "gray.300" }}
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
                  colorScheme="red"
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
                leftIcon={<Box as={Save} size="18px" />}
                onClick={handleSaveEdits}
                variant="outline"
                colorScheme="green"
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
                <Th>Job Number</Th>
                <Th>Client</Th>
                <Th>Facility</Th>
                <Th>Job Value</Th>
                <Th>Pieces</Th>
                <Th>Required By</Th>
                <Th>Color</Th>
                <Th>Test Fit</Th>
                <Th>Rush</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobs.map((job) => (
                <Tr
                  key={job._id}
                  bg={duplicateJobNumbers.includes(job.JobNumber) ? 'red.100' : 'white'}
                >
                  <Td position="relative">
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
                  <Td>
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
                  <Td>
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
                  <Td>
                    {isEditing ? (
                      <Input
                        value={editingJobs[job._id]?.JobValue || job.JobValue}
                        onChange={(e) => handleInputChange(job._id, 'JobValue', e.target.value)}
                        size="sm"
                      />
                    ) : (
                      job.JobValue
                    )}
                  </Td>
                  <Td>
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
                  <Td>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editingJobs[job._id]?.RequiredByDate || formatDateForInput(job.RequiredByDate)}
                        onChange={(e) => handleInputChange(job._id, 'RequiredByDate', e.target.value)}
                        size="sm"
                      />
                    ) : (
                      new Date(job.RequiredByDate).toLocaleDateString('en-US', { dateStyle: 'long' })
                    )}
                  </Td>
                  <Td>
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
                  <Td>
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
                  <Td>
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
    </ChakraProvider>
  );
};

export default JobsTable;