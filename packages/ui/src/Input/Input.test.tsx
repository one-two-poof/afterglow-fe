import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "./Input";

describe("Input", () => {
  it("label을 통해 input에 접근할 수 있다 (htmlFor ↔ id 연결)", () => {
    render(<Input label="이메일" />);

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  });

  it("helperText를 렌더하고 input과 aria-describedby로 연결한다", () => {
    render(<Input label="비밀번호" helperText="8자 이상 입력하세요" />);

    const input = screen.getByLabelText("비밀번호");
    const helper = screen.getByText("8자 이상 입력하세요");

    expect(input).toHaveAttribute("aria-describedby", helper.id);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("error가 있으면 메시지를 보여주고 aria-invalid를 켠다", () => {
    render(<Input label="이메일" error="올바른 이메일 형식이 아닙니다" />);

    const input = screen.getByLabelText("이메일");
    const errorText = screen.getByText("올바른 이메일 형식이 아닙니다");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", errorText.id);
  });

  it("error와 helperText가 모두 있으면 error를 우선 표시한다", () => {
    render(
      <Input label="이메일" error="형식 오류" helperText="이메일을 입력하세요" />,
    );

    expect(screen.getByText("형식 오류")).toBeInTheDocument();
    expect(screen.queryByText("이메일을 입력하세요")).not.toBeInTheDocument();
  });

  it("네이티브 input 속성(type, placeholder)을 그대로 전달한다", () => {
    render(<Input label="비밀번호" type="password" placeholder="••••••••" />);

    const input = screen.getByLabelText("비밀번호");

    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "••••••••");
  });

  it("leftIcon과 rightIcon을 렌더한다", () => {
    render(
      <Input
        label="검색"
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      />,
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("클릭 가능한 rightIcon(버튼)의 onClick이 동작한다", async () => {
    const onClick = jest.fn();
    render(
      <Input
        label="비밀번호"
        type="password"
        rightIcon={
          <button type="button" aria-label="비밀번호 표시" onClick={onClick} />
        }
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "비밀번호 표시" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("label 클릭 시(focus-within) 아이콘이 있어도 input에 포커스가 간다", async () => {
    render(<Input label="검색" leftIcon={<span data-testid="left-icon" />} />);

    await userEvent.click(screen.getByText("검색"));

    expect(screen.getByLabelText("검색")).toHaveFocus();
  });
});
