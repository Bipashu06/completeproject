import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './view_products.css';
import errorImage from './assets/error.png';
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productNameOrder, setProductNameOrder] = useState("");

  function fetchProducts() {
    fetch("https://fullstack-backend-gaay.onrender.com/products")
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
    axios.delete('https://fullstack-backend-gaay.onrender.com/products',{ data: { id: DelId }}).then((response) => {
      console.log(response.data);
      fetchProducts();
    }).catch((e) => {
      console.error("There is an error occured while deleting the object ", e)
    })
  };

  const [productName, setProductName] = useState("");
  const [hsn, setHsn] = useState("");
  const [price, setPrice] = useState(0);
  const [productId, setProductId] = useState(0);

  const editProduct = (e) => {
    e.preventDefault();
    axios.put('https://fullstack-backend-gaay.onrender.com/update', {
      id: productId,
      product_name: productName.toLowerCase(),
      HSN: hsn.toLowerCase(),
      price: price,
    }).then((response) => {
      console.log(response.data);
      fetchProducts();
      setShowForm(false); 
      return axios.put('https://fullstack-backend-gaay.onrender.com/update', { product_name: productNameOrder.toLowerCase(), 
      editedValue: productName.toLowerCase()});
    }).then((response) => {
        console.log("second task response", response.data);
    })
    .catch((e) => {
      console.error(e);
    })
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


  return (
    <div>
      <h2>Product List</h2>
      {products.length > 0 ? (
        <table cellSpacing={0}>
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
      ) : (
        <p>No products found.</p>
      )}
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
            <img onClick={() => setShowForm(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/multiply.png" alt="multiply"/>
            <label htmlFor="product_name">Product Name</label>
            <input required type="text" value={productName} name="product_name" onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" />
            <label htmlFor="product_hsn">Product HSN</label>
            <input required type="text" value={hsn} name="product_hsn" onChange={(e) => setHsn(e.target.value)} placeholder="HSN" />
            <label htmlFor="product_price">Price</label>
            <input required type="number" value={price} name="product_price" onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
            <input type="submit" onClick={editProduct} value="Save" />
          </form>
        </div>
      )}
    </div>
  );
}

export default ViewProducts;
