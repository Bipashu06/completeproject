import { useState } from 'react';
import './products.css';
import axios from "axios";

export default function AddProduct(){

    const [productName, setProductName] = useState("");
    const [hsn, setHsn] = useState("");
    const [price, setPrice] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const product = {
          productName: productName.toLowerCase(), 
          hsn: hsn.toLowerCase(), 
          price
        };
    
        axios.post("https://sql12.freesqldatabase.com:3306/products", product)
          .then((response) => {
            console.log(response.data);
            console.log(response.data.message);
            // setServerResponse(response.data.message);
          })
          .catch((error) => {
            console.error("There was an error adding the user!", error);
          });
          setProductName("");
          setHsn("");
          setPrice("");
      };
    return(
        <>
            <div className="customer-form-container">
                <form onSubmit={handleSubmit}>
                    <input type="text" value={productName} placeholder='product name' onChange={(e) => setProductName(e.target.value)}/><br />
                    <input type="text" value={hsn} placeholder='HSN' onChange={(e) => setHsn(e.target.value)}/><br />
                    <input type="text" value={price} placeholder='Price' onChange={(e) => setPrice(e.target.value)}/><br />
                    <input type="submit"/>
                </form>
            </div>
        </>
    )
}