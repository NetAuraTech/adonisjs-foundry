import { BaseHttpException } from '#core/exceptions/base_http_exception';

export default class MissingTranslationException extends BaseHttpException {
	static status = 404;
	static code = 'E_MISSING_TRANSLATION';

	constructor(
		protected locale: string,
		protected pageId: number,
	) {
		super(`No translation for locale "${locale}" on page ${pageId}`);
	}

	protected details() {
		return { locale: this.locale, pageId: this.pageId };
	}

	protected i18nParams() {
		return { locale: this.locale, pageId: this.pageId };
	}
}
