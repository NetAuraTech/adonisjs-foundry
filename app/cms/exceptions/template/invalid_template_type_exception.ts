import { BaseHttpException } from '#exceptions/base_http_exception';

export default class InvalidTemplateTypeException extends BaseHttpException {
	static status = 422;
	static code = 'E_INVALID_TEMPLATE_TYPE';

	constructor() {
		super('Only page templates can be applied to a full page.');
	}
}
