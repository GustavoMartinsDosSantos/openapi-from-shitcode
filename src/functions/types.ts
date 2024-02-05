export interface Person {
    name: string;
    age: number;
}

export interface Animal {
    name: string;
    race: string;
}

export interface Product {
    id: number;
    name: string;
}

export interface Order {
    id: number;
    buyerId: number;
    product: Product;
    deliveryDate: Date;
}