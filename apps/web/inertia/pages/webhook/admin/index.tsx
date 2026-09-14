import { Form } from '@adonisjs/inertia/react';
import { SharedProps } from '@adonisjs/inertia/types';
import { AdminMain } from '@foundry/design-system/admin-main';
import { Button } from '@foundry/design-system/button';
import { Card } from '@foundry/design-system/card';
import { Field } from '@foundry/design-system/field';
import { Pagination } from '@foundry/design-system/pagination';
import { SelectOption } from '@foundry/design-system/select';
import Table from '@foundry/design-system/table';
import { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';
import { ReactElement } from 'react';
import { actionFor, urlFor } from '~/client';
import { sanitizeText } from '~/helpers/sanitization';
import { useMenu } from '~/hooks/use_admin';
import { Lang, useTranslation } from '~/hooks/use_translation';
import Layout from '~/layouts/admin';
import { Paginated } from '~/types/paginated';
import type { AdminWebhookDeliveriesTranslations } from '#transport/webhook/helpers/i18n_payloads/deliveries_list';

const STATUSES = ['received', 'processed', 'failed'] as const;

const STATUS_BADGE_CLASSES: Record<string, string> = {
	received: 'text-ink-muted border-ink-muted',
	processed: 'text-secondary border-secondary bg-secondary-light/20',
	failed: 'text-danger border-danger bg-danger-soft',
};

type PageProps = {
	deliveries: Paginated<Data.Webhook.WebhookDelivery>;
	filters: {
		receiver?: string;
		status?: string;
		search?: string;
	};
	translations: AdminWebhookDeliveriesTranslations;
};

export default function WebhookDeliveriesPage(props: PageProps) {
	const { deliveries, filters, translations } = props;
	const pageProps = usePage<SharedProps>().props;
	const { t, format } = useTranslation(translations);
	const { t: commonT } = useTranslation(pageProps.common_translations);

	const { getEntryIcon } = useMenu();

	return (
		<AdminMain title={t('title')} icon={getEntryIcon('admin.webhook.deliveries.render')}>
			<Card
				header={
					<Form
						action={actionFor('admin.webhook.deliveries.render')}
						className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 items-end"
					>
						<Field
							type="text"
							name="search"
							label={t('search.value')}
							placeholder={t('search.placeholder')}
							defaultValue={filters.search}
							sanitizeValue={sanitizeText}
						/>
						<Field
							type="text"
							name="receiver"
							label={t('receiver.value')}
							placeholder={t('receiver.placeholder')}
							defaultValue={filters.receiver}
							sanitizeValue={sanitizeText}
						/>
						<Field
							type="select"
							name="status"
							label={t('status.value')}
							placeholder={t('status.placeholder')}
							defaultValue={filters.status}
							sanitizeValue={sanitizeText}
						>
							{STATUSES.map((status) => (
								<SelectOption key={`status-${status}`} label={t(`status.${status}`)} value={status} />
							))}
						</Field>
						<Button type="submit" name="webhooks-filter-submit" fitContent>
							{t('search.filter')}
						</Button>
					</Form>
				}
				footer={
					<Pagination
						buildHref={(page) => urlFor('admin.webhook.deliveries.render', undefined, { qs: { ...filters, page } })}
						filters={filters}
						metadata={deliveries.metadata}
						summaryText={(start, end, total) => commonT('pagination.showing', { start, end, total })}
						previousTitle={commonT('pagination.previous')}
						nextTitle={commonT('pagination.next')}
					/>
				}
			>
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>{t('columns.receiver')}</Table.HeaderCell>
							<Table.HeaderCell>{t('columns.deliveryId')}</Table.HeaderCell>
							<Table.HeaderCell>{t('columns.status')}</Table.HeaderCell>
							<Table.HeaderCell>{t('columns.ip')}</Table.HeaderCell>
							<Table.HeaderCell>{t('columns.receivedOn')}</Table.HeaderCell>
							<Table.HeaderCell>{t('columns.processedOn')}</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{deliveries.data.length === 0 ? (
							<Table.Row>
								<Table.Cell colSpan={6} className="text-center! p-12!">
									{t('empty')}
								</Table.Cell>
							</Table.Row>
						) : (
							deliveries.data.map((delivery) => (
								<Table.Row key={`webhook-delivery-${delivery.id}`}>
									<Table.Cell data-label={t('columns.receiver')}>{delivery.receiver}</Table.Cell>
									<Table.Cell data-label={t('columns.deliveryId')}>
										<span className="break-all font-mono text-xs">{delivery.deliveryId}</span>
									</Table.Cell>
									<Table.Cell data-label={t('columns.status')}>
										<span
											className={`px-4 py-1 rounded border ${STATUS_BADGE_CLASSES[delivery.status] ?? STATUS_BADGE_CLASSES.received}`}
										>
											{t(`status.${delivery.status}` as any)}
										</span>
									</Table.Cell>
									<Table.Cell data-label={t('columns.ip')}>{delivery.ip ?? '—'}</Table.Cell>
									<Table.Cell data-label={t('columns.receivedOn')}>
										{delivery.createdAt
											? format(new Date(delivery.createdAt), 'medium', pageProps.locale as Lang)
											: '—'}
									</Table.Cell>
									<Table.Cell data-label={t('columns.processedOn')}>
										{delivery.processedAt
											? format(new Date(delivery.processedAt), 'medium', pageProps.locale as Lang)
											: '—'}
									</Table.Cell>
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table>
			</Card>
		</AdminMain>
	);
}

WebhookDeliveriesPage.layout = (page: ReactElement<SharedProps>) => <Layout>{page}</Layout>;
