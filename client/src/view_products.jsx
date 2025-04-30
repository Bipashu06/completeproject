import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './view_products.css';
const apiurl = "http://localhost:3001"
import errorImage from './assets/error.png';
import noorder from './assets/noorder.png';
function ViewProducts(){
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productNameOrder, setProductNameOrder] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  function fetchProducts() {
    fetch(`${apiurl}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.products);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  const deleteProduct = (DelId) => {
    axios.delete(`${apiurl}/products`, { data: { id: DelId } }).then((response) => {
      fetchProducts();
    }).catch((e) => {
      console.error("There is an error occured while deleting the object ", e.message)
    })
  };
  const [productName, setProductName] = useState("");
  const [hsn, setHsn] = useState("");
  const [price, setPrice] = useState(0);
  const [productId, setProductId] = useState(0);

  const editProduct = async (e) => {
    e.preventDefault();
    if (!productName || !hsn || !price) {
      alert('Please fill out all fields');
      return;
    }
    if(Number(price) === 0){
      alert('Price cant be 0!');
      return null;
    }
    setShowLoader(true);
    try {
      await axios.put(`${apiurl}/products/update`, {
        id: productId,
        product_name: productName.toLowerCase(),
        HSN: hsn.toLowerCase(),
        price: price,
      });
      fetchProducts();
      setShowForm(false);
      const response = await axios.put(`${apiurl}/orders/update`, {
        product_name: productNameOrder.toLowerCase(),
        editedValue: productName.toLowerCase()
      });
      if(response.data.error){
        alert(response.data.error);
        return null;
      }
      alert(response.data.message);
      
    } catch (error) {
      alert(error.message);
    }finally {
      setShowLoader(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  function handleEdit(id, hsn, name, price) {
    setShowForm(true);
    setProductNameOrder(prev => (name));
    setProductName(prev => (name));
    setHsn(hsn);
    setPrice(price);
    setProductId(id);
  }
  const [showError, setShowError] = useState(false);

  return products.length > 0 ? (
        <section>
        <h2>Product List</h2>
        <table id='product-table' cellSpacing={0}>
          <thead>
            <tr>
              <th>Product</th>
              <th>HSN</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td><strong>{product.product_name}</strong></td>
                <td>{product.HSN}</td>
                <td>₹{product.price}</td>
                <td>
                  <button id="edit_btn" onClick={() => handleEdit(product.product_id, product.HSN, product.product_name, product.price)}>Edit</button>
                  <button id="delete_btn" onClick={() => deleteProduct(product.product_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showError && (
          <div className="error-div-container">
            <div className="error-div">
              <img src={errorImage} alt="" />
              <h2>Error Occurs!</h2>
            </div>
          </div>
        )
        }

        {showForm && (
          <div className="product-edit-popup">
            <form>
            {showLoader && (
                <div className="loader-container">
                    <span class="loader"></span>
                </div>
            )}
              <img onClick={() => setShowForm(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/multiply.png" alt="multiply" />
              <label htmlFor="product_name">Product Name</label>
              <input required type="text" value={productName} name="product_name" onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" />
              <label htmlFor="product_hsn">Product HSN</label>
              <input required type="text" value={hsn} name="product_hsn" onChange={(e) => setHsn(e.target.value)} placeholder="HSN" />
              <label htmlFor="product_price">Price</label>
              <input required type="number" 
               onWheel={(e) => e.target.blur()}
               min={1}
               onKeyDown={(e) => {
                   const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                   if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                     e.preventDefault();
                   }
                 }}
              value={price} name="product_price" onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
              <input type="submit" onClick={editProduct} value="Save" />
            </form>
          </div>
        )}
      </section>
      ) : (
        <div className="no-invoice-container">
          <h1>No Product found</h1>
          <img src={noorder} id='no-order-img' alt="no product" />
        </div>
      );
}

export default ViewProducts;
