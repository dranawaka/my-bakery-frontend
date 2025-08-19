import React from 'react';
import { Card } from 'react-bootstrap';

const CustomerList: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Customers</h1>
      </div>
      <Card>
        <Card.Body>
          <h5>Customer Management</h5>
          <p>This component will be implemented to manage bakery customers.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerList; 