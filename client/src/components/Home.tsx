import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/api";
import Product from "./Product";

const Home = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const navigate = useNavigate();
    const routeChange = () => {
        const path = "/new-item";
        navigate(path);
    };
    const fetchProducts = async (): Promise<void> => {
        getProducts()
            .then(({ data: { products } }: IProduct[] | any) =>
                setProducts(products)
            )
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <Container>
            <br></br>
            <Row>
                <Col sm={9}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => {
                                return (
                                    <Product
                                        id={product.id}
                                        name={product.name}
                                        description={product.description}
                                    />
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
                <Col sm={3}>
                    <Row>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={routeChange}
                        >
                            Add Product
                        </Button>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
