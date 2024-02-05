import { useBlockProps, RichText } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { content, url, alt, id } = attributes;

	return (
		<div {...useBlockProps.save()}>
			<RichText.Content tagName="p" value={content} />
			{url && (
				<img src={url} alt={alt} className={id ? `wp-image-${id}` : null} />
			)}
		</div>
	);
}
