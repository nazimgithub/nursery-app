import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { http, HttpResponse } from "msw";
import { server } from "../test/setup";

import RoomPage from "./RoomPage";

describe("Room Dashboard", () => {
  it.skip("displays current room occupants", async () => {
    render(<RoomPage />);

    expect(
      await screen.findByRole("heading", { name: "Ali" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Sara" })).toBeInTheDocument();

    expect(screen.getByText("2 children")).toBeInTheDocument();
  });

  it.skip("checks a child into the room", async () => {
    const user = userEvent.setup();

    render(<RoomPage />);

    await screen.findByRole("heading", { name: "Ali" });

    await user.type(screen.getByRole("spinbutton", { name: "Child ID" }), "3");

    await user.click(screen.getByRole("button", { name: /check in/i }));

    expect(
      await screen.findByRole("heading", { name: "Ahmed" }),
    ).toBeInTheDocument();

    expect(screen.getByText("3 children")).toBeInTheDocument();
  });

  it.skip("checks a child out of the room", async () => {
    const user = userEvent.setup();

    render(<RoomPage />);

    await screen.findByRole("heading", { name: "Ali" });

    const aliCard = screen
      .getByRole("heading", {
        name: "Ali",
      })
      .closest("article");

    expect(aliCard).not.toBeNull();

    await user.click(
      within(aliCard!).getByRole("button", {
        name: /check out/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Ali" }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Sara" })).toBeInTheDocument();
  });

  it("displays an empty state when a room has no occupants", async () => {
    server.use(
      http.get("*/api/rooms/:roomId/occupants", () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    render(<RoomPage />);

    expect(
      await screen.findByRole("heading", {
        name: "No children in this room",
      }),
    ).toBeInTheDocument();
  });

  it("displays an error when the occupants request fails", async () => {
    server.use(
      http.get("*/api/rooms/:roomId/occupants", () =>
        HttpResponse.json({ message: "Server unavailable." }, { status: 500 }),
      ),
    );

    render(<RoomPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load room occupants",
    );
  });

  it.skip("prevents duplicate check-in and displays the API error", async () => {
    const user = userEvent.setup();

    render(<RoomPage />);

    await screen.findByRole("heading", { name: "Ali" });

    await user.type(screen.getByRole("spinbutton", { name: "Child ID" }), "1");

    await user.click(screen.getByRole("button", { name: /check in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "already checked into a room",
    );
  });
});
