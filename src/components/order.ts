import { Form } from './common/form';
import { IOrderForm } from '../types';
import { IEvents } from './base/events';
import { ensureAllElements } from '../utils/utils';

export class Order extends Form<IOrderForm> {
	protected _altButtons?: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._altButtons = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			this.container
		);
		this._altButtons.forEach((button) => {
			button.addEventListener('click', () => {
				this._altButtons.forEach((button) => {
					this.toggleClass(button, 'button_alt-active', false);
				});
				this.toggleClass(button, 'button_alt-active', true);
				this.method = button.name;
			});
		});
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set method(value: string) {
		this.events.emit('payment:set', { paymentMethod: value });
	}
}
