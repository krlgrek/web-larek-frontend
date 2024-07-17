import { Component } from './base/component';
import { BasketItemIndex, ICardActions } from '../types';
import { ensureElement } from '../utils/utils';

export interface IItem<T> {
	id: string;
	index: number;
	title: string;
	description: string;
	price: string;
	image: string;
	category: string;
	status: T;
}

type CatalogStatus = {
	status: boolean;
};

const Category = {
	['софт-скил']: 'soft',
	['другое']: 'other',
	['дополнительное']: 'additional',
	['кнопка']: 'button',
	['хард-скил']: 'hard',
};

export class Card<T> extends Component<IItem<T>> {
	protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _price: HTMLSpanElement;
	protected _button: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this._description = container.querySelector(`.${blockName}__description`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._button = container.querySelector(`.button`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	get image(): string {
		return this._image.textContent || '';
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	get description(): string {
		return this._description.textContent || '';
	}

	set category(value: keyof typeof Category) {
		if (this._category) {
			this.setText(this._category, value);
			const categoryStyle = `card__category_${Category[value]}`;
			this.toggleClass(this._category, categoryStyle, true);
		}
	}

	get category(): keyof typeof Category {
		return this._category.textContent as keyof typeof Category;
	}

	set price(value: string | null) {
		this.setText(this._price, value ?? '');
	}

	get price(): string {
		return this._price.textContent || null;
	}
}

export class BasketItem extends Card<BasketItemIndex> {
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}
}

export class CatalogItem extends Card<CatalogStatus> {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}

	set status({ status }: CatalogStatus) {
		if (this._button) {
			if (this.price === null) {
				this.setText(this._button, 'Недоступно');
				this.setDisabled(this._button, true);
			} else {
				this.setText(this._button, status ? 'Уже в корзине' : 'В корзину');
				this.setDisabled(this._button, status);
			}
		}
	}
}
