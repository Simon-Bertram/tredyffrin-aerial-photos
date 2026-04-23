// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocationMarkerTooltipCard } from "./location-marker-tooltip-card";

const baseLocation = {
  slug: "paoli",
  name: "Paoli",
  coordinates: {
    longitude: -75.48,
    latitude: 40.04,
  },
  shortDescription: "Historic aerial captures",
  fullDescription: "Longer body content",
  photos: [
    {
      id: "p1",
      title: "Aerial 1",
      src: "/one.jpg",
      alt: "Aerial one",
      direction: "North",
      photoDate: "1937",
    },
    {
      id: "p2",
      title: "Aerial 2",
      src: "/two.jpg",
      alt: "Aerial two",
      direction: "South",
      photoDate: "1948",
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("LocationMarkerTooltipCard", () => {
  it("navigates to detail page when card body is clicked", () => {
    const onNavigate = vi.fn();

    render(
      <LocationMarkerTooltipCard
        location={baseLocation}
        detailPath="/locations/paoli"
        isOnImagery={false}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByTestId("location-preview-card"));
    expect(onNavigate).toHaveBeenCalledWith("/locations/paoli");
  });

  it("changes slide with arrows without triggering navigation", () => {
    const onNavigate = vi.fn();

    render(
      <LocationMarkerTooltipCard
        location={baseLocation}
        detailPath="/locations/paoli"
        isOnImagery={false}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByTestId("slider-next-button"));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/2\s*\/\s*2/)).toBeTruthy();
  });

  it("supports keyboard navigation activation on card", () => {
    const onNavigate = vi.fn();

    render(
      <LocationMarkerTooltipCard
        location={baseLocation}
        detailPath="/locations/paoli"
        isOnImagery={false}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("location-preview-card"), {
      key: "Enter",
    });

    expect(onNavigate).toHaveBeenCalledWith("/locations/paoli");
  });

  it("renders no-photo fallback state", () => {
    const locationWithoutPhotos = {
      ...baseLocation,
      photos: [],
    };

    render(
      <LocationMarkerTooltipCard
        location={locationWithoutPhotos}
        detailPath="/locations/paoli"
        isOnImagery={false}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("No plate on file")).toBeTruthy();
  });
});
