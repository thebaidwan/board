import React, { useState } from 'react';
import {
  Box,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  Radio,
  RadioGroup,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  IconButton,
} from '@chakra-ui/react';
import { X } from 'react-feather';

const JobForm = ({ isOpen, onClose }) => {

  const [isChecked, setIsChecked] = useState(true);

  const handleSave = () => {
    // Handle form submission logic here
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent
        bg="rgba(255, 255, 255, 0.6)"
        backdropFilter="blur(5px)"
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
        </ModalHeader>
        <Box position="absolute" top="12px" right="12px">
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

        <ModalBody>
          <Stack spacing="18px">
            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Job Number</FormLabel>
              <Input type="text" placeholder="Enter job number" onFocus={(e) => e.target.placeholder = ""} onBlur={(e) => e.target.placeholder = "Enter job number"} fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Client</FormLabel>
              <Input type="text" placeholder="Enter client name" onFocus={(e) => e.target.placeholder = ""} onBlur={(e) => e.target.placeholder = "Enter client name"} fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Facility</FormLabel>
              <Select
                placeholder="Select facility"
                fontSize="16px"
                flex="1"
                icon={<Box boxSize="0px" />}
                style={{ appearance: 'textfield' }}
                borderColor="grey"
                _hover={{ borderColor: 'grey' }}
              >
                <option value="Aluminum">Aluminum</option>
                <option value="Steel">Steel</option>
                <option value="Vinyl">Vinyl</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Job Value</FormLabel>
              <Input type="text" placeholder="Enter job value" onFocus={(e) => e.target.placeholder = ""} onBlur={(e) => e.target.placeholder = "Enter job value"} fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Pieces</FormLabel>
              <Input type="text" placeholder="Enter total job pieces" onFocus={(e) => e.target.placeholder = ""} onBlur={(e) => e.target.placeholder = "Enter total job pieces"} fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Date</FormLabel>
              <Input type="date" fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Color</FormLabel>
              <Input type="text" placeholder="Enter job color" onFocus={(e) => e.target.placeholder = ""} onBlur={(e) => e.target.placeholder = "Enter job color"} fontSize="16px" flex="1" borderColor="grey" _hover={{ borderColor: 'grey' }} />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px" mb="0">
                Test Fit
              </FormLabel>
              <Box flex="1" textAlign="left">
                <Switch
                  isChecked={isChecked}
                  onChange={handleToggle}
                  css={{
                    '.chakra-switch__track': {
                      backgroundColor: isChecked ? '#ED7D31' : 'grey',
                    },
                    '.chakra-switch__thumb': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel flex="0 0 120px" fontSize="16px">Rush</FormLabel>
              <RadioGroup defaultValue="yes" fontSize="16px" flex="1" colorScheme="orange">
                <Stack direction="row">
                  <Radio value="yes" size="lg">Yes</Radio>
                  <Radio value="no" size="lg">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </Stack>
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
            onClick={handleSave}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobForm;