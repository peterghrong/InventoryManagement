import { Button, Form } from "react-bootstrap";
import { addWarehouse } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();

    const warehouse: IWarehouse = {
        id: "",
        name: "",
        address: "",
    };

    const submitProduct = async () => {
        addWarehouse(warehouse).then(() => navigate("/warehouse"));
    };

    return (
        <>
            <br></br>
            <Form>
                <Form.Group className="mb-3" controlId="new_name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        defaultValue={warehouse.name}
                        onChange={(event) => {
                            warehouse.name = event.target.value;
                        }}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="new_description">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        defaultValue={warehouse.address}
                        onChange={(event) => {
                            warehouse.address = event.target.value;
                        }}
                    />
                </Form.Group>
            </Form>
            <Button variant="primary" onClick={submitProduct}>
                Add Warehouse
            </Button>
        </>
    );
};

export default AddProduct;
