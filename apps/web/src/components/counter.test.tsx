import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Counter } from "./counter";
import { useCounterStore } from "@/stores/counter-store";

describe("Counter", () => {
  beforeEach(() => {
    act(() => {
      useCounterStore.getState().reset();
    });
  });

  it("renders the initial count", () => {
    render(<Counter />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("increments and decrements the count", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("resets the count", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
