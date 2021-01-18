
export class Product {
    name;
    prices;
    dateCreated;
    imageLink;
    constructor({ name, prices, imageLink, dateCreated }) {
        this.name = name;
        this.prices = prices;
        this.imageLink = imageLink;
    }
}
export default { Product };