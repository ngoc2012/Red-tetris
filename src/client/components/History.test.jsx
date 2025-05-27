import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { History } from "./History";

// Mock the fetch API
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("History component", () => {
  it("shows loading initially", () => {
    fetch.mockImplementation(() =>
      new Promise(() => {}) // never resolves
    );

    render(<History />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays history data in a table", async () => {
    const mockData = [
      {
        time: "2024-01-01 12:00",
        room: "Alpha",
        name: "Player1",
        score: 100,
        result: "Win",
      },
      {
        time: "2024-01-01 12:05",
        room: "Beta",
        name: "Player2",
        score: 80,
        result: "Lose",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<History />);

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    // Check table headers
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Room")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Win")).toBeInTheDocument();
    expect(screen.getByText("Lose")).toBeInTheDocument();
  });

  it("displays 'No history available.' if the history array is empty", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<History />);

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    expect(screen.getByText("No history available.")).toBeInTheDocument();
  });

  it("handles fetch failure gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("API failure"));

    render(<History />);

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    expect(screen.getByText("No history available.")).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching history data:", expect.any(Error));

    consoleSpy.mockRestore();
  });
});
