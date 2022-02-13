import React from "react";
import ReactDOM from "react-dom";
import Home from "./components/Home";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomNav from "./components/CustomNav";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AddProduct from "./components/AddProduct";
import Warehouses from "./components/Warehouses";
import AddWarehouse from "./components/AddWarehouse";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <CustomNav />
            <Container>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/new-item" element={<AddProduct />} />
                    <Route path="/new-warehouse" element={<AddWarehouse />} />
                    <Route path="/warehouse" element={<Warehouses />} />
                </Routes>
            </Container>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
