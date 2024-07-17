export type Category = 
    'софт-скил' 
  | 'другое' 
  | 'дополнительное' 
  | 'кнопка' 
  | 'хард-скил';

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type BasketItemIndex = {
	index: number;
};

export interface IAppState {
  catalog: IItemCard[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
}

export interface IItemList {
  total: number;
  items: IItemCard[];
}

export interface IItemCard {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
}

export interface IOrderForm {
  address: string;
  email: string;
  phone: string;
  payment: string;
}

export interface IOrder extends IOrderForm {
  items: string[];
  total: number;
}

export interface IOrderResult extends IOrder {
  id: string;
  error?: string
}

export interface IBasket {
  items: HTMLElement[];
  total: number
}

export interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}

export interface ISuccess {
  title: string;
  description: string;
}

export interface ISuccessActions {
	onClick: () => void;
}

export interface IModalData {
  content: HTMLElement;
}

export interface IFormState {
  valid: boolean;
  errors: string[];
}

export interface ICardActions {
  onClick: (event: MouseEvent) => void;
}