import React, { useEffect, useState } from 'react';
import './view_customers.css';
import axios from 'axios';
function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);


  const [customerName, setCustomerName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState(0);
  const [phone, setPhone] = useState(0);
  const [customerId, setCustomerId] = useState(0);
  const [gstin, setGstin] = useState("");
  const [pin, setPin] = useState(0);

 function fetchCutomers(){
  fetch("https://fullstack-backend-gaay.onrender.com/customers") 
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch customers.");
    }
    return response.json();
  })
  .then((data) => {
    setCustomers(data.customers);
  })
  .catch((error) => {
    setError(error.message);
  });
 };
 const deleteCustomer = (delid) => {
    axios.delete('https://fullstack-backend-gaay.onrender.com/customers', { data: { id: delid } }).then((response) => {
      console.log(response.data);
      fetchCutomers();
    }).catch(e => {
      console.error("Error occured ", e);
    })
};

 const editCustomer = (e) => {
  e.preventDefault();
  axios.put('https://fullstack-backend-gaay.onrender.com/update', {
    id: customerId,
    c_name: customerName.toLowerCase(),
    street_name: streetName.toLowerCase(),
    city: cityName.toLowerCase(),
    state: stateName.toLowerCase(),
    state_code: stateCode,
    phone: phone,
    pin: pin,
    gstin: gstin.toLowerCase(),
  }).then((response) => {
    console.log(response.data);
    fetchCutomers();
    setShowEditForm(false);
  }).catch((e) => {
    setShowEditForm(false);
    setError(error.message);
    console.log(error);
  })
  };

  useEffect(() => {
    fetchCutomers();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }
  function handleEdit(id, name, street, city, state, pin, phone, state_code, gstin){
    setShowEditForm(true);
    setCustomerName(name);
    setCustomerId(id);
    setStreetName(street);
    setCityName(city);
    setStateName(state);
    setPin(pin);
    setStateCode(state_code);
    setPhone(phone);
    setGstin(gstin);
  }

  return (
    <div>
      <h2>Customers List</h2>
      {customers.length > 0 ? (
        <table cellSpacing={0}>
          <thead>
            <tr>
                <th>ID</th>
                <th>Comapany name</th>
                <th>Street</th>
                <th>city</th>
                <th>state</th>
                <th>Pin</th>
                <th>Phone</th>
                <th>reg date</th>
                <th>State Code</th>
                <th>GSTIN</th>
                <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {customers.map((customer, index) => (
            <tr key={index}>
             <td>{customer.id}</td>
             <td> <strong>{customer.c_name}</strong></td>
             <td>{customer.street_name} </td>
             <td>{customer.city}</td>
             <td> <strong>{customer.state}</strong></td>
             <td>{customer.pin} </td>
             <td>{customer.phone}</td>
             <td> <strong>{customer.reg_date}</strong></td>
             <td>{customer.state_code} </td>
             <td>{customer.gstin} </td>
             <td><button onClick={() => handleEdit(customer.id, customer.c_name, customer.street_name, customer.city, customer.state, customer.pin, customer.phone, customer.state_code, customer.gstin)} id ='edit_btn'>Edit</button> <button onClick={() => deleteCustomer(customer.id)} id ='delete_btn'>Delete</button></td>
            </tr>
          ))}
          </tbody>
        </table>
      ) : (
        <p>No customers found.</p>
      )}
      {showEditForm && (

       <div className="product-edit-popup">
          <form>
            <img onClick={() => setShowEditForm(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/multiply.png" alt="multiply"/>
            <label htmlFor="c_name">Company Name</label>
            <input required type="text" value={customerName} name="c_name" onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name" />
            
            <label htmlFor="street_name">Street Name</label> 
            <input required type="text" value={streetName} name="street_name" onChange={(e) => setStreetName(e.target.value)} placeholder="Street " />
            
            <label htmlFor="city">City Name</label>
            <input required type="text" value={cityName} name="city" onChange={(e) => setCityName(e.target.value)} placeholder="City" />
            
            <label htmlFor="state">State</label>
            <input required type="text" value={stateName} name="state" onChange={(e) => setStateName(e.target.value)} placeholder="State" />
            
            <label htmlFor="pin">Pin</label>
            <input required type="number" value={pin} name="pin" onChange={(e) => setPin(e.target.value)} placeholder="Pin" />
            
            <label htmlFor="phone">Phone</label>
            <input required type="number" value={phone} name="phone" onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            
            <label htmlFor="statecode">State Code</label>
            <input required type="number" value={stateCode} name="statecode" onChange={(e) => setStateCode(e.target.value)} placeholder="State Code" />
            
            <label htmlFor="gstin">Gstin</label>
            <input required type="text" value={gstin} name="gstin" onChange={(e) => setGstin(e.target.value)} placeholder="GSTIN" />
            
            <input type="submit" onClick={editCustomer} value="Save" />
          </form>
        </div>
      )}
    </div>
  );
}

export default ViewCustomers;
