import { useState } from 'react';
import './homepage.css'

import DashBoard from './dashboard';
import Invoice from './view_invoice';
import AddCustomer from './customer';
import AddProduct from './products';
import ViewProducts from './view_products';
import ViewCustomers from './view_customers';
import CreateInvoice from './createinvoice';
export default function Home(){
    const sidebar_options = ["Dashboard", "Create Invoice", "View Invoice", "Add Product", 
        "View Products", "Add New Customer", "View Customers", "Users"
    ];
    const [activeIndex, setActiveIndex] = useState(0);
    function activeLink(i){
        setActiveIndex(prev => {
            const count = i;
            return count;
        });
    }
    return(
        <>
           <div className="mainpage">
           <div className="sideBar">
            <ul>
                {sidebar_options.map((elem, index) => { 
                    return(
                        <li key={index}><a
                         href="#" 
                         onClick={() => activeLink(index)}
                         className={`sidebar_link ${activeIndex === index ? 'active'  : ''}`}
                         >{elem}</a></li>
                    )
                })}
            </ul>
           </div>
           {activeIndex === 0 && (
            <DashBoard />
           )}
           {activeIndex === 1 && (
            <CreateInvoice />
           )}
           {activeIndex === 2 && (
            <Invoice />
           )}
            {activeIndex === 3 && (
                <AddProduct />
            )}
            {activeIndex === 4 && (
                <ViewProducts />
            )}
           {activeIndex === 5 && (
            <AddCustomer />
           )}
           {activeIndex === 6 && (
            <ViewCustomers />
           )}
           </div>
        </>
    )
}