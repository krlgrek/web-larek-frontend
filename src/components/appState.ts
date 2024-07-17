import { IAppState, IItemCard, IOrder, IOrderForm, FormErrors } from "../types";
import { Model } from "./base/model";

export type CatalogEvent = {
    catalog: IItemCard[]
};

export class AppState extends Model<IAppState> {
    basket: string[] = [];
    catalog: IItemCard[] = [];
    order: IOrder = {
        items: [],
        address: '',
        email: '',
        phone: '',
        payment: '',
        total: 0
    };
    preview: string | null;
    formErrors: FormErrors = {};

    addItemToBasket(item: IItemCard) {
        if(this.basket.includes(item.id)) return;
        this.basket.push(item.id);
        this.emitChanges('items:changed', { basket: this.basket });
    }

    removeItemFromBasket(item: IItemCard) {
        if(this.basket.includes(item.id)) {
            const index = this.basket.indexOf(item.id);
            this.basket.splice(index, 1);
            this.emitChanges('basket:open', { basket: this.basket });
            this.emitChanges('items:changed', { basket: this.basket });
        }
        return;
    }

    clearBasket() {
        this.basket = [];
        this.emitChanges('items:changed', { basket: this.basket });
    }

    getBasket(): IItemCard[] {
        return this.catalog.filter(item => this.basket.includes(item.id));
    }

    getTotal() {
        return this.basket.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder(field)) {
            this.events.emit('order:ready', this.order);
        }

        if (this.validateContacts(field)) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    setCatalog(items: IItemCard[]) {
        this.catalog = [...items];
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: IItemCard) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    validateOrder(field: keyof IOrder) {
		const errors: FormErrors = {};
        if (field !== 'email' && field !== 'phone') {
		if (!this.order.address) errors.address = 'Необходимо указать адрес';
		else if (!this.order.payment)
			errors.address = 'Необходимо выбрать способ оплаты';
		this.formErrors = errors;
		this.events.emit('paymentformErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
        }
	}

    validateContacts(field: keyof IOrder) {
		const errors: FormErrors = {};
		if (field !== 'address' && field !== 'payment') {
        if (!this.order.email) errors.email = 'Необходимо указать email';
		if (!this.order.phone) errors.phone = 'Необходимо указать телефон';
		this.formErrors = errors;
		this.events.emit('contactsformErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	    }
    }

    clearOrder() {
        this.order = {
			address: '',
			email: '',
			phone: '',
            payment: null,
			total: 0,
			items: [],
		};
    }
}