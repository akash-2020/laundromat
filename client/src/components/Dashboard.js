import React, { useState, useEffect } from 'react';
import { Button, Navbar, Container, Nav, Offcanvas, Modal, Form, Alert } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import AddLaundryForm from './AddLaundryForm';
import { Row, Col, Table } from 'react-bootstrap';

function Dashboard({ onLogout }) {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [flashMessage, setFlashMessage] = useState(null);
  const [flashType, setFlashType] = useState(null);
  const [laundries, setLaundries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleShowLogoutModal = () => setShowLogoutModal(true);

  useEffect(() => {
    fetchCustomers();
    fetchLaundries();
  }, []);

  const fetchLaundries = async () => {
    try {
      const response = await axios.get('/api/laundries');
      const sortedLaundries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLaundries(sortedLaundries);
    } catch (error) {
      console.error('Error fetching laundries:', error);
    }
  };

  const confirmLogout = () => {
    handleCloseLogoutModal();
    onLogout();
  };

  const saveCustomer = async () => {
    try {
      const response = await axios.post('/api/customers', {
        name: customerName,
        address: customerAddress,
        phoneNumber: customerPhone
      });
  
      console.log('Customer saved:', response.data);
      handleCloseModal();
      setCustomerName('');
      setCustomerAddress('');
      setCustomerPhone('');
      setFlashMessage('Customer added successfully');
      setFlashType('success');
      
      // Fetch the updated list of customers after a new customer is added
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      setFlashMessage('Failed to add customer');
      setFlashType('danger');
    }
  };

  const fetchCustomers = async () => {
    try {
        const response = await axios.get('/api/customers');
        setCustomers(response.data);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
  };

  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 992px)' });

  useEffect(() => {
    if (flashMessage) {
      const timeout = setTimeout(() => {
        setFlashMessage(null);
        setFlashType(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [flashMessage]);

  const addNewLaundryOrder = (newLaundry) => {
    // Find the correct index to insert the new laundry based on its date
    let insertionIndex = 0;
    while (insertionIndex < laundries.length && new Date(newLaundry.date) < new Date(laundries[insertionIndex].date)) {
        insertionIndex++;
    }

    // Construct the new array with the new laundry inserted at the correct position
    const updatedLaundries = [...laundries.slice(0, insertionIndex), newLaundry, ...laundries.slice(insertionIndex)];

    // Update the state with the updated array
    setLaundries(updatedLaundries);
  };

  const filteredLaundries = laundries.filter((laundry) =>
    laundry.customerId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (laundry.customerId?.phoneNumber.toString().includes(searchTerm))
  );

  function downloadCSV(csvData, fileName) {
    // Create a CSV string from the data
    const csvString = [
      [
        'Date',
        'Name',
        'Phone Number',
        'Loads',
        'Price'
      ],
      ...csvData.map(item => [
        new Date(item.date).toLocaleString('en-US', { timeZone: 'America/Halifax' }),
        item.customerId?.name,
        item.customerId?.phoneNumber,
        item.loads,
        item.price.toFixed(2)
      ])
    ]
    .map(e => e.join(","))
    .join("\n");
  
    // Create a Blob from the CSV String
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
    // Create a link element
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container fluid>
          <Button variant="outline-none" onClick={handleShow} className="me-2">
            <span className="navbar-toggler-icon"></span>
          </Button>
          <Navbar.Brand href="#home">Laundry Mat Dashboard</Navbar.Brand>
          <Nav className="ml-auto">
            {isDesktopOrLaptop ? (
              <Button variant="primary" onClick={handleShowModal} className="ms-auto me-2">
                <i className="bi bi-person-add"></i>
              </Button>
            ) : null}
            <Button variant="secondary" onClick={handleShowLogoutModal}>
              <i className="bi bi-box-arrow-right"></i>
            </Button>            
          </Nav>
        </Container>
      </Navbar>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Help</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {!isDesktopOrLaptop ? (
            <Button variant="primary" onClick={handleShowModal} className="w-100 mb-2">
              Add New Customer
            </Button>
          ) : null}
          <h5>Owner</h5>
          Yash Shah - 5148342123
        </Offcanvas.Body>
      </Offcanvas>
      <main className="dashboard-content p-3">
        <Row>
            <Col xs={12} md={8}>
                <div className="d-flex mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search by Name or Phone"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="me-2"
                    />
                    <Button variant="outline-secondary" onClick={() => downloadCSV(filteredLaundries, 'laundries.csv')}>
                        <i className="bi bi-file-earmark-arrow-down"></i>
                    </Button>
                </div>
                <div className="scrollable-table">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Drop off Date</th>
                                <th>Pick up Date</th>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Loads</th>
                                <th>Price($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLaundries.map((laundry) => (
                                <tr key={laundry._id}>
                                    <td>
                                        {new Date(new Date(laundry.dropOffDate).getTime() - 60 * 60 * 1000)
                                        .toLocaleString('en-US', { timeZone: 'America/Halifax' })}
                                    </td>
                                    <td>
                                        {new Date(new Date(laundry.pickUpDate).getTime() - 60 * 60 * 1000)
                                        .toLocaleString('en-US', { timeZone: 'America/Halifax' })}
                                    </td>
                                    <td>{laundry.customerId?.name}</td>
                                    <td>{laundry.customerId?.phoneNumber}</td>
                                    <td>{laundry.loads}</td>
                                    <td>{laundry.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Col>
            <Col xs={12} md={4}>
                <AddLaundryForm addNewLaundryOrder={addNewLaundryOrder} customers={customers} />
            </Col>
        </Row>
      </main>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formCustomerName">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCustomerAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCustomerPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveCustomer}>
            Save Customer
          </Button>
        </Modal.Footer>
      </Modal>
      {flashMessage && (
        <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <Alert variant={flashType} onClose={() => setFlashMessage(null)}>
            {flashMessage}
          </Alert>
        </div>
      )}
      <Modal show={showLogoutModal} onHide={handleCloseLogoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmLogout}>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Dashboard;
