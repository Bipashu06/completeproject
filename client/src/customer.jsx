import { useState } from 'react';
import './customer.css';
import axios from "axios";
const apiurl = "http://localhost:3001"


export default function AddCustomer() {

    const [companyName, setCompanyName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pin, setPin] = useState("");
    const [phone, setPhone] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [gstin, setGstin] = useState("");
    const [showLoader, setShowLoader] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!companyName || !street || !city || !state || !pin || !phone || !stateCode || !gstin){
          alert('fill out all'); 
          return null;
        }
        setShowLoader(true);
        const customer = {
            companyName: companyName.toLowerCase(),
            street: street.toLowerCase(),
            city: city.toLowerCase(),
            state: state.toLowerCase(),
            pin,
            phone,
            stateCode,
            gstin: gstin.toLowerCase()
        };

        axios.post(`${apiurl}/customers`, customer)
            .then((response) => {
                if(response.data.error){
                  alert(response.data.error);
                  return null;
                }
                alert(response.data.message);
            })
            .catch((error) => {
                console.error("There was an error adding the user!", error);
            }).finally(() => {
                setShowLoader(false);
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
    return (
        <form className="create_invoice_form" id='add-customer-form' onSubmit={handleSubmit}>
          {showLoader && (
                <div className="loader-container">
                    <span class="loader"></span>
                </div>
            )}
        <div>
          <label htmlFor="companyName">Company Name</label>
          <input id="companyName" type="text" value={companyName} placeholder="company name" onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        
        <div>
          <label htmlFor="street">Street</label>
          <input id="street" type="text" value={street} placeholder="street" onChange={(e) => setStreet(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="city">City</label>
          <input id="city" type="text" value={city} placeholder="city" onChange={(e) => setCity(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="state">State</label>
          <input id="state" type="text" value={state} placeholder="state" onChange={(e) => setState(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="stateCode">State Code</label>
          <input id="stateCode"
            onWheel={(e) => e.target.blur()}
            min={1}
            onKeyDown={(e) => {
                const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
          type="number" value={stateCode} placeholder="state code" onChange={(e) => setStateCode(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="pin">PIN</label>
          <input id="pin"
             onWheel={(e) => e.target.blur()}
             min={1}
             onKeyDown={(e) => {
                 const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                 if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                   e.preventDefault();
                 }
               }}
          type="number" value={pin} placeholder="pin" onChange={(e) => setPin(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="gstin">GSTIN</label>
          <input id="gstin" type="text" value={gstin} placeholder="GSTIN" onChange={(e) => setGstin(e.target.value)} />
        </div>
      
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" 
             onWheel={(e) => e.target.blur()}
             min={1}
             onKeyDown={(e) => {
                 const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                 if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                   e.preventDefault();
                 }
               }}
          type="number" value={phone} placeholder="phone" onChange={(e) => setPhone(e.target.value)} />
        </div>
      
        <div style={{ gridColumn: "1 / -1" }}>
          <input type="submit" />
        </div>
      </form>
      
    )
}