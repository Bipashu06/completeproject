import { useEffect, useState, useRef } from 'react';
import axios from "axios";
import './createinvoice.css';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import visionLogo from './assets/logo.png';
// import stamp from './assets/stamp.jpg';
export default function CreateInvoice() {
    var today = new Date().toISOString().split('T')[0];
    today = today.replace(/-/g, '/');
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [currentDate, setCurrentDate] = useState(today);
    const [addedProducts, setAddedProducts] = useState([]);
    const [showError, setShowError] = useState(false);

    const [showExistingUser, setShowExistingUser] = useState(false);
    const [showExistingProducts, setShowExistingProducts] = useState(false);

    const [customerId, setCustomerId] = useState(null);
    const [cName, setCName] = useState(null);
    const [street, setStreet] = useState(null);
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [stateCode, setStateCode] = useState(null);
    const [pin, setPin] = useState(null);
    const [gstin, setGstin] = useState(null);
    const [phone, setPhone] = useState(null);

    const [productName, setProductName] = useState("");
    const [hsn, setHsn] = useState("");
    const [price, setPrice] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const pdfRef = useRef();
    const generatePDF = () => {
        const input = pdfRef.current;
        html2canvas(input, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save("example.pdf");
            })
            .catch((error) => console.error("Error generating PDF:", error));
            setDownloadInvoice(false);
            setCName("");
            setStreet("");
            setCity("");
            setState("");
            setStateCode("");
            setPin("");
            setGstin("");
            setPhone("");
            setProductName("");
            setHsn("");
            setPrice("");
            setAddedProducts([]);
    };
    async function SavePdf(){
        await fetchOrder(currentSavedInvoice);
    }
    async function fetchCustomers(){
        try {
            const response = await fetch("http://localhost:3001/customers");
            if (!response.ok) {
                throw new Error("Failed to fetch customers.");
            }
            const data = await response.json();
            setCustomers(data.customers); // Assuming setCustomers is a state updater function
            return data;
        } catch (error) {
            console.error("Error fetching customers:", error.message);
        }
    }
    async function fetchProducts() {
        try {
            const response = await fetch("http://localhost:3001/products");
            if (!response.ok) {
                throw new Error("Failed to fetch products.");
            }
            const data = await response.json();
            setProducts(data.products); // Assuming setProducts is a state updater function
        } catch (error) {
            console.error("Error fetching products:", error.message);
            setError(error.message); // Assuming setError is a state updater for error messages
        }
    }
    function fillInfo(index){
        setCustomerId(customers[index].id);
        setCName(customers[index].c_name.toUpperCase());
        setStreet(customers[index].street_name.toUpperCase());
        setCity(customers[index].city.toUpperCase());
        setState(customers[index].state.toUpperCase());
        setStateCode(customers[index].state_code);
        setPin(customers[index].pin);
        setGstin(customers[index].gstin.toUpperCase());
        setPhone(customers[index].phone);
        setShowExistingUser(false);
    }
    function fillInfoProduct(index){
        setProductName(products[index].product_name);
        setHsn(products[index].HSN);
        setPrice(products[index].price);
        setQuantity(0);
        setShowExistingProducts(false);
    }
    const [downloadInvoice, setDownloadInvoice] = useState(false);
    const [toPrintCustomer, setToPrintCustomer] = useState({});
    const [toPrintProducts, setToPrintProducts] = useState([]);
    const [currentSavedInvoice, setCurrentSavedInvoice] = useState({});
    async function fetchOrder(invoiceObj){
        fetch("http://localhost:3001/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({customer_id: invoiceObj.customer_id, 
                invoice_id: invoiceObj.invoice_id
            }), 
        })
        .then((response) => {
            if (!response.ok){
                throw new Error(`Failed to fetch invoice. Status: ${response.status}`);
            }
            return response.json(); 
        })
        .then((data) => {
            console.log("Fetched Invoice Data:", data);
            const tempfetchedCustomer = data.customerDetails;
            const tempfetchedProducts = data.orderedProducts;
            //console.log(tempfetchedCustomer, tempfetchedProducts);
            setToPrintCustomer(tempfetchedCustomer);
            setToPrintProducts(tempfetchedProducts);
        })
        .catch((error) => {
            console.error("Error fetching invoice:", error.message); 
        });
    }
    useEffect(() => {
        if(toPrintProducts.length > 0){
            generatePDF();
            setToPrintCustomer({});
            setToPrintProducts([]);
        }
    }, [toPrintProducts, toPrintCustomer]);
    function SubmitOrder(Invoiceid){
        const Order = [];
        for(var i = 0; i < addedProducts.length; i++){
             Order.push({invoice_id: Invoiceid, 
                        product: addedProducts[i].name.toLowerCase(),
                        quantity: Number(addedProducts[i].quantity), 
                        total_price: Number(addedProducts[i].quantity) * addedProducts[i].price
                        });
        }
        axios.post("http://localhost:3001/orders", Order)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
          console.error("There was an error adding the Invoices!", error);
        });
    }
    async function submitInvoice(arr){
        let invoice = {};

        if (Array.isArray(arr) && arr.length > 0) {
            console.log("New customer added");
            invoice = { customerId: arr[arr.length - 1].id }; // Use the last added customer's ID
        } else {
            console.log("Existing customer");
            invoice = { customerId: customerId }; // Use existing customer ID
        }
        axios.post("http://localhost:3001/invoices", invoice)
          .then((response) =>{
              console.log(response.data.message);
              console.log(response.data.invoice);
              SubmitOrder(response.data.invoice.invoice_id);
              setCurrentSavedInvoice(response.data.invoice);
              setDownloadInvoice(true);
          })
          .catch((error) => {
            console.error("There was an error adding the Invoices!", error);
          });
    }
    async function AddManualProduct() {
        const productPromises = addedProducts.map(async (addedProduct) => {
            const isProductExists = products.some(
                (item) => item.HSN?.toLowerCase() === addedProduct.hsn?.toLowerCase()
            );
    
            if (!isProductExists) {
                console.log("product didn't exist");
                const product = {
                    productName: addedProduct.name.toLowerCase(),
                    hsn: addedProduct.hsn.toLowerCase(),
                    price: addedProduct.price,
                };
                try {
                    const response = await axios.post("http://localhost:3001/products", product);
                    console.log(response.data.message);
                    return fetchProducts(); // Return fetchProducts() for parallel execution.
                } catch (error) {
                    console.error("There was an error adding the product!", error);
                    throw error; // Let Promise.all handle the error.
                }
            }
        });
    
        // Wait for all product operations to complete.
        try {
            await Promise.all(productPromises);
        } catch (error) {
            console.error("An error occurred during the product addition process:", error);
        }
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        const isCustomerExists = customers.some(
            (item) => 
                item.c_name === cName.toLowerCase() || 
                item.gstin === gstin.toLowerCase() || 
                item.phone === phone
        );
        
        if (!isCustomerExists) {
            const customer = { 
                companyName: cName.toLowerCase(),
                street: street.toLowerCase(), 
                city: city.toLowerCase(),
                state: state.toLowerCase(),
                pin: pin, 
                phone: phone, 
                stateCode: stateCode, 
                gstin: gstin.toLowerCase()

            }
            try {
                const response = await axios.post("http://localhost:3001/customers", customer);
                console.log(response.data.message);
                const custom = await fetchCustomers(); 
                await AddManualProduct();
                setCustomers(custom);
                await submitInvoice(custom);
                
            } catch (error){
                console.error("There was an error adding the user!", error);
            }
        } else {
            await AddManualProduct();
            submitInvoice();
        }

    }
    
    function handleAddProduct() {
        if (productName && hsn && price && quantity) {
            setAddedProducts((prevProducts) => [
                ...prevProducts,
                {
                    name: productName,
                    hsn: hsn,
                    price: price,
                    quantity: quantity,
                },
            ]);
            setProductName("");
            setHsn("");
            setPrice(0);
            setQuantity(0);
        }
        else {
            setShowError(true);
        }
    }
    function RemoveAddedProduct(i){
        setAddedProducts(addedProducts.filter((_, index) => index !== i));
    }
    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    

    return (
        <>
            {downloadInvoice && (
                <div className="download-popup-container">
                    <div className="download-popup">
                        <h2>Invoice saved</h2>
                        <img onClick={(e) => {
                             setDownloadInvoice(false);
                             setCName("");
                             setStreet("");
                             setCity("");
                             setState("");
                             setStateCode("");
                             setPin("");
                             setGstin("");
                             setPhone("");
                             setProductName("");
                             setHsn("");
                             setPrice("");
                             setAddedProducts([]);
                             console.log(customers);
                             console.log(products);
                        }} width="30" height="30" src="https://img.icons8.com/ios-glyphs/60/multiply.png" alt="multiply" />
                        <button onClick={SavePdf} id='savepdf-btn'>Save as Pdf</button>
                    </div>
                </div>
            )}
            <form action="" className='create_invoice_form'>
                <input type="date" onChange={(e) => setCurrentDate(e.target.value)} value={currentDate} />
                <h3>Customer Details</h3>
                <button onClick={(e) =>{ e.preventDefault(); setShowExistingUser(true)}} id='selectuser_btn'>Select From Database</button>
                <br />
                <input type="text" value={cName} onChange={(e) => setCName(e.target.value.toUpperCase())} placeholder='company name' />  <br />
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value.toUpperCase())} placeholder='street' />  <br />
                <input type="text" value={city} onChange={(e) => setCity(e.target.value.toUpperCase())} placeholder='city' />  <br />
                <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder='state' />  <br />
                <input type="number" min={0} value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder='state code' />  <br />
                <input type="number" min={0} value={pin} onChange={(e) => setPin(e.target.value)} placeholder='pin' />  <br />
                <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder='GSTIN' />  <br />
                <input type="number" min={0} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='Phone' />  <br />
                <br />
                <h3>Products</h3>
                <button onClick={(e) => { e.preventDefault(); setShowExistingProducts(true)}} id='selectuser_btn'>Select From Database</button><br />
                <div className="products-conatainer">
                    {addedProducts.length > 0 && (addedProducts.map((product, index) => (
                        <div className="product" key={index}>
                            <p>{product.name}</p>
                            <p>{product.hsn}</p>
                            <p>{product.price}₹</p>
                            <p>{product.quantity}</p>
                            <button id='added-product-remove-btn' onClick={() => RemoveAddedProduct(index)}>Remove</button>
                        </div>
                    )))}
                </div>
                <form action="">
                    <input type="text" value={productName} onChange={(e) => { setProductName(e.target.value); setShowError(false); }} placeholder='Product Name' />
                    <input type="text" value={hsn} onChange={(e) => { setHsn(e.target.value); setShowError(false); }} placeholder='hsn' />
                    <input type="number" min={1} value={price} onChange={(e) => { setPrice(e.target.value); setShowError(false); }} placeholder='Price' />
                    <input type="number" min={1} value={quantity} onChange={(e) => { setQuantity(e.target.value); setShowError(false); }} placeholder='Qantity' /><br />
                    <button onClick={handleAddProduct}>Add Product</button><br />
                </form>
                <input type="submit" value={"Create"} onClick={handleSubmit} id='selectuser_btn' />
            </form>
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
                                        <tr key={index} onClick={() => { fillInfoProduct(index) }}>
                                            <td><strong>{product.product_name}</strong></td>
                                            <td>{product.HSN}</td>
                                            <td>{product.price}</td>
                                            <td><button id='selectuser_btn' onClick={() => { fillInfoProduct(index) }}>Select</button></td>
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
            {showExistingUser && (
                <div className="existinguser_table_popup">
                    <div className="existing_user_table_container">
                        <img onClick={(e) => setShowExistingUser(false)} width="30" height="30" src="https://img.icons8.com/ios-glyphs/60/multiply.png" alt="multiply" />
                        {customers.length > 0 ? (
                            <table className='existing_user_table' cellSpacing={0}>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, index) => (
                                        <tr onClick = {() => fillInfo(index)} key={index}>
                                            <td>{customer.id}</td>
                                            <td><strong>{customer.c_name}</strong></td>
                                            <td>{customer.street_name}</td>
                                            <td>{customer.city}</td>
                                            <td> <strong>{customer.state}</strong></td>
                                            <td>{customer.pin} </td>
                                            <td>{customer.phone}</td>
                                            <td> <strong>{customer.reg_date}</strong></td>
                                            <td>{customer.state_code} </td>
                                            <td>{customer.gstin} </td>
                                            <td><button id='selectuser_btn' onClick={() => { fillInfo(index) }}>Select</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No customers found.</p>
                        )}
                    </div>
                </div>
            )}
            {showError && (
                <div>
                    <h3>Please Fill Out All!!</h3>
                </div>
            )}

            <div ref={pdfRef} className="invoice-pdf">
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
                        <p id='billing-address'><strong>{toPrintCustomer.c_name} COMPANY</strong>
                        <br/>{toPrintCustomer.street_name}, {toPrintCustomer.city},<br/>
                           {toPrintCustomer.state}, {toPrintCustomer.state_code}
                        </p>
                        <p>STATE:- {toPrintCustomer.state}</p>
                        <p>GSTIN:- {toPrintCustomer.gstin}</p>
                        <p>Phone:- {toPrintCustomer.phone}</p>
                    </div>
                    <div className="column">
                    <p id='billing-address'><strong>{toPrintCustomer.c_name} COMPANY</strong>
                        <br/>{toPrintCustomer.street_name}, {toPrintCustomer.city},<br/>
                           {toPrintCustomer.state}, {toPrintCustomer.state_code}
                        </p>
                        <p>STATE:- {toPrintCustomer.state}</p>
                        <p>GSTIN:- {toPrintCustomer.gstin}</p>
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
                                <td>{index+1}</td>
                                <td>{product.name}</td>
                                <td>{product.hsn}</td>
                                <td>{product.quantity}</td>
                                <td>.</td>
                                <td>{product.price}</td>
                                <td>{product.price}</td>
                                <td>.</td>
                                <td>{product.quantity * product.price}</td>
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
                        <td  style={{borderTop: '1px solid black'}} colSpan={5}>.</td>
                        <td style={{borderTop: '1px solid black'}}>.</td>
                        <td style={{borderTop: '1px solid black'}}>.</td>
                        <td style={{borderTop: '1px solid black'}}>.</td>
                        <td style={{borderTop: '1px solid black'}}>.</td>
                    </tr>
                    <tr >
                        <td style={{borderTop: '1px solid black'}} colSpan={5}>TOTAL</td>
                        <td style={{borderTop: '1px solid black'}} >.</td>
                        <td style={{borderTop: '1px solid black'}} >11,990/-</td>
                        <td style={{borderTop: '1px solid black'}}  colSpan={2}>14,042/-</td>
                    </tr>
                    <tr className='second-header-row'>
                        <th style={{whiteSpace: 'nowrap'}}>TAX TYPE</th>
                        <th>TAXABLE AMOUNT</th>
                        <th>RATE</th>
                        <th colSpan={3}>TAX AMOUNT</th>
                        <th colSpan={3}>AMOUNTS</th>
                    </tr>
                    <tr className='second-header-row-amount-holder' style={{backgroundColor: 'white', color:'black'}}>
                        <td>IGST</td>
                        <td>11990/-</td>
                        <td>18%</td>
                        <td colSpan={3}>2142/-</td>
                        <td>Sub Total :</td>
                        <td colSpan={2}>14,042/-</td>
                    </tr>
                    <tr className='second-header-row-amount-holder' style={{backgroundColor: 'white', color:'black'}}>
                        <td colSpan={6}>.</td>
                        <td>Round off :</td>
                        <td colSpan={2}>0/-</td>
                    </tr>
                    <tr className='second-header-row-amount-holder' style={{backgroundColor: 'white', color:'black'}}>
                        <td colSpan={6}>.</td>
                        <td style={{borderTop: '1px solid black'}}>Total :</td>
                        <td style={{borderTop: '1px solid black'}} colSpan={2}>14,042/-</td>
                    </tr>
                    <tr className='second-header-row-amount-holder' style={{backgroundColor: 'white', color:'black'}}>
                        <td colSpan={4}>Total Tax Amount</td>
                        <td colSpan={2}>2142/-</td>
                        <td>Recieved :</td>
                        <td colSpan={2}>0/-</td>
                    </tr>
                    <tr className='second-header-row-amount-holder' style={{backgroundColor: 'white', color:'black'}}>
                        <td colSpan={6}>.</td>
                        <td style={{borderTop: '1px solid black', borderBottom: '1px solid black'}}>Balance :</td>
                        <td style={{borderTop: '1px solid black', borderBottom: '1px solid black'}} colSpan={2}>14,042/-</td>
                    </tr>
                    <tr className='signature-row'>
                        <th style={{backgroundColor: '#ff0000', color: 'white'}} colSpan={6}>PREFORMA INVOICE AMOUNT IN WORDS</th>
                        <th colSpan={3}>For Vision Automation &</th>
                    </tr>
                    <tr className='signature-row'>
                        <th colSpan={6}>FOURTEEN THOUSEND FOURTY TWO ONLY</th>
                        <th colSpan={3}>Technologies</th>
                    </tr>
                    <tr className='signature-row'>
                        <th style={{backgroundColor: '#ff0000', color: 'white', borderBottom: '2px solid black'}} colSpan={4}>TERMS & CONDITIONS</th>
                        <th style={{backgroundColor: '#ff0000', color: 'white', borderLeft: 'none'}} colSpan={2}>BANK DETAILES</th>
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
                        <td style={{textAlign: 'left', borderTop: '1px solid black', borderBottom: '1px solid black'}} colSpan={3} rowSpan={2}>Recieved by:</td>
                    </tr>
                    <tr>
                        <td style={{textAlign: 'left', borderTop: '1px solid black'}} colSpan={6}>Note:- For any Quiry Please contact Mr. Nadeem Khan on Mob. No. 8396805557.</td>
                    </tr>
                   <tr>
                        <th style={{backgroundColor: '#ff0000', color: 'white', fontSize: '16px', borderTop: '3px solid black'}} colSpan={9}>THANK YOU FOR YOUR BUISNESS</th>
                   </tr>
                </table>

            </div>
        </>
    )
}
