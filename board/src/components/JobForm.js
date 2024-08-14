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
  Tooltip,
  FormErrorMessage,
} from '@chakra-ui/react';
import { X, Info } from 'react-feather';
import axios from 'axios';
import { useBreakpointValue } from '@chakra-ui/react';

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
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const toast = useToast();

  const commonInputStyle = {
    fontSize: useBreakpointValue({ base: '14px', md: '16px' }),
    borderColor: 'gray.300',
    _focus: { borderColor: 'blue.500' },
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter') {
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (!jobNumber) newErrors.jobNumber = 'Job Number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJobValueChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) || value === '') {
      setJobValue(value);
      if (errors.jobValue) {
        setErrors((prev) => ({ ...prev, jobValue: null }));
      }
    }
  };

  const handlePiecesChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) || value === '') {
      setPieces(value);
      if (errors.pieces) {
        setErrors((prev) => ({ ...prev, pieces: null }));
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const newJob = {
      JobNumber: jobNumber,
      Client: client,
      Facility: facility,
      JobValue: jobValue ? parseFloat(jobValue) : null,
      Pieces: parseInt(pieces),
      RequiredByDate: requiredByDate ? new Date(requiredByDate).toISOString() : null,
      Color: color,
      TestFit: testFit ? 'yes' : 'no',
      Rush: rush ? 'yes' : 'no',
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobdetails`, newJob);

      toast({
        title: newJob.JobValue === 0 || newJob.JobValue === null ? 'Service Created' : 'Job Added',
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
          title: newJob.JobValue === 0 || newJob.JobValue === null ? 'Service Created' : 'Job Added',
          description: `Job ${jobNumber} has been successfully added.`,
          status: 'success',
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
            <FormControl display="flex" alignItems="center" isRequired isInvalid={!!errors.jobNumber}>
              <FormLabel flex="0 0 120px" fontSize="16px">Job Number</FormLabel>
              <Input type="text" placeholder="Enter job number" value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} {...commonInputStyle} />
              {errors.jobNumber && <FormErrorMessage>{errors.jobNumber}</FormErrorMessage>}
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Client</FormLabel>
              <Input type="text" placeholder="Enter client name" value={client} onChange={(e) => setClient(e.target.value)} {...commonInputStyle} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Facility</FormLabel>
              <Select placeholder="Select facility" value={facility} onChange={(e) => setFacility(e.target.value)} {...commonInputStyle}>
                <option value="Aluminum">Aluminum</option>
                <option value="Steel">Steel</option>
                <option value="Vinyl">Vinyl</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center" isInvalid={!!errors.jobValue}>
              <FormLabel flex="0 0 120px" fontSize="16px" display="flex" alignItems="center">
                Job Value
                <Tooltip label="Leaving this field blank or adding a zero value job will create a service." aria-label="A tooltip">
                  <Box as={Info} size={15} color="gray" ml={1} cursor="pointer" />
                </Tooltip>
              </FormLabel>
              <Input type="text" placeholder="Enter job value" value={jobValue} onChange={handleJobValueChange} {...commonInputStyle} />
              {errors.jobValue && <FormErrorMessage>{errors.jobValue}</FormErrorMessage>}
            </FormControl>

            <FormControl display="flex" alignItems="center" isInvalid={!!errors.pieces}>
              <FormLabel flex="0 0 120px" fontSize="16px">Pieces</FormLabel>
              <Input type="text" placeholder="Enter total job pieces" value={pieces} onChange={handlePiecesChange} {...commonInputStyle} />
              {errors.pieces && <FormErrorMessage>{errors.pieces}</FormErrorMessage>}
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Required By</FormLabel>
              <Input type="date" value={requiredByDate} onChange={(e) => setRequiredByDate(e.target.value)} {...commonInputStyle} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Color</FormLabel>
              <Input type="text" placeholder="Enter job color" value={color} onChange={(e) => setColor(e.target.value)} {...commonInputStyle} />
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
            onClick={async () => {
              await handleSave();
              onClose();
            }}
            isDisabled={!jobNumber}
          >
            Save
          </Button>
          <Button
            colorScheme="blue"
            borderRadius="4px"
            fontSize="18px"
            height="36px"
            width="180px"
            marginLeft="10px"
            onClick={async () => {
              await handleSave();
              resetForm();
            }}
            isDisabled={!jobNumber}
          >
            Save & Add New
          </Button>
          <Button
            colorScheme="gray"
            borderRadius="4px"
            fontSize="18px"
            height="36px"
            width="120px"
            marginLeft="10px"
            onClick={resetForm}
          >
            Clear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobForm;