import { Form } from '@adonisjs/inertia/react';
import { ReactNode } from 'react';
import { urlFor } from '~/client';
import type { ResolvedBlock } from '#cms/types/page';

interface FormBlockProps {
	block: ResolvedBlock<'form'>;
	children?: ReactNode;
}

/**
 * Wrapper block that defines a form
 * All visual child blocks are rendered inside this container.
 */
export default function FormBlock(props: FormBlockProps) {
	const { block, children } = props;
	const { route, routeParams, className } = block.props;

	if (!route) {
		return <div>{children}</div>;
	}

	return (
		<Form action={urlFor(route as any, routeParams)} className={['grid', 'gap-4', className].filter(Boolean).join(' ')}>
			{children}
		</Form>
	);
}
