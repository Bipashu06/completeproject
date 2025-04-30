import { useEffect, useState, useRef } from 'react';
import { jsPDF } from "jspdf";
import axios from 'axios';
import html2canvas from "html2canvas";
import noinvoice from './assets/noinvoice.png';
const apiurl = "http://localhost:3001"

import './view_invoice.css';
export default function Invoice() {
  var today = new Date().toISOString().split('T')[0];
  today = today.replace(/-/g, '/');
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [currentDate, setCurrentDate] = useState(today);
  const [showPdfPopUp, setShowPdfPopUp] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);

  const [toPrintCustomer, setToPrintCustomer] = useState({});
  const [addedProducts, setAddedProducts] = useState([]);
  const [editableProduct, setEditableProduct] = useState([]);
  const [showExistingProducts, setShowExistingProducts] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState(0);
  const [phone, setPhone] = useState(0);
  const [customerId, setCustomerId] = useState(0);
  const [gstin, setGstin] = useState("");
  const [pin, setPin] = useState(0);

  const [showLoader, setShowLoader] = useState(false);

  const pdfRef = useRef();
  const generatePDF = () => {
    const elem = document.getElementsByClassName('invoice')[0];
    elem.style.scale = '1';
    elem.style.width = '862px';
    elem.style.boxShadow = 'none';
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("example.pdf");
        setShowPdfPopUp(false);
      })
      .catch((error) => console.error("Error generating PDF:", error));
  };
  function fetchCutomers() {
    fetch(`${apiurl}/customers`)
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
        console.error(error.message);
      });
  };
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
        console.error(error.message);
      });
  }
  function fetchOrders() {
    fetch(`${apiurl}/orders`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch ordered products.");
        }
        return response.json();
      })
      .then((data) => {
        setOrderedProducts(data.orders);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
  function fetchInvoices() {
    fetch(`${apiurl}/invoices`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch invoices.");
        }
        return response.json();
      })
      .then((data) => {
        setInvoices(data.invoices);
      })
      .catch((error) => {
        alert(error.message);
      });
  }
  const deleteInvoice = async (id) => {
    axios.delete(`${apiurl}/invoices`, { data: { invoice_id: id } })
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
          return null;
        }
        fetchInvoices();
        return axios.delete(`${apiurl}/order`, { data: { invoice_id: id } });
      })
      .then((res) => {
        if (res.data.error) {
          alert(res.data.error);
          return null;
        }
        fetchOrders();
      })
      .catch(e => {
        alert("error occured "+ e.message);
      })
  };

  function editInvoice(invoId, cusId, regesDate) {
    const customer = customers.find((customer) => customer.id === cusId);
    setCustomerId(customer.id);
    setCustomerName(customer.c_name);
    setCustomerId(customer.id);
    setStreetName(customer.street_name);
    setCityName(customer.city);
    setStateName(customer.state);
    setPin(customer.pin);
    setStateCode(customer.state_code);
    setPhone(customer.phone);
    setGstin(customer.gstin);
    const order = orderedProducts.filter(product => product.invoice_id === invoId);

    const updatedAddedProducts = order.map(order => {
      const matchedProduct = products.find(product => product.product_name.toLowerCase() === order.product.toLowerCase());
      return {
        ...order,
        hsn: matchedProduct ? matchedProduct.HSN : "HSN_NOT_FOUND",
        price: matchedProduct.price
      };
    });
  

    setEditableProduct(updatedAddedProducts);
    setShowEditInvoice(true);
  }
  useEffect(() => {
    if (editableProduct.length > 0) {
      setEditableProduct(editableProduct);
    }
  }, [editableProduct]);
  useEffect(() => {
    fetchInvoices();
    fetchCutomers();
    fetchProducts();
    fetchOrders();
  }, []);
  const [selectedIid, setSelectedIid] = useState(null);
  function ValueSetter(iid, cid, regDate) {
    setSelectedIid(iid);
    setCurrentDate(() => {
      return new Date(regDate).toLocaleString();
    });
    const customer = customers.find((customer) => customer.id === cid);
    setToPrintCustomer(customer);
    const order = orderedProducts.filter(product => product.invoice_id === iid);
    const updatedAddedProducts = order.map(order => {
      const matchedProduct = products.find(product => product.product_name.toLowerCase() === order.product.toLowerCase());
      return {
        ...order,
        hsn: matchedProduct ? matchedProduct.HSN : "A1",
        price: matchedProduct ? matchedProduct.price : 100,
      };
    });
    setAddedProducts((prev) => updatedAddedProducts);
  }
  useEffect(() => {
    if (addedProducts.length > 0) {
      setAddedProducts((prev) => addedProducts);
      setShowPdfPopUp(true);
    }
  }, [addedProducts]);


  function RemoveOrderedProduct(i) {
    setEditableProduct(editableProduct.filter((_, index) => index !== i));
  }
  const editCustomer = async () => {
   
    try {
      const response = await axios.put(`${apiurl}/customers/update`, {
        id: customerId,
        c_name: customerName.toLowerCase(),
        street_name: streetName.toLowerCase(),
        city: cityName.toLowerCase(),
        state: stateName.toLowerCase(),
        state_code: stateCode,
        phone: phone,
        pin: pin,
        gstin: gstin.toLowerCase(),
      }
      );
      if(response.data.error){
        alert(response.data.error)
        return null;
      }
      fetchCutomers();
    }
    catch (e) {
      console.error(e);
    }
  };
  async function EditOrder() {
    try {
      const response = await axios.post(`${apiurl}/orders/edited`, editableProduct);
      if(response.data.error){
        alert(response.data.error)
        return null;
      }
      fetchOrders();
    }
    catch (error) {
      alert(error);
    }
  }
  async function SubmitChanges(e) {
    e.preventDefault();
    if (!customerName || !streetName || !cityName || !stateName || !stateCode || !pin || !phone || !gstin) {
      alert('Please fill out all');
      return null;
    }
    if (Number(stateCode) === 0 || Number(pin) === 0 || Number(phone) === 0) {
      alert('Please enter a valid statecode, pin and phone');
      return null;
    }
    if(editableProduct.length === 0){
      alert("Prodcuts cant be empty")
      return null;
    }
    const hasZeroQuantity = editableProduct.some(product => product.quantity === 0);
    if (hasZeroQuantity){
      alert("products can't have quantity 0!");
      return null;
    }
    setShowLoader(true);
    try {
      await editCustomer();
      await EditOrder();
      alert("Invoice updated successfully");
      setShowEditInvoice(false);
    }
    catch (e) {
      console.error(e);
    }finally{
      setShowLoader(false);

    }
  }
function AddedProductInOrder(name, Hsn, Price) {
  setEditableProduct((prev) => {
    const existingIndex = prev.findIndex(item => item.hsn === Hsn);

    if (existingIndex !== -1) {
      
      // Product with the same HSN exists, update its quantity and total_price
      const updatedProduct = [...prev];
      updatedProduct[existingIndex].quantity = Number(updatedProduct[existingIndex].quantity) + 1;
      updatedProduct[existingIndex].total_price = 
        updatedProduct[existingIndex].quantity * updatedProduct[existingIndex].price;
      return updatedProduct;
    } else {

      return [
        ...prev,
        {
          hsn: Hsn,
          invoice_id: prev.length > 0 ? Number(prev[0].invoice_id) : 1, // Fallback if empty
          price: Number(Price),
          product: name,
          quantity: 1,
          total_price: Number(Price)
        }
      ];
    }
  });
}

  const handleQuantityChange = (e, index) => {
    const newQuantity = Number(e.target.value);
    const updatedProducts = [...editableProduct];
    updatedProducts[index].quantity = newQuantity;
    updatedProducts[index].total_price = updatedProducts[index].price * newQuantity;
    setEditableProduct(updatedProducts);
  };


  return (
    <>
      {showEditInvoice && (
        <div className="invoice-edit-popup-div">
          
          <form className='invoice-edit-popup-form'>
          {showLoader && (
                <div className="loader-container">
                    <span class="loader"></span>
                </div>
            )}
            <img id='invoice-edit-popup-off-btn' onClick={() => setShowEditInvoice(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/multiply.png" alt="multiply" />
            <h2>Edit Details</h2>
            <div className="form-customer-section">
              <div className="input-with-label">
                <label htmlFor="c_name">Company Name</label>
                <input required type="text" value={customerName} name="c_name" onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name" />
              </div>
              <div className="input-with-label">
                <label htmlFor="street_name">Street Name</label>
                <input required type="text" value={streetName} name="street_name" onChange={(e) => setStreetName(e.target.value)} placeholder="Street " />
              </div>
              <div className="input-with-label">
                <label htmlFor="city">City Name</label>
                <input required type="text" value={cityName} name="city" onChange={(e) => setCityName(e.target.value)} placeholder="City" />
              </div>
              <div className="input-with-label">
                <label htmlFor="state">State</label>
                <input required type="text" value={stateName} name="state" onChange={(e) => setStateName(e.target.value)} placeholder="State" />
              </div>
              <div className="input-with-label">
                <label htmlFor="pin">Pin</label>
                <input required type="number"
                  onWheel={(e) => e.target.blur()}
                  min={1}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  value={pin} name="pin" onChange={(e) => setPin(e.target.value)} placeholder="Pin" />
              </div>
              <div className="input-with-label">
                <label htmlFor="phone">Phone</label>
                <input required type="number"
                  onWheel={(e) => e.target.blur()}
                  min={1}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  value={phone} name="phone" onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              </div>
              <div className="input-with-label">
                <label htmlFor="statecode">State Code</label>
                <input required type="number"
                  onWheel={(e) => e.target.blur()}
                  min={1}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  value={stateCode} name="statecode" onChange={(e) => setStateCode(e.target.value)} placeholder="State Code" />
              </div>
              <div className="input-with-label">
                <label htmlFor="gstin">Gstin</label>
                <input required type="text" value={gstin} name="gstin" onChange={(e) => setGstin(e.target.value)} placeholder="GSTIN" />
              </div>
            </div>

            <div className="form-product-section">
              <table cellSpacing={0}>
                <tr>
                  <th>Sr</th>
                  <th>Product</th>
                  <th>Hsn</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Option</th>
                </tr>
                {editableProduct.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.product}</td>
                    <td>{product.hsn}</td>
                    <td>{product.price}</td>
                    <td><input type="number" id="quantity_input"
                      min={1}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      value={product.quantity} onChange={(e) => handleQuantityChange(e, index)} /></td>
                    <td>{product.total_price}</td>
                    <td><button id='delete_btn' onClick={() => RemoveOrderedProduct(index)}>remove</button></td>
                  </tr>
                ))}
              </table>
            </div>
            <button onClick={(e) => { e.preventDefault(); setShowExistingProducts(true); }} id='add-product-btn'>Add Products</button>
            <input id='save-invoice-change-btn' type="submit" value="Save" onClick={(e) => SubmitChanges(e)} />
          </form>
        </div>
      )}
      {showExistingProducts && (
        <div className="existinguser_table_popup">
          <div className="existing_user_table_container">
            <img onClick={(e) => setShowExistingProducts(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/60/multiply.png" alt="multiply" />
            {products.length > 0 ? (
              <table className='existing_user_table' cellSpacing={0}>
                <thead>
                  <tr>
                    <th>Products</th>
                    <th>HSN</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td><strong>{product.product_name}</strong></td>
                      <td>{product.HSN}</td>
                      <td>{product.price}</td>
                      <td><button id='selectuser_btn' onClick={() => AddedProductInOrder(product.product_name, product.HSN, product.price)}>{isAdded ? "Added" : "Add"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No Products found.</p>
            )}
          </div>
        </div>
      )}
      {showPdfPopUp &&
        (
          <div className="pdf-popup">
            <div ref={pdfRef} className="invoice">
              <div className="header">
                <div className="company-info">
                  <h2>AutoNova Techonologies</h2>
                  <p>
                    123 Automation Street<br />
                    Tech City, StateX, ST123<br />
                    GSTIN: 12ABCDE3456FZ1Z
                  </p>
                </div>
                <div className="date">
                  <p><strong>Invoice Date:</strong> {currentDate.split(",")[0].replaceAll('/', '-')}</p>
                  <p><strong>Invoice No:</strong> INV-{selectedIid}</p>
                </div>
              </div>

              <div className="client-info">
                <h3>Bill To:</h3>
                <p>
                  {toPrintCustomer.c_name.toUpperCase()} Company,<br />
                  {toPrintCustomer.street_name.charAt(0).toUpperCase() + toPrintCustomer.street_name.slice(1).toLowerCase()},<br />
                  {toPrintCustomer.city.charAt(0).toUpperCase() + toPrintCustomer.city.slice(1).toLowerCase()},<br />
                  {toPrintCustomer.state.charAt(0).toUpperCase() + toPrintCustomer.state.slice(1).toLowerCase()}, {toPrintCustomer.state_code},<br />
                  PIN: {toPrintCustomer.pin}<br />
                  GSTIN: {toPrintCustomer.gstin.toUpperCase()}<br />
                  Mobile: {toPrintCustomer.phone}
                </p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Product Name</th>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {addedProducts.length > 0 && (
                    addedProducts.map((product, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{product.product}</td>
                        <td>{product.hsn}</td>
                        <td>{product.quantity}</td>
                        <td>{product.price}</td>
                        <td>{product.total_price}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="footer">
                Thank you for your business!
              </div>
            </div>
            <button id='save-pdf-view' onClick={generatePDF}>Save</button>
            <button onClick={() => setShowPdfPopUp(false)} id='cancel-pdf-view'>Cancel</button>
          </div>)
      }
      {invoices.length > 0 ? (
        <section>
          <table className="invoice-table-container-table" cellSpacing={0}>
            <tr>
              <th>Inovoice Id</th>
              <th>customer Id</th>
              <th>Registered Date</th>
              <th colSpan={3}>Options</th>
            </tr>
            {invoices.length > 0 && (
              invoices.map((invo, index) => {
                const reg_date = new Date(invo.reg_date).toLocaleString();
                return (<tr key={index}>
                  <td>{invo.invoice_id}</td>
                  <td>{invo.customer_id}</td>
                  <td>{reg_date}</td>
                  <td><button id='pdf-view' onClick={() => ValueSetter(invo.invoice_id, invo.customer_id, invo.reg_date)}>View</button></td>
                  <td><button id='pdf-edit' onClick={() => editInvoice(invo.invoice_id, invo.customer_id, invo.reg_date)}>Edit</button></td>
                  <td><button id='delete_btn' onClick={() => deleteInvoice(invo.invoice_id)}>Delete</button></td>
                </tr>);
              })
            )}
          </table>
        </section>
      ) : (
        <div className="no-invoice-container">
          <h1>No Invoices Found</h1>
          <img src={noinvoice} alt='no invoices' />
        </div>
      )}

    </>
  )
}