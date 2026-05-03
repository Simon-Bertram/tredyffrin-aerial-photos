import * as React from "react";

import {
	getPhotoMetadataItems,
	type LocationPhoto,
} from "@/lib/locations";

export type LocationPhotoMetadataProps =
	| { variant: "gallery"; photo: LocationPhoto }
	| { variant: "slideshow"; section: "slide-title"; photo: LocationPhoto }
	| { variant: "slideshow"; section: "details"; photo: LocationPhoto };

export function LocationPhotoMetadata(props: LocationPhotoMetadataProps) {
	if (props.variant === "gallery") {
		const { photo } = props;
		return (
			<>
				<header className="space-y-1">
					{photo.title ? (
						<h3 className="card-title">{photo.title}</h3>
					) : null}
					{photo.caption ? (
						<p className="text-sm text-muted-foreground">
							<span className="italic">Caption:</span> {photo.caption}
						</p>
					) : null}
				</header>

				<div className="space-y-1">
					{getPhotoMetadataItems(photo).map((item) => (
						<p key={item.key} className="text-sm text-muted-foreground">
							<span className="italic">{item.label}:</span> {item.value}
						</p>
					))}
				</div>
			</>
		);
	}

	if (props.section === "slide-title") {
		const { photo } = props;
		if (!photo.title) return null;
		return (
			<figcaption className="border-b bg-muted/50 p-4 text-lg font-medium text-card-foreground">
				{photo.title}
			</figcaption>
		);
	}

	const { photo } = props;
	const rows = getPhotoMetadataItems(photo);

	return (
		<div aria-live="polite" aria-atomic="true" className="space-y-2 text-sm">
			{photo.caption ? (
				<p className="text-card-foreground">{photo.caption}</p>
			) : null}
			{rows.length > 0 ? (
				<dl className="grid gap-1 text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-x-4">
					{rows.map((row) => (
						<React.Fragment key={row.key}>
							<dt className="italic text-card-foreground">{row.label}</dt>
							<dd>{row.value}</dd>
						</React.Fragment>
					))}
				</dl>
			) : !photo.caption ? (
				<p className="text-muted-foreground">No photo metadata available.</p>
			) : null}
		</div>
	);
}
