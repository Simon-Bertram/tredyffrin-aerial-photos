// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SelectedPhotosCoverflow } from "./selected-photos-coverflow";

vi.mock("@/components/ui/skiper-ui/skiper47", () => ({
  Carousel_001: ({ images, onSlideClick }: any) => (
    <div>
      <ul data-testid="carousel-images">
        {images.map((image: any, index: number) => (
          <li key={`${image.title}-${index}`}>{image.title}</li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="slide-click"
        onClick={() => onSlideClick(0)}
      >
        slide click
      </button>
    </div>
  ),
}));

vi.mock("./selected-photos-autoplay-toggle", () => ({
  SelectedPhotosAutoplayToggle: () => <button type="button">autoplay</button>,
}));

const photos = [
  {
    src: "/airfield-1.jpg",
    alt: "Airfield one",
    locationName: "Paoli",
    locationSlug: "paoli",
    photoId: "p1",
    photoDate: "1948",
    selectedCollection: "airfields",
  },
  {
    src: "/bridge-1.jpg",
    alt: "Bridge one",
    locationName: "Berwyn",
    locationSlug: "berwyn",
    photoId: "p2",
    photoDate: "1950",
    selectedCollection: "bridges",
  },
];

function mountCollectionSelect(value = "") {
  document.body.innerHTML = `
    <select id="photo-collection">
      <option value="" ${value === "" ? "selected" : ""}>All</option>
      <option value="airfields" ${
        value === "airfields" ? "selected" : ""
      }>Airfields</option>
      <option value="bridges" ${
        value === "bridges" ? "selected" : ""
      }>Bridges</option>
      <option value="invalid" ${
        value === "invalid" ? "selected" : ""
      }>Invalid</option>
    </select>
  `;
}

describe("SelectedPhotosCoverflow", () => {
  beforeEach(() => {
    mountCollectionSelect("");
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("shows all photos by default when no collection is selected", () => {
    render(<SelectedPhotosCoverflow photos={photos} />);

    expect(screen.getByText("Paoli")).toBeTruthy();
    expect(screen.getByText("Berwyn")).toBeTruthy();
  });

  it("filters photos when a valid collection is selected", () => {
    render(<SelectedPhotosCoverflow photos={photos} />);

    const select = document.getElementById("photo-collection");
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected photo collection select to exist");
    }
    fireEvent.change(select, { target: { value: "airfields" } });

    expect(screen.getByText("Paoli")).toBeTruthy();
    expect(screen.queryByText("Berwyn")).toBeNull();
  });

  it("resets to all photos when collection is cleared", () => {
    render(<SelectedPhotosCoverflow photos={photos} />);

    const select = document.getElementById("photo-collection");
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected photo collection select to exist");
    }
    fireEvent.change(select, { target: { value: "airfields" } });
    fireEvent.change(select, { target: { value: "" } });

    expect(screen.getByText("Paoli")).toBeTruthy();
    expect(screen.getByText("Berwyn")).toBeTruthy();
  });

  it("ignores invalid collection values and shows all photos", () => {
    render(<SelectedPhotosCoverflow photos={photos} />);

    const select = document.getElementById("photo-collection");
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected photo collection select to exist");
    }
    fireEvent.change(select, { target: { value: "invalid" } });

    expect(screen.getByText("Paoli")).toBeTruthy();
    expect(screen.getByText("Berwyn")).toBeTruthy();
  });

  it("renders empty state when chosen collection has no matching photos", () => {
    render(
      <SelectedPhotosCoverflow
        photos={[
          {
            ...photos[0],
            selectedCollection: "airfields",
          },
        ]}
      />,
    );

    const select = document.getElementById("photo-collection");
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error("Expected photo collection select to exist");
    }
    fireEvent.change(select, { target: { value: "bridges" } });

    expect(
      screen.getByText("The plate drawers await their first photograph."),
    ).toBeTruthy();
  });
});
