import { Product } from "@prisma/client";
import { Parser } from "json2csv";

/**
 *
 * Parse items mongodb documents into CSV data
 * @param items: List of IItem object to parse into CSV
 * @returns
 */
const parseCSV = (items) => {
    const fields = [
        { label: "Product Id", value: "productId" },
        { label: "Product Name", value: "name" },
        { label: "Product Description", value: "description" },
        { label: "In stock quantity", value: "inStockQuantity" },
        { label: "Back Ordered Quantity", value: "backOrderQuantity" },
    ];
    const json2csv = new Parser({ fields: fields });
    const jsonified = JSON.parse(JSON.stringify(items));
    return json2csv.parse(jsonified);
};

export { parseCSV };
