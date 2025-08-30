export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    pictureUrl: string;
    type: string;
    brand: string;
    quantityInStock: number;
    // Optional additional properties for enhanced design
    originalPrice?: number;
    discount?: number;
    rating?: number;
    reviewCount?: number;
}
