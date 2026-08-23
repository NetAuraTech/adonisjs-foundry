import { sanitizeHtml } from '~/components/cms/utils/purify';
import type { ResolvedBlock } from '#cms/types/page';

interface QuoteBlockProps {
	block: ResolvedBlock<'quote'>;
}

const variantClasses: Record<string, string> = {
	default: 'border-l-4 border-primary pl-4',
	bordered: 'rounded-lg border border-edge p-4',
	highlight: 'rounded-lg bg-surface p-4',
};

/**
 * Renders a blockquote with optional attribution. Text and attribution may
 * carry inline rich-text HTML — sanitized server-side at save time and again
 * here as defence-in-depth.
 */
export default function QuoteBlock({ block }: QuoteBlockProps) {
	const { text, attribution, variant, className } = block.props;

	const safeText = text ? sanitizeHtml(text) : '';
	const safeAttribution = attribution ? sanitizeHtml(attribution) : '';
	if (!safeText) return null;

	const variantClass = variantClasses[variant ?? 'default'] ?? variantClasses.default;

	return (
		<blockquote className={['my-4 text-ink italic', variantClass, className].filter(Boolean).join(' ')}>
			<div
				className="leading-relaxed"
				// Sanitized via sanitizeHtml — only inline formatting survives.
				dangerouslySetInnerHTML={{ __html: safeText }}
			/>
			{safeAttribution ? (
				<footer
					className="mt-2 text-sm not-italic text-ink-muted"
					dangerouslySetInnerHTML={{ __html: `— ${safeAttribution}` }}
				/>
			) : null}
		</blockquote>
	);
}
