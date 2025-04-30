import { useState } from 'react';
import './products.css';
import axios from "axios";
const apiurl = "http://localhost:3001"

export default function AddProduct() {

  const [productName, setProductName] = useState("");
  const [hsn, setHsn] = useState("");
  const [price, setPrice] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const handleSubmit = (e) => {
    setShowLoader(true);
    e.preventDefault();
    if(!productName||!hsn||!price){
      alert('Please fill out all');
      return null;
    }
    if(Number(price) === 0){
      alert('Price cant be 0!');
      return null;
    }
    const product = {
      productName: productName.toLowerCase(),
      hsn: hsn.toLowerCase(),
      price
    };

    axios.post(`${apiurl}/products`, product)
      .then((response) => {
        // setServerResponse(response.data.message);
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
    setProductName("");
    setHsn("");
    setPrice("");
  };
  return (
      <form id="add-product" className="create_invoice_form" onSubmit={handleSubmit}>
         {showLoader && (
                <div className="loader-container">
                    <span class="loader"></span>
                </div>
            )}
        <div>
          <label htmlFor="productName">Product Name:</label><br />
          <input
            type="text"
            id="productName"
            value={productName}
            placeholder="Product name"
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="hsn">HSN:</label><br />
          <input
            type="text"
            id="hsn"
            value={hsn}
            placeholder="HSN"
            onChange={(e) => setHsn(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="price">Price:</label><br />
          <input
            type="number"
            onWheel={(e) => e.target.blur()}
            min={1}
            onKeyDown={(e) => {
                const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
            id="price"
            value={price}
            placeholder="Price"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
          <input type="submit" value="Submit" />        
      </form>
  )
}