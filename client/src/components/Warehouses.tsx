import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getProducts, getWarehouses } from "../api/api";
import Warehouse from "./Warehouse";

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
    const navigate = useNavigate();
    const routeChange = () => {
        const path = "/new-warehouse";
        navigate(path);
    };

    const fetchWarehouses = async (): Promise<void> => {
        getWarehouses()
            .then(({ data: { warehouses } }: IWarehouse[] | any) =>
                setWarehouses(warehouses)
            )
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    return (
        <Container>
            <br></br>
            <Row>
                <Col sm={9}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Warehouse ID</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map((warehouse) => {
                                return (
                                    <Warehouse
                                        id={warehouse.id}
                                        name={warehouse.name}
                                        address={warehouse.address}
                                    />
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
                <Col sm={3}>
                    <Button variant="primary" size="lg" onClick={routeChange}>
                        Add warehouse
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default Warehouses;
