import { useEffect, useState } from 'react';
import './dashboard.css';

export default function DashBoard(){
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [invoice, setInvoice] = useState([]);
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
      function fetchCutomers(){
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
       function fetchInvoices() {
        fetch("https://fullstack-backend-gaay.onrender.com/invoices")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch invoices.");
            }
            return response.json();
          })
          .then((data) => {
            setInvoice(data.invoices);
          })
          .catch((error) => {
            console.log(error.message);
          });
      }

      useEffect(() => {
        fetchProducts();
        fetchCutomers();
        fetchInvoices();
      }, []);
    return(
        <>
         <div className="box-container">
            <div className="box">
                <p>Sales</p>
                <h2>10</h2>
            </div>
            <div className="box">
                <p>Invoices</p>
                <h2>{invoice.length}</h2>
            </div>
            <div className="box">
                <p>Produtcs</p>
                <h2>{products.length}</h2>
            </div>
            <div className="box">
                <p>Customers</p>
                <h2>{customers.length}</h2>
            </div>
            <div className="box">
                <p>Paid Bills</p>
                <h2>10</h2>
            </div>
            <div className="box">
                <p>Pending Bills</p>
                <h2>10</h2>
            </div>
            <div className="box">
                <p>Due Amount</p>
                <h2>10</h2>
            </div>
         </div>
        </>
    )
}