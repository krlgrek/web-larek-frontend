import { Component } from './base/component';
import { ensureElement } from '../utils/utils';
import { ISuccess, ISuccessActions } from '../types';

export class Success extends Component<ISuccess> {
	protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _close: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._title = ensureElement<HTMLElement>(
			'.order-success__title',
			this.container
		);
		this._description = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this._close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}
