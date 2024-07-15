import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Checkbox, IconButton, Input, Select, Spinner, Tooltip, useToast, ChakraProvider } from '@chakra-ui/react';
import { Plus, Trash2, Edit, X, Save, RefreshCw, ChevronDown, ChevronUp } from 'react-feather';
import axios from 'axios';
import JobForm from './JobForm';

const JobsTable = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobs, setEditingJobs] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState(null);
  const [shownToasts, setShownToasts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const toast = useToast();

  const formatDateForTooltip = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const renderTooltip = (job) => {
    if (job.Schedule && job.Schedule.length > 0) {
      return `Scheduled for ${job.Schedule.map(date => formatDateForTooltip(date)).join(', ')}`;
    } else {
      return "Not scheduled";
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    }
    return null;
  };

  const fetchJobs = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/jobdetails');
      setJobs(response.data);

      const pastJobs = getPastJobs(response.data);
      if (pastJobs.length > 0 && !isDismissedWithinOneDay()) {
        const confirmed = window.confirm("It is recommended to delete the jobs that have been installed from Board. Do you want to do it now? (Your choice will be remembered for one day)");
        if (confirmed) {
          await deletePastJobs(pastJobs);
        } else {
          rememberDismissal();
        }
      }
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
        return axios.delete(`${process.env.REACT_APP_API_URL}/jobdetails/${jobId}`);
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
          return axios.put(`${process.env.REACT_APP_API_URL}/jobdetails/${jobId}`, updatedJob);
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

  const getPastJobs = (jobs) => {
    const currentDate = new Date().toISOString().split('T')[0];
    return jobs.filter(job =>
      job.Schedule.length > 0 && job.Schedule.every(scheduleDate => new Date(scheduleDate) < new Date(currentDate))
    );
  };

  const isDismissedWithinOneDay = () => {
    const dismissalTimestamp = localStorage.getItem('dismissalTimestamp');
    if (!dismissalTimestamp) return false;
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    return (new Date() - new Date(dismissalTimestamp)) < oneDayInMillis;
  };

  const rememberDismissal = () => {
    localStorage.setItem('dismissalTimestamp', new Date().toISOString());
  };

  const deletePastJobs = async (pastJobs) => {
    try {
      await Promise.all(pastJobs.map(job => axios.delete(`${process.env.REACT_APP_API_URL}/jobdetails/${job._id}`)));
      toast({
        title: 'Past Jobs Deleted',
        description: 'All past jobs have been deleted successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting past jobs:', error);
      toast({
        title: 'Error Deleting Past Jobs',
        description: 'An error occurred while deleting past jobs.',
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
      return isDuplicate;
    });

  const handleBatchUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('${process.env.REACT_APP_API_URL}/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { skippedJobs } = response.data;

      if (skippedJobs && skippedJobs.length > 0) {
        toast({
          title: 'Batch Upload Successful',
          description: `Jobs have been uploaded successfully. Skipped ${skippedJobs.length} duplicate jobs.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Batch Upload Successful',
          description: 'Jobs have been uploaded successfully.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }

      await fetchJobs();
      formData.delete('file');
    } catch (error) {
      console.error('Error uploading batch jobs:', error);
      toast({
        title: 'Error Uploading Batch Jobs',
        description: 'An error occurred while uploading batch jobs.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
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
          <Input
            type="file"
            accept=".csv, .xls, .xlsx"
            onChange={handleBatchUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <Tooltip label="Upload multiple jobs from a CSV, XLS, or XLSX file. Ensure your file matches the format of the table on the screen, with an empty 'Schedule' column in the end.">
            <Button
              leftIcon={<Box as={Plus} size="18px" />}
              onClick={() => document.getElementById('file-upload').click()}
              variant="outline"
              _hover={{ bg: "gray.200" }}
              _active={{ bg: "gray.300" }}
              borderRadius="4px"
              fontSize="18px"
              height="36px"
              width="200px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              pr="12px"
              pt="2px"
              mr="2"
            >
              Batch Upload Jobs
            </Button>
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
                <Th onClick={() => handleSort('JobNumber')}>
                  <Flex alignItems="center">
                    <Box>Job Number</Box>
                    <Box>{getSortIcon('JobNumber')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('Client')}>
                  <Flex alignItems="center">
                    <Box>Client</Box>
                    <Box>{getSortIcon('Client')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('Facility')}>
                  <Flex alignItems="center">
                    <Box>Facility</Box>
                    <Box>{getSortIcon('Facility')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('JobValue')}>
                  <Flex alignItems="center">
                    <Box>Job Value</Box>
                    <Box>{getSortIcon('JobValue')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('Pieces')}>
                  <Flex alignItems="center">
                    <Box>Pieces</Box>
                    <Box>{getSortIcon('Pieces')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('RequiredByDate')}>
                  <Flex alignItems="center">
                    <Box>Required By</Box>
                    <Box>{getSortIcon('RequiredByDate')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('Color')}>
                  <Flex alignItems="center">
                    <Box>Color</Box>
                    <Box>{getSortIcon('Color')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('TestFit')}>
                  <Flex alignItems="center">
                    <Box>Test Fit</Box>
                    <Box>{getSortIcon('TestFit')}</Box>
                  </Flex>
                </Th>
                <Th onClick={() => handleSort('Rush')}>
                  <Flex alignItems="center">
                    <Box>Rush</Box>
                    <Box>{getSortIcon('Rush')}</Box>
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedJobs.map((job) => (
                <Tooltip key={job._id} label={renderTooltip(job)} placement="left" hasArrow>
                  <Tr
                    bg={duplicateJobNumbers.includes(job.JobNumber) ? 'red.100' : 'white'}
                    onMouseEnter={() => {
                      setHoveredJobId(job._id);
                      if (duplicateJobNumbers.includes(job.JobNumber) && !shownToasts.includes(job.JobNumber)) {
                        toast({
                          title: "Duplicate Job Detected",
                          description: `Job Number ${job.JobNumber} has been added more than once.`,
                          status: "warning",
                          duration: 5000,
                          isClosable: true,
                        });
                        setShownToasts([...shownToasts, job.JobNumber]);
                      }
                    }}
                    onMouseLeave={() => setHoveredJobId(null)}
                  >
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing && (
                        <Flex alignItems="center">
                          <Checkbox
                            isChecked={selectedJobs.includes(job._id)}
                            onChange={() => handleSelectJob(job._id)}
                            style={{ position: 'relative', marginRight: '10px' }}
                            borderColor="red.100"
                          />
                          <Input
                            value={editingJobs[job._id]?.JobNumber || job.JobNumber}
                            onChange={(e) => {
                              if (e.target.value.trim() === '') {
                                toast({
                                  title: "Error",
                                  description: "Job Number cannot be empty",
                                  status: "error",
                                  duration: 5000,
                                  isClosable: true,
                                });
                                return;
                              }
                              handleInputChange(job._id, 'JobNumber', e.target.value);
                            }}
                            size="sm"
                            borderColor={isEditing ? "gray.200" : "gray.200"}
                          />
                        </Flex>
                      )}
                      {!isEditing && job.JobNumber}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing ? (
                        <Input
                          value={editingJobs[job._id]?.Client || job.Client}
                          onChange={(e) => handleInputChange(job._id, 'Client', e.target.value)}
                          size="sm"
                          borderColor={isEditing ? "gray.200" : "gray.200"}
                        />
                      ) : (
                        job.Client
                      )}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
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
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing ? (
                        <Input
                          value={editingJobs[job._id]?.JobValue || job.JobValue}
                          onChange={(e) => handleInputChange(job._id, 'JobValue', e.target.value)}
                          size="sm"
                          borderColor={isEditing ? "gray.200" : "gray.200"}
                        />
                      ) : (
                        job.JobValue
                      )}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing ? (
                        <Input
                          value={editingJobs[job._id]?.Pieces || job.Pieces}
                          onChange={(e) => handleInputChange(job._id, 'Pieces', e.target.value)}
                          size="sm"
                          borderColor={isEditing ? "gray.200" : "gray.200"}
                        />
                      ) : (
                        job.Pieces
                      )}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editingJobs[job._id]?.RequiredByDate || formatDateForInput(job.RequiredByDate)}
                          onChange={(e) => handleInputChange(job._id, 'RequiredByDate', e.target.value)}
                          size="sm"
                          borderColor={isEditing ? "gray.200" : "gray.200"}
                        />
                      ) : (
                        new Date(job.RequiredByDate).toLocaleDateString('en-US', { dateStyle: 'long' })
                      )}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
                      {isEditing ? (
                        <Input
                          value={editingJobs[job._id]?.Color || job.Color}
                          onChange={(e) => handleInputChange(job._id, 'Color', e.target.value)}
                          size="sm"
                          borderColor={isEditing ? "gray.200" : "gray.200"}
                          style={{ verticalAlign: 'middle' }}
                        />
                      ) : (
                        job.Color
                      )}
                    </Td>
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
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
                    <Td style={{ color: job.Schedule.length > 0 ? '#8A9BA8' : 'inherit' }}>
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
                </Tooltip>
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