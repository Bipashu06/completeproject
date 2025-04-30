import { useEffect, useState, useRef } from 'react';
const apiurl = "https://billingapi-f2vf.onrender.com"

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

    const [downloadInvoice, setDownloadInvoice] = useState(false);
    const [toPrintCustomer, setToPrintCustomer] = useState({});
    const [toPrintProducts, setToPrintProducts] = useState([]);
    const [currentSavedInvoice, setCurrentSavedInvoice] = useState({});
    const pdfRef = useRef();
    const generatePDF = () => {
        if (Object.keys(toPrintCustomer).length === 0 || toPrintProducts.length === 0) {
            alert("somthing went wrong goto invoives to download pdf")
            return null;
        }
        const input = pdfRef.current;
        input.style.width='862px';
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
    async function SavePdf() {
        await fetchOrder(currentSavedInvoice);
    }
    async function fetchCustomers() {
        try {
            const response = await fetch(`${apiurl}/customers`);
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
            const response = await fetch(`${apiurl}/products`);
            if (!response.ok) {
                throw new Error("Failed to fetch products.");
            }
            const data = await response.json();
            setProducts(data.products); // Assuming setProducts is a state updater function
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    }
    function fillInfo(index) {
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
    function fillInfoProduct(index) {
        setProductName(products[index].product_name);
        setHsn(products[index].HSN);
        setPrice(products[index].price);
        setQuantity(0);
        setShowExistingProducts(false);
    }

    async function fetchOrder(invoiceObj) {
        fetch(`${apiurl}/invoices/fullorder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customerId: invoiceObj.customer_id,
                invoiceId: invoiceObj.invoice_id
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch invoice. Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const tempfetchedCustomer = data.customerDetails;
                const tempfetchedProducts = data.orderedProducts;
                setToPrintCustomer(tempfetchedCustomer);
                setToPrintProducts(tempfetchedProducts);
            })
            .catch((error) => {
                console.error("Error fetching invoice:", error.message);
            });
    }
    useEffect(() => {
        if (toPrintProducts.length > 0 && Object.keys(toPrintCustomer).length > 0) {
            generatePDF();
            setToPrintCustomer({});
            setToPrintProducts([]);
        }
    }, [toPrintProducts, toPrintCustomer]);
    function SubmitOrder(Invoiceid) {
        const Order = [];
        for (var i = 0; i < addedProducts.length; i++) {
            Order.push({
                invoice_id: Invoiceid,
                product: addedProducts[i].name.toLowerCase(),
                quantity: Number(addedProducts[i].quantity),
                total_price: Number(addedProducts[i].quantity) * addedProducts[i].price
            });
        }
        axios.post(`${apiurl}/orders`, Order)
            .catch((error) => {
                console.error("There was an error adding the Invoices!", error);
            });
    }
    async function submitInvoice(arr) {
        let invoice = {};

        if (Array.isArray(arr) && arr.length > 0) {
            invoice = { customerId: arr[arr.length - 1].id }; // Use the last added customer's ID
        } else {
            
            invoice = { customerId: customerId }; // Use existing customer ID
        }
        axios.post(`${apiurl}/invoices`, invoice)
            .then((response) => {
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
                    const response = await axios.post(`${apiurl}/products`, product);
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
       
        if(!cName || !street || !city || !state || !stateCode || !pin || !gstin || !phone){
            alert('Fill out all Information');
            return null;
        }
        if (addedProducts.length === 0) {
            alert("products cant be empty")
            return null;
        }
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
            setShowLoader(true);
            try {
                const response = await axios.post(`${apiurl}/customers`, customer);
                if(response.data.error){
                    alert(response.data.error);
                    return null;
                }
                const custom = await fetchCustomers();
                await AddManualProduct();
                setCustomers(custom);
                await submitInvoice(custom);

            } catch (error) {
                console.error("There was an error adding the user!", error);
            }finally {
                setShowLoader(false);
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
    function RemoveAddedProduct(i) {
        setAddedProducts(addedProducts.filter((_, index) => index !== i));
    }
    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);
    const [showLoader, setShowLoader] = useState(false);


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
                        }} width="30" height="30" src="https://img.icons8.com/ios-glyphs/60/multiply.png" alt="multiply" />
                        <button onClick={SavePdf} id='savepdf-btn'>Save as Pdf</button>
                    </div>
                </div>
            )}
            <form id='create-invoice-form' className='create_invoice_form'>
            {showLoader && (
                <div className="loader-container">
                    <span class="loader"></span>
                </div>
            )}
                <h2 style={{ padding: '8px' }}>Customer Details</h2>
                <button onClick={(e) => { e.preventDefault(); setShowExistingUser(true) }} id='selectuser_btn'>Select From Database</button>
                <br />
                <div className="">
                    <input type="text" value={cName} onChange={(e) => setCName(e.target.value.toUpperCase())} placeholder='company name' />
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value.toUpperCase())} placeholder='street' />
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value.toUpperCase())} placeholder='city' />
                </div>
                <div className="">
                    <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder='state' />
                    <input type="number" 
                      onWheel={(e) => e.target.blur()}
                      min={1}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }} 
                    value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder='state code' />
                    <input type="number" 
                      onWheel={(e) => e.target.blur()}
                      min={1}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }} 
                    value={pin} onChange={(e) => setPin(e.target.value)} placeholder='pin' />
                </div>
                <div className="">
                    <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder='GSTIN' />  <br />
                    <input type="number" value={phone} onChange={(e) => {
                        setPhone(e.target.value)
                    }} placeholder='Phone'
                    onWheel={(e) => e.target.blur()}
                    min={1}
                    onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    /><br />
                </div>
                <br />
                <h2 style={{ padding: '8px' }}>Products</h2>
                <button onClick={(e) => { e.preventDefault(); setShowExistingProducts(true) }} id='selectuser_btn'>Select From Database</button><br />
                <div className="products-conatainer">
                    {addedProducts.length > 0 && (
                        <div className="product">
                            <p><strong>Product</strong></p>
                            <p><strong>Product Id</strong></p>
                            <p><strong>Price</strong></p>
                            <p><strong>Quantity</strong></p>
                        </div>
                    )}
                    {addedProducts.length > 0 && (
                        addedProducts.map((product, index) => (
                            <div className="product" key={index}>
                                <p>{product.name}</p>
                                <p>{product.hsn}</p>
                                <p>{product.price}₹</p>
                                <p>{product.quantity}</p>
                                <button id='added-product-remove-btn' onClick={() => RemoveAddedProduct(index)}>Remove</button>
                            </div>)
                        )
                    )}
                </div>
                <form action="">
                    <input type="text" value={productName} onChange={(e) => { setProductName(e.target.value); setShowError(false); }} placeholder='Product Name' />
                    <input type="text" value={hsn} onChange={(e) => { setHsn(e.target.value); setShowError(false); }} placeholder='hsn' />
                    <input type="number"
                      onWheel={(e) => e.target.blur()}
                      min={1}
                      onKeyDown={(e) => {
                          const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                          if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    value={price} onChange={(e) => { setPrice(e.target.value); setShowError(false); }} placeholder='Price' />
                    <input type="number" 
                      onWheel={(e) => e.target.blur()}
                      min={1}
                      onKeyDown={(e) => {
                          const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                          if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                    value={quantity} onChange={(e) => { setQuantity(e.target.value); setShowError(false); }} placeholder='Qantity' /><br />
                    <button style={{
                        border: 'none', backgroundColor: '#469dc0',
                        padding: '4px 4px', borderRadius: '4px', margin: '6px',
                        fontSize: '15px', color: 'white', cursor: 'pointer'
                    }} onClick={handleAddProduct}>Add Product</button><br />
                </form>
                <input type="submit" value={"Create"} onClick={handleSubmit} id='create_invoice_btn' />
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
                                        <tr onClick={() => fillInfo(index)} key={index}>
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

            <div ref={pdfRef} className="invoice" id='created-invoice'>
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
                        <p><strong>Invoice No:</strong> INV-{673}</p>
                    </div>
                </div>

                <div className="client-info">
                    <h3>Bill To:</h3>
                    <p>
                        {toPrintCustomer.c_name} Company,<br />
                        {toPrintCustomer.street_name},<br />
                        {toPrintCustomer.city},<br />
                        {toPrintCustomer.state}, {toPrintCustomer.state_code},<br />
                        PIN: {toPrintCustomer.pin}<br />
                        GSTIN: {toPrintCustomer.gstin}<br />
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
        </>
    )
}
