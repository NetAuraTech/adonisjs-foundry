import { ButtonEditor } from '~/components/cms/editor/blocks/button_editor';
import { CarouselEditor } from '~/components/cms/editor/blocks/carousel_editor';
import { FieldEditor } from '~/components/cms/editor/blocks/field_editor';
import { FlexEditor } from '~/components/cms/editor/blocks/flex_editor';
import { FormEditor } from '~/components/cms/editor/blocks/form_editor';
import { GridEditor } from '~/components/cms/editor/blocks/grid_editor';
import { HtmlTextEditor } from '~/components/cms/editor/blocks/html_text_editor';
import { IconEditor } from '~/components/cms/editor/blocks/icon_editor';
import { IframeEditor } from '~/components/cms/editor/blocks/iframe_editor';
import { ImageEditor } from '~/components/cms/editor/blocks/image_editor';
import { ListEditor } from '~/components/cms/editor/blocks/list_editor';
import { ParagraphEditor } from '~/components/cms/editor/blocks/paragraph_editor';
import { QuoteEditor } from '~/components/cms/editor/blocks/quote_editor';
import { SectionEditor } from '~/components/cms/editor/blocks/section_editor';
import { SeparatorEditor } from '~/components/cms/editor/blocks/separator_editor';
import { TitleEditor } from '~/components/cms/editor/blocks/title_editor';
import { VideoEditor } from '~/components/cms/editor/blocks/video_editor';
import { LockProps } from '~/components/cms/types/builder';
import type { Block, BlockType } from '#cms/types/page';
import type { LockState } from '~/components/cms/hooks/use_builder_sync';

interface BlockPropsEditorProps {
	block: Block;
	onChange: (props: Block['props']) => void;
	getLock?: (blockId: string, fieldKey: string) => LockState | null;
	acquireLock?: (blockId: string, fieldKey: string) => Promise<{ acquired: boolean; lock?: any }>;
	releaseLock?: (blockId: string, fieldKey: string) => Promise<void>;
	currentUserId?: number;
}

export default function BlockPropsEditor(props: BlockPropsEditorProps) {
	const { block, onChange, getLock, acquireLock, releaseLock, currentUserId = 0 } = props;
	const lockProps: LockProps = {
		blockId: block.id,
		getLock,
		acquireLock,
		releaseLock,
		currentUserId,
	};

	switch (block.type as BlockType) {
		case 'section':
			return <SectionEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'grid':
			return <GridEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'flex':
			return <FlexEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'title':
			return <TitleEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'paragraph':
			return <ParagraphEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'button':
			return <ButtonEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'separator':
			return <SeparatorEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'icon':
			return <IconEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'form':
			return <FormEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'field':
			return <FieldEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'htmltext':
			return <HtmlTextEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'image':
			return <ImageEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'video':
			return <VideoEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'carousel':
			return <CarouselEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'list':
			return <ListEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'quote':
			return <QuoteEditor block={block} onChange={onChange} lockProps={lockProps} />;
		case 'iframe':
			return <IframeEditor block={block} onChange={onChange} lockProps={lockProps} />;
		default:
			return <p className="text-xs text-ink-subtle">No editable props.</p>;
	}
}
