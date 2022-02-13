import { useState } from "react";
import { Button, ButtonGroup, Form, Modal, Row, Table } from "react-bootstrap";
import {
    deleteProduct,
    getProductDetail,
    getWarehouses,
    fulfillFromWarehouse,
    updateProduct,
    orderWarehouse,
} from "../api/api";
type ProductProps = {
    id: string;
    name: string;
    description: string;
};

const Product = ({ id, name, description }: ProductProps) => {
    const [showEdit, setShowEdit] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [productDetails, setProductDetails] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const stockData = {
        warehouse_id: "",
        product_id: id,
        quantity: 0,
    };

    const sellData = {
        warehouse_id: "",
        product_id: id,
        quantity: 0,
    };

    const orderToWarehouse = async () => {
        await orderWarehouse(
            stockData.quantity,
            stockData.product_id,
            stockData.warehouse_id
        );
        setShowDetail(false);
    };

    const sellFromWarehouse = async () => {
        await fulfillFromWarehouse(
            sellData.quantity,
            sellData.product_id,
            sellData.warehouse_id
        );
        setShowDetail(false);
    };

    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);
    const handleCloseDetail = () => setShowDetail(false);
    const handleShowDetail = (id: string) => async () => {
        await getProductDetails(id);
        await fetchWarehouses();
        setShowDetail(true);
    };
    const fetchWarehouses = async () => {
        getWarehouses()
            .then(({ data: { warehouses } }: IWarehouse[] | any) =>
                setWarehouses(warehouses)
            )
            .catch((error) => {
                console.log(error);
            });
    };

    const getProductDetails = async (id: string) => {
        getProductDetail(id)
            .then(({ data: { productDetail } }: IProductDetail[] | any) => {
                console.log("cunt");
                console.log(productDetail);
                setProductDetails(productDetail);
            })
            .catch((error) => console.log(error));
    };

    const putProduct = async () => {
        updateProduct(product).then(() => window.location.reload());
    };

    const removeProduct = async () => {
        deleteProduct(id).then(() => window.location.reload());
    };

    const product: IProduct = {
        id: id,
        name: name,
        description: description,
    };

    return (
        <>
            <tr>
                <td>{id}</td>
                <td>{name}</td>
                <td>{description}</td>
                <td>
                    <ButtonGroup aria-label="Basic example">
                        <Button
                            variant="success"
                            onClick={handleShowDetail(id)}
                        >
                            View Detail
                        </Button>
                        <Button variant="primary" onClick={handleShowEdit}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={removeProduct}>
                            Delete
                        </Button>
                    </ButtonGroup>
                </td>
            </tr>

            <Modal
                show={showEdit}
                onHide={handleCloseEdit}
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
                                    product.name = event.target.value;
                                }}
                            />
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId={`description_${description}`}
                        >
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={description}
                                onChange={(event) => {
                                    product.description = event.target.value;
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={putProduct}>
                        Update
                    </Button>
                    <Button variant="secondary" onClick={handleCloseEdit}>
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
                    <Modal.Title>Product Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <thead>
                            <th>Warehouse Name</th>
                            <th>Address</th>
                            <th>Back Order Quantity</th>
                            <th>In Stock Quantity</th>
                        </thead>
                        <tbody>
                            {productDetails.map(
                                (productDetail: IProductDetail) => {
                                    return (
                                        <tr>
                                            <td>
                                                {productDetail.warehouse.name}
                                            </td>
                                            <td>
                                                {
                                                    productDetail.warehouse
                                                        .address
                                                }
                                            </td>
                                            <td>
                                                {
                                                    productDetail.backOrderQuantity
                                                }
                                            </td>
                                            <td>
                                                {productDetail.inStockQuantity}
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </Table>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Order to Warehouse</Form.Label>
                            <Form.Control
                                as="select"
                                // value={stockData.warehouse_id}
                                onChange={(event) => {
                                    stockData.warehouse_id = event.target.value;
                                }}
                            >
                                {warehouses.map((warehouse: IWarehouse) => {
                                    return (
                                        <option value={warehouse.id}>
                                            {warehouse.name}
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
                                <Button onClick={orderToWarehouse}>
                                    Submit
                                </Button>
                            </ButtonGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sell from Warehouse</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={(event) => {
                                    sellData.warehouse_id = event.target.value;
                                }}
                            >
                                {warehouses.map((warehouse: IWarehouse) => {
                                    return (
                                        <option value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            <Form.Control
                                required
                                type="number"
                                onChange={(event) => {
                                    sellData.quantity = Number(
                                        event.target.value
                                    );
                                }}
                            ></Form.Control>
                            <ButtonGroup>
                                <Button onClick={sellFromWarehouse}>
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

export default Product;
