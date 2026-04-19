const axios = require('axios');

const API_URL = 'http://localhost:3000'; // Assuming standard port
const AUTH = {
  headers: {
    username: 'admin', // Need to know a valid user
    password: 'password' // Need to know a valid password
  }
};

async function testFixes() {
  try {
    console.log('Testing client creation...');
    const clientRes = await axios.post(`${API_URL}/api/clinic/clients`, {
      name: 'Test Client ' + Date.now(),
      email: 'test@example.com'
    }, AUTH);
    console.log('Client creation response:', clientRes.data);

    console.log('Testing appointment creation...');
    const apptRes = await axios.post(`${API_URL}/api/clinic/appointments`, {
      client_id: clientRes.data.id,
      service_id: 'any-service', // Might fail if id doesn't exist but SQL check comes first
      appointment_date: '2026-05-01',
      appointment_time: '10:00'
    }, AUTH);
    console.log('Appointment creation response:', apptRes.data);

  } catch (error) {
    console.error('Error during testing:', error.response ? error.response.data : error.message);
  }
}

// testFixes();
