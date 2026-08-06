import { render, screen } from "@testing-library/react";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("current / max 값을 '단계' 형식으로 렌더한다", () => {
    render(<StatusBadge current={2} max={5} />);

    expect(screen.getByText("2 / 5 단계")).toBeInTheDocument();
  });

  it("current와 max가 같은 경계값도 렌더한다", () => {
    render(<StatusBadge current={5} max={5} />);

    expect(screen.getByText("5 / 5 단계")).toBeInTheDocument();
  });

  it("current가 0이어도 렌더한다", () => {
    render(<StatusBadge current={0} max={5} />);

    expect(screen.getByText("0 / 5 단계")).toBeInTheDocument();
  });

  it("current가 max보다 크면 아무것도 렌더하지 않는다", () => {
    const { container } = render(<StatusBadge current={6} max={5} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/단계/)).not.toBeInTheDocument();
  });
});
