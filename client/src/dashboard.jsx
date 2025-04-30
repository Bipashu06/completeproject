import { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
const apiurl = "https://billingapi-f2vf.onrender.com"

export default function DashBoard(){
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [invoice, setInvoice] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    async function fetchTotalAmount() {
      try{
        const response = await axios.get(`${apiurl}/orders/total-amount`);
        setTotalAmount(response.data.total_price);
      }catch(e){
        console.error(e.message)
      }
    }
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
            console.log(error.message);
          });
      }
      function fetchCutomers(){
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
          console.log(error.message);
        });
       };
       function fetchInvoices() {
        fetch(`${apiurl}/invoices`)
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
        fetchTotalAmount();
      }, []);
    return(
        <>
         <div className="box-container">
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
                <p>Total Amount</p>
                <h2>{totalAmount ? totalAmount : 0}</h2>
            </div>
         </div>
        </>
    )
}