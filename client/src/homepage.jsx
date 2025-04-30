import { useEffect, useState } from 'react';
import './homepage.css'
import menubar from './assets/menu.png';
import DashBoard from './dashboard';
import Invoice from './view_invoice';
import AddCustomer from './customer';
import AddProduct from './products';
import ViewProducts from './view_products';
import ViewCustomers from './view_customers';
import CreateInvoice from './createinvoice';
export default function Home(){
    const sidebar_options = [
        "Dashboard", "Create Invoice", "View Invoice", "Add Product",
        "View Products", "Add New Customer", "View Customers"
      ];
      const [showTopBar, setShowTopBar] = useState(false);
      const [activeIndex, setActiveIndex] = useState(() => {
        const index = sessionStorage.getItem("index");
        if(index) return parseInt(index);
        else return 0;
      });
    
      useEffect(() => {
        const savedIndex = sessionStorage.setItem('index', activeIndex);
      }, [activeIndex]);
      useEffect(() => {
        sessionStorage.setItem('index', activeIndex);
        if(showTopBar) setShowTopBar(!showTopBar);
      }, [activeIndex]);
    
      function activeLink(i) {
        setActiveIndex(i);
      }
      return (
        <>
            <div onClick={() => setShowTopBar(!showTopBar)} className="top-bar">
              <h2>AutoNova</h2>
              <img src={menubar} alt="" />
            </div>
          <div className={`mainpage`}>
            <div className="header-container">
              <h2>AutoNova</h2>
            </div>
            <div className={`sideBar ${showTopBar ? 'show' : ''}`}>
              <ul>
                {sidebar_options.map((elem, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      onClick={() => activeLink(index)}
                      className={`sidebar_link ${activeIndex === index ? 'active' : ''}`}
                    >
                      {elem}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
    
            {activeIndex === 0 && <DashBoard />}
            {activeIndex === 1 && <CreateInvoice />}
            {activeIndex === 2 && <Invoice />}
            {activeIndex === 3 && <AddProduct />}
            {activeIndex === 4 && <ViewProducts />}
            {activeIndex === 5 && <AddCustomer />}
            {activeIndex === 6 && <ViewCustomers />}
          </div>
        </>
      );
}