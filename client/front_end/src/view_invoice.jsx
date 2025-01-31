import { useEffect, useState, useRef } from 'react';
import { jsPDF } from "jspdf";
import axios from 'axios';
import html2canvas from "html2canvas";
import visionLogo from './assets/logo.png';
// import stamp from './stamp.jpg';
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

  const pdfRef = useRef();
  const generatePDF = () => {
    const elem = document.getElementsByClassName('invoice-pdf-copy')[0];
    elem.style.scale = '1';
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
        console.log(error.message);
      });
  };
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
        console.log(error.message);
      });
  }
  function fetchOrders() {
    fetch("https://fullstack-backend-gaay.onrender.com/orders")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch ordered products.");
        }
        return response.json();
      })
      .then((data) => {
        setOrderedProducts(data.orders);
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
  function fetchInvoices() {
    fetch("https://fullstack-backend-gaay.onrender.com/invoices")
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
        console.log(error.message);
      });
  }
  const deleteInvoice = async (id) => {
   axios.delete('https://fullstack-backend-gaay.onrender.com/invoices', { data: {invoice_id: id}}) 
   .then((response) => {
    console.log("response of first request", response.data);
    fetchInvoices();
    return axios.delete('https://fullstack-backend-gaay.onrender.com/orders', { data: { invoice_id: id}});
   })
   .then((res) => {
      console.log("response of second request ", res.data);
      fetchOrders();
   })
   .catch(e => {
    console.log("error occured ", e);
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
    setEditableProduct((prev) => updatedAddedProducts);
    setShowEditInvoice(true);
  }
  useEffect(() => {
    if (editableProduct.length > 0) {
      setEditableProduct((prev) => editableProduct);
    }
  }, [editableProduct]);
  useEffect(() => {
    fetchInvoices();
    fetchCutomers();
    fetchProducts();
    fetchOrders();
  }, []);
  
  function ValueSetter(iid, cid, regDate) {
    console.log(orderedProducts);
    setCurrentDate(regDate.split(" ")[0]);
    const customer = customers.find((customer) => customer.id === cid);
    setToPrintCustomer(customer);
    const order = orderedProducts.filter(product => product.invoice_id === iid);
    const updatedAddedProducts = order.map(order => {
      const matchedProduct = products.find(product => product.product_name.toLowerCase() === order.product.toLowerCase());
      console.log(matchedProduct);
      return {
        ...order,
        hsn: matchedProduct ? matchedProduct.HSN : "A1",
        price: matchedProduct ? matchedProduct.price : 100,
      };
    });
    console.log(updatedAddedProducts);
    setAddedProducts((prev) => updatedAddedProducts);
  }
  useEffect(() => {
    if (addedProducts.length > 0) {
      setAddedProducts((prev) => addedProducts);
      console.log(addedProducts);
      setShowPdfPopUp(true);
    }
  }, [addedProducts]);


  function RemoveOrderedProduct(i) {
    setEditableProduct(editableProduct.filter((_, index) => index !== i));
  }
  const editCustomer = async () => {
    try{
      const response = await axios.put(`https://fullstack-backend-gaay.onrender.com/update`, {
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
      console.log(response.data);
      fetchCutomers();
    }
    catch(e){
      console.error(e);
    }
  };
  async function EditOrder(){
    try{
      const response = await axios.post('https://fullstack-backend-gaay.onrender.com/edited', editableProduct);
      console.log(response.data);
      fetchOrders();
    }
    catch(error){
      console.error(e);
    }
  }
  async function SubmitChanges(e) {
    e.preventDefault();
    try{
      await editCustomer();
      await EditOrder();
      setShowEditInvoice(false);
    }
    catch(e){
      console.error(e);
    }
  }
  function AddedProductInOrder(name, Hsn, Price){
    setEditableProduct((prev) => {
      return[...prev, {
        hsn: Hsn, 
        invoice_id: Number(prev[0].invoice_id), 
        price: Number(Price), 
        product: name,
        quantity: 1,
        total_price: 1*Price
      }]
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
                <input required type="number" value={pin} name="pin" onChange={(e) => setPin(e.target.value)} placeholder="Pin" />
              </div>
              <div className="input-with-label">
                <label htmlFor="phone">Phone</label>
                <input required type="number" value={phone} name="phone" onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              </div>
              <div className="input-with-label">
                <label htmlFor="statecode">State Code</label>
                <input required type="number" value={stateCode} name="statecode" onChange={(e) => setStateCode(e.target.value)} placeholder="State Code" />
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
                  <td><input type="number" id="quantity_input" value={product.quantity} onChange={(e) => handleQuantityChange(e, index)} /></td>
                  <td>{product.total_price}</td>
                  <td><button id='delete_btn' onClick={() => RemoveOrderedProduct(index)}>remove</button></td>
                </tr>
              ))}
            </table>
            </div>
            <button onClick = {(e) => { e.preventDefault(); setShowExistingProducts(true);}} id='add-product-btn'>Add Products</button>
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
        (<div className="pdf-popup">
          <button id='save-pdf-view' onClick={generatePDF}>Save</button>
          <button onClick={() => setShowPdfPopUp(false)} id='cancel-pdf-view'>Cancel</button>
          <div ref={pdfRef} className="invoice-pdf-copy">
            <div className="toppest-div">
              <img src={visionLogo} alt="" />
              <h2>PROFORMA INVOICE</h2>
              <h2>GSTIN:-06KDBPK9657M1ZQ</h2>
            </div>
            <div className="company-name-header">
              <h1>VISION AUTOMATION & TECHNOLOGIES</h1>
            </div>
            <div className="address-div">
              <p>NEAR VAIDIK SADHAN ASHRAM, KHAJURI ROAD, SHADIPUR , YAMUNA NAGAR <br />
                HARYANA, 135001 <br />
                Ph. No. 8813806331 , 8396805557</p>
            </div>
            <div className="row">
              <div className="column">
                <p>PI NO. :- 33213</p>
                <p>PI DATE :- {currentDate}</p>
                <p>STATE :- HARYANA</p>
                <p>STATE CODE :- 6</p>
                <h3>BILLING TO:</h3>
              </div>
              <div className="column">
                <p>P.O. NO. :- 6575</p>
                <p>P.O. DATE :- {currentDate}</p>
                <p>PR. DATE :- {currentDate}</p>
                <p>.</p>
                <h3>SHIPPING TO:</h3>
              </div>
            </div>
            <div className="row">
              <div className="column">
                <p id='billing-address'><strong>{toPrintCustomer.c_name.toUpperCase()} COMPANY</strong>
                  <br />{toPrintCustomer.street_name.toUpperCase()}, {toPrintCustomer.city.toUpperCase()},<br />
                  {toPrintCustomer.state.toUpperCase()}, {toPrintCustomer.state_code}
                </p>
                <p>STATE:- {toPrintCustomer.state.toUpperCase()}</p>
                <p>GSTIN:- {toPrintCustomer.gstin.toUpperCase()}</p>
                <p>Phone:- {toPrintCustomer.phone}</p>
              </div>
              <div className="column">
                <p id='billing-address'><strong>{toPrintCustomer.c_name.toUpperCase()} COMPANY</strong>
                  <br />{toPrintCustomer.street_name.toUpperCase()}, {toPrintCustomer.city.toUpperCase()},<br />
                  {toPrintCustomer.state.toUpperCase()}, {toPrintCustomer.state_code}
                </p>
                <p>STATE:- {toPrintCustomer.state.toUpperCase()}</p>
                <p>GSTIN:- {toPrintCustomer.gstin.toUpperCase()}</p>
                <p>Phone:- {toPrintCustomer.phone}</p>
              </div>
            </div>
            <table className='product-info-table' cellSpacing={0}>
              <tr>
                <th>SR.NO.</th>
                <th>PRODUCT/SERVICE</th>
                <th>HSN</th>
                <th>QTY</th>
                <th>UNIT</th>
                <th>RATE</th>
                <th>AMOUNT</th>
                <th>GST %</th>
                <th>TOTAL</th>
              </tr>
              {addedProducts.length > 0 && (
                addedProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.product}</td>
                    <td>{product.hsn}</td>
                    <td>{product.quantity}</td>
                    <td>.</td>
                    <td>{product.price}</td>
                    <td>{product.price}</td>
                    <td>.</td>
                    <td>{product.total_price}</td>
                  </tr>
                ))
              )}
              <tr>
                <td></td>
                <td>FRIEGHT CHARGES</td>
                <td></td>
                <td></td>
                <td></td>
                <td>150/-</td>
                <td>150/-</td>
                <td>18%</td>
                <td>177/-</td>
              </tr>
              <tr>
                <td style={{ borderTop: '1px solid black' }} colSpan={5}>.</td>
                <td style={{ borderTop: '1px solid black' }}>.</td>
                <td style={{ borderTop: '1px solid black' }}>.</td>
                <td style={{ borderTop: '1px solid black' }}>.</td>
                <td style={{ borderTop: '1px solid black' }}>.</td>
              </tr>
              <tr >
                <td style={{ borderTop: '1px solid black' }} colSpan={5}>TOTAL</td>
                <td style={{ borderTop: '1px solid black' }} >.</td>
                <td style={{ borderTop: '1px solid black' }} >11,990/-</td>
                <td style={{ borderTop: '1px solid black' }} colSpan={2}>14,042/-</td>
              </tr>
              <tr className='second-header-row'>
                <th style={{ whiteSpace: 'nowrap' }}>TAX TYPE</th>
                <th>TAXABLE AMOUNT</th>
                <th>RATE</th>
                <th colSpan={3}>TAX AMOUNT</th>
                <th colSpan={3}>AMOUNTS</th>
              </tr>
              <tr className='second-header-row-amount-holder' style={{ backgroundColor: 'white', color: 'black' }}>
                <td>IGST</td>
                <td>11990/-</td>
                <td>18%</td>
                <td colSpan={3}>2142/-</td>
                <td>Sub Total :</td>
                <td colSpan={2}>14,042/-</td>
              </tr>
              <tr className='second-header-row-amount-holder' style={{ backgroundColor: 'white', color: 'black' }}>
                <td colSpan={6}>.</td>
                <td>Round off :</td>
                <td colSpan={2}>0/-</td>
              </tr>
              <tr className='second-header-row-amount-holder' style={{ backgroundColor: 'white', color: 'black' }}>
                <td colSpan={6}>.</td>
                <td style={{ borderTop: '1px solid black' }}>Total :</td>
                <td style={{ borderTop: '1px solid black' }} colSpan={2}>14,042/-</td>
              </tr>
              <tr className='second-header-row-amount-holder' style={{ backgroundColor: 'white', color: 'black' }}>
                <td colSpan={4}>Total Tax Amount</td>
                <td colSpan={2}>2142/-</td>
                <td>Recieved :</td>
                <td colSpan={2}>0/-</td>
              </tr>
              <tr className='second-header-row-amount-holder' style={{ backgroundColor: 'white', color: 'black' }}>
                <td colSpan={6}>.</td>
                <td style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }}>Balance :</td>
                <td style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }} colSpan={2}>14,042/-</td>
              </tr>
              <tr className='signature-row'>
                <th style={{ backgroundColor: '#ff0000', color: 'white' }} colSpan={6}>PREFORMA INVOICE AMOUNT IN WORDS</th>
                <th colSpan={3}>For Vision Automation &</th>
              </tr>
              <tr className='signature-row'>
                <th colSpan={6}>FOURTEEN THOUSEND FOURTY TWO ONLY</th>
                <th colSpan={3}>Technologies</th>
              </tr>
              <tr className='signature-row'>
                <th style={{ backgroundColor: '#ff0000', color: 'white', borderBottom: '2px solid black' }} colSpan={4}>TERMS & CONDITIONS</th>
                <th style={{ backgroundColor: '#ff0000', color: 'white', borderLeft: 'none' }} colSpan={2}>BANK DETAILES</th>
                <th colSpan={3} rowSpan={4}><img className='stamp-img' alt="sign" /></th>
              </tr>
              <tr className='terms-condition-row'>
                <td colSpan={4}>1. Goods once sold will not be taken back.</td>
                <td colSpan={2}>HDFC BANK</td>
              </tr>
              <tr className='terms-condition-row'>
                <td colSpan={4}>2. Intrest @15% will be charged after 15 days of bill.</td>
                <td colSpan={2}>Vision Automation &<br></br> Technologies</td>
              </tr>
              <tr className='terms-condition-row'>
                <td colSpan={4}>3. All disputes are subjected to Jagadhri jurisdiction.</td>
                <td colSpan={2}>Acc. No. <b>50200071608050</b></td>
              </tr>
              <tr>
                <td colSpan={4}></td>
                <td colSpan={2}>IFSC: <b>HDFC0004407</b></td>
                <td style={{ textAlign: 'left', borderTop: '1px solid black', borderBottom: '1px solid black' }} colSpan={3} rowSpan={2}>Recieved by:</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', borderTop: '1px solid black' }} colSpan={6}>Note:- For any Quiry Please contact Mr. Nadeem Khan on Mob. No. 8396805557.</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#ff0000', color: 'white', fontSize: '16px', borderTop: '3px solid black' }} colSpan={9}>THANK YOU FOR YOUR BUISNESS</th>
              </tr>
            </table>

          </div>
        </div>)
      }
      <div className="invoice-table-container">
        <table className="invoice-table-container-table" cellSpacing={0}>
          <tr>
            <th>Inovoice Id</th>
            <th>customer Id</th>
            <th>Registered Date</th>
            <th colSpan={3}>Options</th>
          </tr>
          {invoices.length > 0 && (
            invoices.map((invo, index) => (
              <tr key={index}>
                <td>{invo.invoice_id}</td>
                <td>{invo.customer_id}</td>
                <td>{invo.reg_date}</td>
                <td><button id='pdf-view' onClick={() => ValueSetter(invo.invoice_id, invo.customer_id, invo.reg_date)}>View</button></td>
                <td><button id='pdf-edit' onClick={() => editInvoice(invo.invoice_id, invo.customer_id, invo.reg_date)}>Edit</button></td>
                <td><button id='delete_btn' onClick={() => deleteInvoice(invo.invoice_id)}>Delete</button></td>
              </tr>
            ))
          )}
        </table>
      </div>
      {/* <PDFGenerator fileName="invoice.pdf" >
        </PDFGenerator> */}
    </>
  )
}