import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";

describe("Button", () => {
  it("기본적으로 button 엘리먼트로 렌더한다", () => {
    render(<Button variant="primary">로그인</Button>);

    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("as prop으로 다른 엘리먼트(a)로 렌더하고 네이티브 속성을 전달한다", () => {
    render(
      <Button as="a" href="/login" variant="primary">
        이동
      </Button>,
    );

    const link = screen.getByRole("link", { name: "이동" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("onClick 핸들러를 그대로 전달한다", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        클릭
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "클릭" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
