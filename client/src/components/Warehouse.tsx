import { useState } from "react";
import { Button, ButtonGroup, Form, Modal, Table } from "react-bootstrap";
import {
    deleteProduct,
    getProducts,
    getWarehouseDetail,
    stockWarehouse,
    updateWarehouse,
} from "../api/api";
type WarehouseProps = {
    id: string;
    name: string;
    address: string;
};

const Warehouse = ({ id, name, address }: WarehouseProps) => {
    const stockData = {
        warehouse_id: id,
        product_id: "",
        quantity: 0,
    };
    const [show, setShow] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [warehouseDetails, setWarehouseDetails] = useState([]);
    const [products, setProducts] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleShowDetail = (id: string) => async () => {
        await getWarehouseDetails(id);
        await fetchProducts();
        setShowDetail(true);
    };
    const handleCloseDetail = () => setShowDetail(false);

    const stockToWarehouse = async () => {
        await stockWarehouse(
            stockData.quantity,
            stockData.product_id,
            stockData.warehouse_id
        );
        setShowDetail(false);
    };

    const fetchProducts = async () => {
        getProducts()
            .then(({ data: { products } }: IProduct[] | any) => {
                setProducts(products);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getWarehouseDetails = async (id: string) => {
        getWarehouseDetail(id)
            .then(({ data: { products } }: IWarehouseDetail[] | any) => {
                setWarehouseDetails(products);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const putProduct = async () => {
        updateWarehouse(warehouse).then(() => window.location.reload());
    };

    const removeProduct = async () => {
        deleteProduct(id).then(() => window.location.reload());
    };

    const warehouse: IWarehouse = {
        id: id,
        name: name,
        address: address,
    };

    return (
        <>
            <tr>
                <td>{id}</td>
                <td>{name}</td>
                <td>{address}</td>
                <td>
                    <ButtonGroup aria-label="Basic example">
                        <Button
                            variant="success"
                            onClick={handleShowDetail(id)}
                        >
                            View Detail
                        </Button>
                        <Button variant="primary" onClick={handleShow}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={removeProduct}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </td>
            </tr>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId={`name_${id}`}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={name}
                                onChange={(event) => {
                                    warehouse.name = event.target.value;
                                }}
                            />
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId={`address_${address}`}
                        >
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={address}
                                onChange={(event) => {
                                    warehouse.address = event.target.value;
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={putProduct}>
                        Update
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showDetail}
                onHide={handleCloseDetail}
                backdrop="static"
                keyboard={false}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Warehouse Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <thead>
                            <th>Product name</th>
                            <th>Description</th>
                            <th>Back Order Quantity</th>
                            <th>In Stock Quantity</th>
                        </thead>
                        <tbody>
                            {warehouseDetails.map(
                                (warehouseDetail: IWarehouseDetail) => {
                                    return (
                                        <tr>
                                            <td>
                                                {warehouseDetail.product.name}
                                            </td>
                                            <td>
                                                {
                                                    warehouseDetail.product
                                                        .description
                                                }
                                            </td>
                                            <td>
                                                {
                                                    warehouseDetail.backOrderQuantity
                                                }
                                            </td>
                                            <td>
                                                {
                                                    warehouseDetail.inStockQuantity
                                                }
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </Table>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Stock to Warehouse</Form.Label>
                            <Form.Control
                                as="select"
                                // value={stockData.warehouse_id}
                                onChange={(event) => {
                                    stockData.product_id = event.target.value;
                                    console.log(stockData);
                                }}
                            >
                                {products.map((product: IProduct) => {
                                    return (
                                        <option value={product.id}>
                                            {product.name}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            <Form.Control
                                required
                                type="number"
                                onChange={(event) => {
                                    stockData.quantity = Number(
                                        event.target.value
                                    );
                                }}
                            ></Form.Control>
                            <ButtonGroup>
                                <Button onClick={stockToWarehouse}>
                                    Submit
                                </Button>
                            </ButtonGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetail}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Warehouse;
