import { Button, Form } from "react-bootstrap";
import { addProduct } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();

    const item: IProduct = {
        id: "",
        name: "",
        description: "",
    };

    const submitProduct = async () => {
        addProduct(item).then(() => navigate("/"));
    };

    return (
        <>
            <br></br>
            <Form>
                <Form.Group className="mb-3" controlId="new_name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        defaultValue={item.name}
                        onChange={(event) => {
                            item.name = event.target.value;
                        }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="new_description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        defaultValue={item.description}
                        onChange={(event) => {
                            item.description = event.target.value;
                        }}
                    />
                </Form.Group>
                {/* <Form.Group className="mb-3" controlId="new_count">
                    <Form.Label>Inventory Quantity</Form.Label>
                    <Form.Control
                        type="number"
                        defaultValue={item.count}
                        onChange={(event) => {
                            item.count = parseInt(event.target.value);
                        }}
                    />
                </Form.Group> */}
            </Form>
            <Button variant="primary" onClick={submitProduct}>
                Add Product
            </Button>
        </>
    );
};

export default AddProduct;
