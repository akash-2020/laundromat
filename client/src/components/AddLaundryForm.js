import React, { useState, useEffect } from 'react';
import { Form, Button, Card, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment-timezone';

function AddLaundryForm({ addNewLaundryOrder, customers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dropOffDate, setDropOffDate] = useState('');
  const [pickUpDate, setPickUpDate] = useState('');
  const [loads, setLoads] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    setInitialDates();
    setFilteredCustomers(customers);
  }, [customers]);

  const setInitialDates = () => {
    const currentDate = moment();
    const formattedDate = currentDate.tz('America/Halifax').format('YYYY-MM-DDTHH:mm');
    setDropOffDate(formattedDate);
    //setPickUpDate(formattedDate);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`/api/customers/${selectedCustomer}/laundry`, {
        dropOffDate,
        pickUpDate,
        loads,
        price
      });
      console.log('Laundry order saved successfully');
      addNewLaundryOrder(response.data);
      setInitialDates();
      setLoads('');
      setPrice('');
      setPickUpDate('')
      setSelectedCustomer('');
      setSearchQuery('');
    } catch (error) {
      console.error('Error saving laundry order:', error);
    }
  };

  const handleDropOffDateChange = (e) => {
    setDropOffDate(e.target.value);
  };

  const handlePickUpDateChange = (e) => {
    setPickUpDate(e.target.value);
  };

  const handleSearchQueryChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.phoneNumber.toString().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer._id);
    setSearchQuery(customer.name);
    setFilteredCustomers([]);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Add Laundry Order</Card.Title>
        <Form>
          <Form.Group controlId="customerSearch" className="position-relative">
            <Form.Control
              type="text"
              placeholder="Enter customer name or number"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              className='mt-3'
            />
            {searchQuery && (
              <ListGroup className="filtered-customer-list">
                {filteredCustomers.map((customer) => (
                  <ListGroup.Item key={customer._id} action onClick={() => handleCustomerSelect(customer)}>
                    {customer.name} - {customer.phoneNumber}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group controlId="dropOffDatePicker">
                <Form.Label>Drop off Date</Form.Label>
                <Form.Control type="datetime-local" value={dropOffDate} onChange={handleDropOffDateChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="pickUpDatePicker">
                <Form.Label>Pick up Date</Form.Label>
                <Form.Control type="datetime-local" value={pickUpDate} onChange={handlePickUpDateChange} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group controlId="loadsInput">
            <Form.Label>Loads</Form.Label>
            <Form.Control type="number" value={loads} onChange={(e) => setLoads(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="priceInput">
            <Form.Label>Price ($)</Form.Label>
            <Form.Control type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Form.Group>
          <Button variant="primary" onClick={handleSave} className='mt-2'>Save</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddLaundryForm;
