import React from 'react';
import { Card } from 'react-bootstrap';

const InventoryList = () => {
  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Inventory</h1>
      </div>
      <Card>
        <Card.Body>
          <h5>Inventory Management</h5>
          <p>This component will be implemented to manage bakery inventory.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryList; 