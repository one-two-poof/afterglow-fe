import { render, screen } from "@testing-library/react";

import { Logo } from "./Logo";

describe("Logo", () => {
  it("접근성을 위해 role=img와 aria-label을 가진다", () => {
    render(<Logo />);

    expect(screen.getByRole("img", { name: "afterglow" })).toBeInTheDocument();
  });

  it("기본(gradient) variant는 gradient 정의를 렌더한다", () => {
    const { container } = render(<Logo />);

    expect(container.querySelector("linearGradient")).toBeInTheDocument();
  });

  it("mono variant는 gradient 정의를 렌더하지 않는다", () => {
    const { container } = render(<Logo variant="mono" />);

    expect(container.querySelector("linearGradient")).not.toBeInTheDocument();
  });
});
