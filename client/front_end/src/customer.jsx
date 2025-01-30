import { useState } from 'react';
import './customer.css';
import axios from "axios";

export default function AddCustomer(){

    const [companyName, setCompanyName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pin, setPin] = useState("");
    const [phone, setPhone] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [gstin, setGstin] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const customer = { companyName: companyName.toLowerCase(),
            street: street.toLowerCase(), 
            city: city.toLowerCase(),
            state: state.toLowerCase(),
            pin, 
            phone, 
            stateCode, 
            gstin: gstin.toLowerCase()
         };
    
        axios.post("http://localhost:3001/customers", customer)
          .then((response) => {
            console.log(response.data.message);
            // setServerResponse(response.data.message);
          })
          .catch((error) => {
            console.error("There was an error adding the user!", error);
          });
          setCompanyName("");
          setStreet("");
          setCity("");
          setState("");
          setPin("");
          setPhone("");
          setStateCode("");
          setGstin("");
      };
    return(
        <>
            <div className="customer-form-container">
                <form onSubmit={handleSubmit}>
                    <input type="text" value={companyName} placeholder='company name' onChange={(e) => setCompanyName(e.target.value)}/><br />
                    <input type="text" value={street} placeholder='street' onChange={(e) => setStreet(e.target.value)}/><br />
                    <input type="text" value={city} placeholder='city' onChange={(e) => setCity(e.target.value)}/><br />
                    <input type="text" value={state} placeholder='state' onChange={(e) => setState(e.target.value)}/><br />
                    <input type="text" value={stateCode} placeholder='state code' onChange={(e) => setStateCode(e.target.value)}/><br />
                    <input type="number" value={pin} placeholder='pin' onChange={(e) => setPin(e.target.value)}/><br />
                    <input type="text" value={gstin} placeholder='GSTIN' onChange={(e) => setGstin(e.target.value)}/><br />
                    <input type="number" value={phone} placeholder='phone' onChange={(e) => setPhone(e.target.value)}/><br />
                    <input type="submit"/>
                </form>
            </div>
        </>
    )
}