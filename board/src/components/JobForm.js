import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
} from '@chakra-ui/react';
import { X } from 'react-feather';
import axios from 'axios';

const JobForm = ({ isOpen, onClose, fetchJobs }) => {
  const [jobNumber, setJobNumber] = useState('');
  const [client, setClient] = useState('');
  const [facility, setFacility] = useState('');
  const [jobValue, setJobValue] = useState('');
  const [pieces, setPieces] = useState('');
  const [requiredByDate, setRequiredByDate] = useState('');
  const [color, setColor] = useState('');
  const [testFit, setTestFit] = useState(false);
  const [rush, setRush] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!jobNumber) {
      toast({
        title: "Error",
        description: "Job Number is mandatory",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const newJob = {
      JobNumber: jobNumber,
      Client: client,
      Facility: facility,
      JobValue: parseFloat(jobValue),
      Pieces: parseInt(pieces),
      RequiredByDate: requiredByDate ? new Date(requiredByDate).toISOString() : null,
      Color: color,
      TestFit: testFit ? 'yes' : 'no',
      Rush: rush ? 'yes' : 'no',
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobdetails`, newJob);
      fetchJobs();
      onClose();
      toast({
        title: 'Job Added',
        description: `Job ${jobNumber} has been successfully added.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to add job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      if (error.response && error.response.status !== 400) {
        toast({
          title: 'Server Error',
          description: 'The server encountered an error after the job was added. Please check the server logs for more details.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to add job. Error: ${error.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const resetForm = () => {
    setJobNumber('');
    setClient('');
    setFacility('');
    setJobValue('');
    setPieces('');
    setRequiredByDate('');
    setColor('');
    setTestFit(false);
    setRush(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent
        mt="10vh"
        boxShadow="0px 4px 24px rgba(0, 0, 0, 0.1)"
        borderRadius="10px"
        maxW="500px"
        mx="auto"
        p="30px"
        textAlign="center"
      >
        <ModalHeader display="flex" alignItems="center" justifyContent="center" pb="20px" position="relative">
          <Box fontWeight="600" fontSize="20px">Add Job</Box>
          <Box position="absolute" top="1px" right="1px">
            <Box
              as={X}
              size={24}
              color="black"
              onClick={onClose}
              cursor="pointer"
              aria-label="Close"
              _hover={{ opacity: 0.7 }}
              transition="opacity 0.3s"
            />
          </Box>
        </ModalHeader>

        <ModalBody>
          <Stack spacing="18px">
            <FormControl display="flex" alignItems="center" isRequired>
              <FormLabel flex="0 0 120px" fontSize="16px">Job Number</FormLabel>
              <Input type="text" placeholder="Enter job number" value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Client</FormLabel>
              <Input type="text" placeholder="Enter client name" value={client} onChange={(e) => setClient(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Facility</FormLabel>
              <Select placeholder="Select facility" value={facility} onChange={(e) => setFacility(e.target.value)} fontSize="16px" flex="1">
                <option value="Aluminum">Aluminum</option>
                <option value="Steel">Steel</option>
                <option value="Vinyl">Vinyl</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Job Value</FormLabel>
              <Input type="text" placeholder="Enter job value" value={jobValue} onChange={(e) => setJobValue(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Pieces</FormLabel>
              <Input type="text" placeholder="Enter total job pieces" value={pieces} onChange={(e) => setPieces(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Required By</FormLabel>
              <Input type="date" value={requiredByDate} onChange={(e) => setRequiredByDate(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Color</FormLabel>
              <Input type="text" placeholder="Enter job color" value={color} onChange={(e) => setColor(e.target.value)} fontSize="16px" flex="1" />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px" mb="0">Test Fit</FormLabel>
              <Box flex="1" textAlign="left">
                <Switch
                  isChecked={testFit}
                  onChange={(e) => setTestFit(e.target.checked)}
                />
              </Box>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px" mb="0">Rush</FormLabel>
              <Box flex="1" textAlign="left">
                <Switch
                  isChecked={rush}
                  onChange={(e) => setRush(e.target.checked)}
                />
              </Box>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            borderRadius="4px"
            fontSize="18px"
            height="36px"
            width="120px"
            onClick={() => {
              handleSave();
              onClose();
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobForm;