import axios, { AxiosResponse } from "axios";
import download from "downloadjs";

const inventoryUrl: string = "http://localhost:3000/inventory";
const warehouseUrl: string = "http://localhost:3000/warehouses";

export const getProducts = async (): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const products: AxiosResponse<ApiDataType> = await axios.get(
            `${inventoryUrl}/products`
        );
        console.log(products);
        return products;
    } catch (error) {
        throw error;
    }
};

export const getProductDetail = async (
    id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const productDetail: AxiosResponse<ApiDataType> = await axios.get(
            `${inventoryUrl}/products/${id}`
        );
        console.log(productDetail);
        return productDetail;
    } catch (error) {
        throw error;
    }
};

export const getWarehouseDetail = async (
    id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const warehouseDetail: AxiosResponse<ApiDataType> = await axios.get(
            `${warehouseUrl}/${id}`
        );
        return warehouseDetail;
    } catch (error) {
        throw error;
    }
};

export const getWarehouses = async (): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const warehouses: AxiosResponse<ApiDataType> = await axios.get(
            `${warehouseUrl}`
        );
        console.log(warehouses);
        return warehouses;
    } catch (error) {
        throw error;
    }
};

export const addProduct = async (
    data: IProduct
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const product: Omit<IProduct, "id"> = {
            name: data.name,
            description: data.description,
        };

        const savedProduct: AxiosResponse<ApiDataType> = await axios.post(
            `${inventoryUrl}/products`,
            product
        );
        return savedProduct;
    } catch (error) {
        throw error;
    }
};

export const addWarehouse = async (
    data: IWarehouse
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const warehouse: Omit<IWarehouse, "id"> = {
            name: data.name,
            address: data.address,
        };

        const savedWarehouse: AxiosResponse<ApiDataType> = await axios.post(
            `${warehouseUrl}`,
            warehouse
        );
        return savedWarehouse;
    } catch (error) {
        throw error;
    }
};

export const orderWarehouse = async (
    quantity: number,
    product_id: string,
    warehouse_id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const body = {
            quantity: quantity,
        };
        const savedProduct = await axios.post(
            `${warehouseUrl}/${warehouse_id}/${product_id}/order`,
            body
        );
        return savedProduct;
    } catch (error) {
        throw error;
    }
};

export const stockWarehouse = async (
    quantity: number,
    product_id: string,
    warehouse_id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const body = {
            quantity: quantity,
        };
        const savedProduct = await axios.post(
            `${warehouseUrl}/${warehouse_id}/${product_id}/stock`,
            body
        );
        return savedProduct;
    } catch (error) {
        throw error;
    }
};

export const fulfillFromWarehouse = async (
    quantity: number,
    product_id: string,
    warehouse_id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const body = {
            quantity: quantity,
        };
        const savedProduct = await axios.post(
            `${warehouseUrl}/${warehouse_id}/${product_id}/fulfill`,
            body
        );
        return savedProduct;
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (
    data: IProduct
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const item: Omit<IProduct, "id"> = {
            name: data.name,
            description: data.description,
        };

        const updateProduct: AxiosResponse<ApiDataType> = await axios.put(
            `${inventoryUrl}/products/${data.id}`,
            item
        );
        return updateProduct;
    } catch (error) {
        throw error;
    }
};
export const updateWarehouse = async (
    data: IWarehouse
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const warehouse: Omit<IWarehouse, "id"> = {
            name: data.name,
            address: data.address,
        };

        const updatedWarehouse: AxiosResponse<ApiDataType> = await axios.put(
            `${warehouseUrl}/${data.id}`,
            warehouse
        );
        return updatedWarehouse;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (
    id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const deleteProduct: AxiosResponse<ApiDataType> = await axios.delete(
            `${inventoryUrl}/products/${id}`
        );
        return deleteProduct;
    } catch (error) {
        throw error;
    }
};

export const deleteWarehouse = async (
    id: string
): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const deletedWarehouse: AxiosResponse<ApiDataType> = await axios.delete(
            `${warehouseUrl}/${id}`
        );
        return deletedWarehouse;
    } catch (error) {
        throw error;
    }
};

export const downloadCSV = async (): Promise<void> => {
    try {
        const blobData = await axios.get(
            `${inventoryUrl}/products/summary/download`,
            {
                responseType: "blob",
            }
        );
        const data = blobData.data;
        if (data) {
            download(data, "items.csv");
        } else {
            console.log("data not found");
        }
    } catch (err) {
        throw err;
    }
};
