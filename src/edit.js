import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import "./editor.scss";
import { isBlobURL, revokeBlobURL } from "@wordpress/blob";
import {
	Spinner,
	withNotices,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	SelectControl,
} from "@wordpress/components";

function Edit({ attributes, setAttributes, noticeOperations, noticeUI }) {
	const { content, url, id, alt } = attributes;
	const [blobURL, setBloblURL] = useState();

	const handleContentChange = (newContent) => {
		setAttributes({ content: newContent });
	};

	// image functions
	const handleSelectImage = (image) => {
		if (!image || !image.url) {
			setAttributes({ url: undefined, id: undefined, alt: "" });
			return;
		}
		setAttributes({ url: image.url, id: image.id, alt: image.alt });
	};

	const handleSelectImageUrl = (imageUrl) => {
		setAttributes({ url: imageUrl, id: undefined, alt: "" });
	};

	const handleChangeAltText = (newAlt) => {
		setAttributes({ alt: newAlt });
	};

	const handleErrorMessage = (errorMessage) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(errorMessage);
	};

	const handleImageSize = (newURL) => {
		setAttributes({ url: newURL });
	};

	useEffect(() => {
		if (!id && isBlobURL(url)) {
			setAttributes({ url: undefined, alt: "" });
		}
	}, []);

	useEffect(() => {
		if (isBlobURL(url)) {
			setBloblURL(url);
		} else {
			revokeBlobURL(blobURL);
			setBloblURL();
		}
	}, [url]);

	const handleRemoveImage = () => {
		setAttributes({
			url: undefined,
			id: undefined,
			alt: "",
		});
	};

	const imageObject = useSelect(
		(select) => {
			const { getMedia } = select("core");
			return id ? getMedia(id) : null;
		},
		[id],
	);

	// get image size present in current theme
	const imageSizes = useSelect((select) => {
		return select(blockEditorStore).getSettings().imageSizes;
	}, []);

	const getImageSizeOptions = () => {
		if (!imageObject) return [];

		const options = [];
		const sizes = imageObject.media_details.sizes;

		console.log(sizes);

		for (const key in sizes) {
			const size = sizes[key];
			const imageSize = imageSizes.find((s) => s.slug === key);
			if (imageSize) {
				options.push({
					label: imageSize.name,
					value: size.source_url,
				});
			}
		}

		return options;
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Image Settings", "about-section")}>
					{id && (
						<SelectControl
							label={__("Image Size", "about-section")}
							options={getImageSizeOptions()}
							value={url}
							onChange={handleImageSize}
						/>
					)}
					{url && !isBlobURL(url) && (
						<TextareaControl
							label={__("Alt Text", "about-section")}
							value={alt}
							onChange={handleChangeAltText}
							help={__(
								"Alternative text describes your image to people who can't see it. Add a short description with its key details.",
								"about-section",
							)}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			{url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						name={__("Replace Image", "about-section")}
						onSelect={handleSelectImage}
						onSelectURL={handleSelectImageUrl}
						onError={handleErrorMessage}
						accept="image/*"
						allowedTypes={["image"]}
						mediaId={id}
						mediaURL={url}
					/>
					<ToolbarButton onClick={handleRemoveImage}>
						{__("Remove Image", "about-section")}
					</ToolbarButton>
				</BlockControls>
			)}
			<div {...useBlockProps()}>
				{url && (
					<div
						className={`wp-block-about-section-img${
							isBlobURL(url) ? " is-loading" : ""
						}`}
					>
						<img src={url} alt={alt} />
						{isBlobURL(url) && <Spinner />}
					</div>
				)}
				<MediaPlaceholder
					icon="format-image"
					onSelect={handleSelectImage}
					onSelectURL={handleSelectImageUrl}
					onError={handleErrorMessage}
					accept="image/*"
					allowedTypes={["image"]}
					disableMediaButtons={url}
					notices={noticeUI}
				/>
				<RichText
					tagName="p"
					value={content}
					onChange={handleContentChange}
					placeholder={__("Add content here...", "about-section")}
				/>
			</div>
		</>
	);
}

export default withNotices(Edit);
