import React from 'react';
import { Box, Grid, Text } from '@chakra-ui/react';

const CalendarView = ({ currentDate }) => {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const today = new Date();
  const todayString = today.toDateString();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<Box key={`empty-${i}`} />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const isToday = dayDate.toDateString() === todayString;
    days.push(
      <Box
        key={i}
        borderWidth="1px"
        borderRadius="md"
        p={2}
        m={1}
        opacity={isWeekend ? 0.6 : 0.9}
        bg={isWeekend ? '#F0F0F0' : 'white'}
        width="249px"
        height="350px"
        border={isToday ? '1px solid #ED7D31' : '1px solid gray'}
        textAlign="left"
        paddingTop={0}
      >
        <Text fontSize='20px' fontWeight={isToday ? '500' : 'normal'} color={isToday ? '#ED7D31' : (isWeekend ? 'gray.400' : 'inherit')}>
          {i}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Grid templateColumns="repeat(7, 1fr)" gap={4}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
          <Box key={day} fontWeight="500" textAlign="center" color={index >= 5 ? '#9B9B9B' : '#5C5C5C'}>
            {day}
          </Box>
        ))}
        {days}
      </Grid>
    </Box>
  );
};

export default CalendarView;