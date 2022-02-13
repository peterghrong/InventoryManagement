interface IProduct {
    id: string;
    name: string;
    description: string;
}

interface IWarehouse {
    id: string;
    name: string;
    address: string;
}

interface IProductDetail {
    id: string;
    backOrderQuantity: number;
    inStockQuantity: number;
    warehouse: Omit<IWarehouse, "id">;
}

interface IWarehouseDetail {
    id: string;
    backOrderQuantity: number;
    inStockQuantity: number;
    product: Omit<IProduct, "id">;
}

interface WarehouseProps {
    warehouse: IWarehouse;
}

interface ItemProps {
    item: IItem;
}

type ApiDataType = {
    message?: string;
    status: string;
    product: IProduct;
    warehouses: IWarehouse[];
    warehousesDetail: IWarehouseDetail[];
    products: IProduct[];
    productDetail: IProductDetail[];
};
